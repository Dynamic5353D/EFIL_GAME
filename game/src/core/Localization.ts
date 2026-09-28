import { settings, type Lang } from './Settings';

/** Every piece of story text carries both languages. `ta` is Tanglish (Tamil in Latin script). */
export interface Loc {
  en: string;
  ta: string;
}

export const loc = (en: string, ta: string = en): Loc => ({ en, ta });

// Whole-word patterns. Tanglish spellings vary a lot, so each entry is a regex stem.
const PROFANITY: RegExp[] = [
  /f+u+c+k\w*/gi,
  /\bsh+i+t+\w*/gi,
  /\bbastard\w*/gi,
  /\bbitch\w*/gi,
  /\basshole\w*/gi,
  /\bdick\b/gi,
  /\botha+\b/gi,
  /\bommala\w*/gi,
  /\bp[u*]nda\w*/gi,
  /\bmay[iy]*re+y*\w*/gi,
  /\bmairu\w*/gi,
  /\bkammunaat+[iy]\w*/gi,
  /\bsunn[iy]\w*/gi,
  /\bkoo+dhi\w*/gi,
  /\bthaay?oli\w*/gi,
  /\bth[a*]il+ee\w*/gi,
];

export function filterProfanity(text: string): string {
  let out = text;
  for (const re of PROFANITY) {
    out = out.replace(re, (w) => w[0] + '*'.repeat(Math.max(2, w.length - 1)));
  }
  return out;
}

/** Picks the line for a language and applies the profanity filter if it is on. */
export function tr(text: Loc | string, lang: Lang = settings.get('language'), filter = settings.get('profanityFilter')): string {
  const s = typeof text === 'string' ? text : text[lang] || text.en;
  return filter ? filterProfanity(s) : s;
}
