import Phaser from 'phaser';
import { audio } from '../../core/AudioSynth';
import type { Dir } from '../../core/GameState';
import { input } from '../../core/Input';
import { tr } from '../../core/Localization';
import { session } from '../../core/Session';
import { PROPS, TILES } from '../assets';
import { COL, RUN_MS, TILE, VIEW_H, VIEW_W, WALK_MS } from '../config';
import { compileMap, key, type CompiledMap } from '../maps/compile';
import { MAPS } from '../maps/index';
import type { NpcDef, PropPlace, TalkRef } from '../maps/types';
import { PxDirector, type WorldHost } from '../story/PxDirector';
import { advanceQuests } from '../quest/logic';
import type { UiScene } from '../ui/UiScene';
import { txt } from '../ui/widgets';
import { DELTA, DIRS, opposite, Walker } from './Walker';

export interface OverworldData {
  map: string;
  spawn?: string;
  x?: number;
  y?: number;
  dir?: Dir;
  /** A story to run once the map is shown (a new game's opening). */
  story?: { script: string; label: string };
}

const TINTS: Record<string, { color: number; alpha: number }> = {
  morning: { color: 0xffe2b0, alpha: 0.1 },
  noon: { color: 0xffffff, alpha: 0 },
  dusk: { color: 0xff8a50, alpha: 0.22 },
  night: { color: 0x1a2250, alpha: 0.45 },
  indoor: { color: 0xfff0d8, alpha: 0.06 },
};

interface Npc {
  def: NpcDef;
  w: Walker;
  next: number;
  home: [number, number];
  pathI: number;
}

interface PropSprite { place: PropPlace; img: Phaser.GameObjects.Image }

/** The top-down world: one map at a time, the player, the people and the things you can look at. */
export class OverworldScene extends Phaser.Scene implements WorldHost {
  private map!: CompiledMap;
  player!: Walker;
  private npcs: Npc[] = [];
  private props: PropSprite[] = [];
  private occupied = new Set<string>();
  private director!: PxDirector;
  private ui!: UiScene;
  /** A script, a warp or a menu has control. */
  busy = false;
  private heldDir: Dir | null = null;
  private turnUntil = 0;
  private stepping = false;
  private petals: { img: Phaser.GameObjects.Image; vx: number; vy: number; ph: number }[] = [];
  private data0!: OverworldData;

  constructor() {
    super('Overworld');
  }

  init(data: OverworldData): void {
    this.data0 = data;
  }

  create(): void {
    this.ui = this.scene.get('Ui') as UiScene;
    this.director = new PxDirector(this, this.ui);
    this.npcs = [];
    this.props = [];
    this.occupied.clear();
    this.busy = false;
    this.stepping = false;
    const d = this.data0;
    const def = MAPS[d.map];
    if (!def) throw new Error(`no map "${d.map}"`);
    this.map = compileMap(def, TILES, PROPS);
    const st = session.state;
    if (!st.visitedRooms.includes(def.id)) st.visitedRooms.push(def.id);
    // Steps met while away (or in a loaded save) catch up quietly.
    advanceQuests(st);

    this.cameras.main.setBackgroundColor(0x0c0d16);
    this.drawTiles();
    this.drawProps();
    this.drawSigns();

    const sp = d.spawn ? def.spawns[d.spawn] : undefined;
    const px = sp?.x ?? d.x ?? 1;
    const py = sp?.y ?? d.y ?? 1;
    this.player = new Walker(this, 'ragul', px, py, sp?.dir ?? d.dir ?? 'down');
    this.spawnNpcs();
    this.saveLocation();

    // Camera: follow the player; small rooms are centred.
    const cam = this.cameras.main;
    const mw = this.map.w * TILE, mh = this.map.h * TILE;
    cam.setBounds(Math.min(0, (mw - VIEW_W) / 2), Math.min(0, (mh - VIEW_H) / 2), Math.max(mw, VIEW_W), Math.max(mh, VIEW_H));
    cam.startFollow(this.player.sprite, true, 1, 1, 0, TILE / 2);
    cam.setRoundPixels(true);

    const tint = TINTS[def.tint ?? 'noon']!;
    if (tint.alpha > 0) this.add.rectangle(0, 0, VIEW_W, VIEW_H, tint.color, tint.alpha).setOrigin(0).setScrollFactor(0).setDepth(9000).setBlendMode(Phaser.BlendModes.MULTIPLY);
    if (def.petals) this.makePetals();

    audio.music(def.music);
    cam.fadeIn(250, 12, 13, 22);
    this.ui.showBanner(tr(def.name));
    this.ui.refreshTracker();
    const enter = def.enter && this.shown(def.enter.requires, def.enter.unless) ? def.enter : null;
    const story = d.story ?? enter;
    if (story) this.time.delayedCall(350, () => void this.runStory(story.script, story.label));
  }

  // ------------------------------------------------------------------ drawing
  private drawTiles(): void {
    const m = this.make.tilemap({ tileWidth: TILE, tileHeight: TILE, width: this.map.w, height: this.map.h });
    const ts = m.addTilesetImage('tiles', 'tiles', TILE, TILE, 0, 0)!;
    const ground = m.createBlankLayer('ground', ts)!;
    ground.putTilesAt(this.map.ground, 0, 0);
    ground.setDepth(-10);
    const b = m.createBlankLayer('buildings', ts)!;
    this.map.building.forEach((row, y) => row.forEach((t, x) => { if (t >= 0) b.putTileAt(t, x, y); }));
    b.setDepth(-5);
  }

  private drawProps(): void {
    for (const p of this.map.def.props ?? []) {
      const meta = PROPS[p.kind]!;
      const [fw] = meta.foot;
      const img = this.add.image((p.x + fw / 2) * TILE, (p.y + 1) * TILE, 'props', p.kind).setOrigin(0.5, 1);
      img.setFlipX(!!p.flip);
      img.setDepth(meta.above ? 8000 : (p.y + 1) * TILE - 1);
      this.props.push({ place: p, img });
    }
    this.applyPropFlags();
  }

  /** Building name boards over the doors. */
  private drawSigns(): void {
    for (const b of this.map.def.buildings ?? []) {
      if (!b.sign) continue;
      const cx = b.door ? (b.x + b.door.dx + 0.5) * TILE : (b.x + b.w / 2) * TILE;
      const y = (b.y + b.roof) * TILE + 2;
      const t = txt(this, cx, y + 2, tr(b.sign), COL.paper, null).setOrigin(0.5, 0).setDepth(-4);
      this.add.rectangle(cx, y, t.width + 8, 12, COL.ink2).setOrigin(0.5, 0).setDepth(-4.5).setStrokeStyle(1, COL.pod);
    }
  }

  private shown(requires?: string, unless?: string): boolean {
    const f = session.state.flags;
    return (!requires || !!f[requires]) && (!unless || !f[unless]);
  }

  private applyPropFlags(): void {
    for (const p of this.props) {
      const on = this.shown(p.place.requires, p.place.unless);
      p.img.setVisible(on);
      const meta = PROPS[p.place.kind]!;
      if (meta.solid && (p.place.requires || p.place.unless)) {
        for (let i = 0; i < meta.foot[0]; i++) for (let j = 0; j < meta.foot[1]; j++) {
          const row = this.map.solid[p.place.y - j];
          if (row && row[p.place.x + i] !== undefined) row[p.place.x + i] = on;
        }
      }
    }
  }

  private spawnNpcs(): void {
    for (const n of this.npcs) { n.w.destroy(); }
    this.npcs = [];
    this.occupied.clear();
    this.occupied.add(key(this.player.tx, this.player.ty));
    for (const def of this.map.def.npcs ?? []) {
      if (!this.shown(def.requires, def.unless)) continue;
      const w = new Walker(this, def.sprite, def.x, def.y, def.dir);
      this.npcs.push({ def, w, next: this.time.now + 800 + Math.random() * 2000, home: [def.x, def.y], pathI: 0 });
      this.occupied.add(key(def.x, def.y));
    }
  }

  private makePetals(): void {
    for (let i = 0; i < 36; i++) {
      const img = this.add.image(Math.random() * VIEW_W, Math.random() * VIEW_H, 'petal').setScrollFactor(0).setDepth(8500).setAlpha(0.9);
      this.petals.push({ img, vx: -6 - Math.random() * 8, vy: 10 + Math.random() * 10, ph: Math.random() * 6 });
    }
  }

  // ------------------------------------------------------------------ world rules
  blocked(x: number, y: number): boolean {
    if (x < 0 || y < 0 || x >= this.map.w || y >= this.map.h) return true;
    return this.map.solid[y]![x]! || this.occupied.has(key(x, y));
  }

  private npcAt(x: number, y: number): Npc | undefined {
    return this.npcs.find((n) => n.w.tx === x && n.w.ty === y);
  }

  private async walk(w: Walker, d: Dir, ms: number): Promise<boolean> {
    const [dx, dy] = DELTA[d];
    const nx = w.tx + dx, ny = w.ty + dy;
    w.face(d);
    if (this.blocked(nx, ny)) return false;
    this.occupied.delete(key(w.tx, w.ty));
    this.occupied.add(key(nx, ny));
    await w.step(d, ms);
    return true;
  }

  // ------------------------------------------------------------------ the loop
  override update(time: number, delta: number): void {
    this.updatePetals(delta);
    this.updateNpcs(time);
    if (this.busy || this.ui.busy || this.director.running || this.stepping) return;

    if (input.pressed('menu')) {
      input.consume('menu', 'cancel');
      this.openMenu();
      return;
    }
    if (input.pressed('confirm')) {
      input.consume('confirm');
      this.interact();
      return;
    }

    const held = DIRS.find((d) => input.isDown(d)) ?? null;
    if (!held) { this.heldDir = null; this.player.stand(); return; }
    // A tap turns without moving; holding walks.
    if (held !== this.player.dir && this.heldDir !== held) {
      this.player.face(held);
      this.heldDir = held;
      this.turnUntil = time + 90;
      return;
    }
    this.heldDir = held;
    if (time < this.turnUntil) return;
    void this.playerStep(held, input.isDown('run'));
  }

  private async playerStep(d: Dir, run: boolean): Promise<void> {
    this.stepping = true;
    const [dx, dy] = DELTA[d];
    const tx = this.player.tx + dx, ty = this.player.ty + dy;
    // Stepping onto a warp tile you can't otherwise stand on (a map edge) still takes the warp.
    const moved = await this.walk(this.player, d, run ? RUN_MS : WALK_MS);
    this.stepping = false;
    if (!moved) {
      const w = this.map.warps.get(key(tx, ty));
      if (w && (!w.dir || w.dir === d)) await this.takeWarp(w.to, w.spawn);
      return;
    }
    await this.arrive(d);
  }

  /** After each step: warps, then triggers. */
  private async arrive(d: Dir): Promise<void> {
    const { tx, ty } = this.player;
    const w = this.map.warps.get(key(tx, ty));
    if (w && (!w.dir || w.dir === d)) {
      audio.sfx('door');
      await this.takeWarp(w.to, w.spawn);
      return;
    }
    for (const t of this.map.def.triggers ?? []) {
      if (tx >= t.x && tx < t.x + (t.w ?? 1) && ty >= t.y && ty < t.y + (t.h ?? 1) && this.shown(t.requires, t.unless)) {
        this.player.stand();
        await this.runStory(t.script, t.label);
        return;
      }
    }
  }

  private interact(): void {
    const [x, y] = this.player.ahead();
    const npc = this.npcAt(x, y);
    if (npc) {
      void this.talk(npc.def.talk, npc.def.id);
      return;
    }
    const look = (this.map.def.looks ?? []).find((l) => l.x === x && l.y === y && this.shown(l.requires, l.unless));
    if (look) void this.talk(look.talk, null);
  }

  private async talk(t: TalkRef, npc: string | null): Promise<void> {
    audio.sfx('ui_ok');
    if ('text' in t) {
      this.busy = true;
      await this.ui.say({ name: '', color: COL.white, portrait: null, text: t.text, kind: 'desc' });
      this.ui.endTalk();
      this.busy = false;
    } else {
      await this.runStory(t.script, t.label, npc);
    }
  }

  async runStory(script: string, label: string, npc: string | null = null): Promise<void> {
    this.busy = true;
    this.player.stand();
    try {
      await this.director.run(script, label, npc);
    } finally {
      this.busy = false;
      input.consume();
    }
  }

  private updateNpcs(time: number): void {
    const talking = this.director.running || this.busy;
    for (const n of this.npcs) {
      const m = n.def.move;
      if (!m || m.kind === 'stand' || n.w.moving || time < n.next || talking) continue;
      n.next = time + 1400 + Math.random() * 2200;
      if (m.kind === 'look') {
        n.w.face(DIRS[Math.floor(Math.random() * 4)]!);
      } else if (m.kind === 'wander') {
        const d = DIRS[Math.floor(Math.random() * 4)]!;
        const [dx, dy] = DELTA[d];
        const nx = n.w.tx + dx, ny = n.w.ty + dy;
        if (Math.abs(nx - n.home[0]) <= m.r && Math.abs(ny - n.home[1]) <= m.r) void this.walk(n.w, d, WALK_MS + 60);
        else n.w.face(d);
      } else if (m.kind === 'patrol') {
        n.next = time + 60;
        const [gx, gy] = m.path[n.pathI]!;
        if (n.w.tx === gx && n.w.ty === gy) { n.pathI = (n.pathI + 1) % m.path.length; n.next = time + 700; continue; }
        const d: Dir = n.w.tx !== gx ? (gx > n.w.tx ? 'right' : 'left') : gy > n.w.ty ? 'down' : 'up';
        void this.walk(n.w, d, WALK_MS + 80).then((ok) => { if (!ok) n.next = time + 900; });
      }
    }
  }

  private updatePetals(delta: number): void {
    const dt = delta / 1000;
    for (const p of this.petals) {
      p.ph += dt * 2;
      p.img.x += (p.vx + Math.sin(p.ph) * 10) * dt;
      p.img.y += p.vy * dt;
      if (p.img.y > VIEW_H + 4) { p.img.y = -4; p.img.x = Math.random() * (VIEW_W + 60); }
      if (p.img.x < -4) p.img.x = VIEW_W + 4;
    }
  }

  // ------------------------------------------------------------------ maps and saving
  private async takeWarp(to: string, spawn: string): Promise<void> {
    this.busy = true;
    await this.fadeOut();
    this.scene.restart({ map: to, spawn } satisfies OverworldData);
  }

  saveLocation(): void {
    const st = session.state;
    st.location = { room: this.map.def.id, x: this.player.tx, y: this.player.ty, checkpoint: null, dir: this.player.dir };
  }

  mapName(): string {
    return tr(this.map.def.name);
  }

  private openMenu(): void {
    this.saveLocation();
    this.busy = true;
    this.player.stand();
    audio.sfx('ui_ok');
    this.ui.hideTracker();
    this.scene.launch('Menu');
    this.scene.bringToTop('Menu');
    this.scene.get('Menu').events.once('shutdown', () => {
      this.busy = false;
      input.consume();
      this.ui.refreshTracker();
    });
  }

  // ------------------------------------------------------------------ WorldHost
  npcSprite(id: string): string | null {
    return this.npcs.find((n) => n.def.id === id)?.def.sprite ?? null;
  }

  facePlayer(id: string): void {
    const n = this.npcs.find((x) => x.def.id === id);
    if (!n) return;
    const dx = this.player.tx - n.w.tx, dy = this.player.ty - n.w.ty;
    n.w.face(Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'right' : 'left') : dy > 0 ? 'down' : 'up');
    // Talking face to face: the player turns too.
    this.player.face(opposite(n.w.dir));
  }

  shake(): void { this.cameras.main.shake(260, 0.006); }
  flash(): void { this.cameras.main.flash(200, 255, 250, 235); }
  fadeOut(): Promise<void> {
    return new Promise((r) => { this.cameras.main.fadeOut(220, 12, 13, 22); this.cameras.main.once('camerafadeoutcomplete', () => r()); });
  }
  fadeIn(): Promise<void> {
    return new Promise((r) => { this.cameras.main.fadeIn(220, 12, 13, 22); this.cameras.main.once('camerafadeincomplete', () => r()); });
  }
  async gotoMap(map: string, spawn: string): Promise<void> {
    await this.takeWarp(map, spawn);
  }
  flagsChanged(): void {
    this.applyPropFlags();
    // People who come and go with the story.
    const want = (this.map.def.npcs ?? []).filter((d) => this.shown(d.requires, d.unless)).map((d) => d.id).join();
    const have = this.npcs.map((n) => n.def.id).join();
    if (want !== have) this.spawnNpcs();
  }
}
