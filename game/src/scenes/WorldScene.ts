/**
 * Real-time exploration: one room at a time. Owns the player, room entities, story triggers, and
 * hands off to the Battle scene and the story Director.
 */
import Phaser from 'phaser';
import { audio } from '../core/AudioSynth';
import { bus } from '../core/EventBus';
import { addItem, memberStats, rest } from '../core/GameState';
import { input } from '../core/Input';
import { ensureTextures, spec } from '../core/Loader';
import { loc, tr } from '../core/Localization';
import { session } from '../core/Session';
import { settings } from '../core/Settings';
import { AREAS, ROOMS } from '../data/rooms';
import { ENEMIES } from '../data/enemies';
import { ITEMS } from '../data/items';
import { Director, type StoryStage } from '../story/Director';
import { addText, C } from '../ui/theme';
import { CharacterRig, type RigState } from '../world/CharacterRig';
import { Player } from '../world/Player';
import { crystal, chest as chestTex, rosoarTree } from '../world/Props';
import { Puppet } from '../world/Puppet';
import { TILE, type EntityDef, type PlacedEntity, type RoomDef } from '../world/RoomDef';
import { buildRoom, type RoomPhysics } from '../world/RoomView';
import { DEPTH } from '../world/Scenery';
import type { HudScene } from './HudScene';
import type { MemberId } from '../data/characters';

export interface WorldData { room?: string; entry?: string }

type Initiative = 'party' | 'enemy' | null;
type Outcome = 'won' | 'lost' | 'fled';

interface Live {
  placed: PlacedEntity;
  def: EntityDef;
  objs: Phaser.GameObjects.GameObject[];
  /** Interactables: prompt text and action. */
  prompt?: () => string | null;
  interact?: () => void;
  update?: (dt: number) => void;
  destroy?: () => void;
  gone?: boolean;
}

interface WorldEnemy {
  live: Live;
  puppet: Puppet;
  home: number;
  dir: number;
  stun: number;
}

const SAMPLE_LAG = 0.2;

export class WorldScene extends Phaser.Scene {
  room!: RoomDef;
  player!: Player;
  private phys!: RoomPhysics;
  private live: Live[] = [];
  private enemies: WorldEnemy[] = [];
  private director!: Director;
  private busy = false;
  private leaving = false;
  private promptText!: Phaser.GameObjects.Text;
  private promptTarget: Live | null = null;
  private playerLight!: Phaser.GameObjects.Light;
  private followers: { id: MemberId; rig: CharacterRig }[] = [];
  private trail: { t: number; x: number; y: number; state: RigState; facing: number }[] = [];
  private clock = 0;
  private hintCooldown = 0;
  private lookX = 0;
  private lostInStory = false;
  /** False while a room is loading; the previous room's objects are gone by then. */
  private ready = false;
  private storyRunning = false;

  constructor() { super({ key: 'World' }); }

  create(data: WorldData) {
    this.ready = false;
    this.live = [];
    this.enemies = [];
    this.followers = [];
    this.trail = [];
    this.busy = false;
    this.leaving = false;
    const st = session.state;
    const roomId = data.room ?? st.location.room;
    this.room = ROOMS[roomId] ?? ROOMS.frozen_shore!;
    st.location.room = this.room.id;
    this.cameras.main.setBackgroundColor(0x05070d);
    this.cameras.main.fadeIn(settings.get('reducedMotion') ? 100 : 500, 0, 0, 0);
    void this.setup(data);
  }

  private async setup(data: WorldData) {
    const r = this.room;
    const enemySlugs = r.entities.flatMap((e) => (e.def.type === 'enemy' ? [ENEMIES[e.def.enemy]?.sprite.slug ?? 'vale'] : []));
    await ensureTextures(this, [spec('bg', r.backdrop), spec('far', r.backdrop), ...enemySlugs.map((s) => spec('cut', s))]);
    if (!this.scene.isActive()) return;
    this.phys = buildRoom(this, r);

    // Player position: named entry, checkpoint tree, saved coordinates, or the start marker.
    const st = session.state;
    const find = (pred: (p: PlacedEntity) => boolean) => r.entities.find(pred);
    let pos = find((p) => p.def.type === 'spawn' && p.def.id === (data.entry ?? 'start')) ?? find((p) => p.def.type === 'spawn');
    if (!data.entry && st.location.checkpoint) pos = find((p) => p.def.type === 'tree' && p.def.id === st.location.checkpoint) ?? pos;
    let x = pos?.x ?? 200, y = pos?.y ?? 400;
    if (!data.entry && !st.location.checkpoint && (st.location.x || st.location.y)) { x = st.location.x; y = st.location.y; }

    this.player = new Player(this, x, y, st.party[0] ?? 'ragul');
    this.syncAbilities();
    this.player.onAttack = (hb) => this.playerAttack(hb);
    this.physics.add.collider(this.player.body, this.phys.solids);
    this.physics.add.collider(this.player.body, this.phys.platforms, undefined, (_p, plat) => {
      const b = this.player.arcade;
      const top = (plat as Phaser.GameObjects.Zone).body as Phaser.Physics.Arcade.StaticBody;
      return b.velocity.y >= 0 && b.bottom <= top.top + 10 && this.player.dropThrough <= 0;
    });
    this.playerLight = this.lights.addLight(x, y - 40, 340, 0xdfeaff, 0.9);

    for (const p of r.entities) this.spawnEntity(p);
    this.buildFollowers();

    const cam = this.cameras.main;
    cam.startFollow(this.player.body, true, 0.1, 0.12);
    cam.setDeadzone(80, 60);
    cam.setFollowOffset(0, 70);

    this.promptText = addText(this, 0, 0, '', { size: 18, color: C.text, backgroundColor: '#0b1220cc', padding: { x: 10, y: 5 } })
      .setOrigin(0.5, 1).setDepth(DEPTH.weather + 1).setVisible(false);

    if (!this.scene.isActive('Hud')) this.scene.launch('Hud');
    if (!this.scene.isActive('Dialogue')) this.scene.launch('Dialogue');
    this.scene.bringToTop('Hud');
    this.scene.bringToTop('Dialogue');
    bus.emit('hud', undefined);
    const stage: StoryStage = {
      scene: this,
      fx: (n) => this.fx(n),
      runBattle: (id) => this.runBattle(id),
      partyChanged: () => this.partyChanged(),
    };
    this.director = new Director(stage);
    audio.music(r.music);

    const firstVisit = !st.visitedRooms.includes(r.id);
    if (firstVisit) st.visitedRooms.push(r.id);
    const banner = () => { if (firstVisit) (this.scene.get('Hud') as HudScene).banner(r.name, tr(AREAS[r.area]?.name ?? loc(''))); };
    this.ready = true;
    if (!st.flags.slice_intro_done && r.id === 'frozen_shore') {
      this.time.delayedCall(400, () => void this.story('slice/glacia_slice', 'intro').then(banner));
    } else this.time.delayedCall(700, banner);
  }

  // ------------------------------------------------------------------ entities
  private spawnEntity(p: PlacedEntity) {
    const st = session.state;
    const d = p.def;
    const L: Live = { placed: p, def: d, objs: [] };
    const glow = (x: number, y: number, color: number, scale: number, alpha = 0.6) => {
      const g = this.add.image(x, y, 'fx:soft').setTint(color).setScale(scale).setAlpha(alpha).setBlendMode(Phaser.BlendModes.ADD).setDepth(DEPTH.props + 1);
      L.objs.push(g);
      return g;
    };
    switch (d.type) {
      case 'tree': {
        const img = this.add.image(p.x, p.y + 8, rosoarTree(this)).setOrigin(0.5, 1).setScale(0.62).setDepth(DEPTH.props).setLighting(true);
        L.objs.push(img);
        const g = glow(p.x, p.y - 190, 0xff4a55, 3.2, 0.28);
        if (!settings.get('reducedMotion')) this.tweens.add({ targets: g, alpha: 0.4, duration: 1800, yoyo: true, repeat: -1, ease: 'Sine.InOut' });
        this.lights.addLight(p.x, p.y - 180, 380, 0xff6a70, 1.1);
        L.prompt = () => 'Rest';
        L.interact = () => void this.restAt(d.id);
        break;
      }
      case 'crystal': {
        const img = this.add.image(p.x, p.y + 4, crystal(this, d.color)).setOrigin(0.5, 1).setScale(0.55).setDepth(DEPTH.props);
        L.objs.push(img);
        const g = glow(p.x, p.y - 30, d.color, 1.4, 0.5);
        if (!settings.get('reducedMotion')) this.tweens.add({ targets: g, alpha: 0.25, duration: 1400 + Math.random() * 800, yoyo: true, repeat: -1 });
        this.lights.addLight(p.x, p.y - 40, 260, d.color, 1.3);
        break;
      }
      case 'pickup': {
        if (st.collected.includes(d.id)) return;
        let obj: Phaser.GameObjects.Image;
        let color = 0xbfe6ff;
        if (d.visual === 'shard') obj = this.add.image(p.x, p.y - 22, 'gen:shard').setScale(0.7);
        else if (d.visual === 'feather') obj = this.add.image(p.x, p.y - 30, 'icon:gen:feather').setScale(0.22);
        else if (d.visual === 'fragment') { obj = this.add.image(p.x, p.y - 32, 'icon:gen:fragment').setScale(0.3).setBlendMode(Phaser.BlendModes.ADD); color = 0x9fc8ff; }
        else {
          const icon = d.item ? ITEMS[d.item]?.icon ?? '' : '';
          obj = this.add.image(p.x, p.y - 24, `icon:${icon}`).setDisplaySize(40, 40);
          color = 0xffb0a0;
        }
        obj.setDepth(DEPTH.entities);
        L.objs.push(obj);
        const g = glow(obj.x, obj.y, color, d.visual === 'shard' ? 0.5 : 1, 0.55);
        const baseY = obj.y;
        const phase = Math.random() * 6;
        L.update = () => {
          const b = Math.sin(this.clock * 2.6 + phase) * 5;
          obj.y = baseY + b;
          g.y = baseY + b;
          if (Math.abs(this.player.x - p.x) < 34 && this.player.y > baseY - 30 && this.player.y - 70 < baseY + 20) this.collect(L, d);
        };
        break;
      }
      case 'chest': {
        const open = st.collected.includes(d.id);
        const img = this.add.image(p.x, p.y + 4, chestTex(this, open)).setOrigin(0.5, 1).setScale(0.8).setDepth(DEPTH.props).setLighting(true);
        L.objs.push(img);
        if (!open) {
          L.prompt = () => (st.collected.includes(d.id) ? null : 'Open');
          L.interact = () => {
            st.collected.push(d.id);
            img.setTexture(chestTex(this, true));
            addItem(st, d.item);
            const it = ITEMS[d.item];
            audio.sfx('pickup');
            if (it) bus.emit('toast', { text: tr(it.name), icon: it.icon });
            this.burst(p.x, p.y - 30, 0xbfe6ff, 16);
            bus.emit('hud', undefined);
          };
        }
        break;
      }
      case 'npc': {
        if (d.hideIf && st.flags[d.hideIf]) return;
        const rig = new CharacterRig(this, d.speaker as MemberId, DEPTH.entities);
        rig.setState('idle');
        L.update = (dt) => {
          rig.facing = this.player.x < p.x ? -1 : 1;
          rig.update(dt, p.x, p.y);
          if (L.gone || this.busy) return;
          if (d.hideIf && st.flags[d.hideIf]) return;
          if (d.requires && !st.flags[d.requires]) return;
          if (Math.abs(this.player.x - p.x) < d.radius && Math.abs(this.player.y - p.y) < 160) {
            void this.story(d.script, d.label).then(() => {
              if (d.hideIf && st.flags[d.hideIf]) {
                L.gone = true;
                this.tweens.add({ targets: [rig.g, rig.glow], alpha: 0, duration: 500, onComplete: () => rig.destroy() });
                this.buildFollowers();
              }
            });
          }
        };
        L.destroy = () => rig.destroy();
        break;
      }
      case 'trigger': {
        const top = p.y - d.height * TILE;
        L.update = () => {
          if (this.busy) return;
          if (d.unless && st.flags[d.unless]) return;
          if (d.requires && !st.flags[d.requires]) return;
          if (Math.abs(this.player.x - p.x) < TILE && this.player.y > top && this.player.y <= p.y + 4) void this.story(d.script, d.label);
        };
        break;
      }
      case 'exit': {
        const top = p.y - d.height * TILE;
        L.update = () => {
          if (this.busy || this.leaving) return;
          const nearEdge = p.tx <= 0 ? this.player.x < p.x + TILE * 0.6 : this.player.x > p.x - TILE * 0.6;
          if (nearEdge && this.player.y > top && this.player.y <= p.y + TILE) this.leave(d.to, d.entry);
        };
        break;
      }
      case 'gate': {
        L.update = (dt) => {
          this.hintCooldown -= dt;
          if (st.abilities.includes(d.ability) || this.busy || this.hintCooldown > 0) return;
          if (Math.abs(this.player.x - p.x) < TILE * 2 && Math.abs(this.player.y - p.y) < TILE * 2) {
            this.hintCooldown = 8;
            this.floatText(p.x, p.y - 120, tr(d.hint), C.textDim);
          }
        };
        break;
      }
      case 'enemy': {
        if (st.defeated.includes(d.id) || st.defeatedForever.includes(d.id)) return;
        const def = ENEMIES[d.enemy];
        if (!def) return;
        const pup = new Puppet(this, def.sprite.slug, p.x, p.y + 6, {
          height: def.sprite.height * 0.68, sway: 10, ripple: 3, breathe: 0.02, speed: 1.2, eyes: def.sprite.eyes,
          depth: DEPTH.entities, blend: def.sprite.blend,
        });
        L.objs.push(pup.mesh, ...pup.eyes);
        const e: WorldEnemy = { live: L, puppet: pup, home: p.x, dir: 1, stun: 0 };
        this.enemies.push(e);
        L.update = (dt) => this.updateEnemy(e, dt);
        L.destroy = () => pup.destroy();
        break;
      }
      case 'spawn':
        return;
    }
    this.live.push(L);
  }

  private collect(L: Live, d: Extract<EntityDef, { type: 'pickup' }>) {
    if (L.gone) return;
    L.gone = true;
    const st = session.state;
    st.collected.push(d.id);
    const obj = L.objs[0] as Phaser.GameObjects.Image;
    this.burst(obj.x, obj.y, d.visual === 'shard' ? 0x9fe0ff : 0xffffff, d.visual === 'shard' ? 8 : 18);
    this.tweens.add({ targets: L.objs, alpha: 0, scale: '*=1.6', duration: 260, onComplete: () => L.objs.forEach((o) => o.destroy()) });
    if (d.shards) {
      st.riShards += d.shards;
      audio.sfx('shard', 0.9 + Math.random() * 0.2);
    }
    if (d.item) {
      addItem(st, d.item);
      const it = ITEMS[d.item];
      audio.sfx('pickup');
      if (it) bus.emit('toast', { text: tr(it.name), icon: it.icon });
    }
    bus.emit('hud', undefined);
    if (d.script && d.label) void this.story(d.script, d.label);
  }

  private updateEnemy(e: WorldEnemy, dt: number) {
    const L = e.live;
    if (L.gone) return;
    const p = L.placed;
    const def = L.def as Extract<EntityDef, { type: 'enemy' }>;
    const pup = e.puppet;
    e.stun = Math.max(0, e.stun - dt);
    const range = def.patrol * TILE;
    const dx = this.player.x - pup.x;
    const seen = !this.busy && e.stun <= 0 && Math.abs(dx) < 360 && Math.abs(this.player.y - p.y) < 180;
    let vx = 0;
    if (e.stun <= 0 && !this.busy) {
      if (seen) vx = Math.sign(dx) * 125;
      else {
        vx = e.dir * 55;
        if (pup.x > e.home + range) e.dir = -1;
        if (pup.x < e.home - range) e.dir = 1;
      }
    }
    const nx = Phaser.Math.Clamp(pup.x + vx * dt, e.home - range - TILE * 3, e.home + range + TILE * 3);
    pup.setPosition(nx, pup.y);
    pup.lean = Phaser.Math.Linear(pup.lean, vx / 900, 0.1);
    if (vx) pup.flip = vx < 0; // the art faces right
    pup.setAlpha(e.stun > 0 ? 0.5 + Math.sin(this.clock * 20) * 0.2 : 1);
    pup.update(dt);
    // Touching the player starts a battle with the Vale striking first.
    if (e.stun <= 0 && !this.busy && Math.abs(dx) < 42 && this.player.y > p.y - pup.height * 0.9 && this.player.y < p.y + 20 && this.player.invuln <= 0) {
      void this.fight(e, 'enemy');
    }
  }

  private playerAttack(hb: Phaser.Geom.Rectangle) {
    if (this.busy) return;
    for (const e of this.enemies) {
      if (e.live.gone || e.stun > 0) continue;
      const r = new Phaser.Geom.Rectangle(e.puppet.x - 34, e.puppet.y - e.puppet.height * 0.85, 68, e.puppet.height * 0.85);
      if (Phaser.Geom.Intersects.RectangleToRectangle(hb, r)) {
        e.puppet.hit(0.3);
        audio.sfx('hit');
        void this.fight(e, 'party');
        return;
      }
    }
  }

  private async fight(e: WorldEnemy, initiative: Initiative) {
    if (this.busy) return;
    const def = e.live.def as Extract<EntityDef, { type: 'enemy' }>;
    this.busy = true;
    this.player.locked = true;
    const result = await this.runBattle(def.battle, initiative);
    const st = session.state;
    if (result === 'won') {
      e.live.gone = true;
      st.defeated.push(def.id);
      e.puppet.destroy();
    } else if (result === 'fled') {
      e.stun = 3;
      this.player.invuln = 2;
      this.player.arcade.setVelocity((this.player.x < e.puppet.x ? -1 : 1) * 380, -380);
    }
    this.player.locked = false;
    this.busy = false;
    if (result === 'lost') await this.defeat();
  }

  // ------------------------------------------------------------------ story
  private async story(script: string, label: string) {
    if (this.busy) return;
    this.busy = true;
    this.player.locked = true;
    input.consume();
    this.storyRunning = true;
    try {
      await this.director.run(script, label);
    } catch (err) {
      console.error(err);
    }
    this.storyRunning = false;
    if (!this.sys.isActive() && !this.sys.isPaused()) return;
    this.player.locked = false;
    this.busy = false;
    this.syncAbilities();
    bus.emit('hud', undefined);
    if (this.lostInStory) {
      this.lostInStory = false;
      await this.defeat();
    }
  }

  /** StoryStage: launches the Battle scene over this one and resolves with the outcome. */
  runBattle(id: string, initiative: Initiative = null): Promise<Outcome> {
    return new Promise((resolve) => {
      audio.sfx('dread');
      const cam = this.cameras.main;
      if (settings.get('screenShake')) cam.shake(250, 0.006);
      cam.flash(250, 200, 230, 255);
      this.time.delayedCall(260, () => {
        this.scene.pause();
        this.scene.setVisible(false, 'Hud');
        this.scene.launch('Battle', {
          battle: id, initiative, backdrop: this.room.backdrop, palette: this.room.palette, grade: this.room.grade,
          onDone: (r: Outcome) => {
            this.scene.stop('Battle');
            this.scene.resume();
            this.scene.setVisible(true, 'Hud');
            audio.music(this.room.music);
            bus.emit('hud', undefined);
            if (r === 'lost' && this.storyRunning) { this.lostInStory = true; this.director.cancel(); }
            resolve(r);
          },
        });
        this.scene.bringToTop('Battle');
        this.scene.bringToTop('Dialogue');
      });
    });
  }

  partyChanged() {
    this.buildFollowers();
    bus.emit('hud', undefined);
  }

  async fx(name: string): Promise<void> {
    const cam = this.cameras.main;
    const calm = settings.get('reducedMotion');
    const shake = settings.get('screenShake') && !calm;
    const wait = (ms: number) => new Promise<void>((r) => this.time.delayedCall(ms, () => r()));
    switch (name) {
      case 'shake': if (shake) cam.shake(350, 0.012); return wait(350);
      case 'flash': cam.flash(300, 255, 255, 255); return wait(300);
      case 'red_flash': cam.flash(600, 255, 40, 50); audio.sfx('meld'); return wait(600);
      case 'slap':
        audio.sfx('slap');
        cam.flash(120, 255, 255, 255);
        if (shake) cam.shake(160, 0.01);
        return wait(250);
      case 'tick': {
        audio.sfx('tick');
        const cm = cam.filters.internal.addColorMatrix();
        cm.colorMatrix.desaturate();
        await wait(220);
        cam.filters.internal.remove(cm);
        return;
      }
      case 'migraine': {
        audio.sfx('dread');
        cam.flash(900, 120, 20, 40);
        if (calm) return wait(600);
        const barrel = cam.filters.internal.addBarrel(1);
        await new Promise<void>((r) => this.tweens.addCounter({
          from: 0, to: 1, duration: 1400, onUpdate: (tw) => { barrel.amount = 1 + Math.sin(tw.getValue()! * Math.PI * 3) * 0.12 * (1 - tw.getValue()!); },
          onComplete: () => r(),
        }));
        cam.filters.internal.remove(barrel);
        return;
      }
      case 'fade_out':
        cam.fadeOut(calm ? 150 : 600, 0, 0, 0);
        return wait(calm ? 150 : 600);
      case 'fade_in':
        cam.fadeIn(calm ? 150 : 600, 0, 0, 0);
        return wait(calm ? 150 : 600);
      default:
        return;
    }
  }

  // ------------------------------------------------------------------ resting, defeat, rooms
  private async restAt(treeId: string) {
    const st = session.state;
    this.busy = true;
    this.player.locked = true;
    this.player.rig.setState('interact');
    audio.sfx('save');
    audio.music('rest');
    rest(st, treeId, this.room.id);
    const meta = session.save(this.room.id);
    this.burst(this.player.x, this.player.y - 40, 0xff7080, 22);
    bus.emit('toast', { text: meta ? 'Rested. The party is healed and the game is saved.' : 'Rested. (Saving is unavailable in this browser.)' });
    bus.emit('hud', undefined);
    // Enemies return when you rest.
    for (const L of this.live.filter((l) => l.def.type === 'enemy')) { L.destroy?.(); L.gone = true; }
    this.enemies = [];
    this.live = this.live.filter((l) => l.def.type !== 'enemy');
    for (const p of this.room.entities.filter((e) => e.def.type === 'enemy')) this.spawnEntity(p);
    const intro = `tree_seen`;
    this.busy = false;
    if (!st.collected.includes(intro)) {
      st.collected.push(intro);
      await this.story('slice/glacia_slice', 'tree');
    } else {
      await new Promise((r) => this.time.delayedCall(900, r));
      this.player.locked = false;
    }
    audio.music(this.room.music);
  }

  private async defeat() {
    this.busy = true;
    this.player.locked = true;
    const cam = this.cameras.main;
    cam.fadeOut(900, 20, 0, 0);
    await new Promise((r) => this.time.delayedCall(950, r));
    const hud = this.scene.get('Hud') as HudScene;
    hud.toast('Everything goes dark... You wake at the last Rosoar tree.');
    if (!session.loadSlot(session.slot)) {
      // No save yet: heal the party and start the room again.
      const st = session.state;
      for (const id of st.party) { const m = st.members[id]; if (m) m.hp = memberStats(st, id).maxHp; }
      st.location = { room: this.room.id, x: 0, y: 0, checkpoint: null };
    }
    this.scene.restart({});
  }

  private leave(to: string, entry: string) {
    if (!ROOMS[to]) return;
    this.leaving = true;
    this.player.locked = true;
    const st = session.state;
    st.location = { room: to, x: 0, y: 0, checkpoint: null };
    this.cameras.main.fadeOut(settings.get('reducedMotion') ? 100 : 350, 0, 0, 0);
    this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => this.scene.restart({ room: to, entry }));
  }

  // ------------------------------------------------------------------ party
  syncAbilities() {
    if (this.player) this.player.abilities = new Set(session.state.abilities);
  }

  private buildFollowers() {
    this.followers.forEach((f) => f.rig.destroy());
    this.followers = [];
    if (!this.player) return;
    const party = session.state.party;
    party.slice(1).forEach((id) => this.followers.push({ id, rig: new CharacterRig(this, id, DEPTH.player - 1 - this.followers.length) }));
  }

  private updateFollowers(dt: number) {
    const lead = this.player;
    this.trail.push({ t: this.clock, x: lead.x, y: lead.y, state: lead.rig.state, facing: lead.facing });
    while (this.trail.length > 2 && this.trail[0]!.t < this.clock - SAMPLE_LAG * (this.followers.length + 1) - 0.1) this.trail.shift();
    this.followers.forEach((f, i) => {
      const t = this.clock - SAMPLE_LAG * (i + 1);
      const s = this.trail.find((p) => p.t >= t) ?? this.trail[0]!;
      const idle = s.state === 'attack' || s.state === 'interact' || s.state === 'hurt' ? 'idle' : s.state;
      f.rig.setState(idle);
      f.rig.facing = s.facing;
      f.rig.speed = (lead.arcade.velocity.x);
      f.rig.alpha = 0.92;
      f.rig.update(dt, s.x - s.facing * 46 * (i + 1), s.y);
    });
  }

  // ------------------------------------------------------------------ fx helpers
  burst(x: number, y: number, color: number, n: number) {
    const e = this.add.particles(x, y, 'fx:soft', {
      speed: { min: 60, max: 220 }, lifespan: 700, scale: { start: 0.18, end: 0 }, alpha: { start: 1, end: 0 },
      tint: color, blendMode: Phaser.BlendModes.ADD, emitting: false,
    }).setDepth(DEPTH.fx);
    e.explode(n);
    this.time.delayedCall(900, () => e.destroy());
  }

  floatText(x: number, y: number, text: string, color: string) {
    const t = addText(this, x, y, text, { size: 20, color, fontStyle: 'italic', align: 'center', wordWrap: { width: 420 } })
      .setOrigin(0.5).setDepth(DEPTH.weather + 1).setAlpha(0);
    this.tweens.add({ targets: t, alpha: 1, y: y - 20, duration: 600, hold: 2200, yoyo: true, onComplete: () => t.destroy() });
  }

  // ------------------------------------------------------------------ frame
  override update(_time: number, deltaMs: number) {
    if (!this.ready) return;
    const dt = Math.min(0.05, deltaMs / 1000);
    this.clock += dt;
    session.tickPlaytime();
    const st = session.state;

    this.player.update(dt);
    this.updateFollowers(dt);
    this.playerLight.setPosition(this.player.x, this.player.y - 60);
    for (const L of this.live) L.update?.(dt);

    // Camera look-ahead in the facing direction.
    this.lookX = Phaser.Math.Linear(this.lookX, -this.player.facing * 110, 0.03);
    this.cameras.main.setFollowOffset(this.lookX, 70);

    // Spikes and falling out of the room.
    const b = this.player.arcade;
    const hitSpike = this.phys.spikes.some((r) => b.right > r.x + 6 && b.left < r.x + r.w - 6 && b.bottom > r.y + r.h - 26 && b.top < r.y + r.h);
    if ((hitSpike || this.player.y > this.room.rows * TILE + 60) && !this.leaving) this.hazard();

    // Interaction prompt.
    this.promptTarget = null;
    if (!this.busy) {
      let best = 90;
      for (const L of this.live) {
        if (!L.interact || L.gone) continue;
        const d = Math.abs(L.placed.x - this.player.x);
        if (d < best && Math.abs(L.placed.y - this.player.y) < 90 && L.prompt?.()) { best = d; this.promptTarget = L; }
      }
    }
    const pt = this.promptTarget;
    if (pt) {
      this.promptText.setText(`${input.label('interact')}  ${pt.prompt!()}`).setPosition(pt.placed.x, pt.placed.y - 150).setVisible(true);
      if (input.pressed('interact') && this.player.onGround) { input.consume('interact', 'up'); pt.interact!(); }
    } else this.promptText.setVisible(false);

    if (!this.busy && input.pressed('menu')) {
      input.consume('menu', 'cancel');
      st.location.x = this.player.x;
      st.location.y = this.player.y;
      audio.sfx('ui_ok');
      this.scene.pause();
      this.scene.setVisible(false, 'Hud');
      this.scene.launch('Menu', { onClose: () => { this.scene.resume(); this.scene.setVisible(true, 'Hud'); this.syncAbilities(); bus.emit('hud', undefined); } });
      this.scene.bringToTop('Menu');
    }
  }

  private hazardT = 0;

  private hazard() {
    if (this.clock - this.hazardT < 0.8) return;
    this.hazardT = this.clock;
    const st = session.state;
    const lead = st.party[0];
    const m = lead ? st.members[lead] : undefined;
    if (m && lead) m.hp = Math.max(1, m.hp - Math.ceil(memberStats(st, lead).maxHp * 0.1));
    this.player.hurt(this.player.x + this.player.facing * 10);
    if (settings.get('screenShake')) this.cameras.main.shake(180, 0.008);
    bus.emit('hud', undefined);
    this.player.locked = true;
    this.cameras.main.fadeOut(220, 0, 0, 0);
    this.time.delayedCall(260, () => {
      this.player.teleport(this.player.safe.x, this.player.safe.y);
      this.cameras.main.fadeIn(260, 0, 0, 0);
      if (!this.busy) this.player.locked = false;
    });
  }
}

