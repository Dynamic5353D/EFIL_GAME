import { loc } from '../../core/Localization';
import { Ground } from './paint';
import type { LookDef, MapDef, PropPlace } from './types';

const S = 'px/campus';
const W = 56;
const H = 28;

/*
 * The MIT road, Chromepet, on the morning of Sivaranjani (29 September 2022).
 * North of the road: the boys' hostel, the tea stall and the IT block. South: the lawn.
 * Both ends are closed for the fest (the semi-open world opens them later).
 */
const g = new Ground(W, H);
g.rect(2, 9, 16, 2, 'p').rect(8, 11, 3, 2, 'p'); // hostel courtyard and its walk down to the road
g.rect(32, 9, 13, 2, 'p').rect(37, 11, 3, 2, 'p'); // IT block courtyard
g.rect(22, 3, 6, 2, ',').rect(47, 8, 5, 2, ',').rect(6, 22, 5, 2, ',').rect(30, 24, 6, 2, ',');
g.rect(24, 20, 4, 2, ';').rect(44, 22, 5, 3, ';');
g.row(12, '*'); // the copper-pod verge
g.rect(8, 12, 3, 1, 'p').rect(37, 12, 3, 1, 'p');
g.row(13, 'p'); // footpath
g.row(14, 'n').row(15, '-').row(16, 's'); // the road
g.rect(26, 14, 1, 3, 'z'); // zebra crossing
g.row(17, 'p');
g.row(18, '*');
// a laterite path across the lawn, from the road to the bench by the far board
g.rect(12, 19, 1, 5, '#').rect(12, 23, 36, 1, '#').rect(47, 19, 1, 5, '#');

const props: PropPlace[] = [
  // copper-pod trees along both verges
  ...[1, 12, 24, 29, 44, 50].map((x) => ({ kind: 'tree_copperpod', x, y: 12 })),
  ...[5, 17, 32, 41, 52].map((x) => ({ kind: 'tree_copperpod', x, y: 18 })),
  // the north lawn
  { kind: 'tree_neem', x: 22, y: 6 },
  { kind: 'bench', x: 24, y: 9 },
  { kind: 'dog_sleep', x: 27, y: 10 },
  { kind: 'palm', x: 47, y: 5 },
  { kind: 'palm', x: 52, y: 4 },
  { kind: 'palm', x: 28, y: 5 },
  { kind: 'hedge', x: 0, y: 7 },
  { kind: 'hedge', x: 1, y: 7 },
  { kind: 'hedge', x: 18, y: 7 },
  { kind: 'hedge', x: 19, y: 7 },
  // the hostel courtyard
  { kind: 'scooter_red', x: 2, y: 10 },
  { kind: 'scooter_blue', x: 4, y: 10 },
  { kind: 'notice_board', x: 14, y: 10 },
  { kind: 'dustbin', x: 16, y: 10 },
  { kind: 'flowerpot', x: 7, y: 9 },
  { kind: 'flowerpot', x: 11, y: 9 },
  { kind: 'tea_stall', x: 18, y: 11 },
  { kind: 'lamp', x: 21, y: 11 },
  // the IT block
  { kind: 'notice_board', x: 34, y: 10 },
  { kind: 'flowerpot', x: 36, y: 9 },
  { kind: 'flowerpot', x: 40, y: 9 },
  { kind: 'signpost', x: 42, y: 10 },
  { kind: 'lamp', x: 31, y: 11 },
  // the south lawn
  { kind: 'tree_neem', x: 20, y: 24 },
  { kind: 'tree_neem', x: 36, y: 21 },
  { kind: 'bench', x: 8, y: 20 },
  { kind: 'bench', x: 48, y: 21 },
  { kind: 'notice_board', x: 45, y: 21 },
  { kind: 'palm', x: 2, y: 25 },
  { kind: 'palm', x: 28, y: 22 },
  { kind: 'dustbin', x: 11, y: 20 },
  // the fest: bunting over the road, barricades at both ends
  ...[6, 18, 30, 42].map((x) => ({ kind: 'bunting', x, y: 15 })),
  ...[14, 15, 16].map((y) => ({ kind: 'barricade', x: 0, y })),
  ...[14, 15, 16].map((y) => ({ kind: 'barricade', x: 55, y })),
  { kind: 'signpost', x: 53, y: 12 },
  // the compound wall along the bottom
  ...Array.from({ length: W }, (_, x) => ({ kind: 'compound_wall', x, y: H - 1 })),
];

/** A look on every tile of a two-tile-wide board. */
const board = (x: number, y: number, label: string): LookDef[] => [x, x + 1].map((bx) => ({ x: bx, y, talk: { script: S, label } }));

export const MIT_ROAD: MapDef = {
  id: 'mit_road',
  name: loc('MIT road', 'MIT road'),
  music: 'campus',
  tint: 'morning',
  petals: true,
  ground: g.done(),
  buildings: [
    { x: 3, y: 1, w: 12, roof: 3, wall: 5, style: 'hostel', door: { dx: 6, to: 'hostel_room', spawn: 'door' }, sign: loc('Boys\' hostel', 'Boys hostel') },
    {
      x: 31, y: 1, w: 16, roof: 3, wall: 5, style: 'dept', sign: loc('Dept. of IT', 'IT Department'),
      door: { dx: 7, to: 'mit_road', spawn: 'it_door', locked: true },
    },
  ],
  props,
  spawns: {
    hostel_door: { x: 9, y: 9, dir: 'down' },
  },
  looks: [
    { x: 38, y: 8, talk: { script: S, label: 'it_locked' } },
    ...board(14, 10, 'board_a'),
    ...board(34, 10, 'board_b'),
    ...board(45, 21, 'board_c'),
    { x: 27, y: 10, talk: { text: loc('A campus dog, fast asleep in the shade. It has seen a hundred fests.', 'Oru campus naai, nizhal-la nalla thoongudhu. Nooru fest paathurukkum.') } },
    { x: 53, y: 12, talk: { text: loc('→ Rajam Hall, Library, Aero hangars', '→ Rajam Hall, Library, Aero hangars') } },
    { x: 42, y: 10, talk: { text: loc('IT block. Please maintain silence near the classrooms.', 'IT block. Classroom pakkathula amaidhiya irunga.') } },
    { x: 18, y: 11, talk: { script: S, label: 'stall' } },
    { x: 19, y: 11, talk: { script: S, label: 'stall' } },
    { x: 20, y: 11, talk: { script: S, label: 'stall' } },
    ...[14, 15, 16].map((y) => ({ x: 0, y, talk: { text: loc('The main gate is shut for the fest. Chromepet will have to wait.', 'Fest-kaaga main gate moodirukku. Chromepet konjam wait pannattum.') } })),
  ],
  npcs: [
    { id: 'richard', sprite: 'senior', speaker: 'senior', x: 21, y: 13, dir: 'left', move: { kind: 'look' }, talk: { script: S, label: 'richard' } },
    { id: 'vendor', sprite: 'vendor', speaker: 'vendor', x: 17, y: 12, dir: 'down', talk: { script: S, label: 'vendor' } },
    { id: 'krishnaa', sprite: 'krishnaa', speaker: 'krishnaa', x: 30, y: 13, dir: 'right', talk: { script: S, label: 'krishnaa' } },
    { id: 'kabi', sprite: 'kabi', speaker: 'kabi', x: 31, y: 13, dir: 'left', talk: { script: S, label: 'kabi' } },
    { id: 'sneya', sprite: 'sneya', speaker: 'sneya', x: 41, y: 9, dir: 'right', move: { kind: 'look' }, talk: { script: S, label: 'sneya' } },
    { id: 'sneka', sprite: 'sneka', speaker: 'sneka', x: 42, y: 9, dir: 'left', talk: { script: S, label: 'sneka' } },
    { id: 'veerabhadran', sprite: 'veerabhadran', speaker: 'veerabhadran', x: 33, y: 10, dir: 'down', move: { kind: 'look' }, talk: { script: S, label: 'veerabhadran' } },
    { id: 'guard', sprite: 'security', speaker: 'security', x: 54, y: 15, dir: 'left', talk: { script: S, label: 'guard' } },
    { id: 'lawn_guy', sprite: 'guy_b', speaker: 'guy', x: 24, y: 21, dir: 'down', move: { kind: 'wander', r: 3 }, talk: { script: S, label: 'lawn_guy' } },
    { id: 'reader', sprite: 'guy_c', speaker: 'guy', x: 37, y: 22, dir: 'down', talk: { script: S, label: 'reader' } },
    {
      id: 'walker', sprite: 'girl_b', speaker: 'girl', x: 8, y: 17, dir: 'right',
      move: { kind: 'patrol', path: [[8, 17], [22, 17], [22, 19], [8, 19]] }, talk: { script: S, label: 'walker' },
    },
    { id: 'girl_lawn', sprite: 'girl', speaker: 'girl', x: 9, y: 21, dir: 'up', talk: { script: S, label: 'girl_lawn' } },
  ],
  enter: { script: S, label: 'first_road', unless: 'px_saw_road' },
};
