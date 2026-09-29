/**
 * Parser for `.story` files, the writer-friendly script format (plan.md, "Script format and localisation").
 *
 *   # comment
 *   @venture 2 15
 *   @title The Winter Path
 *     ta: Winter Path
 *   @scene winter_path  @time 1 Blue-1020, morning
 *   RAGUL (shocked): Planet-ah? So this isn't Earth?
 *     ta: Planet-ah? Appo idhu Boomi illaya?
 *   NARRATOR: Snow falls without a sound.
 *     ta: Sathame illama pani kottudhu.
 *   @choice home
 *     - How do we get home? -> ask_home
 *       ta: Veetuku yepdi poradhu? -> ask_home
 *     - Say nothing -> quiet
 *       ta: Onnum pesadha
 *   @label ask_home
 *   @set slice_asked_about_home
 *   @if !slice_met_dhanasree -> skip
 *   @battle vale_pair
 *   @give red_rosoar 2
 *   @end
 *
 * Every text-bearing node (dialogue, narration, titles, warnings, choice options) takes an indented
 * `ta:` line with the Tanglish version. Several commands may share one line (`@scene x  @time y`).
 */
import type { Loc } from '../core/Localization';

export interface TextNode { en: string; ta?: string }

export type Cond =
  | { flag: string; op: 'truthy' | 'falsy' }
  | { flag: string; op: '==' | '!=' | '>' | '>=' | '<' | '<='; value: string | number | boolean };

export type StoryNode =
  | { k: 'line'; speaker: string; mood?: string; text: TextNode; line: number }
  | { k: 'title'; text: TextNode; line: number }
  | { k: 'warn'; text: TextNode; line: number }
  | { k: 'objective'; text: TextNode; line: number }
  | { k: 'caption'; text: TextNode; line: number }
  | { k: 'choice'; id?: string; options: { text: TextNode; target: string; line: number }[]; line: number }
  | { k: 'cmd'; name: string; args: string[]; line: number }
  | { k: 'set'; flag: string; value: string | number | boolean; line: number }
  | { k: 'if'; cond: Cond; target: string; line: number }
  | { k: 'goto'; target: string; line: number }
  | { k: 'label'; name: string; line: number }
  | { k: 'end'; line: number };

export interface ParseError { line: number; message: string }

export interface Script {
  file: string;
  nodes: StoryNode[];
  labels: Record<string, number>;
  errors: ParseError[];
}

/** Commands that take arguments and need no translation. Anything else is a parse error. */
export const COMMANDS: Record<string, { min: number; max: number }> = {
  venture: { min: 2, max: 2 },
  scene: { min: 1, max: 1 },
  time: { min: 1, max: 99 },
  music: { min: 1, max: 1 },
  sfx: { min: 1, max: 1 },
  fx: { min: 1, max: 4 },
  wait: { min: 1, max: 1 },
  battle: { min: 1, max: 1 },
  give: { min: 1, max: 2 },
  take: { min: 1, max: 2 },
  ability: { min: 1, max: 1 },
  join: { min: 1, max: 2 },
  leave: { min: 1, max: 1 },
  codex: { min: 1, max: 1 },
  rel: { min: 3, max: 3 },
  tag: { min: 1, max: 1 },
  card: { min: 0, max: 0 },
  portrait: { min: 2, max: 2 },
  /** Sets the playable party, leader first: `@party nithish ragul`. */
  party: { min: 1, max: 4 },
  /** Moves to another room and, with a label, carries on in this script there: `@room mit_road start after_road`. */
  room: { min: 2, max: 3 },
  /** Moves the player to a spawn marker in the current room. */
  warp: { min: 1, max: 1 },
  /** Clears the objective line. */
  done: { min: 0, max: 0 },
  clue: { min: 1, max: 1 },
  wordbattle: { min: 1, max: 1 },
  /** Runs another script from its `start` label once this one ends. */
  next: { min: 1, max: 1 },
  /** Saves, so loading resumes this script at the given label. */
  save: { min: 1, max: 1 },
  /** Ends the act: the credits roll, then the title screen. */
  credits: { min: 0, max: 0 },
  /** Adds to a numeric flag: `@add v04_asked` (1) or `@add score 5`. */
  add: { min: 1, max: 2 },
  // ---- Staging (see scenes/StageScene.ts). A `@scene` casts everyone who speaks in it unless a `@cast` follows.
  /** Who is on stage: `@cast guy1@0.35:sit krishnaa@0.7<` (x 0..1, `<`/`>` facing, `:pose`, `^` at the back). */
  cast: { min: 1, max: 10 },
  /** Walks someone on: `@enter krishnaa right 0.7` (from left/right or an x, to an x). */
  enter: { min: 2, max: 3 },
  /** Walks someone off: `@exit krishnaa right`. */
  exit: { min: 1, max: 2 },
  /** `@pose dhanasree dance` (idle, talk, sit, kneel, dance, phone, think, point, ko, run). */
  pose: { min: 2, max: 2 },
  /** Furniture on stage, behind the cast: `@prop desk@0.4 chair@0.42 bed@0.8^` (`^` further back, `<` flipped). */
  prop: { min: 1, max: 8 },
  /** `@face ragul left` or `@face ragul dhanasree`. */
  face: { min: 2, max: 2 },
  /** Camera: `@shot on ragul`, `@shot close ragul`, `@shot two a b`, `@shot wide`, `@shot push`, `@shot orbit`, `@shot slow`, `@shot auto`… */
  shot: { min: 1, max: 3 },
};

const TEXT_COMMANDS = new Set(['title', 'warn', 'objective', 'caption']);

export function parseValue(raw: string): string | number | boolean {
  const s = raw.trim();
  if (s === 'true') return true;
  if (s === 'false') return false;
  if (/^-?\d+(\.\d+)?$/.test(s)) return Number(s);
  const q = /^"(.*)"$/.exec(s);
  return q ? q[1]! : s;
}

export function parseCond(raw: string): Cond | null {
  const s = raw.trim();
  const m = /^([a-z_][\w.]*)\s*(==|!=|>=|<=|>|<)\s*(.+)$/i.exec(s);
  if (m) return { flag: m[1]!, op: m[2] as '==', value: parseValue(m[3]!) };
  const n = /^(!?)([a-z_][\w.]*)$/i.exec(s);
  if (n) return { flag: n[2]!, op: n[1] ? 'falsy' : 'truthy' };
  return null;
}

/** Splits "@scene a  @time b c" into ["scene a", "time b c"]. */
function splitCommands(body: string): string[] {
  return body.split(/\s+@(?=[a-z])/i).map((p) => p.replace(/^@/, '').trim()).filter(Boolean);
}

export function parseStory(source: string, file = '<story>'): Script {
  const nodes: StoryNode[] = [];
  const labels: Record<string, number> = {};
  const errors: ParseError[] = [];
  const lines = source.replace(/\r\n?/g, '\n').split('\n');

  // The node (or choice option) that a following `ta:` line attaches to.
  let lastText: TextNode | null = null;
  let lastIndent = -1;
  let openChoice: Extract<StoryNode, { k: 'choice' }> | null = null;

  for (let i = 0; i < lines.length; i++) {
    const no = i + 1;
    const rawLine = lines[i]!;
    if (!rawLine.trim() || rawLine.trim().startsWith('#')) continue;
    const indent = rawLine.length - rawLine.trimStart().length;
    const line = rawLine.trim();

    // Tanglish continuation.
    const ta = /^ta:\s?(.*)$/.exec(line);
    if (ta) {
      if (!lastText || indent <= lastIndent) {
        errors.push({ line: no, message: '"ta:" must be indented under the line it translates' });
      } else if (lastText.ta !== undefined) {
        errors.push({ line: no, message: 'duplicate "ta:" line' });
      } else {
        // A choice option's "ta:" may repeat "-> target"; the target always comes from the English line.
        lastText.ta = ta[1]!.replace(/\s*->\s*[\w.]+\s*$/, '').trim();
      }
      continue;
    }

    // Choice option.
    if (line.startsWith('- ') && openChoice && indent > 0) {
      const m = /^-\s+(.+?)\s*->\s*([\w.]+)\s*$/.exec(line);
      if (!m) {
        errors.push({ line: no, message: 'choice option must look like "- Text -> label"' });
        continue;
      }
      const opt = { text: { en: m[1]! } as TextNode, target: m[2]!, line: no };
      openChoice.options.push(opt);
      lastText = opt.text;
      lastIndent = indent;
      continue;
    }
    if (openChoice && openChoice.options.length === 0) {
      errors.push({ line: openChoice.line, message: '@choice has no options' });
    }
    openChoice = null;
    lastText = null;

    if (indent > 0) {
      errors.push({ line: no, message: 'unexpected indentation' });
      continue;
    }

    if (line.startsWith('@')) {
      for (const part of splitCommands(line)) {
        const sp = part.indexOf(' ');
        const name = (sp < 0 ? part : part.slice(0, sp)).toLowerCase();
        const rest = sp < 0 ? '' : part.slice(sp + 1).trim();
        if (TEXT_COMMANDS.has(name)) {
          if (!rest) errors.push({ line: no, message: `@${name} needs text` });
          const node = { k: name as 'title' | 'warn' | 'objective' | 'caption', text: { en: rest }, line: no };
          nodes.push(node);
          lastText = node.text;
          lastIndent = indent;
        } else if (name === 'choice') {
          openChoice = { k: 'choice', id: rest || undefined, options: [], line: no };
          nodes.push(openChoice);
        } else if (name === 'label') {
          if (!/^[\w.]+$/.test(rest)) errors.push({ line: no, message: `bad label "${rest}"` });
          else if (rest in labels) errors.push({ line: no, message: `duplicate label "${rest}"` });
          else labels[rest] = nodes.length;
          nodes.push({ k: 'label', name: rest, line: no });
        } else if (name === 'goto') {
          nodes.push({ k: 'goto', target: rest, line: no });
        } else if (name === 'end') {
          nodes.push({ k: 'end', line: no });
        } else if (name === 'set') {
          const m = /^([a-z_][\w.]*)\s*(?:=\s*(.+))?$/i.exec(rest);
          if (!m) errors.push({ line: no, message: '@set needs "flag" or "flag = value"' });
          else nodes.push({ k: 'set', flag: m[1]!, value: m[2] !== undefined ? parseValue(m[2]) : true, line: no });
        } else if (name === 'if') {
          const m = /^(.+?)\s*->\s*([\w.]+)$/.exec(rest);
          const cond = m ? parseCond(m[1]!) : null;
          if (!m || !cond) errors.push({ line: no, message: '@if needs "condition -> label"' });
          else nodes.push({ k: 'if', cond, target: m[2]!, line: no });
        } else if (name in COMMANDS) {
          const args = name === 'time' ? (rest ? [rest] : []) : rest ? rest.split(/\s+/) : [];
          const spec = COMMANDS[name]!;
          if (args.length < spec.min || args.length > spec.max) {
            errors.push({ line: no, message: `@${name} takes ${spec.min === spec.max ? spec.min : `${spec.min}-${spec.max}`} argument(s)` });
          }
          nodes.push({ k: 'cmd', name, args, line: no });
        } else {
          errors.push({ line: no, message: `unknown command @${name}` });
        }
      }
      continue;
    }

    // Dialogue: SPEAKER (mood): text
    const d = /^([A-Z][A-Z0-9_]*)(?:\s*\(([^)]*)\))?\s*:\s*(.+)$/.exec(line);
    if (d) {
      const node = { k: 'line' as const, speaker: d[1]!.toLowerCase(), mood: d[2]?.trim() || undefined, text: { en: d[3]!.trim() }, line: no };
      nodes.push(node);
      lastText = node.text;
      lastIndent = indent;
      continue;
    }
    errors.push({ line: no, message: `can't read this line: "${line.slice(0, 40)}"` });
  }
  if (openChoice && openChoice.options.length === 0) errors.push({ line: openChoice.line, message: '@choice has no options' });

  for (const n of nodes) {
    const target = n.k === 'goto' || n.k === 'if' ? n.target : null;
    if (target && !(target in labels)) errors.push({ line: n.line, message: `unknown label "${target}"` });
    if (n.k === 'choice') {
      for (const o of n.options) if (!(o.target in labels)) errors.push({ line: o.line, message: `unknown label "${o.target}"` });
    }
  }
  return { file, nodes, labels, errors };
}

export function toLoc(t: TextNode): Loc {
  return { en: t.en, ta: t.ta ?? t.en };
}
