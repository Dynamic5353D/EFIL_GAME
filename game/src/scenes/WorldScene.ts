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
import { showTip, tipSeen } from '../core/Tips';
import { settings } from '../core/Settings';
import { BASE_ABILITIES } from '../data/abilities';
import { AREAS, ROOMS } from '../data/rooms';
import { BATTLES, ENEMIES } from '../data/enemies';
import { ITEMS } from '../data/items';
import { Director, type StoryStage } from '../story/Director';
import { addText, C } from '../ui/theme';
import { CharacterRig, type RigState } from '../world/CharacterRig';
import { earthProp, propSize } from '../world/EarthProps';
import { earthOverrideSpec } from '../world/EarthPainter';
import { ensureGenSprites } from '../world/GenSprites';
import { Player } from '../world/Player';
import { crystal, chest as chestTex, rosoarTree } from '../world/Props';
import { Puppet } from '../world/Puppet';
import { roomFor, TILE, type EntityDef, type PlacedEntity, type RoomDef } from '../world/RoomDef';
import { buildRoom, type RoomPhysics } from '../world/RoomView';
import { DEPTH } from '../world/Scenery';
import type { HudScene } from './HudScene';
import type { MemberId } from '../data/characters';

export interface WorldData {
  room?: string;
  entry?: string;
  /** Story to run once the room has loaded (a script's `@room` carrying on). */
  story?: { script: string; label: string };
  /** Run the state's saved resume point (loading a game, starting a chapter). */
  resume?: boolean;
}

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

interface Guard {
  live: Live;
  rig: CharacterRig;
  cone: Phaser.GameObjects.Graphics;
  mark: Phaser.GameObjects.Text;
  home: number;
  x: number;
  dir: number;
  wait: number;
  alert: number;
}

interface Chaser {
  live: Live;
  rig: CharacterRig;
  /** Distance travelled along the recorded path. */
  s: number;
  wait: number;
  active: boolean;
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
  /** Seconds the player has had control (tips wait for a moment of calm). */
  private controlT = 0;
  /** False while a room is loading; the previous room's objects are gone by then. */
  private ready = false;
  private storyRunning = false;
  private guards: Guard[] = [];
  private chasers: Chaser[] = [];
  /** The player's path while a chase is on: positions with cumulative distance. */
  private path: { x: number; y: number; d: number; state: RigState; facing: number }[] = [];
  /** Where stealth and chases restart: the last section marker passed. */
  private section = { x: 0, y: 0 };
  private hidden: Live | null = null;
  private crates: Phaser.Physics.Arcade.Image[] = [];
  private caught = false;
  private swaying = false;

  constructor() { super({ key: 'World' }); }

  create(data: WorldData) {
    this.ready = false;
    this.live = [];
    this.enemies = [];
    this.guards = [];
    this.chasers = [];
    this.path = [];
    this.crates = [];
    this.hidden = null;
    this.caught = false;
    this.followers = [];
    this.trail = [];
    this.busy = false;
    this.leaving = false;
    const st = session.state;
    const roomId = data.room ?? st.location.room;
    this.room = roomFor(ROOMS[roomId] ?? ROOMS.frozen_shore!, st.flags);
    st.location.room = this.room.id;
    this.cameras.main.setBackgroundColor(0x05070d);
    this.cameras.main.fadeIn(settings.get('reducedMotion') ? 100 : 500, 0, 0, 0);
    void this.setup(data);
  }

  private async setup(data: WorldData) {
    const r = this.room;
    const enemySlugs = r.entities.flatMap((e) => (e.def.type === 'enemy' ? [ENEMIES[e.def.enemy]?.sprite.slug ?? 'vale'] : []));
    await ensureTextures(this, [spec('bg', r.backdrop), spec('far', r.backdrop), earthOverrideSpec(r.backdrop), ...enemySlugs.map((s) => spec('cut', s))]);
    if (!this.scene.isActive()) return;
    ensureGenSprites(this, enemySlugs);
    this.phys = buildRoom(this, r);

    // Player position: named entry, checkpoint tree, saved coordinates, or the start marker.
    const st = session.state;
    const find = (pred: (p: PlacedEntity) => boolean) => r.entities.find(pred);
    let pos = find((p) => p.def.type === 'spawn' && p.def.id === (data.entry ?? 'start')) ?? find((p) => p.def.type === 'spawn');
    if (!data.entry && st.location.checkpoint) pos = find((p) => (p.def.type === 'tree' || p.def.type === 'rest') && p.def.id === st.location.checkpoint) ?? pos;
    let x = pos?.x ?? 200, y = pos?.y ?? 400;
    if (!data.entry && !st.location.checkpoint && (st.location.x || st.location.y)) { x = st.location.x; y = st.location.y; }

    this.player = new Player(this, x, y, st.party[0] ?? 'ragul');
    this.section = { x, y };
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
    this.updateCrates();
    this.buildFollowers();
    this.applyCuffs();

    const cam = this.cameras.main;
    cam.startFollow(this.player.body, true, 0.1, 0.12);
    cam.setDeadzone(80, 60);
    cam.setFollowOffset(0, 70);

    this.promptText = addText(this, 0, 0, '', { size: 18, color: C.text, backgroundColor: '#0b1220cc', padding: { x: 10, y: 5 } })
      .setOrigin(0.5, 1).setDepth(DEPTH.weather + 1).setVisible(false);

    if (!this.scene.isActive('Hud')) this.scene.launch('Hud');
    (this.scene.get('Hud') as HudScene).clearExitMarks();
    if (!this.scene.isActive('Dialogue')) this.scene.launch('Dialogue');
    this.scene.bringToTop('Hud');
    this.scene.bringToTop('Dialogue');
    bus.emit('hud', undefined);
    const stage: StoryStage = {
      scene: this,
      fx: (n) => this.fx(n),
      runBattle: (id) => this.runBattle(id),
      runWordBattle: (id) => this.runWordBattle(id),
      partyChanged: () => this.partyChanged(),
      gotoRoom: (room, entry, then) => {
        const target = ROOMS[room];
        if (target && target.id === this.room.id && (roomFor(target, session.state.flags).cacheKey ?? target.id) === (this.room.cacheKey ?? this.room.id)) {
          this.warp(entry);
          return true;
        }
        this.leave(room, entry, then ?? undefined);
        return false;
      },
      warp: (entry) => this.warp(entry),
      save: () => this.autosave(),
      credits: () => this.rollCredits(),
    };
    this.director = new Director(stage);
    audio.music(r.music);
    audio.ambience(r.weather.includes('rain') ? 'rain' : r.weather.includes('embers') ? 'fire' : 'none');

    const firstVisit = !st.visitedRooms.includes(r.id);
    if (firstVisit) st.visitedRooms.push(r.id);
    const banner = () => { if (firstVisit) (this.scene.get('Hud') as HudScene).banner(r.name, tr(AREAS[r.area]?.name ?? loc(''))); };
    this.ready = true;
    const next = data.story ?? (data.resume && st.resume ? st.resume : null);
    if (next) {
      // Hold everything until the story starts, so no trigger or key press can pre-empt it.
      this.busy = true;
      this.player.locked = true;
      this.time.delayedCall(350, () => { this.busy = false; void this.story(next.script, next.label).then(banner); });
    } else if (!st.flags.slice_intro_done && r.id === 'frozen_shore') {
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
            if (d.script && d.label) void this.story(d.script, d.label);
          };
        }
        break;
      }
      case 'npc': {
        const rig = new CharacterRig(this, d.rig ?? d.speaker, DEPTH.entities);
        rig.setState(d.pose ?? 'idle');
        rig.cuffed = !!d.cuffed;
        const shown = () => (!d.requires || !!st.flags[d.requires]) && !(d.hideIf && st.flags[d.hideIf]);
        let vis = shown() ? 1 : 0;
        const spent = () => !!(d.once && st.flags[d.once]);
        const talk = async () => {
          if (!d.script || !d.label) return;
          await this.story(d.script, d.label);
          if (d.once) st.flags[d.once] = true;
        };
        if (d.talk) {
          L.prompt = () => (shown() && !spent() && d.script ? 'Talk' : null);
          L.interact = () => void talk();
        }
        let nx = p.x;
        L.update = (dt) => {
          vis = Phaser.Math.Linear(vis, shown() ? 1 : 0, Math.min(1, dt * 4));
          rig.alpha = vis;
          rig.g.setVisible(vis > 0.02);
          rig.glow.setVisible(vis > 0.02);
          let moving = 0;
          if (d.walkTo !== undefined && d.walkFlag && st.flags[d.walkFlag]) {
            const tx = d.walkTo * TILE + TILE / 2;
            const step = (d.walkSpeed ?? 120) * dt;
            if (Math.abs(tx - nx) > step) { moving = Math.sign(tx - nx); nx += moving * step; } else nx = tx;
          }
          if (vis > 0.02) {
            rig.facing = moving || (d.face ?? (this.player.x < nx ? -1 : 1));
            rig.speed = moving * (d.walkSpeed ?? 120);
            rig.setState(moving ? 'run' : d.pose ?? 'idle');
            rig.update(dt, nx, p.y);
          }
          if (d.talk || L.gone || this.busy || !shown() || spent() || !d.script) return;
          if (Math.abs(this.player.x - nx) < d.radius && Math.abs(this.player.y - p.y) < 160) void talk();
        };
        L.destroy = () => rig.destroy();
        break;
      }
      case 'rest': {
        const img = this.add.image(p.x, p.y + 2, earthProp(this, d.visual)).setOrigin(0.5, 1).setDepth(DEPTH.props).setLighting(true);
        L.objs.push(img);
        const g = glow(p.x, p.y - 40, 0xffd9a0, 2.2, 0.22);
        if (!settings.get('reducedMotion')) this.tweens.add({ targets: g, alpha: 0.34, duration: 2000, yoyo: true, repeat: -1, ease: 'Sine.InOut' });
        this.lights.addLight(p.x, p.y - 80, 260, 0xffd9a0, 0.9);
        L.prompt = () => 'Rest';
        L.interact = () => void this.restAt(d.id, false);
        break;
      }
      case 'prop': {
        const img = this.add.image(p.x, p.y + 2, earthProp(this, d.visual)).setOrigin(0.5, 1).setScale(d.scale ?? 1)
          .setFlipX(!!d.flip).setDepth(d.front ? DEPTH.player + 2 : DEPTH.props).setLighting(true);
        L.objs.push(img);
        if (d.visual === 'lamp') this.lights.addLight(p.x, p.y - 260 * (d.scale ?? 1), 320, 0xffe2a8, 1.1);
        if (d.visual === 'tv') this.lights.addLight(p.x, p.y - 90, 240, 0x9ab8ff, 0.9);
        if (!d.requires && !d.hideIf) return;
        L.update = () => img.setVisible((!d.requires || !!st.flags[d.requires]) && !(d.hideIf && st.flags[d.hideIf]));
        break;
      }
      case 'sign': {
        const post = this.add.rectangle(p.x, p.y, 6, 110, 0x2a2c32).setOrigin(0.5, 1).setDepth(DEPTH.props);
        const t = addText(this, p.x, p.y - 118, tr(d.text), { size: 17, bold: true, color: '#ffffff', backgroundColor: '#1f6a3a', padding: { x: 10, y: 5 } })
          .setOrigin(0.5, 1).setDepth(DEPTH.props);
        L.objs.push(post, t);
        return;
      }
      case 'hide': {
        const img = this.add.image(p.x, p.y + 2, earthProp(this, d.visual)).setOrigin(0.5, 1).setDepth(DEPTH.player + 2).setLighting(true);
        if (d.w) img.setScale(d.w * TILE / propSize(d.visual).w);
        L.objs.push(img);
        L.prompt = () => (this.hidden ? null : `${input.label('down')} Hide`);
        L.update = () => {
          const near = Math.abs(this.player.x - p.x) < img.displayWidth / 2 && Math.abs(this.player.y - p.y) < 30;
          if (!this.hidden && near && !this.busy && this.player.onGround && input.pressed('down')) this.hide(L);
          img.setAlpha(this.hidden === L ? 0.82 : 1);
        };
        break;
      }
      case 'guard': {
        const rig = new CharacterRig(this, d.rig, DEPTH.entities);
        const cone = this.add.graphics().setDepth(DEPTH.entities - 1).setBlendMode(Phaser.BlendModes.ADD);
        const mark = addText(this, p.x, p.y - 150, '!', { size: 40, bold: true, color: '#ff5a5a' }).setOrigin(0.5).setDepth(DEPTH.fx).setVisible(false);
        const gd: Guard = { live: L, rig, cone, mark, home: p.x, x: p.x, dir: d.facing ?? 1, wait: 0, alert: 0 };
        this.guards.push(gd);
        L.update = (dt) => this.updateGuard(gd, dt);
        L.destroy = () => { rig.destroy(); cone.destroy(); mark.destroy(); };
        break;
      }
      case 'chaser': {
        const rig = new CharacterRig(this, d.rig, DEPTH.entities + 1);
        const ch: Chaser = { live: L, rig, s: 0, wait: d.delay ?? 1, active: false };
        this.chasers.push(ch);
        L.update = (dt) => this.updateChaser(ch, dt);
        L.destroy = () => rig.destroy();
        break;
      }
      case 'crate': {
        const w = d.w * TILE, h = d.h * TILE;
        const img = this.physics.add.image(p.x, p.y - h / 2, earthProp(this, 'crate')).setDisplaySize(w, h).setDepth(DEPTH.props + 1).setLighting(true);
        const b = img.body as Phaser.Physics.Arcade.Body;
        b.setSize(img.width, img.height);
        b.setDragX(2400);
        b.setMaxVelocityX(140);
        this.physics.add.collider(img, this.phys.solids);
        this.physics.add.collider(this.player.body, img);
        this.crates.push(img);
        L.objs.push(img);
        return;
      }
      case 'use': {
        const shown = () => (!d.requires || !!st.flags[d.requires]) && !(d.unless && st.flags[d.unless]);
        const mark = glow(p.x, p.y - 30, 0xffe6a0, 0.9, 0.5);
        if (!settings.get('reducedMotion')) this.tweens.add({ targets: mark, alpha: 0.2, duration: 900, yoyo: true, repeat: -1 });
        L.prompt = () => (shown() ? tr(d.prompt) : null);
        L.interact = () => {
          const missing = d.items.filter((it) => !st.inventory[it]);
          if (missing.length) {
            audio.sfx('ui_back');
            this.floatText(p.x, p.y - 120, `You need: ${missing.map((m) => tr(ITEMS[m]?.name ?? loc(m))).join(', ')}`, C.textDim);
            return;
          }
          void this.story(d.script, d.label);
        };
        L.update = () => mark.setVisible(shown());
        break;
      }
      case 'section':
        L.update = () => {
          if (Math.abs(this.player.x - p.x) < TILE && Math.abs(this.player.y - p.y) < TILE * 3 && this.player.onGround) this.section = { x: p.x, y: p.y };
        };
        break;
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
        // A double chevron pointing out of the room, and the next place's name when you come close.
        // Both are drawn by the HUD (see HudScene.exitMark); only the soft halo is in the world.
        const out = p.tx <= 0 ? -1 : 1;
        const ax = p.x - out * TILE * 1.3, ay = p.y - TILE * 1.3;
        const halo = glow(ax, ay, 0xbfe4ff, 1.8, 0.35);
        const label = ROOMS[d.to] ? tr(ROOMS[d.to]!.name) : '';
        const markId = `${this.room.id}:${d.id}:${p.tx}`;
        const calm = settings.get('reducedMotion');
        let nameA = 0;
        L.update = () => {
          const hud = this.scene.get('Hud') as HudScene;
          const cam = this.cameras.main;
          const near = Math.abs(this.player.x - ax) < TILE * 9 && Math.abs(this.player.y - p.y) < TILE * 6;
          const wave = calm ? 0 : Math.sin(this.clock * 3);
          nameA = Phaser.Math.Linear(nameA, near && !this.leaving ? 1 : 0, 0.12);
          halo.setAlpha(near ? 0.5 : 0.28);
          hud.exitMark(markId, label, out, (ax - cam.worldView.x) * cam.zoom + wave * 4 * out, (ay - cam.worldView.y) * cam.zoom,
            this.leaving ? 0 : (near ? 0.95 : 0.6) + wave * 0.12, nameA);
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
            showTip('gate');
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
      case 'tip': {
        L.update = () => {
          if (!this.busy && Math.abs(this.player.x - p.x) < d.radius * TILE && Math.abs(this.player.y - p.y) < d.radius * TILE) showTip(d.tip);
        };
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
      showTip('shards');
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
    showTip('language');
    try {
      await this.director.run(script, label);
    } catch (err) {
      console.error(err);
    }
    this.storyRunning = false;
    if (!this.sys.isActive() && !this.sys.isPaused()) return;
    if (this.leaving) return;
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
            if (r === 'lost' && BATTLES[id]?.retry) {
              // Story fights that must be won (the daydream) start over at full health.
              const st = session.state;
              for (const m of st.party) { const ms = st.members[m]; if (ms) ms.hp = memberStats(st, m).maxHp; }
              bus.emit('toast', { text: 'Try again.' });
              void this.runBattle(id, initiative).then(resolve);
              return;
            }
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
    const lead = session.state.party[0];
    if (this.player && lead) {
      this.player.setMember(lead);
      this.trail = [];
    }
    this.applyCuffs();
    this.updateCrates();
    this.buildFollowers();
    bus.emit('hud', undefined);
  }

  /** Word battles run in their own scene over this one; resolves true when won (a loss is retried there). */
  runWordBattle(id: string): Promise<boolean> {
    return new Promise((resolve) => {
      this.scene.pause();
      this.scene.setVisible(false, 'Hud');
      this.scene.launch('WordBattle', {
        battle: id, backdrop: this.room.backdrop,
        onDone: (won: boolean) => {
          this.scene.stop('WordBattle');
          this.scene.resume();
          this.scene.setVisible(true, 'Hud');
          audio.music(this.room.music);
          bus.emit('hud', undefined);
          resolve(won);
        },
      });
      this.scene.bringToTop('WordBattle');
      this.scene.bringToTop('Dialogue');
    });
  }

  warp(entry: string) {
    const p = this.room.entities.find((e) => e.def.type === 'spawn' && e.def.id === entry);
    if (!p || !this.player) return;
    this.player.teleport(p.x, p.y);
    this.section = { x: p.x, y: p.y };
    this.trail = [];
    this.cameras.main.centerOn(p.x, p.y - 70);
  }

  /** The end of an act: credits over a dark screen, then the title. */
  rollCredits() {
    this.leaving = true;
    this.player.locked = true;
    audio.music('title');
    this.scene.setVisible(false, 'Hud');
    this.scene.launch('Credits', {
      onClose: () => {
        this.scene.stop('Hud');
        this.scene.stop('Dialogue');
        this.scene.start('Title');
      },
    });
    this.scene.bringToTop('Credits');
  }

  /** `@save`: saves where the player stands; the resume point was set by the script. */
  autosave() {
    const st = session.state;
    st.location = { room: this.room.id, x: this.player?.x ?? 0, y: this.player?.y ?? 0, checkpoint: null };
    if (session.save(this.room.id)) bus.emit('toast', { text: 'Saved.' });
  }

  /** Nithish is handcuffed from his arrest until the Snap (flag `nithish_cuffed`). */
  applyCuffs() {
    const on = !!session.state.flags.nithish_cuffed;
    if (this.player) this.player.rig.cuffed = on && session.state.party[0] === 'nithish';
    for (const f of this.followers) f.rig.cuffed = on && f.id === 'nithish';
  }

  /** Nithish can shove crates; for anyone else they are as solid as a wall. */
  private updateCrates() {
    const shove = session.state.party[0] === 'nithish';
    for (const c of this.crates) {
      const b = c.body as Phaser.Physics.Arcade.Body;
      b.setImmovable(!shove);
      b.pushable = shove;
    }
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
      case 'black':
        // Cut to black at once (gore and violence cut away at the moment of impact).
        cam.fadeOut(0, 0, 0, 0);
        return wait(60);
      case 'unblack':
        cam.fadeIn(calm ? 150 : 700, 0, 0, 0);
        return wait(calm ? 150 : 700);
      case 'bang':
        audio.sfx('gun');
        cam.flash(90, 255, 255, 255);
        if (shake) cam.shake(200, 0.014);
        await wait(90);
        cam.fadeOut(0, 0, 0, 0);
        return wait(900);
      case 'snap': {
        // Nithish's snap: a red flash and the world freezes grey for a breath.
        audio.sfx('tick');
        audio.sfx('meld');
        cam.flash(500, 255, 30, 40);
        const cm = cam.filters.internal.addColorMatrix();
        cm.colorMatrix.desaturate();
        if (shake) cam.shake(300, 0.01);
        await wait(900);
        cam.filters.internal.remove(cm);
        return;
      }
      case 'dizzy': {
        audio.sfx('dread');
        if (calm) return wait(400);
        const barrel = cam.filters.internal.addBarrel(1);
        const blur = cam.filters.internal.addBlur(0, 2, 2, 1);
        await new Promise<void>((r) => this.tweens.addCounter({
          from: 0, to: 1, duration: 2200, onUpdate: (tw) => {
            const v = tw.getValue()!;
            barrel.amount = 1 + Math.sin(v * Math.PI * 4) * 0.08 * Math.sin(v * Math.PI);
            blur.strength = Math.sin(v * Math.PI) * 1.4;
          },
          onComplete: () => r(),
        }));
        cam.filters.internal.remove(barrel);
        cam.filters.internal.remove(blur);
        return;
      }
      case 'lightning':
        cam.flash(160, 220, 230, 255);
        this.time.delayedCall(220, () => cam.flash(90, 200, 210, 255));
        this.time.delayedCall(500, () => audio.sfx('thunder'));
        return wait(300);
      case 'fire':
        audio.sfx('fire');
        cam.flash(400, 255, 140, 40);
        if (shake) cam.shake(300, 0.008);
        return wait(400);
      case 'heartbeat':
        audio.sfx('heartbeat');
        return wait(900);
      default:
        return;
    }
  }


  // ------------------------------------------------------------------ stealth and chases
  private hide(L: Live) {
    this.hidden = L;
    this.player.locked = true;
    this.player.arcade.setVelocityX(0);
    this.player.rig.alpha = 0.4;
    audio.sfx('guard');
    showTip('hide');
  }

  private unhide() {
    this.hidden = null;
    if (!this.busy) this.player.locked = false;
  }

  /** Is the player inside this guard's cone, with nothing solid in between? */
  private sees(gd: Guard, range: number): boolean {
    if (this.hidden) return false;
    const eyeX = gd.x, eyeY = gd.live.placed.y - 100;
    const px = this.player.x, py = this.player.y - 40;
    const dx = (px - eyeX) * gd.dir;
    if (dx < 10 || dx > range) return false;
    if (Math.abs(py - eyeY) > 40 + dx * 0.32) return false;
    for (let t = 0.1; t < 1; t += 0.1) {
      const cx = Math.floor((eyeX + (px - eyeX) * t) / TILE), cy = Math.floor((eyeY + (py - eyeY) * t) / TILE);
      if (this.room.grid[cy]?.[cx] === '#') return false;
    }
    return true;
  }

  private updateGuard(gd: Guard, dt: number) {
    const d = gd.live.def as Extract<EntityDef, { type: 'guard' }>;
    const st = session.state;
    const active = (!d.requires || !!st.flags[d.requires]) && !(d.hideIf && st.flags[d.hideIf]);
    gd.rig.g.setVisible(active);
    gd.rig.glow.setVisible(active);
    gd.cone.setVisible(active);
    if (!active) return;
    const p = gd.live.placed;
    const range = d.range * TILE * (st.flags.disguised ? 0.5 : 1);
    // Patrol: walk to one end, look around for a moment, turn back.
    if (!this.busy && gd.alert <= 0 && d.patrol > 0) {
      if (gd.wait > 0) gd.wait -= dt;
      else {
        gd.x += gd.dir * (d.speed ?? 70) * dt;
        const lim = d.patrol * TILE;
        if ((gd.dir > 0 && gd.x > gd.home + lim) || (gd.dir < 0 && gd.x < gd.home - lim)) { gd.dir *= -1; gd.wait = 1.4; }
      }
    }
    gd.rig.facing = gd.dir;
    gd.rig.speed = gd.wait > 0 || d.patrol <= 0 || gd.alert > 0 ? 0 : gd.dir * (d.speed ?? 70);
    gd.rig.setState(gd.rig.speed ? 'run' : 'idle');
    gd.rig.update(dt, gd.x, p.y);
    // Sight cone.
    const eyeY = p.y - 100;
    const c = gd.cone;
    c.clear();
    const col = gd.alert > 0 ? 0xff4a4a : 0xffe08a;
    c.fillStyle(col, gd.alert > 0 ? 0.22 : 0.1);
    c.fillTriangle(gd.x, eyeY, gd.x + gd.dir * range, eyeY - 40 - range * 0.32, gd.x + gd.dir * range, eyeY + 40 + range * 0.32);
    c.lineStyle(2, col, 0.3);
    c.lineBetween(gd.x, eyeY, gd.x + gd.dir * range, eyeY - 40 - range * 0.32);
    c.lineBetween(gd.x, eyeY, gd.x + gd.dir * range, eyeY + 40 + range * 0.32);
    gd.mark.setPosition(gd.x, p.y - 160);
    if (gd.alert > 0) {
      gd.alert -= dt;
      if (gd.alert <= 0) void this.spotted(gd);
      return;
    }
    if (!this.busy && !this.caught && this.sees(gd, range)) {
      gd.alert = 0.7;
      gd.mark.setVisible(true);
      audio.sfx('dread');
      this.player.locked = true;
      this.player.arcade.setVelocityX(0);
    }
  }

  private async spotted(gd: Guard) {
    const d = gd.live.def as Extract<EntityDef, { type: 'guard' }>;
    gd.mark.setVisible(false);
    if (d.fail && d.script) {
      await this.story(d.script, d.fail);
      this.resetSection();
      return;
    }
    await this.restartSection('You were seen.');
  }

  private updateChaser(ch: Chaser, dt: number) {
    const d = ch.live.def as Extract<EntityDef, { type: 'chaser' }>;
    const st = session.state;
    const p = ch.live.placed;
    const on = (!d.requires || !!st.flags[d.requires]) && !(d.unless && st.flags[d.unless]);
    ch.rig.g.setVisible(on);
    ch.rig.glow.setVisible(on);
    if (!on) { ch.active = false; return; }
    if (!ch.active) {
      ch.active = true;
      ch.s = 0;
      ch.wait = d.delay ?? 1;
      this.path = [{ x: p.x, y: p.y, d: 0, state: 'idle', facing: 1 }];
      showTip('chase');
    }
    if (this.busy) { ch.rig.update(dt, ...this.pathAt(ch.s)); return; }
    if (ch.wait > 0) ch.wait -= dt;
    else ch.s = Math.min(this.path[this.path.length - 1]!.d, ch.s + d.speed * dt);
    const [x, y] = this.pathAt(ch.s);
    const prev = ch.rig.facing;
    const ahead = this.pathAt(ch.s + 4)[0];
    ch.rig.facing = ahead > x + 0.5 ? 1 : ahead < x - 0.5 ? -1 : prev;
    ch.rig.speed = ch.wait > 0 ? 0 : d.speed * ch.rig.facing;
    const seg = this.path.find((q) => q.d >= ch.s);
    ch.rig.setState(ch.wait > 0 ? 'idle' : seg && (seg.state === 'jump' || seg.state === 'fall') ? seg.state : 'run');
    ch.rig.update(dt, x, y);
    const gap = this.path[this.path.length - 1]!.d - ch.s;
    if (!this.caught && ch.wait <= 0 && gap < 34 && Math.abs(this.player.x - x) < 40) void this.restartSection('Caught.');
  }

  /** Position at distance `s` along the recorded chase path. */
  private pathAt(s: number): [number, number] {
    const P = this.path;
    if (!P.length) return [0, 0];
    let i = P.findIndex((q) => q.d >= s);
    if (i < 0) i = P.length - 1;
    if (i === 0) return [P[0]!.x, P[0]!.y];
    const a = P[i - 1]!, b = P[i]!;
    const t = b.d > a.d ? (s - a.d) / (b.d - a.d) : 1;
    return [a.x + (b.x - a.x) * t, a.y + (b.y - a.y) * t];
  }

  private recordPath() {
    if (!this.chasers.some((c) => c.active)) return;
    const last = this.path[this.path.length - 1];
    const x = this.player.x, y = this.player.y;
    if (!last) { this.path.push({ x, y, d: 0, state: 'idle', facing: 1 }); return; }
    const step = Math.hypot(x - last.x, y - last.y);
    if (step < 6) return;
    this.path.push({ x, y, d: last.d + step, state: this.player.rig.state, facing: this.player.facing });
  }

  /** Back to the last section marker, with guards and chasers reset. */
  private async restartSection(msg: string) {
    if (this.caught) return;
    this.caught = true;
    this.player.locked = true;
    audio.sfx('hurt');
    const cam = this.cameras.main;
    cam.flash(200, 255, 80, 80);
    this.floatText(this.player.x, this.player.y - 130, msg, '#ff9a9a');
    await new Promise((r) => this.time.delayedCall(700, r));
    cam.fadeOut(260, 0, 0, 0);
    await new Promise((r) => this.time.delayedCall(300, r));
    this.resetSection();
    cam.fadeIn(300, 0, 0, 0);
  }

  private resetSection() {
    if (this.hidden) this.unhide();
    this.player.teleport(this.section.x, this.section.y);
    this.trail = [];
    for (const gd of this.guards) {
      gd.x = gd.home;
      gd.dir = (gd.live.def as Extract<EntityDef, { type: 'guard' }>).facing ?? 1;
      gd.alert = 0;
      gd.wait = 0.5;
      gd.mark.setVisible(false);
    }
    for (const ch of this.chasers) ch.active = false;
    this.path = [];
    this.caught = false;
    if (!this.busy) this.player.locked = false;
  }

  // ------------------------------------------------------------------ resting, defeat, rooms
  private async restAt(treeId: string, isTree = true) {
    const st = session.state;
    this.busy = true;
    this.player.locked = true;
    this.player.rig.setState('interact');
    audio.sfx('save');
    audio.music('rest');
    rest(st, treeId, this.room.id);
    st.resume = null;
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
    if (isTree && !st.collected.includes(intro)) {
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
    hud.toast(this.room.backdrop.startsWith('gen:') ? 'Everything goes dark...' : 'Everything goes dark... You wake at the last Rosoar tree.');
    if (!session.loadSlot(session.slot)) {
      // No save yet: heal the party and start the room again.
      const st = session.state;
      for (const id of st.party) { const m = st.members[id]; if (m) m.hp = memberStats(st, id).maxHp; }
      st.location = { room: this.room.id, x: 0, y: 0, checkpoint: null };
    }
    this.scene.restart({ resume: true });
  }

  private leave(to: string, entry: string, story?: { script: string; label: string }) {
    if (!ROOMS[to]) { console.error(`no room ${to}`); return; }
    this.leaving = true;
    this.player.locked = true;
    const st = session.state;
    st.location = { room: to, x: 0, y: 0, checkpoint: null };
    this.cameras.main.fadeOut(settings.get('reducedMotion') ? 100 : 350, 0, 0, 0);
    this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => this.scene.restart({ room: to, entry, story }));
  }

  // ------------------------------------------------------------------ party
  syncAbilities() {
    if (this.player) this.player.abilities = new Set([...BASE_ABILITIES, ...session.state.abilities]);
  }

  private buildFollowers() {
    this.followers.forEach((f) => f.rig.destroy());
    this.followers = [];
    if (!this.player) return;
    const party = session.state.party;
    party.slice(1).forEach((id) => this.followers.push({ id, rig: new CharacterRig(this, id, DEPTH.player - 1 - this.followers.length) }));
    this.applyCuffs();
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

    const dizzy = !!st.flags.dizzy;
    this.player.speedMul = dizzy ? 0.55 : 1;
    if (dizzy && !settings.get('reducedMotion')) { this.cameras.main.setRotation(Math.sin(this.clock * 1.3) * 0.035); this.swaying = true; }
    else if (this.swaying) { this.cameras.main.setRotation(0); this.swaying = false; }
    if (this.hidden) {
      this.player.rig.alpha = 0.4;
      if (!this.busy && (input.pressed('jump') || input.pressed('up') || Math.abs(input.axisX) > 0.5)) { input.consume('jump', 'up'); this.unhide(); }
    }
    this.player.update(dt);
    if (this.hidden) this.player.rig.alpha = 0.4;
    this.recordPath();
    this.updateFollowers(dt);
    this.playerLight.setPosition(this.player.x, this.player.y - 60);
    for (const L of this.live) L.update?.(dt);

    // Camera look-ahead in the facing direction.
    this.lookX = Phaser.Math.Linear(this.lookX, -this.player.facing * 110, 0.03);
    this.cameras.main.setFollowOffset(this.lookX, 70);

    // Spikes and falling out of the room.
    const b = this.player.arcade;
    const hitSpike = this.phys.spikes.some((r) => b.right > r.x + 6 && b.left < r.x + r.w - 6 && b.bottom > r.y + r.h - 26 && b.top < r.y + r.h)
      || this.phys.fires.some((r) => b.right > r.x + 8 && b.left < r.x + r.w - 8 && b.bottom > r.y + r.h - 34 && b.top < r.y + r.h);
    if ((hitSpike || this.player.y > this.room.rows * TILE + 60) && !this.leaving) this.hazard();

    // Interaction prompt.
    this.controlT = this.busy || this.leaving ? 0 : this.controlT + dt;
    if (this.controlT > 1.2) this.checkTips();

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
    const hideSpot = !pt && !this.busy && !this.hidden
      ? this.live.find((L) => L.def.type === 'hide' && Math.abs(L.placed.x - this.player.x) < 60 && Math.abs(L.placed.y - this.player.y) < 30)
      : undefined;
    if (hideSpot) {
      this.promptText.setText(`${input.label('down')}  Hide`).setPosition(hideSpot.placed.x, hideSpot.placed.y - 150).setVisible(true);
    } else if (pt) {
      if (pt.def.type === 'tree') showTip('tree');
      if (pt.def.type === 'rest') showTip('rest');
      this.promptText.setText(`${input.label('interact')}  ${pt.prompt!()}`).setPosition(pt.placed.x, pt.placed.y - 150).setVisible(true);
      if (input.pressed('interact') && this.player.onGround) { input.consume('interact', 'up'); pt.interact!(); }
    } else this.promptText.setVisible(false);

    if (!this.busy && (input.pressed('menu') || input.pressed('bag'))) this.openMenu(input.pressed('bag') ? 'items' : undefined);
  }

  /** Pauses the world and opens the pause menu, on `section` if given (the bag key opens Items). */
  private openMenu(section?: 'items') {
    const st = session.state;
    input.consume('menu', 'bag', 'cancel');
    st.location.x = this.player.x;
    st.location.y = this.player.y;
    audio.sfx('ui_ok');
    this.scene.pause();
    this.scene.setVisible(false, 'Hud');
    this.scene.launch('Menu', { section, onClose: () => { this.scene.resume(); this.scene.setVisible(true, 'Hud'); this.syncAbilities(); bus.emit('hud', undefined); } });
    this.scene.bringToTop('Menu');
  }

  /** First-time tips that depend on where the player is or what they have (data/tips.ts). */
  private checkTips() {
    const st = session.state;
    const px = this.player.x, py = this.player.y;
    if (!tipSeen('move')) showTip('move');
    if (!tipSeen('spikes') && this.phys.spikes.some((r) => px > r.x - TILE * 6 && px < r.x + r.w + TILE * 6 && Math.abs(py - (r.y + r.h)) < TILE * 5)) showTip('spikes');
    if (!tipSeen('enemy') && this.enemies.some((e) => !e.live.gone && Math.abs(e.puppet.x - px) < 560 && Math.abs(e.puppet.y - py) < 260)) showTip('enemy');
    if (!tipSeen('glide') && st.abilities.includes('glide')) showTip('glide');
    if (!tipSeen('party') && st.party.length > 1) showTip('party');
    if (!tipSeen('fragment') && st.codex.length > 0) showTip('fragment');
    if (!tipSeen('menu') && st.location.checkpoint) showTip('menu');
    if (!tipSeen('bag') && Object.values(st.inventory).some((n) => n > 0)) showTip('bag');
    if (!tipSeen('objective') && st.objective) showTip('objective');
    if (!tipSeen('case_board') && st.clues.length) showTip('case_board');
    if (!tipSeen('stealth') && this.guards.some((g) => g.cone.visible && Math.abs(g.x - px) < 700 && Math.abs(g.live.placed.y - py) < 300)) showTip('stealth');
    if (!tipSeen('shove') && st.party[0] === 'nithish' && this.crates.some((c) => Math.abs(c.x - px) < 400)) showTip('shove');
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

