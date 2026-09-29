/**
 * Chapter select (title screen). Each chapter starts a fresh game at a Venture's opening script, in
 * the room where that Venture begins; the script's `start` label sets the party, flags and items.
 * In this review build every chapter is unlocked.
 */
import { loc, type Loc } from '../core/Localization';

export interface Chapter {
  purpose: number;
  venture: number;
  title: Loc;
  room: string;
  script: string;
}

const ch = (venture: number, title: Loc, room: string): Chapter => ({
  purpose: 1, venture, title, room, script: `p01/v${String(venture).padStart(2, '0')}`,
});

export const CHAPTERS: Chapter[] = [
  ch(1, loc('The world is cruel', 'Ulagam kodumaiyaanadhu'), 'hostel_room'),
  ch(2, loc('The man with no wounds', 'Kaayam illaadha aal'), 'mit_road'),
  ch(3, loc('Snow in a dream', 'Kanavula pani'), 'hostel_room'),
  ch(4, loc('The red shirt', 'Sivappu sattai'), 'mit_road'),
  ch(5, loc('The back door', 'Pinvaasal'), 'mit_road'),
  ch(6, loc('Rain', 'Mazhai'), 'radha_nagar'),
  ch(7, loc('Sixty-nine hours', 'Aruvaththi onbadhu manineram'), 'dhana_house'),
  ch(8, loc('Sorry, Nithish', 'Sorry, Nithish'), 'daydream'),
  ch(9, loc('The lullaby', 'Thaalaattu'), 'dhana_house'),
  ch(10, loc('Even if I die', 'Na sethaalum'), 'nri_hostel'),
  ch(11, loc('Stronger than you think', 'Nee nenaikuradha vida strong'), 'hostel_road'),
  ch(12, loc('The snap', 'Sodakku'), 'cut_road'),
];

export function chapterTitle(purpose: number, venture: number): Loc | null {
  return CHAPTERS.find((c) => c.purpose === purpose && c.venture === venture)?.title ?? null;
}
