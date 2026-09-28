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
  // ---------------------------------------------------------------- Act I (Earth)
  p01_notebook: {
    id: 'p01_notebook',
    title: loc('Ragul\'s notebook', 'Ragul-oda notebook'),
    art: 'gen:hostel_room',
    text: loc(
      'Pages of stories he never finishes: a boy who wakes in a world of magic, a girl who needs rescuing, a sword. In every one the hero is brave. In none of them does his head hurt.',
      'Mudikkaadha kadhaigal: magic ulagathula ezhundhirukura oru paiyan, kaapaathapada vendiya oru ponnu, oru vaal. Ellaa kadhailayum hero dhairiyamaanavan. Edhulayum avanukku thalavazhi illa.'),
  },
  p01_sivaranjani: {
    id: 'p01_sivaranjani',
    title: loc('Sivaranjani', 'Sivaranjani'),
    art: 'gen:fest',
    text: loc(
      'MIT\'s first fest in years. A flashmob on the long road, a dance from the Black Crew club, stalls and colour. It lasted until 10:30 on the morning of 29 September.',
      'Pala varushathukku aprom MIT-oda modhal fest. Neenda road-la flashmob, Black Crew club dance, kadaigal, colour. 29 September kaalai 10:30 varaikum dhaan nadandhuchu.'),
  },
  p01_airpods: {
    id: 'p01_airpods',
    title: loc('AirPods', 'AirPods'),
    art: 'gen:campus_morning',
    text: loc(
      'He wears them everywhere and plays almost nothing. Two songs and the headache starts. Mostly they are a wall: people talk less to someone with something in his ears.',
      'Engayum pottukittu dhaan povaan, aana paatu kekkuradhu kammi. Rendu paatu-la thalavazhi aarambikkum. Perumbaalum adhu oru suvar: kaadhula edhavadhu irundhaa yaarum pesa varamaattaanga.'),
  },
  p01_mantra: {
    id: 'p01_mantra',
    title: loc('"Nothing will happen"', '"Onnum aagadhu"'),
    art: 'gen:hostel_room',
    text: loc(
      'Dharshna\'s mantra, said under her breath with the locket in her fist: "Everything will be alright. Nothing will happen." She paints while she says it, fast, until her hands stop shaking.',
      'Dharshna-voda mandhiram, locket-a kaila irukki pudichukittu mella solluva: "Yellam seri aidum. Onnum aagadhu." Solikittey paint pannuva, vegama, kai nadukkam nikkura varaikum.'),
  },
  p01_snow_dream: {
    id: 'p01_snow_dream',
    title: loc('A dream of snow', 'Pani kanavu'),
    art: 'frozen_pond',
    text: loc(
      'Nithish dreamed of a place he had never seen: snow, trees with white leaves, people laughing. Janani ran into a patch of darkness and did not come back. He woke up cold. That morning she was dead.',
      'Nithish paakaadha oru idatha kanavula paathaan: pani, vella ilai marangal, sirikkura manushanga. Janani oru iruttukulla odi ponaa, thirumba varala. Kulirla ezhundhaan. Andha kaalaila aval irandhu poyirundhaa.'),
  },
  p01_janani: {
    id: 'p01_janani',
    title: loc('Janani', 'Janani'),
    art: 'gen:classroom',
    text: loc(
      '"Trusting someone is good. Only blind trust is wrong." She said it over an ice cream, chocolate flavour, on the day of the fest. Nithish keeps it like a coin in his pocket.',
      '"Oruthara namburadhu nalladhu dhaan. Kanmoodi-thanama namburadhu-dhaan thappu." Fest anniku, oru chocolate ice-cream kooda sonnaa. Nithish adha pocket-la oru kaasu maari vechirukaan.'),
  },
  p01_copperpod: {
    id: 'p01_copperpod',
    title: loc('Yellow flowers', 'Manjal poo'),
    art: 'gen:campus_noon',
    text: loc(
      'The copper-pod trees along the MIT road drop their yellow flowers every day. Students walk over them without looking. Ragul always looks.',
      'MIT road oram irukura copper-pod marangal dhinamum manjal poova uthirkkum. Students paakaama mela nadandhu povaanga. Ragul eppovum paappaan.'),
  },
  p01_cut_road: {
    id: 'p01_cut_road',
    title: loc('The cut road', 'Cut road'),
    art: 'gen:campus_cloudy',
    text: loc(
      'A straight road with a wall on one side and college buildings on the other. Students use it to cut across the campus, or to avoid someone on the main road.',
      'Oru pakkam suvar, innoru pakkam college katti-dangal irukura oru nerana road. Campus-a kuruka thaanda, illa main road-la yaaraiyaavadhu thavirkka, students idha use pannuvaanga.'),
  },
  p01_family_photo: {
    id: 'p01_family_photo',
    title: loc('A photo, face down', 'Kavuththa photo'),
    art: 'gen:house_night',
    text: loc(
      'Dhanasree\'s mother, young, in a white-and-blue beaded bracelet, holding a small girl. The frame had been turned to face the shelf.',
      'Dhanasree-voda amma, ilamaiyil, vella-neela mani bracelet pottu, oru chinna ponna thookitu. Frame shelf pakkam thiruppi vechirundhuchu.'),
  },
  p01_bracelet: {
    id: 'p01_bracelet',
    title: loc('The white-and-blue bracelet', 'Vella-neela bracelet'),
    art: 'gen:house_night',
    text: loc(
      'Beaded, white and blue, kept on the shelf in her mother\'s locked room. "My mother bought it for me. It\'s my favourite." Dhanasree checked it before anything else when the mirror broke.',
      'Vella-neela mani, poottina amma room shelf-la vechirukkura. "Idhu yen amma vaangi kuduthadhu. It\'s my favorite." Kannaadi odanjappo Dhanasree ellaathukkum munnaadi adha dhaan paathaa.'),
  },
  p01_superhero: {
    id: 'p01_superhero',
    title: loc('Superhero Ragul', 'Superhero Ragul'),
    art: 'gen:daydream',
    text: loc(
      'In his head he is fast, brave and funny under pressure, and the girl says "Ragul, you\'re amazing". In the room, a mirror lies in pieces on the floor.',
      'Avan thalaikkulla avan vegamaanavan, dhairiyasaali, nerukkadila kooda comedy, andha ponnu "Ragul, kalakkura" solraa. Room-la, oru kannaadi thundu thundaa tharaila.'),
  },
  p01_lullaby: {
    id: 'p01_lullaby',
    title: loc('The lullaby', 'Thaalaattu'),
    art: 'gen:house_night',
    text: loc(
      'Her mother hummed it every night in the old house. When Dhanasree was eight, she took off her bracelet and put it in her hands: "As long as this is safe, Amma is with you."',
      'Pazhaya veettula amma dhinamum raathiri munumunuppaa. Dhanasree-ku ettu vayasu irukkumbodhu, than bracelet-a kazhatti aval kaila vechaa: "Idhu bathrama evlo naal iruko, avlo naal amma un-kooda irupan."'),
  },
  p01_locket: {
    id: 'p01_locket',
    title: loc('The lotus locket', 'Thaamarai locket'),
    art: 'gen:restroom',
    text: loc(
      'Her father\'s gift when she left for college: "A lotus is a symbol of growth and the ability to heal. As long as it\'s with you, you\'ll keep healing."',
      'College-ku kelambumbodhu appa kodutha parisu: "A lotus is a symbol of growth and ability to heal. Indha lotus un-kooda irukura varaikum, you\'ll continue to heal."'),
  },
  p01_stronger: {
    id: 'p01_stronger',
    title: loc('"Stronger than you think"', '"Nee nenaikuradha vida strong"'),
    art: 'gen:corridor_day',
    text: loc(
      'Through a locked door: "You chose to stay in a hostel and study, with all this. That shows your strength. The first step is yours to take. And it can be now." The lock clicked open.',
      'Poottina kadhavu vazhiya: "Ipdi oru prechana irundhum nee hostel-la thangi padikira-nu decision yedhuthuruka. That shows your strength. Andha first step nee yeduthu-dhaan aganum. And it can be now." Poottu thirandhuchu.'),
  },
};
