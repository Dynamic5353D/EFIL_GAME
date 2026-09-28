/**
 * The Case Board (pause menu): what the friends piece together about the deaths in Act I. A clue can
 * carry a `truth` that replaces its text once the player knows what really happened (after V8).
 */
import { loc, type Loc } from '../core/Localization';

export interface ClueDef {
  id: string;
  title: Loc;
  body: Loc;
  /** Shown instead of `body` once the flag `truth_known` is set. */
  truth?: Loc;
}

const C = (id: string, title: Loc, body: Loc, truth?: Loc): ClueDef => ({ id, title, body, truth });

export const CLUES: Record<string, ClueDef> = {
  first_body: C('first_body',
    loc('The man on the cut road', 'Cut road-la kedandha aal'),
    loc('29 Sep, morning. A man lying face down on the cut road, beside the wall. Ragul walked past him. A man in a red shirt was walking away in the distance.',
      '29 Sep, kaalai. Cut road-la, suvar pakkathula, oru aal kavundhu kedandhaan. Ragul avana thaandi ponaan. Dhoorathula sivappu sattai pottu oruthan nadandhu ponaan.')),
  no_wounds: C('no_wounds',
    loc('No wounds', 'Kaayam illa'),
    loc('Forensics found no external injuries or trauma on the man. Only an autopsy can say how he died. He was neither staff nor a student. Nobody on campus had seen him before.',
      'Forensic-ku andha aal udambula veliya kaayam edhuvum kedaikala. Autopsy-la dhaan eppadi seththaar-nu theriyum. Avar staff-um illa, student-um illa. Campus-la yaarum avara munnadi paathadhe illa.')),
  pugazh_witness: C('pugazh_witness',
    loc('The witness', 'Saatchi'),
    loc('Pugazhendi found the body around nine, checked for breath and a pulse, and told security. The next morning his class was cancelled: "Pugazh sir is on leave."',
      'Pugazhendi kaalai onbadhu mani vaakkula body-a paathaar, moochu, pulse check pannitu security-kitta sonnaar. Adutha naal avar class cancel: "Pugazh sir leave."')),
  brain_stopped: C('brain_stopped',
    loc('Cause of death: unknown', 'Saavukku karanam: theriyala'),
    loc('Dr. Shanmugam\'s post-mortem on the first man: every organ normal, no injury, no poison. The brain simply stopped working, by itself.',
      'Dr. Shanmugam post-mortem: ella uruppum normal, kaayam illa, visham illa. Moolai thaanaave velai seiyradha niruthiduchu.')),
  janani: C('janani',
    loc('Janani', 'Janani'),
    loc('1 Oct. First-year student, found dead in the morning in a room locked from inside. Fine when she went to sleep. Just like the first case.',
      '1 Oct. Modhal varusha student, ulla irundhu poottuna room-la kaalaila irandhu kedandhaa. Thoongum podhu nalla dhaan irundhaa. Modhal case maadhiriye.')),
  subramani: C('subramani',
    loc('Subramani', 'Subramani'),
    loc('2 Oct. Found dead in his hostel room; he had talked to his mother and borrowed Nithish\'s record note the night before. Not a scratch on him. Three deaths in four days.',
      '2 Oct. Hostel room-la irandhu kedandhaan; mundhina raathiri amma kooda pesunaan, Nithish record note vaanginaan. Oru kaayam kooda illa. Naalu naal-la moonu saavu.'),
    loc('The night before, dizzy on the veranda, Ragul grabbed Subramani\'s hand to keep from falling. Ragul knows what his touch does.',
      'Mundhina raathiri, veranda-la mayakkathula, vizhaama irukka Ragul Subramani kaiya pudichaan. Than thodudhal enna pannum-nu Ragul-ku theriyum.')),
  pugazh_death: C('pugazh_death',
    loc('The fourth death', 'Naangavadhu saavu'),
    loc('Pugazh sir wasn\'t on leave on 30 Sep. He was dead. Dhanasree overheard her father, Inspector Rajesh. The police are keeping it quiet. So: 29 Sep the man, 30 Sep Pugazh sir, 1 Oct Janani, 2 Oct Subramani. One a day.',
      'Sep 30 Pugazh sir leave-la illa. Irandhuttaar. Dhanasree avanga appa Inspector Rajesh pesuradha ottu kettaa. Police veliya sollala. Appo: 29 Sep andha aal, 30 Sep Pugazh sir, 1 Oct Janani, 2 Oct Subramani. Dhinam oruthar.')),
  calm_faces: C('calm_faces',
    loc('Calm faces', 'Amaidhiyaana mugangal'),
    loc('Nobody fought. Janani was chatting until eleven and died looking as if she were asleep, behind a locked door. Subramani too.',
      'Yaarum poraadala. Janani padhinoru mani varaikum chat pannaa; poottina kadhavukkulla thoongura maari irandhaa. Subramani-um apdiye.')),
  cctv: C('cctv',
    loc('The CCTV', 'CCTV'),
    loc('The police took hours of footage from the cut road and the main gate. The inspector watched it twice.',
      'Cut road, main gate CCTV footage-a police pala manineram eduthuttu poitaanga. Inspector rendu dhadava paathaar.')),
  red_shirt: C('red_shirt',
    loc('The red shirt', 'Sivappu sattai'),
    loc('Ragul saw a man in a red shirt walking away from the body on the morning of 29 Sep. Arun remembers: that day, Nithish was wearing red.',
      '29 Sep kaalai, body kitta irundhu sivappu sattai pottu oruthan nadandhu povadha Ragul paathaan. Arun-ku nyabagam: andha naal Nithish sivappu dhaan pottirundhaan.'),
    loc('It was Nithish, on his way to college. He had nothing to do with it. Ragul told the police he did.', 'Adhu Nithish dhaan, college-ku poitu irundhaan. Avanukkum idhukkum sammandham illa. Avan dhaan-nu Ragul police kitta sonnaan.')),
};
