# Act I, Venture 6: "Rain". 2 October 2022, evening.
# Playable (as Dhanasree): the Radha Nagar stealth chase (alley, disguise, market, the bridge);
# the rain chase from the back gate.
# Cinematic: Dharshna and Sneka, the back gate, Nithish is caught, Arun sees the news.

@label start
@venture 1 6
@title Rain
  ta: Mazhai
@time 2 October 2022, evening
@set v06_started
@set mit_dusk = false
@party dhanasree ragul nithish
@card
@save start
@scene gen:hostel_room
@music campus
NARRATOR: The NRI girls' hostel. Dharshna ties her shoelaces: yellow T-shirt that says "Dynamic", black track pants, her locket at her throat.
  ta: NRI girls hostel. Dharshna shoe lace kattura: "Dynamic"-nu potta manjal T-shirt, karuppu track, kazhuthula locket.
SNEKA: Where are you off to?
  ta: Yengadi kelambita?
DHARSHNA: Dhanasree asked me to come to Radha Nagar.
  ta: Dhanasree Radha Nagar vara sonna.
SNEKA: Oh... I thought you didn't even like Dhanasree. How come you go the minute she calls?
  ta: Oh… unakku-dhaan Dhanasree-ah pudikadhey, nee yepdi ava kupta-odaney pora-nu yosichan.
DHARSHNA: She kept pestering me, saying it's important. I'm going to find out what her problem is!
  ta: Ava yedho important-nu tholla pannitey irundha… Yenna-dhan ava prechana-nu ketu vara poran!
SNEKA (worried): Okay. Be careful.
  ta: Seri, paathu poitu-va.
@scene none
@room radha_nagar start street

@label street
@fx fade_in
@music stealth
@objective Walk through Radha Nagar with the others.
  ta: Mathavangaloda Radha Nagar-la nadandhu po.
@end

@label phones
@set v06_phones
DHANASREE: Guys, switch off your phones.
  ta: Guys, unga mobile-yellam switch off pannidunga.
ARUN: Why?
  ta: Yedhuku?
DHANASREE: Please. Stay close to me.
  ta: Please. Yen koodaye vanga.
RAGUL: The police are looking for us?
  ta: Police nammala thedi-ah varanga?
ARUN (shocked): The POLICE?!
  ta: Police-ah?!
DHANASREE: Yes. Because of Pranav. I'll explain the moment we lose them.
  ta: Aama. Pranav. Police kitta thappicha udaney explain pandren.
@end

@label followed
@set v06_alley
RAGUL (scared): Dhanasree. Behind us.
  ta: Dhanasree, pinnadi.
DHANASREE: I see them. Two of them, in plain clothes. They're following us. Heads down. We cut left, into the alley between the buildings.
  ta: Pathutan. Rendu peru mufti-la irukanga. Nammala dhaan follow pandranga. Yellarum keela kuninja maariye nadanga. Left-la cut aagalam.
ARUN (scared): What if they catch us? Let's split up.
  ta: Nammala pudichitanga-na yenna pandradhu? Thaniya thaniya split aavom.
DHANASREE: No. Then they'd definitely catch one of us. Stay together.
  ta: Illa vena. Apdi panna nammal-la oruthangala confirm pudichiruvanga. Stay together.
@objective Lose them: through the alley and over the wall.
  ta: Avangala kazhatti vidu: sandhu vazhiya, suvar mela.
@end

@label market
@set v06_market
NARRATOR: The alley spits them out onto a busy market street. The police are only metres behind.
  ta: Sandhu avangala oru busy market street-la kondu vidudhu. Police konja dhooram dhaan pinnaadi.
DHANASREE: Act normal. Slowly.
  ta: Just act normal. Porumaiya… nadanga.
@objective Get through the market unseen. Hide behind stalls, or grab a disguise.
  ta: Kannula padaama market-a thaandu. Kadaigalukku pinnaadi olinjiko, illa vesham podu.
@end

@label disguise
@set disguised
NARRATOR: Dhanasree grabs a scarf from a stall and wraps it round her head. Arun puts on a hat. Ragul pulls up his hoodie. Nithish pretends to examine the fruit.
  ta: Dhanasree oru kadaila irundhu scarf-a eduthu thalaila suthikkura. Arun oru hat podraan. Ragul hoodie-a mela izhukkuraan. Nithish pazham paakura maari nadikkuraan.
@end

@label vendor
@set v06_run
VENDOR (angry): Hey, madam! Pay for that first!
  ta: Yemma! Andha porul-uku kaasu kuduthutu po-ma.
RAGUL (scared): No...
  ta: Illa…
DHANASREE (scared): Run... RUN!!!
  ta: Odunga… Odunga!!!
POLICE: Stop right there!
  ta: Angaye nillunga!
ARUN: We can't keep running like this!
  ta: Namma ipdi oditey iruka mudiyadhu.
DHANASREE: Just get past the bridge! Trust me!
  ta: Andha bridge pakkathula poita podhum. Yenna nambu!
@music chase
@objective Run for the bridge!
  ta: Palam pakkam odu!
@end

@label bins
@done
@set v06_hidden
@set disguised = false
NARRATOR: Past the bridge, a narrow gap between two buildings. They squeeze in behind the bins and hold their breath.
  ta: Palathukku appuram, rendu katti-dangalukku naduvula oru idukku. Kuppa thotti pinnaadi nuzhanju moocha pudichukkuraanga.
POLICE (angry): Where did they go?
  ta: Yenga ponanga avunga?
NARRATOR: Footsteps. Voices. Then, slowly, they fade.
  ta: Kaaladi saththam. Kuralgal. Aprom mella, kammiyaagudhu.
RAGUL: Shit!
  ta: Shit!
NITHISH: What happened, da?
  ta: Yennada aachu?
RAGUL (scared): I'm scared.
  ta: Bayama iruku.
ARUN: Have they gone?
  ta: Avunga poitangala?
DHANASREE: They've gone.
  ta: Poitanga.
@fx fade_out
@scene gen:rain_night
@fx fade_in
@music mystery
NARRATOR: Meanwhile, on the hostel store road, the sky darkens by the minute. The wind picks up. Dharshna walks slowly, unhurried.
  ta: Adhe neram, hostel store road-la, vaanam nimishathukku nimisham iruttaagudhu. Kaathu adikkudhu. Dharshna mella, avasarame illaama nadakkura.
DHARSHNA: Mm. That smell's nice.
  ta: Hmm, Indha smell nalla iruku.
@scene none
@room back_gate start gate

@label gate
@fx fade_in
@music tense
@objective Wait for Dharshna outside the back gate.
  ta: Back gate veliya Dharshna-kaaga kaathiru.
@end

@label back_gate
@done
POLICE: Didn't you hear? Half an hour ago, an accident. Two boys. One died on the spot. The other's gone to hospital.
  ta: Ungaluku theriyadha?! Ippo-dhaan… oru ara-mani-nerathuku munnadi accident aachu. Rendu peru. Oruthan spot-out uh! Innoruthan-ah hospital anupirukanga.
DHANASREE: Stop, stop! Police.
  ta: Nillunga, nilllunga! Police!
ARUN: What do we do now?
  ta: Ippo yenna pandradhu?
DHANASREE: We wait for Dharshna. We can't go in now.
  ta: Dharshna vara varaikum wait pannnalam. Nammalala ippo ulla poga-mudiyadhu.
NARRATOR: Dhanasree switches her phone on with trembling fingers and calls. Lightning lights the clouds.
  ta: Dhanasree nadungura viralaala phone-a on panni call pandra. Minnal megangala velicham podudhu.
@fx lightning
DHARSHNA: Tell me, Dhanasree.
  ta: Sollu Dhanasree.
DHANASREE: We're outside the back gate. Can you come quickly?
  ta: Naanga back gate veliya-dhaan ninnutu irukom, konjo seekiram vara mudiyuma.
NARRATOR: The officer turns and starts walking their way. They duck behind an auto.
  ta: Officer thirumbi avanga pakkam nadakkuraar. Oru auto pinnaadi kuninju olinjikkuraanga.
@set v06_dharshna_near
@sfx siren
NARRATOR: The officer goes back inside, walking right past Dharshna. Then a police jeep pulls up at the gate. Rajesh gets out.
  ta: Officer thirumbi ulla poraar, Dharshna-va thaandi. Appo oru police jeep gate-la nikkudhu. Rajesh irangaraar.
DHANASREE (scared): Oh no. Appa!
  ta: Aiyo appa!
RAJESH: Did those kids come here?
  ta: Yennaya aachu? Andha pasanga inga vandhangala?
POLICE: No, sir. Nobody like the photos you sent.
  ta: Illa sir, neenga photo-la anupiundha maari yarum inga varala sir.
@sfx phone
NARRATOR: Dhanasree's phone rings. Dharshna turns toward the sound.
  ta: Dhanasree phone adikkudhu. Dharshna saththam varra pakkam thirumbura.
DHARSHNA (confused): Why are you hiding in there?!
  ta: Inga yenna olinjitu iruka?!
RAJESH: Who's there?
  ta: Yaaru anga?
DHANASREE: Ragul, give me your hoodie. Arun, stay here. They don't need you. We'll distract him, and you get away.
  ta: Ragul, un hoodie-ah kudu. Arun, nee ingaye iru. Avangaluku nee theva illa. Naanga minnadi poi avara distract pandrom, nee andha time-la odidu.
ARUN: How can I leave you?
  ta: Na yepdi ungala vittutu poradhu?
DHANASREE: Don't worry about us. Save yourself first.
  ta: Yengala pathi kavalapadadha, nee modhala thappichiko.
DHARSHNA: What's going on? Is this a game?
  ta: Yenna aachu? Game-ah?
RAGUL (scared): We're done for.
  ta: Namma gaali.
@fx lightning
DHANASREE: RUN!
  ta: Odunga!
RAJESH: Get them! (Into the radio) Suspects at the MIT back gate. I repeat, suspects at the MIT back gate!
  ta: Avungala pudi-ya! Suspect inga dhaan irukanga. I repeat, suspect MIT BACK GATE kitta irukanga.
DHARSHNA (scared): What is going on?
  ta: Yenna nadakudhu inga?
@set v06_rain_run
@music chase
@objective Run!
  ta: Odu!
@end

@label fall
@done
@music none
@sfx hurt
NARRATOR: The road is slick with rain. Nithish goes down hard. Ragul doesn't stop. He runs as fast as he can.
  ta: Mazhaila road vazhukkudhu. Nithish balama vizhuraan. Ragul nikkala. Mudinja alavukku vegama odraan.
DHANASREE: Nithish!
  ta: Nithish!
NITHISH (shouting): No! Go!
  ta: Illa! Nee poidu!
DHANASREE: No, Nithish, get up!
  ta: Illa Nithish, yendri.
NITHISH: My ankle's twisted, I can't run. Dhanasree... go.
  ta: Yennoda kaal sulukirchu, yennala oda mudiyadhu. Dhanasree… poidu.
POLICE: Stop right there!
  ta: Angaye nillunga!
NARRATOR: She looks at her father coming through the rain, then at Nithish. Her breath comes faster and faster, fear turning into fury.
  ta: Mazhaila varra appava paakura, aprom Nithish-a. Moochu vega vegama, bayam kobama maarudhu.
DHANASREE (angry): HUUUAAAAAHHHH!!!
  ta: HUUUUUAAAAAAAHHHHH!!!
@fx lightning
NARRATOR: Her scream echoes in the rain. She leaves him and runs. Behind her, through the downpour, her father snaps handcuffs onto Nithish's wrists. His face is only sad.
  ta: Aval kathal mazhaila edhirolikkudhu. Avana vittutu odura. Pinnaadi, kotura mazhaila, aval appa Nithish kaila vilangu podraar. Avan mugathula sogam mattum dhaan.
@set v06_nithish_fell
@set nithish_cuffed
@party dhanasree ragul
@music chase
@objective Keep running.
  ta: Oditey iru.
@end

@label escaped
@done
@set v06_done
@fx fade_out
@scene gen:hostel_morning
@fx fade_in
@music sorrow
NARRATOR: Arun walks back in through the hostel gate. People are leaving with bags. Rawin is one of them.
  ta: Arun hostel gate vazhiya ulla varaan. Ellarum bag-oda kelambaraanga. Rawin-um.
ARUN: What happened? Why is everyone leaving?
  ta: Yennada aachu? Yen yellarum kelamburanga?
RAWIN: You don't know? The RC's told everyone to go home. Go and watch the news.
  ta: Unaku matter theriyadha?! RC yellaraiyum ooruku kelamba sollitaru… Poi news-ah paara modhala…
NEWS: Greetings. In Tamil Nadu, a series of mysterious deaths over the past few days has caused great alarm. Across all districts, more than two hundred deaths have been reported so far, without any visible sign or symptom.
  ta: Vanakkam. Tamil Nadu-la kadandha sila naatkalaaga marmamaana maranangal thodarndhu nadaiperuvadhu perum parabarappai erpaduthiyulladhu. Ella maavattangalilum serndhu idhuvarai 200-kkum mel maranangal padhivaagiyirukkindrana. Endha chinnangalum, arigurigalum illaamal.
NEWS: The government has launched an intensive investigation. There is still no explanation. Please take care of yourselves and your families.
  ta: Tamil Nadu arasu theevira visaaranaiyai aarambithulladhu. Innum sariyaana vilakkam kidaikkavillai. Ungalaiyum ungal kudumbathaiyum paadhugaappaaga vaithukkollungal. Nandri.
@clue two_hundred
NARRATOR: Arun stands frozen while students hurry past him.
  ta: Students avana thaandi vegama pogumbodhu Arun uraindhu nikkuraan.
@scene none
@fx fade_out
@next p01/v07
@end
