import { loc, type Loc } from '../core/Localization';
import type { Stats } from './characters';

export type ItemKind = 'consumable' | 'keepsake' | 'key' | 'material';

export interface ItemDef {
  id: string;
  kind: ItemKind;
  name: Loc;
  desc: Loc;
  /** Icon: a manifest slug (items/<slug>.webp) or a generated texture key starting with "gen:". */
  icon: string;
  heal?: number;           // fraction of max HP
  mods?: Partial<Stats>;   // keepsake bonuses
  grantsAbility?: string;
}

export const ITEMS: Record<string, ItemDef> = {
  red_rosoar: {
    id: 'red_rosoar',
    kind: 'consumable',
    name: loc('Red Rosoar fruit', 'Red Rosoar pazham'),
    desc: loc('Small, sweet and filling. Restores 45% HP.', 'Chinna pazham, aana vairu full aagidum. 45% HP varum.'),
    icon: 'gen:red_rosoar',
    heal: 0.45,
  },
  pluffine_wrap: {
    id: 'pluffine_wrap',
    kind: 'keepsake',
    name: loc('Pluffine wool wrap', 'Pluffine wool wrap'),
    desc: loc('Warm cloth spun from Pluffine wool. +12 max HP, +1 defence.', 'Pluffine wool-la senja soodana thuni. +12 max HP, +1 defence.'),
    icon: 'pluffine_wool',
    mods: { maxHp: 12, def: 1 },
  },
  acanus_feather: {
    id: 'acanus_feather',
    kind: 'key',
    name: loc('Acanus down feather', 'Acanus irage'),
    desc: loc('A feather shed by a giant white bird. Holding it, you drift instead of falling: hold jump in mid-air to glide.',
      'Periya vella paravaiyoda irage. Idha vechitu keela vizhaama mithakkalam: kaathula jump-a pidi.'),
    icon: 'gen:feather',
    grantsAbility: 'glide',
  },
  pluffine_wool: {
    id: 'pluffine_wool',
    kind: 'material',
    name: loc('Pluffine wool'),
    desc: loc('Soft, warm wool. Anushri can craft with it.', 'Mettha wool. Anushri idha vechu edhavadhu senju tharuva.'),
    icon: 'pluffine_wool',
  },
  // ---------------------------------------------------------------- Act I (Earth)
  handgun: {
    id: 'handgun',
    kind: 'key',
    name: loc('Handgun', 'Thuppakki'),
    desc: loc('Found near the rusty vehicle in Hangar 1, the night of the rain. Dhanasree keeps it hidden.', 'Mazhai raathiri Hangar 1 thuru pidicha vandi pakkathula kedachadhu. Dhanasree maraichu vechirukkaa.'),
    icon: 'gen:gun',
  },
  oil_can: {
    id: 'oil_can',
    kind: 'key',
    name: loc('Can of oil', 'Oil dabba'),
    desc: loc('Engine oil from the maintenance shed. Very slippery.', 'Maintenance shed-la irundha engine oil. Romba vazhukkum.'),
    icon: 'gen:oil',
  },
  rope: {
    id: 'rope',
    kind: 'key',
    name: loc('Long rope', 'Neenda kayiru'),
    desc: loc('A coil of rope from the maintenance shed.', 'Maintenance shed-la irundha oru kayiru churul.'),
    icon: 'gen:rope',
  },
  // ---------------------------------------------------------------- the pixel game (campus)
  chai: {
    id: 'chai',
    kind: 'consumable',
    name: loc('Glass of chai', 'Oru glass tea'),
    desc: loc('Sweet, strong tea from the stall on the MIT road. Restores 25% HP.', 'MIT road kadai-la irundhu inippaana strong tea. 25% HP varum.'),
    icon: 'gen:chai',
    heal: 0.25,
  },
  fest_poster: {
    id: 'fest_poster',
    kind: 'key',
    name: loc('Sivaranjani poster', 'Sivaranjani poster'),
    desc: loc('A poster for the college\'s first fest: flashmob on the MIT road, 10:30 AM.', 'College-oda modhal fest poster: MIT road-la flashmob, kaalai 10:30.'),
    icon: 'gen:poster',
  },
  fest_pass: {
    id: 'fest_pass',
    kind: 'key',
    name: loc('Volunteer pass', 'Volunteer pass'),
    desc: loc('Richard\'s thanks for putting up the posters. Lets you through the fest barricades.', 'Poster ottinadhukku Richard kudutha thanks. Fest barricade-a thaandi poga vidum.'),
    icon: 'gen:pass',
  },
};
