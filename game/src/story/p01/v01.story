# Act I, Venture 1: "The world is cruel". 29 September 2022.
# Playable: wake up, get past Krishnaa, the man on the road, the crowd at the flashmob.
# Cinematic: the shed, Dhanasree and the senior, Guy 1 and his mother, Dharshna and Sneka, the dance.
# Content: suicidal thoughts (content note first), strong language (profanity filter).

@label start
@venture 1 1
@title The world is cruel
  ta: Ulagam kodumaiyaanadhu
@time 29 September 2022, 6:05 AM
@warn This chapter includes suicidal thoughts and strong language. If you are struggling, please reach out. In India, Tele-MANAS is free on 14416, any time.
  ta: Indha chapter-la thatkolai ennangalum kadumaiyaana vaarthaigalum irukku. Kashtama irundhaa, yaaraiyaavadhu thodarbu kollunga. India-la Tele-MANAS 14416, ilavasam, eppo venaalum.
@party ragul
@music none
@card
@fx migraine
NARRATOR: He wakes up hard, throwing off the bedsheet, both hands on his head.
  ta: Bedsheet-a thooki erinju, rendu kaiyaalum thalaiya pudichikittu, avan saraalnu ezhundhaan.
THAT_GUY (angry): Fuck! This bloody headache again. Won't you ever let me have a moment's peace?!
  ta: Otha! Inaikum indha thalavazhi punda vandhuruchu. Kadasi varaikum yenna nimmadhiyavey iruka udamaatala nee?!
NARRATOR: 6:05 AM. His breathing slows. Across the small room, someone is still asleep under a sheet.
  ta: Kaalai 6:05. Moochu mella sariyaagudhu. Chinna room-la innoru kattil-la, bedsheet-ala mugatha moodi innoruthan thoongitu irukaan.
@music campus
@label room
@save room
@objective Get ready and head to college.
  ta: Ready aagi college-ku kelambu.
@end

@label look_nithish
NARRATOR: His roommate, sleeping with the sheet over his face. He stares for a moment and sighs.
  ta: Room-mate, mugatha bedsheet-ala moodikittu thoongitu irukaan. Konja neram paathutu, oru perumoochu vidaraan.
@end

@label laptop
NARRATOR: The laptop is still open on a half-written story. The cursor blinks where he stopped last night.
  ta: Laptop-la paadhi ezhudhuna oru kadha innum open-la irukku. Nethu raathiri nirthuna idathula cursor minnudhu.
@end

@label notebook
@codex p01_notebook
THAT_GUY (thinking): My old notebook. Every page is a different world. None of them has this headache in it.
  ta: En pazhaya notebook. Ovvoru page-um vera vera ulagam. Edhulayum indha thalavazhi illa.
@end

@label poster
@codex p01_sivaranjani
NARRATOR: A poster for Sivaranjani, the college's first fest. Flashmob on the MIT road, 10:30 AM.
  ta: College-oda modhal fest Sivaranjani-kku oru poster. MIT road-la flashmob, kaalai 10:30.
@end

@label airpods
@codex p01_airpods
THAT_GUY (thinking): Two songs and my head's already pounding. When did music start hurting?
  ta: Rendu paatu ketadhukey thala vazhi varudhu ippolam… Music eppo irundhu valikka aarambichudhu?
@end

# ---------------------------------------------------------------- the road
@label see_krishnaa
@set v01_left_room
@set v01_saw_krishnaa
NARRATOR: 8:15 AM. A tall guy up ahead, laughing with his friend in the middle of the road.
  ta: Kaalai 8:15. Munnaadi oru uyaramaana paiyan, road naduvula friend kooda sirichu pesitu nikkuraan.
THAT_GUY (worried): Aiyo, Krishnaa's standing there. If he catches me, he'll start something. I'll go another way.
  ta: Aiyo Krishnaa vera anga nikkuraan. Avanta matuna yedhachu prechana pannuvaan. Vera vazhila povom.
@objective Get past Krishnaa without him seeing you. Try the wall-top path.
  ta: Krishnaa kannula padaama thaandi po. Suvar mela irukura vazhiya try pannu.
@end

@label krishnaa_sees
KRISHNAA (mocking): Oi, look who it is! Where are you sneaking off to, specs?
  ta: Oi, yaaru-nu paaru! Yenga da odhungi pora, kannadi?
KFRIEND: Ha! He looks like he's seen a ghost.
  ta: Ha! Paei paatha maari mugatha vechurukaan.
THAT_GUY (thinking): Not again. Just... go back and find another way.
  ta: Thirumbavum-ah. Thirumbi poi vera vazhi paaru.
@end

@label passed_krishnaa
@done
NARRATOR: Behind him, on the main road, Krishnaa has spotted him anyway.
  ta: Pinnaadi, main road-la, Krishnaa avana paathuttaan.
KFRIEND (excited): There'll be tons of colourful girls at the fest today. We're going to have a blast!
  ta: Inaiku fest la color color ah neraya doli varum. Semmaya maja panlam!
KRISHNAA: Our class girls will come all made up today too.
  ta: Namma class ponnungalum innaiku make-up lam potutu thookala varum.
KFRIEND: Half our class is committed, da. The rest are crazy. Other departments are the best.
  ta: Dei, namma class-la paadhi peru committed ra. Meedhi irukura ponnungalam paithiyam. Adhanala other department dhaan best-uh.
KRISHNAA: Look there, the class's biggest nutcase is off somewhere. Why's he going that way for no reason?
  ta: Anga paaru class la romba muthuna paithiyam poitu iruku… Avan yenda sammandhamey illama andha vazhi-la poinu irukan.
KFRIEND: You know he's always like that. So what?
  ta: Avan yeppomey oru maari dhan irupaanu theriyum la onaku, aprom enna.
@set v01_passed_krishnaa
@end

@label monologue
@set v01_monologue
@music none
THAT_GUY (thinking): Why do I like living less and less? And yet I'm still scared of dying.
  ta: Yen yenakku vara vara vaazhavey pudika matingudhu… Aana saavarakkum bayama dhan iruku.
THAT_GUY (thinking): The pain. If it weren't for that, I'd have gone long ago.
  ta: Andha vazhi. Adhu mattum illana, naa yeppayo sethurupan.
THAT_GUY (thinking): Come to college, sign the register, listen in class, back to the hostel for lunch, back to college. Nothing interests me any more.
  ta: Daily-um college vandhu, attendance potu, class gavanichu, lunch ku thirumba hostel poitu, thirumba college vandhu…. Vara vara yedhulayum interest vara matingudhu.
THAT_GUY (thinking): I can't. I just can't do this.
  ta: Ennala… Ennala mudila.
@music campus
@objective Walk to college.
  ta: College-ku nadandhu po.
@end

# ---------------------------------------------------------------- the man on the road
@label man
@set v01_passed_body
@music mystery
NARRATOR: Someone is lying on the road. Face down, not moving.
  ta: Road-la yaaro kedakkuraanga. Kavundhu, asaivillaama.
THAT_GUY (panicked): What happened to him? At this hour, lying on the road... Maybe he's sick and fainted. Or he's a drunk.
  ta: Yenna airukum avaruku, yen indha nerathula road-la paduthurukaru. Oru vela udambu sari illama mayangi vilundhutaro. Illana, kudigara payana irupano!
THAT_GUY (panicked): Or... someone killed him and dumped him here!! What do I do? There's nobody around.
  ta: Illana oru vela… yarachu konnu apdiye road-la potu poitangala!! Ippo yenna panna... Yaraiyum kaanom inga.
NARRATOR: Far down the road, a man in a red shirt is walking away.
  ta: Road-oda dhoorathula, sivappu sattai pottu oru aal nadandhu poraan.
@choice man_on_road
  - Call out to the man in the red shirt -> call
    ta: Andha sivappu sattai aala koopidu
  - Kneel and check on him -> check
    ta: Kitta poi paaru
  - Walk away -> walk
    ta: Nadandhu po
@label call
THAT_GUY (thinking): There's someone over there. Should I call him? ...He's too far. My throat won't even open.
  ta: Anga oruthar poraru, avura koopduvoma? …Romba dhooram. Thondaila sathame varala.
@goto excuse
@label check
NARRATOR: He takes one step toward the man, and the headache hits like a nail driven through his temple.
  ta: Avan pakkathula oru adi vaikkuraan. Thalavazhi pottula aani adicha maari thaakkudhu.
@fx migraine
@goto excuse
@label walk
THAT_GUY (thinking): Looking at him, I feel sorry for him too...
  ta: Ivura paathalum pavama dhan iruku…
@goto excuse
@label excuse
THAT_GUY (stressed): No! I've got a thousand problems of my own, and this headache on top of them.
  ta: Illa! Yenakkey aairathettu prechana iruku, idhula indha thala vazhi veraya.
THAT_GUY: Maybe you've got some big problem too. Or maybe saving you would be like... saving the whole world.
  ta: Ungalukum maybe yedadhu periya prechana irukalam, or maybe… ungala kaapathunaa… ULAGATHAIYE save panra mari kooda irukalam.
THAT_GUY: Whatever it is, helping you now does nothing for me. Sorry bro, the world is cruel. I can't help you.
  ta: Yedhuvaa venalum irukatum, aana ippo ungaluku udhavi pannaa, enakku yendha prayojanam-um illa. Sorry bro, the world is cruel. Ungaluku yennala help panna mudiyadhu.
@clue first_body
NARRATOR: That guy walks off.
  ta: Andha paiyan nadandhu poraan.
@fx fade_out

# ---------------------------------------------------------------- meanwhile
@scene gen:shed
@music campus
@fx fade_in
NARRATOR: Meanwhile, in a big, dim old shed, about fifty students stand around a box. Inside it, a cake: "Happy Birthday Rep".
  ta: Adhe neram, oru periya pazhaya shed-la, kammiyaana velichathula, oru aimbadhu students oru box-a suththi nikkuraanga. Ulla oru cake: "Happy Birthday Rep".
GIRL: Hey Krishnaa, keep your hands to yourself!
  ta: Hey Krishnaa, kaiya vechikitu summa iru!
KRISHNAA: I didn't do anything. Just checking the cake hasn't melted.
  ta: Na yedhum pannala, cake melt airucha illaya-nu check pannen.
GIRL: The cake's not going to run away. Wait till Dhanu comes.
  ta: Cake engeyum odi pogathu… Dhanu vara varaikum konjo wait pannu.
GIRL: Hey Vamika, where's Dhanasree?
  ta: Hey Vamika, Dhanasree yenga di?
VAMIKA: She's talking to Richard senior. Said she'd be here in ten minutes.
  ta: Ava Richard senior oda pesitu iruka, 10 mins la vara nu sonna.

@scene gen:campus_morning
DHANASREE: Senior, however many times you ask, I'm not coming to perform.
  ta: Senior, neenga evlo dhan kooptalum na perform panna varala senior.
SENIOR: Practice was going fine until last week. Then you called and said you couldn't come, and after that nobody practised properly. What happened?
  ta: Pona varam varaikum nalla dhana poitu irundhucchu practice yellam. Aprom thideernu phone potu vara mudiyathu nu sonna. Adhuku aprom yarum olungaveyy practice pannala. Yennadhan aachu?
DHANASREE: Sorry senior, personal issues. But I told you a week ahead, and I choreographed most of the steps before I left.
  ta: Sorry senior, but sila personal issues naala na varala. But unga kitta dhan one week munnadiye inform pannitenla. Steps um mostly na choreo pani koduthu dhana ponen.
SENIOR: With you there the performance is something else. Nobody in second or third year dances like you. Why waste a talent like that?
  ta: Nee iruntha thaan performance-ey nalla irukum. 2nd and 3rd year-layae un alavuku aada yarum illa. Talent irukurapo yen jnr nee waste panra?!
DHANASREE: Senior, the club matters, but my peace of mind matters more. I can't perform.
  ta: Senior yenaku puridhu. But club-ah vida yenaku yennoda peace of life dhan mukkiyam. Yennala perform panna mudiyadhu snr.
SENIOR: Did you forget the steps? Or are you scared you'll make a mistake on stage and embarrass yourself?
  ta: Steps yellam maranthu pocha? Illa stage-la perform panni yedhachu mistake panni asingapatruvom-nu bayama iruka…?
NARRATOR: Dhanasree gives him a long, serious look.
  ta: Dhanasree avara serious-ah oru paarvai paakura.
DHANASREE (serious): OK, senior. I'll perform.
  ta: Ok senior. Na perform pandren.

@scene gen:classroom
GUY1: College is going fine, 'tha.
  ta: College yellam nalla dhan 'tha povudhu.
GUY1_MOTHER: Has the place suited you, saamy?
  ta: Yedam yellam othupoita chaamy?
GUY1: It suits me. There's a train right near where I stay, every ten minutes. Town's only ten rupees away.
  ta: Adhellam othu povuchu. Inga na thangura yedathuku pakathulayeyy rayilu odudhu. 10 nimsathuku oruka varum. Pathu roova dhan tha selavu aavum.
GUY1_MOTHER: Study well, saamy. Get a good job, and shut the mouths of everyone back in the village.
  ta: Cher saamy, nalla padi. Nee padichu nalla osathiyaana velaiku poyi, indha oor-karainga naara vayellam adaikanum.
NARRATOR: That puts a smile on his face. Then two boys appear at the door.
  ta: Adhu avan mugathula oru sirippa kondu vandhuchu. Appo rendu paiyanga vaasal-la nikkuraanga.
KRISHNAA (laughing): Dei, you idiot!
  ta: Dei muttaa punda!
KFRIEND: Look at him, he actually believed us and he's sitting in class!
  ta: Namma sonnadha nambi class laye ukkandhunnu irukan paaren.
GUY1 (confused): So... so there's no class?
  ta: Appo… appo class illaya?
KRISHNAA: It's Sivaranjani today, da. No classes. Everyone's dancing on the road. Go and look.
  ta: Dei, Inaiku sivaranjani da, class yellam illa inaiku. Inaiku road la dance aadinu irupaanunga. Poi paaru…
KRISHNAA (leaving): How do they even let idiots like this into college?
  ta: Indha paithiyakaranga-ya yellam yepdi da college-la sethunnanunga.
NARRATOR: Guy 1 looks down at his desk.
  ta: Paiyan 1 thalaiya kunindhu desk-a paakuraan.

@scene gen:hostel_room
SNEKA: Dharshna, come on, let's go!
  ta: Dharshna, vaadi polam!
DHARSHNA (smiling): No, I told you I'm not coming. You go.
  ta: Illa-di, na varalanu munnadiye sonnen-la, nee poitu va.
SNEKA (excited): It's our college's first fest! There's a flashmob on the MIT road, cute guys dancing... Pranav's dancing!
  ta: Namma college oda first fest di idhu!! Hey, inaiku MIT road-la flashmob lam nadakum-di, cute aana pasanga-lam vandhu aaduvanga!! Pranav lam vandhu aaduvan!!
DHARSHNA: Crowded places don't suit me. I've got enochlophobia.
  ta: Yenaku crowded aana places-lam othukaadhudi. Yenaku enochlophobia iruku.
SNEKA: Meaning?
  ta: Apdina?
DHARSHNA: Allergy to crowded places.
  ta: Allergy to crowded places.
SNEKA (suspicious): There's some other reason. You shouldn't hide things from your roomie.
  ta: Illa vera yedho iruku… Roomie kitta yellam yedhuvum maraika koodadhu di.
DHARSHNA: It's nothing like that, Sneka. That's the real reason.
  ta: Apdi yellam onnu illa Sneka. Idhan unmaiyana reason.
SNEKA: Fine. Do what you want.
  ta: Fine, yennamo pannu…
@scene none
@set v01_flashmob
@room mit_road west crowd

@label crowd
@music flashmob
NARRATOR: 10:30 AM. The MIT road is packed. The flashmob has begun.
  ta: Kaalai 10:30. MIT road full-ah kootam. Flashmob aarambichuduchu.
@objective Get through the crowd.
  ta: Kootatha thaandi po.
@end

@label flashmob
@done
@fx migraine
THAT_GUY (thinking): The noise they're making is going to split my head!! The only good thing in this college is this fest.
  ta: Ivunga podra sathathula thala vazhi vandhurum polaye!! College la iruku orey oru nalla vishayam indha fest dhaan.
THAT_GUY (thinking): If I can't even enjoy this, why am I alive?
  ta: Idha kuda yennala olunga enjoy panna mudilana yedhuku na vazhanum.
THAT_GUY (thinking): That's it? I can never be normal like everyone else? Never enjoy a fest?
  ta: Avlothana? Inimel yennala mathavanga maari normal ah iruka mudiyadha… Fest yellam enjoy panna mudiyadha…
THAT_GUY (angry): Why did God have to give ME a body like this? I know lots of people have it worse. But everyone only knows their own pain...
  ta: Yen, yen yenaku mattum kadavul ipdi oru health-ah kudukanum? Yenaku puridhu, yenna vida neraya peruku idhey maari problems irukunnu. But avan-avan prechana avan-avanukku thaana theriyum...
THAT_GUY (angry): Why did God invent pain in the first place?! If he can do anything, why not make a world with only the good things? No pain, no grief, no death. WHY?!
  ta: Yen kadavul modhala vali-nu oru concept kondu varanum?! Avuraala enna venunalum panna mudiyumnaa, vali, sogam, saavu… indha maari negative visayathaiyum implement pannama, full-ah positive things mattum vechu ulagatha create panirkalameyy!!? Yen??!
THAT_GUY (sad): There's no other way. I have to get out of here. My head hurts so much...
  ta: Vera vali illa... na inga irundhu kelambi dhaan aganum. Thala romba valikuthu…
@set v01_dhana_dance
@music flashmob
NARRATOR: The track changes. Dhanasree steps onto the floor.
  ta: Paatu maarudhu. Dhanasree floor-kulla varaa.
THAT_GUY (thinking): I want to push through this crowd, stand right in the centre and dance like a hero. She'd fall for my moves.
  ta: Yenaku apdiye indha crowd-yellam thalli vittutu mass-ah centre-la poi ninnu aadanum-nu thonudhu. Dhanasree yen dance-ah paathu mayangiduva.
THAT_GUY (thinking): But this isn't a film. Shove two people and they'll throw me out by the collar.
  ta: Aana idhu onnum padam illa… Rendu peru-a thalli vittaaley podaniyoda thatti veliya thaati utruvanga.
NARRATOR: Her moves are smooth and quick, each one landing exactly on the beat. The crowd can't look away. Neither can he.
  ta: Aval move-ellam smooth-ah, vegama, ovvonnum beat-la correct-ah vizhudhu. Kootam kanna edukka mudiyala. Avanaalum dhaan.
NARRATOR: When the song ends, the road erupts. For him, time has stopped. His eyes are only on her.
  ta: Paatu mudinjadhum road-e athirudhu. Avanukku neram nindhu pochu. Avan kann aval mela mattum dhaan.
@music none
@sfx crowd
SENIOR: Guys, guys! One minute. An important announcement. Sorry, but the fest is being postponed. We don't know till when.
  ta: Guys, Guys! Oru nimisham. Oru important announcement. Sorry guys, but namma fest-ah postpone panna poranga and exact ah yeppo-nu therla.
SENIOR: Quiet, please. There's been a death in our college, and the police will be investigating around the campus.
  ta: Konjam silent ah irunga. Namma college la oru death nadandhruku, and police will be investigating around our campus.
NARRATOR: That guy's stomach turns. He grips his bag and edges out of the crowd.
  ta: Andha paiyanukku vayithula edho purattudhu. Bag-a irukki pudichikittu kootathula irundhu nagarraan.
SENIOR: This is for our safety. The police have arrived. Nobody needs to panic. Go back to your rooms; more news on the WhatsApp groups.
  ta: Idhellam namma safety-kaaga dhan panranga. The police also arrived. Yarum bayapada vendam. Now you all may just go to your respective residences. Further information will be shared via whatsapp groups.
@set v01_fest_cancelled
@fx fade_out
@next p01/v02
@end
