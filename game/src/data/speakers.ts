import { loc, type Loc } from '../core/Localization';

export interface SpeakerDef {
  id: string;
  name: Loc;
  /** Portrait texture: "gen:<member>" for the generated silhouettes, or a manifest slug in portraits/. */
  portrait: string | null;
  color: number;
}

export const SPEAKERS: Record<string, SpeakerDef> = {
  narrator: { id: 'narrator', name: loc(''), portrait: null, color: 0xc9d6e8 },
  ragul: { id: 'ragul', name: loc('Ragul'), portrait: 'gen:ragul', color: 0x7fd4ff },
  dhanasree: { id: 'dhanasree', name: loc('Dhanasree'), portrait: 'gen:dhanasree', color: 0x8dffbd },
  nithish: { id: 'nithish', name: loc('Nithish'), portrait: 'gen:nithish', color: 0xff8a8a },
  dharshna: { id: 'dharshna', name: loc('Dharshna'), portrait: 'gen:dharshna', color: 0xffd67a },
  kanagaraj: { id: 'kanagaraj', name: loc('Kanagaraj'), portrait: 'kanagaraj', color: 0xf0c060 },
  jeevitha: { id: 'jeevitha', name: loc('White-dressed girl', 'Vella dress ponnu'), portrait: 'jeevitha', color: 0xe8e0ff },
  zitabye: { id: 'zitabye', name: loc('Zitabye'), portrait: 'zitabye', color: 0xe0e6ee },
  gardener: { id: 'gardener', name: loc('The Gardener', 'Gardener'), portrait: 'gardener', color: 0xff9a8a },
  kin: { id: 'kin', name: loc('Kin'), portrait: 'kin', color: 0xffc8d8 },

  // ---------------------------------------------------------------- Earth (Act I)
  // Venture 1 doesn't name its two leads yet: "that guy" is Ragul, "Guy 1" is Nithish.
  that_guy: { id: 'that_guy', name: loc('That guy', 'Andha paiyan'), portrait: 'gen:ragul', color: 0x7fd4ff },
  guy1: { id: 'guy1', name: loc('Guy 1', 'Paiyan 1'), portrait: 'gen:nithish', color: 0xff8a8a },
  guy1_mother: { id: 'guy1_mother', name: loc('His mother (on the phone)', 'Avan amma (phone-la)'), portrait: null, color: 0xe8c8a8 },
  kfriend: { id: 'kfriend', name: loc('Krishnaa\'s friend', 'Krishnaa friend'), portrait: 'gen:guy', color: 0xc0a890 },
  arun: { id: 'arun', name: loc('Arun'), portrait: 'gen:arun', color: 0x9cc4ff },
  krishnaa: { id: 'krishnaa', name: loc('Krishnaa'), portrait: 'gen:krishnaa', color: 0xff9f7a },
  kabi: { id: 'kabi', name: loc('Kabi'), portrait: 'gen:kabi', color: 0xd8c27a },
  rawin: { id: 'rawin', name: loc('Rawin'), portrait: 'gen:rawin', color: 0x8fd4b0 },
  subramani: { id: 'subramani', name: loc('Subramani'), portrait: 'gen:subramani', color: 0xc0c4d8 },
  pranav: { id: 'pranav', name: loc('Pranav'), portrait: 'gen:pranav', color: 0x9a9ad8 },
  nelson: { id: 'nelson', name: loc('Nelson'), portrait: 'gen:nelson', color: 0xa8d8a0 },
  prassanna: { id: 'prassanna', name: loc('Prassanna'), portrait: 'gen:prassanna', color: 0xd8c09a },
  rithvick: { id: 'rithvick', name: loc('Rithvick'), portrait: 'gen:rithvick', color: 0xf0d870 },
  senior: { id: 'senior', name: loc('Richard (senior)', 'Richard senior'), portrait: 'gen:senior', color: 0xb0b8d0 },
  sneka: { id: 'sneka', name: loc('Sneka'), portrait: 'gen:sneka', color: 0xf0a0c8 },
  sneya: { id: 'sneya', name: loc('Sneya'), portrait: 'gen:sneya', color: 0xffb078 },
  vamika: { id: 'vamika', name: loc('Vamika'), portrait: 'gen:vamika', color: 0xc8a8f0 },
  janani: { id: 'janani', name: loc('Janani'), portrait: 'gen:janani', color: 0xd8b8ff },
  mahil: { id: 'mahil', name: loc('Mahil'), portrait: 'gen:mahil', color: 0x90d8d8 },
  veerabhadran: { id: 'veerabhadran', name: loc('Veerabhadran sir'), portrait: 'gen:veerabhadran', color: 0xd8d8c0 },
  dhanajay: { id: 'dhanajay', name: loc('Prof. Dhanajay Kumar'), portrait: 'gen:dhanajay', color: 0xc8c8c8 },
  pugazhendi: { id: 'pugazhendi', name: loc('Pugazhendi'), portrait: 'gen:pugazhendi', color: 0xc8c8d0 },
  rajesh: { id: 'rajesh', name: loc('Inspector Rajesh'), portrait: 'gen:rajesh', color: 0xe0c890 },
  ramanan: { id: 'ramanan', name: loc('Ramanan'), portrait: 'gen:ramanan', color: 0xd8c098 },
  nagaraj: { id: 'nagaraj', name: loc('Nagaraj'), portrait: 'gen:nagaraj', color: 0xd0b890 },
  interrogator: { id: 'interrogator', name: loc('Interrogating officer', 'Visaaranai officer'), portrait: 'gen:police', color: 0xd8b880 },
  police: { id: 'police', name: loc('Police'), portrait: 'gen:police', color: 0xd8b880 },
  officer3: { id: 'officer3', name: loc('Police officer', 'Police officer'), portrait: 'gen:police', color: 0xe0a070 },
  shanmugam: { id: 'shanmugam', name: loc('Dr. Shanmugam'), portrait: 'gen:dhanajay', color: 0xc8d8e0 },
  security: { id: 'security', name: loc('Security guard', 'Security'), portrait: 'gen:security', color: 0xa8b8d8 },
  vendor: { id: 'vendor', name: loc('Vendor', 'Kadaikaarar'), portrait: 'gen:vendor', color: 0xe0b080 },
  amma: { id: 'amma', name: loc('Nithish\'s mother', 'Aatha'), portrait: null, color: 0xe8c8a8 },
  appa: { id: 'appa', name: loc('Dharshna\'s father', 'Appa'), portrait: null, color: 0xd8c8b8 },
  vijaya: { id: 'vijaya', name: loc('Vijayashree'), portrait: null, color: 0xc89090 },
  subramani_mother: { id: 'subramani_mother', name: loc('Subramani\'s mother', 'Subramani amma'), portrait: null, color: 0xe0b8b8 },
  amsa: { id: 'amsa', name: loc('Amsa aunty'), portrait: null, color: 0xe0c8a8 },
  news: { id: 'news', name: loc('News anchor', 'Seidhi'), portrait: null, color: 0xc8d8ff },
  guy: { id: 'guy', name: loc('Student', 'Paiyan'), portrait: 'gen:guy', color: 0xb8c0d0 },
  girl: { id: 'girl', name: loc('Student', 'Ponnu'), portrait: 'gen:girl', color: 0xe0b8d0 },
  soldier: { id: 'soldier', name: loc('Black-suited soldier', 'Karuppu uda veeran'), portrait: 'gen:soldier', color: 0x7fd4ff },
  captain: { id: 'captain', name: loc('The Captain', 'Thalaivan'), portrait: 'gen:captain', color: 0x9fe0ff },
};
