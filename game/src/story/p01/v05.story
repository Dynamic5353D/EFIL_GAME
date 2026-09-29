# Act I, Venture 5: "The back door". 2 October 2022, 4 PM to evening.
# (The novel dates this chapter 02.09; it follows V4 on 2 October.)
# Playable: the MIT road at dusk; out the back of Cheese N Freeze past the police.
# Cinematic: Nithish's interview, Rajesh's theory, Pranav (choice), the accident.
# Content: Pranav's slur is removed ("he spits a filthy word at her").

@label start
@venture 1 5
@title The back door
  ta: Pinvaasal
@time 2 October 2022, 4:00 PM
@party ragul
@card
@save start
@scene gen:classroom
@cast nithish@0.36>:sit ramanan@0.6<^ rajesh@0.68< police@0.84<^
@prop desk@0.52 chair@0.36
@caption Placement hall, 4:00 PM
  ta: Placement hall, maalai 4:00
@music mystery
@shot pan left
NARRATOR: The placement hall. Nithish waits alone among the cushioned chairs. Inspector Rajesh walks in with Ramanan and another officer, notepads and a recorder in hand.
  ta: Placement hall. Cushion chair-ellam irukura arai-la Nithish thaniya kaathirukaan. Inspector Rajesh, Ramanan, innoru officer, notepad, recorder-oda ulla varaanga.
@shot auto
RAJESH: Sit, sit. Nithish, I think you know what's been happening in your college.
  ta: Ukkaru, ukkaru. Nithish… unnoda college-la nadakura incident-lam unakku theriyum-nu nenaikuran.
RAJESH: We checked the CCTV. Before all three deaths, you were right there.
  ta: CCTV footage yellam check pannadhula, college-la moonu perum savarakku munnadi, nee andha yedathula irundhuruka.
@shot close nithish
NARRATOR: He throws three photos on the table.
  ta: Moonu photo-va table-la podraar.
@shot push rajesh
RAJESH: Near all three places. And two of the victims, you were in contact with just before they died. Doesn't look like a coincidence, does it?
  ta: Sambavam nadandha moonu yedathuku pakkathulaiyum nee irundhurukaye-pa. Adhula rendu victim kooda vera, avunga saavarukku munnadi contact-la irundhuruka. Coincidence maari illa?
@shot close nithish
@choice nithish_answer
  - Deny everything -> v05_deny
    ta: Ellathaiyum maru
  - Explain, one by one -> v05_explain
    ta: Onnu onna vilakku
@label v05_deny
NITHISH (scared): Sir, I didn't do anything! I swear! I might have been there, but I don't even know what happened!
  ta: Sir… Na yedhuvum pannala sir. Sathiyama solren, anga… anga na irundhurupen, aana yenaku enna aachu-nu kooda theriyadhu!
@label v05_explain
@shot two nithish rajesh
NITHISH: Subramani came to our room for my record note. Janani had sweets from her village for me; I went to collect them. And this one... I was going to class.
  ta: Subramani kadaisiya record note vaanga room-ku vandhurundhan sir. Janani yenakku avunga oorla irundhu sweet kondu vandhurundha, adhu vanga-poirundhan. Idhu… Appo na class-ku poitu irundhan.
RAJESH: Why that road?
  ta: Class-ku yen nee andha vazhila pona?
NITHISH: A boy in my class fooled me. Said there was a secret class and I should go round the back way.
  ta: Yen class paiyan oruthan, class irukku, yarukkum theriyama nadakkudhu, adhanala suthi-po, apdi-nu yenna yemaathi veladitu irundhaan.
RAJESH: And when you went that way, you didn't see the body?
  ta: Seri, ne andha vazhila pogumbodhu, body-ah paakalaya?
NITHISH: The body wasn't there then, sir.
  ta: Appo body anga illa sir.
RAJESH: Anything else? Anything strange?
  ta: Vera yedachu notice panniya. Yedachu vithyasama…?
@shot slow
@shot close nithish
NITHISH: I... heard a sound. Like something falling. I don't know what. Just... something falling.
  ta: Appo yenaku oru satham ketudhu, yedho keela vilundha mari. Yenna-nu correct ah therla, aana yedho keela vilundha satham…
@clue falling_sound
@shot normal
@shot on rajesh
RAJESH: We'll verify all of it. Think again. If you remember anything, call me. We'll be watching you. If you really are innocent, prove it.
  ta: Nee sonnadhellam naanga verify pandrom. Innoru thadava yosichu paaru. Unna watch pannitu-dhaan irupom. Nee unmaiyalume appavi-na, adha prove panna try pannu.
@scene gen:corridor_day
@cast arun@0.14> dhanasree@0.26> nithish@0.42> ragul@0.6<
@caption Outside the placement hall
  ta: Placement hall veliya
@shot two nithish ragul
NARRATOR: At the door Nithish runs into Ragul, who's been called in next. Ragul watches him go, eyes wide.
  ta: Kadhavula Nithish Ragul mela modhuraan; adutha inquiry Ragul-ku. Ragul kanna virichu avana paakuraan.
@exit ragul right
@shot on nithish
NITHISH (scared): They think I'm involved in the deaths. I have to prove I didn't do anything.
  ta: Namma college-la nadakkura saavu-la yellam na involve airukan-nu nenaikuranga. Na yedhuvum pannala-nu yepdiyaadhu prove pannanum avunga kitta.
@shot two dhanasree nithish
DHANASREE: Nothing will happen. Don't be scared.
  ta: Onnu aavadhu, bayapadadha.
@enter ragul right 0.62
@shot wide
NARRATOR: Time passes. At last Ragul comes out, slowly, sweating.
  ta: Neram pogudhu. Kadaisiya Ragul mella, vervaiyoda veliya varaan.
@shot close ragul
RAGUL (scared): Nithish... you were the red shirt.
  ta: Dei Nithish, nee-dhaana andha red shirt.
@shot on nithish
NITHISH: Yes, I wore red on fest day. Did they ask about me?
  ta: Aama... Nan-dhan fest annaiku red colour sattai potutu vandhan. Yedachu ketangala enna pathi?
@shot on ragul
RAGUL: If you did something, tell me, da. Maybe you're a psycho. You kill when you're bored and walk around normal the rest of the time. Or you found some drug and needed test subjects—
  ta: Dei… yedhachu pannirundha solliru-da. Oru vela nee oru psycho-va kooda irukalam. Yeppo yellam bore adikidho, appo yellam kolluva, matha neram normal-ah suthitu irupeh. Illa yedachu drug kandupudichitu irukalam, adhuku test subjects ah-
@shot shake
@shot two nithish ragul
NITHISH (angry): Keep talking like that and I'll forget you're my roommate!
  ta: Dei nee ippadiye pesitu irundha, roommate-nu kooda paaka maaten, appiruvan-da!
@shot auto
DHANASREE: Why are you two fighting?! Neither of you did anything, okay?
  ta: Neenga rendu perum yenda sanda potukreenga?! Neenga rendu perumueyy thappu pannala sariya.
@shot on arun
ARUN: But one thing doesn't fit. Nithish took the cut road and there was no body. Ragul took it after him and there was. Where did it come from?
  ta: Aana onnu mattum inga idikkudhu. Nithish cut route la poirukan, appo road-la body illa. Pinnadiye Ragul-um adhey route la poirukan, aana indha time body irundhuruku. Adhu yepdi?
@scene gen:station
@cast rajesh@0.42>:think ramanan@0.66<
@prop desk@0.5
@caption Chitlapakkam police station
  ta: Chitlapakkam police station
@shot push rajesh
NARRATOR: Somewhere else, Rajesh is asking himself the same thing. Both boys heard a sound. Hands clapping? A bottle falling? A branch breaking? A finger snapping?
  ta: Vera edathula, Rajesh-um adhe kelviya kettukuraar. Rendu pasangalum oru saththam kettaanga. Kai thattal? Bottle vizhudhal? Kilai odaidhal? Viral sodakku?
@shot on ramanan
RAMANAN: Sir, if you ask me, one of those two boys definitely knows the truth.
  ta: Sir, yennaku yenna thonudhu-na, andha rendu-pasangalla, yaaro oruthan-uku kandippa unma theriyum.
@pose rajesh idle
@shot close rajesh
RAJESH: Ramanan, get me everything on that Krishnaa.
  ta: Yov Ramanan, andha Krishnaa-oda information venum yenakku.
@scene none
@set mit_dusk
@set v05_walk
@party ragul dhanasree nithish
@room mit_road rajam walk

@label walk
@fx fade_in
@music campus
@save walk
NARRATOR: 5:00 PM. Evening light, long shadows under the trees. Yellow flowers drift down. The road is nearly empty.
  ta: Maalai 5:00. Maalai velicham, maraththu nizhal neelama. Manjal poo mella vizhudhu. Road kittathatta kaali.
@objective Walk down the MIT road with the others.
  ta: Mathavangaloda MIT road-la nadandhu po.
@end

@label pranav_call
@sfx phone
DHANASREE (thinking): Oh no. I forgot about him.
  ta: Aiyo, ivana marandhutan.
DHANASREE (angry): What?
  ta: Sollu?
PRANAV: Where are you? Dhanu, please. I want to see you. Just five minutes.
  ta: Yenga iruka? Hey Dhanu,please… Yenakku unna paakanum pola irukku. Yenakku oru five minutes mattum kudu.
DHANASREE (angry): Five minutes won't change anything, Pranav. It's over. Stop calling me.
  ta: Five minutes yedhuvum maatha poradhu illa Pranav. Namma relationship mudinjiruchu. Yenakku inimey koopradha niruthu.
RAGUL: Ex?
  ta: Ex?
DHANASREE: No, no. A friend. Pranav, from our class. We joined Black Crew together. About a week ago he proposed to me. That's why I left the club.
  ta: Illa-illa, friend. Pranav, namma class-dhaan. Nanum avanum black crew-la onna-dhaan join pannom. Oru one week munnadi yenakku propose pannitan. Adhu-naala club-ah vittey na leave aiten.
@sfx dash
NARRATOR: A bike screeches to a stop ahead of them. Pranav, with Krishnaa riding pillion.
  ta: Oru bike munnaadi "kreech"-nu nikkudhu. Pranav, pinnaadi Krishnaa.
@set v05_pranav_called
@end

@label pranav
@music tense
@shot two pranav_v5 player
PRANAV (angry): So you dumped me to hang around with these guys?
  ta: Nee yennadi, yenna kalati-vittu ivunungaloda suthitu iruka…
RAGUL (thinking): "Hey, watch your mouth. Mind your business."
  ta: "Hey, thappa pesadha. Mind your business."
DHANASREE (angry): Hey! Watch your mouth. Mind your business.
  ta: Hey! Thappa pesadha. Mind your business.
RAGUL (thinking): Called it. Fight!
  ta: Podu fight.
@shot on krishnaa_v5
KRISHNAA (mocking): What, rep, hanging around with these two idiots?
  ta: Yennada, rep-uh, indha rendu mutta pasangaloda suthitu iruka?
ARUN: They're my friends. Don't talk about them like that.
  ta: Avunga yen friends, avungala pathi thappa pesadha.
KRISHNAA (mocking): Nithish! What, you want to hit me? I knew I'd catch you alone one day.
  ta: Dei, yenna thimura? Yennaiye adika vara nee? Oru naal yenta sikkuvan-nu nenachan. Correct-ah sikkita.
NITHISH (angry): The police are around, that's the only reason I haven't hit you already.
  ta: Police-laam irukanga-nu dhan pakuren, illana ippavey unna adichiruvan.
PRANAV (angry): Nobody knows when college will open again. I came to talk to you one last time. And you're too busy for five minutes, but not for these three.
  ta: Idhuku aprom college yeppo open aagum-nu therla. Adhan seri, kadasiya unna nerla paathu pesalanu vandhan. Yenakku five minutes kudukka time-illa, aana ivunga kooda sutha mattum time-iruka.
@shot close pranav_v5
NARRATOR: Pranav leans in and spits a filthy word at her.
  ta: Pranav kitta vandhu aval mela oru asingamaana vaarthaiya thuppuraan.
RAGUL (thinking): Should I hit him now...?
  ta: Naa ippo avana adikkanum dhaana…
@fx slap
@shot shake
NARRATOR: Dhanasree slaps him.
  ta: Dhanasree avana arainjidura.
DHANASREE: That's your limit.
  ta: Unaku avlo-dhaan limit.
@shot on pranav_v5
@shot slow
NARRATOR: Pranav swears and raises his hand to hit her back.
  ta: Pranav kettavaarthai solli, thirumbi adikka kaiya oongaraan.
@shot close player
RAGUL (thinking): He's definitely going to hit her. If I step in and stop him, she'll like me more...
  ta: Kandippa avan thirupi adipaan. Poi avana thadutha, Dhanasree-ku yen mela affection adhigam aagum.
@choice pranav
  - Step in between them -> step_in
    ta: Rendu perukum naduvula po
  - Stay back -> stay_back
    ta: Pinnaadiye iru
@label stay_back
RAGUL (thinking): No... I'll get hurt. Stay here. Stay...
  ta: Illa… adi padum. Inga-ye iru. Iru…
NARRATOR: But his legs move anyway.
  ta: Aana kaal thaanaave nagarudhu.
@label step_in
@shot normal
@shot two player pranav_v5
RAGUL (scared): D-dei, Pranav, the police are around. Don't.
  ta: Dei Pranav police-laam irukanga venam.
NARRATOR: Ragul grabs Pranav's arm.
  ta: Ragul Pranav kaiya pudikkuraan.
@fx migraine
PRANAV (angry): And who the hell are you?!
  ta: Nee yaara?!
@fx shake
@shot close player
NARRATOR: Pranav shoves him. Ragul stumbles back and hits the ground. Dhanasree freezes, a second too long, and Pranav slaps her across the face. She doesn't even flinch. She's still staring at Ragul.
  ta: Pranav avana thalli vidaraan. Ragul pinnaadi thadumaari keezha vizhuraan. Dhanasree uraiyura, oru nodi adhigama. Andha nerathula Pranav aval kannathula araiyuraan. Aval asaiyala kooda. Innum Ragul-a dhaan paakura.
@fx slap
@shot auto
DHANASREE (worried): Rahul. Come on, let's go. Arun, Nithish, let's go.
  ta: Rahul, va polam. Arun, Nithish, vaanga polam.
NITHISH (angry): Why did he hit you?!
  ta: Avan yedhuku unna adichan?
DHANASREE: I'll tell you later. We need to get out of here. There are police around; if they see us it'll be trouble.
  ta: Aprom solran, naama seekiram inga irundhu kelambanum. Police vera irukanga inga, paatha yedachu prechana adium.
KRISHNAA (mocking): What's this, Nithish, running away scared?
  ta: Yenna-da Nithish ipdi bayandhu odra.
DHANASREE: Ignore him. We leave. Now.
  ta: Avan solradha kandukaadha. Indha yedatha vittu modhala kelambanum.
@set v05_left_pranav
@music mystery
@objective Get away from here. Head for the main gate.
  ta: Inga irundhu kelambu. Main gate pakkam po.
@end

@label to_cafe
@done
@set v05_at_cafe
@scene gen:campus_dusk
@cast rajesh@0.46>:cross
@prop jeep@0.66
@caption MIT entrance, 5:40 PM
  ta: MIT entrance, maalai 5:40
@shot orbit rajesh
NARRATOR: At the MIT entrance, Inspector Rajesh is leaning on his jeep. Somewhere behind him, the screech of tyres. Metal on the road.
  ta: MIT entrance-la Inspector Rajesh jeep-la saanju nikkuraar. Pinnaadi engo, tyre "kreech". Road-la ulogam modhura saththam.
@sfx crowd
@fx black
@pose rajesh idle
@face rajesh left
@shot close rajesh
NARRATOR: He turns. His face goes white.
  ta: Thirumbaraar. Mugam veluthu pogudhu.
@fx unblack
@scene none
@room cheese_freeze table cafe

@label cafe
@fx fade_in
@music campus
NARRATOR: Cheese N Freeze. Yellow lights, plastic flowers, translucent walls. Ragul is texting under the table.
  ta: Cheese N Freeze. Manjal velicham, plastic poo, olivum suvargal. Ragul table-kku keezha text pannitu irukaan.
NITHISH: If you'd told me then, I'd have fought him right there.
  ta: Nee appavey sollirundha, adhey yedathula vechu avan-kuda sanda potrupan.
ARUN: How can he talk to a girl like that?
  ta: Yepdi avan oru ponnu-kitta ipdi pesalam.
DHANASREE: Forget it, that's not important now. (On the phone) Dharshna, how are you? Can you come to Cheese N Freeze? Please, it's urgent.
  ta: Vidunga adhu mukkiyam illa ippo. Dharshna, ippo eppadi iruku? Konjo Cheese N Freeze vara mudiyuma? Konjo urgent, please, please.
ARUN: Dhana, why are you so tense? You're never like this.
  ta: Hey Dhanasree nee yen oru maari iruka? Oru maari tension ah… nee yeppavum ipdi iruka maatiye?
@shot on cafe_police
NARRATOR: Outside the glass, two policemen. Dhanasree goes rigid.
  ta: Glass-kku veliya rendu police. Dhanasree irukkamaagura.
@shot auto
DHANASREE (scared): Guys, we have to leave. Now. We'll meet Dharshna on the way.
  ta: Guys namma inga irundhu seekiram kelambi aaganum. Dharshna-va namma pora vali-la meet pannikalam.
ARUN: Tell us what's going on first. You've been strange all day.
  ta: Yenna nadakudhu-nu sollu yenga kitta? Nee appo-la irundhu oru-maari ya dhaan iruka.
DHANASREE: I'll tell you everything, I promise. There's no time. Please, Arun.
  ta: Na kandippa solren, ippo adhukku time illa. Purinjiko Arun.
NITHISH (angry): She said let's go. Come ON.
  ta: Dei, ava-dhaan solra-la, va polam.
ARUN: Fine. But after we meet Dharshna, you explain everything.
  ta: Sari, aana Dharshna meet pannadhuku-aprom yellathaiyum explain pandra nee.
@set v05_police_in
@music stealth
@objective Slip out through the back door without the police seeing you.
  ta: Police kannula padaama pinvaasal vazhiya veliya po.
@end

@label back_door
@done
@set v05_escaped
@sfx door
NARRATOR: They slip out through the back door and into the lane behind the shops.
  ta: Pinvaasal vazhiya kadaigalukku pinnaadi irukura sandhu-kulla nazhuvuraanga.
@set mit_dusk = false
@fx fade_out
@next p01/v06
@end
