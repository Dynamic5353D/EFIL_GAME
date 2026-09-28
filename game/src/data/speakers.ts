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
};
