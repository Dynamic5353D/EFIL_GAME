# The pixel game, N1: the morning of Sivaranjani on the MIT road (inspired by Venture 1).
# The hostel room, the road, the people on it, and the posters side quest.
# Content: suicidal thoughts are only touched on; strong language (profanity filter). Content note first.

# ---------------------------------------------------------------- the opening
@label start
@warn This game includes suicidal thoughts and strong language. If you are struggling, please reach out. In India, Tele-MANAS is free on 14416, any time.
  ta: Indha game-la thatkolai ennangalum kadumaiyaana vaarthaigalum irukku. Kashtama irundhaa, yaaraiyaavadhu thodarbu kollunga. India-la Tele-MANAS 14416, ilavasam, eppo venaalum.
@caption MIT, Chromepet · 29 September 2022, 6:05 AM
  ta: MIT, Chromepet · 29 September 2022, kaalai 6:05
@fx shake
NARRATOR: He wakes hard, throwing off the sheet, both hands on his head.
  ta: Bedsheet-a thooki erinju, rendu kaiyaalum thalaiya pudichikittu, avan saraalnu ezhundhaan.
RAGUL (angry): Fuck! This bloody headache again. Won't you ever let me have a moment's peace?!
  ta: Otha! Inaikum indha thalavazhi vandhuruchu. Kadasi varaikum yenna nimmadhiyavey iruka udamaatiya nee?!
NARRATOR: Across the small room, Nithish is still asleep with the sheet pulled over his face.
  ta: Chinna room-la innoru kattil-la, Nithish bedsheet-ala mugatha moodikittu innum thoongitu irukaan.
RAGUL (thinking): Today's the fest. Sivaranjani. The whole college will be out on the MIT road.
  ta: Innaiku fest. Sivaranjani. Mothha college-um MIT road-la dhaan irukkum.
@set px_awake
@quest start morning
@end

# ---------------------------------------------------------------- the room
@label look_nithish
NARRATOR: His roommate, sleeping with the sheet over his face. Ragul stares for a moment and sighs.
  ta: Room-mate, mugatha bedsheet-ala moodikittu thoongitu irukaan. Ragul konja neram paathutu, oru perumoochu vidaraan.
@end

@label laptop
NARRATOR: The laptop is still open on a half-written story. The cursor blinks where he stopped last night.
  ta: Laptop-la paadhi ezhudhuna oru kadha innum open-la irukku. Nethu raathiri nirthuna idathula cursor minnudhu.
@end

@label notebook
@codex p01_notebook
RAGUL (thinking): My old notebook. Every page is a different world. None of them has this headache in it.
  ta: En pazhaya notebook. Ovvoru page-um vera vera ulagam. Edhulayum indha thalavazhi illa.
@end

@label poster
@codex p01_sivaranjani
NARRATOR: A poster for Sivaranjani, the college's first fest in years. Flashmob on the MIT road, 10:30 AM.
  ta: Pala varushathukku aprom college-oda modhal fest Sivaranjani-kku oru poster. MIT road-la flashmob, kaalai 10:30.
@end

@label airpods
@codex p01_airpods
RAGUL (thinking): My AirPods. Two songs and my head's already pounding. When did music start hurting?
  ta: En AirPods. Rendu paatu ketadhukey thala vazhi varudhu ippolam… Music eppo irundhu valikka aarambichudhu?
@end

# ---------------------------------------------------------------- the road
@label first_road
@set px_saw_road
NARRATOR: The MIT road. Bunting over the tar, copper-pod petals on everything, speakers being dragged somewhere out of sight.
  ta: MIT road. Road mela thoranam, ella idathulayum manja poo, engayo speaker-a izhuthuttu poraanga.
RAGUL (thinking): Too many people. Too much noise. Fine. Just walk.
  ta: Romba kootam. Romba sathham. Sari. Nadandhu po.
@end

@label it_locked
NARRATOR: Locked. The IT block opens at nine. For once, he's early.
  ta: Poottirukku. IT block ombadhu manikku dhaan thirakkum. Oru thadava-yaavadhu seekiram vandhuttaan.
@end

@label stall
NARRATOR: Glass jars of biscuits and murukku, bananas on a string, and a kettle that never stops.
  ta: Biscuit, murukku jaadi, kaiyila thonguna vaazhapazham, nikkave nikkaadha oru kettle.
@end

@label vendor
@face_player
@if px_chai_given -> vendor_again
VENDOR: Thambi, you look half dead. Here, one chai. First glass on the fest day is on me.
  ta: Thambi, paadhi sethavan maari irukka. Idha, oru tea. Fest naal modhal glass en kanakku.
@give chai
@set px_chai_given
@end
@label vendor_again
VENDOR: Fest crowd will come at ten. After that, no chai for anyone, only shouting.
  ta: Pathu manikku fest kootam varum. Aprom yaarukkum tea kidaiyaadhu, katthal mattum dhaan.
@end

# ---------------------------------------------------------------- the posters side quest
@label richard
@face_player
@if px_q_posters_done -> richard_after
@if px_q_posters -> richard_progress
SENIOR: Hey, second year! You free? Of course you're free. Look at this.
  ta: Hey, second year! Free-ah? Free dhaan. Idha paaru.
SENIOR: Three posters for the flashmob. Hostel board, the IT block board, and the one by the bench on the south lawn. Nobody knows it's at 10:30.
  ta: Flashmob-ku moonu poster. Hostel board, IT block board, south lawn bench pakkathula irukura board. 10:30-nu yaarukkum theriyala.
@choice posters
  - Fine, give them here. -> posters_yes
    ta: Sari, kudunga. -> posters_yes
  - My head hurts... -> posters_no
    ta: Thala valikkudhu… -> posters_no
@label posters_no
SENIOR: Everyone's head hurts, machi. Come back when yours doesn't.
  ta: Ellarukkum thala valikkudhu machi. Unakku sariyaana aprom vaa.
@end
@label posters_yes
@give fest_poster 3
@set px_q_posters
@quest start posters
SENIOR: Legend. Stick them up and come back to me.
  ta: Legend. Ottitu enkitta vaa.
@end
@label richard_progress
@if px_posters_up >= 3 -> richard_done
SENIOR: I can see posters in your hand, machi. Boards. Hostel, IT block, south lawn.
  ta: Kaila innum poster therijidhu machi. Board. Hostel, IT block, south lawn.
@end
@label richard_done
@set px_q_posters_done
@quest done posters
SENIOR: All three? You're hired. Keep this volunteer pass. It'll get you past the barricades later.
  ta: Moonum-ah? Nee dhaan volunteer. Indha pass vechuko. Aprom barricade-la thaandi poga udhavum.
@end
@label richard_after
SENIOR: See you at 10:30. Don't be late, and don't be boring.
  ta: 10:30-ku paapom. Late aagadha, boring-ah irukkadha.
@end

@label board_a
@if px_posted_a -> posted
@if px_q_posters -> post_a
NARRATOR: The hostel notice board. Mess timings, a lost-and-found, and a very old "No ragging" notice.
  ta: Hostel notice board. Mess time, lost-and-found, romba pazhaya "No ragging" notice.
@end
@label post_a
@set px_posted_a
@goto post

@label board_b
@if px_posted_b -> posted
@if px_q_posters -> post_b
NARRATOR: The IT block's board. Internal marks, a symposium from last year, and someone's lost calculator.
  ta: IT block board. Internal marks, pona varusha symposium, yaaroda thollanja calculator.
@end
@label post_b
@set px_posted_b
@goto post

@label board_c
@if px_posted_c -> posted
@if px_q_posters -> post_c
NARRATOR: A board by the bench on the south lawn, mostly bus timings to Tambaram and Guindy.
  ta: South lawn bench pakkathula oru board. Perumbaalum Tambaram, Guindy bus time.
@end
@label post_c
@set px_posted_c
@goto post

@label post
@take fest_poster
@add px_posters_up
@sfx pickup
NARRATOR: He pins up a Sivaranjani poster. For a second, it looks like a real fest.
  ta: Oru Sivaranjani poster-a otturaan. Oru nodi, nijamaana fest maari theriyudhu.
@end

@label posted
NARRATOR: His poster's up. Someone has already drawn a moustache on the dancer.
  ta: Avan poster irukku. Yaaro already dancer-ku meesai varanjittaanga.
@end

# ---------------------------------------------------------------- the people on the road
@label krishnaa
@face_player
@if px_met_krishnaa -> krishnaa_again
KRISHNAA (mocking): Oi, look who it is! Where are you sneaking off to, specs?
  ta: Oi, yaaru-nu paaru! Yenga da odhungi pora, kannadi?
RAGUL (thinking): Not now. Just keep walking.
  ta: Ippo venaam. Nadandhu po.
@set px_met_krishnaa
@end
@label krishnaa_again
KRISHNAA: Go, go. Don't faint before the flashmob, specs.
  ta: Po, po. Flashmob-ku munnaadi mayangi vizhundhudaadha, kannadi.
@end

@label kabi
@face_player
KABI: Ignore him, da. Tall body, small brain. Did you see the stage near Rajam Hall? Massive.
  ta: Avana vidu da. Uyaram mattum dhaan, moolai chinnadhu. Rajam Hall pakkathula stage paathiya? Semma periya stage.
@end

@label sneya
@face_player
SNEYA (excited): Everyone's dancing today! Even Dhanasree is dancing, can you believe it?
  ta: Innaiku ellarum aaduvaanga! Dhanasree kuda aadaporaa, nambave mudila la?
@end

@label sneka
@face_player
SNEKA (excited): Cute guys dancing on the MIT road. And Pranav's dancing! I'm standing in the front row.
  ta: MIT road-la cute pasanga aaduvaanga. Pranav-um aaduvaan! Naan front row-la dhaan nippen.
@end

@label veerabhadran
@face_player
VEERABHADRAN: You there. Specs. Fest or no fest, attendance is at nine. I don't mark anyone present in a flashmob.
  ta: Nee. Kannadi. Fest irundhaalum illanaalum, ombadhu manikku attendance. Flashmob-la yaarukkum present poda maaten.
@end

@label guard
@face_player
@if px_q_posters_done -> guard_pass
SECURITY: Road's closed till the flashmob, thambi. Rajam Hall side is all speakers and wires.
  ta: Flashmob varaikkum road close, thambi. Rajam Hall pakkam full-ah speaker, wire.
@end
@label guard_pass
SECURITY: Volunteer pass? Good for you. Still, nothing over there until 10:30. Come back then.
  ta: Volunteer pass-ah? Nalladhu. Aanaalum 10:30 varaikkum anga onnum illa. Appo vaa.
@end

@label lawn_guy
@face_player
GUY: Bro, they've got a DJ from Chennai city. Real speakers. The hostel's going to shake tonight.
  ta: Bro, Chennai city-la irundhu DJ vandhurukkaan. Nijamaana speaker. Innaiku raathiri hostel-e aadum.
@end

@label reader
@face_player
GUY (sad): Fest? I've got an arrear exam on Monday. The fest is for people without arrears.
  ta: Fest-ah? Monday arrear exam irukku. Fest ellam arrear illaadhavangalukku dhaan.
@end

@label walker
@face_player
GIRL: Three rounds of the lawn before class. Doctor's orders. My knees disagree with the doctor.
  ta: Class-ku munnaadi lawn-a moonu round. Doctor sonnaaru. En muttikku doctor mela kovam.
@end

@label girl_lawn
@face_player
GIRL: The copper-pod trees drop their flowers like this every September. My amma calls it yellow rain.
  ta: Ovvoru September-um indha manja poo ippadi dhaan kottum. En amma adha manja mazhai-nu solluvaanga.
@end
