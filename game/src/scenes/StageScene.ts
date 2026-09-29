/**
 * Staged story scenes: the place, the people in it, and a camera filming them.
 *
 * A `@scene` opens a stage: the painted backdrop far away, trees or furniture in the middle distance, a
 * floor, the cast standing on it, dust or petals in the air and soft dark shapes right in front of the
 * lens. Each layer sits at its own depth, so every camera move or zoom shows parallax: the "3D" shot.
 *
 * By default the camera frames whoever is speaking and the others turn to them; `@shot` takes over for a
 * beat (a close-up, a slow push, an orbit, slow motion) until `@shot auto`. The figures are the same
 * rim-lit rigs as in the world, drawn large. The Dialogue scene draws the text box on top.
 */
import Phaser from 'phaser';
import { audio } from '../core/AudioSynth';
import { assets } from '../core/Assets';
import { ensureTextures, spec } from '../core/Loader';
import { tr, type Loc } from '../core/Localization';
import { session } from '../core/Session';
import { settings } from '../core/Settings';
import { EARTH_SCENES } from '../data/earthScenes';
import { rigFor, SPEAKERS } from '../data/speakers';
import { addText, H, W } from '../ui/theme';
import { CharacterRig, type RigState } from '../world/CharacterRig';
import { earthOverrideSpec, ensureEarthTextures } from '../world/EarthPainter';
import { earthProp, PROP_VISUALS } from '../world/EarthProps';
import type { PropVisual } from '../world/RoomDef';
import { hexRgb, makeCanvas, mixRgb, rgbCss, rgbInt, scaleRgb, type RGB } from '../world/Paint';

/** Screen y of the stage floor with the camera at rest (just above the dialogue box). */
const FLOOR = 492;
/** Figure scale on stage (the world draws them at 1). */
const FIG = 3.05;
const BAR = 44;
/** Props are painted a little under figure scale (the room props are generous next to the figures). */
const PROP_K = 1.8;
/** Seat heights, as a fraction of each prop's height, for figures sitting on them. */
const SEATS: Partial<Record<PropVisual, number>> = { chair: 0.42, bed: 0.52, bench: 0.5, bed_sleeper: 0.5 };

type LayerId = 'far' | 'back' | 'mid' | 'floor' | 'cast' | 'fx' | 'front';
/** Depth of each layer: how strongly it follows the camera (1 = the cast). */
const DEPTH: Record<LayerId, number> = { far: 0.12, back: 0.3, mid: 0.62, floor: 1, cast: 1, fx: 1.15, front: 1.65 };

interface Actor {
  id: string;
  rig: CharacterRig;
  x: number;
  y: number;
  /** Where it is walking to, if anywhere. */
  tx: number | null;
  exitAfter: boolean;
  /** The pose it holds when not speaking. */
  pose: RigState;
  back: boolean;
  light: Phaser.GameObjects.Image;
  shadow: Phaser.GameObjects.Ellipse;
  speaking: boolean;
  /** Seat height (px above the floor) when sitting on a prop. */
  seat: number;
}

interface CamState { x: number; y: number; zoom: number; rot: number }

export interface CastEntry { id: string; x?: number; face?: 1 | -1; back?: boolean; pose?: RigState }

/** "krishnaa@0.7<^:sit" → a cast entry. */
export function parseCast(s: string): CastEntry | null {
  const m = /^([a-z_0-9]+)(?:@([\d.]+))?([<>])?(\^)?(?::([a-z]+))?$/.exec(s);
  if (!m) return null;
  return { id: m[1]!, x: m[2] !== undefined ? Number(m[2]) : undefined, face: m[3] === '<' ? -1 : m[3] === '>' ? 1 : undefined, back: !!m[4], pose: m[5] as RigState | undefined };
}

const stageX = (f: number) => (f - 0.5) * 1300;

export class StageScene extends Phaser.Scene {
  isOpen = false;
  private slug = '';
  private layers = {} as Record<LayerId, Phaser.GameObjects.Container>;
  private actors = new Map<string, Actor>();
  private cam: CamState = { x: 0, y: 0, zoom: 1, rot: 0 };
  private move: { from: CamState; to: CamState; t: number; dur: number; ease: (v: number) => number } | null = null;
  private manual = false;
  private speed = 1;
  private clock = 0;
  private bars!: Phaser.GameObjects.Graphics;
  private captionText!: Phaser.GameObjects.Text;
  private slowGrade: Phaser.Filters.ColorMatrix | null = null;
  private memoryGrade: Phaser.Filters.ColorMatrix | null = null;
  private lastSpeaker: string | null = null;
  private emitters: Phaser.GameObjects.Particles.ParticleEmitter[] = [];
  private seats: { x: number; h: number; back: boolean }[] = [];

  constructor() { super({ key: 'Stage' }); }

  create() {
    this.isOpen = false;
    this.actors = new Map();
    this.bars = this.add.graphics().setDepth(100).setScrollFactor(0);
    this.captionText = addText(this, 28, BAR / 2, '', { size: 16, color: '#d8e2f0', letterSpacing: 3 }).setOrigin(0, 0.5).setDepth(101).setAlpha(0);
    this.cameras.main.setBackgroundColor(0x000000);
    this.scene.setVisible(false);
  }

  // ------------------------------------------------------------------ open / close
  /** Opens (or changes) the stage to a place. The cast comes from `cast` or later `@cast`/`@enter`. */
  async open(slug: string, cast: CastEntry[] = []) {
    if (slug.startsWith('gen:')) {
      await ensureTextures(this, [earthOverrideSpec(slug)].filter((x): x is NonNullable<typeof x> => !!x));
      ensureEarthTextures(this, slug);
    } else {
      const s = [spec('bg', slug), spec('far', slug)].filter((x): x is NonNullable<typeof x> => !!x);
      await ensureTextures(this, s);
    }
    this.teardown();
    this.slug = slug;
    this.isOpen = true;
    this.scene.setVisible(true);
    this.scene.setVisible(false, 'Hud');
    const cam = this.cameras.main;
    cam.resetFX();
    // Opening over a world that has faded to black: start black too, so the script's fade-in is smooth.
    const world = this.scene.get('World') as Phaser.Scene | null;
    const wfade = world?.cameras?.main?.fadeEffect;
    if (wfade && wfade.isRunning === false && wfade.progress >= 1 && wfade.direction === true) cam.fadeOut(0, 0, 0, 0);
    for (const id of Object.keys(DEPTH) as LayerId[]) this.layers[id] = this.add.container(0, 0).setDepth(Object.keys(DEPTH).indexOf(id));
    this.buildSet();
    this.manual = false;
    this.speed = 1;
    this.lastSpeaker = null;
    this.cast(cast);
    const c = this.groupCentre();
    this.cam = { x: c, y: -10, zoom: 1.0, rot: 0 };
    // Establishing move: a slow drift in from slightly wide.
    this.goTo({ x: c, y: 0, zoom: 1.04, rot: 0 }, 2600);
    this.cam = { x: c - 60, y: 10, zoom: 0.97, rot: 0 };
    this.drawBars();
  }

  close() {
    if (!this.isOpen) return;
    this.teardown();
    this.isOpen = false;
    this.scene.setVisible(false);
    this.scene.setVisible(true, 'Hud');
  }

  private teardown() {
    for (const a of this.actors.values()) { a.rig.g.destroy(); a.rig.glow.destroy(); a.light.destroy(); a.shadow.destroy(); }
    this.actors.clear();
    for (const l of Object.values(this.layers)) l?.destroy();
    this.layers = {} as Record<LayerId, Phaser.GameObjects.Container>;
    this.emitters = [];
    this.seats = [];
    this.setSlow(false);
    this.setMemory(false);
    this.cameras.main.setRotation(0);
    this.captionText.setAlpha(0);
    this.move = null;
  }

  // ------------------------------------------------------------------ the set
  private buildSet() {
    const id = this.slug.startsWith('gen:') ? this.slug.slice(4) : this.slug;
    const earth = EARTH_SCENES[id];
    const indoor = earth?.kind === 'indoor';
    const pal = assets.palette(this.slug.startsWith('gen:') ? this.slug : this.slug);
    const calm = settings.get('reducedMotion');

    // Far and back: the painted place, oversized so the camera can move.
    const cover = (key: string, layer: LayerId, k: number, alpha = 1) => {
      if (!this.textures.exists(key)) return;
      const img = this.add.image(0, H / 2 - FLOOR - 20, key).setAlpha(alpha);
      img.setScale(Math.max((W * k) / img.width, (H * k) / img.height));
      this.layers[layer].add(img);
    };
    cover(`far:${this.slug}`, 'far', 1.5);
    cover(`bg:${this.slug}`, 'back', 1.45);

    // Middle distance: trees and shrubs outdoors, a soft wall shadow indoors.
    const mid = this.add.graphics();
    this.layers.mid.add(mid);
    const leaf: RGB = hexRgb(earth?.leaf ?? pal.shadow), bloom = earth?.bloom ? hexRgb(earth.bloom) : null;
    const rnd = new Phaser.Math.RandomDataGenerator([this.slug]);
    if (!indoor) {
      for (const side of [-1, 1]) {
        for (let k = 0; k < 2; k++) {
          const tx = side * (560 + k * 260 + rnd.between(-40, 40)), base = -6 - k * 8, h = rnd.between(260, 360);
          mid.fillStyle(rgbInt(scaleRgb(leaf, 0.35)), 1).fillRect(tx - 7, base - h * 0.55, 14, h * 0.55);
          for (let b = 0; b < 16; b++) {
            const a = rnd.realInRange(0, Math.PI * 2), r = rnd.realInRange(0, 1);
            const bx = tx + Math.cos(a) * r * 120, by = base - h * 0.62 + Math.sin(a) * r * 70;
            mid.fillStyle(rgbInt(scaleRgb(leaf, rnd.realInRange(0.45, 0.8))), 0.95).fillCircle(bx, by, rnd.between(34, 60));
          }
          if (bloom) for (let b = 0; b < 40; b++) {
            const a = rnd.realInRange(0, Math.PI * 2), r = rnd.realInRange(0, 1);
            mid.fillStyle(rgbInt(bloom), rnd.realInRange(0.5, 0.95)).fillCircle(tx + Math.cos(a) * r * 130, base - h * 0.62 + Math.sin(a) * r * 80, rnd.between(4, 9));
          }
        }
      }
      for (let b = 0; b < 26; b++) mid.fillStyle(rgbInt(scaleRgb(leaf, rnd.realInRange(0.3, 0.55))), 1).fillCircle(rnd.between(-1500, 1500), rnd.between(-8, 6), rnd.between(18, 40));
    } else {
      mid.fillStyle(0x000000, 0.18).fillRect(-1600, -520, 3200, 520);
    }

    // The floor: the place's ground colour fading in from the horizon.
    const fkey = `stagefloor:${this.slug}`;
    if (!this.textures.exists(fkey)) {
      const { c, g } = makeCanvas(8, 256);
      const dom = hexRgb(pal.dominant), sh = hexRgb(pal.shadow);
      const gr = g.createLinearGradient(0, 0, 0, 256);
      gr.addColorStop(0, rgbCss(mixRgb(dom, hexRgb(pal.highlight), 0.3), 0.0));
      gr.addColorStop(0.08, rgbCss(mixRgb(dom, hexRgb(pal.highlight), 0.2), 0.55));
      gr.addColorStop(0.5, rgbCss(mixRgb(dom, sh, 0.5), 0.92));
      gr.addColorStop(1, rgbCss(scaleRgb(sh, 0.6), 1));
      g.fillStyle = gr;
      g.fillRect(0, 0, 8, 256);
      this.textures.addCanvas(fkey, c);
    }
    this.layers.floor.add(this.add.image(0, -30, fkey).setOrigin(0.5, 0).setDisplaySize(3600, 420));

    // In the air: petals under blossoming trees, snow in Glacia, rain at night, dust indoors.
    const rainy = /rain/.test(id);
    const snowy = !earth;
    const tex = bloom && !indoor ? 'fx:petal' : snowy ? 'fx:flake' : rainy ? 'fx:streak' : 'fx:dot';
    if (this.textures.exists(tex)) {
      const em = this.add.particles(0, 0, tex, {
        x: { min: -1100, max: 1100 }, y: rainy ? -700 : { min: -650, max: -200 },
        lifespan: rainy ? 900 : 9000, frequency: calm ? 400 : rainy ? 18 : bloom ? 120 : 260,
        speedY: rainy ? { min: 900, max: 1200 } : bloom || snowy ? { min: 30, max: 70 } : { min: -6, max: 6 },
        speedX: rainy ? { min: -120, max: -80 } : bloom ? { min: -40, max: 10 } : { min: -8, max: 8 },
        rotate: bloom ? { min: 0, max: 360 } : 0,
        scale: rainy ? { min: 0.5, max: 0.9 } : bloom ? { min: 0.35, max: 0.7 } : snowy ? { min: 0.2, max: 0.45 } : { min: 0.15, max: 0.35 },
        alpha: rainy ? { start: 0.5, end: 0.2 } : indoor ? { start: 0.35, end: 0 } : { start: 0.9, end: 0.4 },
        tint: bloom && !indoor ? rgbInt(bloom) : 0xffffff,
      });
      this.layers.fx.add(em);
      this.emitters.push(em);
      if (!indoor && !rainy) em.fastForward(6000);
    }

    // Right in front of the lens: dark, soft shapes that slide past fastest.
    const front = this.add.graphics();
    this.layers.front.add(front);
    if (!indoor) {
      front.fillStyle(rgbInt(scaleRgb(leaf, 0.18)), 0.92);
      for (let b = 0; b < 9; b++) front.fillCircle(-760 + rnd.between(-60, 60), -560 + b * 30 + rnd.between(-20, 20), rnd.between(50, 90));
      for (let b = 0; b < 14; b++) front.fillCircle(rnd.between(-1100, 1100), 170 + rnd.between(0, 40), rnd.between(30, 60));
    } else {
      front.fillStyle(0x07080c, 0.92).fillRect(700, -900, 90, 1300);
      front.fillStyle(0x07080c, 0.8).fillRect(-1300, 150, 2600, 200);
    }
    if (!calm) {
      this.layers.front.enableFilters();
      this.layers.front.filters!.internal.addBlur(1, 2, 2, 1.4);
    }
  }

  private drawBars() {
    this.bars.clear();
    if (!this.isOpen) return;
    this.bars.fillStyle(0x000000, 1).fillRect(0, 0, W, BAR).fillRect(0, H - 18, W, 18);
  }

  // ------------------------------------------------------------------ cast
  cast(entries: CastEntry[]) {
    const fresh = entries.filter((e) => !this.actors.has(e.id));
    const n = entries.length;
    const span = Math.min(900, 330 * Math.max(0, n - 1));
    entries.forEach((e, i) => {
      const x = e.x !== undefined ? stageX(e.x) : n <= 1 ? 0 : -span / 2 + (span * i) / (n - 1);
      const a = this.actors.get(e.id) ?? (fresh.includes(e) ? this.addActor(e.id, x) : undefined);
      if (!a) return;
      a.x = x;
      a.back = !!e.back;
      a.y = a.back ? -36 : 0;
      if (e.pose) a.pose = e.pose;
      a.rig.setState(a.pose);
      this.seatFor(a);
      a.rig.facing = e.face ?? (x < -40 ? 1 : x > 40 ? -1 : 1);
    });
    this.layoutDepth();
  }

  private addActor(id: string, x: number): Actor | undefined {
    const rigId = rigFor(id);
    if (!rigId) return undefined;
    const rig = new CharacterRig(this, rigId, 0);
    rig.cuffed = rigId === 'nithish' && !!session.state.flags.nithish_cuffed;
    const color = SPEAKERS[id]?.color ?? 0x9cc9ff;
    const light = this.add.image(x, -150, 'fx:soft').setTint(color).setBlendMode(Phaser.BlendModes.ADD).setAlpha(0).setScale(5);
    const shadow = this.add.ellipse(x, 2, 150, 22, 0x000000, 0.45);
    this.layers.cast.add([light, shadow, rig.g, rig.glow]);
    const a: Actor = { id, rig, x, y: 0, tx: null, exitAfter: false, pose: 'idle', back: false, light, shadow, speaking: false, seat: 0 };
    this.actors.set(id, a);
    return a;
  }

  /** Back-row figures are drawn first. */
  private layoutDepth() {
    const list = [...this.actors.values()].sort((a, b) => Number(b.back) - Number(a.back));
    for (const a of list) this.layers.cast.bringToTop(a.light), this.layers.cast.bringToTop(a.shadow), this.layers.cast.bringToTop(a.rig.g), this.layers.cast.bringToTop(a.rig.glow);
  }

  enter(id: string, from: string, to?: string) {
    const fx = from === 'left' ? -1100 : from === 'right' ? 1100 : stageX(Number(from));
    const a = this.actors.get(id) ?? this.addActor(id, fx);
    if (!a) return;
    a.x = fx;
    a.tx = to !== undefined ? stageX(Number(to)) : 0;
    a.exitAfter = false;
    a.rig.facing = a.tx > a.x ? 1 : -1;
    this.layoutDepth();
  }

  exit(id: string, dir = 'right') {
    const a = this.actors.get(id);
    if (!a) return;
    a.tx = dir === 'left' ? -1200 : 1200;
    a.exitAfter = true;
    a.rig.facing = a.tx > a.x ? 1 : -1;
  }

  pose(id: string, p: string) {
    const a = this.actors.get(id);
    if (!a) return;
    a.pose = p as RigState;
    a.rig.setState(a.pose);
    this.seatFor(a);
  }

  face(id: string, dir: string) {
    const a = this.actors.get(id);
    if (!a) return;
    const o = this.actors.get(dir);
    a.rig.facing = dir === 'left' ? -1 : dir === 'right' ? 1 : o ? (o.x >= a.x ? 1 : -1) : a.rig.facing;
  }

  has(id: string) { return this.actors.has(id); }

  /** Furniture, drawn behind the cast at stage scale: "desk@0.4", "bed@0.8^", "chair@0.3<". */
  props(entries: string[]) {
    for (const e of entries) {
      const m = /^([a-z_]+)(?:@([\d.]+))?([<>])?(\^)?$/.exec(e);
      if (!m || !(PROP_VISUALS as string[]).includes(m[1]!)) continue;
      const back = !!m[4];
      const v = m[1] as PropVisual;
      const x = stageX(m[2] !== undefined ? Number(m[2]) : 0.5);
      const img = this.add.image(x, back ? -36 : 4, earthProp(this, v, PROP_K))
        .setOrigin(0.5, 1).setFlipX(m[3] === '<').setScale(back ? 0.84 : 1).setTint(back ? 0xb8b8c0 : 0xffffff);
      this.layers.cast.addAt(img, 0);
      if (SEATS[v]) this.seats.push({ x, h: img.displayHeight * SEATS[v]!, back });
    }
    for (const a of this.actors.values()) this.seatFor(a);
  }

  /** A sitting figure sits on the nearest chair, bed or bench (its hips are 64 px up in the sit pose). */
  private seatFor(a: Actor) {
    a.seat = 0;
    if (a.pose !== 'sit') return;
    const s = this.seats.filter((q) => Math.abs(q.x - a.x) < 130).sort((p, q) => Math.abs(p.x - a.x) - Math.abs(q.x - a.x))[0];
    if (s) a.seat = Math.max(0, s.h - 64);
  }

  // ------------------------------------------------------------------ speaking
  /** Someone speaks: they gesture and face whoever spoke before; the rest turn to them; the camera frames them. */
  speak(id: string, mood?: string) {
    const a = this.actors.get(id);
    const free = (p: RigState) => p === 'idle' || p === 'talk' || p === 'cross' || p === 'think' || p === 'point';
    for (const o of this.actors.values()) {
      o.speaking = o === a;
      if (o !== a) {
        if (free(o.pose)) o.rig.setState(o.pose);
        if (a && o.tx === null && free(o.pose)) o.rig.facing = a.x >= o.x ? 1 : -1;
      }
    }
    if (a) {
      const prev = this.lastSpeaker ? this.actors.get(this.lastSpeaker) : undefined;
      if (prev && prev !== a && a.tx === null && free(a.pose)) a.rig.facing = prev.x >= a.x ? 1 : -1;
      if (free(a.pose)) {
        const m = mood ?? '';
        a.rig.setState(m === 'thinking' ? 'think' : /angry|shouting|mocking/.test(m) ? 'point' : /scared|shocked|panicked|nervous/.test(m) ? 'cross' : 'talk');
      }
      if (/shouting|shocked|angry/.test(mood ?? '') && settings.get('screenShake') && !settings.get('reducedMotion')) this.cameras.main.shake(180, 0.004);
      this.lastSpeaker = id;
    }
    if (this.manual) return;
    if (!a) {
      this.goTo({ x: this.groupCentre(), y: 0, zoom: 1.02, rot: 0 }, 1800);
      return;
    }
    const m = mood ?? '';
    const zoom = /shouting|shocked|angry|scared/.test(m) ? 1.28 : m === 'thinking' ? 1.2 : 1.14;
    const x = Phaser.Math.Linear(this.groupCentre(), a.x, this.actors.size > 1 ? 0.6 : 1);
    this.goTo({ x, y: this.frameY(a, 250, zoom), zoom, rot: 0 }, /shouting|shocked/.test(m) ? 450 : 1300);
  }

  // ------------------------------------------------------------------ camera
  private groupCentre() {
    const xs = [...this.actors.values()].filter((a) => a.tx === null || !a.exitAfter).map((a) => a.tx ?? a.x);
    return xs.length ? (Math.min(...xs) + Math.max(...xs)) / 2 : 0;
  }

  /** Camera y that puts a point `lift` px above an actor's feet at screen y `screen`. */
  private frameY(a: Actor, screen: number, zoom: number, lift = 170) {
    const p = a.y - lift;
    return p - (screen - FLOOR) / zoom;
  }

  private goTo(to: CamState, dur: number, ease: (v: number) => number = Phaser.Math.Easing.Sine.InOut) {
    if (settings.get('reducedMotion')) dur = Math.min(dur, 200);
    this.move = { from: { ...this.cam }, to, t: 0, dur: Math.max(1, dur), ease };
  }

  /** `@shot`: takes the camera until `@shot auto`. */
  shot(kind: string, a?: string, b?: string) {
    const A = a ? this.actors.get(a) : undefined, B = b ? this.actors.get(b) : undefined;
    const c = this.cam;
    const cam = this.cameras.main;
    const calm = settings.get('reducedMotion');
    this.manual = kind !== 'auto';
    switch (kind) {
      case 'auto':
        this.goTo({ x: this.groupCentre(), y: 0, zoom: 1.04, rot: 0 }, 1400);
        return;
      case 'wide':
        this.goTo({ x: this.groupCentre(), y: 20, zoom: 0.96, rot: 0 }, 1400);
        return;
      case 'on':
        if (A) this.goTo({ x: A.x, y: this.frameY(A, 270, 1.45), zoom: 1.45, rot: 0 }, 1100);
        return;
      case 'close':
        if (A) this.goTo({ x: A.x + A.rig.facing * 20, y: this.frameY(A, 250, 1.9, 250), zoom: 1.9, rot: 0 }, 900, Phaser.Math.Easing.Cubic.Out);
        return;
      case 'two':
        if (A && B) {
          const zoom = Phaser.Math.Clamp((W * 0.62) / (Math.abs(A.x - B.x) + 260), 1, 1.6);
          this.goTo({ x: (A.x + B.x) / 2, y: this.frameY(A, 270, zoom), zoom, rot: 0 }, 1100);
        }
        return;
      case 'push':
        this.goTo({ x: A?.x ?? c.x, y: A ? this.frameY(A, 260, c.zoom + 0.35) : c.y - 30, zoom: c.zoom + 0.35, rot: c.rot }, 5200, Phaser.Math.Easing.Quadratic.Out);
        return;
      case 'pull':
        this.goTo({ x: this.groupCentre(), y: 30, zoom: 0.92, rot: 0 }, 3600);
        return;
      case 'pan': {
        const d = a === 'left' ? -1 : 1;
        this.cam = { ...c, x: this.groupCentre() - d * 380, zoom: Math.max(1.08, c.zoom) };
        this.goTo({ ...this.cam, x: this.groupCentre() + d * 380 }, 6500, Phaser.Math.Easing.Linear);
        return;
      }
      case 'orbit': {
        // A sideways dolly around the subject: the layers slide at their own depths, so it reads as 3D.
        const x = A?.x ?? this.groupCentre();
        const zoom = 1.35;
        this.cam = { x: x - 320, y: A ? this.frameY(A, 280, zoom) : -40, zoom, rot: 0.02 };
        this.goTo({ x: x + 320, y: this.cam.y, zoom: zoom + 0.1, rot: -0.02 }, 7000, Phaser.Math.Easing.Sine.InOut);
        return;
      }
      case 'dutch':
        this.goTo({ ...c, rot: 0.07, zoom: c.zoom + 0.05 }, 900);
        return;
      case 'level':
        this.goTo({ ...c, rot: 0 }, 700);
        return;
      case 'shake':
        if (settings.get('screenShake') && !calm) cam.shake(400, 0.012);
        this.manual = false;
        return;
      case 'flash':
        cam.flash(350, 255, 255, 255);
        this.manual = false;
        return;
      case 'slow':
        this.setSlow(true);
        this.manual = false;
        return;
      case 'normal':
        this.setSlow(false);
        this.manual = false;
        return;
      case 'memory':
        this.setMemory(true);
        this.manual = false;
        return;
      case 'present':
        this.setMemory(false);
        this.manual = false;
        return;
    }
  }

  /** A flashback: warm, faded, like an old photograph. Lasts until `@shot present` or the next place. */
  setMemory(on: boolean) {
    const cam = this.cameras.main;
    if (on && !this.memoryGrade) {
      this.memoryGrade = cam.filters.internal.addColorMatrix();
      this.memoryGrade.colorMatrix.sepia();
      this.memoryGrade.colorMatrix.saturate(-0.25, true);
      this.memoryGrade.colorMatrix.brightness(1.06, true);
      cam.flash(400, 255, 240, 210);
    } else if (!on && this.memoryGrade) {
      cam.filters.internal.remove(this.memoryGrade);
      this.memoryGrade = null;
    }
  }

  /** Slow motion: everything moves at a quarter speed, colour drains, a heartbeat. */
  setSlow(on: boolean) {
    const cam = this.cameras.main;
    if (on && !this.slowGrade) {
      this.speed = 0.25;
      this.slowGrade = cam.filters.internal.addColorMatrix();
      this.slowGrade.colorMatrix.saturate(-0.55);
      this.slowGrade.colorMatrix.brightness(1.08, true);
      for (const e of this.emitters) e.timeScale = 0.25;
      audio.sfx('heartbeat');
    } else if (!on && this.slowGrade) {
      this.speed = 1;
      cam.filters.internal.remove(this.slowGrade);
      this.slowGrade = null;
      for (const e of this.emitters) e.timeScale = 1;
    }
  }

  caption(text: Loc) {
    this.captionText.setText(tr(text).toUpperCase());
    this.tweens.killTweensOf(this.captionText);
    this.captionText.setAlpha(0);
    this.tweens.add({ targets: this.captionText, alpha: 1, duration: 700, hold: 4200, yoyo: true });
  }

  // ------------------------------------------------------------------ frame
  override update(_t: number, delta: number) {
    if (!this.isOpen) return;
    const dt = Math.min(0.05, delta / 1000);
    const sdt = dt * this.speed;
    this.clock += sdt;
    if (this.move) {
      const m = this.move;
      m.t += delta;
      const k = m.ease(Math.min(1, m.t / m.dur));
      this.cam = {
        x: Phaser.Math.Linear(m.from.x, m.to.x, k), y: Phaser.Math.Linear(m.from.y, m.to.y, k),
        zoom: Phaser.Math.Linear(m.from.zoom, m.to.zoom, k), rot: Phaser.Math.Linear(m.from.rot, m.to.rot, k),
      };
      if (m.t >= m.dur) this.move = null;
    }
    // A hand-held breath, so a held shot never looks frozen.
    const calm = settings.get('reducedMotion');
    const bx = calm ? 0 : Math.sin(this.clock * 0.7) * 6, by = calm ? 0 : Math.sin(this.clock * 0.9 + 1) * 3;
    const c = this.cam;
    for (const [id, layer] of Object.entries(this.layers) as [LayerId, Phaser.GameObjects.Container][]) {
      const f = DEPTH[id];
      const zl = 1 + (c.zoom - 1) * f;
      layer.setScale(zl);
      layer.x = W / 2 - (c.x + bx) * f * zl;
      layer.y = FLOOR - (c.y + by) * f * zl;
    }
    this.cameras.main.setRotation(c.rot);

    for (const a of [...this.actors.values()]) {
      if (a.tx !== null) {
        const d = a.tx - a.x;
        const step = 300 * sdt;
        if (Math.abs(d) <= step) {
          a.x = a.tx;
          a.tx = null;
          a.rig.speed = 0;
          a.rig.setState(a.pose);
          if (a.exitAfter) { a.rig.g.destroy(); a.rig.glow.destroy(); a.light.destroy(); a.shadow.destroy(); this.actors.delete(a.id); continue; }
        } else {
          a.x += Math.sign(d) * step;
          a.rig.speed = 300 * Math.sign(d);
          a.rig.setState('run');
        }
      }
      const s = FIG * (a.back ? 0.84 : 1);
      a.rig.scale = s;
      a.rig.alpha = a.back ? 0.82 : 1;
      a.rig.update(sdt, a.x, a.y - a.seat);
      a.shadow.setPosition(a.x, a.y + 2).setScale(a.back ? 0.8 : 1).setVisible(a.seat === 0);
      a.light.setPosition(a.x, a.y - 150 * (a.back ? 0.84 : 1));
      a.light.setAlpha(Phaser.Math.Linear(a.light.alpha, a.speaking ? 0.22 : 0, 0.08));
    }
  }
}
