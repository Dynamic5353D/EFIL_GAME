import Phaser from 'phaser';
import { audio } from '../../core/AudioSynth';
import { memberStats } from '../../core/GameState';
import { loc, tr, type Loc } from '../../core/Localization';
import { formatPlaytime, session } from '../../core/Session';
import { saves, SLOT_COUNT } from '../../core/SaveSystem';
import { CHARACTERS, xpToNext } from '../../data/characters';
import { ITEMS } from '../../data/items';
import { SPEAKERS } from '../../data/speakers';
import { COL, LINE_H, VIEW_H, VIEW_W } from '../config';
import { MAPS } from '../maps/index';
import { currentStep, questList } from '../quest/logic';
import type { OverworldScene } from '../world/OverworldScene';
import { ListNav } from './list';
import { txt, win, wrap } from './widgets';

type Page = 'root' | 'journal' | 'bag' | 'party' | 'save';

const ROOT: { id: Page | 'settings' | 'close'; icon: string; label: Loc }[] = [
  { id: 'journal', icon: 'icon_journal', label: loc('Journal', 'Journal') },
  { id: 'bag', icon: 'icon_bag', label: loc('Bag', 'Bag') },
  { id: 'party', icon: 'icon_party', label: loc('Ragul', 'Ragul') },
  { id: 'save', icon: 'icon_save', label: loc('Save', 'Save') },
  { id: 'settings', icon: 'icon_settings', label: loc('Settings', 'Settings') },
  { id: 'close', icon: 'icon_talk', label: loc('Close', 'Moodu') },
];

/** The start menu: a column on the right, and full-screen pages for the journal, bag, Ragul and saving. */
export class MenuScene extends Phaser.Scene {
  private page: Page = 'root';
  private nav = new ListNav(ROOT.length);
  private rootI = 0;
  private layer?: Phaser.GameObjects.Container;
  private message = '';

  constructor() {
    super('Menu');
  }

  create(): void {
    this.page = 'root';
    this.nav = new ListNav(ROOT.length);
    this.nav.i = this.rootI;
    this.draw();
    this.events.on('resume', () => this.draw());
  }

  private go(p: Page): void {
    this.page = p;
    this.message = '';
    const n = p === 'journal' ? questList(session.state).length : p === 'bag' ? this.items().length : p === 'save' ? SLOT_COUNT : p === 'root' ? ROOT.length : 1;
    this.nav = new ListNav(Math.max(n, 0), p === 'root');
    if (p === 'root') this.nav.i = this.rootI;
    this.draw();
  }

  private items() {
    return Object.entries(session.state.inventory).filter(([id, n]) => n > 0 && ITEMS[id]).map(([id, n]) => ({ def: ITEMS[id]!, n }));
  }

  override update(): void {
    const before = this.nav.i;
    const r = this.nav.update();
    if (r === 'cancel') {
      if (this.page === 'root') { this.scene.stop(); return; }
      this.go('root');
      return;
    }
    if (r === 'confirm') {
      if (this.page === 'root') {
        const it = ROOT[this.nav.i]!;
        this.rootI = this.nav.i;
        if (it.id === 'close') { this.scene.stop(); return; }
        if (it.id === 'settings') { this.scene.launch('Options'); this.scene.bringToTop('Options'); this.scene.pause(); this.scene.get('Options').events.once('shutdown', () => this.scene.resume()); return; }
        this.go(it.id);
        return;
      }
      if (this.page === 'save') { this.doSave(this.nav.i + 1); return; }
    }
    if (before !== this.nav.i) this.draw();
  }

  private doSave(slot: number): void {
    const world = this.scene.get('Overworld') as OverworldScene;
    world.saveLocation();
    session.slot = slot;
    const meta = session.save(world.mapName());
    audio.sfx(meta ? 'save' : 'ui_back');
    this.message = meta ? tr(loc(`Saved to slot ${slot}.`, `Slot ${slot}-la save aachu.`)) : tr(loc('Could not save.', 'Save aagala.'));
    this.draw();
  }

  // ------------------------------------------------------------------ drawing
  private draw(): void {
    this.layer?.destroy();
    this.layer = this.add.container(0, 0);
    if (this.page === 'root') this.drawRoot();
    else {
      this.layer.add(this.add.rectangle(0, 0, VIEW_W, VIEW_H, COL.ink, 0.6).setOrigin(0));
      if (this.page === 'journal') this.drawJournal();
      if (this.page === 'bag') this.drawBag();
      if (this.page === 'party') this.drawParty();
      if (this.page === 'save') this.drawSave();
    }
  }

  private drawRoot(): void {
    const c = this.layer!;
    const w = 108, h = ROOT.length * 20 + 14;
    const x = VIEW_W - w - 6, y = 6;
    c.add(win(this, x, y, w, h));
    ROOT.forEach((it, i) => {
      const iy = y + 8 + i * 20;
      if (this.nav.i === i) c.add(this.add.rectangle(x + 6, iy, w - 12, 18, COL.podHi).setOrigin(0));
      c.add(this.add.image(x + 18, iy + 9, 'ui', it.icon));
      c.add(txt(this, x + 32, iy + 5, tr(it.label), this.nav.i === i ? COL.ink : COL.slate));
      c.add(this.nav.hit(this, i, x + 6, iy, w - 12, 18));
    });
    // Play time and place, bottom left.
    const st = session.state;
    const info = `${MAPS[st.location.room] ? tr(MAPS[st.location.room]!.name) : ''}  ·  ${formatPlaytime(st.playtimeMs)}`;
    c.add(win(this, 6, VIEW_H - 26, 180, 20, 'win_ink'));
    c.add(txt(this, 16, VIEW_H - 20, info, COL.paper, COL.ink));
  }

  private frame(title: Loc, hint: Loc): { x: number; y: number; w: number; h: number } {
    const c = this.layer!;
    const x = 12, y = 10, w = VIEW_W - 24, h = VIEW_H - 20;
    c.add(win(this, x, y, w, h));
    c.add(txt(this, x + 14, y + 10, tr(title), COL.blue1));
    c.add(txt(this, x + w - 14, y + h - 16, tr(hint), COL.stone, null).setOrigin(1, 0));
    return { x, y, w, h };
  }

  private drawJournal(): void {
    const c = this.layer!;
    const f = this.frame(loc('Journal', 'Journal'), loc('X: back', 'X: pinnaadi'));
    const list = questList(session.state);
    if (!list.length) { c.add(txt(this, f.x + 16, f.y + 34, tr(loc('No quests yet.', 'Innum quest illa.')), COL.slate)); return; }
    const lw = 150;
    list.forEach((q, i) => {
      const iy = f.y + 30 + i * 18;
      if (this.nav.i === i) c.add(this.add.rectangle(f.x + 8, iy - 3, lw, 16, COL.podHi).setOrigin(0));
      c.add(this.add.rectangle(f.x + 14, iy + 1, 5, 5, q.def.kind === 'main' ? COL.red : COL.blue).setOrigin(0));
      c.add(txt(this, f.x + 24, iy, tr(q.def.title), q.done ? COL.stone : COL.ink));
      c.add(this.nav.hit(this, i, f.x + 8, iy - 3, lw, 16));
    });
    const q = list[this.nav.i];
    if (!q) return;
    const dx = f.x + lw + 20, dw = f.w - lw - 34;
    c.add(this.add.rectangle(dx - 8, f.y + 28, 1, f.h - 50, COL.mist).setOrigin(0));
    c.add(txt(this, dx, f.y + 30, tr(q.def.title), COL.ink));
    const kind = q.def.kind === 'main' ? loc('Main quest', 'Main quest') : loc('Side quest', 'Side quest');
    const giver = q.def.giver && SPEAKERS[q.def.giver] ? ` · ${tr(SPEAKERS[q.def.giver]!.name)}` : '';
    c.add(txt(this, dx, f.y + 44, tr(kind) + giver, q.def.kind === 'main' ? COL.red : COL.blue));
    let y = f.y + 62;
    const sum = wrap(this, tr(q.def.summary), dw);
    c.add(txt(this, dx, y, sum.join('\n'), COL.ink2));
    y += sum.length * LINE_H + 10;
    const st = session.state.quests[q.def.id]!;
    q.def.steps.forEach((s, i) => {
      if (i > st.step) return;
      const done = i < st.step || st.done;
      const cur = !done ? currentStep(session.state, q.def.id) : null;
      const lines = wrap(this, (done ? '* ' : '> ') + tr(s.text) + (cur ? cur.progress : ''), dw);
      c.add(txt(this, dx, y, lines.join('\n'), done ? COL.stone : COL.blue1));
      y += lines.length * LINE_H + 4;
    });
    if (q.done) c.add(txt(this, dx, y + 4, tr(loc('Complete!', 'Mudinjadhu!')), COL.red));
  }

  private drawBag(): void {
    const c = this.layer!;
    const f = this.frame(loc('Bag', 'Bag'), loc('X: back', 'X: pinnaadi'));
    const items = this.items();
    if (!items.length) { c.add(txt(this, f.x + 16, f.y + 34, tr(loc('Nothing in the bag yet.', 'Bag-la innum onnum illa.')), COL.slate)); return; }
    items.forEach((it, i) => {
      const iy = f.y + 30 + i * 18;
      if (this.nav.i === i) c.add(this.add.rectangle(f.x + 8, iy - 3, 220, 16, COL.podHi).setOrigin(0));
      c.add(txt(this, f.x + 16, iy, tr(it.def.name), COL.ink));
      c.add(txt(this, f.x + 222, iy, `x${it.n}`, COL.slate).setOrigin(1, 0));
      c.add(this.nav.hit(this, i, f.x + 8, iy - 3, 220, 16));
    });
    const sel = items[this.nav.i];
    if (sel) {
      const dy = f.y + f.h - 62;
      c.add(win(this, f.x + 8, dy, f.w - 16, 40, 'win_ink'));
      c.add(txt(this, f.x + 18, dy + 9, wrap(this, tr(sel.def.desc), f.w - 40).slice(0, 2).join('\n'), COL.paper, COL.ink));
    }
  }

  private drawParty(): void {
    const c = this.layer!;
    const f = this.frame(loc('Ragul', 'Ragul'), loc('X: back', 'X: pinnaadi'));
    const st = session.state;
    const m = st.members.ragul!;
    const s = memberStats(st, 'ragul');
    c.add(this.add.rectangle(f.x + 16, f.y + 30, 52, 52, COL.ink2).setOrigin(0));
    c.add(this.add.rectangle(f.x + 18, f.y + 32, 48, 48, COL.sky).setOrigin(0));
    c.add(this.add.image(f.x + 18, f.y + 32, 'portrait-ragul').setOrigin(0));
    const x = f.x + 80;
    c.add(txt(this, x, f.y + 32, `${tr(CHARACTERS.ragul.name)}   Lv ${m.level}`, COL.ink));
    const bar = (y: number, label: string, v: number, max: number, col: number) => {
      c.add(txt(this, x, y, label, COL.slate));
      c.add(this.add.rectangle(x + 30, y + 1, 120, 7, COL.ink2).setOrigin(0));
      c.add(this.add.rectangle(x + 31, y + 2, Math.round(118 * Math.min(1, v / max)), 5, col).setOrigin(0));
      c.add(txt(this, x + 156, y, `${v}/${max}`, COL.ink));
    };
    bar(f.y + 48, 'HP', m.hp, s.maxHp, 0x5fbf6a);
    bar(f.y + 60, 'XP', m.xp, xpToNext(m.level), COL.blue);
    const rows: [Loc, number][] = [[loc('Attack', 'Thaakkudhal'), s.atk], [loc('Defence', 'Thadupu'), s.def], [loc('Speed', 'Vegam'), s.spd]];
    rows.forEach(([l, v], i) => {
      c.add(txt(this, f.x + 20, f.y + 96 + i * 14, tr(l), COL.slate));
      c.add(txt(this, f.x + 110, f.y + 96 + i * 14, String(v), COL.ink));
    });
    const note = loc(
      'Second-year IT student at MIT, Chromepet. Writes stories at night. Gets headaches that no doctor can explain.',
      'MIT Chromepet-la IT second year. Raathiri kadha ezhudhuvaan. Endha doctor-um vilakka mudiyaadha thala vali.',
    );
    c.add(txt(this, f.x + 20, f.y + 140, wrap(this, tr(note), f.w - 40).join('\n'), COL.ink2));
  }

  private drawSave(): void {
    const c = this.layer!;
    const f = this.frame(loc('Save', 'Save'), loc('Z: save here   X: back', 'Z: inga save   X: pinnaadi'));
    for (let i = 0; i < SLOT_COUNT; i++) {
      const iy = f.y + 32 + i * 44;
      const meta = saves.meta(i + 1);
      const sel = this.nav.i === i;
      c.add(win(this, f.x + 16, iy, f.w - 32, 38, sel ? 'win_paper' : 'win_ink'));
      const col = sel ? COL.ink : COL.paper;
      const sh = sel ? COL.mist : COL.ink;
      c.add(txt(this, f.x + 28, iy + 8, `${tr(loc('Slot', 'Slot'))} ${i + 1}`, sel ? COL.red : COL.podHi, sh));
      c.add(txt(this, f.x + 28, iy + 21, meta ? `${meta.roomName}  ·  Lv ${meta.level}  ·  ${formatPlaytime(meta.playtimeMs)}` : tr(loc('Empty', 'Kaali')), col, sh));
      c.add(this.nav.hit(this, i, f.x + 16, iy, f.w - 32, 38));
    }
    if (this.message) c.add(txt(this, f.x + 16, f.y + f.h - 16, this.message, COL.blue1));
  }
}
