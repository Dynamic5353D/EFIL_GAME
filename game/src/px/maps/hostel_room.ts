import { loc } from '../../core/Localization';
import type { MapDef } from './types';

const S = 'px/campus';

/** Ragul and Nithish's room in the boys' hostel. The game opens here on the morning of the fest. */
export const HOSTEL_ROOM: MapDef = {
  id: 'hostel_room',
  name: loc('Hostel room 214', 'Hostel room 214'),
  music: 'campus',
  tint: 'indoor',
  ground: [
    'WWWWWWWWWWWWWWWW',
    'WWwWWWWWWWWWWwWW',
    'WWWWWWWWWWWWWWWW',
    'WrrrrrrrrrrrrrrW',
    'WrrrrrrrrrrrrrrW',
    'WrrrrrrrrrrrrrrW',
    'WrrrrrrrrrrrrrrW',
    'WrrrrrrrrrrrrrrW',
    'WrrrrrrrrrrrrrrW',
    'XXXXXXXEXXXXXXXX',
  ],
  props: [
    // Ragul's side (left) and Nithish's side (right)
    { kind: 'cot', x: 1, y: 5 },
    { kind: 'cot_sleeper', x: 14, y: 5 },
    { kind: 'study_table', x: 3, y: 3 },
    { kind: 'study_table', x: 11, y: 3 },
    { kind: 'shelf', x: 6, y: 3 },
    { kind: 'almirah', x: 1, y: 8 },
    { kind: 'almirah', x: 14, y: 8 },
    { kind: 'bucket', x: 13, y: 8 },
    { kind: 'dustbin', x: 9, y: 3 },
    { kind: 'poster', x: 8, y: 2 },
  ],
  warps: [{ x: 7, y: 9, to: 'mit_road', spawn: 'hostel_door', dir: 'down' }],
  spawns: {
    start: { x: 2, y: 5, dir: 'down' },
    door: { x: 7, y: 8, dir: 'up' },
  },
  looks: [
    { x: 1, y: 4, talk: { script: S, label: 'airpods' } },
    { x: 1, y: 5, talk: { script: S, label: 'airpods' } },
    { x: 14, y: 4, talk: { script: S, label: 'look_nithish' } },
    { x: 14, y: 5, talk: { script: S, label: 'look_nithish' } },
    { x: 11, y: 3, talk: { text: loc('Nithish\'s table. A timetable, three pens, and a photo of his mother taped to the wall.', 'Nithish table. Oru timetable, moonu pen, suvathula ottuna avan amma photo.') } },
    { x: 12, y: 3, talk: { text: loc('Nithish\'s table. A timetable, three pens, and a photo of his mother taped to the wall.', 'Nithish table. Oru timetable, moonu pen, suvathula ottuna avan amma photo.') } },
    { x: 1, y: 8, talk: { text: loc('The steel almirah. Clean shirts on the left, everything else on the right.', 'Steel almirah. Left-la clean shirt, right-la matha ellam.') } },
    { x: 9, y: 3, talk: { text: loc('Maggi wrappers. Mostly Nithish\'s. Mostly.', 'Maggi cover. Perumbaalum Nithish-odhu. Perumbaalum.') } },
    { x: 3, y: 3, talk: { script: S, label: 'laptop' } },
    { x: 4, y: 3, talk: { script: S, label: 'laptop' } },
    { x: 6, y: 3, talk: { script: S, label: 'notebook' } },
    { x: 7, y: 3, talk: { script: S, label: 'notebook' } },
    { x: 8, y: 2, talk: { script: S, label: 'poster' } },
    { x: 13, y: 8, talk: { text: loc('A red bucket and a blue mug. Hostel life in two objects.', 'Oru red bucket, oru blue mug. Rendu porul-la hostel vaazhkai.') } },
  ],
};
