/**
 * Pause menu: party, items, Memory Fragments, the Case Board, the area map, the guide and settings.
 *
 * Navigation has two levels. The left column picks a section; → or confirm opens it; inside a section
 * the arrows move, and ←, cancel (Esc / Backspace / X) or the menu key go back. The footer always says
 * which keys do what. Sections draw a preview while the left column is focused; opening one redraws it
 * active (never on top of the preview).
 */
import Phaser from 'phaser';
import { audio } from '../core/AudioSynth';
import { bus } from '../core/EventBus';
import { addItem, FRAGMENT_STEP, fragmentBonus, memberStats, powersAwake } from '../core/GameState';
import { input } from '../core/Input';
import { ensureTextures, spec } from '../core/Loader';
import { tr } from '../core/Localization';
import { formatPlaytime, session } from '../core/Session';
import { settings, type Action } from '../core/Settings';
import { seenTips, tipBody } from '../core/Tips';
import { ABILITIES } from '../data/abilities';
import { CHARACTERS, xpToNext, type MemberId } from '../data/characters';
import { CLUES } from '../data/clues';
import { CODEX } from '../data/codex';
import { ITEMS } from '../data/items';
import { AREAS, ROOMS } from '../data/rooms';
import { SKILLS } from '../battle/skills';
import { MenuList, type MenuItem } from '../ui/MenuList';
import { addText, bar, C, drawPanel, H, W } from '../ui/theme';
import type { OverlayData } from './SettingsScene';
import { ensureEarthTextures } from '../world/EarthPainter';
import { CharacterRig } from '../world/CharacterRig';
import { TILE, type RoomDef } from '../world/RoomDef';

const PX = 350, PY = 96, PW = 880, PH = 560;
type Section = 'party' | 'items' | 'codex' | 'case' | 'map' | 'guide' | 'settings' | 'title' | 'resume';
type Mode = 'left' | 'list' | 'grid' | 'map';

/** Keyboard/pad navigation over a grid of cells (items, clue cards). */
interface Grid {
  n: number;
  cols: number;
  index: number;
  focus: (i: number) => void;
  select?: (i: number) => void;
  back: () => void;
}

const KIND_NAME: Record<string, string> = { consumable: 'Consumable', keepsake: 'Keepsake', key: 'Key item', material: 'Material' };
const KIND_COLOR: Record<string, number> = { consumable: 0x8dffbd, keepsake: 0xffd98a, key: 0x9cc9ff, material: 0xc8b0ff };

export class MenuScene extends Phaser.Scene {
  private left!: MenuList;
  private sub: MenuList | null = null;
  private grid: Grid | null = null;
  private content!: Phaser.GameObjects.Container;
  private footer!: Phaser.GameObjects.Text;
  private data_: OverlayData = {};
  private section: Section = 'party';
  private artSeq = 0;
  private rigs: { rig: CharacterRig; x: number; y: number }[] = [];
  private mapCam: Phaser.Cameras.Scene2D.Camera | null = null;
  private mapLayer: Phaser.GameObjects.Container | null = null;
  private partySel: Phaser.GameObjects.Graphics | null = null;
  private mapBounds = { x: 0, y: 0, w: 0, h: 0 };
  private mapActive = false;
  private repeatAt = 0;

  constructor() { super({ key: 'Menu' }); }

  create(data: OverlayData & { section?: 'items' }) {
    this.data_ = data;
    this.sub = null;
    this.grid = null;
    this.rigs = [];
    this.mapCam = null;
    this.mapLayer = null;
    this.mapActive = false;
    this.add.rectangle(0, 0, W, H, 0x03050a, 0.84).setOrigin(0);
    const g = this.add.graphics();
    drawPanel(g, 40, PY, 280, PH, 0.94, 14);
    drawPanel(g, PX, PY, PW, PH, 0.94, 14);
    const st = session.state;
    session.tickPlaytime();
    addText(this, 60, 40, 'Paused', { size: 34, display: true, bold: true });
    const room = ROOMS[st.location.room];
    addText(this, W - 50, 48, `${room ? tr(room.name) : ''}  ·  Purpose ${st.venture.purpose}, Venture ${st.venture.venture}  ·  ${formatPlaytime(st.playtimeMs)}`,
      { size: 17, color: C.textDim }).setOrigin(1, 0);
    this.content = this.add.container(0, 0);
    this.footer = addText(this, W / 2, H - 14, '', { size: 16, color: '#b8c8de' }).setOrigin(0.5, 1);
    const sec = (id: Section, label: string): MenuItem => ({
      label: () => label, onFocus: () => this.show(id), onSelect: () => this.enter(id),
    });
    this.left = new MenuList(this, 50, PY + 20, [
      sec('party', 'Party'), sec('items', 'Items'), sec('codex', 'Memory Fragments'), sec('case', 'Case Board'), sec('map', 'Map'), sec('guide', 'Guide'),
      sec('settings', 'Settings'), sec('title', 'Quit to title'), sec('resume', 'Resume'),
    ], { width: 260, lineHeight: 48, size: 24, display: true, onCancel: () => this.close(), rightSelects: true, idleCursor: true });
    this.show('party');
    if (data.section === 'items') {
      // The bag key: straight into the items.
      this.left.focus(1);
      this.enter('items');
    }
    this.events.once('shutdown', () => { if (this.mapCam) this.cameras.remove(this.mapCam); this.mapCam = null; });
    input.consume();
  }

  // ------------------------------------------------------------------ plumbing
  private keys(a: Action): string {
    if (input.lastDevice === 'gamepad') return input.label(a);
    return settings.get('bindings')[a].map((k) => input.keyLabel(k)).join(' / ');
  }

  private hint(mode: Mode) {
    const back = `← or ${this.keys('cancel')}`;
    const t: Record<Mode, string> = {
      left: `↑↓ Choose     → or ${input.label('confirm')}  Open     ${this.keys('cancel')}  Close     ${input.label('bag')}  Bag`,
      list: `↑↓ Choose     ${input.label('confirm')}  Select     ${back}  Back`,
      grid: `Arrows  Choose     ${input.label('confirm')}  Select     ${this.keys('cancel')}  Back`,
      map: `Arrows  Move the map     ${input.label('confirm')}  Back to you     ${this.keys('cancel')}  Back`,
    };
    this.footer.setText(t[mode]);
  }

  private close() {
    input.consume();
    this.data_.onClose?.();
    this.scene.stop();
  }

  private clear() {
    this.sub?.destroy();
    this.sub = null;
    this.grid = null;
    this.rigs = [];
    this.mapActive = false;
    if (this.mapCam) { this.cameras.remove(this.mapCam); this.mapCam = null; }
    this.mapLayer?.destroy();
    this.mapLayer = null;
    this.partySel = null;
    this.content.removeAll(true);
  }

  /** Back to the left column, redrawing the section as a preview. */
  private backToLeft() {
    this.left.active = true;
    this.show(this.section);
    input.consume();
  }

  private text(x: number, y: number, s: string, o: Parameters<typeof addText>[4] = {}) {
    const t = addText(this, x, y, s, o);
    this.content.add(t);
    return t;
  }

  private gfx() {
    const g = this.add.graphics();
    this.content.add(g);
    return g;
  }

  private heading(title: string, sub?: string) {
    this.text(PX + 28, PY + 18, title, { size: 26, display: true, bold: true, color: C.accent });
    if (sub) this.text(PX + PW - 28, PY + 26, sub, { size: 16, color: C.textDim }).setOrigin(1, 0);
  }

  private show(id: Section) {
    this.section = id;
    this.clear();
    this.hint('left');
    switch (id) {
      case 'party': return this.drawParty();
      case 'items': return this.drawItems(false);
      case 'codex': return this.drawCodex(false);
      case 'map': return this.drawMap(false);
      case 'guide': return this.drawGuide(false);
      case 'case': return this.drawCase(false);
      case 'settings': this.heading('Settings'); this.text(PX + 28, PY + 70, 'Language, text speed, volume, accessibility and controls.', { color: C.textDim }); return;
      case 'title': this.heading('Quit to title'); this.text(PX + 28, PY + 70, 'Return to the title screen.\nAnything since you last rested or saved is lost.', { color: C.textDim, lineSpacing: 6 }); return;
      case 'resume': this.heading('Resume'); this.text(PX + 28, PY + 70, 'Back to the game.', { color: C.textDim }); return;
    }
  }

  private enter(id: Section) {
    const open = (draw: () => void) => {
      this.clear();
      this.left.active = false;
      draw();
      input.consume();
    };
    switch (id) {
      case 'party': return this.chooseMember();
      case 'items': return open(() => this.drawItems(true));
      case 'codex': return open(() => this.drawCodex(true));
      case 'guide': return open(() => this.drawGuide(true));
      case 'case': return open(() => this.drawCase(true));
      case 'map': return open(() => this.drawMap(true));
      case 'settings':
        this.left.active = false;
        this.scene.launch('Settings', { onClose: () => { this.left.active = true; input.consume(); } });
        this.scene.bringToTop('Settings');
        return;
      case 'title': return this.confirmQuit();
      case 'resume': return this.close();
      default: return;
    }
  }

  /** A list inside a section. Back (← or cancel) returns to the left column. */
  private list(x: number, y: number, w: number, items: MenuItem[], rows: number, lineHeight = 42, active = true, onBack?: () => void) {
    const l = new MenuList(this, x, y, items, {
      width: w, lineHeight, size: 21, rows, leftCancels: true,
      onCancel: onBack ?? (() => this.backToLeft()),
    });
    l.active = active;
    this.content.add(l.container);
    if (active) {
      this.left.active = false;
      this.sub?.destroy();
      this.sub = l;
      this.hint('list');
    }
    return l;
  }

  // ------------------------------------------------------------------ party
  private partyCard(i: number) {
    const n = session.state.party.length;
    const h = Math.min(236, (PH - 110) / Math.max(1, n));
    return { x: PX + 20, y: PY + 20 + i * (h + 8), w: PW - 40, h };
  }

  /** Outlines the member being equipped. */
  private selectMember(i: number) {
    if (!this.partySel) return;
    const r = this.partyCard(i);
    this.partySel.clear().lineStyle(3, C.accentInt, 0.95).strokeRoundedRect(r.x - 2, r.y - 2, r.w + 4, r.h + 4, 13);
  }

  private drawParty() {
    const st = session.state;
    st.party.forEach((id, i) => {
      const m = st.members[id]!;
      const c = CHARACTERS[id];
      const s = memberStats(st, id);
      const { x, y, w, h: cardH } = this.partyCard(i);
      const big = cardH > 180;
      const g = this.gfx();
      g.fillStyle(0x101a2c, 0.9).fillRoundedRect(x, y, w, cardH, 12);
      g.lineStyle(1.5, c.vein, 0.35).strokeRoundedRect(x, y, w, cardH, 12);
      // The character, alive: a rim-lit figure on a soft pool of light.
      const fx = x + (big ? 90 : 60), fy = y + cardH - 18;
      g.fillStyle(c.vein, 0.1).fillEllipse(fx, fy, big ? 150 : 100, big ? 26 : 18);
      g.fillStyle(c.vein, 0.18).fillEllipse(fx, fy, big ? 90 : 60, big ? 14 : 10);
      const rig = new CharacterRig(this, id, 0);
      rig.scale = big ? 1.85 : 1.05;
      rig.facing = 1;
      this.content.add([rig.g, rig.glow]);
      this.rigs.push({ rig, x: fx, y: fy });

      const tx = x + (big ? 190 : 130);
      this.text(tx, y + 16, tr(c.name), { size: big ? 30 : 24, display: true, bold: true });
      this.text(tx + (big ? 180 : 150), y + (big ? 26 : 22), `Level ${m.level}`, { size: 17, color: C.accent });
      bar(g, tx, y + (big ? 66 : 54), 240, 10, m.hp / s.maxHp, m.hp / s.maxHp < 0.3 ? C.hpLow : C.hp);
      this.text(tx + 252, y + (big ? 60 : 48), `HP ${m.hp} / ${s.maxHp}`, { size: 16, color: C.textDim });
      bar(g, tx, y + (big ? 86 : 70), 240, 6, m.xp / xpToNext(m.level), 0x9cc9ff);
      this.text(tx + 252, y + (big ? 79 : 63), `XP ${m.xp} / ${xpToNext(m.level)}`, { size: 16, color: C.textDim });
      // Stats as little tiles.
      (['atk', 'def', 'spd'] as const).forEach((k, j) => {
        const bx = tx + j * 86, by = y + (big ? 108 : 86);
        g.fillStyle(0x16223a, 1).fillRoundedRect(bx, by, 76, 30, 6);
        this.text(bx + 10, by + 15, k.toUpperCase(), { size: 13, color: C.textFaint }).setOrigin(0, 0.5);
        this.text(bx + 66, by + 15, String(s[k]), { size: 17, bold: true }).setOrigin(1, 0.5);
      });
      if (big) {
        // What they can do in a fight. Ragul's powers wake at the dance in Venture 1.
        const skills = c.skills.filter((sk) => powersAwake(st) || !['death_touch', 'soul_absorb'].includes(sk)).map((sk) => tr(SKILLS[sk]?.name ?? { en: sk, ta: sk }));
        this.text(tx, y + 152, 'Skills', { size: 14, color: C.textFaint });
        this.text(tx, y + 172, skills.join('   ·   ') || '—', { size: 17, color: '#cfe0f5', wordWrap: { width: 420 } });
      }
      // Keepsake with its icon.
      const kx = x + w - 250, ky = y + 16;
      const k = m.keepsake ? ITEMS[m.keepsake] : null;
      g.fillStyle(0x16223a, 1).fillRoundedRect(kx, ky, 230, 64, 8);
      this.text(kx + 12, ky + 8, 'Keepsake', { size: 13, color: C.textFaint });
      if (k && this.textures.exists(`icon:${k.icon}`)) this.content.add(this.add.image(kx + 206, ky + 32, `icon:${k.icon}`).setDisplaySize(40, 40));
      this.text(kx + 12, ky + 28, k ? tr(k.name) : 'None', { size: 18, color: k ? C.warm : C.textDim, wordWrap: { width: 170 } });
      let ly = ky + 76;
      if (id === 'ragul' && st.flags.hunger_known) { this.text(kx, ly, `Soul Hunger ${st.soulHunger}  ·  souls taken ${st.soulsAbsorbed}`, { size: 15, color: '#b9a4ff' }); ly += 22; }
      if (id === 'dhanasree' && (st.venture.purpose !== 1 || st.inventory.handgun)) { this.text(kx, ly, `Handgun: ${st.ammo} / 6 shots`, { size: 15, color: C.warm }); ly += 22; }
    });
    const ab = st.abilities.map((a) => tr(ABILITIES[a]?.name ?? { en: a, ta: a }));
    this.text(PX + 28, PY + PH - 72, 'Abilities', { size: 14, color: C.textFaint });
    this.text(PX + 28, PY + PH - 50, ab.join('     ·     ') || 'None yet', { size: 17, color: C.textDim });
    this.text(PX + PW - 28, PY + PH - 50, `${input.label('confirm')}: equip a keepsake`, { size: 15, color: C.textFaint }).setOrigin(1, 0);
  }

  private chooseMember() {
    const st = session.state;
    const keepsakes = Object.keys(st.inventory).filter((id) => ITEMS[id]?.kind === 'keepsake');
    if (!keepsakes.length) {
      audio.sfx('ui_back');
      this.text(PX + PW - 28, PY + PH - 96, 'No keepsakes to equip yet.', { size: 16, color: C.warm }).setOrigin(1, 0);
      return;
    }
    this.clear();
    this.drawParty();
    this.partySel = this.gfx();
    this.selectMember(0);
    const g = this.gfx();
    g.fillStyle(0x0b1220, 0.97).fillRoundedRect(PX + PW - 300, PY + PH - 206, 280, 40 + st.party.length * 42, 10);
    g.lineStyle(1.5, C.accentInt, 0.5).strokeRoundedRect(PX + PW - 300, PY + PH - 206, 280, 40 + st.party.length * 42, 10);
    this.text(PX + PW - 286, PY + PH - 198, 'Who wears a keepsake?', { size: 16, color: C.accent });
    this.list(PX + PW - 294, PY + PH - 172, 268, st.party.map((id, i) => ({
      label: () => `Equip ${tr(CHARACTERS[id].name)}`,
      onFocus: () => this.selectMember(i),
      onSelect: () => this.chooseKeepsake(id, keepsakes),
    })), 4);
  }

  private chooseKeepsake(id: MemberId, keepsakes: string[]) {
    const st = session.state;
    const apply = (k: string | null) => {
      for (const m of Object.values(st.members)) if (k && m && m.keepsake === k) m.keepsake = null;
      const m = st.members[id]!;
      const before = memberStats(st, id).maxHp;
      m.keepsake = k;
      const after = memberStats(st, id).maxHp;
      m.hp = Math.max(1, Math.min(after, m.hp + Math.max(0, after - before)));
      audio.sfx(k ? 'ability' : 'ui_back');
      bus.emit('hud', undefined);
      this.backToLeft();
    };
    const items: MenuItem[] = keepsakes.map((k) => ({ label: () => tr(ITEMS[k]!.name), onSelect: () => apply(k) }));
    items.push({ label: () => 'Remove', onSelect: () => apply(null) });
    const g = this.gfx();
    g.fillStyle(0x0b1220, 0.98).fillRoundedRect(PX + PW - 340, PY + PH - 250, 320, 44 + Math.min(4, items.length) * 42, 10);
    g.lineStyle(1.5, C.warmInt, 0.5).strokeRoundedRect(PX + PW - 340, PY + PH - 250, 320, 44 + Math.min(4, items.length) * 42, 10);
    this.text(PX + PW - 326, PY + PH - 242, `${tr(CHARACTERS[id].name)} wears…`, { size: 16, color: C.warm });
    this.list(PX + PW - 334, PY + PH - 216, 308, items, 4);
  }

  // ------------------------------------------------------------------ items
  private drawItems(active: boolean) {
    const st = session.state;
    this.heading('Items');
    if (st.riShards || st.venture.purpose !== 1) this.text(PX + 28, PY + PH - 40, `RI shards: ${st.riShards}`, { size: 17, color: C.accent });
    const ids = Object.keys(st.inventory).filter((i) => ITEMS[i]);
    if (!ids.length) { this.text(PX + 28, PY + 80, 'Your bag is empty.', { color: C.textDim }); return; }
    const g = this.gfx();
    const cell = 92, gap = 14, cols = 5, gx = PX + 28, gy = PY + 72;
    const dx = PX + 580, dw = PW - 580 - 24;
    const detail = this.gfx();
    const big = this.add.image(dx + dw / 2, PY + 150, '__DEFAULT').setVisible(false);
    const name = this.text(dx + 18, PY + 250, '', { size: 24, display: true, bold: true, wordWrap: { width: dw - 36 } });
    const chip = this.text(dx + 18, PY + 290, '', { size: 14, bold: true });
    const desc = this.text(dx + 18, PY + 320, '', { size: 18, wordWrap: { width: dw - 36 }, lineSpacing: 4, color: '#dbe6f5' });
    const how = this.text(dx + 18, PY + PH - 44, '', { size: 15, color: C.textFaint, wordWrap: { width: dw - 36 } });
    this.content.add(big);
    const draw = (sel: number) => {
      g.clear();
      ids.forEach((id, i) => {
        const it = ITEMS[id]!;
        const x = gx + (i % cols) * (cell + gap), y = gy + Math.floor(i / cols) * (cell + gap);
        const on = i === sel && active;
        g.fillStyle(on ? 0x1d2f4c : 0x131e32, 1).fillRoundedRect(x, y, cell, cell, 10);
        g.fillStyle(KIND_COLOR[it.kind] ?? 0x9cc9ff, 0.8).fillRoundedRect(x + 8, y + cell - 7, cell - 16, 3, 1.5);
        g.lineStyle(on ? 2.5 : 1, on ? C.accentInt : 0x9cc9ff, on ? 1 : (i === sel ? 0.45 : 0.18)).strokeRoundedRect(x, y, cell, cell, 10);
        if (on) g.lineStyle(6, C.accentInt, 0.12).strokeRoundedRect(x - 3, y - 3, cell + 6, cell + 6, 12);
      });
    };
    ids.forEach((id, i) => {
      const it = ITEMS[id]!;
      const x = gx + (i % cols) * (cell + gap), y = gy + Math.floor(i / cols) * (cell + gap);
      if (this.textures.exists(`icon:${it.icon}`)) this.content.add(this.add.image(x + cell / 2, y + cell / 2 - 4, `icon:${it.icon}`).setDisplaySize(62, 62));
      if ((st.inventory[id] ?? 0) > 1) this.text(x + cell - 8, y + cell - 12, `×${st.inventory[id]}`, { size: 15, bold: true }).setOrigin(1, 1);
    });
    const focus = (i: number) => {
      const it = ITEMS[ids[i]!]!;
      draw(i);
      detail.clear();
      detail.fillStyle(0x101a2c, 0.95).fillRoundedRect(dx, PY + 20, dw, PH - 40, 12);
      detail.lineStyle(1.5, KIND_COLOR[it.kind] ?? 0x9cc9ff, 0.35).strokeRoundedRect(dx, PY + 20, dw, PH - 40, 12);
      detail.fillStyle(KIND_COLOR[it.kind] ?? 0x9cc9ff, 0.07).fillCircle(dx + dw / 2, PY + 150, 92);
      const key = `icon:${it.icon}`;
      if (this.textures.exists(key)) big.setTexture(key).setDisplaySize(150, 150).setVisible(true);
      else big.setVisible(false);
      name.setText(tr(it.name));
      chip.setY(name.y + name.height + 8).setText(KIND_NAME[it.kind]?.toUpperCase() ?? '').setColor('#' + (KIND_COLOR[it.kind] ?? 0x9cc9ff).toString(16).padStart(6, '0'));
      desc.setY(chip.y + 28).setText(tr(it.desc));
      how.setText(it.kind === 'consumable' ? `${input.label('confirm')}: use it on someone` : it.kind === 'keepsake' ? 'Wear it: Party, then pick who.' : it.kind === 'key' ? 'Used by itself when the time comes.' : '');
    };
    focus(0);
    if (!active) return;
    this.left.active = false;
    this.hint('grid');
    this.grid = {
      n: ids.length, cols, index: 0, focus,
      select: (i) => { const id = ids[i]!; if (ITEMS[id]!.kind === 'consumable') this.useOn(id); else audio.sfx('ui_back'); },
      back: () => this.backToLeft(),
    };
  }

  private useOn(itemId: string) {
    const st = session.state;
    const it = ITEMS[itemId]!;
    this.grid = null;
    const g = this.gfx();
    g.fillStyle(0x0b1220, 0.97).fillRoundedRect(PX + 170, PY + 150, 420, 60 + st.party.length * 44, 12);
    g.lineStyle(1.5, C.accentInt, 0.5).strokeRoundedRect(PX + 170, PY + 150, 420, 60 + st.party.length * 44, 12);
    this.text(PX + 190, PY + 162, `Use ${tr(it.name)} on…`, { size: 18, color: C.accent });
    this.list(PX + 176, PY + 196, 400, st.party.map((id) => ({
      label: () => tr(CHARACTERS[id].name),
      value: () => `${st.members[id]!.hp} / ${memberStats(st, id).maxHp}`,
      onSelect: () => {
        const m = st.members[id]!;
        const max = memberStats(st, id).maxHp;
        if (m.hp >= max || !(st.inventory[itemId]! > 0)) { audio.sfx('ui_back'); return; }
        m.hp = Math.min(max, m.hp + Math.round(max * (it.heal ?? 0)));
        addItem(st, itemId, -1);
        audio.sfx('heal');
        bus.emit('hud', undefined);
        this.clear();
        this.drawItems(true);
      },
    })), 4, 44, true, () => { this.clear(); this.drawItems(true); });
  }

  // ------------------------------------------------------------------ Memory Fragments
  private drawCodex(active: boolean) {
    const st = session.state;
    const ids = st.codex.filter((c) => CODEX[c]);
    const total = Object.keys(CODEX).length;
    this.heading('Memory Fragments', `${ids.length} / ${total} gathered`);
    // What they are for, and progress towards the next reward.
    const g = this.gfx();
    const bonus = fragmentBonus(ids.length);
    const next = FRAGMENT_STEP - (ids.length % FRAGMENT_STEP);
    this.text(PX + 28, PY + 58, `Flashes of the past, from dreams and memories. Every ${FRAGMENT_STEP} steady the whole party: +5 max HP each time.`, { size: 16, color: C.textDim, wordWrap: { width: PW - 56 } });
    const bx = PX + 28, by = PY + 92, bw = PW - 56;
    g.fillStyle(0x16223a, 1).fillRoundedRect(bx, by, bw, 8, 4);
    g.fillStyle(0xb9a4ff, 1).fillRoundedRect(bx, by, Math.max(8, bw * (ids.length / total)), 8, 4);
    for (let k = FRAGMENT_STEP; k < total; k += FRAGMENT_STEP) g.fillStyle(0xffffff, 0.35).fillRect(bx + bw * (k / total) - 1, by - 3, 2, 14);
    this.text(bx, by + 16, `Bonus now: +${bonus} max HP`, { size: 15, color: '#cbb8ff' });
    this.text(bx + bw, by + 16, ids.length >= total ? 'All gathered.' : `${next} more for the next +5`, { size: 15, color: C.textFaint }).setOrigin(1, 0);
    if (!ids.length) { this.text(PX + 28, PY + 150, 'No memories gathered yet. Look for them in dreams, flashbacks and quiet corners.', { color: C.textDim, wordWrap: { width: PW - 56 } }); return; }
    const ax = PX + 420, aw = PW - 420 - 28;
    const frame = this.gfx();
    const art = this.add.image(ax + aw / 2, PY + 250, '__DEFAULT').setVisible(false);
    this.content.add(art);
    const title = this.text(ax, PY + 372, '', { size: 22, display: true, bold: true, color: '#e6dcff' });
    const body = this.text(ax, PY + 404, '', { size: 17, wordWrap: { width: aw }, lineSpacing: 4 });
    const fit = () => { const k = Math.min(aw / art.width, 210 / art.height); art.setScale(k); frame.clear(); frame.lineStyle(2, 0xb9a4ff, 0.5).strokeRect(art.x - art.displayWidth / 2 - 4, art.y - art.displayHeight / 2 - 4, art.displayWidth + 8, art.displayHeight + 8); };
    const focus = (id: string) => {
      const e = CODEX[id]!;
      title.setText(tr(e.title));
      body.setText(tr(e.text));
      const seq = ++this.artSeq;
      if (e.art.startsWith('gen:')) {
        ensureEarthTextures(this, e.art);
        art.setTexture(`bg:${e.art}`).setVisible(true);
        fit();
        return;
      }
      const s = spec('art', e.art) ?? spec('bg', e.art);
      if (!s) { art.setVisible(false); frame.clear(); return; }
      void ensureTextures(this, [s]).then(() => {
        if (seq !== this.artSeq || !art.active) return;
        art.setTexture(s.key).setVisible(true);
        fit();
      });
    };
    const items: MenuItem[] = ids.map((id) => ({ label: () => `◆  ${tr(CODEX[id]!.title)}`, onFocus: () => focus(id) }));
    focus(ids[0]!);
    this.list(PX + 16, PY + 140, 380, items, 9, 44, active);
  }

  // ------------------------------------------------------------------ guide
  private drawGuide(active: boolean) {
    this.heading('Guide');
    const tips = seenTips();
    if (!tips.length) { this.text(PX + 28, PY + 80, 'Tips you come across are kept here.', { color: C.textDim }); return; }
    const g = this.gfx();
    const dx = PX + 440, dw = PW - 440 - 24;
    g.fillStyle(0x101a2c, 0.95).fillRoundedRect(dx, PY + 64, dw, PH - 88, 12);
    g.lineStyle(1.5, C.warmInt, 0.3).strokeRoundedRect(dx, PY + 64, dw, PH - 88, 12);
    const head = this.text(dx + 20, PY + 82, '', { size: 23, display: true, bold: true, color: C.warm, wordWrap: { width: dw - 40 } });
    const body = this.text(dx + 20, PY + 124, '', { size: 18, wordWrap: { width: dw - 40 }, lineSpacing: 5 });
    const focus = (i: number) => { const t = tips[i]!; head.setText(tr(t.title)); body.setY(head.y + head.height + 12).setText(tipBody(t)); };
    const items: MenuItem[] = tips.map((t, i) => ({ label: () => `${tr(t.title)}${t.kind === 'battle' ? '  ·  battle' : ''}`, onFocus: () => focus(i) }));
    focus(0);
    this.list(PX + 16, PY + 64, 400, items, 11, 42, active);
  }

  // ------------------------------------------------------------------ case board
  /** Clues about the deaths, pinned as cards on a corkboard. After Venture 8 each card shows what really happened. */
  private drawCase(active: boolean) {
    const st = session.state;
    const clues = st.clues.map((id) => CLUES[id]).filter((c): c is NonNullable<typeof c> => !!c);
    this.heading('Case Board', clues.length ? `${clues.length} pinned` : undefined);
    if (!clues.length) { this.text(PX + 28, PY + 80, 'Nothing pinned yet. Clues about the deaths will gather here.', { color: C.textDim }); return; }
    const truth = !!st.flags.truth_known;
    const bx = PX + 20, by = PY + 64, bw = 520, bh = PH - 88;
    const cork = this.gfx();
    cork.fillStyle(0x4a3524, 1).fillRoundedRect(bx, by, bw, bh, 10);
    const rnd = new Phaser.Math.RandomDataGenerator(['cork']);
    for (let i = 0; i < 420; i++) cork.fillStyle(rnd.pick([0x5a4230, 0x3c2a1c, 0x624834]), 0.6).fillCircle(bx + rnd.between(4, bw - 4), by + rnd.between(4, bh - 4), rnd.realInRange(0.8, 2.2));
    cork.lineStyle(6, 0x2a1c12, 1).strokeRoundedRect(bx, by, bw, bh, 10);
    const cols = 3, cw = 152, ch = 92, gx = 18, gy = 16;
    const rows = Math.max(1, Math.floor((bh - 24) / (ch + gy)));
    const perPage = cols * rows;
    const cards = this.gfx();
    const labels: Phaser.GameObjects.Text[] = [];
    const pos = (i: number) => {
      const j = i % perPage;
      const tilt = ((i * 37) % 7 - 3) * 0.6;
      return { x: bx + 20 + (j % cols) * (cw + gx), y: by + 22 + Math.floor(j / cols) * (ch + gy) + tilt };
    };
    const dx = bx + bw + 20, dw = PX + PW - 24 - dx;
    const detail = this.gfx();
    const head = this.text(dx + 18, PY + 84, '', { size: 21, display: true, bold: true, color: C.warm, wordWrap: { width: dw - 36 } });
    const body = this.text(dx + 18, PY + 120, '', { size: 17, wordWrap: { width: dw - 36 }, lineSpacing: 4 });
    const page = this.text(bx + bw - 12, by + bh - 10, '', { size: 13, color: '#e8d8c0' }).setOrigin(1, 1);
    const draw = (sel: number) => {
      cards.clear();
      labels.forEach((l) => l.destroy());
      labels.length = 0;
      const start = Math.floor(sel / perPage) * perPage;
      // Red string from card to card, in the order they were found.
      cards.lineStyle(2, 0xc03030, 0.7);
      for (let i = start + 1; i < Math.min(clues.length, start + perPage); i++) {
        const a = pos(i - 1), b = pos(i);
        cards.lineBetween(a.x + cw / 2, a.y + 8, b.x + cw / 2, b.y + 8);
      }
      for (let i = start; i < Math.min(clues.length, start + perPage); i++) {
        const c = clues[i]!, p = pos(i), on = i === sel;
        const solved = truth && !!c.truth;
        cards.fillStyle(0x000000, 0.3).fillRect(p.x + 4, p.y + 5, cw, ch);
        cards.fillStyle(solved ? 0xf2d8d0 : 0xefe4c8, 1).fillRect(p.x, p.y, cw, ch);
        if (on) cards.lineStyle(3, active ? C.accentInt : 0xffffff, active ? 1 : 0.6).strokeRect(p.x - 3, p.y - 3, cw + 6, ch + 6);
        cards.fillStyle(0xd84040, 1).fillCircle(p.x + cw / 2, p.y + 8, 6);
        cards.fillStyle(0xffffff, 0.6).fillCircle(p.x + cw / 2 - 2, p.y + 6, 2);
        const t = addText(this, p.x + 10, p.y + 22, tr(c.title), { size: 15, bold: true, color: '#3a2a1a', wordWrap: { width: cw - 20 } });
        this.content.add(t);
        labels.push(t);
        if (solved) { const s = addText(this, p.x + cw - 8, p.y + ch - 8, 'TRUTH', { size: 11, bold: true, color: '#b02020', letterSpacing: 2 }).setOrigin(1, 1); this.content.add(s); labels.push(s); }
      }
      page.setText(clues.length > perPage ? `page ${Math.floor(sel / perPage) + 1} of ${Math.ceil(clues.length / perPage)}` : '');
    };
    const focus = (i: number) => {
      const c = clues[i]!;
      draw(i);
      const solved = truth && !!c.truth;
      head.setText(tr(c.title));
      body.setY(head.y + head.height + 10);
      body.setText(solved ? `${tr(c.body)}\n\n${tr(c.truth!)}` : tr(c.body));
      body.setColor(solved ? '#ffd8d0' : C.text);
      detail.clear();
      detail.fillStyle(0x2a2016, 0.95).fillRoundedRect(dx, PY + 64, dw, PH - 88, 10);
      detail.lineStyle(2, solved ? C.dangerInt : C.warmInt, 0.5).strokeRoundedRect(dx, PY + 64, dw, PH - 88, 10);
      detail.fillStyle(0xd84040, 1).fillCircle(dx + dw / 2, PY + 64, 7);
    };
    focus(0);
    if (!active) return;
    this.left.active = false;
    this.hint('grid');
    this.grid = { n: clues.length, cols, index: 0, focus, back: () => this.backToLeft() };
  }

  // ------------------------------------------------------------------ map
  /**
   * The area map, drawn at a readable scale in its own camera (so it is clipped to the panel) and
   * moved with the arrows. Each room is a card: its painted backdrop, the shape of its ground, its
   * name, and paths to the rooms its exits lead to.
   */
  private drawMap(active: boolean) {
    const st = session.state;
    const here = ROOMS[st.location.room];
    const area = here ? AREAS[here.area] : undefined;
    if (!here || !area) return;
    this.heading(tr(area.name), 'Map');
    const rooms = area.rooms.map((r) => ROOMS[r]!).filter(Boolean);
    const U = 58, GAP = 18, NAME = 28;
    const box = (r: RoomDef) => ({ x: r.mapPos.x * U, y: r.mapPos.y * (U + NAME), w: r.mapPos.w * U - GAP, h: r.mapPos.h * (U + NAME) - GAP - NAME });
    // The map lives far from the menu's own objects, at MX/MY; only the map camera looks there.
    const MX = 5000, MY = 5000;
    const layer = this.add.container(MX, MY);
    this.mapLayer = layer;
    const g = this.add.graphics();
    layer.add(g);
    // Paths first, under the cards.
    for (const r of rooms) {
      const a = box(r);
      for (const e of r.entities) {
        if (e.def.type !== 'exit') continue;
        const to = ROOMS[e.def.to];
        if (!to || to.area !== r.area) continue;
        const b = box(to);
        const spawn = to.entities.find((x) => x.def.type === 'spawn' && x.def.id === (e.def as { entry: string }).entry);
        const ax = e.tx <= 0 ? a.x : a.x + a.w, ay = a.y + (e.ty / r.rows) * a.h;
        const sx = spawn ? spawn.tx / to.cols : 0.5;
        const bxp = sx < 0.5 ? b.x : b.x + b.w, byp = b.y + ((spawn?.ty ?? to.rows / 2) / to.rows) * b.h;
        const seen = st.visitedRooms.includes(r.id) || st.visitedRooms.includes(to.id);
        g.lineStyle(4, 0x9cc9ff, seen ? 0.35 : 0.12);
        const mx = (ax + bxp) / 2;
        g.beginPath(); g.moveTo(ax, ay); g.lineTo(mx, ay); g.lineTo(mx, byp); g.lineTo(bxp, byp); g.strokePath();
        g.fillStyle(0x9cc9ff, seen ? 0.7 : 0.25).fillCircle(ax, ay, 4).fillCircle(bxp, byp, 4);
      }
    }
    for (const r of rooms) {
      const b = box(r);
      const seen = st.visitedRooms.includes(r.id) || r.id === here.id;
      const isHere = r.id === here.id;
      g.fillStyle(0x000000, 0.5).fillRoundedRect(b.x + 5, b.y + 6, b.w, b.h, 10);
      g.fillStyle(seen ? 0x152238 : 0x0b111c, 1).fillRoundedRect(b.x, b.y, b.w, b.h, 10);
      if (seen) {
        const key = `bg:${r.backdrop}`;
        if (r.backdrop.startsWith('gen:')) ensureEarthTextures(this, r.backdrop);
        if (this.textures.exists(key)) {
          const img = this.add.image(0, 0, key).setOrigin(0).setAlpha(0.55);
          const tw = img.width, th = img.height;
          const k = Math.max((b.w - 8) / tw, (b.h - 8) / th);
          const cw = (b.w - 8) / k, chh = (b.h - 8) / k, cx = (tw - cw) / 2, cy = (th - chh) / 2;
          img.setScale(k).setCrop(cx, cy, cw, chh).setPosition(b.x + 4 - cx * k, b.y + 4 - cy * k);
          layer.add(img);
        }
        // The ground's shape, from the tile grid.
        const t = this.add.graphics();
        layer.add(t);
        const sx = (b.w - 8) / r.cols, sy = (b.h - 8) / r.rows;
        t.fillStyle(0x0a1020, 0.75);
        t.lineStyle(2, 0xdbe8ff, 0.85);
        for (let c = 0; c < r.cols; c++) {
          for (let row = 0; row < r.rows; row++) {
            const ch = r.grid[row]![c];
            if (ch === '#') {
              const above = row > 0 ? r.grid[row - 1]![c] : '#';
              t.fillRect(b.x + 4 + c * sx, b.y + 4 + row * sy, sx + 0.6, sy + 0.6);
              if (above !== '#') t.lineBetween(b.x + 4 + c * sx, b.y + 4 + row * sy, b.x + 4 + (c + 1) * sx, b.y + 4 + row * sy);
            } else if (ch === '=') {
              t.lineBetween(b.x + 4 + c * sx, b.y + 4 + row * sy, b.x + 4 + (c + 1) * sx, b.y + 4 + row * sy);
            } else if (ch === '^' || ch === 'x') {
              t.fillStyle(ch === 'x' ? 0xff8a3a : 0xff6060, 0.9).fillRect(b.x + 4 + c * sx, b.y + 4 + row * sy + sy * 0.5, sx, sy * 0.5).fillStyle(0x0a1020, 0.75);
            }
          }
        }
        if (isHere) {
          const px = b.x + 4 + (st.location.x / (r.cols * TILE)) * (b.w - 8), py = b.y + 4 + (st.location.y / (r.rows * TILE)) * (b.h - 8);
          const dot = this.add.graphics();
          dot.fillStyle(C.warmInt, 0.3).fillCircle(0, 0, 12);
          dot.fillStyle(C.warmInt, 1).fillCircle(0, 0, 6);
          dot.setPosition(Phaser.Math.Clamp(px, b.x + 8, b.x + b.w - 8), Phaser.Math.Clamp(py, b.y + 8, b.y + b.h - 8));
          layer.add(dot);
          this.tweens.add({ targets: dot, scale: 1.4, duration: 600, yoyo: true, repeat: -1 });
        }
      } else {
        const q = addText(this, b.x + b.w / 2, b.y + b.h / 2, '?', { size: 30, display: true, color: C.textFaint }).setOrigin(0.5);
        layer.add(q);
      }
      g.lineStyle(isHere ? 3 : 1.5, isHere ? C.warmInt : 0x9cc9ff, isHere ? 1 : seen ? 0.55 : 0.18).strokeRoundedRect(b.x, b.y, b.w, b.h, 10);
      if (isHere) g.lineStyle(8, C.warmInt, 0.15).strokeRoundedRect(b.x - 4, b.y - 4, b.w + 8, b.h + 8, 13);
      const n = addText(this, b.x + 6, b.y + b.h + 6, seen ? tr(r.name) : 'Not visited', { size: 16, bold: isHere, color: isHere ? C.warm : seen ? '#dbe6f5' : C.textFaint });
      layer.add(n);
    }
    const all = rooms.map(box);
    const minX = Math.min(...all.map((b) => b.x)) - 30, minY = Math.min(...all.map((b) => b.y)) - 30;
    const maxX = Math.max(...all.map((b) => b.x + b.w)) + 30, maxY = Math.max(...all.map((b) => b.y + b.h + NAME)) + 30;
    this.mapBounds = { x: MX + minX, y: MY + minY, w: maxX - minX, h: maxY - minY };
    // Its own camera, clipped to the panel.
    const vx = PX + 14, vy = PY + 64, vw = PW - 28, vh = PH - 112;
    const frame = this.gfx();
    frame.fillStyle(0x060b14, 1).fillRoundedRect(vx - 2, vy - 2, vw + 4, vh + 4, 10);
    frame.lineStyle(1, 0x9cc9ff, 0.25).strokeRoundedRect(vx - 2, vy - 2, vw + 4, vh + 4, 10);
    this.cameras.main.ignore(layer);
    const cam = this.cameras.add(vx, vy, vw, vh);
    cam.ignore(this.children.list.filter((o) => o !== layer));
    this.mapCam = cam;
    const hb = box(here);
    this.centerMap(MX + hb.x + hb.w / 2, MY + hb.y + hb.h / 2);
    this.text(PX + 28, PY + PH - 40, '●  You are here      ─  Paths between places      ?  Not visited yet', { size: 15, color: C.textDim });
    if (active) {
      this.left.active = false;
      this.mapActive = true;
      this.hint('map');
    }
  }

  private centerMap(x: number, y: number) {
    const cam = this.mapCam;
    if (!cam) return;
    const b = this.mapBounds;
    const sx = b.w <= cam.width ? b.x + b.w / 2 - cam.width / 2 : Phaser.Math.Clamp(x - cam.width / 2, b.x, b.x + b.w - cam.width);
    const sy = b.h <= cam.height ? b.y + b.h / 2 - cam.height / 2 : Phaser.Math.Clamp(y - cam.height / 2, b.y, b.y + b.h - cam.height);
    cam.setScroll(sx, sy);
  }

  // ------------------------------------------------------------------ quit
  private confirmQuit() {
    this.clear();
    this.heading('Quit to title');
    this.text(PX + 28, PY + 70, 'Quit to the title screen?\nAnything since your last rest will be lost.', { size: 22, lineSpacing: 6 });
    this.list(PX + 28, PY + 150, 320, [
      { label: () => 'No, keep playing', onSelect: () => this.backToLeft() },
      { label: () => 'Yes, quit', onSelect: () => {
        audio.music('none');
        this.scene.stop('Hud');
        this.scene.stop('Dialogue');
        this.scene.stop('World');
        this.scene.start('Title');
      } },
    ], 2);
  }

  // ------------------------------------------------------------------ frame
  private updateGrid(time: number) {
    const gr = this.grid!;
    const move = (d: number) => {
      const i = Phaser.Math.Clamp(gr.index + d, 0, gr.n - 1);
      if (i !== gr.index) { gr.index = i; audio.sfx('ui_move'); gr.focus(i); }
    };
    const held = (a: 'left' | 'right' | 'up' | 'down') => input.pressed(a) || (input.isDown(a) && time > this.repeatAt);
    const step = (a: 'left' | 'right' | 'up' | 'down', d: number) => { if (held(a)) { this.repeatAt = time + (input.pressed(a) ? 380 : 110); move(d); return true; } return false; };
    if (input.pressed('left') && gr.index % gr.cols === 0) { audio.sfx('ui_back'); input.consume('left'); gr.back(); return; }
    if (step('left', -1) || step('right', 1) || step('up', -gr.cols) || step('down', gr.cols)) return;
    if (input.pressed('confirm')) { input.consume('confirm', 'jump'); if (gr.select) { audio.sfx('ui_ok'); gr.select(gr.index); } return; }
    if (input.pressed('cancel')) { input.consume('cancel', 'menu'); audio.sfx('ui_back'); gr.back(); }
  }

  private updateMap(time: number, delta: number) {
    const cam = this.mapCam!;
    const v = 560 * (delta / 1000);
    const dx = (input.isDown('right') ? 1 : 0) - (input.isDown('left') ? 1 : 0);
    const dy = (input.isDown('down') ? 1 : 0) - (input.isDown('up') ? 1 : 0);
    if (dx || dy) this.centerMap(cam.scrollX + cam.width / 2 + dx * v, cam.scrollY + cam.height / 2 + dy * v);
    if (input.pressed('confirm')) {
      input.consume('confirm', 'jump');
      const st = session.state;
      const r = ROOMS[st.location.room];
      if (r) this.centerMap(5000 + r.mapPos.x * 58 + (r.mapPos.w * 58) / 2, 5000 + r.mapPos.y * 86 + (r.mapPos.h * 86) / 2);
    }
    if (input.pressed('cancel')) { input.consume('cancel', 'menu'); audio.sfx('ui_back'); this.backToLeft(); }
    void time;
  }

  override update(time: number, delta: number) {
    for (const r of this.rigs) r.rig.update(delta / 1000, r.x, r.y);
    if (this.scene.isActive('Settings')) return;
    // The bag key toggles, even from inside a section.
    if (input.pressed('bag')) { this.close(); return; }
    if (this.sub) { this.sub.update(time); return; }
    if (this.grid) { this.updateGrid(time); return; }
    if (this.mapActive && this.mapCam) { this.updateMap(time, delta); return; }
    if (input.pressed('menu')) { this.close(); return; }
    this.left.update(time);
  }
}
