import { ABILITIES } from '../data/abilities';
import { CHARACTERS } from '../data/characters';
import { CLUES } from '../data/clues';
import { CODEX } from '../data/codex';
import { EARTH_SCENE_NAMES } from '../data/earthScenes';
import { ROOMS } from '../data/rooms';
import { WORD_BATTLES } from '../data/wordbattles';
import { BATTLES } from '../data/enemies';
import { FLAGS } from '../data/flags';
import { ITEMS } from '../data/items';
import { BANNED_TAGS, BANNED_WORDS, FX, MUSIC, SFX } from '../data/media';
import { SPEAKERS } from '../data/speakers';
import { parseStory, type TextNode } from './parser';

export interface LintIssue { file: string; line: number; message: string }

export interface LintContext {
  /** Background slugs available in the asset manifest (kind "env"). */
  scenes: Set<string>;
  /** Script names ("p01/v02") for checking `@next`; skipped when absent. */
  scripts?: Set<string>;
}

const known = (set: readonly string[] | Record<string, unknown>, v: string) =>
  Array.isArray(set) ? set.includes(v) : v in (set as Record<string, unknown>);

/** Checks one script: syntax, translations, references to game data, banned content. */
export function lintStory(source: string, file: string, ctx: LintContext): LintIssue[] {
  const script = parseStory(source, file);
  const out: LintIssue[] = script.errors.map((e) => ({ file, line: e.line, message: e.message }));
  const bad = (line: number, message: string) => out.push({ file, line, message });

  const checkText = (t: TextNode, line: number) => {
    if (!t.en.trim()) bad(line, 'empty English text');
    if (t.ta === undefined || !t.ta.trim()) bad(line, 'missing Tanglish ("ta:") translation');
    for (const re of BANNED_WORDS) {
      if (re.test(t.en) || re.test(t.ta ?? '')) bad(line, `banned word (${re.source})`);
    }
  };
  const checkFlag = (flag: string, line: number) => {
    if (!(flag in FLAGS) && !flag.startsWith('choice.')) bad(line, `unknown flag "${flag}" (declare it in src/data/flags.ts)`);
  };

  for (const n of script.nodes) {
    switch (n.k) {
      case 'line':
        if (!(n.speaker in SPEAKERS)) bad(n.line, `unknown speaker "${n.speaker.toUpperCase()}"`);
        checkText(n.text, n.line);
        break;
      case 'title':
      case 'warn':
      case 'objective':
        checkText(n.text, n.line);
        break;
      case 'choice':
        for (const o of n.options) checkText(o.text, o.line);
        break;
      case 'set':
      case 'if':
        checkFlag(n.k === 'set' ? n.flag : n.cond.flag, n.line);
        break;
      case 'cmd': {
        const a = n.args[0] ?? '';
        const check = (ok: boolean, what: string) => { if (!ok) bad(n.line, `unknown ${what} "${a}"`); };
        switch (n.name) {
          case 'scene': check(ctx.scenes.has(a) || EARTH_SCENE_NAMES.includes(a), 'scene (not an environment in asset-manifest.json or an Earth scene)'); break;
          case 'room':
            check(a in ROOMS, 'room');
            if (n.args[2] && !(n.args[2] in script.labels)) bad(n.line, `unknown label "${n.args[2]}"`);
            break;
          case 'save': if (!(a in script.labels)) bad(n.line, `unknown label "${a}"`); break;
          case 'party': for (const m of n.args) if (!(m in CHARACTERS)) bad(n.line, `unknown party member "${m}"`); break;
          case 'clue': check(a in CLUES, 'clue'); break;
          case 'wordbattle': check(a in WORD_BATTLES, 'word battle'); break;
          case 'next': if (ctx.scripts && !ctx.scripts.has(a)) bad(n.line, `unknown script "${a}"`); break;
          case 'battle': check(a in BATTLES, 'battle'); break;
          case 'give': case 'take': check(a in ITEMS, 'item'); break;
          case 'ability': check(a in ABILITIES, 'ability'); break;
          case 'join': case 'leave': check(a in CHARACTERS, 'party member'); break;
          case 'codex': check(a in CODEX, 'codex entry'); break;
          case 'music': check(known(MUSIC, a), 'music'); break;
          case 'sfx': check(known(SFX, a), 'sound'); break;
          case 'fx': check(known(FX, a), 'screen effect'); break;
          case 'portrait': if (!(a in SPEAKERS)) bad(n.line, `unknown speaker "${a}"`); break;
          case 'rel': if (!(a in SPEAKERS) || !((n.args[1] ?? '') in SPEAKERS)) bad(n.line, 'unknown speaker in @rel'); break;
          case 'tag': if (BANNED_TAGS.includes(a)) bad(n.line, `banned content tag "${a}"`); break;
          case 'venture': if (n.args.some((x) => !/^\d+$/.test(x))) bad(n.line, '@venture needs two numbers'); break;
          case 'wait': if (!/^\d+$/.test(a)) bad(n.line, '@wait needs milliseconds'); break;
        }
        break;
      }
    }
  }
  return out;
}
