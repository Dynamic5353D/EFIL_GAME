# Act I, Venture 9: "The lullaby". 2-3 October 2022.
# Playable (flashback, as Dhanasree): Hangar 1 in the rain: find the gun, climb out through the wall
# gap with Ragul. Word battle: the gate guard.
# Cinematic: Nithish overhears, the lullaby (hummed; the words are not used), the dosa, Dharshna and
# the lighter (cut to black before it touches her skin, with a content note).

@label start
@venture 1 9
@title The lullaby
  ta: Thaalaattu
@time 2 October 2022, late night
@warn This chapter includes self-harm (not shown: the scene cuts away before it happens).
  ta: Indha chapter-la thannai thaane kaayapaduthikkura oru nigazhchi irukku (kaattapadaadhu: adhu nadakkuradhukku munnaadiye scene maarudhu).
@set at_night
@set nithish_cuffed
@set truth_known
@party ragul
@card
@save start
@scene gen:rain_night
@cast rajesh@0.4> ramanan@0.62<
@prop jeep@0.52^
@caption On the road, late night
  ta: Road-la, nalla raathiri
@music tense
@shot two rajesh ramanan
RAJESH: Tomorrow we produce Nithish before the magistrate. The witness... what was his name?
  ta: Nalaiku Nithish-ah magistrate kitta produce pannanum. Avan peru yenna-ya…
RAMANAN: Ragul, sir.
  ta: Ragul, sir.
@shot close rajesh
RAJESH: Be at the station at ten. We'll pick him up and go straight to court.
  ta: Kalaila 10 manikku station vandhuru. Namma avana kootitu apdiye court-ku poirulam.
@scene gen:station
@cast nagaraj@0.3> ramanan@0.46< nithish@0.82<:sit
@prop desk@0.38 bench@0.82
@caption Chitlapakkam station
  ta: Chitlapakkam station
NAGARAJ: What happened? How's the other one?
  ta: Yenna aachu? Innoruthan yepdi irukan?
RAMANAN: Alive. A few bruises, that's all. And the Inspector's confirmed it: this one did it. We'll know at court tomorrow. Ten o'clock. We pick up that Ragul from the hostel on the way, the witness.
  ta: Avan uyiroda dhaan irukan. Lesa adi avlo-dhan. Neenga vera, Inspector confirm-ae pannitaru ivan-dhaan pannirupaan-nu. Nalaiku court la dhaan theriyum. Oru pathu manikku court-ku ponum. Apdiye saachi solra andha Ragul-aiyum hostel-la irundhu kootitu ponum.
@shot on nithish
NARRATOR: In the dirty cell, kept awake by mosquitoes, Nithish hears every word.
  ta: Azhukkaana cell-la, kosu kadiyaala thoongaama, Nithish ovvoru vaarthaiyum kekkuraan.
@shot close nithish
@shot shake
NITHISH (shocked): Ragul? Ragul testified against me?
  ta: Ragul? Police kitta yenna pathi saachi sonnana?
@shot push nithish
NITHISH (angry): Ragul, I thought we were in this together. Why?
  ta: Ragul, namma idhula onna-dhaana irukom-nu nenachan. Yen?
@pose nithish idle
@shot two nithish nagaraj
NITHISH: Sir, I have to talk to someone. I HAVE to talk to Ragul, sir!
  ta: Sir na oruthan kitta pesanum. Ragul kitta na pesiyae aganum sir.
NAGARAJ: Not now. After the court hearing.
  ta: Ippo yellam pesa mudiyadhu. Court hearing mudinjadhu-ku aprom nee pesiko.
@shot close nithish
NITHISH (thinking): What made him testify against me? Did he plan all of it? Or... does he know something I don't?
  ta: Police kitta yenna-nu nenachu yenakku yedhura saachi sollirupan? Oruvela yellam yerkanavey plan pannirupano? Illana… yenaku theriyadha yedachu avanuku theriyuma?

@scene gen:house_night
@cast dhanasree@0.5>:sit
@prop bed@0.5 shelf@0.86^
@caption Her house, that night
  ta: Aval veedu, andha raathiri
@music lullaby
NARRATOR: Dhanasree lies awake. "How did your mother die?" Her mind goes back.
  ta: Dhanasree thoongaama padutthirukkaa. "Unnoda amma yepdi yerandhanga?" Aval manasu pinnaadi pogudhu.
@scene gen:house_night
@cast vijaya@0.42>:sit dhanasree=little_dhana@0.56<:sit
@prop bed@0.49 lamp@0.2^
@caption Years ago
  ta: Pala varushathukku munnaadi
@shot memory
@shot orbit vijaya
NARRATOR: Her old house. Her mother sits on the edge of the bed, running her fingers through Dhanasree's hair, humming a lullaby in the soft light of the bedside lamp.
  ta: Pazhaya veedu. Amma kattil oratthula ukkandhu, Dhanasree mudila viral ottikittu, bedside lamp velichathula oru thaalaattu munumunukkuraa.
VIJAYA: Mm-mm, mmm... mm-mm, mmm...
  ta: Mm-mm, mmm... mm-mm, mmm...
@shot two vijaya dhanasree
DHANASREE: Amma, will you always be with me?
  ta: Amma, yeppavumey yen kooda irupala…
VIJAYA: Amma will always be with you.
  ta: Yeppavum amma un-kooda dhaan irupen.
@shot close vijaya
NARRATOR: She takes off her bracelet and puts it in her eight-year-old daughter's hands.
  ta: Than bracelet-a kazhatti, ettu vayasu ponnu kaila vekkuraa.
@shot close dhanasree
DHANASREE (happy): It's so big!
  ta: Romba perusa irukuuu!
@shot push vijaya
VIJAYA: As long as this is safe, Amma is with you.
  ta: Idhu bathrama evlo naal iruko, avlo naal amma un-kooda irupan.
DHANASREE: And if it breaks?
  ta: Idhu odanjiruchu-na?
VIJAYA: Then think that Amma isn't with you.
  ta: Amma un-kooda illa-nu nenachuko…
@shot close dhanasree
DHANASREE: No, Amma has to stay with me! I'll keep it safe and never let it break!! Amma, don't go, okay?
  ta: Illa amma yen koodaiye irukanum. Na idhu odaiyama batharama pathukuven!! Amma, povadha sariyaaa?
@shot two vijaya dhanasree
VIJAYA (happy): My darling!
  ta: Yen chellam!
@codex p01_lullaby

@set at_night = false
@set house_day
@scene gen:house_day
@cast ragul@0.4>:dance
@prop bed@0.14^ shelf@0.88^
@caption 3 October, morning
  ta: 3 October, kaalai
@music campus
NARRATOR: Morning. Her father is asleep in the hall. Dhanasree creeps to her mother's room with a plate of dosa and chutney. The door creaks; her father stirs, mumbles, and sleeps on.
  ta: Kaalai. Appa hall-la thoongitu irukaar. Dosa, chutney plate-oda Dhanasree amma room pakkam mella poraa. Kadhavu "kreech"; appa asaiyuraar, munumunukkuraar, thirumba thoongaraar.
@enter dhanasree right 0.64
@shot on ragul
NARRATOR: Inside, Ragul is waving his arms and legs in the air.
  ta: Ulla, Ragul kaal kaiya kaathula veesittu irukaan.
@pose ragul idle
@shot two ragul dhanasree
DHANASREE (confused): Dei, what are you doing?
  ta: Dei, yennada pandra?
RAGUL: Uh... just stretching. Got to keep fit.
  ta: Uh… chumma… stretching. Body-ah fit-ah vechurukanum-la. Adhukudhan.
DHANASREE (happy): Here. Eat something before you stretch any more.
  ta: Indhaa, innum nee stretching pandrakku munnadi konjom saapudu…
RAGUL: Thanks... you didn't have to do this.
  ta: Thanks… Nee idhellam pannanum-nu avasiyam illa…
DHANASREE: Shut up and eat. ...How is it?
  ta: Muditu thinnu. Yepdi iruku?
RAGUL: It's good.
  ta: Nalladhan iruku.
@shot close dhanasree
DHANASREE (angry): "It's GOOD"?!
  ta: "Nalladhan iruka?!"
@shot close ragul
RAGUL: No, no! It's amazing!
  ta: Illa, illa. Semmaiya iruku.
DHANASREE: Better be scared.
  ta: Andha bayam irukanum.
@shot push ragul
NARRATOR: They both laugh. Something in his face softens. He realises how much she's risking for him.
  ta: Rendu perum sirikkuraanga. Avan mugathula edho methuvaagudhu. Avanukkaaga aval evlo risk edukkura-nu avanukku puriyudhu.
@shot auto
DHANASREE: Appa leaves around ten. As soon as he's gone, we go and meet Dharshna. Till then, not a sound.
  ta: Appa oru 10 o'clock kelambiduvaru. Avaru pona odaney namma Dharshna meet panna polam. Adhu varaikum yendha sathamum potradha…

@scene gen:hostel_room
@cast dharshna@0.42>:sit sneka@0.74<
@prop desk@0.52 chair@0.42 bed@0.86^
@caption NRI hostel, 3 October
  ta: NRI hostel, 3 October
@music sorrow
@shot push dharshna
NARRATOR: The NRI hostel. Dharshna paints while the birds chirp outside. Her flight home is at six this evening.
  ta: NRI hostel. Veliya kuruvi saththam, Dharshna paint pandra. Aval ooru flight maalai aaru manikku.
DHARSHNA (thinking): Dhanasree... what's your problem? Why did you call me? Why were the police chasing you and Nithish? Am I the only one in college who doesn't know what's going on?
  ta: Dhanasree… yenna prechana unaku? Yenaku yen call pannuna? Police yen unna, Nithish-ah yellam thorathanum? Yenaku mattum-dha college-la yenna nadanthutu irukudhu-nu therliya yenna?
@shot on sneka
SNEKA (sad): Hey, Dharshna... Pranav... he's dead. I'm going to find out for sure.
  ta: Hey Dharshna… Pranav… yerandhutan. Na… na poi idha confirm pannitu varan.
@exit sneka right
@shot close dharshna
DHARSHNA (scared): So it could happen to me too?
  ta: Yenakum idhey nelama dhana appo?
DHARSHNA (thinking): Everything will be alright. Nothing will happen. Everything will be alright. Nothing will happen...
  ta: Yellam seri aidum. Onnu-aagadhu. Yellam seri aidum. Onnu-aagadhu…
DHARSHNA (scared): Stay calm. No... I can't. I have to do something.
  ta: Calm ah iru. Illa yennala mudila. Yedachu pannanum na ippo.
@pose dharshna idle
@shot pan right
NARRATOR: Her eyes move over the room: a pink teddy, a water bottle, notebooks, a picture of God, pillows. A lighter.
  ta: Aval kann room-a suththi thaavudhu: pink teddy, water bottle, notebook, saami padam, thalaiyanai. Oru lighter.
@shot close dharshna
@shot dutch
DHARSHNA (thinking): Instead of being hurt by things I can't control... if I'm the one who hurts me, then it's under my control. Isn't it?
  ta: Yennoda control-la illadha visayam hurt panradhuku badhula, naaney yenna hurt pannikita, appo control-la iruku dhaana artham.
@music none
@fx heartbeat
@shot memory
@shot shake
DHARSHNA (scared): "Let me go! I'm scared, let me go... LET GO!!"
  ta: "Yenna vitrunga, vitrunga! Yenaku bayama iruku vitrunga… VITRUUUU!!"
@fx black
@wait 1500
@scene gen:house_day
@cast dhanasree@0.38> ragul@0.62<
@caption 3 October, 10:00 AM
  ta: 3 October, kaalai 10:00
@fx unblack
@music mystery
NARRATOR: 3 October, 10:00 AM.
  ta: 3 October, kaalai 10:00.
DHANASREE: Rahul, ready?
  ta: Rahul, yenna ready-ah?
RAGUL: Mm. Let's go.
  ta: Hm, polam.
@shot on dhanasree
DHANASREE: I called Dharshna, but her phone's switched off. Sneka's too. We'll go in person. Wait outside, I'll lock up.
  ta: Call pannen but switched off nu vandhuchu. Sneka mobile-um switched off. Nerlaye poi meet pannadhan correct-ah irukum. Seri veliya iru, na room lock pannitu varan.
@scene none
@set v09_house
@party dhanasree
@room dhana_house mother_room shelf_scene

@label shelf_scene
@fx fade_in
@objective Lock up. Check the shelf before you go.
  ta: Poottu. Pogumbodhu shelf-a check pannu.
@end

@label shelf
@set v09_gun
@done
@shot close player
NARRATOR: She checks the gas, turns off the light, and opens her shelf. Under some clothes lies a handgun. A memory washes over her.
  ta: Gas-a check pannura, light off pannura, shelf-a thorakkura. Thuni kulla oru thuppakki. Oru nyabagam alaiya varudhu.
@set hangar_rain
@set flashback
@party dhanasree ragul
@room hangar_yard west flashback

@label flashback
@fx fade_in
@music chase
@shot orbit player
NARRATOR: The night before. The rain chase. After she left Nithish, the other officer kept after them. Ragul stopped.
  ta: Mundhina raathiri. Mazhai thorathal. Nithish-a vittappuram, innoru officer thorathittey irundhaar. Ragul nindhaan.
@shot two player ragul
RAGUL: I can't run any more... I can't breathe...
  ta: Yennala oda mudila, moochu pudikudhu…
DHANASREE: Just a little further. Once we're off campus we're safe. ...Come with me.
  ta: Konjo dhooram dhaan. Campus vittu veliya poita thappicharlam. Yen kooda va.
NARRATOR: Hangar 1. She stops, eyes scanning the shadows.
  ta: Hangar 1. Aval nindhu, nizhalgala thedura.
DHANASREE: I saw it somewhere around here...
  ta: Inga dhaan yengayo paathan…
@objective Search Hangar 1. Something near the old rusty vehicle.
  ta: Hangar 1-la thedu. Pazhaya thuru pidicha vandi pakkathula edho.
@end

@label jeep
@set v09_gun_found
@give handgun
DHANASREE (happy): Found it!
  ta: Kedachuruchu!
POLICE: Where did they go...? Maybe they're inside.
  ta: Yenga ponanga… Oru-vela ulla irupangalo?
@shot on hangar_cop
@shot dutch
NARRATOR: Lightning shows the officer's shape in the doorway.
  ta: Minnal-la kadhavula officer uruvam theriyudhu.
@fx lightning
@shot level
@shot close ragul
RAGUL (scared): Dhanasree... he's here... what do we do?!
  ta: Dhanasree… avaru vantaru… Yenna pandradiii?!!
DHANASREE: There, a gap in the wall. It's high. Climb.
  ta: Anga, suvar-la oru idukku. Uyaram. Yerungalam.
@objective Climb out through the gap in the wall.
  ta: Suvar idukku vazhiya yeri veliya po.
@end

@label wall_gap
@set v09_wall
@done
@shot two player ragul
NARRATOR: She pulls herself up and reaches back for Ragul. He hesitates, then grabs her hand. They squeeze through and drop down on the other side, breathing hard.
  ta: Aval yeri, Ragul-ku kai neettura. Avan thayangi, aprom pudikkuraan. Rendu perum nuzhanju, marupakkam kudhichu, moochu vaangaraanga.
POLICE (angry): Don't run! Stop!
  ta: Odadheenga nillunga…
@shot close player
NARRATOR: She shoves a big stone into the gap so the officer can't follow.
  ta: Officer pinnaadi vara mudiyaama, idukkula oru periya kallai thallura.
@scene gen:rain_night
@cast security@0.7<^ dhanasree@0.36> ragul@0.24>
@prop gate@0.72^
@caption The main gate, that night
  ta: Main gate, andha raathiri
@shot memory
@shot on security
NARRATOR: The main gate. A security guard stands watch. Dhanasree holds the gun tight. She doesn't want to use it unless she has no choice.
  ta: Main gate. Oru security kaaval-la. Dhanasree thuppakkiya irukki pudikkura. Vera vazhi illana mattum dhaan.
@shot close ragul
RAGUL (scared): Do we really have to do this?
  ta: Ipdi panniye aaganuma?
@shot close dhanasree
DHANASREE: There's no other way, Rahul.
  ta: Vera vazhi illa Rahul.
@wordbattle gate_guard
@clue the_gun
@scene gen:house_day
@cast dhanasree@0.44> ragul@0.64<
@prop door@0.3
@set flashback = false
@set hangar_rain = false
@music mystery
NARRATOR: Dhanasree puts the gun in her pocket and locks the front door.
  ta: Dhanasree thuppakkiya pocket-la vechu, main door-a poottura.
DHANASREE: Rahul, let's go. I'll walk ahead. You follow a little way behind.
  ta: Rahul, va polam. Seri na munnadi poran. Nee pinnadi konjo thalli va.
@face ragul right
@shot close ragul
NARRATOR: Ragul turns and takes one last look at the house.
  ta: Ragul thirumbi andha veetta kadaisiya oru dhadava paakuraan.
@scene none
@set house_day = false
@fx fade_out
@next p01/v10
@end
