/**
 * Side-view turn-based battle on the current area's painted backdrop (plan.md, "Turn-based battles").
 * The rules live in BattleCore; this scene only asks for commands and animates the events it returns.
 */
import Phaser from 'phaser';
import {
  act, advance, alive, attackSkillOf, battleResult, createBattle, has, previewTimeline, skillUsable, unit, validTargets,
} from '../battle/BattleCore';
import { SKILLS, type SkillDef } from '../battle/skills';
import type { BattleEvent, BattleState, Element, StatusId, Unit } from '../battle/types';
import { texKey } from '../core/Assets';
import { audio } from '../core/AudioSynth';
import { bus } from '../core/EventBus';
import { addItem, grantXp, memberStats } from '../core/GameState';
import { input } from '../core/Input';
import { ensureTextures, spec } from '../core/Loader';
import { ensureEarthTextures } from '../world/EarthPainter';
import { ensureGenSprites } from '../world/GenSprites';
import { tr } from '../core/Localization';
import { takeTip, tipBody } from '../core/Tips';
import { session } from '../core/Session';
import { settings } from '../core/Settings';
import { CHARACTERS, type MemberId } from '../data/characters';
import { BATTLES, ENEMIES } from '../data/enemies';
import { ITEMS } from '../data/items';
import type { MusicId, SfxId } from '../data/media';
import { MenuList, type MenuItem } from '../ui/MenuList';
import { addText, bar, C, drawGlowPanel, glow, H, W } from '../ui/theme';
import { CharacterRig } from '../world/CharacterRig';
import { hexRgb, makeCanvas, mixRgb, rgbCss, scaleRgb } from '../world/Paint';
import { Puppet } from '../world/Puppet';
import type { RoomDef } from '../world/RoomDef';
import { addGrade } from '../world/RoomView';
import { assets } from '../core/Assets';

export interface BattleData {
  battle: string;
  initiative: 'party' | 'enemy' | null;
  backdrop: string;
  palette: string;
  grade: RoomDef['grade'];
  onDone: (r: 'won' | 'lost' | 'fled') => void;
}

interface View {
  id: string;
  side: 'party' | 'enemy';
  homeX: number;
  homeY: number;
  rig?: CharacterRig;
  puppet?: Puppet;
  x: number;
  y: number;
  /** Visual height, for placing popups and markers. */
  h: number;
  /** Nameplate above the head: name, HP bar, statuses (or the ink countdown). */
  plate: Phaser.GameObjects.Container;
  intent: Phaser.GameObjects.Text;
  shadow: Phaser.GameObjects.Ellipse;
  ring: Phaser.GameObjects.Ellipse;
  gone: boolean;
}

const PARTY_SLOTS = [{ x: 330, y: 496 }, { x: 200, y: 470 }, { x: 460, y: 462 }, { x: 90, y: 480 }];
const ENEMY_SLOTS = [{ x: 900, y: 500 }, { x: 1110, y: 488 }, { x: 1010, y: 432 }, { x: 780, y: 440 }];
const RIG_SCALE = 2.05;

const STATUS_LABEL: Record<StatusId, [string, string]> = {
  doom: ['DOOM', '#d7a8ff'], regen: ['REGEN', '#9cc8ff'], ink: ['INK', '#c9b8ff'], shadow: ['SHADOW', '#b8b8ff'],
  armored: ['ARMOUR', '#cfe3ff'], blind: ['BLIND', '#fff3a0'], fear: ['FEAR', '#ff9a9a'], foresight: ['FORESIGHT', '#8dffbd'],
  guard: ['GUARD', '#9fd8ff'], starving: ['STARVING', '#ff6a8a'],
};

const EL_COLOR: Record<Element, number> = {
  physical: 0xffffff, fire: 0xff8a3a, light: 0xfff6c8, shatter: 0x9ff0ff, water: 0x6ab8ff, soul: 0xc58bff, none: 0xffffff,
};

export class BattleScene extends Phaser.Scene {
  private st!: BattleState;
  private data_!: BattleData;
  private views = new Map<string, View>();
  private ui!: Phaser.GameObjects.Container;
  private statusG!: Phaser.GameObjects.Graphics;
  private statusTexts: Phaser.GameObjects.GameObject[] = [];
  private timeline!: Phaser.GameObjects.Container;
  private banner!: Phaser.GameObjects.Text;
  private info!: Phaser.GameObjects.Text;
  private menu: MenuList | null = null;
  private menuPanel: Phaser.GameObjects.Graphics | null = null;
  private cursor!: Phaser.GameObjects.Triangle;
  private targeting: { list: Unit[]; index: number; resolve: (id: string | null) => void } | null = null;
  private clock = 0;
  private calm = false;
  private goal!: Phaser.GameObjects.Container;

  constructor() { super({ key: 'Battle' }); }

  create(data: BattleData) {
    this.data_ = data;
    this.views = new Map();
    this.menu = null;
    this.targeting = null;
    this.statusTexts = [];
    this.calm = settings.get('reducedMotion');
    // Dev builds: `?fast` speeds battles up for automated play-throughs.
    const fast = import.meta.env.DEV && new URLSearchParams(location.search).has('fast') ? 6 : 1;
    this.time.timeScale = fast;
    this.tweens.timeScale = fast;
    const def = BATTLES[data.battle];
    if (!def) { data.onDone('won'); return; }
    const st = session.state;
    this.st = createBattle({
      def,
      party: st.party.map((id) => ({ id, stats: memberStats(st, id), hp: st.members[id]?.hp ?? 1 })),
      soulHunger: st.soulHunger,
      ammo: st.ammo,
      inventory: { ...st.inventory },
      seed: (Date.now() ^ (Math.random() * 1e9)) | 0,
      initiative: data.initiative,
    });
    audio.music((def.music as MusicId) ?? 'battle');
    const slugs = def.enemies.map((e) => ENEMIES[e]?.sprite.slug ?? 'vale');
    ensureEarthTextures(this, data.backdrop);
    ensureGenSprites(this, slugs);
    void ensureTextures(this, [spec('bg', data.backdrop), spec('far', data.backdrop), ...slugs.map((s) => spec('cut', s))]).then(() => {
      this.build();
      void this.run();
    });
  }

  // ------------------------------------------------------------------ layout
  private build() {
    const d = this.data_;
    const pal = assets.palette(d.palette);
    const far = this.add.image(W / 2, H / 2, texKey.far(d.backdrop));
    far.setScale(Math.max(W / far.width, H / far.height) * 1.05);
    const bg = this.add.image(W / 2, H * 0.42, texKey.bg(d.backdrop)).setAlpha(0.85);
    bg.setScale(Math.max(W / bg.width, (H * 0.9) / bg.height) * 1.05);
    // The room's grade goes on the painted backdrop only, so fighters and UI stay crisp.
    for (const img of [far, bg]) addGrade(img.enableFilters().filters!.internal, d.grade);
    if (!this.calm) this.tweens.add({ targets: bg, x: W / 2 - 20, duration: 16000, yoyo: true, repeat: -1, ease: 'Sine.InOut' });
    this.add.rectangle(0, 0, W, H, 0x04070d, 0.08).setOrigin(0);

    // Painted floor: palette gradient with a snowy lip, so units stand on something.
    const key = `battlefloor:${d.palette}`;
    if (!this.textures.exists(key)) {
      const { c, g } = makeCanvas(W, 320);
      const hi = hexRgb(pal.highlight), dom = hexRgb(pal.dominant), sh = hexRgb(pal.shadow);
      const gr = g.createLinearGradient(0, 0, 0, 320);
      gr.addColorStop(0, rgbCss(mixRgb(hi, [240, 248, 255], 0.4), 0));
      gr.addColorStop(0.18, rgbCss(mixRgb(hi, dom, 0.35), 0.9));
      gr.addColorStop(0.55, rgbCss(mixRgb(dom, sh, 0.6), 1));
      gr.addColorStop(1, rgbCss(scaleRgb(sh, 0.5), 1));
      g.fillStyle = gr;
      g.fillRect(0, 0, W, 320);
      for (let i = 0; i < 90; i++) {
        g.fillStyle = rgbCss([235, 245, 255], 0.05 + Math.random() * 0.12);
        g.beginPath(); g.ellipse(Math.random() * W, 40 + Math.random() * 120, 30 + Math.random() * 90, 3 + Math.random() * 5, 0, 0, Math.PI * 2); g.fill();
      }
      this.textures.addCanvas(key, c);
    }
    this.add.image(0, 380, key).setOrigin(0);
    this.add.particles(0, 0, 'fx:flake', {
      x: { min: -60, max: W + 60 }, y: -20, lifespan: 7000, speedY: { min: 40, max: 90 }, speedX: { min: -30, max: 10 },
      scale: { min: 0.15, max: 0.4 }, alpha: { start: 0.8, end: 0.2 }, frequency: this.calm ? 500 : 160,
    }).setDepth(900);
    // No vignette in battle: the whole field should be easy to read.

    // Units.
    let pi = 0, ei = 0;
    for (const u of this.st.units) {
      const slot = u.side === 'party' ? PARTY_SLOTS[pi++ % 4]! : ENEMY_SLOTS[ei++ % 4]!;
      const depth = slot.y;
      const shadow = this.add.ellipse(slot.x, slot.y + 4, u.side === 'party' ? 90 : 170, 18, 0x000000, 0.35).setDepth(depth - 2);
      const ring = this.add.ellipse(slot.x, slot.y + 4, u.side === 'party' ? 110 : 190, 26).setStrokeStyle(2, C.accentInt, 0.9).setDepth(depth - 1).setVisible(false);
      const v: View = {
        id: u.id, side: u.side, homeX: slot.x, homeY: slot.y, x: slot.x, y: slot.y, h: 180, shadow, ring, gone: false,
        plate: this.add.container(slot.x, 0).setDepth(800),
        intent: glow(addText(this, slot.x, 0, '', { size: 16, bold: true, color: C.good, backgroundColor: '#0b1220e0', padding: { x: 8, y: 4 } }), C.good, 6).setOrigin(0.5, 1).setDepth(801).setVisible(false),
      };
      if (u.side === 'party') {
        const rig = new CharacterRig(this, u.kind as MemberId, depth);
        rig.scale = RIG_SCALE;
        rig.facing = 1;
        rig.setState(u.dead ? 'ko' : 'battle');
        v.rig = rig;
        v.h = 92 * RIG_SCALE * CHARACTERS[u.kind as MemberId].build.height;
      } else {
        const def = ENEMIES[u.kind]!;
        const p = new Puppet(this, def.sprite.slug, slot.x, slot.y + 8, {
          height: def.sprite.height, sway: 12, ripple: 4, breathe: 0.025, speed: 1.1, eyes: def.sprite.eyes, depth, blend: def.sprite.blend,
        });
        p.flip = true; // the art faces right; enemies face the party
        v.puppet = p;
        v.h = def.sprite.height * 0.95;
      }
      v.plate.setY(slot.y - v.h - (u.side === 'party' ? 46 : 72));
      v.intent.setY(slot.y + 38);
      this.views.set(u.id, v);
    }

    // UI.
    this.ui = this.add.container(0, 0).setDepth(1000);
    this.statusG = this.add.graphics();
    this.ui.add(this.statusG);
    this.timeline = this.add.container(W / 2, 54);
    this.ui.add(this.timeline);
    this.banner = glow(addText(this, W / 2, 118, '', { size: 26, display: true, bold: true, color: '#ffffff', backgroundColor: '#070b14e8', padding: { x: 18, y: 7 } }), C.accent, 12).setOrigin(0.5).setAlpha(0);
    this.info = addText(this, 372, 556, '', { size: 18, color: '#dfe8f7', wordWrap: { width: 860 } }).setVisible(false);
    this.goal = this.add.container(0, 0);
    this.cursor = this.add.triangle(0, 0, 0, 0, 22, 0, 11, 16, C.warmInt).setVisible(false);
    this.ui.add([this.goal, this.banner, this.info, this.cursor]);
    this.refreshStatus();
    this.refreshTimeline();
  }

  // ------------------------------------------------------------------ main loop
  private async run() {
    const def = BATTLES[this.data_.battle]!;
    const ini = this.data_.initiative;
    await this.say(def.intro ? tr(def.intro) : 'Battle!', 1400);
    if (ini === 'party') await this.say('You strike first!', 900);
    if (ini === 'enemy') await this.say('Caught off guard!', 900);
    await this.tutorial('battle');
    // Ragul alone has no light, fire or shatter: teach Death Touch + Soul Absorb before the ink loop starts.
    const party = this.st.units.filter((u) => u.side === 'party');
    const canFinish = party.some((u) => u.skills.some((id) => ['light', 'fire', 'shatter', 'water'].includes(SKILLS[id]?.element ?? '')));
    if (!canFinish && this.st.units.some((u) => u.side === 'enemy' && u.tags.includes('vale'))) await this.tutorial('vale_ragul');
    const st = this.st;
    let guard = 0;
    while (!st.outcome && guard++ < 5000) {
      if (st.awaitingInput && st.active) {
        const u = unit(st, st.active)!;
        const cmd = await this.chooseCommand(u);
        if (!cmd) continue;
        const res = act(st, u.id, cmd.skill, cmd.target);
        if (!res.ok) { audio.sfx('ui_back'); await this.say(res.why ?? 'Can\'t do that', 900); continue; }
        await this.play();
        continue;
      }
      advance(st);
      await this.play();
    }
    await this.finish();
  }

  private async play() {
    const events = this.st.events.splice(0);
    for (const e of events) await this.animate(e);
    this.refreshStatus();
    this.refreshTimeline();
    this.refreshIntents();
  }

  // ------------------------------------------------------------------ commands
  private async chooseCommand(u: Unit): Promise<{ skill: string; target?: string } | null> {
    this.highlight(u.id);
    const v = this.views.get(u.id);
    v?.rig?.setState('battle');
    if (u.kind === 'dhanasree') await this.tutorial('cubes');
    for (;;) {
      const top = await this.pick<string>(this.commandItems(u), `${tr(u.name)}`);
      if (!top) continue;
      let skillId = top;
      if (top === 'skills') {
        const s = await this.pick<string>(this.skillItems(u), `${tr(u.name)} · Skills`, true);
        if (!s) continue;
        skillId = s;
      }
      const skill = SKILLS[skillId]!;
      if (skill.target === 'self' || skill.target === 'all_enemies' || skill.target === 'party') return { skill: skillId };
      const target = await this.pickTarget(validTargets(this.st, u, skill), skill);
      if (target) return { skill: skillId, target };
    }
  }

  private commandItems(u: Unit): MenuItem[] {
    const st = this.st;
    const atk = attackSkillOf(u);
    const cmd = (label: string, id: string, extra: Partial<MenuItem> = {}): MenuItem => ({
      label: () => label, disabled: () => !skillUsable(st, u, id).ok, hint: () => tr(SKILLS[id]!.desc), ...extra,
    });
    const rosoar = st.inventory.red_rosoar ?? 0;
    const items: MenuItem[] = [cmd(`Attack · ${tr(SKILLS[atk]!.name)}`, atk)];
    if (u.skills.length > 1) items.push({ label: () => 'Skills', hint: () => 'Special moves.' });
    items.push(cmd('Defend', 'defend'), cmd(`${tr(ITEMS.red_rosoar!.name)}  ×${rosoar}`, 'item'), cmd('Run', 'flee'));
    const ids = [atk, ...(u.skills.length > 1 ? ['skills'] : []), 'defend', 'item', 'flee'];
    items.forEach((it, i) => { (it as MenuItem & { id?: string }).id = ids[i]; });
    return items;
  }

  private skillItems(u: Unit): MenuItem[] {
    return u.skills.slice(1).map((id) => {
      const s = SKILLS[id]!;
      const ok = skillUsable(this.st, u, id);
      const item: MenuItem & { id?: string } = {
        label: () => tr(s.name),
        value: () => this.costLabel(s),
        disabled: () => !ok.ok,
        hint: () => tr(s.desc) + (ok.ok ? '' : `  (${ok.why})`),
      };
      item.id = id;
      return item;
    });
  }

  private costLabel(s: SkillDef): string {
    const c = s.cost ?? {};
    if (c.ce) return `${c.ce} CE`;
    if (c.ammo) return `${c.ammo} shot`;
    if (c.heat) return `${c.heat} heat`;
    return s.free ? 'free' : s.oncePerBattle ? 'once' : '';
  }

  /** Shows a command list; resolves with the chosen item's id, or null on cancel (only if `back`). */
  private pick<T extends string>(items: MenuItem[], title: string, back = false): Promise<T | null> {
    return new Promise((resolve) => {
      this.closeMenu();
      const rows = Math.min(6, items.length);
      const x = 40, w = 310, y = 704 - rows * 38; // anchored to the bottom edge
      this.menuPanel = this.add.graphics().setDepth(1000);
      drawGlowPanel(this.menuPanel, x, y - 44, w, rows * 38 + 58, C.accentInt, 0.94, 12);
      const head = glow(addText(this, x + 18, y - 34, title, { size: 18, color: C.accent, bold: true }), C.accent, 8).setDepth(1001);
      const wrapped = items.map((it) => ({
        ...it,
        onFocus: () => this.showInfo(it.hint?.() ?? ''),
        onSelect: () => { const id = (it as MenuItem & { id?: T }).id ?? null; this.closeMenu(); head.destroy(); resolve(id); },
      }));
      this.menu = new MenuList(this, x, y, wrapped, {
        width: w, lineHeight: 38, size: 20, rows,
        onCancel: back ? () => { this.closeMenu(); head.destroy(); resolve(null); } : undefined,
      });
      this.menu.container.setDepth(1001);
      this.menuPanel.once('destroy', () => head.destroy());
      this.showInfo(items[this.menu.index]?.hint?.() ?? '');
      input.consume();
    });
  }

  private closeMenu() {
    this.menu?.destroy();
    this.menu = null;
    this.menuPanel?.destroy();
    this.menuPanel = null;
    this.showInfo('');
  }

  private showInfo(text: string) {
    this.info.setText(text).setVisible(!!text);
    this.refreshStatus();
  }

  private pickTarget(list: Unit[], skill: SkillDef): Promise<string | null> {
    if (!list.length) return Promise.resolve(null);
    return new Promise((resolve) => {
      const first = skill.target === 'ally' ? list.reduce((a, b) => (b.hp / b.stats.maxHp < a.hp / a.stats.maxHp ? b : a)) : list[0]!;
      this.targeting = { list, index: list.indexOf(first), resolve };
      this.showInfo(`${tr(skill.name)}: choose a target.   ←→ change   ${input.label('confirm')} confirm   ${input.label('cancel')} back`);
      input.consume();
      this.placeCursor();
    });
  }

  private placeCursor() {
    const t = this.targeting;
    if (!t) { this.cursor.setVisible(false); return; }
    const u = t.list[t.index]!;
    const v = this.views.get(u.id)!;
    this.cursor.setVisible(true).setPosition(v.x - 11, v.homeY - v.h - 34);
    this.highlight(u.id, true);
    this.banner.setText(`${tr(u.name)}  ·  ${u.hp}/${u.stats.maxHp}`).setAlpha(1);
  }

  private endTargeting(id: string | null) {
    const t = this.targeting;
    this.targeting = null;
    this.cursor.setVisible(false);
    this.banner.setAlpha(0);
    this.highlight(this.st.active);
    this.showInfo('');
    t?.resolve(id);
  }

  // ------------------------------------------------------------------ animation
  private wait(ms: number) {
    return new Promise<void>((r) => this.time.delayedCall(this.calm ? ms * 0.6 : ms, () => r()));
  }

  private tween(cfg: Phaser.Types.Tweens.TweenBuilderConfig) {
    return new Promise<void>((r) => this.tweens.add({ ...cfg, onComplete: () => r() }));
  }

  private async say(text: string, ms = 1000) {
    this.banner.setText(text).setAlpha(1);
    await this.wait(ms);
    this.banner.setAlpha(0);
  }

  private flashBanner(text: string) {
    this.banner.setText(text).setAlpha(1);
    this.tweens.add({ targets: this.banner, alpha: 0, delay: 900, duration: 300 });
  }

  private popup(v: View, text: string, color: string, size = 30) {
    const t = glow(addText(this, v.x + (Math.random() - 0.5) * 30, v.homeY - v.h * 0.6, text, { size, bold: true, color, stroke: '#05070d', strokeThickness: 5 }), color, 12)
      .setOrigin(0.5).setDepth(950);
    this.tweens.add({ targets: t, y: t.y - 60, alpha: { from: 1, to: 0 }, duration: 1100, ease: 'Cubic.Out', onComplete: () => t.destroy() });
  }

  private center(v: View) { return { x: v.x, y: v.homeY - v.h * 0.5 }; }

  private particles(x: number, y: number, color: number | number[], n: number, speed = 220, scale = 0.2, tex = 'fx:soft') {
    const e = this.add.particles(x, y, tex, {
      speed: { min: speed * 0.3, max: speed }, lifespan: 700, scale: { start: scale, end: 0 }, alpha: { start: 1, end: 0 },
      tint: color, blendMode: Phaser.BlendModes.ADD, emitting: false, rotate: { min: 0, max: 360 },
    }).setDepth(940);
    e.explode(n);
    this.time.delayedCall(900, () => e.destroy());
  }

  private shake(intensity = 0.006, ms = 160) {
    if (settings.get('screenShake') && !this.calm) this.cameras.main.shake(ms, intensity);
  }

  private async animate(e: BattleEvent) {
    const st = this.st;
    switch (e.t) {
      case 'turn': {
        this.highlight(e.unit);
        this.refreshTimeline();
        await this.wait(120);
        return;
      }
      case 'act': {
        const u = unit(st, e.unit);
        const s = SKILLS[e.skill];
        if (!u || !s) return;
        this.flashBanner(`${tr(u.name)}  ·  ${tr(s.name)}`);
        const v = this.views.get(u.id)!;
        const tv = this.views.get(e.targets[0] ?? '');
        const melee = ['strike', 'staff_strike', 'death_touch', 'soul_absorb', 'lash', 'crush', 'drain'].includes(s.id);
        if (s.sfx) audio.sfx(s.sfx as SfxId);
        if (v.rig) {
          if (melee && tv && tv !== v) {
            v.rig.setState('run');
            await this.tween({ targets: v, x: tv.x - 130, duration: 220, ease: 'Cubic.In' });
            v.rig.setState('attack');
            await this.wait(140);
          } else if (s.target !== 'self') {
            v.rig.setState('cast');
            await this.wait(260);
          } else await this.wait(200);
        } else if (v.puppet && tv && tv !== v) {
          v.puppet.lean = -0.35;
          await this.tween({ targets: v, x: tv.x + 150, duration: 240, ease: 'Cubic.In' });
          v.puppet.hit(-0.15);
        } else await this.wait(200);
        for (const id of e.targets) {
          const t = this.views.get(id);
          if (t) this.vfx(s, v, t);
        }
        await this.wait(s.vfx === 'laser' || s.vfx === 'light' ? 380 : 200);
        return;
      }
      case 'damage': {
        const v = this.views.get(e.target);
        if (!v) return;
        if (e.miss) { this.popup(v, 'MISS', '#c9d6e8', 26); await this.wait(250); return; }
        if (e.blocked === 'immune') { this.popup(v, 'IMMUNE', '#a0a0ff', 24); audio.sfx('guard'); await this.wait(250); return; }
        if (e.amount > 0) {
          const col = '#' + EL_COLOR[e.element].toString(16).padStart(6, '0');
          this.popup(v, String(e.amount), e.weak ? C.warm : col, e.weak ? 38 : 32);
          if (e.weak) this.popup(v, 'WEAK!', C.warm, 18);
          if (e.blocked === 'armored') this.popup(v, 'ARMOUR', '#cfe3ff', 18);
          if (e.blocked === 'guard') this.popup(v, 'GUARD', '#9fd8ff', 18);
          if (v.puppet) v.puppet.hit(0.25);
          if (v.rig) { v.rig.flash = 1; v.rig.setState('hurt'); this.time.delayedCall(300, () => { if (!unit(st, v.id)?.dead) v.rig?.setState('battle'); }); }
          audio.sfx('hit');
          this.shake(v.side === 'party' ? 0.008 : 0.004);
        }
        this.refreshStatus();
        await this.wait(260);
        return;
      }
      case 'heal': {
        const v = this.views.get(e.target);
        if (!v || e.amount <= 0) return;
        this.popup(v, `+${e.amount}`, C.good, 30);
        const c = this.center(v);
        this.particles(c.x, c.y, 0x8dffbd, 14, 120, 0.14);
        audio.sfx('heal');
        this.refreshStatus();
        await this.wait(260);
        return;
      }
      case 'status': {
        const v = this.views.get(e.target);
        if (!v) return;
        const [label, color] = STATUS_LABEL[e.status];
        if (e.status === 'armored' && !e.on) {
          this.popup(v, 'ARMOUR BROKEN', '#cfe3ff', 22);
          const c = this.center(v);
          this.particles(c.x, c.y, 0xcfe3ff, 24, 320, 0.16, 'fx:spark');
          audio.sfx('shatter');
        } else if (e.on && e.status !== 'guard') this.popup(v, label, color, 20);
        if (e.status === 'shadow' && v.puppet) {
          this.tweens.add({ targets: v.puppet.mesh, scaleY: e.on ? 0.08 : 1, alpha: e.on ? 0.55 : 1, duration: 400 });
          if (e.on) audio.sfx('meld');
        }
        this.refreshStatus();
        await this.wait(160);
        if (e.on && e.status === 'doom') await this.tutorial('doom');
        if (e.on && e.status === 'shadow') await this.tutorial('shadow');
        return;
      }
      case 'ink': {
        const v = this.views.get(e.target);
        if (!v?.puppet) return;
        audio.sfx('ink');
        const c = this.center(v);
        this.particles(c.x, c.y, 0x10141f, 30, 260, 0.3);
        this.tweens.add({ targets: v.puppet.mesh, scaleY: 0.12, duration: 380, ease: 'Cubic.In' });
        v.puppet.eyes.forEach((eye) => eye.setVisible(false));
        await this.say(`${tr(unit(st, e.target)!.name)} bursts into ink. It is not dead.`, 1100);
        this.refreshStatus();
        await this.tutorial('vale_ink');
        return;
      }
      case 'reform': {
        const v = this.views.get(e.target);
        if (!v?.puppet) return;
        audio.sfx('reform');
        v.puppet.eyes.forEach((eye) => eye.setVisible(true));
        await this.tween({ targets: v.puppet.mesh, scaleY: 1, alpha: 1, duration: 520, ease: 'Back.Out' });
        this.refreshStatus();
        await this.say(`${tr(unit(st, e.target)!.name)} knits itself back together.`, 1100);
        await this.say('Finish it with light, fire, a shattering blow, or Death Touch then Soul Absorb.', 1600);
        return;
      }
      case 'destroy': {
        const v = this.views.get(e.target);
        if (!v) return;
        v.gone = true;
        audio.sfx('destroy');
        const c = this.center(v);
        const col = e.how === 'absorb' ? 0xc58bff : EL_COLOR[e.how === 'doom' ? 'soul' : e.how];
        this.particles(c.x, c.y, col, 40, 300, 0.25);
        if (e.how === 'absorb') this.soulStream(v);
        v.shadow.setVisible(false);
        v.plate.setVisible(false);
        v.intent.setVisible(false);
        if (v.puppet) {
          const p = v.puppet;
          await this.tween({ targets: [p.mesh, ...p.eyes], alpha: 0, duration: 600 });
          p.setVisible(false);
        }
        const why = e.how === 'fire' ? 'Burned away for good.' : e.how === 'light' ? 'Unmade by the light.' : e.how === 'shatter' ? 'Shattered for good.'
          : e.how === 'absorb' ? 'Its soul is gone.' : e.how === 'doom' ? 'Doom takes it.' : 'Destroyed.';
        await this.say(why, 900);
        return;
      }
      case 'ko': {
        const v = this.views.get(e.target);
        v?.rig?.setState('ko');
        audio.sfx('hurt', 0.7);
        await this.say(`${tr(unit(st, e.target)!.name)} falls.`, 900);
        return;
      }
      case 'doom': {
        const v = this.views.get(e.target);
        if (!v) return;
        if (e.left > 0) this.popup(v, `DOOM ${e.left}`, '#c58bff', 22);
        await this.wait(180);
        return;
      }
      case 'fail': {
        await this.say(tr(e.reason), 1300);
        return;
      }
      case 'resource':
        this.refreshStatus();
        return;
      case 'rewind': {
        await this.rewindFx();
        return;
      }
      case 'outcome':
        return;
    }
  }

  private vfx(s: SkillDef, from: View, to: View) {
    const c = this.center(to);
    switch (s.vfx) {
      case 'slash': {
        const g = this.add.graphics().setDepth(930).setBlendMode(Phaser.BlendModes.ADD);
        g.lineStyle(5, 0xffffff, 0.9);
        g.beginPath();
        g.arc(c.x, c.y, 60, -2.2, -0.4);
        g.strokePath();
        this.tweens.add({ targets: g, alpha: 0, duration: 260, onComplete: () => g.destroy() });
        break;
      }
      case 'doom': {
        const ring = this.add.image(c.x, c.y - 20, 'fx:soft').setTint(0x9a5cff).setBlendMode(Phaser.BlendModes.ADD).setScale(0.2).setDepth(930);
        this.tweens.add({ targets: ring, scale: 2.4, alpha: 0, duration: 700, onComplete: () => ring.destroy() });
        this.particles(c.x, c.y, [0x9a5cff, 0x2a0a40], 26, 160, 0.22);
        this.cameras.main.flash(180, 60, 0, 90);
        break;
      }
      case 'absorb':
        this.soulStream(to, from);
        break;
      case 'light': {
        const b = this.add.image(c.x, c.y, 'fx:soft').setBlendMode(Phaser.BlendModes.ADD).setScale(0.3).setDepth(930);
        this.tweens.add({ targets: b, scale: 5, alpha: 0, duration: 500, onComplete: () => b.destroy() });
        this.particles(c.x, c.y, 0xfff6c8, 30, 380, 0.18, 'fx:spark');
        this.cameras.main.flash(160, 255, 250, 220);
        break;
      }
      case 'shatter':
        this.particles(c.x, c.y, [0x9ff0ff, 0xffffff], 34, 420, 0.16, 'fx:spark');
        this.shake(0.01, 200);
        break;
      case 'gun': {
        const f = this.center(from);
        const g = this.add.graphics().setDepth(930).setBlendMode(Phaser.BlendModes.ADD);
        g.lineStyle(3, 0xffe8a0, 1).lineBetween(f.x + 40, f.y - 10, c.x, c.y);
        this.tweens.add({ targets: g, alpha: 0, duration: 180, onComplete: () => g.destroy() });
        this.particles(f.x + 44, f.y - 10, 0xffd080, 10, 200, 0.12);
        this.shake(0.01, 120);
        break;
      }
      case 'fire':
        this.particles(c.x, c.y + 30, [0xff8a3a, 0xffd06a, 0xff3a2a], 40, 260, 0.26);
        break;
      case 'laser': {
        const f = this.center(from);
        const g = this.add.graphics().setDepth(930).setBlendMode(Phaser.BlendModes.ADD);
        g.lineStyle(16, 0xff6a2a, 0.5).lineBetween(f.x + 30, f.y - 20, c.x, c.y);
        g.lineStyle(5, 0xfff0c0, 1).lineBetween(f.x + 30, f.y - 20, c.x, c.y);
        this.tweens.add({ targets: g, alpha: 0, duration: 450, onComplete: () => g.destroy() });
        this.particles(c.x, c.y, [0xff8a3a, 0xffd06a], 40, 320, 0.28);
        this.shake(0.012, 260);
        break;
      }
      default:
        break;
    }
  }

  private soulStream(from: View, to?: View) {
    const target = to ?? [...this.views.values()].find((v) => this.st.units.find((u) => u.id === v.id)?.kind === 'ragul');
    if (!target) return;
    const a = this.center(from), b = this.center(target);
    for (let i = 0; i < 16; i++) {
      const p = this.add.image(a.x + (Math.random() - 0.5) * 40, a.y + (Math.random() - 0.5) * 60, 'fx:soft')
        .setTint(0xc58bff).setBlendMode(Phaser.BlendModes.ADD).setScale(0.15).setDepth(935);
      this.tweens.add({
        targets: p, x: b.x, y: b.y, scale: 0.05, duration: 500 + Math.random() * 300, delay: i * 30, ease: 'Cubic.In', onComplete: () => p.destroy(),
      });
    }
  }

  private async rewindFx() {
    audio.sfx('rewind');
    const cam = this.cameras.main;
    const cm = cam.filters.internal.addColorMatrix();
    cm.colorMatrix.desaturate();
    cam.flash(200, 255, 255, 255);
    const t = addText(this, W / 2, H / 2 - 40, 'TICK.', { size: 96, display: true, bold: true }).setOrigin(0.5).setDepth(990);
    await this.wait(700);
    t.destroy();
    cam.filters.internal.remove(cm);
    // Re-sync every unit's visuals to the restored state.
    for (const u of this.st.units) {
      const v = this.views.get(u.id)!;
      const dead = u.dead;
      v.gone = u.side === 'enemy' && dead;
      v.shadow.setVisible(!v.gone);
      v.plate.setVisible(!v.gone);
      if (v.puppet) {
        const ink = has(u, 'ink') || has(u, 'shadow');
        v.puppet.setVisible(!v.gone);
        v.puppet.mesh.setScale(1, ink ? 0.12 : 1).setAlpha(1);
        v.puppet.eyes.forEach((e) => { e.setVisible(!v.gone && !ink); e.setAlpha(1); });
      }
      v.rig?.setState(dead ? 'ko' : 'battle');
    }
    await this.say('Everything since your last turn never happened. Only you remember.', 1600);
  }

  // ------------------------------------------------------------------ HUD
  private highlight(id: string | null, target = false) {
    for (const v of this.views.values()) {
      v.ring.setVisible(v.id === id && !v.gone);
      v.ring.setStrokeStyle(2, target ? C.warmInt : v.side === 'party' ? C.accentInt : C.dangerInt, 0.9);
    }
  }

  private refreshStatus() {
    if (!this.statusG) return;
    const g = this.statusG;
    g.clear();
    this.statusTexts.forEach((t) => t.destroy());
    this.statusTexts = [];
    const keep = <T extends Phaser.GameObjects.GameObject>(o: T) => { this.ui.add(o); this.statusTexts.push(o); return o; };
    const x0 = 372, y0 = this.info.visible ? 598 : 568, w = 868;
    const party = this.st.units.filter((u) => u.side === 'party');
    drawGlowPanel(g, x0 - 12, 546, w + 24, 160, C.accentInt, 0.93, 12);
    const rowH = Math.min(36, (700 - y0) / Math.max(1, party.length));
    party.forEach((u, i) => {
      const y = y0 + i * rowH;
      const c = CHARACTERS[u.kind as MemberId];
      const vein = '#' + c.vein.toString(16).padStart(6, '0');
      const active = this.st.active === u.id;
      if (active) g.fillStyle(c.vein, 0.12).fillRoundedRect(x0 - 8, y - 5, w + 16, rowH - 2, 6);
      const name = keep(addText(this, x0, y, tr(u.name), { size: 20, bold: true, color: u.dead ? '#6f7f96' : active ? vein : '#eef4ff' }));
      if (active) glow(name, vein, 10);
      const frac = u.hp / u.stats.maxHp;
      const col = frac < 0.3 ? C.hpLow : C.hp;
      g.lineStyle(6, col, 0.12).strokeRoundedRect(x0 + 128, y + 6, 204, 14, 7);
      bar(g, x0 + 130, y + 8, 200, 10, frac, col);
      keep(addText(this, x0 + 342, y + 1, u.dead ? 'down' : `${u.hp} / ${u.stats.maxHp}`, { size: 17, bold: true, color: u.dead ? '#ff9a9a' : '#e6eefa' }));
      let rx = x0 + 470;
      const res = (label: string, frac: number, color: number, text: string) => {
        const t = keep(addText(this, rx, y + 2, label, { size: 14, color: '#b9c7dd' }));
        g.lineStyle(5, color, 0.12).strokeRoundedRect(rx + t.width + 4, y + 7, 94, 11, 5);
        bar(g, rx + t.width + 6, y + 9, 90, 7, frac, color);
        keep(addText(this, rx + t.width + 102, y + 1, text, { size: 15, bold: true, color: '#e6eefa' }));
        rx += t.width + 150;
      };
      if (u.kind === 'ragul' && !this.st.dream && session.state.flags.hunger_known) res('Hunger', this.st.soulHunger / 100, this.st.soulHunger >= 70 ? 0xff5a7a : 0xa98cff, String(this.st.soulHunger));
      if (u.res.ce !== undefined) res('CE', u.res.ce / (u.res.ceMax ?? 6), 0x6dffa8, `${u.res.ce}`);
      if (u.res.ammo !== undefined) {
        const t = keep(addText(this, rx, y + 2, 'Ammo', { size: 14, color: '#b9c7dd' }));
        for (let k = 0; k < 6; k++) g.fillStyle(k < u.res.ammo ? 0xffd98a : 0x2a3348, 1).fillRect(rx + t.width + 8 + k * 9, y + 7, 6, 11);
        rx += t.width + 70;
      }
      if (u.res.heat !== undefined) res('Heat', u.res.heat / 100, 0xff8a3a, String(u.res.heat));
    });
    for (const u of this.st.units) {
      const v = this.views.get(u.id);
      if (v) this.drawPlate(u, v);
    }
    this.drawGoal();
  }

  /** Nameplate above a fighter: name (foes), HP bar or ink countdown, and status chips. */
  private drawPlate(u: Unit, v: View) {
    v.plate.removeAll(true);
    const enemy = u.side === 'enemy';
    if (enemy && u.dead) { v.plate.setVisible(false); return; }
    v.plate.setVisible(true);
    const w = enemy ? 180 : 150;
    const g = this.add.graphics();
    v.plate.add(g);
    let y = 0;
    if (enemy) {
      v.plate.add(glow(addText(this, 0, 0, tr(u.name), { size: 17, bold: true, color: '#ffe2e2' }), '#ff5a5a', 8).setOrigin(0.5, 0));
      y = 24;
    }
    const ink = u.statuses.find((s) => s.id === 'ink');
    if (ink) {
      const n = Math.max(0, ink.turns);
      v.plate.add(glow(addText(this, 0, y, `INK  ·  re-forms in ${n} turn${n === 1 ? '' : 's'}`, { size: 15, bold: true, color: '#e0d4ff' }), '#9a7cff', 10).setOrigin(0.5, 0));
      y += 24;
    } else if (!u.dead) {
      const frac = u.hp / u.stats.maxHp;
      const col = enemy ? 0xff6a6a : frac < 0.3 ? C.hpLow : C.hp;
      g.lineStyle(7, col, 0.15).strokeRoundedRect(-w / 2 - 2, y - 2, w + 4, 14, 7);
      bar(g, -w / 2, y, w, 10, frac, col);
      g.lineStyle(1, col, 0.85).strokeRoundedRect(-w / 2 - 0.5, y - 0.5, w + 1, 11, 5.5);
      v.plate.add(addText(this, 0, y + 12, `${u.hp} / ${u.stats.maxHp}`, { size: 14, bold: true, color: '#f4f8ff', stroke: '#05070d', strokeThickness: 3 }).setOrigin(0.5, 0));
      y += 32;
    }
    const sts = u.statuses.filter((s) => s.id !== 'ink' && (s.id !== 'guard' || !enemy));
    if (!sts.length) return;
    const texts = sts.map((s) => {
      const [label, color] = STATUS_LABEL[s.id];
      const text = s.id === 'shadow' ? 'SHADOW · only light' : s.turns > 0 ? `${label} ${s.turns}` : label;
      return glow(addText(this, 0, y, text, { size: 13, bold: true, color, stroke: '#05070d', strokeThickness: 3 }), color, 6);
    });
    const total = texts.reduce((a, t) => a + t.width, 0) + (texts.length - 1) * 10;
    let x = -total / 2;
    for (const t of texts) { t.setX(x); x += t.width + 10; v.plate.add(t); }
  }

  /** Goal card, top left: how to win, how Vales die, and what is left. */
  private drawGoal() {
    this.goal.removeAll(true);
    const foes = this.st.units.filter((u) => u.side === 'enemy');
    const ink = foes.filter((u) => !u.dead && has(u, 'ink')).length;
    const gone = foes.filter((u) => u.dead).length;
    const standing = foes.length - ink - gone;
    const x = 20, y = 14, w = 312;
    const title = glow(addText(this, x + 16, y + 12, 'GOAL', { size: 14, bold: true, color: C.warm, letterSpacing: 3 }), C.warm, 8);
    const lines: [string, string][] = [['Destroy every foe for good.', '#eef4ff']];
    if (foes.some((u) => u.tags.includes('vale'))) {
      lines.push(['Vales re-form from ink. Finish them with light, fire, a shattering blow, or Death Touch then Soul Absorb.', '#c9d6ea']);
    }
    lines.push([`${standing} standing  ·  ${ink} as ink  ·  ${gone} gone`, '#ffd0d0']);
    let ty = y + 36;
    const texts = lines.map(([t, color]) => {
      const o = addText(this, x + 16, ty, t, { size: 15, color, wordWrap: { width: w - 32 }, lineSpacing: 2 });
      ty += o.height + 6;
      return o;
    });
    const g = this.add.graphics();
    drawGlowPanel(g, x, y, w, ty - y + 6, C.warmInt, 0.9, 10);
    this.goal.add([g, title, ...texts]);
  }

  private refreshTimeline() {
    if (!this.timeline) return;
    this.timeline.removeAll(true);
    const order = previewTimeline(this.st, 9);
    const gap = 58;
    const x0 = -((order.length - 1) * gap) / 2;
    const lbl = glow(addText(this, x0 - 24, -44, 'TURN ORDER', { size: 13, bold: true, color: '#cfe6ff', letterSpacing: 3 }), C.accent, 6);
    this.timeline.add(lbl);
    order.forEach((id, i) => {
      const u = unit(this.st, id);
      if (!u) return;
      const x = x0 + i * gap;
      const r = i === 0 ? 24 : 19;
      const g = this.add.graphics();
      const col = u.side === 'party' ? CHARACTERS[u.kind as MemberId].vein : 0xff6a6a;
      g.lineStyle(i === 0 ? 14 : 8, col, i === 0 ? 0.22 : 0.12).strokeCircle(x, 0, r + 3);
      g.fillStyle(0x0b1220, 0.95).fillCircle(x, 0, r);
      g.lineStyle(i === 0 ? 3 : 2, col, i === 0 ? 1 : 0.85).strokeCircle(x, 0, r);
      this.timeline.add(g);
      if (u.side === 'party' && this.textures.exists(`portrait:gen:${u.kind}`)) {
        const img = this.add.image(x, 0, `portrait:gen:${u.kind}`).setDisplaySize(r * 1.7, r * 1.7);
        this.timeline.add(img);
      } else {
        const letter = u.name.en.replace(/^Ice-crusted /, '').slice(0, 1) + (u.name.en.match(/ ([A-Z])$/)?.[1] ?? '');
        this.timeline.add(glow(addText(this, x, 0, letter, { size: i === 0 ? 20 : 16, bold: true, color: '#ffd0d0' }), '#ff5a5a', 6).setOrigin(0.5));
      }
    });
  }

  private refreshIntents() {
    const sees = alive(this.st, 'party').some((u) => has(u, 'foresight'));
    for (const u of this.st.units) {
      const v = this.views.get(u.id);
      if (!v || u.side !== 'enemy') continue;
      const show = sees && !u.dead && !!u.intent && !has(u, 'ink');
      v.intent.setVisible(show);
      if (show) {
        const s = SKILLS[u.intent!.skill];
        const t = unit(this.st, u.intent!.target);
        v.intent.setText(`next: ${s ? tr(s.name) : '?'}${t && t.id !== u.id ? ` → ${tr(t.name)}` : ''}`);
      }
    }
  }

  // ------------------------------------------------------------------ results
  private async finish() {
    this.closeMenu();
    const st = session.state;
    const r = battleResult(this.st);
    const lines: string[] = [];
    if (r.outcome !== 'lost') {
      for (const p of r.party) {
        const m = st.members[p.id as MemberId];
        if (m) m.hp = Math.min(p.hp, memberStats(st, p.id as MemberId).maxHp);
      }
      st.soulHunger = r.soulHunger;
      st.soulsAbsorbed += r.soulsAbsorbed;
      if (r.ammo >= 0) st.ammo = r.ammo;
      const rosoar = r.inventory.red_rosoar ?? 0;
      if (rosoar > 0) st.inventory.red_rosoar = rosoar;
      else delete st.inventory.red_rosoar;
    }
    if (r.outcome === 'won') {
      audio.music('none');
      audio.sfx('ability');
      const ups = grantXp(st, r.xp);
      st.riShards += r.shards;
      for (const [id, n] of Object.entries(r.drops)) addItem(st, id, n);
      if (!this.st.dream) lines.push(`${r.xp} XP    ·    ${r.shards} RI shards`);
      else lines.push('In his head, at least, he wins.');
      for (const [id, n] of Object.entries(r.drops)) lines.push(`Found: ${tr(ITEMS[id]?.name ?? { en: id, ta: id })}${n > 1 ? ` ×${n}` : ''}`);
      for (const id of ups) lines.push(`${tr(CHARACTERS[id].name)} reached level ${st.members[id]!.level}!`);
      if (r.soulsAbsorbed) lines.push(`Ragul took ${r.soulsAbsorbed} soul${r.soulsAbsorbed > 1 ? 's' : ''}. The hunger quiets, for now.`);
      else if (st.soulHunger >= 70 && st.party.includes('ragul') && st.flags.hunger_known) lines.push('Ragul\'s hunger gnaws at him.');
      for (const v of this.views.values()) if (v.side === 'party' && !unit(this.st, v.id)?.dead) v.rig?.setState('idle');
      await this.results('Victory', lines, C.warm, C.warmInt);
      if (st.party.includes('ragul') && st.flags.hunger_known) await this.tutorial('hunger');
    } else if (r.outcome === 'fled') {
      await this.results('You got away', ['The party slips away into the snow.'], '#cfe6ff', C.accentInt);
    } else {
      audio.music('none');
      if (BATTLES[this.data_.battle]?.retry) await this.results('Knocked down', ['Get up. Try again.'], C.danger, C.dangerInt);
      else await this.results('The party has fallen', ['You wake at your last rest.'], C.danger, C.dangerInt);
    }
    bus.emit('hud', undefined);
    this.data_.onDone(r.outcome);
  }

  /** First-time battle tutorial: pauses the battle until the player dismisses it (data/tips.ts). */
  private tutorial(id: string): Promise<void> {
    const t = takeTip(id);
    if (!t) return Promise.resolve();
    return new Promise((resolve) => {
      const w = 660, x = W / 2 - w / 2;
      const shade = this.add.rectangle(0, 0, W, H, 0x02040a, 0.55).setOrigin(0);
      const title = glow(addText(this, x + 28, 0, tr(t.title), { size: 30, display: true, bold: true, color: C.warm }), C.warm, 12);
      const body = addText(this, x + 28, 0, tipBody(t), { size: 21, color: '#f2f6ff', wordWrap: { width: w - 56 }, lineSpacing: 5 });
      const h = body.height + 132;
      const y = H / 2 - h / 2 - 40;
      title.setY(y + 22);
      body.setY(y + 72);
      const tag = addText(this, x + w - 24, y + 28, 'TUTORIAL', { size: 13, bold: true, color: C.warm, letterSpacing: 3 }).setOrigin(1, 0);
      const hint = addText(this, W / 2, y + h - 30, `${input.label('confirm')}  Got it`, { size: 17, bold: true, color: '#cfe6ff' }).setOrigin(0.5);
      const g = this.add.graphics();
      drawGlowPanel(g, x, y, w, h, C.warmInt, 0.96, 14);
      const c = this.add.container(0, 0, [shade, g, title, body, tag, hint]).setDepth(1300);
      audio.sfx('ui_ok', 0.8);
      input.consume();
      const t0 = this.time.now;
      const check = () => {
        if (this.time.now - t0 > 500 && (input.pressed('confirm') || input.pressed('interact') || input.pressed('cancel'))) {
          input.consume();
          this.events.off('update', check);
          c.destroy();
          resolve();
        }
      };
      this.events.on('update', check);
    });
  }

  private results(title: string, lines: string[], color: string, colorInt: number): Promise<void> {
    return new Promise((resolve) => {
      const g = this.add.graphics().setDepth(1100);
      g.fillStyle(0x000000, 0.45).fillRect(0, 0, W, H);
      const h = 150 + lines.length * 30;
      drawGlowPanel(g, W / 2 - 330, H / 2 - h / 2, 660, h, colorInt, 0.96, 14);
      glow(addText(this, W / 2, H / 2 - h / 2 + 24, title, { size: 42, display: true, bold: true, color }), color, 14).setOrigin(0.5, 0).setDepth(1101);
      lines.forEach((l, i) => addText(this, W / 2, H / 2 - h / 2 + 88 + i * 30, l, { size: 20, color: '#eef4ff' }).setOrigin(0.5, 0).setDepth(1101));
      addText(this, W / 2, H / 2 + h / 2 - 30, `${input.label('confirm')}  Continue`, { size: 16, color: '#b9c7dd' }).setOrigin(0.5).setDepth(1101);
      input.consume();
      const t0 = this.time.now;
      const check = () => {
        if (this.time.now - t0 > 400 && (input.pressed('confirm') || input.pressed('interact'))) {
          input.consume();
          this.events.off('update', check);
          resolve();
        }
      };
      this.events.on('update', check);
    });
  }

  // ------------------------------------------------------------------ frame
  override update(time: number, deltaMs: number) {
    const dt = Math.min(0.05, deltaMs / 1000);
    this.clock += dt;
    for (const v of this.views.values()) {
      if (v.rig) v.rig.update(dt, v.x, v.y);
      if (v.puppet && !v.gone) {
        v.puppet.setPosition(v.x, v.homeY + 8);
        v.puppet.lean *= 0.9;
        v.puppet.update(dt);
      }
      if (!v.gone && v.x !== v.homeX && !this.tweens.isTweening(v)) {
        v.x += (v.homeX - v.x) * Math.min(1, dt * 10);
        if (Math.abs(v.x - v.homeX) < 1) { v.x = v.homeX; if (v.rig && v.rig.state === 'attack') v.rig.setState('battle'); }
        if (v.rig && v.rig.state === 'run') v.rig.setState('battle');
      }
      v.shadow.setX(v.x);
      v.ring.setX(v.x);
      v.plate.setX(v.x);
      v.intent.setX(v.x);
    }
    if (this.targeting) {
      const t = this.targeting;
      const n = t.list.length;
      if (input.pressed('left') || input.pressed('up')) { t.index = (t.index - 1 + n) % n; audio.sfx('ui_move'); this.placeCursor(); }
      if (input.pressed('right') || input.pressed('down')) { t.index = (t.index + 1) % n; audio.sfx('ui_move'); this.placeCursor(); }
      this.cursor.y += Math.sin(this.clock * 8) * 0.4;
      if (input.pressed('confirm')) { input.consume(); audio.sfx('ui_ok'); this.endTargeting(t.list[t.index]!.id); }
      else if (input.pressed('cancel')) { input.consume(); audio.sfx('ui_back'); this.endTargeting(null); }
      return;
    }
    this.menu?.update(time);
  }
}
