/**
 * Turn-based battle rules, independent of rendering so they can be unit-tested.
 *
 * Turn order is a timeline: every unit has a `next` time; the lowest acts, then moves back by
 * 100 × (action delay) / speed. The UI calls `advance()` for one step at a time and animates the
 * events it produces, and calls `act()` when a party member has chosen a command.
 */
import { loc } from '../core/Localization';
import { nextRandom, pickWeighted, randRange } from '../core/rng';
import type { MemberId, Stats } from '../data/characters';
import { CHARACTERS } from '../data/characters';
import { ENEMIES, type BattleDef } from '../data/enemies';
import { SKILLS, type SkillDef } from './skills';
import type { BattleEvent, BattleState, Element, Status, StatusId, Unit } from './types';

export const HUNGER_STARVING = 70;
export const HUNGER_PER_BATTLE = 12;
export const DOOM_TURNS = 3;
export const INK_TURNS = 2;
const FINISHING: Element[] = ['fire', 'light', 'shatter', 'water'];

export interface BattleSetup {
  def: BattleDef;
  party: { id: MemberId; stats: Stats; hp: number }[];
  soulHunger: number;
  ammo: number;
  inventory: Record<string, number>;
  seed: number;
  /** Who struck first in the world: 'party' ambushed the enemy, 'enemy' caught the party. */
  initiative?: 'party' | 'enemy' | null;
}

// ------------------------------------------------------------------ helpers
export const has = (u: Unit, s: StatusId) => u.statuses.some((x) => x.id === s);
export const getStatus = (u: Unit, s: StatusId) => u.statuses.find((x) => x.id === s);
export const unit = (st: BattleState, id: string) => st.units.find((u) => u.id === id);
export const alive = (st: BattleState, side: 'party' | 'enemy') => st.units.filter((u) => u.side === side && !u.dead);
/** Enemies that are standing (not destroyed and not a puddle of ink). */
export const standing = (st: BattleState, side: 'party' | 'enemy') => alive(st, side).filter((u) => !has(u, 'ink'));

function addStatus(st: BattleState, u: Unit, id: StatusId, turns: number) {
  const s = getStatus(u, id);
  if (s) s.turns = turns < 0 || s.turns < 0 ? -1 : Math.max(s.turns, turns);
  else {
    u.statuses.push({ id, turns });
    st.events.push({ t: 'status', target: u.id, status: id, on: true });
  }
}

function removeStatus(st: BattleState, u: Unit, id: StatusId) {
  if (!has(u, id)) return;
  u.statuses = u.statuses.filter((s) => s.id !== id);
  st.events.push({ t: 'status', target: u.id, status: id, on: false });
}

const rand = (st: BattleState) => nextRandom(st.rng);

// ------------------------------------------------------------------ setup
export function createBattle(setup: BattleSetup): BattleState {
  const st: BattleState = {
    id: setup.def.id,
    units: [],
    time: 0,
    turns: 0,
    rng: { seed: setup.seed | 0 },
    active: null,
    awaitingInput: false,
    events: [],
    rewindUsed: false,
    snapshots: [],
    outcome: null,
    canFlee: setup.def.canFlee,
    dream: !!setup.def.dream,
    soulHunger: setup.soulHunger,
    soulsAbsorbed: 0,
    inventory: { ...setup.inventory },
    freeUsed: [],
  };
  for (const p of setup.party) {
    const c = CHARACTERS[p.id];
    const u: Unit = {
      id: p.id, kind: p.id, side: 'party', name: c.name, stats: { ...p.stats },
      hp: Math.max(0, Math.min(p.hp, p.stats.maxHp)), statuses: [], tags: [], skills: [...(setup.def.skills?.[p.id] ?? c.skills)],
      next: 0, dead: p.hp <= 0, res: {},
    };
    if (p.id === 'dhanasree') u.res = { ce: 4, ceMax: 6, ammo: setup.ammo };
    if (p.id === 'dharshna') u.res = { heat: 20 };
    if (p.id === 'ragul' && setup.soulHunger >= HUNGER_STARVING && !setup.def.dream) u.statuses.push({ id: 'starving', turns: -1 });
    st.units.push(u);
  }
  const counts: Record<string, number> = {};
  setup.def.enemies.forEach((e) => (counts[e] = (counts[e] ?? 0) + 1));
  const seen: Record<string, number> = {};
  setup.def.enemies.forEach((eid, i) => {
    const d = ENEMIES[eid];
    if (!d) throw new Error(`unknown enemy ${eid}`);
    const n = (seen[eid] = (seen[eid] ?? 0) + 1);
    const suffix = counts[eid]! > 1 ? ` ${String.fromCharCode(64 + n)}` : '';
    st.units.push({
      id: `${eid}#${i}`, kind: eid, side: 'enemy',
      name: { en: d.name.en + suffix, ta: d.name.ta + suffix },
      stats: { ...d.stats }, hp: d.stats.maxHp, statuses: d.statuses.map((s) => ({ ...s }) as Status),
      tags: [...d.tags], skills: [...d.skills], ai: d.ai, next: 0, dead: false, res: {},
      xp: d.xp, shards: d.shards, drops: d.drops, meldCooldown: 0,
    });
  });
  for (const u of st.units) {
    let t = (100 / u.stats.spd) * randRange(st.rng, 0.35, 1);
    if (setup.initiative === u.side) t *= 0.25;
    else if (setup.initiative) t += 100 / u.stats.spd * 0.5;
    u.next = t;
  }
  for (const u of alive(st, 'enemy')) u.intent = chooseIntent(st, u);
  return st;
}

// ------------------------------------------------------------------ timeline
export function turnDelay(u: Unit, mult: number): number {
  return (100 * mult) / Math.max(1, u.stats.spd);
}

/** The next `count` turns, including the unit acting now. Assumes normal-speed actions. */
export function previewTimeline(st: BattleState, count = 8): string[] {
  const sim = st.units.filter((u) => !u.dead).map((u) => ({ id: u.id, next: u.next, u }));
  const out: string[] = [];
  if (st.active) {
    out.push(st.active);
    const a = sim.find((s) => s.id === st.active);
    if (a) a.next = st.time + turnDelay(a.u, 1);
  }
  while (out.length < count && sim.length) {
    sim.sort((a, b) => a.next - b.next || a.id.localeCompare(b.id));
    const s = sim[0]!;
    out.push(s.id);
    s.next += turnDelay(s.u, 1);
  }
  return out;
}

function nextActor(st: BattleState): Unit | undefined {
  return st.units.filter((u) => !u.dead).sort((a, b) => a.next - b.next || a.id.localeCompare(b.id))[0];
}

// ------------------------------------------------------------------ damage
export function isFinishing(el: Element) {
  return FINISHING.includes(el);
}

function kill(st: BattleState, u: Unit, how: Element | 'doom') {
  u.hp = 0;
  if (u.side === 'party') {
    u.dead = true;
    u.statuses = [];
    st.events.push({ t: 'ko', target: u.id });
    return;
  }
  const el: Element = how === 'doom' ? 'soul' : how;
  if (has(u, 'regen') && !isFinishing(el)) {
    for (const s of ['doom', 'blind', 'fear', 'shadow'] as StatusId[]) removeStatus(st, u, s);
    u.statuses.push({ id: 'ink', turns: INK_TURNS });
    u.intent = undefined;
    st.events.push({ t: 'ink', target: u.id });
    return;
  }
  u.dead = true;
  u.intent = undefined;
  st.events.push({ t: 'destroy', target: u.id, how });
}

export interface DamageOpts { pierce?: number }

/** Resolves one hit. Returns damage dealt (0 for misses, immunities and finishing blows on ink). */
export function dealDamage(st: BattleState, user: Unit, target: Unit, power: number, element: Element, opts: DamageOpts = {}): number {
  if (target.dead) return 0;
  if (has(target, 'ink')) {
    if (isFinishing(element)) {
      st.events.push({ t: 'damage', target: target.id, amount: 0, element });
      target.dead = true;
      target.statuses = [];
      st.events.push({ t: 'destroy', target: target.id, how: element });
    } else {
      st.events.push({ t: 'damage', target: target.id, amount: 0, element, blocked: 'immune' });
    }
    return 0;
  }
  if (has(target, 'shadow')) {
    if (element === 'light') {
      const amount = target.hp;
      st.events.push({ t: 'damage', target: target.id, amount, element, weak: true });
      target.hp = 0;
      target.dead = true;
      target.statuses = [];
      st.events.push({ t: 'destroy', target: target.id, how: 'light' });
      return amount;
    }
    st.events.push({ t: 'damage', target: target.id, amount: 0, element, blocked: 'immune' });
    return 0;
  }
  if (element === 'physical' && has(user, 'blind') && rand(st) < 0.5) {
    st.events.push({ t: 'damage', target: target.id, amount: 0, element, miss: true });
    return 0;
  }
  let atk = user.stats.atk;
  if (has(user, 'fear')) atk *= 0.7;
  if (has(user, 'starving')) atk *= 0.8;
  const def = target.stats.def * (1 - (opts.pierce ?? 0));
  let dmg = power * atk * 1.5 * (40 / (40 + def)) * randRange(st.rng, 0.9, 1.1);
  let weak = false;
  let blocked: 'armored' | 'guard' | undefined;
  if (target.tags.includes('vale') && element === 'fire') { dmg *= 1.5; weak = true; }
  if (target.tags.includes('vale') && element === 'light') { dmg *= 1.25; weak = true; }
  if (has(target, 'armored')) {
    if (element === 'physical') { dmg *= 0.5; blocked = 'armored'; }
    if (element === 'shatter') { dmg *= 1.5; weak = true; removeStatus(st, target, 'armored'); }
  }
  if (has(target, 'guard')) { dmg *= 0.5; blocked = blocked ?? 'guard'; }
  const amount = Math.max(1, Math.round(dmg));
  target.hp = Math.max(0, target.hp - amount);
  st.events.push({ t: 'damage', target: target.id, amount, element, weak, blocked });
  if (target.side === 'party') {
    for (const d of alive(st, 'party')) {
      if (d.kind === 'dharshna') setRes(st, d, 'heat', Math.min(100, (d.res.heat ?? 0) + (amount / target.stats.maxHp) * 60));
    }
  }
  if (target.hp <= 0) kill(st, target, element);
  return amount;
}

function heal(st: BattleState, u: Unit, amount: number) {
  if (u.dead) return;
  const a = Math.max(0, Math.min(u.stats.maxHp - u.hp, Math.round(amount)));
  u.hp += a;
  st.events.push({ t: 'heal', target: u.id, amount: a });
}

function setRes(st: BattleState, u: Unit, key: 'ce' | 'ammo' | 'heat', value: number) {
  u.res[key] = Math.round(value);
  st.events.push({ t: 'resource', unit: u.id, key, value: u.res[key]! });
}

// ------------------------------------------------------------------ turn flow
/** Start-of-turn upkeep. Returns false if the unit loses this turn. */
function startTurn(st: BattleState, u: Unit): boolean {
  removeStatus(st, u, 'guard');
  if (u.meldCooldown) u.meldCooldown -= 1;

  const ink = getStatus(u, 'ink');
  if (ink) {
    ink.turns -= 1;
    if (ink.turns <= 0) {
      u.statuses = u.statuses.filter((s) => s.id !== 'ink');
      u.hp = Math.round(u.stats.maxHp * 0.5);
      st.events.push({ t: 'reform', target: u.id });
      u.intent = chooseIntent(st, u);
    }
    return false;
  }

  const doom = getStatus(u, 'doom');
  if (doom) {
    doom.turns -= 1;
    st.events.push({ t: 'doom', target: u.id, left: doom.turns });
    if (doom.turns <= 0) {
      u.statuses = u.statuses.filter((s) => s.id !== 'doom');
      kill(st, u, 'doom');
      return false;
    }
  }

  if (has(u, 'shadow')) {
    heal(st, u, u.stats.maxHp * 0.12);
    return false;
  }
  if (u.kind === 'dhanasree' && u.res.ce !== undefined) setRes(st, u, 'ce', Math.min(u.res.ceMax ?? 6, u.res.ce + 1));
  if (u.kind === 'dharshna' && has(u, 'fear')) setRes(st, u, 'heat', Math.max(0, (u.res.heat ?? 0) - 15));
  if (has(u, 'starving') && rand(st) < 0.15) {
    st.events.push({ t: 'fail', unit: u.id, reason: loc('A migraine splits his head. He can\'t move.', 'Thalavali. Asaiya mudiyala.') });
    return false;
  }
  return true;
}

function endTurn(st: BattleState, u: Unit, mult: number) {
  // Timed statuses count down as the owner's turn ends, so "2 turns" covers two of its turns.
  for (const s of [...u.statuses]) {
    if (s.turns > 0 && s.id !== 'doom' && s.id !== 'ink') {
      s.turns -= 1;
      if (s.turns === 0) removeStatus(st, u, s.id);
    }
  }
  u.next = st.time + turnDelay(u, mult);
  st.active = null;
  st.awaitingInput = false;
  st.turns += 1;
  st.freeUsed = [];
}

function checkOutcome(st: BattleState) {
  if (st.outcome) return;
  if (alive(st, 'party').length === 0) st.outcome = 'lost';
  else if (alive(st, 'enemy').length === 0) st.outcome = 'won';
  if (st.outcome) {
    st.active = null;
    st.awaitingInput = false;
    st.events.push({ t: 'outcome', result: st.outcome });
  }
}

function snapshot(st: BattleState): string {
  return JSON.stringify({ ...st, snapshots: [], events: [] });
}

/**
 * Runs one step: finds the next unit, applies its start-of-turn effects, and if it's an enemy,
 * performs its action. Stops (awaitingInput = true) when a party member can act.
 */
export function advance(st: BattleState): void {
  if (st.outcome || st.awaitingInput) return;
  const u = nextActor(st);
  if (!u) return;
  st.time = u.next;
  st.active = u.id;
  st.freeUsed = [];
  st.events.push({ t: 'turn', unit: u.id });
  const canAct = startTurn(st, u);
  checkOutcome(st);
  if (st.outcome) return;
  if (!canAct || u.dead) {
    endTurn(st, u, 1);
    return;
  }
  if (u.side === 'party') {
    if (u.kind === 'dhanasree') {
      st.snapshots.push(snapshot(st));
      if (st.snapshots.length > 6) st.snapshots.shift();
    }
    st.awaitingInput = true;
    return;
  }
  enemyAct(st, u);
  checkOutcome(st);
  if (!st.outcome) endTurn(st, u, SKILLS[u.intent?.skill ?? 'lash']?.delay ?? 1);
  if (!u.dead && !has(u, 'ink')) u.intent = chooseIntent(st, u);
}

// ------------------------------------------------------------------ party commands
export function attackSkillOf(u: Unit): string {
  return u.skills[0] ?? 'strike';
}

export function skillUsable(st: BattleState, u: Unit, id: string): { ok: boolean; why?: string } {
  const s = SKILLS[id];
  if (!s) return { ok: false, why: 'unknown' };
  if (s.free && st.freeUsed.includes(id)) return { ok: false, why: 'once per turn' };
  if (s.oncePerBattle && id === 'rewind' && st.rewindUsed) return { ok: false, why: 'already used' };
  if (id === 'rewind' && st.snapshots.length < 2) return { ok: false, why: 'nothing to undo yet' };
  if (id === 'flee' && !st.canFlee) return { ok: false, why: "can't run" };
  if (id === 'item' && !(st.inventory.red_rosoar! > 0)) return { ok: false, why: 'none left' };
  for (const [k, v] of Object.entries(s.cost ?? {})) {
    if ((u.res[k as 'ce'] ?? 0) < (v ?? 0)) return { ok: false, why: `needs ${v} ${k}` };
  }
  for (const [k, v] of Object.entries(s.needs ?? {})) {
    if ((u.res[k as 'ce'] ?? 0) < (v ?? 0)) return { ok: false, why: `needs ${v} ${k}` };
  }
  if (id === 'soul_absorb' && !alive(st, 'enemy').some((e) => has(e, 'doom'))) return { ok: false, why: 'no Doomed foe' };
  return { ok: true };
}

export function validTargets(st: BattleState, u: Unit, skill: SkillDef): Unit[] {
  switch (skill.target) {
    case 'self': return [u];
    case 'ally': return alive(st, 'party');
    case 'party': return alive(st, 'party');
    case 'all_enemies': return alive(st, 'enemy');
    case 'enemy': {
      let list = alive(st, 'enemy').filter((e) => skill.hitsInk || !has(e, 'ink'));
      if (skill.id === 'soul_absorb') list = list.filter((e) => has(e, 'doom'));
      return list;
    }
  }
}

export interface ActResult { ok: boolean; why?: string }

export function act(st: BattleState, actorId: string, skillId: string, targetId?: string): ActResult {
  const u = unit(st, actorId);
  if (!u || st.active !== actorId || !st.awaitingInput || st.outcome) return { ok: false, why: 'not your turn' };
  const skill = SKILLS[skillId];
  if (!skill) return { ok: false, why: 'unknown skill' };
  const known = u.skills.includes(skillId) || ['defend', 'item', 'flee', 'strike'].includes(skillId);
  if (!known) return { ok: false, why: 'unknown skill' };
  const usable = skillUsable(st, u, skillId);
  if (!usable.ok) return usable;

  if (skillId === 'rewind') return doRewind(st);

  const candidates = validTargets(st, u, skill);
  let targets: Unit[];
  if (skill.target === 'all_enemies' || skill.target === 'party') targets = candidates;
  else if (skill.target === 'self') targets = [u];
  else {
    const t = candidates.find((c) => c.id === targetId);
    if (!t) return { ok: false, why: 'invalid target' };
    targets = [t];
  }
  for (const [k, v] of Object.entries(skill.cost ?? {})) setRes(st, u, k as 'ce', (u.res[k as 'ce'] ?? 0) - (v ?? 0));
  st.events.push({ t: 'act', unit: u.id, skill: skillId, targets: targets.map((t) => t.id) });
  applySkill(st, u, skill, targets);
  checkOutcome(st);
  if (skill.free) {
    st.freeUsed.push(skillId);
    return { ok: true };
  }
  if (!st.outcome) endTurn(st, u, skill.delay);
  return { ok: true };
}

function doRewind(st: BattleState): ActResult {
  const prev = st.snapshots[st.snapshots.length - 2];
  if (!prev) return { ok: false, why: 'nothing to undo yet' };
  const kept = st.snapshots.slice(0, -1);
  const restored = JSON.parse(prev) as BattleState;
  Object.assign(st, restored);
  st.snapshots = kept;
  st.rewindUsed = true;
  st.events = [{ t: 'rewind' }];
  st.active = restored.active;
  st.awaitingInput = true;
  const d = unit(st, st.active!);
  if (d) addStatus(st, d, 'foresight', 3);
  return { ok: true };
}

function applySkill(st: BattleState, u: Unit, s: SkillDef, targets: Unit[]) {
  const t0 = targets[0]!;
  switch (s.id) {
    case 'defend':
      addStatus(st, u, 'guard', -1);
      return;
    case 'dream_shield':
      heal(st, u, u.stats.maxHp * 0.34);
      addStatus(st, u, 'guard', -1);
      return;
    case 'item':
      st.inventory.red_rosoar = (st.inventory.red_rosoar ?? 0) - 1;
      heal(st, t0, t0.stats.maxHp * 0.45);
      return;
    case 'flee': {
      const avg = (l: Unit[]) => l.reduce((a, x) => a + x.stats.spd, 0) / Math.max(1, l.length);
      const chance = Math.min(0.9, Math.max(0.2, 0.55 + (avg(alive(st, 'party')) - avg(standing(st, 'enemy'))) * 0.05));
      if (rand(st) < chance) {
        st.outcome = 'fled';
        st.events.push({ t: 'outcome', result: 'fled' });
      } else {
        st.events.push({ t: 'fail', unit: u.id, reason: loc('No way out!', 'Thappikka mudiyala!') });
      }
      return;
    }
    case 'death_touch': {
      if (has(t0, 'shadow')) { dealDamage(st, u, t0, 0, 'soul'); return; }
      const why = t0.tags.includes('boss') ? loc('Its soul is beyond his reach.', 'Adhoda aanma ettavillai.')
        : t0.tags.includes('glacian') ? loc('The Magic Guard turns his touch aside.', 'Magic Guard thodala thadukudhu.')
        : has(t0, 'armored') ? loc('His hand meets armour, not skin. Death Touch fails.', 'Kai armour-a thaan thodudhu. Saavu Thodal velai seiyyala.')
        : null;
      dealDamage(st, u, t0, s.power, 'physical');
      if (why) { st.events.push({ t: 'fail', unit: u.id, reason: why }); return; }
      if (!t0.dead && !has(t0, 'ink')) {
        addStatus(st, t0, 'doom', DOOM_TURNS);
        const d = getStatus(t0, 'doom');
        if (d) d.turns = DOOM_TURNS;
        st.events.push({ t: 'doom', target: t0.id, left: DOOM_TURNS });
      }
      return;
    }
    case 'soul_absorb': {
      if (!has(t0, 'doom')) {
        st.events.push({ t: 'fail', unit: u.id, reason: loc('There is no marked soul to take.', 'Edukka aanma illa.') });
        return;
      }
      t0.hp = 0;
      t0.dead = true;
      t0.statuses = [];
      st.events.push({ t: 'destroy', target: t0.id, how: 'absorb' });
      heal(st, u, u.stats.maxHp * 0.5);
      st.soulHunger = Math.max(0, st.soulHunger - 45);
      st.soulsAbsorbed += 1;
      removeStatus(st, u, 'starving');
      return;
    }
    case 'light_cube': {
      const was = t0.dead;
      dealDamage(st, u, t0, s.power, 'light');
      if (!was && !t0.dead && !has(t0, 'ink')) addStatus(st, t0, 'blind', 2);
      return;
    }
    case 'loop_sense':
      addStatus(st, u, 'foresight', 3);
      return;
    case 'dread':
      addStatus(st, t0, 'fear', 2);
      return;
    case 'shadow_meld':
      addStatus(st, u, 'shadow', 2);
      u.meldCooldown = 5;
      return;
    case 'drain': {
      const d = dealDamage(st, u, t0, s.power, 'soul');
      heal(st, u, d * 0.5);
      return;
    }
    case 'fire_whip':
      for (const t of targets) dealDamage(st, u, t, s.power, 'fire');
      setRes(st, u, 'heat', Math.min(100, (u.res.heat ?? 0) + 10));
      return;
    default:
      for (const t of targets) dealDamage(st, u, t, s.power, s.element, { pierce: s.pierce });
  }
}

// ------------------------------------------------------------------ enemy AI
function chooseIntent(st: BattleState, u: Unit): { skill: string; target: string } | undefined {
  const foes = alive(st, 'party');
  if (!foes.length) return undefined;
  const lowHp = u.hp < u.stats.maxHp * 0.4;
  const options = u.skills.map((sk) => {
    let w = 0;
    switch (sk) {
      case 'lash': w = 5; break;
      case 'crush': w = 4; break;
      case 'drain': w = u.hp < u.stats.maxHp * 0.7 ? 5 : 2; break;
      case 'dread': w = foes.some((f) => !has(f, 'fear')) ? 2 : 0; break;
      case 'shadow_meld': w = lowHp && !(u.meldCooldown ?? 0) ? 6 : 0; break;
      case 'rifle_butt': w = 5; break;
      case 'volley': w = foes.length > 1 ? 3 : 1; break;
      case 'saber': w = 4; break;
    }
    return { item: sk, weight: w };
  });
  const skill = pickWeighted(st.rng, options);
  if (skill === 'shadow_meld') return { skill, target: u.id };
  const pool = skill === 'dread' ? foes.filter((f) => !has(f, 'fear')) : foes;
  const target = pickWeighted(st.rng, (pool.length ? pool : foes).map((f) => ({ item: f.id, weight: 1.5 - f.hp / f.stats.maxHp })));
  return { skill, target };
}

function enemyAct(st: BattleState, u: Unit) {
  let intent = u.intent ?? chooseIntent(st, u);
  if (!intent) return;
  const skill = SKILLS[intent.skill]!;
  let target = unit(st, intent.target);
  if (skill.target !== 'self' && (!target || target.dead)) {
    const foes = alive(st, 'party');
    target = foes[Math.floor(rand(st) * foes.length)];
    if (!target) return;
    intent = { skill: intent.skill, target: target.id };
  }
  st.events.push({ t: 'act', unit: u.id, skill: skill.id, targets: [skill.target === 'self' ? u.id : target!.id] });
  applySkill(st, u, skill, [skill.target === 'self' ? u : target!]);
}

// ------------------------------------------------------------------ results
export interface BattleResult {
  outcome: 'won' | 'lost' | 'fled';
  xp: number;
  shards: number;
  drops: Record<string, number>;
  party: { id: string; hp: number }[];
  soulHunger: number;
  soulsAbsorbed: number;
  ammo: number;
  inventory: Record<string, number>;
}

export function battleResult(st: BattleState): BattleResult {
  const won = st.outcome === 'won';
  const enemies = st.units.filter((u) => u.side === 'enemy');
  const drops: Record<string, number> = {};
  if (won) {
    for (const e of enemies) for (const d of e.drops ?? []) if (rand(st) < d.chance) drops[d.item] = (drops[d.item] ?? 0) + 1;
  }
  const dh = st.units.find((u) => u.kind === 'dhanasree');
  return {
    outcome: st.outcome ?? 'fled',
    xp: won ? enemies.reduce((a, e) => a + (e.xp ?? 0), 0) : 0,
    shards: won ? enemies.reduce((a, e) => a + (e.shards ?? 0), 0) : 0,
    drops,
    party: st.units.filter((u) => u.side === 'party').map((u) => ({ id: u.id, hp: Math.max(u.dead ? 1 : 0, u.hp) })),
    soulHunger: st.dream ? st.soulHunger : Math.min(100, st.soulHunger + HUNGER_PER_BATTLE),
    soulsAbsorbed: st.soulsAbsorbed,
    ammo: dh?.res.ammo ?? -1,
    inventory: st.inventory,
  };
}
