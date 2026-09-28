/** Pause menu: party and keepsakes, items, Memory Fragments (Kaviya's Pool), the area map, settings. */
import Phaser from 'phaser';
import { audio } from '../core/AudioSynth';
import { bus } from '../core/EventBus';
import { addItem, memberStats } from '../core/GameState';
import { input } from '../core/Input';
import { ensureTextures, spec } from '../core/Loader';
import { tr } from '../core/Localization';
import { formatPlaytime, session } from '../core/Session';
import { seenTips, tipBody } from '../core/Tips';
import { ABILITIES } from '../data/abilities';
import { CHARACTERS, xpToNext, type MemberId } from '../data/characters';
import { CLUES } from '../data/clues';
import { CODEX } from '../data/codex';
import { ITEMS } from '../data/items';
import { AREAS, ROOMS } from '../data/rooms';
import { MenuList, type MenuItem } from '../ui/MenuList';
import { addText, bar, C, drawPanel, H, W } from '../ui/theme';
import type { OverlayData } from './SettingsScene';
import { ensureEarthTextures } from '../world/EarthPainter';

const PX = 350, PY = 96, PW = 880, PH = 580;
type Section = 'party' | 'items' | 'codex' | 'case' | 'map' | 'guide' | 'settings' | 'title' | 'resume';

export class MenuScene extends Phaser.Scene {
  private left!: MenuList;
  private sub: MenuList | null = null;
  private content!: Phaser.GameObjects.Container;
  private data_: OverlayData = {};
  private section: Section = 'party';
  private artSeq = 0;

  constructor() { super({ key: 'Menu' }); }

  create(data: OverlayData) {
    this.data_ = data;
    this.sub = null;
    this.add.rectangle(0, 0, W, H, 0x03050a, 0.8).setOrigin(0);
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
    const sec = (id: Section, label: string): MenuItem => ({
      label: () => label, onFocus: () => this.show(id), onSelect: () => this.enter(id),
    });
    this.left = new MenuList(this, 50, PY + 20, [
      sec('party', 'Party'), sec('items', 'Items'), sec('codex', 'Memory Fragments'), sec('case', 'Case Board'), sec('map', 'Map'), sec('guide', 'Guide'),
      sec('settings', 'Settings'), sec('title', 'Quit to title'), sec('resume', 'Resume'),
    ], { width: 260, lineHeight: 48, size: 24, display: true, onCancel: () => this.close() });
    this.show('party');
    input.consume();
  }

  private close() {
    input.consume();
    this.data_.onClose?.();
    this.scene.stop();
  }

  private clear() {
    this.sub?.destroy();
    this.sub = null;
    this.content.removeAll(true);
  }

  private text(x: number, y: number, s: string, o: Parameters<typeof addText>[4] = {}) {
    const t = addText(this, x, y, s, o);
    this.content.add(t);
    return t;
  }

  private show(id: Section) {
    this.section = id;
    this.clear();
    switch (id) {
      case 'party': return this.drawParty();
      case 'items': return this.drawItems(false);
      case 'codex': return this.drawCodex(false);
      case 'map': return this.drawMap();
      case 'guide': return this.drawGuide(false);
      case 'case': return this.drawCase(false);
      case 'settings': this.text(PX + 30, PY + 30, 'Language, text speed, volume, accessibility and controls.', { color: C.textDim }); return;
      case 'title': this.text(PX + 30, PY + 30, 'Return to the title screen.\nAnything since you last rested or saved is lost.', { color: C.textDim, lineSpacing: 6 }); return;
      case 'resume': this.text(PX + 30, PY + 30, 'Back to the game.', { color: C.textDim }); return;
    }
  }

  private enter(id: Section) {
    switch (id) {
      case 'party': return this.chooseMember();
      case 'items': return this.drawItems(true);
      case 'codex': return this.drawCodex(true);
      case 'guide': return this.drawGuide(true);
      case 'case': return this.drawCase(true);
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

  private subMenu(x: number, y: number, w: number, items: MenuItem[], rows = 8, lineHeight = 42) {
    this.left.active = false;
    this.sub?.destroy();
    this.sub = new MenuList(this, x, y, items, {
      width: w, lineHeight, size: 21, rows, onCancel: () => { this.left.active = true; this.show(this.section); },
    });
    this.content.add(this.sub.container);
    input.consume();
  }

  // ------------------------------------------------------------------ party
  private drawParty(focus?: MemberId) {
    const st = session.state;
    st.party.forEach((id, i) => {
      const m = st.members[id]!;
      const c = CHARACTERS[id];
      const s = memberStats(st, id);
      const y = PY + 24 + i * 132;
      const g = this.add.graphics();
      this.content.add(g);
      if (focus === id) g.lineStyle(2, C.accentInt, 0.8).strokeRoundedRect(PX + 16, y - 8, PW - 32, 122, 10);
      if (this.textures.exists(`portrait:gen:${id}`)) this.content.add(this.add.image(PX + 70, y + 52, `portrait:gen:${id}`).setDisplaySize(100, 100));
      g.lineStyle(2, c.vein, 0.7).strokeRoundedRect(PX + 20, y + 2, 100, 100, 8);
      this.text(PX + 140, y, tr(c.name), { size: 26, display: true, bold: true });
      this.text(PX + 300, y + 6, `Level ${m.level}`, { size: 18, color: C.accent });
      bar(g, PX + 140, y + 42, 220, 9, m.hp / s.maxHp, C.hp);
      this.text(PX + 370, y + 36, `HP ${m.hp} / ${s.maxHp}`, { size: 16, color: C.textDim });
      bar(g, PX + 140, y + 62, 220, 6, m.xp / xpToNext(m.level), 0x9cc9ff);
      this.text(PX + 370, y + 55, `XP ${m.xp} / ${xpToNext(m.level)}`, { size: 16, color: C.textDim });
      this.text(PX + 140, y + 78, `ATK ${s.atk}    DEF ${s.def}    SPD ${s.spd}`, { size: 17 });
      const k = m.keepsake ? ITEMS[m.keepsake] : null;
      this.text(PX + 560, y + 6, 'Keepsake', { size: 15, color: C.textFaint });
      this.text(PX + 560, y + 28, k ? tr(k.name) : 'None', { size: 19, color: k ? C.warm : C.textDim, wordWrap: { width: 290 } });
      if (id === 'ragul') this.text(PX + 560, y + 78, `Soul Hunger ${st.soulHunger}  ·  souls taken ${st.soulsAbsorbed}`, { size: 15, color: '#b9a4ff' });
      if (id === 'dhanasree') this.text(PX + 560, y + 78, `Handgun: ${st.ammo} / 6 shots`, { size: 15, color: C.warm });
    });
    const ab = st.abilities.map((a) => tr(ABILITIES[a]?.name ?? { en: a, ta: a })).join('   ·   ');
    this.text(PX + 24, PY + PH - 44, `Abilities: ${ab || 'none'}`, { size: 17, color: C.textDim });
  }

  private chooseMember() {
    const st = session.state;
    const keepsakes = Object.keys(st.inventory).filter((id) => ITEMS[id]?.kind === 'keepsake');
    if (!keepsakes.length) {
      audio.sfx('ui_back');
      this.text(PX + 24, PY + PH - 74, 'No keepsakes to equip yet.', { size: 17, color: C.warm });
      return;
    }
    this.clear();
    this.drawParty();
    this.subMenu(PX + 600, PY + PH - 170, 260, st.party.map((id) => ({
      label: () => `Equip ${tr(CHARACTERS[id].name)}`,
      onFocus: () => { this.content.removeAll(true); this.drawParty(id); if (this.sub) this.content.add(this.sub.container); },
      onSelect: () => this.chooseKeepsake(id, keepsakes),
    })), 4);
  }

  private chooseKeepsake(id: MemberId, keepsakes: string[]) {
    const st = session.state;
    const items: MenuItem[] = keepsakes.map((k) => ({
      label: () => tr(ITEMS[k]!.name),
      hint: () => tr(ITEMS[k]!.desc),
      onSelect: () => {
        for (const m of Object.values(st.members)) if (m && m.keepsake === k) m.keepsake = null;
        const m = st.members[id]!;
        const before = memberStats(st, id).maxHp;
        m.keepsake = k;
        m.hp = Math.max(1, Math.min(memberStats(st, id).maxHp, m.hp + (memberStats(st, id).maxHp - before)));
        audio.sfx('ability');
        bus.emit('hud', undefined);
        this.left.active = true;
        this.show('party');
      },
    }));
    items.push({ label: () => 'Remove', onSelect: () => {
      const m = st.members[id]!;
      m.keepsake = null;
      m.hp = Math.min(m.hp, memberStats(st, id).maxHp);
      bus.emit('hud', undefined);
      this.left.active = true;
      this.show('party');
    } });
    this.subMenu(PX + 560, PY + PH - 190, 300, items, 4);
  }

  // ------------------------------------------------------------------ items
  private drawItems(active: boolean) {
    const st = session.state;
    this.text(PX + 24, PY + 18, `RI shards: ${st.riShards}`, { size: 18, color: C.accent });
    const ids = Object.keys(st.inventory).filter((i) => ITEMS[i]);
    if (!ids.length) { this.text(PX + 24, PY + 60, 'Nothing yet.', { color: C.textDim }); return; }
    const desc = this.text(PX + 470, PY + 320, '', { size: 19, wordWrap: { width: 380 }, lineSpacing: 4 });
    const icon = this.add.image(PX + 660, PY + 190, '__DEFAULT').setVisible(false);
    this.content.add(icon);
    const focus = (id: string) => {
      const it = ITEMS[id]!;
      desc.setText(`${tr(it.name)}\n\n${tr(it.desc)}${it.kind === 'keepsake' ? '\n\nEquip it from Party.' : ''}`);
      const key = `icon:${it.icon}`;
      if (this.textures.exists(key)) icon.setTexture(key).setDisplaySize(180, 180).setVisible(true);
      else icon.setVisible(false);
    };
    const kinds: Record<string, string> = { consumable: 'Use', keepsake: 'Keepsake', key: 'Key item', material: 'Material' };
    const items: MenuItem[] = ids.map((id) => ({
      label: () => `${tr(ITEMS[id]!.name)}`,
      value: () => `${kinds[ITEMS[id]!.kind]}  ×${st.inventory[id]}`,
      onFocus: () => focus(id),
      disabled: () => !active,
      onSelect: () => { if (ITEMS[id]!.kind === 'consumable') this.useOn(id); else audio.sfx('ui_back'); },
    }));
    focus(ids[0]!);
    if (active) this.subMenu(PX + 16, PY + 56, 430, items, 11);
    else {
      const list = new MenuList(this, PX + 16, PY + 56, items.map((i) => ({ ...i, disabled: undefined })), { width: 430, lineHeight: 42, size: 21, rows: 11 });
      list.active = false;
      this.content.add(list.container);
    }
  }

  private useOn(itemId: string) {
    const st = session.state;
    const it = ITEMS[itemId]!;
    this.subMenu(PX + 470, PY + 56, 380, st.party.map((id) => ({
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
        this.left.active = true;
        this.show('items');
      },
    })), 4);
  }

  // ------------------------------------------------------------------ codex
  private drawCodex(active: boolean) {
    const st = session.state;
    this.text(PX + 24, PY + 16, 'Kaviya\'s Pool', { size: 24, display: true, bold: true, color: C.accent });
    const ids = st.codex.filter((c) => CODEX[c]);
    this.text(PX + PW - 24, PY + 22, `${ids.length} / ${Object.keys(CODEX).length} fragments`, { size: 16, color: C.textDim }).setOrigin(1, 0);
    if (!ids.length) { this.text(PX + 24, PY + 70, 'No memories gathered yet.', { color: C.textDim }); return; }
    const art = this.add.image(PX + 650, PY + 200, '__DEFAULT').setVisible(false);
    this.content.add(art);
    const body = this.text(PX + 440, PY + 350, '', { size: 18, wordWrap: { width: 420 }, lineSpacing: 5 });
    const focus = (id: string) => {
      const e = CODEX[id]!;
      body.setText(tr(e.text));
      const seq = ++this.artSeq;
      if (e.art.startsWith('gen:')) {
        ensureEarthTextures(this, e.art);
        art.setTexture(`bg:${e.art}`).setVisible(true);
        art.setScale(Math.min(400 / art.width, 280 / art.height));
        return;
      }
      const s = spec('art', e.art) ?? spec('bg', e.art);
      if (!s) { art.setVisible(false); return; }
      void ensureTextures(this, [s]).then(() => {
        if (seq !== this.artSeq || !art.active) return;
        art.setTexture(s.key).setVisible(true);
        const k = Math.min(400 / art.width, 280 / art.height);
        art.setScale(k);
      });
    };
    const items: MenuItem[] = ids.map((id) => ({ label: () => tr(CODEX[id]!.title), onFocus: () => focus(id) }));
    focus(ids[0]!);
    const list = new MenuList(this, PX + 16, PY + 60, items, { width: 400, lineHeight: 42, size: 21, rows: 11, onCancel: () => { this.left.active = true; this.show('codex'); } });
    list.active = active;
    this.content.add(list.container);
    if (active) { this.left.active = false; this.sub = list; input.consume(); }
  }

  // ------------------------------------------------------------------ guide
  private drawGuide(active: boolean) {
    this.text(PX + 24, PY + 16, 'Guide', { size: 24, display: true, bold: true, color: C.accent });
    const tips = seenTips();
    if (!tips.length) { this.text(PX + 24, PY + 70, 'Tips you come across are kept here.', { color: C.textDim }); return; }
    const body = this.text(PX + 450, PY + 70, '', { size: 19, wordWrap: { width: 400 }, lineSpacing: 5 });
    const head = this.text(PX + 450, PY + 30, '', { size: 22, display: true, bold: true, color: C.warm });
    const focus = (i: number) => { const t = tips[i]!; head.setText(tr(t.title)); body.setText(tipBody(t)); };
    const items: MenuItem[] = tips.map((t, i) => ({ label: () => `${tr(t.title)}${t.kind === 'battle' ? '  ·  battle' : ''}`, onFocus: () => focus(i) }));
    focus(0);
    const list = new MenuList(this, PX + 16, PY + 60, items, { width: 410, lineHeight: 40, size: 20, rows: 12, onCancel: () => { this.left.active = true; this.show('guide'); } });
    list.active = active;
    this.content.add(list.container);
    if (active) { this.left.active = false; this.sub = list; input.consume(); }
  }

  // ------------------------------------------------------------------ case board
  /** Clues about the deaths, pinned like cards. After Venture 8 each card shows what really happened. */
  private drawCase(active: boolean) {
    const st = session.state;
    this.text(PX + 24, PY + 16, 'Case Board', { size: 24, display: true, bold: true, color: C.accent });
    const clues = st.clues.map((id) => CLUES[id]).filter((c): c is NonNullable<typeof c> => !!c);
    if (!clues.length) { this.text(PX + 24, PY + 70, 'Nothing pinned yet. Clues about the deaths will gather here.', { color: C.textDim }); return; }
    const truth = !!st.flags.truth_known;
    const g = this.add.graphics();
    this.content.add(g);
    const head = this.text(PX + 450, PY + 34, '', { size: 22, display: true, bold: true, color: C.warm, wordWrap: { width: 400 } });
    const body = this.text(PX + 450, PY + 80, '', { size: 19, wordWrap: { width: 400 }, lineSpacing: 5 });
    const focus = (i: number) => {
      const c = clues[i]!;
      head.setText(tr(c.title));
      body.setY(PY + 44 + head.height);
      body.setText(truth && c.truth ? `${tr(c.body)}\n\n${tr(c.truth)}` : tr(c.body));
      body.setColor(truth && c.truth ? '#ffd0d0' : C.text);
      g.clear();
      g.fillStyle(0x2a2016, 0.9).fillRoundedRect(PX + 436, PY + 22, 424, Math.min(PH - 44, body.height + head.height + 60), 8);
      g.lineStyle(2, truth && c.truth ? C.dangerInt : C.warmInt, 0.6).strokeRoundedRect(PX + 436, PY + 22, 424, Math.min(PH - 44, body.height + head.height + 60), 8);
      g.fillStyle(0xd84040, 1).fillCircle(PX + 648, PY + 22, 6);
    };
    const items: MenuItem[] = clues.map((c, i) => ({ label: () => tr(c.title), onFocus: () => focus(i) }));
    focus(0);
    const list = new MenuList(this, PX + 16, PY + 60, items, { width: 410, lineHeight: 40, size: 20, rows: 12, onCancel: () => { this.left.active = true; this.show('case'); } });
    list.active = active;
    this.content.add(list.container);
    if (active) { this.left.active = false; this.sub = list; input.consume(); }
  }

  // ------------------------------------------------------------------ map
  private drawMap() {
    const st = session.state;
    const room = ROOMS[st.location.room];
    const area = room ? AREAS[room.area] : undefined;
    if (!room || !area) return;
    this.text(PX + 24, PY + 16, tr(area.name), { size: 24, display: true, bold: true, color: C.accent });
    const rooms = area.rooms.map((r) => ROOMS[r]!).filter(Boolean);
    const maxX = Math.max(...rooms.map((r) => r.mapPos.x + r.mapPos.w));
    const maxY = Math.max(...rooms.map((r) => r.mapPos.y + r.mapPos.h));
    const cell = Math.min((PW - 100) / maxX, (PH - 160) / (maxY + 1));
    const ox = PX + 50, oy = PY + 90;
    const g = this.add.graphics();
    this.content.add(g);
    for (const r of rooms) {
      const seen = st.visitedRooms.includes(r.id);
      const x = ox + r.mapPos.x * cell, y = oy + r.mapPos.y * cell, w = r.mapPos.w * cell - 6, h = r.mapPos.h * cell - 6;
      g.fillStyle(seen ? 0x1a2a44 : 0x0e1522, 1).fillRoundedRect(x, y, w, h, 8);
      g.lineStyle(2, r.id === room.id ? C.warmInt : 0x9cc9ff, seen ? 0.8 : 0.2).strokeRoundedRect(x, y, w, h, 8);
      this.text(x + w / 2, y + h / 2, seen ? tr(r.name) : '?', { size: 18, color: seen ? C.text : C.textFaint }).setOrigin(0.5);
      if (r.id === room.id) {
        const px = x + (st.location.x / (r.cols * 40)) * w, py = y + (st.location.y / (r.rows * 40)) * h;
        g.fillStyle(C.warmInt, 1).fillCircle(Phaser.Math.Clamp(px, x + 8, x + w - 8), Phaser.Math.Clamp(py, y + 8, y + h - 8), 6);
      }
    }
    this.text(PX + 24, PY + PH - 44, 'Gold marks where you are. Rooms you have not visited are unnamed.', { size: 16, color: C.textDim });
  }

  // ------------------------------------------------------------------ quit
  private confirmQuit() {
    this.clear();
    this.text(PX + 30, PY + 30, 'Quit to the title screen?\nAnything since your last rest will be lost.', { size: 22, lineSpacing: 6 });
    this.subMenu(PX + 30, PY + 110, 320, [
      { label: () => 'No, keep playing', onSelect: () => { this.left.active = true; this.show('title'); } },
      { label: () => 'Yes, quit', onSelect: () => {
        audio.music('none');
        this.scene.stop('Hud');
        this.scene.stop('Dialogue');
        this.scene.stop('World');
        this.scene.start('Title');
      } },
    ], 2);
  }

  override update(time: number) {
    if (this.scene.isActive('Settings')) return;
    if (this.sub) { this.sub.update(time); return; }
    if (input.pressed('menu')) { this.close(); return; }
    this.left.update(time);
  }
}
