# Act I, Venture 8: "Sorry, Nithish". 2 October 2022, 9 PM onward.
# Playable: Ragul's anime daydream (two fights and the Captain), then the broken mirror.
# Cinematic: Nagaraj's missing pistol, Dhanasree's mother, the hospital, THE TWIST.
# After this Venture the Case Board shows what really happened (flag truth_known).

@label start
@venture 1 8
@title Sorry, Nithish
  ta: Sorry, Nithish
@time 2 October 2022, 9:00 PM
@set at_night
@set nithish_cuffed
@party ragul
@card
@save start
@scene gen:station
@music tense
RAJESH: Ramanan, we need to go to Parvathy hospital. Come. Nagaraj, mind the station.
  ta: Yov Ramanan, Parvathy hospital ponum. Kooda-va. Yov Nagaraj, station-ah paathuko.
NITHISH: Sir... I'm hungry...
  ta: Sir, yenaku pasikkudhu…
NAGARAJ (thinking): My pistol's missing and I'm going out of my mind, and he keeps shouting. Good thing Rajesh hasn't noticed yet. I have to find it somehow...
  ta: Naaney yennoda pistol-ah kaanom-nu tension-la irukan, Ivan vera summa kathitey irukan. Nalla-vela Rajesh innum paakala. Yepdi-aachu kandu-pudikanum…
NAGARAJ: Wait a bit. I'll get you something. Till then, sleep.
  ta: Konja neram iru… vangitu varan. Adhuvaraikum amaidhiya thoongu.
@clue missing_pistol

@scene gen:house_night
@music campus_night
NARRATOR: Dhanasree unlocks her mother's room. Ragul is still awake, lights on.
  ta: Dhanasree amma room-a thorakkura. Ragul innum thoongala, light on-la.
DHANASREE: You always fall asleep early. Why are you still up?
  ta: Nee yeppovum seekram thoongiruva, yen innum thoongama iruka?
RAGUL (shocked): How do you know that?!
  ta: Unakku yepdi theriyum?!
DHANASREE: I know.
  ta: Theriyum.
RAGUL (thinking): Maybe she has a crush on me. She knows so much about me... If I confessed, there's a good chance she'd say yes.
  ta: Oru-vela ivaluku yen mela crush irukumo. Yenna pathi neraya vishayam therinju vechiruka… Maybe na iva kitta confess pannita ok solla neraya chance iruku polaye.
RAGUL (thinking): If she tells me how her mother died, it means I'm more than a friend. She's never told anyone about her mother.
  ta: Ivaloda amma yepdi sethaanga-nu kepom, sollita, she is likely acknowledging me as something more than a friend. Ava amma pathi yaar kittaiyum sonnadhey illa.
RAGUL: Um... I wanted to ask earlier. How did your mother die?
  ta: Uh… Appavey kekanum-nu nenachan, unnoda amma yepdi yerandhanga?
NARRATOR: Dhanasree thinks for a long time.
  ta: Dhanasree romba neram yosikkura.
DHANASREE: I was about thirteen then...
  ta: Appo yenaku oru 13 vayasu irukum,
RAGUL (thinking): Yes!
  ta: Yes!
@sfx knock
NARRATOR: Someone knocks at the front door. Dhanasree quickly locks Ragul in and goes to answer it.
  ta: Yaaro main door-la thattaraanga. Dhanasree vegama Ragul room-a poottittu thorakka poraa.
AMSA: Your father's on the line, dear.
  ta: Unga appa line-la irukaru.
DHANASREE (scared): Hello, appa.
  ta: Hello, appa.
RAGUL (thinking): Her father's here! What if he opens this door? Then... a CHASE! Dhanasree grabs my hand and we run... Yay! And if anyone gets in our way...
  ta: Dhanasree appa vantanga-nu ninaikiren. Oru-vela unexpected-ah indha room kadhava thorandhuta yenna pandradhu… Chasing dhaan! Dhanasree yenna kootitu oduva… Yay! Appo yevana kuruka vandha…
@fx flash
@scene none
@room daydream start dream

@label dream
@fx fade_in
@music daydream
@end

@label dream_start
@set v08_dream_started
NARRATOR: Ragul, heroic, stands in front of Dhanasree. From the shadows of the hallway come soldiers in black suits, their eyes glowing blue.
  ta: Veeramaana Ragul, Dhanasree munnaadi nikkuraan. Hallway nizhalula irundhu karuppu suit pottu, neela kann minna, sippaigal varaanga.
RAGUL (angry): Who are you people?! I'll chase every last one of you out of here!
  ta: Yaru neenga yellam?! Oruthar vidama thorathi adikurran paarunga!
DHANASREE (scared): Ragul, what do we do?
  ta: Ragul, namma yenna panna porom?
RAGUL: Dhanasree, "daijoubu". As long as Raguru Purakashu is here, nothing will happen to you.
  ta: Dhanasree, "daijobou". Raguru purakashu irukura varaikum unaku onnum aavadhu.
NARRATOR: A stick appears in his hand like a sword.
  ta: Avan kaila oru kucchi, vaal maadhiri.
@objective Protect Dhanasree. Fight your way to the end of the hall.
  ta: Dhanasree-a kaappaaththu. Hall mudivu varaikum sandai pottu po.
@end

@label captain
@set v08_dream_done
@done
NARRATOR: At the top of the stairs, a tall figure in a long coat, eyes burning blue.
  ta: Padi mela, neenda coat pottu, neela kann eriyura oru uyaramaana uruvam.
RAGUL (happy): Superhero Ragul, activated!
  ta: Superhero Ragul, activated!
@battle dream_captain
DHANASREE (happy): Ragul, you were amazing!
  ta: Ragul, kalakkura!
RAGUL (happy): This is only the beginning, Dhanasree!
  ta: Idhu verum aarambam-dhaan, Dhanasree!
@fx flash
@sfx shatter
@fx shake
@fx black
@party ragul
@room dhana_house mother_room mirror_crash

@label mirror_crash
@set v08_house
@fx unblack
@music campus_night
RAJESH: I'll be late, chellam. Eat and go to sleep.
  ta: Na varadhuku late-aagum, nee saptu thoongiru da chellam.
DHANASREE: Okay, pa. Be careful.
  ta: Sari pa, paathu va, yenna.
RAJESH: Your phone was switched off, so I called Amsa aunty. Keep it charged. The city's gotten bad; you never know what'll happen.
  ta: Un mobile-ku call pannen, switched-off nu vandhuchu, adhaan Amsa aunty-ku call panni kuduka sonnan. Ippo-lam city romba mosam-aiduchu, yeppo yenna nadakudhuneyy theriya maatingudhu.
DHANASREE: I forgot one day and you start with the boomer lecture.
  ta: Yedho oru naal marandhutu poitan. Odaney boomer poda aaramichuteenga.
NARRATOR: Meanwhile, Ragul has been waving his arms and legs in the air, acting out every move. One wild swing knocks the mirror off the shelf. It shatters on the floor.
  ta: Idhukkulla, Ragul kaal kaiya kaathula veesi ovvoru move-ayum nadichittu irundhaan. Oru veesalil shelf-la irundha kannaadi keezha vizhundhu norungudhu.
DHANASREE (angry): What happened?!
  ta: Yennada aachu?!
RAGUL: I, uh... wanted to read one of your books. My hand slipped and the mirror fell.
  ta: Books yellam vechurundhiya, adhaan yeduthu padikalanu ponen. But kai-slip aagi, pakkathula irundha mirror keela vilundhuru-chu.
NARRATOR: Dhanasree rushes to the shelf, searching. She finds a white-and-blue beaded bracelet, and lets out a long breath.
  ta: Dhanasree shelf pakkam odi, thedura. Oru vella-neela mani bracelet-a kandupudichu, neela moochu vidura.
DHANASREE (angry): If anything had happened to this bracelet... I wouldn't have let you off. Lucky for you.
  ta: Indha bracelet-ku mattum yedachu airundhchu… Unna summa vitruka maaten. Nallavela, thappichuta.
RAGUL: What's so special about it?
  ta: Apdi yenna iruku andha bracelet-la?
DHANASREE (sad): My mother bought it for me. It's my favourite.
  ta: Idhu yen amma vaangi kuduthadhu. It's my favorite.
@codex p01_bracelet
DHANASREE: And who's going to clean this up?
  ta: Idha yaaru clean pannuva?
NARRATOR: Ragul smiles guiltily.
  ta: Ragul kutra unarchiyoda sirikkuraan.

@scene gen:hospital
@music mystery
NARRATOR: Parvathy hospital. Families wait in the corridor.
  ta: Parvathy hospital. Corridor-la kudumbangal kaathirukaanga.
GIRL: What if our son has that mystery disease too? I'm scared...
  ta: Namma paiyan-ukum andha marma noi dhaan vandhurukumo… Yenaku bayama iruku-nga…
GUY: It's just a fever. Nothing will happen to him. Be quiet.
  ta: Idhu verum fever dhaan-di, paiyan-uku onnu aavadhu. Vaaya mooditu konjo amaidhiya iru.
NARRATOR: A doctor calls out: "Patient Nelson's parents?" Both of them stand up.
  ta: Oru doctor koopidaraar: "Patient Nelson oda parents?" Rendu perum ezhundhirukaanga.
NARRATOR: Room 305. Krishnaa sits up in bed, bandages on his head, an arm and a leg.
  ta: Room 305. Krishnaa bed-la ukkandhurukaan, thala, oru kai, oru kaal-la bandage.
RAJESH: Krishnaa. Can you tell me exactly how the accident happened this evening?
  ta: Krishna, Inaiku evening nadandha accident pathi sila questions kekanum. Accident correct-ah yepdi aachu-nu solla mudiyuma?
KRISHNAA: Pranav was driving, I was behind him. Suddenly he just... fainted, while he was riding. We slipped and fell.
  ta: Nanum yennoda friend pranav-um bike-la vandhutu irundhom, avan dhan drive pannan. Thideernu Pranav apdiye bike drive panna panna-vey mayakkam potutan. Slip aagi apdiye keela vizhundutom.
RAJESH: Your friend is dead. Did you know?
  ta: Unga friend yerandhutaru. Adhu theriyuma ungaluku?
KRISHNAA (shocked): What...? What are you saying, sir? Pranav... No, sir, we weren't even going that fast.
  ta: Yenna… Yenna sir solreenga? Pranav… Illa sir, andha alavuku speed-ah yellam naanga pola.
RAJESH: You said he fainted. He was already dead then. It's one of the mysterious deaths at your college.
  ta: Neenga avan mayakkam potan-nu sonnengala… appovey avan yerandhutan. Unga college-la mysterious aana saavu-yellam nadandhutu irukula… adhula idhuvum onnu.
RAJESH: The morning of the fest, you sent Nithish down the cut road. After he went, did you hear anything?
  ta: Fest nadandha anaikku kalaila, neenga solli avan class-ku cut route-la poirukan. Avan ponadhuku aprom… yedachu sound ketucha?
KRISHNAA: ...Yes, sir. Something went "thud".
  ta: Aama sir. Yedho 'dhoppunu' ketuchu sir.
RAJESH: By any chance... did you meet Nithish before the accident?
  ta: By chance, accident-ku munnadi neenga Nithish-ah meet panningala?
@clue pranav

@scene gen:house_night
@music campus_night
RAGUL: Let me out, Dhanasree!
  ta: Thorandhu vidu Dhanasree!
DHANASREE (angry): You broke the mirror. Stay in there.
  ta: Kannadi odachila, ullaye keda.
RAGUL: What if I need the bathroom?
  ta: Bathroom paganum-na yenna pandradhu.
DHANASREE: Do it in your pants.
  ta: Pant laye poiko.
RAGUL: WHAT?!
  ta: Yenna?!
DHANASREE: Idiot, there's an attached bathroom right there!
  ta: Dei mundam attached bathroom iruku-da angaye!
NARRATOR: He switches off the light and lies down.
  ta: Light-a off panni padukkuraan.
RAGUL (thinking): Today was strange. So many things I'd never done, all in one day. No time to react to any of it.
  ta: Inaikku oru maadhiri vithyasama yellam nadandhuchu. Idhukku munnadi pannadha neraya visayam orey naal-la pannirukan. Aana idhukellam react pandradhuku kooda time kedaikala.
RAGUL (thinking): Running from the police. Talking to a girl. Begging in front of Dhanasree. Getting Nithish caught so I'd escape. Killing Pranav...
  ta: Police-kitta irundhu odunadhu; Oru ponnu kitta pesunadhu; Dhanasree munnadi kenjunadhu; Police-kitta naan thapikka, Nithish-ah maati vittadhu… Pranav ah konnadhu…
@music none
@fx red_flash
@warn The next scene reveals what Ragul has done.
  ta: Adutha scene Ragul enna pannaan-nu kaattum.
@scene gen:classroom
@music standoff
NARRATOR: The placement hall. Earlier today. Ragul's interview.
  ta: Placement hall. Inniku munnaadi. Ragul-oda inquiry.
RAJESH: Did you hear anything at that time?
  ta: Andha nerathula unakku yedachu satham ketucha?
RAGUL: About a minute before I saw the body... something went "thud", sir.
  ta: Naa body-ah paakaruku oru 1 min munnadi… yedho 'dhommunu' satham ketuchu sir.
RAGUL: And someone in a red shirt was walking away.
  ta: Yaaro oruthar red shirt potu nadandhu poitu irundharu…
RAJESH: The boy who just walked out. That was him.
  ta: Ippo veliya ponaney oruthan… Avandhan adhu.
RAGUL: Yes, sir. Nithish.
  ta: Aama sir, Nithish.
RAJESH: Do you suspect him of anything?
  ta: Unakku avan mela yedachu sandhegam iruka?
RAGUL (thinking): What do I do now... What if they find out I killed Subramani?! But... no... I didn't go and kill him, he came to me... No... no... I didn't kill him...
  ta: Ippo na yenna pandradhu… Subaramani-ah naandhan konna-nu oruvela ivunga kandu pudichita yenna panna?! Aana.. illa… Naana poi avana kollula, avandhan… avanadhaan vandhan… Illa.. Illa.. Na kollala…
RAGUL (thinking): If they find out about me, I'm finished. What do I do... Sorry, Nithish. The world is cruel.
  ta: Oruvela yenna pathi kandu-pudichita, na maatikuven. Ippo yenna panna… Sorry Nithish, the world is cruel.
RAGUL (scared): Sir... I think Nithish is behind all the killings.
  ta: Sir, nadandha yella kolaiku pinnadiyum Nithish irukan-nu nenaikuran sir.
RAJESH: What?
  ta: Yenna solra?
RAGUL: He disappears at night, sir. But in the morning he's in his bed. When I ask, he says it must have been a dream. And since the murders started, he's been coming back late at night. I don't know where he goes.
  ta: Night yellam… kaanama poiduran sir… aana kaalaila correct-ah bed la thoongitu irukan. Idha pathi keta, yellam kanava irukum-da nu soldran sir. Indha murder yellam start aaga aaramichadhula irundhu late night-la dhaan varan, yenga poraneyy therla.
RAJESH: Will you say this anywhere we ask you to?
  ta: Idha nee yenga ketalum vandhu solluviya?
RAGUL: Definitely, sir.
  ta: Kandippa sir.
RAJESH: Nagaraj, switch on the recorder. Say it again, clearly. From now on, wherever Nithish goes, you inform us. Otherwise we'll arrest you too, for helping a murderer. Understand? And don't tell Nithish.
  ta: Yov, Nagaraj recorder on pannu. Nee yen-kitta sonnadha thirumba innoru vaati theliva sollu. Inimey, Nithish yenga ponalum yengalukku inform pannanum. Illa-na, kolayali-ku udhavi pannuna-nu unnayum sethu arrest panniduvom. Puridha?
RAGUL (scared): Don't let anything happen to me, sir... I'm scared...
  ta: Yenakku yedhuvum aagama paathukonga sir… Bayama irukku…
@scene gen:campus_dusk
NARRATOR: Walking to Cheese N Freeze, Ragul was already thinking:
  ta: Cheese N Freeze-ku nadakkumbodhe Ragul yosichukittu irundhaan:
RAGUL (thinking): In a little while the effect will get stronger and Pranav will die too... Now I just inform the Inspector and get Nithish caught.
  ta: Konjo nerathula effect adhigam aagi pranav-um sethuruvan... Ippo Inspector kitta inform panni yepdiyadhu Nithish-ah maati vitranum.
@scene gen:cheese_freeze
NARRATOR: At the table, he was texting. The contact name: "Inspector". "Sir, Nithish and Pranav had a fight. Nithish has brought us to Cheese N Freeze."
  ta: Table-la, avan text pannitu irundhaan. Contact peru: "Inspector". "Sir, Nithish-um Pranav-um sanda potukutanga. Nithish yengala kutitu Cheese-n-freeze vandhurukan."
NARRATOR: The reply: "Stay close to Nithish. Keep your mobile switched on."
  ta: Badhil: "Stay with Nithish closely. Keep your mobile switched on."
@scene gen:market_evening
NARRATOR: In Radha Nagar, when Dhanasree told them to switch off their phones, he only locked his screen. And behind the bins, when the police walked away without seeing them, he checked it. It had died.
  ta: Radha Nagar-la, phone off panna Dhanasree sonnappo, avan screen lock mattum pannaan. Kuppa thotti pinnaadi, police paakaama poyittaanga-nu paathappo, phone-a check pannaan. Charge theerndhu poyirundhuchu.
RAGUL (scared): Shit!
  ta: Shit!
@clue informant
@set truth_known
@scene gen:house_night
@music sorrow
RAGUL: I think I'll sleep really well tonight.
  ta: Innaiku sema thookam varum-nu nenaikuren.
NARRATOR: Ragul slowly falls asleep.
  ta: Ragul mella thoongi poraan.
@scene none
@fx fade_out
@next p01/v09
@end

@label hero_pose
@codex p01_superhero
RAGUL (happy): A glowing scroll! "Secret technique: the hero's pose." ...I knew it.
  ta: Minnura oru olai! "Ragasiya vidhai: hero pose." …Enakku theriyum.
@end
