import { loc, type Loc } from '../core/Localization';

/**
 * First-time tips. Each shows once per save (the flag `tip.<id>`), then stays readable in the pause
 * menu's Guide. `{jump}`, `{attack}` and the like are replaced with the player's current key names.
 * World tips appear in a HUD card; battle tips pause the battle until dismissed.
 */
export interface TipDef {
  id: string;
  kind: 'world' | 'battle';
  title: Loc;
  body: Loc;
}

const T = (id: string, kind: TipDef['kind'], title: Loc, body: Loc): TipDef => ({ id, kind, title, body });

export const TIPS: Record<string, TipDef> = {
  // ---------------------------------------------------------------- exploring (the pixel game)
  move: T('move', 'world', loc('Getting around', 'Nagarradhu'), loc(
    'Arrow keys to walk; tap one to turn on the spot. Hold {run} to run.',
    'Arrow key-la nadakkalaam; oru thadava thatti-naa andha pakkam thirumbum. {run} pidichaa odalaam.')),
  talk: T('talk', 'world', loc('Talking and looking', 'Pesuradhu, paakuradhu'), loc(
    'Face a person or a thing and press {confirm} to talk or look.',
    'Oru aal illa porul pakkam thirumbi {confirm} azhuthunga, pesalaam illa paakalaam.')),
  menu: T('menu', 'world', loc('The menu', 'Menu'), loc(
    '{menu} opens the menu: your journal of quests, the bag, Ragul, saving and settings.',
    '{menu} azhuthaa menu: quest journal, bag, Ragul, save, settings.')),
  language: T('language', 'world', loc('Language', 'Mozhi'), loc(
    'Press {language} during a conversation to switch between English and the original Tanglish.',
    'Pesumbodhu {language} azhuthi English-ku illa original Tanglish-ku maathikalam.')),

  // ---------------------------------------------------------------- battle
  battle: T('battle', 'battle', loc('How battles work', 'Battle yepdi'), loc(
    'The strip at the top is the turn order: faster fighters act more often. On your turn pick Attack, Skills, Defend, a Rosoar fruit or Run. You win when every foe is destroyed for good.',
    'Mela irukura varisai dhaan turn order: vegamaanavanga adikkadi adippaanga. Un turn-la Attack, Skills, Defend, Rosoar pazham, illa Run edu. Ella edhirigalum muzhusaa azhinjaa jeyippu.')),
  vale_ink: T('vale_ink', 'battle', loc('The Vale is not dead', 'Vale saagala'), loc(
    'At 0 HP a Vale bursts into ink and re-forms two turns later with half its health. Ordinary hits can\'t finish it. Finish it with light, fire or a shattering blow, or mark it with Ragul\'s Death Touch and take it with Soul Absorb before it falls.',
    '0 HP-la Vale ink-ah sidharum, rendu turn-la paadhi HP-oda thirumba varum. Saadharana adi mudikkadhu. Velicham, neruppu, illa norukkura adi venum. Illa Ragul-oda Saavu Thodal pottu, adhu vizhuradhukku munnadiye Aanma Urinju pannu.')),
  vale_ragul: T('vale_ragul', 'battle', loc('Alone against a Vale', 'Thaniya oru Vale kooda'), loc(
    'Ragul has no light or fire yet. Use Death Touch to mark the Vale with Doom, then Soul Absorb on your next turn: its soul is taken and it is gone for good.',
    'Ragul kitta innum velicham illa, neruppu illa. Saavu Thodal-la Doom podu, adutha turn-la Aanma Urinju: adhoda aanma poidum, thirumba varaadhu.')),
  doom: T('doom', 'battle', loc('Doom', 'Doom'), loc(
    'A Doomed foe dies when its count reaches 0. Before that, Soul Absorb takes its soul: it is gone for good, Ragul heals, and his Soul Hunger eases.',
    'Doom aana edhiri count 0 aanaa saavum. Adhukku munnadi Aanma Urinju pannaa, adhu muzhusaa poidum, Ragul-ku HP varum, pasi kuraiyum.')),
  shadow: T('shadow', 'battle', loc('Shadow form', 'Nizhal'), loc(
    'The Vale has sunk into a flat shadow. Only light can touch it there. It can\'t act, but it mends while it hides.',
    'Vale oru nizhala maaridichu. Velicham mattum dhaan adhai thodum. Adhu adikkadhu, aana olinjirukkumbodhu gunamaagum.')),
  cubes: T('cubes', 'battle', loc('Dhanasree', 'Dhanasree'), loc(
    'Her cubes cost CE, which refills a little every turn. The Light Cube blinds and finishes Vales; the Resonance Cube breaks armour and shatters them. The handgun has 6 shots per rest. Loop Sense shows what every foe will do next without using her turn, and Rewind undoes a round once per battle.',
    'Aval cubes-ku CE venum, ovvoru turn-um konjam varum. Velicha Cube kanna kurudaakum, Vale-a mudikkum; Adhirvu Cube armour-a udaikkum, Vale-a norukkum. Thuppakki-la rest-ku 6 thotta. Loop Unarvu turn pogaama edhiri enna pannuvaanga-nu kaattum, Pinnadi oru battle-ku oru round-a azhikkum.')),
  words: T('words', 'battle', loc('Word battles', 'Vaarthai sandai'), loc(
    'Some fights are fought with words. Each round the other person takes a stance, shown in the middle with a hint. Pick the move that answers it: a good answer lands hard and softens what comes back; a bad one barely lands and costs you. Keep your Composure above 0. If you lose, you simply try again.',
    'Sila sandai vaarthaiyaala. Ovvoru round-um edhiraali oru nilaippaadu edupaanga; naduvula clue-oda theriyum. Adhukku sariyaana move-a edu: sariyaa irundhaa nalla padum, thirumba varradhu kammi; thappaa irundhaa konjam dhaan padum, unakku nashtam. Un Composure 0-ku keezha pogaama paathuko. Thothaa, thirumba try pannalaam.')),
  hunger: T('hunger', 'battle', loc('Soul Hunger', 'Aanma Pasi'), loc(
    'Ragul\'s Soul Hunger rises after every battle. Above 70 he starves: he hits softer and a migraine can cost him a turn. Soul Absorb feeds it.',
    'Ovvoru battle-kum aprom Ragul-oda pasi yerum. 70-ku mela pona avan pasiyila: adi kammi, thalavali-la turn poga vaaippu. Aanma Urinju pasiya kuraikkum.')),
};
