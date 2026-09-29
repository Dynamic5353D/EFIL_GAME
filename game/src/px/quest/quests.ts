import { loc, type Loc } from '../../core/Localization';

/**
 * A quest is a list of steps. A step with `until` completes by itself once that flag reaches `n`
 * (default: is set); the last step usually has no `until` and is finished by a script (`@quest done id`).
 * Scripts start quests (`@quest start id`) and set the flags the steps watch, so any order works.
 */
export interface QuestStep {
  text: Loc;
  until?: { flag: string; n?: number };
}

export interface QuestDef {
  id: string;
  kind: 'main' | 'side';
  title: Loc;
  /** Who gave it, for the journal (a speaker id). */
  giver?: string;
  /** Where it happens (a map id), for the journal. */
  where?: string;
  summary: Loc;
  steps: QuestStep[];
  rewards: { items?: Record<string, number>; xp?: number; codex?: string[] };
}

export const QUESTS: Record<string, QuestDef> = {
  morning: {
    id: 'morning',
    kind: 'main',
    title: loc('The morning of the fest', 'Fest-oda kaalai'),
    where: 'hostel_room',
    summary: loc('Sivaranjani, the college\'s first fest in years, is today. Your head is already pounding.', 'Pala varusham kazhichu college-oda modhal fest Sivaranjani innaiku. Thala ippove vedikkudhu.'),
    steps: [
      { text: loc('Get ready and head out to the MIT road.', 'Ready aagi MIT road-ku po.'), until: { flag: 'px_saw_road' } },
      { text: loc('Look around the MIT road. The flashmob is at 10:30.', 'MIT road-a suthi paaru. Flashmob 10:30-ku.') },
    ],
    rewards: {},
  },
  posters: {
    id: 'posters',
    kind: 'side',
    title: loc('Posters for Sivaranjani', 'Sivaranjani poster'),
    giver: 'senior',
    where: 'mit_road',
    summary: loc('Richard, a senior, handed you three fest posters. Nobody seems to know about the flashmob.', 'Richard senior moonu fest poster kuduthaaru. Flashmob pathi yaarukkum theriyala pola.'),
    steps: [
      { text: loc('Put up the posters on the three notice boards.', 'Moonu notice board-layum poster ottu.'), until: { flag: 'px_posters_up', n: 3 } },
      { text: loc('Tell Richard at the tea stall.', 'Tea kadai-la Richard kitta sollu.') },
    ],
    rewards: { items: { fest_pass: 1 }, xp: 40 },
  },
};
