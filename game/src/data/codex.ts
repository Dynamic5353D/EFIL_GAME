import { loc, type Loc } from '../core/Localization';

/** Memory Fragments, viewed in "Kaviya's Pool" with the user's art. */
export interface CodexEntry {
  id: string;
  title: Loc;
  art: string; // manifest slug
  text: Loc;
}

export const CODEX: Record<string, CodexEntry> = {
  glacia: {
    id: 'glacia',
    title: loc('Glacia', 'Glacia'),
    art: 'frozen_pond',
    text: loc(
      'A world of snow and ice where everyone has kinesis and a Magic Guard that no blow can pass. The Glacians know no fear, no lies and no pain. They wish to be happy enough that God calls them early.',
      'Full-ah pani dhaan. Inga ellarukum kinesis iruku, aprom yendha adiyum ulla vidadha oru Magic Guard. Bayam, poi, vali, idhellam avangaluku theriyadhu. Romba happy-ah irundha God seekram koopiduvaru-nu nambaranga.',
    ),
  },
  vales: {
    id: 'vales',
    title: loc('The Vales', 'Vales'),
    art: 'vale',
    text: loc(
      'Tall, thin beings of twisting black vines with burning blue eyes. Strike one and it bursts into ink, then knits itself back together. Fire, light, water or a shattering blow ends them for good.',
      'Karuppu kodi maari suthikitu irukura uyaramaana uruvangal, neela kangal eriyum. Adicha ink-ah sidharum, aprom thirumba ondhu serum. Neruppu, velicham, thanni, illa norukura adi dhaan avangala mudikkum.',
    ),
  },
  glowing_ball: {
    id: 'glowing_ball',
    title: loc('A dream of a glowing ball', 'Minnura urundai kanavu'),
    art: 'pure_white_orb',
    text: loc(
      'Expressionless people carry things to a ball of light. It swallows them and becomes whole landscapes. Ragul has had this dream before. His head always hurts afterwards.',
      'Mugathula edhuvum illadha manushanga, oru velicha urundai kitta porutkala kondu poranga. Adhu andha porutkala muzhungi, muzhu ulagama maarudhu. Ragul-ku indha kanavu munnadiye vandhirukku. Aprom eppavume thalavali.',
    ),
  },
};
