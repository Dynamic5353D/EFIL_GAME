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
  // ---------------------------------------------------------------- exploring
  move: T('move', 'world', loc('Moving', 'Nadakka'), loc(
    '{left} {right} to move, {jump} to jump. Hold {jump} to jump higher, and press it again in mid-air to double jump. Hold {dash} to sprint.',
    '{left} {right} nadakka, {jump} kudhikka. {jump}-a pidichaa uyarama kudhikkalam, kaathula thirumba azhuthaa rendu kudhippu. {dash} pidichaa vegama odalam.')),
  spikes: T('spikes', 'world', loc('Ice spikes', 'Pani mullu'), loc(
    'Spikes hurt and send you back to solid ground. Take a run-up and jump across.',
    'Mullu kuthum, thirumba nilaththukku anuppidum. Konjam odi vandhu thaandi kudhi.')),
  tree: T('tree', 'world', loc('Red Rosoar trees', 'Red Rosoar maram'), loc(
    'Press {interact} to rest. Resting heals everyone and saves your game. Vales you beat come back when you rest.',
    '{interact} azhuthi oyvu edu. Ellarukum HP varum, game save aagum. Oyvu eduthaa, jeyicha Vales thirumba varum.')),
  enemy: T('enemy', 'world', loc('Vales', 'Vales'), loc(
    'Touch a Vale and it attacks first. Hit it with {attack} before it reaches you to start the battle on your turn.',
    'Vale-a thottaa adhu modhalla adikkum. Adhu kitta varradhukku munnadiye {attack}-la adi, appo un turn-la battle aarambikkum.')),
  shards: T('shards', 'world', loc('RI shards', 'RI shards'), loc(
    'RI shards are the currency of this world. Your count is at the top right.',
    'RI shards dhaan inga kaasu. Evvalavu irukku-nu mela valadhu pakkam theriyum.')),
  gate: T('gate', 'world', loc('Out of reach', 'Ettala'), loc(
    'Some places need an ability you don\'t have yet. Remember them and come back later.',
    'Sila idangalukku ippo illadha oru sakthi venum. Nyabagam vechikko, aprom vaa.')),
  glide: T('glide', 'world', loc('Acanus glide', 'Acanus mithappu'), loc(
    'Hold {jump} while falling to glide. You drift down slowly and cover long gaps.',
    'Keela vizhumbodhu {jump}-a pidichaa mella mithandhu varalaam, periya idaiveliyum thaandalam.')),
  party: T('party', 'world', loc('Party', 'Kootam'), loc(
    'Dhanasree follows you now and fights beside Ragul in battle.',
    'Dhanasree ippo un pinnaadi varra, battle-la Ragul kooda sandai poduva.')),
  menu: T('menu', 'world', loc('Menu', 'Menu'), loc(
    '{menu} opens the menu: your party and keepsakes, items, Memory Fragments, the map and this guide. {bag} opens the bag straight away.',
    '{menu} azhuthaa menu varum: party, keepsakes, porutkal, Memory Fragments, map, indha guide. {bag} azhuthaa nerla bag thirakkum.')),
  bag: T('bag', 'world', loc('Your bag', 'Un bag'), loc(
    'Press {bag} to open your bag and look at what you are carrying. {menu} opens the full menu: party, map, Memory Fragments and more.',
    '{bag} azhuthaa un bag thirakkum, kaila irukuradhu ellam theriyum. {menu} azhuthaa full menu: party, map, Memory Fragments, innum neraya.')),
  fragment: T('fragment', 'world', loc('Memory Fragments', 'Memory Fragments'), loc(
    'Memory Fragments gather in Kaviya\'s Pool. Read them from the menu ({menu}).',
    'Memory Fragments Kaviya-voda Pool-la serum. Menu-la ({menu}) padikkalam.')),
  language: T('language', 'world', loc('Language', 'Mozhi'), loc(
    'Press {language} during dialogue to switch between English and the original Tanglish.',
    'Pesumbodhu {language} azhuthi English-ku illa original Tanglish-ku maathikalam.')),

  // ---------------------------------------------------------------- Earth (Act I)
  rest: T('rest', 'world', loc('Resting', 'Oyvu'), loc(
    'Quiet spots like a bench or a bunk are rest points. Press {interact} to rest: it heals the party and saves your game.',
    'Bench, kattil maadhiri amaidhiyaana idangal dhaan oyvu idam. {interact} azhuthi oyvu edu: HP varum, game save aagum.')),
  objective: T('objective', 'world', loc('Objective', 'Ilakku'), loc(
    'Your current objective is shown at the top left. It changes as the story moves on.',
    'Ippo enna pannanum-nu mela idadhu pakkam theriyum. Kadha nagara nagara maarum.')),
  stealth: T('stealth', 'world', loc('Staying out of sight', 'Kannula padaama'), loc(
    'Watchers see along the lit cone in front of them. Walls block their view. Wait for them to turn, or hide. If you\'re seen, you go back to the last marker.',
    'Paakuravanga munnaadi irukura velicha koombu vazhiya paappaanga. Suvar marachidum. Avanga thirumbura varaikum kaathiru, illa olinjuko. Paathuttaa, kadaisi idathukku thirumba poiduva.')),
  hide: T('hide', 'world', loc('Hiding', 'Olidhal'), loc(
    'Press {down} in front of a stall, bin or door to hide behind it. Nobody can see you there. Move or jump to come out.',
    'Kadai, kuppai thotti, kadhavu munnaadi {down} azhuthi olinjuko. Anga yaarum paakka mudiyaadhu. Nagarndhaa, kudhichaa veliya varuva.')),
  chase: T('chase', 'world', loc('Run!', 'Odu!'), loc(
    'Someone is after you. Keep moving and hold {dash} to sprint; every stop lets them close in. If they catch you, you start again from the last marker.',
    'Yaaro thorathuraanga. Nikkaama odu, {dash} pidichaa innum vegam; ovvoru nippum avangala nerunga vidum. Pudichuttaa, kadaisi idathula irundhu thirumba.')),
  shove: T('shove', 'world', loc('Shove', 'Thallu'), loc(
    'Nithish is strong enough to push crates. Walk into one to shove it.',
    'Nithish-ku petti thalla bala irukku. Adhu mela nadandhaa thallum.')),
  case_board: T('case_board', 'world', loc('Case Board', 'Case Board'), loc(
    'Clues about the deaths are pinned to the Case Board in the menu ({menu}).',
    'Saavu pathina thadayangal menu-la ({menu}) Case Board-la irukku.')),

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
