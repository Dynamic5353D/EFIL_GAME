/**
 * Act I's word battles. Lines follow the novel (Ventures 2, 7, 9, 11 and 12); the stances and moves
 * are the game's reading of each confrontation. Every line has English and Tanglish.
 */
import { loc, type Loc } from '../core/Localization';
import type { WordBattleDef, WordLine, WordMove, MoveId } from '../battle/WordCore';

const L = loc;
const you = (en: string, ta: string): WordLine => ({ who: 'you', text: L(en, ta) });
const foe = (en: string, ta: string): WordLine => ({ who: 'foe', text: L(en, ta) });
const nar = (en: string, ta: string): WordLine => ({ who: 'narrator', text: L(en, ta) });
const mv = (move: MoveId, name: Loc, desc: Loc, lines: Loc[]): WordMove => ({ move, name, desc, lines });

export const WORD_BATTLES: Record<string, WordBattleDef> = {
  // ---------------------------------------------------------------- V2: outside Rajam Hall
  krishnaa: {
    id: 'krishnaa',
    title: L('Nithish vs Krishnaa', 'Nithish vs Krishnaa'),
    goal: L('Make Krishnaa own up to tripping Ragul.', 'Ragul-a thalli vittadha Krishnaa-va othukka vei.'),
    you: 'nithish', foe: 'krishnaa', mode: 'resolve', resolve: 90, composure: 60, music: 'words',
    intro: [
      you('Why did you push him?', 'Avana yenda thalli-vitta?'),
      foe('Me? Push him?! He fell on his own, why are you blaming me?!', 'Naan thalli-vittena?! Avan keela vilundhadhuku yen mela yenda pali podra?!'),
    ],
    moves: [
      mv('truth', L('"I saw it"', '"Naan paathen"'), L('Say exactly what you saw.', 'Paathadha apdiye sollu.'), [
        L('You stuck your leg out as he walked past. I saw it.', 'Nee avan pogum-pothu kaal-ah kurukka vittadha naan paathen.'),
        L('You pushed him. I saw it with my own eyes.', 'Nee-dhan thalli vitta, yen kannala paathen.'),
      ]),
      mv('persuade', L('"Apologise"', '"Mannippu kelu"'), L('Demand he says sorry.', 'Mannippu kekka sollu.'), [
        L('Say sorry to him.', 'Avan-ta mannipu kelu.'),
        L('Just apologise and we\'re done.', 'Mannippu kettu mudichidu.'),
      ]),
      mv('endure', L('Stare him down', 'Moraichu paaru'), L('Say nothing. Don\'t move.', 'Onnum pesadha. Asaiyadha.'), [
        L('(Nithish doesn\'t blink.)', '(Nithish kanna imaikkala.)'),
        L('(Nithish stands his ground, silent.)', '(Nithish nagarama nikkuraan, amaidhiya.)'),
      ]),
      mv('threaten', L('Step closer', 'Nerungi po'), L('Close the distance.', 'Idaiveliya kurai.'), [
        L('Say it again. To my face.', 'Thirumba sollu. Yen moonji-ku munnadi.'),
        L('(Nithish steps right up to him.) Well?', '(Nithish avan pakkathula poi nikkuraan.) Hmm?'),
      ]),
    ],
    stances: [
      { stance: 'mocking', weight: 3, lines: [
        L('Watch where you walk, specs! Ha!', 'Paathu po-maatiya da kannadi! Ha!'),
        L('What, you\'re his bodyguard now?', 'Yenna, nee avanoda bodyguard-ah ippo?'),
        L('Look at him, he can\'t even stand up straight.', 'Avana paaru, nerya nikka kooda theriyala.'),
      ] },
      { stance: 'guarded', weight: 2, lines: [
        L('You\'re mad, da. Why would I push him?!', 'Loosa-da nee… na yaenda avan-ah thalli vidanum?!'),
        L('You keep saying the same crazy thing.', 'Yennada loosu-maari sonnadhaye sollitu iruka.'),
      ] },
      { stance: 'enraged', weight: 2, lines: [
        L('Why the hell should I apologise to him?!', 'Na yenda avan-ta mannippu kekanum?!'),
        L('Back off before I lose it.', 'Thalli po, illana kaandu varum.'),
      ] },
      { stance: 'wavering', weight: 1, lines: [
        L('(Krishnaa glances at the students watching.) ...Drop it, da.', '(Krishnaa paakura pasangala paakuraan.) …Vidu da.'),
      ] },
    ],
    hurt: [L('Tch.', 'Tch.'), L('(His jaw tightens.)', '(Avan thaadai irukkudhu.)')],
    shrug: [L('Ha! That\'s all you\'ve got?', 'Ha! Ivlo dhaana?'), L('Whatever, da.', 'Poda.')],
    win: [
      nar('Krishnaa\'s smirk slips. The students watching have gone quiet. Then someone calls out from behind them.', 'Krishnaa sirippu marayudhu. Paathutu irundha students amaidhiya aayitaanga. Appo pinnaadi irundhu oru kural.'),
    ],
    lose: L('Nithish\'s fists shake. The words won\'t come.', 'Nithish kai nadungudhu. Vaarthai varala.'),
  },

  // ---------------------------------------------------------------- V7: the interrogation room
  interrogation: {
    id: 'interrogation',
    title: L('The interrogation room', 'Visaaranai arai'),
    goal: L('Hold out for six rounds. Don\'t give up Dhanasree.', 'Aaru round thaangu. Dhanasree-a kaati kudukkadha.'),
    you: 'nithish', foe: 'interrogator', mode: 'endure', resolve: 1, composure: 80, rounds: 6, music: 'standoff',
    intro: [
      foe('Nithishkumar, correct?', 'Nithishkumar, correct-ah.'),
      you('Yes, sir.', 'Yes, sir.'),
      foe('Tell me, Nithish. Why did you run from the police?', 'Sollu Nithish, police kitta irundhu yedhuku oduna?'),
    ],
    moves: [
      mv('deny', L('"I don\'t know anything"', '"Yenakku onnum theriyadhu"'), L('Deny it, plainly.', 'Nerya maru.'), [
        L('No, sir, I swear I don\'t know anything!', 'Illa sir, yenaku sathyama yedhuvum theriyadhu!'),
        L('I didn\'t do anything, sir.', 'Na yedhuvum pannala sir.'),
      ]),
      mv('endure', L('Stay silent', 'Amaidhiya iru'), L('Say nothing. Breathe.', 'Onnum pesadha. Moochu vidu.'), [
        L('(Nithish stares at the table and says nothing.)', '(Nithish table-a paathutu onnum pesala.)'),
        L('(He wipes his palms on his trousers and keeps quiet.)', '(Kaiya pants-la thodaichutu amaidhiya irukaan.)'),
      ]),
      mv('truth', L('"I was scared"', '"Bayandhutan"'), L('Tell the part of the truth that\'s yours.', 'Un pangu unmaiya mattum sollu.'), [
        L('I saw the police and I panicked. That\'s all.', 'Nan police-yellam paatha odaney bayandhutan. Avlodhaan.'),
        L('I didn\'t know what to do. I thought they\'d say I was the one.', 'Yenna pandradhu-nu therla. Naan-dhaan karanam-nu pudika vandhanga-nu nenachan.'),
      ]),
    ],
    stances: [
      { stance: 'pressing', weight: 3, lines: [
        L('Responsible for what? All of the deaths? Did you do it? Tell me.', 'Yedhuku karanam-nu? Nadhandha saavu-ku yellama? Nee dhaan adhellam panniya? Sollu.'),
        L('Your friend told you to run, didn\'t she?', 'Un friend dhaan oda sonnala?'),
        L('Why were you in contact with the victims? Why did you run?', 'Nee yen victims-oda contact la irundha? Nee yen police-ah paathu bayandhu oduna?'),
      ] },
      { stance: 'cold', weight: 2, lines: [
        L('Evading law enforcement. Obstruction of justice. This follows you for the rest of your life.', 'Evading law enforcement, obstruction of justice. Nee ippo pandra thappu un vaalka full-ah pinnadiye varum.'),
        L('What will your family think when they hear?', 'Un veetuku therinja yenna pannuvanga?'),
      ] },
      { stance: 'enraged', weight: 2, lines: [
        L('(He slams his hands on the table.) Trouble? You\'re IN trouble!', '(Table-la kaiya adikkuraar.) Prechanaya? Ippo nee prechana-la dhaan iruka!'),
        L('Only the guilty run from the police!', 'Thappu pannavanga dhaan police-kitta irundhu oduvanga!'),
      ] },
      { stance: 'guarded', weight: 1, lines: [
        L('(He walks slowly around the room. His footsteps echo off the concrete.)', '(Arai-a suththi mella nadakkuraar. Kaaladi saththam concrete-la edhirolikkudhu.)'),
        L('If your friend helped you, we\'ll arrest her too. Think carefully. This is your last chance.', 'Un friend unakku help pannirundha-na, avalaiyum arrest panniduvom. Nalla yosichu badhil sollu. Idhan last chance.'),
      ] },
    ],
    hurt: [L('(He narrows his eyes, unconvinced.)', '(Kanna surukkuraar, nambala.)')],
    shrug: [L('Hm. Keep talking.', 'Hm. Pesu.')],
    win: [
      you('She didn\'t do anything. I ran. I was scared, so I ran. She has nothing to do with this.', 'Illa, ava yedhuvum pannala. Naandhan… naandhan odunan. Yenaku bayama irundhadhu-naala odi vandhan. Avalukum idhukum yendha sammandham-um illa.'),
      nar('The inspector studies him for a long moment. He isn\'t convinced. But Nithish hasn\'t said her name.', 'Inspector avana romba neram paakuraar. Nambala. Aana Nithish ava pera sollala.'),
    ],
    lose: L('Nithish buries his face in his hands. He almost says her name. (Try again.)', 'Nithish mugatha kaiyala moodikkuraan. Ava pera kittathatta sollitaan. (Thirumba try pannu.)'),
  },

  // ---------------------------------------------------------------- V9: the main gate, in the rain
  gate_guard: {
    id: 'gate_guard',
    title: L('The main gate', 'Main gate'),
    goal: L('Get the guard to open the gate, without hurting anyone.', 'Yaaraiyum kaayapaduthaama, security-a gate thorakka vei.'),
    you: 'dhanasree', foe: 'security', mode: 'resolve', resolve: 70, composure: 50, music: 'standoff',
    intro: [
      nar('Dhanasree grips the gun. She doesn\'t want to use it unless she has no choice.', 'Dhanasree thuppakkiya irukki pudikkura. Vera vazhi illana mattum dhaan use pannanum.'),
      you('Open the gate.', 'Gate open pannunga.'),
      foe('No... I can\'t do that—', 'Illa… Na apdi panna—'),
    ],
    moves: [
      mv('threaten', L('Raise the gun', 'Thuppakkiya thooku'), L('Let him see it.', 'Avanukku theriyattum.'), [
        L('(She lifts the gun, steady.) The gate. Now.', '(Thuppakkiya nerya thookura.) Gate. Ippo.'),
      ]),
      mv('comfort', L('"I won\'t hurt you"', '"Ungala onnum panna maaten"'), L('Promise him he\'s safe.', 'Avar safe-nu urudhi kodu.'), [
        L('I won\'t do anything to you. Just open the gate.', 'Ungala na yedhuvum panna maaten. Kadhava mattum thorandhu vidunga.'),
        L('Nobody gets hurt. I promise.', 'Yaarukum onnum aagadhu. Promise.'),
      ]),
      mv('persuade', L('"Please"', '"Please"'), L('Reason with him.', 'Avar kitta pesi puriya vei.'), [
        L('We\'re just students. We need to get out, that\'s all.', 'Naanga verum students. Veliya ponum, avlodhaan.'),
      ]),
      mv('truth', L('"We\'re being chased"', '"Thorathuraanga"'), L('Tell him why.', 'Yen-nu sollu.'), [
        L('We haven\'t done anything wrong. Please, just let us out.', 'Naanga yendha thappum pannala. Please, veliya vidunga.'),
      ]),
    ],
    stances: [
      { stance: 'afraid', weight: 3, lines: [
        L('(He stares at the gun, sweating.) M-madam...', '(Thuppakkiya paathu vervaikkuraar.) M-madam…'),
        L('Don\'t shoot, don\'t shoot...', 'Sudaadheenga, sudaadheenga…'),
      ] },
      { stance: 'pleading', weight: 2, lines: [
        L('I\'ll lose my job, madam. Please.', 'Yen vela poidum madam. Please.'),
      ] },
      { stance: 'cold', weight: 1, lines: [
        L('The gate stays shut after hours. Rules.', 'Time mudinja gate thorakka koodadhu. Rules.'),
      ] },
      { stance: 'wavering', weight: 1, lines: [
        L('(He glances back at the gate, then at the gun.)', '(Gate-a thirumbi paakuraar, aprom thuppakkiya.)'),
      ] },
    ],
    hurt: [L('(His hands shake.)', '(Kai nadungudhu.)')],
    shrug: [L('(He shakes his head.)', '(Thalaiya aatturaar.)')],
    win: [
      nar('The guard steps forward, sweating, and unlocks the gate.', 'Security vervaiyoda munnaadi vandhu gate-a thorakkuraar.'),
      you('Thanks. Don\'t tell anyone about this.', 'Thanks. Idha pathi yartaiyum solladheenga.'),
    ],
    lose: L('The guard backs away, fumbling for his phone. (Try again.)', 'Security pinnaadi nagandhu phone-a thedura. (Thirumba try pannu.)'),
  },

  // ---------------------------------------------------------------- V11: the restroom door
  restroom: {
    id: 'restroom',
    title: L('The locked door', 'Moodiya kadhavu'),
    goal: L('Talk Dharshna into opening the door.', 'Dharshna-va kadhava thorakka vei.'),
    you: 'dhanasree', foe: 'dharshna', mode: 'resolve', resolve: 100, composure: 60, music: 'sorrow',
    intro: [
      you('Dharshna, I know you\'re in there. Come out.', 'Dharshna, nee ulla-dhaan irukan-nu theriyum. Veliya va.'),
      foe('Who is it? Dhanasree...', 'Yaaru? Dhanasree…'),
      you('It\'s me. Open the door first.', 'Naandhan. Modhala kadhava thora.'),
    ],
    moves: [
      mv('comfort', L('"I\'m here"', '"Naan irukan"'), L('Stay with her.', 'Kooda iru.'), [
        L('I\'m here. I\'m here.', 'Naan irukan! Naan irukan…'),
        L('I know it feels like the whole world is falling apart.', 'Indha ulagamey ippo idinju vilugura maari irukum unaku. Yenaku puridhu.'),
      ]),
      mv('persuade', L('"We\'ll find a way"', '"Vazhi kandupudikalam"'), L('Give her a way forward.', 'Munnaadi poga oru vazhi kaattu.'), [
        L('Sitting in there won\'t change anything. Let\'s talk and find a solution. You have to come out first.', 'Ullaye ukkandhutu irukuradhu-naala onnum aaga poradhu illa. Namma pesi oru solution kandu pudikalam. Adhuku nee modhala veliya varanum.'),
        L('There\'s a solution to everything, Dharshna. Trust me.', 'Yelathukum oru solution irukum Dharshna. Yenna nambu.'),
      ]),
      mv('truth', L('"You\'re stronger than you think"', '"Nee nenaikuradha vida strong"'), L('Tell her what you see in her.', 'Aval kitta nee paakuradha sollu.'), [
        L('You chose to stay in a hostel, with all of this. That shows your strength.', 'Ipdi oru prechana irundhum nee hostel-la thangi padikira-nu decision yedhuthuruka. That shows your strength.'),
        L('Someone hurt you in the past. Why are you still afraid in the present?', 'Unnoda past-la yaaro unakku prechana pannitanga-nu nee yedhuku present-la bayandhutu iruka?'),
      ]),
      mv('endure', L('Let her shout', 'Kathattum'), L('Take it. Don\'t leave.', 'Thaangu. Pogadha.'), [
        L('(Dhanasree rests her hand on the door and waits.)', '(Dhanasree kadhavula kai vechu kaathirukka.)'),
      ]),
    ],
    stances: [
      { stance: 'grieving', weight: 3, lines: [
        L('I don\'t even know what\'s happening to me any more.', 'Yenakku ippolam yenna nadakudhu-ney therila.'),
        L('My past made me do things I didn\'t even know about. Now it\'s hurting other people.', 'Yennoda past-naala yenna yenna-mo senjutu iruken yenakey theriyama. Adhu mathavangala ippo hurt pannudhu.'),
      ] },
      { stance: 'enraged', weight: 2, lines: [
        L('There\'s no solution for this... JUST GO AWAY!', 'Illa, idhuku yendha solution um illa…. NEE INGA IRUNDHU PO!'),
        L('Don\'t look at me. Go!', 'Yenna paaka vendam. Nee po!'),
      ] },
      { stance: 'afraid', weight: 2, lines: [
        L('If I stay alive, more people will get hurt.', 'Na uyiroda irundha kandippa innum neraya peruku prechana varum.'),
        L('I can\'t. I can\'t do it.', 'Yennala mudila.'),
      ] },
      { stance: 'guarded', weight: 1, lines: [
        L('No, Dhanasree. Go. I need to be alone for a while.', 'Illa Dhanasree. Nee po. Na konjo neram thaniya irukanum.'),
      ] },
      { stance: 'wavering', weight: 1, lines: [
        L('I... I don\'t want to be like this.', 'Yenaku.. Yenaku ipdi iruka pudikala.'),
      ] },
    ],
    hurt: [L('(Her sobbing quiets a little.)', '(Aval azhugai konjam kurayudhu.)')],
    shrug: [L('(She curls up tighter against the wall.)', '(Suvaroda innum irukki okkaaruraa.)')],
    win: [
      you('I know. You won\'t always be like this. You have to take the first step. And it can be now. Open the door.', 'Yenaku theriyum. Nee yeppovum ipdiye iruka poradhu illa. Andha first step nee yeduthu-dhaan aganum. And it can be now. Kadhava thora.'),
      nar('A long silence. Then the shuffle of feet, and the lock clicks open.', 'Neenda amaidhi. Aprom kaal saththam, poottu "click"-nu thorakkudhu.'),
    ],
    lose: L('Dharshna stops answering. Dhanasree presses her forehead to the door. (Try again.)', 'Dharshna badhil sollala. Dhanasree kadhavula nethiya vechukkura. (Thirumba try pannu.)'),
  },

  // ---------------------------------------------------------------- V12: the cut road, the standoff
  rajesh: {
    id: 'rajesh',
    title: L('Dhanasree vs her father', 'Dhanasree vs appa'),
    goal: L('Make your father step away from Nithish.', 'Appa-va Nithish kitta irundhu thalli poga vei.'),
    you: 'dhanasree', foe: 'rajesh', mode: 'resolve', resolve: 140, composure: 70, music: 'standoff',
    intro: [
      foe('Dhanasree... what are you doing? Put the gun down.', 'Dhanasree… Yenna pannitu iruka? Gun-ah keela podu.'),
      you('No, pa. I won\'t let you arrest him.', 'Illa, pa. Neenga avana arrest panna vida maaten.'),
    ],
    moves: [
      mv('deny', L('"No, pa"', '"Illa, pa"'), L('Refuse. Don\'t move.', 'Maru. Nagaradha.'), [
        L('No, pa.', 'Illa, pa.'),
        L('I\'m not giving it to you.', 'Kudukka maaten.'),
      ]),
      mv('threaten', L('Hold the gun steady', 'Thuppakkiya nerya pudi'), L('Show him you mean it.', 'Nijama-nu kaattu.'), [
        L('(Her hands stop shaking.) Get away from Nithish first.', '(Kai nadukkam nikkudhu.) Neenga Nithish kitta irundhu modhala thalli ponga.'),
      ]),
      mv('truth', L('"He didn\'t do it"', '"Avan pannala"'), L('Tell him the truth.', 'Unmaiya sollu.'), [
        L('He didn\'t do anything, pa. You\'ve got the wrong person.', 'Avan onnum pannala pa. Neenga thappana aala pudichirukeenga.'),
      ]),
      mv('persuade', L('"Let him go"', '"Avana vidunga"'), L('Ask him, as his daughter.', 'Ponna kelu.'), [
        L('Please, pa. Let him go. Just this once.', 'Please pa. Avana vidunga. Indha oru dhadava mattum.'),
      ]),
    ],
    stances: [
      { stance: 'pleading', weight: 3, lines: [
        L('Dhana, listen to me. Give me the gun.', 'Dhana, na solradha kelu. Gun-ah yen kitta kudu.'),
        L('Dhanasree, we\'ll talk about this. Give me the gun first.', 'Dhanasree, namma idha pathi pesalam. Gun-ah modhala kudu.'),
      ] },
      { stance: 'pressing', weight: 2, lines: [
        L('(He takes a slow step forward.) Give it to me, Dhana.', '(Mella oru adi munnaadi vaikkuraar.) Kudu Dhana.'),
      ] },
      { stance: 'cold', weight: 1, lines: [
        L('You\'re aiding a murder suspect. Do you understand what that means?', 'Kolai sandhega nabarukku udhavura. Adhu yenna-nu puriyudha?'),
      ] },
      { stance: 'afraid', weight: 1, lines: [
        L('(His voice cracks.) Dhana... it\'s me. Your appa.', '(Kural udaiyudhu.) Dhana… naan dhaan-ma. Un appa.'),
      ] },
      { stance: 'wavering', weight: 1, lines: [
        L('(Behind her, police close in. Rajesh hesitates.)', '(Aval pinnaadi police nerungudhu. Rajesh thayangaraar.)'),
      ] },
    ],
    hurt: [L('(Rajesh freezes.)', '(Rajesh uraiyuraar.)')],
    shrug: [L('Dhana. Enough.', 'Dhana. Podhum.')],
    win: [
      you('(shouting, tears in her eyes) GET BACK!!', '(kathi, kannula thanni) THALLI PONGA!!'),
      nar('Something in Rajesh breaks. He takes a step back, his eyes full of disbelief.', 'Rajesh-kulla edho udaiyudhu. Nambamudiyaadha kannoda oru adi pinnaadi vaikkuraar.'),
    ],
    lose: L('Her arms drop an inch. Rajesh steps closer. (Try again.)', 'Aval kai konjam irangudhu. Rajesh nerungaraar. (Thirumba try pannu.)'),
  },
};
