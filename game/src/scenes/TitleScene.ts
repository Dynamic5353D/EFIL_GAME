import Phaser from 'phaser';
import { audio } from '../core/AudioSynth';
import { input } from '../core/Input';
import { texKey } from '../core/Assets';
import { saves, SLOT_COUNT, type SaveMeta } from '../core/SaveSystem';
import { formatPlaytime, session } from '../core/Session';
import { settings } from '../core/Settings';
import { tr } from '../core/Localization';
import { newGameAt } from '../core/GameState';
import { CHAPTERS, type Chapter } from '../data/chapters';
import { ROOMS } from '../data/rooms';
import { MenuList, type MenuItem } from '../ui/MenuList';
import { addText, C, drawPanel, H, W } from '../ui/theme';

/** Shown once per launch before the title menu (plan.md, "Player care"). */
export const CONTENT_NOTICE = [
  'EFIL is a story for players aged 16 and over.',
  '',
  'It contains violence and death, grief and trauma, strong language, and suicidal thoughts. Abuse is referred to but never shown. Content notes appear before difficult chapters; you can turn them off in Settings.',
  '',
  'If you are struggling, you are not alone. In India, call Tele-MANAS on 14416 (free, any time).',
].join('\n');

let noticeShown = false;

export function slotLabel(slot: number, m: SaveMeta | null): string {
  if (!m) return `Slot ${slot}  ·  empty`;
  const room = ROOMS[m.roomName]?.name ?? { en: m.roomName, ta: m.roomName };
  return `Slot ${slot}  ·  P${m.venture.purpose} V${m.venture.venture}  ·  ${tr(room)}  ·  Lv ${m.level}  ·  ${formatPlaytime(m.playtimeMs)}`;
}

export class TitleScene extends Phaser.Scene {
  private menu: MenuList | null = null;
  private layer!: Phaser.GameObjects.Container;
  private hint!: Phaser.GameObjects.Text;

  constructor() { super({ key: 'Title' }); }

  create() {
    audio.music('title');
    const calm = settings.get('reducedMotion');
    const far = this.add.image(W / 2, H / 2, texKey.far('frozen_pond'));
    far.setScale(Math.max(W / far.width, H / far.height) * 1.1);
    const bg = this.add.image(W / 2, H / 2 + 40, texKey.bg('frozen_pond')).setAlpha(0.9);
    const k = Math.max(W / bg.width, H / bg.height) * 1.12;
    bg.setScale(k);
    if (!calm) this.tweens.add({ targets: bg, scale: k * 1.05, x: W / 2 - 24, duration: 30000, yoyo: true, repeat: -1, ease: 'Sine.InOut' });
    this.add.rectangle(0, 0, W, H, 0x050810, 0.45).setOrigin(0);
    const shade = this.add.graphics();
    shade.fillGradientStyle(0x050810, 0x050810, 0x050810, 0x050810, 0, 0, 0.9, 0.9);
    shade.fillRect(0, H * 0.45, W, H * 0.55);
    this.add.particles(0, 0, 'fx:flake', {
      x: { min: -100, max: W + 100 }, y: -20, lifespan: 9000, speedY: { min: 30, max: 70 }, speedX: { min: -20, max: 10 },
      scale: { min: 0.15, max: 0.45 }, alpha: { start: 0.8, end: 0.1 }, rotate: { min: 0, max: 360 }, frequency: calm ? 400 : 90,
    });

    const title = addText(this, W / 2, 170, 'EFIL', { size: 150, display: true, bold: true, letterSpacing: 24 }).setOrigin(0.5);
    title.setShadow(0, 0, '#7fd4ff', 28, false, true);
    addText(this, W / 2, 262, 'THE GAME', { size: 20, color: C.textDim, letterSpacing: 14 }).setOrigin(0.5);
    if (!calm) this.tweens.add({ targets: title, alpha: 0.82, duration: 2600, yoyo: true, repeat: -1, ease: 'Sine.InOut' });

    this.layer = this.add.container(0, 0);
    this.hint = addText(this, W / 2, H - 34, '', { size: 16, color: C.textFaint }).setOrigin(0.5);
    this.add.text(W - 16, H - 16, 'Act I review build', { fontSize: '12px', color: '#5d6f88' }).setOrigin(1);

    const unlock = () => audio.unlock();
    this.input.once('pointerdown', unlock);
    input.onAnyKey(unlock);

    if (!noticeShown) this.showNotice();
    else this.showMain();
  }

  private clear() {
    this.menu?.destroy();
    this.menu = null;
    this.layer.removeAll(true);
  }

  private showNotice() {
    this.clear();
    const g = this.add.graphics();
    drawPanel(g, W / 2 - 400, 300, 800, 330, 0.94, 14);
    const t1 = addText(this, W / 2, 330, 'Before you begin', { size: 30, display: true, bold: true, color: C.warm }).setOrigin(0.5, 0);
    const t2 = addText(this, W / 2, 378, CONTENT_NOTICE, { size: 20, align: 'center', wordWrap: { width: 720 }, lineSpacing: 4 }).setOrigin(0.5, 0);
    this.layer.add([g, t1, t2]);
    this.hint.setText(`${input.label('confirm')}  Continue`);
    const go = () => {
      noticeShown = true;
      audio.unlock();
      audio.sfx('ui_ok');
      this.showMain();
    };
    this.menu = new MenuList(this, W / 2 - 100, 575, [{ label: () => 'I understand', onSelect: go }], { width: 200, align: 'center', size: 22, lineHeight: 40 });
    this.layer.add(this.menu.container);
  }

  private showMain() {
    this.clear();
    const latest = saves.latest();
    const items: MenuItem[] = [];
    if (latest) items.push({ label: () => 'Continue', hint: () => slotLabel(latest.slot, latest), onSelect: () => this.loadGame(latest.slot) });
    items.push({ label: () => 'New game', hint: () => 'Act I: The world is cruel', onSelect: () => this.showSlots('new') });
    items.push({ label: () => 'Load game', disabled: () => !saves.list().some(Boolean), onSelect: () => this.showSlots('load') });
    items.push({ label: () => 'Chapters', hint: () => 'Start from any Venture of Act I, or the Glacia engine test', onSelect: () => this.showChapters() });
    items.push({ label: () => 'Settings', onSelect: () => this.openOverlay('Settings') });
    items.push({ label: () => 'Credits', onSelect: () => this.openOverlay('Credits') });
    this.menu = new MenuList(this, W / 2 - 150, 350, items, { width: 300, align: 'center', size: 28, display: true, lineHeight: 50 });
    this.layer.add(this.menu.container);
    this.hint.setText(`↑↓  Choose    ${input.label('confirm')}  Select    ${input.label('language')}  Language: ${settings.get('language') === 'ta' ? 'Tanglish' : 'English'}`);
  }

  /** Every Venture of Act I (all unlocked in this review build), plus the M1 Glacia test slice. */
  private showChapters() {
    this.clear();
    const g = this.add.graphics();
    drawPanel(g, W / 2 - 380, 300, 760, 390, 0.92, 12);
    const head = addText(this, W / 2, 312, 'Chapters', { size: 22, color: C.textDim }).setOrigin(0.5, 0);
    this.layer.add([g, head]);
    const items: MenuItem[] = CHAPTERS.map((c) => ({
      label: () => `Venture ${c.venture}  ·  ${tr(c.title)}`,
      onSelect: () => this.showSlots('new', c),
    }));
    items.push({ label: () => 'Glacia engine test (M1)', onSelect: () => this.showSlots('new', 'slice') });
    items.push({ label: () => 'Back', onSelect: () => this.showMain() });
    this.menu = new MenuList(this, W / 2 - 360, 350, items, { width: 720, size: 21, lineHeight: 40, rows: 8, onCancel: () => this.showMain() });
    this.layer.add(this.menu.container);
    this.hint.setText(`${input.label('confirm')}  Select    ${input.label('cancel')}  Back`);
  }

  private showSlots(mode: 'new' | 'load', start: Chapter | 'slice' | null = null) {
    this.clear();
    const g = this.add.graphics();
    drawPanel(g, W / 2 - 380, 320, 760, 240, 0.92, 12);
    const head = addText(this, W / 2, 334, mode === 'new' ? 'Choose a slot for the new game' : 'Load which game?', { size: 22, color: C.textDim }).setOrigin(0.5, 0);
    this.layer.add([g, head]);
    const list = saves.list();
    const items: MenuItem[] = [];
    for (let i = 1; i <= SLOT_COUNT; i++) {
      const m = list[i - 1] ?? null;
      items.push({
        label: () => slotLabel(i, m),
        disabled: () => mode === 'load' && !m,
        onSelect: () => (mode === 'load' ? this.loadGame(i) : m ? this.confirmOverwrite(i, start) : this.startNew(i, start)),
      });
    }
    items.push({ label: () => 'Back', onSelect: () => this.showMain() });
    this.menu = new MenuList(this, W / 2 - 360, 376, items, { width: 720, size: 21, lineHeight: 42, onCancel: () => this.showMain() });
    this.layer.add(this.menu.container);
    this.hint.setText(`${input.label('confirm')}  Select    ${input.label('cancel')}  Back`);
  }

  private confirmOverwrite(slot: number, start: Chapter | 'slice' | null) {
    this.clear();
    const t = addText(this, W / 2, 360, `Slot ${slot} already has a game. Start over in it?`, { size: 24 }).setOrigin(0.5);
    this.layer.add(t);
    this.menu = new MenuList(this, W / 2 - 150, 400, [
      { label: () => 'No, go back', onSelect: () => this.showSlots('new', start) },
      { label: () => 'Yes, overwrite it', onSelect: () => this.startNew(slot, start) },
    ], { width: 300, align: 'center', size: 24, onCancel: () => this.showSlots('new', start) });
    this.layer.add(this.menu.container);
  }

  /** A new game starts at Act I, Venture 1, unless a chapter (or the Glacia test slice) was picked. */
  private startNew(slot: number, start: Chapter | 'slice' | null = null) {
    if (start === 'slice') session.startNew(slot);
    else {
      const c = start ?? CHAPTERS[0]!;
      session.startWith(slot, newGameAt(c.room, c.script, { purpose: c.purpose, venture: c.venture }));
    }
    this.enterWorld();
  }

  private loadGame(slot: number) {
    if (!session.loadSlot(slot)) {
      audio.sfx('ui_back');
      return;
    }
    this.enterWorld();
  }

  private enterWorld() {
    audio.unlock();
    this.menu && (this.menu.active = false);
    this.cameras.main.fadeOut(settings.get('reducedMotion') ? 150 : 600, 0, 0, 0);
    this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => this.scene.start('World', { resume: true }));
  }

  private openOverlay(key: 'Settings' | 'Credits') {
    if (this.menu) this.menu.active = false;
    this.scene.launch(key, { onClose: () => { if (this.menu) this.menu.active = true; this.showMain(); } });
    this.scene.bringToTop(key);
  }

  override update(time: number) {
    if (this.scene.isActive('Settings') || this.scene.isActive('Credits')) return;
    if (input.pressed('language')) {
      settings.set('language', settings.get('language') === 'en' ? 'ta' : 'en');
      audio.sfx('ui_move');
      if (noticeShown) this.showMain();
    }
    this.menu?.update(time);
  }
}
