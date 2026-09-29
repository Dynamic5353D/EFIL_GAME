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
    'WWWWWWWWWWWW',
    'WWwWWWWWwWWW',
    'WWWWWWWWWWWW',
    'WrrrrrrrrrrW',
    'WrrrrrrrrrrW',
    'WrrrrrrrrrrW',
    'WrrrrrrrrrrW',
    'WrrrrrrrrrrW',
    'XXXXXEXXXXXX',
  ],
  props: [
    { kind: 'cot', x: 1, y: 5 },
    { kind: 'cot_sleeper', x: 10, y: 5 },
    { kind: 'study_table', x: 3, y: 3 },
    { kind: 'shelf', x: 6, y: 3 },
    { kind: 'almirah', x: 9, y: 3 },
    { kind: 'bucket', x: 10, y: 7 },
    { kind: 'poster', x: 5, y: 2 },
  ],
  warps: [{ x: 5, y: 8, to: 'mit_road', spawn: 'hostel_door', dir: 'down' }],
  spawns: {
    start: { x: 2, y: 5, dir: 'down' },
    door: { x: 5, y: 7, dir: 'up' },
  },
  looks: [
    { x: 1, y: 4, talk: { script: S, label: 'airpods' } },
    { x: 1, y: 5, talk: { script: S, label: 'airpods' } },
    { x: 10, y: 4, talk: { script: S, label: 'look_nithish' } },
    { x: 10, y: 5, talk: { script: S, label: 'look_nithish' } },
    { x: 3, y: 3, talk: { script: S, label: 'laptop' } },
    { x: 4, y: 3, talk: { script: S, label: 'laptop' } },
    { x: 6, y: 3, talk: { script: S, label: 'notebook' } },
    { x: 7, y: 3, talk: { script: S, label: 'notebook' } },
    { x: 5, y: 2, talk: { script: S, label: 'poster' } },
    { x: 9, y: 3, talk: { text: loc('The steel almirah. Clean shirts on the left, everything else on the right.', 'Steel almirah. Left-la clean shirt, right-la matha ellam.') } },
    { x: 10, y: 7, talk: { text: loc('A red bucket and a blue mug. Hostel life in two objects.', 'Oru red bucket, oru blue mug. Rendu porul-la hostel vaazhkai.') } },
  ],
};
