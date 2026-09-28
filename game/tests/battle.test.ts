import { describe, expect, test } from 'bun:test';
import {
  act, advance, battleResult, createBattle, has, previewTimeline, unit, HUNGER_PER_BATTLE, type BattleSetup,
} from '../src/battle/BattleCore';
import type { BattleState } from '../src/battle/types';
import { statsAt, type MemberId } from '../src/data/characters';
import { BATTLES, type BattleDef } from '../src/data/enemies';

function setup(party: MemberId[], enemies: string[], extra: Partial<BattleSetup> = {}): BattleState {
  const def: BattleDef = { id: 'test', enemies, canFlee: true, music: 'battle' };
  return createBattle({
    def,
    party: party.map((id) => ({ id, stats: statsAt(id, 5), hp: statsAt(id, 5).maxHp })),
    soulHunger: 0,
    ammo: 6,
    inventory: { red_rosoar: 1 },
    seed: 1234,
    ...extra,
  });
}

/** Makes `id` act next by moving it to the front of the timeline, then advances to its turn. */
function turnOf(st: BattleState, id: string) {
  st.active = null;
  st.awaitingInput = false;
  const u = unit(st, id)!;
  u.next = Math.min(...st.units.map((x) => x.next)) - 1;
  advance(st);
  return st;
}

/** Gives `id` a turn in which it does nothing (enemies skip their action), to count statuses down. */
function passTurn(st: BattleState, id: string) {
  const u = unit(st, id)!;
  const intent = u.intent;
  if (u.side === 'enemy') u.intent = { skill: 'shadow_meld', target: u.id };
  turnOf(st, id);
  if (st.awaitingInput) act(st, id, 'defend');
  if (u.side === 'enemy' && !u.dead) {
    u.statuses = u.statuses.filter((s) => s.id !== 'shadow');
    u.intent = intent;
  }
}

describe('timeline', () => {
  test('faster units act more often', () => {
    const st = setup(['ragul', 'dhanasree'], ['vale_husk']);
    const order = previewTimeline(st, 20);
    const count = (id: string) => order.filter((x) => x === id).length;
    expect(count('dhanasree')).toBeGreaterThan(count('vale_husk#0'));
  });

  test('same seed, same battle', () => {
    const a = setup(['ragul'], ['vale', 'vale']);
    const b = setup(['ragul'], ['vale', 'vale']);
    expect(JSON.stringify(a.units)).toBe(JSON.stringify(b.units));
  });

  test('ambush puts the party first', () => {
    const st = setup(['ragul'], ['vale', 'vale'], { initiative: 'party' });
    expect(previewTimeline(st, 1)[0]).toBe('ragul');
  });
});

describe('Death Touch and Doom', () => {
  test('Doom kills a normal foe at the start of its third turn', () => {
    const st = setup(['ragul'], ['vale_husk']);
    const v = unit(st, 'vale_husk#0')!;
    v.tags = []; // a "normal" foe: no Vale regeneration
    v.statuses = [];
    turnOf(st, 'ragul');
    expect(act(st, 'ragul', 'death_touch', v.id).ok).toBe(true);
    expect(has(v, 'doom')).toBe(true);
    passTurn(st, v.id);
    expect(v.dead).toBe(false);
    passTurn(st, v.id);
    expect(v.dead).toBe(false);
    turnOf(st, v.id);
    expect(v.dead).toBe(true);
    expect(st.outcome).toBe('won');
  });

  test('armour blocks Death Touch until the Resonance Cube breaks it', () => {
    const st = setup(['ragul', 'dhanasree'], ['vale_husk']);
    const v = unit(st, 'vale_husk#0')!;
    turnOf(st, 'ragul');
    act(st, 'ragul', 'death_touch', v.id);
    expect(has(v, 'doom')).toBe(false);
    expect(st.events.some((e) => e.t === 'fail')).toBe(true);

    turnOf(st, 'dhanasree');
    act(st, 'dhanasree', 'resonance_cube', v.id);
    expect(has(v, 'armored')).toBe(false);

    turnOf(st, 'ragul');
    act(st, 'ragul', 'death_touch', v.id);
    expect(has(v, 'doom')).toBe(true);
  });

  test('Soul Absorb takes a Doomed Vale for good and feeds Ragul', () => {
    const st = setup(['ragul'], ['vale', 'vale'], { soulHunger: 80 });
    const r = unit(st, 'ragul')!;
    expect(has(r, 'starving')).toBe(true);
    const v = unit(st, 'vale#0')!;
    // A migraine can cost Ragul the turn while he is starving; keep giving him turns until he can act.
    const ragulTurn = () => { do turnOf(st, 'ragul'); while (!st.awaitingInput); };
    ragulTurn();
    act(st, 'ragul', 'death_touch', v.id);
    r.hp = 10;
    ragulTurn();
    expect(act(st, 'ragul', 'soul_absorb', v.id).ok).toBe(true);
    expect(v.dead).toBe(true);
    expect(has(v, 'ink')).toBe(false);
    expect(r.hp).toBeGreaterThan(10);
    expect(has(r, 'starving')).toBe(false);
    expect(st.soulHunger).toBe(35);
    expect(st.soulsAbsorbed).toBe(1);
  });
});

describe('Vales', () => {
  test('ordinary damage bursts a Vale into ink, and it re-forms', () => {
    const st = setup(['ragul'], ['vale', 'vale']);
    const v = unit(st, 'vale#0')!;
    v.hp = 1;
    turnOf(st, 'ragul');
    act(st, 'ragul', 'strike', v.id);
    expect(v.dead).toBe(false);
    expect(has(v, 'ink')).toBe(true);
    turnOf(st, v.id); // 1 turn left
    expect(has(v, 'ink')).toBe(true);
    turnOf(st, v.id); // re-forms
    expect(has(v, 'ink')).toBe(false);
    expect(v.hp).toBe(Math.round(v.stats.maxHp * 0.5));
  });

  test('fire finishes a Vale for good', () => {
    const st = setup(['dharshna'], ['vale', 'vale']);
    const v = unit(st, 'vale#0')!;
    v.hp = 1;
    turnOf(st, 'dharshna');
    act(st, 'dharshna', 'fire_whip', v.id);
    expect(v.dead).toBe(true);
    expect(has(v, 'ink')).toBe(false);
  });

  test('light finishes a Vale lying as ink; strikes cannot', () => {
    const st = setup(['ragul', 'dhanasree'], ['vale', 'vale']);
    const v = unit(st, 'vale#0')!;
    v.hp = 1;
    turnOf(st, 'ragul');
    act(st, 'ragul', 'strike', v.id);
    expect(has(v, 'ink')).toBe(true);
    turnOf(st, 'ragul');
    expect(act(st, 'ragul', 'strike', v.id).ok).toBe(false); // not a valid target
    turnOf(st, 'dhanasree');
    expect(act(st, 'dhanasree', 'light_cube', v.id).ok).toBe(true);
    expect(v.dead).toBe(true);
  });

  test('shadow form is immune to everything except light, which destroys it', () => {
    const st = setup(['ragul', 'dhanasree'], ['vale', 'vale']);
    const v = unit(st, 'vale#0')!;
    v.statuses.push({ id: 'shadow', turns: 2 });
    const hp = v.hp;
    turnOf(st, 'ragul');
    act(st, 'ragul', 'strike', v.id);
    expect(v.hp).toBe(hp);
    turnOf(st, 'dhanasree');
    act(st, 'dhanasree', 'light_cube', v.id);
    expect(v.dead).toBe(true);
  });
});

describe('Heat', () => {
  test('rises when the party is hurt and drains under Fear', () => {
    const st = setup(['ragul', 'dharshna'], ['vale', 'vale']);
    const d = unit(st, 'dharshna')!;
    const v = unit(st, 'vale#0')!;
    const heat0 = d.res.heat!;
    v.intent = { skill: 'lash', target: 'ragul' };
    turnOf(st, v.id);
    expect(d.res.heat!).toBeGreaterThan(heat0);
    const heat1 = d.res.heat!;
    d.statuses.push({ id: 'fear', turns: 2 });
    turnOf(st, 'dharshna');
    expect(d.res.heat!).toBe(Math.max(0, heat1 - 15));
  });

  test('fire laser needs 70 Heat', () => {
    const st = setup(['dharshna'], ['vale']);
    const d = unit(st, 'dharshna')!;
    turnOf(st, 'dharshna');
    expect(act(st, 'dharshna', 'fire_laser', 'vale#0').ok).toBe(false);
    d.res.heat = 80;
    expect(act(st, 'dharshna', 'fire_laser', 'vale#0').ok).toBe(true);
    expect(d.res.heat).toBe(10);
  });
});

describe('Rewind', () => {
  test('undoes everything since Dhanasree\'s previous turn, once per battle', () => {
    const st = setup(['ragul', 'dhanasree'], ['vale', 'vale']);
    turnOf(st, 'dhanasree');
    const before = JSON.stringify(st.units.map((u) => [u.id, u.hp, u.dead]));
    act(st, 'dhanasree', 'staff_strike', 'vale#0');
    const v1 = unit(st, 'vale#1')!;
    v1.intent = { skill: 'lash', target: 'ragul' };
    turnOf(st, 'vale#1');
    turnOf(st, 'dhanasree');
    expect(JSON.stringify(st.units.map((u) => [u.id, u.hp, u.dead]))).not.toBe(before);

    expect(act(st, 'dhanasree', 'rewind').ok).toBe(true);
    expect(JSON.stringify(st.units.map((u) => [u.id, u.hp, u.dead]))).toBe(before);
    expect(st.rewindUsed).toBe(true);
    expect(st.active).toBe('dhanasree');
    expect(st.awaitingInput).toBe(true);
    expect(has(unit(st, 'dhanasree')!, 'foresight')).toBe(true);

    act(st, 'dhanasree', 'staff_strike', 'vale#0');
    turnOf(st, 'dhanasree');
    expect(act(st, 'dhanasree', 'rewind').ok).toBe(false);
  });

  test('is unavailable on the first turn', () => {
    const st = setup(['dhanasree'], ['vale']);
    turnOf(st, 'dhanasree');
    expect(act(st, 'dhanasree', 'rewind').ok).toBe(false);
  });
});

describe('results', () => {
  test('Soul Hunger rises after every battle and the handgun spends ammo', () => {
    const st = setup(['ragul', 'dhanasree'], ['vale']);
    turnOf(st, 'dhanasree');
    act(st, 'dhanasree', 'handgun', 'vale#0');
    const r = battleResult(st);
    expect(r.ammo).toBe(5);
    expect(r.soulHunger).toBe(HUNGER_PER_BATTLE);
  });

  test('a whole scripted battle runs to an outcome', () => {
    const st = createBattle({
      def: BATTLES.vale_pack!,
      party: (['ragul', 'dhanasree'] as MemberId[]).map((id) => ({ id, stats: statsAt(id, 8), hp: statsAt(id, 8).maxHp })),
      soulHunger: 20, ammo: 6, inventory: {}, seed: 7,
    });
    for (let i = 0; i < 400 && !st.outcome; i++) {
      advance(st);
      if (st.awaitingInput) {
        const u = unit(st, st.active!)!;
        const foe = st.units.find((e) => e.side === 'enemy' && !e.dead)!;
        const ink = has(foe, 'ink');
        let ok = false;
        if (u.kind === 'dhanasree' && (u.res.ce ?? 0) >= 2) ok = act(st, u.id, has(foe, 'armored') ? 'resonance_cube' : 'light_cube', foe.id).ok;
        if (!ok && !ink) ok = act(st, u.id, u.skills[0]!, foe.id).ok;
        if (!ok) act(st, u.id, 'defend');
      }
    }
    expect(st.outcome).not.toBeNull();
  });
});
