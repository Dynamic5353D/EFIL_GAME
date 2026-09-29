import { describe, expect, test } from 'bun:test';
import { filterProfanity, loc, tr } from '../src/core/Localization';
import { sanitizeSettings } from '../src/core/Settings';

describe('localization', () => {
  test('picks the language and falls back to English', () => {
    expect(tr(loc('Hello', 'Vanakkam'), 'ta', false)).toBe('Vanakkam');
    expect(tr({ en: 'Hello', ta: '' }, 'ta', false)).toBe('Hello');
  });

  test('profanity filter masks English and Tanglish swearing', () => {
    expect(filterProfanity('You fucking coward')).toBe('You f****** coward');
    expect(filterProfanity('Otha! Enna da idhu')).toBe('O***! Enna da idhu');
    expect(filterProfanity('MAYIREYY!')).toBe('M*******!');
    expect(filterProfanity('Shreesha smiled')).toBe('Shreesha smiled');
    expect(tr(loc('shit'), 'en', true)).toBe('s***');
  });

  test('settings sanitising keeps valid values only', () => {
    const s = sanitizeSettings({ language: 'ta', descLang: 'en', masterVolume: 4, textSpeed: -1, bindings: { run: ['KeyK'], left: 'nope' } });
    // An old single `language` carries over to whichever of the two is not set.
    expect(s.dialogueLang).toBe('ta');
    expect(s.descLang).toBe('en');
    expect(s.langChosen).toBe(false);
    expect(s.masterVolume).toBe(1);
    expect(s.textSpeed).toBe(55);
    expect(s.bindings.run).toEqual(['KeyK']);
    expect(s.bindings.left).toEqual(['ArrowLeft', 'KeyA']);
  });
});
