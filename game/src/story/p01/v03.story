# Act I, Venture 3: "Snow in a dream". 30 September - 2 October 2022.
# Playable: Nithish's dream of a snowy place (Glacia, though he doesn't know it); Ragul's dizzy walk.
# Cinematic: the night talk, the mortuary, Janani, the flashback, Dharshna's spark, "Daijobou", Subramani.
# Content: death, grief; a remembered assault is heard only as a scream (never shown or described).

@label start
@venture 1 3
@title Snow in a dream
  ta: Kanavula pani
@time 30 September 2022, night
@warn This chapter deals with death and grief, and a character briefly relives a past assault (heard, not shown).
  ta: Indha chapter-la saavu, sogam irukku. Oru kadhaapaathiram pazhaya thaakkudhal-a nyabagam paduthura (kekkum, kaattapadaadhu).
@party ragul
@card
@save start
@scene gen:hostel_room_night
@cast ragul@0.34>:sit nithish@0.64<
@prop bed@0.34 bed@0.8^
@caption Boys' hostel, that night
  ta: Pasanga hostel, andha raathiri
@music campus_night
NITHISH (angry): Dei! I stood there arguing with him for you, and you didn't say a single word?!
  ta: Dei kammunaati. Naa unakkaga avlo pesitu irukan avanta. Nee oru vaartha kuda pesala?!
RAGUL: What would it change if I spoke? I didn't even know what to say.
  ta: Naa pesi mattum ennada aaga podhu? Appo enakku enna solradhu-nu kooda therla.
NITHISH: How long are you going to be like this? If you keep quiet, he'll keep climbing on your head.
  ta: Evlo naal-dhaanda nee ipdiye iruka pora. Nee ipdiye pesama vittutu irundha avan mela-eri aadikittey-dhaan irupaan.
@shot close ragul
RAGUL (sad): Why should I start a fight with him? Who does it help? What's the use of living, even? It's all a waste. If life is a waste, fighting is pointless.
  ta: Na yedhuku avan-ta modhala prechana pannanum. Adhunaala yaruku enna prayojanam. Modhala vazhradhu-naala enna prayojanam. Yellameyy waste-dhaan. Vaalkaiye waste-ngrappo, prechana panni yendha payanum illa.
@shot on nithish
NITHISH (angry): What nonsense! When we have a problem, WE have to stand up. Other people can't always come and help. Sometimes we have to save ourselves.
  ta: Dei yennada loosu maari olaritu iruka!!! Namakku yedhachu prechana-na namma dhaanda nikkanum. Ella neram-um aduthavangaley vandhu help pannitu iruka mudiyadhu. Sila neram nammaley-dhaan nammala kaapathikanum.
@shot two ragul nithish
RAGUL: That Krishnaa... I've forgiven him. Who knows how cruel this world has been to him?
  ta: Andha Krishnaa, avana na manichu vittutan. Yaaruku theriyum, indha ulagam avanuku evlo koduma pannucho?
@shot push ragul
RAGUL: Maybe he had a reason to trip me. Maybe someone pushed him into being like this. The world's cruel. In the end, we're all just suffering.
  ta: Oru-vela avan yenna thalli-vittadhuku yedhachu reason irukalam. Illa yaravadhu avana indha nelamaiku thalli vitrukalam. The world's cruel. In the end, we're all just suffering.
@shot auto
NITHISH: Dei, don't overthink it. He pushed you, so I fought him, that's all. Next time, you stand up for yourself.
  ta: Dei, nee romba yosikkadha. Avan unna thalli-vittaan. Adhanala na avan-ta sanda poten, avlo-dhan. Inimel yedhana prechana panna neeyum thatti-kelu.
NARRATOR: Ragul gives him a half-hearted smile and lies down. Nithish switches off the light.
  ta: Ragul arai manasa oru sirippu sirichittu padukkuraan. Nithish light-a off pandraan.
@fx fade_out
@scene none
@party nithish
@room snow_dream start dream

@label dream
@fx fade_in
@music lullaby
@end

@label dream_run
NITHISH (confused): Where is this place? It looks like Kashmir!
  ta: Yenna edam idhu? Kashmir maari iruku?!
NARRATOR: Snow everywhere, and trees with white leaves. Far away, people are laughing and throwing snow.
  ta: Engum pani, vella ilai marangal. Dhoorathula yaaro sirichukittu pani erinju vilayaaduraanga.
NARRATOR: Someone runs past him. At first her face is a blur. Then it clears. Janani.
  ta: Yaaro avana thaandi odraanga. Modhala mugam theliva illa. Aprom thelivaagudhu. Janani.
@set v03_janani_runs
NARRATOR: She's running, laughing, toward a patch of darkness at the edge of the snow.
  ta: Aval sirichukittey odura, pani oratthula irukura oru iruttu pakkam.
@objective Catch up with Janani.
  ta: Janani-a pudi.
@end

@label dream_end
@done
NARRATOR: Ahead, a girl he doesn't know walks into the dark and simply falls.
  ta: Munnaadi, theriyaadha oru ponnu andha iruttukulla poi apdiye vizhudhu.
NITHISH (shouting): Janani... don't go! Stop!
  ta: Janani… pogadha… Nillu!
NARRATOR: His voice doesn't reach her. She keeps running, her laughter echoing.
  ta: Avan kural aval kaadhula vizhala. Sirippu edhirolikka, aval oditey irukaa.
NITHISH (shouting): JANANI!!
  ta: JANANI!!
@fx fade_out
@party ragul nithish
@set at_night
@room hostel_room start woke

@label woke
@fx fade_in
@music campus_night
NARRATOR: Midnight. Nithish wakes with a start. The ceiling fan sounds loud.
  ta: Nadu raathiri. Nithish thidukkunu ezhundhaan. Fan saththam perusa kekkudhu.
NITHISH: A dream... It's so cold.
  ta: Kanavaa… Romba kulurudhu.
NARRATOR: He sees Ragul asleep in the other bed, and that makes him smile. He goes back to sleep.
  ta: Innoru kattil-la Ragul thoonguradha paathu sirikkuraan. Thirumba thoongaraan.
@codex p01_snow_dream

@scene gen:mortuary
@cast rajesh@0.34> shanmugam@0.68<
@prop bed@0.52
@caption Government mortuary, 1 October
  ta: Arasu mortuary, 1 October
@music mystery
@shot pan right
NARRATOR: 1 October, 8:00 AM. The mortuary.
  ta: 1 October, kaalai 8:00. Mortuary.
@shot auto
SHANMUGAM: Sir, the post-mortem is done. But the report is shocking.
  ta: Sir, post-mortem over. But report romba shocking-ah irukku.
RAJESH: What do you mean?
  ta: Yenna solreenga?
@shot close shanmugam
SHANMUGAM: Every part of the body is completely normal. No injury, no trauma, no poison. But there's no activity in the brain. It shut down. No stroke, no aneurysm, no damage. It simply stopped working.
  ta: Body-la irukura yella parts-um completely normal. No signs of injury, trauma or poisoning. But… brain-la yendha oru activity-um illa. Avar brain automatic-ah shut down airukku. Stroke, aneurysm, physical damage, yendha sign-um illa. Adhuvaveyy function aaguradha stop pannirukku.
@shot on rajesh
RAJESH: So his brain just stopped, with no external cause?
  ta: Appo ivar sethadhukku karanam, avar brain yendha oru external cause-um illaama, adhuvaveyy ninnadhu-dhaanu solreenga?
@shot push shanmugam
SHANMUGAM: Yes. I've never seen a case like this. We're running more tests, but for now: cause of death, unknown.
  ta: Aama. Idhukku munnadi na ipdi oru case paathadhey illa… Innum advanced neurological test poitu-dhaan iruku. But right now, cause of death, unknown.
@clue brain_stopped
@sfx phone
@pose rajesh phone
@shot close rajesh
RAJESH: Hello? ...Tell me. (His eyes widen.) I'm coming right away.
  ta: Hello! Sollunga yenna vishayam? (Kan virivudhu.) Udaney spot-ku varan.

@scene gen:corridor_day
@cast rajesh@0.36> ramanan@0.64<
@caption Girls' hostel corridor
  ta: Ponnunga hostel corridor
RAJESH: What happened here?
  ta: Inga yenna aachu?
@shot on ramanan
RAMANAN: Janani, first-year student. Fine when she went to sleep. This morning her roommates couldn't wake her. The room was locked from inside. She's dead.
  ta: Janani, 1st year student. Night thoongum pothu nalla-thaan irundhurka. Inaikiku kaalaila roommates pathrukanga, yendhrikala. Room lock-lathan irundhurku. Aana avunga yerandhutaanga.
@shot push rajesh
RAJESH: Check everything. Don't miss a single piece of evidence. This is just like the case two days ago.
  ta: Yedatha thorough-ah check pannunga. Oru evidence-kooda miss aaga kudadhu. Rendu naal-uku minnadi nadandha adhey case-ku similar ah iruku idhuvum.
@clue janani

@scene gen:campus_morning
@cast nithish@0.4>:phone subramani@0.66<
@caption Campus, that morning
  ta: Campus, andha kaalai
NARRATOR: A notice lands on every phone: "Due to an unforeseen incident in the girls' hostel, classes are suspended from the next hour."
  ta: Ellar phone-layum oru notice: "Girls hostel-la nadandha oru ethirpaaraadha sambavathaala, adutha manineram-la irundhu class-ellam suspend."
NITHISH: An unforeseen incident in the girls' hostel...?
  ta: Unforeseen incident in the girl's hostel-ah…
NARRATOR: Nithish calls Janani. She doesn't pick up.
  ta: Nithish Janani-ku call pandraan. Aval edukkala.
@pose nithish idle
@shot close nithish
NITHISH (worried): Why isn't she answering? What happened in the girls' hostel? Subramani, if you hear anything, tell me. I'm going to find Arun.
  ta: Iva-vera yen phone yedukka matingura? Girl's hostel-la yenna nadandhurukum apdi? Dei Subramani, unaku yedhachu information kedacha sollu. Na poi Arun-ah paakran.

@scene gen:classroom
@cast sneka@0.18> nithish@0.32> arun@0.46< krishnaa@0.62< dhanasree@0.76< kabi@0.9<
@prop desk@0.25^ desk@0.82^
@caption The IT block
  ta: IT block
SNEKA (sad): You know that girl Janani from our class, in the normal hostel? She's dead.
  ta: Namma class-la Janani-nu oru ponnu irukum-la, normal hostel, ava yerandhutaalam…
@shot close nithish
NITHISH (shocked): Janani... JANANI?
  ta: Janani… Janani-ah?
@shot auto
ARUN (sad): The girls went to see her, but they won't let anyone in. The police are investigating seriously.
  ta: Girls yellam paaka poirkanga, yaraiyum ulla vidalayaam. Police-laam serious-ah investigate pannitu irukaanga.
KRISHNAA: What the hell is happening? Is this a college or a war zone? People are dropping one after another.
  ta: Deii, yennada nadakudhu. Idhu yenna college-ah illa kashmir-ah. Ovvoruthangalaa sethunnu irukaanga.
@shot on dhanasree
DHANASREE: Something's wrong. I can feel it.
  ta: Something's wrong nu enaku feel agudhu.
@shot on kabi
KABI: Two days between the first death and this one. So in two more days, another body.
  ta: Machi pona death-kum indha death-kum two days gap, appo innu rendu naal kalichu innoru ponam college-la vilumnu nenaikuran.
@scene gen:hostel_room
@cast dharshna@0.4>:sit sneka@0.72<
@prop bed@0.4 desk@0.86^
@caption NRI hostel
  ta: NRI hostel
@shot close dharshna
NARRATOR: In the NRI hostel, Dharshna grips her locket. Her hands have started to shake.
  ta: NRI hostel-la, Dharshna locket-a irukki pudikkura. Aval kai nadunga aarambichudhu.
DHARSHNA: This keeps happening to me. I can't bear it. This fear... I can't even think straight. Janani...
  ta: This keeps happening to me. I can't just bear with it. Indha fear… yennala olunga yosikka kooda mudila… Janani…
@music none
@fx heartbeat
@shot memory
@shot dutch
@shot shake
DHARSHNA (scared): "Let me go! Let me go! I'm scared, let me go... LET GO!!"
  ta: "Yenna vitrunga, vitrunga! Yenaku bayama iruku vitrunga… VITRUUUU!!"
@shot present
@shot level
@shot close dharshna
NARRATOR: That voice is hers, years ago. In her palms, for a heartbeat, a spark of fire.
  ta: Andha kural aval-odhu dhaan, pala varushathukku munnaadi. Aval kaila, oru nodi, oru neruppu thuli.
@fx fire
@shot shake
DHARSHNA (shouting): APPAA!!
  ta: APPAA!!
@shot two sneka dharshna
SNEKA: Hey, what happened?!
  ta: Hey, yennadi aachu?!
NARRATOR: Dharshna breathes, slowly, until she's back in the room.
  ta: Dharshna mella moochu vidura, thirumba room-ku varra varaikum.

@scene gen:hostel_room
@cast nithish@0.6>:sit
@prop bed_sleeper@0.26 bed@0.6
@music sorrow
@shot push nithish
NARRATOR: Nithish comes back to the room. Ragul is asleep. Nithish sits on his bed and stares at the floor. A tear slides down, then another. He covers his mouth.
  ta: Nithish room-ku thirumba varaan. Ragul thoongitu irukaan. Nithish kattil-la ukkandhu tharaiya paakuraan. Oru kanneer thuli, aprom innonnu. Vaaya kaiyaala moodikkuraan.
@scene gen:classroom
@cast nithish@0.42>:sit
@prop desk@0.5 chair@0.42
@caption The day of the fest
  ta: Fest anniku
@shot memory
NARRATOR: The day of the fest. After Krishnaa's prank, Janani came back to the empty classroom for her water bottle, and found him there.
  ta: Fest anniku. Krishnaa prank-ku aprom, Janani than water bottle eduka kaaliyaana class-ku vandhaa. Anga Nithish.
@enter janani right 0.68
JANANI: What are you doing here? Aren't you going to the fest? ...Why do you look so sad? I know that face. Tell me!
  ta: Nee yenna inga iruka? Fest pola? …Nee yen sogama iruka? Un moonji yeppomey yepdi irukum-nu yenakku theriyadhaa… Achiii sollu!
NITHISH: Krishnaa said there was a surprise class. I sat here for half an hour. Then he came back and said it was a lie.
  ta: Krishnaa yedho surprise class apdi-nu sonnan. Adha nambi naanum ara-mani neram-ah ingaye-dhaan ukkanthu irundhan. Ippo-dhaan Krishna vandhu adhu poi-nu sollitu poitan.
@shot on janani
NARRATOR: Janani bursts out laughing, then tries very hard to stop.
  ta: Janani sirichidura, aprom romba kashtapattu nirutha paakura.
@shot close nithish
NITHISH: I don't mind them fooling me. I'm angry that I'm such an idiot.
  ta: Ivunga yenna yemaathunadhu prechana illa, naan-yen ivlo muttal-ah irukan apdi-nu nenachaaley kovama varudhu…
@shot two nithish janani
JANANI: Nithish, you took what they said seriously. That shows your good character.
  ta: Nee avunga sonnadha madhichi irundadhu unnoda nalla character-ah kaatudhu.
JANANI: Thinking before you decide isn't wrong. But you can't think forever, and not everyone is bad. Trusting someone is good. Only blind trust is wrong.
  ta: Yosichu mudivu-edukaradhu thappila. Aana nee yella neramum yosichuteyy iruka mudiyadhu. Adheyy maari yella pasangalum thappanavanga illa. Oruthara namburadhu, nalladhu dhaan. Kanmoodi-thanama namburadhu-dhaan thappu.
@shot close janani
JANANI: If someone fools you and laughs, they're the ones who should be ashamed. Do you know who you really are? A good person. The same everywhere, no masks. Be proud of that.
  ta: Oruthanga unna yemathi sirikuranga-na, avunga-dhaan adha nenachu asinga-padanum. Nee unmaiyalume yaarunu-soltaa? Nee oru nalla manushan. Vesham yellam podaama, yella yedathulayum orey maari irukuravan nee. Adha nenachu peruma-dhaan padanum.
@pose nithish idle
@shot auto
JANANI (happy): Look at your face now. Come on, I'll buy you an ice cream.
  ta: Paaru, moonji ippo eppadi irukku. Seri vaa-vaa na unakku ice-cream vaangi tharan.
NITHISH: Then... chocolate flavour.
  ta: Appo yenakku chocolate flavor.
@codex p01_janani
@scene gen:hostel_room
@cast nithish@0.56>:sit
@prop bed@0.56 desk@0.84^
@shot push nithish
NARRATOR: On his desk, the box of sweets from her mother. "Collect them after class." Nithish cries until his whole body shakes.
  ta: Avan desk-la, aval amma koduthu vitta sweet box. "Class mudichu pogum pothu vaangitu poiko." Nithish udambe nadunga azhuraan.
NITHISH (sad): Jan... Janani...
  ta: Jan… Janani…
@enter ragul left 0.44
NARRATOR: A hand rests on his shoulder.
  ta: Avan tholla oru kai padudhu.
@shot two ragul nithish
RAGUL (worried): What happened, da? It's nothing, it's nothing. Every—
  ta: Yenna da aachu? Onnu illa, Onnu illa. Yella-
@shot close ragul
RAGUL (thinking): I can feel your pain. But I can't tell you "everything will be alright". ...Doushite?!
  ta: Unnoda vazhi yennala feel panna mudidhu aana, "yellam seri-aaidum"nu yennala solla mudiyathu-da…. "Doste?!"
@scene none
@set v03_veranda
@room hostel_road veranda veranda

@label veranda
@fx fade_in
@music campus_night
NITHISH: I still don't understand how she died. Nobody gives a clear answer.
  ta: Innum yenakku puriyala ava yepdi sethaanu. Yarta ketalum, clear-ah oru badhiley solla matranga.
RAGUL: You're still thinking about that?
  ta: Nee innum adha pathiye dhaan nenachutu irukiya.
@fx dizzy
RAGUL: Wait, da. I'm going to the restroom.
  ta: Iru-da restroom poitu varen.
@objective Get to the restroom.
  ta: Restroom-ku po.
@end

@label restroom
@done
@fx black
@sfx hurt
NARRATOR: He barely makes it to the basin before he throws up.
  ta: Wash basin-ku poradhukkulla vaandhi edukkuraan.
@fx unblack
@set dizzy
@set v03_vomited
RAGUL (thinking): I feel faint. It's been like this since morning. Why? My sinus? Gastritis? Or the migraine?
  ta: Mayakkam vara maari irukkey. Kaalaila irundhu ipdi-dhaan irukku. Yedhanaala irukum? Yennoda sinus problem ah? Illa gastritis ah? Illa migraine-naalaya?!
@objective Walk back to the veranda.
  ta: Veranda-ku thirumbi po.
@end

@label subramani
SUBRAMANI: Ragul, what happened? You're walking like you've had two rounds.
  ta: Ragul yenna aachu, yen rendu-round pota maari nadakkura?
@shot two ragul subramani
@shot slow
NARRATOR: Ragul sways, loses his balance, and grabs Subramani's hand to stay on his feet.
  ta: Ragul thadumaarraan, balance pogudhu, nikka Subramani kaiya pudikkuraan.
@fx migraine
@shot normal
@shot close subramani
SUBRAMANI (worried): Hey! What's wrong with you?
  ta: Yov yennaya aachu?
RAGUL: Nothing, nothing. I'm fine.
  ta: Onnu illa, onnu illa. Yellam okay dhaan.
@shot auto
SUBRAMANI: If you say so. Take care.
  ta: Seri yennamo solra, paathu iru.
@set v03_touched
@end

@label veranda_talk
@set dizzy = false
@set v03_done
@shot on nithish
NITHISH (sad): No, 'tha. Don't be scared. Nothing will happen to me. Don't spend money coming here. Your son will be fine.
  ta: Adhellam onnu illa 'thaa. Nee yedhum bhayapadathe… Yenakku yellam onnu-aavadhu 'thaa. Ooruku yellam ippo varala 'thaa. Nee amaidhiya iru 'thaa na paathukuran. Un mavanukku onnu aavadhu.
RAGUL: What did your mother say?
  ta: Yenna-da solranga unga-amma?
NITHISH: She saw Janani on the news. She's scared something will happen to me.
  ta: Janani-ah pathi news-la paathangalam; bayapaduranga enakku yedhavadhu aidumo-nu.
@shot two ragul nithish
RAGUL (happy): "Daijoubu, Nithish-kun."
  ta: "Daijobou Nithish-kun."
NITHISH: Meaning?
  ta: Apdi-na?
RAGUL: Okay, alright, fine. It'll be alright. It changes with the situation.
  ta: Okay, all-right, fine. It'll be alright. Situation-ku yetha maari maarum.
NITHISH: You learned all this from anime.
  ta: Idhellam anime paathu-dhaan kathukuttiya.
RAGUL (happy): Definitely! Who am I? Raguru Purakashu!!
  ta: Definitely! Na yaaru, Raguru Purakashu!!
NITHISH: Right now, only one thing is running through my head.
  ta: Yenakku ippo orey vishayam-dhaan mandaikulla oditu irukku.
RAGUL: What?
  ta: Enna?
@shot close nithish
NITHISH: I have to find out how Janani died.
  ta: Janani yepdi sethaanu kandu-pidikanum.
@fx fade_out

@scene gen:hostel_morning
@cast rawin@0.24> nithish@0.4> rajesh@0.62< police@0.76<^
@caption Boys' hostel, 2 October
  ta: Pasanga hostel, 2 October
@music sorrow
@fx fade_in
NARRATOR: 2 October, 9:30 AM. Police outside the boys' hostel.
  ta: 2 October, kaalai 9:30. Boys hostel munnaadi police.
@shot on rawin
RAWIN: He was fine when we went to sleep, sir. This morning he was like this.
  ta: Illa sir, nethu night thoongura-varaikum nalla-dhaan sir irundhaan. Aana kaalaila paatha ipdi airuku.
RAWIN: I tried to wake him around seven, for the prayer for Janani at the department. He didn't wake up.
  ta: Appo oru 7 mani irukum sir. Janani-ku department-la prayer iruku-nu sonnanga. Adhuku-time aachunu-dhaan avana yeluppunan.
@shot close nithish
NITHISH (sad): Subramani borrowed my record note just last night...
  ta: Nethu night kooda subramani yen kitta record note vangitu ponanda…
@enter subramani_mother left 0.1
@shot on subramani_mother
SUBRAMANI_MOTHER (crying): Where's my son?! Where is my son?!
  ta: Yen paiyan yenga!! Yenga yen paiyan?!
NARRATOR: She sees him and the words twist in her mouth.
  ta: Avana paathadhum vaarthai vaaila thirugudhu.
@pose subramani_mother kneel
@shot close subramani_mother
SUBRAMANI_MOTHER (crying): No! My son isn't dead! Look, he doesn't even have a scratch... He talked to me on the phone last night. I told him to come home. He said, "No, amma, nothing will happen to me, my friends are here, they'll look after me"... THEY'LL LOOK AFTER ME, HE SAID...
  ta: Illa! Yen paiyan savala! Namma paiyan-uku oru kaayam kooda illanga… Nethu kooda yenta phone-la nalla-dhaan pesunan. Avanta ooruku kelambi vaada-nu sollitu irundhan. Avan "illa ma, yenaku onnum aavadhu… friends irukaanga… avunga paathukuvanganu sonnan… PAATHUKUVANGANU SONNANEYY…
@clue subramani
@shot on rajesh
RAJESH (angry): If any of you know anything, tell us now. Small or big, anything. Three people are dead in four days. We have to find out what's going on.
  ta: Ungaluku yedachu theriyum-na ippoveyy sollirunga daa. Chinnadho, peruso. Naalu-naal kulla moonu peru sethurukaanga. Inga yenna nadakudhu-nu kandu-pudichey aganum.
@shot two nithish rajesh
NITHISH (angry): Sir, I talked to Subramani last night. He was normal. He even borrowed my record note. How can a healthy boy just...?
  ta: Sir, Na nethu night kooda Subramani ta pesunen. Ava normal-ah dhaan irundhan, yennoda record note kooda vangitu ponan. Nalla-irundha paiyan-uku yedpi sir ipdi aagum.
RAJESH: That's what we're trying to find out. If you remember anything, call me. This is my personal number.
  ta: Nangalum adhaan-pa kandupudichtu irukom. Ungalukku vera yedachu therinja, illa nyabagam vandha yenaku inform pannunga. Idhu yennoda personal number.
@shot push rajesh
NARRATOR: Rajesh leaves, watching Nithish from the corner of his eye.
  ta: Rajesh kelambum podhu Nithish-a oru kannaala paathukittey poraar.

@scene gen:hostel_room
@cast ragul@0.42>:sit
@prop desk@0.5 chair@0.42 bed@0.14^
@music mystery
@shot on ragul
NARRATOR: Upstairs, through all of it, Ragul has been at his desk, typing on his laptop as if nothing happened.
  ta: Mela, idhellam nadakkumbodhu, Ragul desk-la ukkandhu, onnume nadakkaadha maari laptop-la type pannitu irundhaan.
@enter nithish right 0.66
@enter arun right 0.8
@shot auto
NITHISH (angry): What the hell are you doing, sitting here?!
  ta: Yennada yelavu-da pannitu iruka inga ukkandhutu?
RAGUL: Why, what happened?
  ta: Yen, yenna aachu?
NITHISH (angry): "What happened"?! Three people dead in four days, two of them our classmates. Subramani died this morning! And you're sitting here poking your laptop like nothing happened!
  ta: "Yenna aacha!", Naalu naal-la moonu peru sethrukanga, adhula rendu peru namma kooda padikiravanga. Inaikku kalaila Subramani sethutan! Aana nee inga… onnumey nadakadha maari laptop nonditu iruka.
@pose ragul idle
@shot on ragul
RAGUL: So what do you want me to do? Sit and wail? It won't change anything.
  ta: Adhuku enna yenna panna solra? Ukkandhu "Ooooo"-nu aluganuma? Adhu yedhuvum maatha poradhu illa.
@shot on arun
ARUN: Ragul, this isn't a game. Our friends are dying, and you act like nothing's happening.
  ta: Ragul idhu velayattu kedayadhu. Namma friends-yellam sethutu irukanga. Nee yennada-na onnume nadakkadha maari irukka.
RAGUL: I understand. But you being angry at me won't bring them back.
  ta: Nee solradhu yenaku puridhu. Aana neenga yen-mela kova padradhu-naala avunga thirumba vara-poradhu illa.
NITHISH: Fine. But we're all in this together, right? If you know anything, don't hide it.
  ta: Sari. Aana namma-yellarum idhula onna-dhaan irukom seriya? Unakku yedhachu therinja maraikama sollu.
@shot close ragul
NARRATOR: Ragul says nothing.
  ta: Ragul onnum pesala.
@scene none
@set at_night = false
@fx fade_out
@next p01/v04
@end
