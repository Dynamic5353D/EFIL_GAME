# Act I, Venture 10: "Even if I die". 3 October 2022.
# Playable (as Dharshna): out of the burning NRI hostel; to the Humanities restroom.
# Cinematic: Arun and Dhanasree, the fire, the lotus locket, the jeep, the train, Vijayashree
# (her crimes are only implied), the gun lesson, the vow.
# Content: fire and death are never shown (smoke, a doorway); abuse and trafficking only implied.

@label start
@venture 1 10
@title Even if I die
  ta: Na sethaalum
@time 3 October 2022, morning
@warn This chapter includes a fire in which people die (not shown), and refers to crimes against children (implied only).
  ta: Indha chapter-la oru thee vibathu, adhula uyir izhappu (kaattapadaadhu), kuzhandhaigalukku edhiraana kutrangal pathi solludhu (maraimugama mattum).
@set at_night = false
@set house_day = false
@set nithish_cuffed
@set truth_known
@party dharshna
@card
@save start
@scene gen:hostel_morning
@cast arun@0.42>
@caption Boys' hostel, 3 October
  ta: Pasanga hostel, 3 October
@music mystery
@shot close arun
ARUN (thinking): Almost everyone's gone home. Who knows when we'll be back. Nithish, Dhanasree, Ragul... none of them pick up.
  ta: Most ah yellarum ooruku kelambitanga. Inimey yeppa thirumba college varuvom-nu therla… Nithish, Dhanasree, Ragul-ku yellam yenna airukum. Yarumey call panna phone yedukkala.
@sfx phone
@pose arun phone
@shot on arun
ARUN: Hey Dhana! What happened?! I was scared the police had arrested you!
  ta: Hey Dhana, yenna aachu?! Neenga phone-ae yedukadha naala police arrest pannitanga-nu bayandhutan.
DHANASREE: Ragul and I got away. Nithish was caught. That's not important now. I need one big favour: get Dharshna to the railway platform, somehow. She won't pick up for me.
  ta: Nanum Ragul-um thappichitom, aana Nithish-dhaan maatikitan. Ippo adhu mukkiyam illa. Oru mukkiyamana help, Dharshna va mattum yepdiyadhu railway platform-ku kootitu vandhuru. Naan phone panna phone yeduka maatingura.
ARUN: Okay. I'll handle it. ...Dhana. Nothing will happen to Nithish, right?
  ta: Cheri, na pathukuren. Hey Dhana… Nithish-ku onnum aavadhula..?
DHANASREE: Even if I die, I'll save Nithish. Nothing will happen to him.
  ta: Na sethavadhu, Nithish-ah kaapathiruvan. Avanukku onnum aagadhu.
@pose arun idle
@face arun right
@shot pan right
NARRATOR: Arun smiles. Then he smells smoke. Down the hostel pathway, the NRI girls' hostel is on fire.
  ta: Arun sirikkuraan. Appo pugai vaasanai. Hostel vazhiya paatha, NRI girls hostel eriyudhu.
@set hostel_fire
@scene gen:hostel_fire
@cast mahil@0.34> security@0.66<
@caption NRI girls' hostel
  ta: NRI girls hostel
@shot shake
@music fire
NARRATOR: Smoke fills the hallway. Girls run in every direction. The security guard fights the fire with an extinguisher; it isn't enough. Part of the ceiling crashes down in flames.
  ta: Hallway full-ah pugai. Ponnunga ella pakkamum odraanga. Security extinguisher-oda poraadaraar; podhala. Ceiling-oda oru paguthi neruppoda vizhudhu.
@enter arun left 0.2
@shot close mahil
MAHIL (scared): Dharshna's room is completely on fire... Sneka... Sneka is badly burned.
  ta: Dharshna room full-ah neruppu pathikuchu… Sneka... Sneka odambu full-ah burn aagi iruku.
@exit arun right
@shot on security
NARRATOR: Arun pushes inside. In the doorway of Dharshna's room there's only smoke, and a security guard dragging someone out. Dharshna isn't there.
  ta: Arun ulla nuzhaiyaraan. Dharshna room vaasal-la pugai mattum, oruthara security veliya izhukkuraar. Dharshna anga illa.
@fx black
@scene none
@set v10_fire
@room nri_hostel room escape

@label escape
@fx unblack
@music fire
NARRATOR: Minutes earlier. Dharshna, ash on her clothes, her hands shaking. Behind her, her room is burning.
  ta: Konja nimisham munnaadi. Dharshna, thuniyila saambal, kai nadungudhu. Pinnaadi aval room eriyudhu.
DHARSHNA (scared): No... no, no, no...
  ta: Illa… illa, illa, illa…
@objective Get out. Don't touch the fire.
  ta: Veliya po. Neruppa thodaadha.
@end

@label out
@set v10_out
@done
@fx fade_out
@room humanities entrance humanities

@label humanities
@fx fade_in
@set hostel_fire
@music sorrow
NARRATOR: She runs through an empty alley, far from the hostel, without looking back. An old, quiet building. She doesn't know where else to go.
  ta: Hostel-la irundhu dhoorama, oru kaali sandhu vazhiya, thirumbi paakaama odura. Oru pazhaya, amaidhiyaana katti-dam. Vera enga pogradhu-nu theriyala.
@objective Find somewhere to hide.
  ta: Olinjikka oru idam thedu.
@end

@label restroom
@set v10_locked
@done
@sfx door
NARRATOR: She locks herself in the girls' restroom. Her breathing slows. Then the tears come.
  ta: Girls restroom-kulla poottikkura. Moochu mella sariyaagudhu. Aprom kanneer varudhu.
@scene gen:house_day
@cast dharshna@0.4> appa@0.64<
@caption Home, last summer
  ta: Veedu, pona summer
@shot memory
@music lullaby
DHARSHNA (happy): Appa! I got IT at the Anna University MIT campus!
  ta: Appa! Anna University MIT Campus-la IT kedachiruku!
@shot on appa
APPA: Chennai? Why Chennai, ma? I said I'd get you a seat somewhere close by.
  ta: Chennai ya? Chennai yedhuku-ma pota? Unaku inga pakathula irukura college-laye seat vangi tharan-nu sonnala.
@shot two dharshna appa
DHARSHNA: It's not just about college, pa. I need this. I need to prove something to myself.
  ta: Illa pa... It's not just about college,pa. I need this... I need to prove something to myself.
DHARSHNA: You know what happened after... that. How scared I was to even leave the house.
  ta: Ungalukey theriyum, andha vishayam yen vaalkai-la nadandhuku aprom yenna-lam aachu-nu… yepdi na veeta vittu veliya pogavey bayandhan-nu.
@shot close dharshna
DHARSHNA: I don't want to feel small any more, pa. I want to forget it. That college is a place to prove I'm not who I was before. That I'm stronger. I have to face my past and come out of it.
  ta: I don't want to feel small anymore, pa. Andha visayatha na marakka virumburan. Na ippo minnadi maari illa, I'm stronger-nu prove pandraku oru yedam. Na yennoda past-ah face panni-dhan aaganum-pa. Adhula irundhu yepdi-avadhu na velila varanum.
APPA: I believe in you, my dear. A little memento, for my daughter who's going to college.
  ta: I believe in you, my dear. College pora yennoda daughter-ku oru chinna memento.
@shot close dharshna
NARRATOR: In the box, a locket with a lotus.
  ta: Box-kulla, oru thaamarai locket.
@shot push appa
APPA: "A lotus is a symbol of growth and the ability to heal." As long as it's with you, you'll keep healing.
  ta: "A lotus is a symbol of growth and ability to heal". Indha lotus un-kooda irukura varaikum, you'll continue to heal.
@shot two dharshna appa
DHARSHNA (happy): Love you so much, pa! When I come back, it'll definitely be a new me!
  ta: Love you so much, pa! Na college poitu thirumba varum-bodhu, confirm oru new me-ah dhaan varuvan paarunga!
@codex p01_locket
@scene gen:restroom
@cast dharshna@0.5>:sit
@prop door@0.62
@caption Humanities block, girls' restroom
  ta: Humanities block, girls restroom
@music sorrow
@shot push dharshna
DHARSHNA (sad): I thought I'd become strong. That the hostel would fix everything, with friends around me, and nothing would remind me. But nothing changed. I'm still the same old Dharshna, scared every single day...
  ta: Na strong aiten. Palaya maari illa nu nenahan. Hostel pona yellam seri aaidum, friends yellam irupanga, andha atmosphere-la yenaku yedhuvum nyabagm varadhu-nu nenachan. Aana… yedhumey apdi illa. Na innum adhey palaya Dharshna-va dhaan irukan. Bayandhu-bayandhu ovvoru naal-um…
@shot close dharshna
DHARSHNA (angry): No. This isn't my fault. Why should I cry? I didn't do anything. I won't cry.
  ta: Illa. idhu yen thappu illa. Na yedhuku aluganum idhuku… Na yedhuvum pannalaye. Na alamaaten.
DHARSHNA (sad): Sneka... I don't know anything... it... because of me, Sneka is dead...
  ta: Na.. na… Sneka… Yenaku yedhuvum theriyadhu… Adhu…adhu… yennala dhaan Sneka sethupona…
@shot shake
@shot close dharshna
DHARSHNA (sad): NOTHING HAS CHANGED, PA!! I miss you so much, pa!
  ta: Aaaahhh YEDHUVUMEY MAARALA PA!! I miss you so much paaa!
@shot pull
NARRATOR: She holds the locket tight and sits against the restroom door.
  ta: Locket-a irukki pudichukittu restroom kadhavula saanju okkaaruraa.
@clue sneka

@scene gen:campus_cloudy
@cast rajesh@0.36> ramanan@0.5> nithish@0.64>
@prop jeep@0.5^
@caption Chromepet highway
  ta: Chromepet highway
@music tense
@shot pan right
NARRATOR: On the Chromepet highway, a police jeep: Rajesh, Ramanan, and Nithish in cuffs.
  ta: Chromepet highway-la oru police jeep: Rajesh, Ramanan, vilangoda Nithish.
@shot two rajesh ramanan
RAJESH: Did he pick up?
  ta: Yov, yenna phone yeduthaana?
RAMANAN: He did, sir. He's gone out to the beach somewhere. Says he'll be back by ten.
  ta: Yeduthaan sir. Yengayo veliya beach-ku poirukaan. Varadhu-ku 'pathu' agidum-nu sonnan.
@shot close nithish
RAJESH: Fine. We'll wait at the college.
  ta: Sari, namma poi wait pannuvom college-la.

@scene gen:train
@cast ragul@0.4> dhanasree@0.64<
@caption Suburban train
  ta: Suburban train
@music lullaby
@shot orbit ragul
NARRATOR: The train runs fast. Ragul stands by the steps, watching the view go by.
  ta: Train vegama odudhu. Ragul padikattu pakkam ninnu, vazhiyil ellathayum paakuraan.
RAGUL (thinking): Moments like this feel like a fantasy...
  ta: Moments like this feel like a fantasy…
@shot two ragul dhanasree
DHANASREE: Hoi! What happened? Are you scared something will happen to you?
  ta: Hoi! Yenna aachu? Unakku yedhavadhu aidum-nu bayam-ah iruka yenna?
RAGUL (happy): Me? Who am I? Raguru Purakashu—
  ta: Yenakka? Na yaaru? Raguru purakashu-
DHANASREE: I'm asking seriously.
  ta: Na serious-ah kekuran.
@shot close ragul
RAGUL: ...I'm scared.
  ta: Bayama-dhaan iruku.
DHANASREE: Rahul, do you trust me? What I do, what I say?
  ta: Rahul, yenna namburila? Na panradhu, solradhu… yellam nambura-dhaana?
RAGUL: Mm.
  ta: Hm.
@shot close dhanasree
@shot push dhanasree
DHANASREE: Then don't be scared. Even if I die, I'll save you.
  ta: Appo, bayapadadha. Na sethavadhu, unna kaapathiruvan.
@shot close ragul
NARRATOR: Something surges in Ragul that he can't name. Someone wants to protect him.
  ta: Ragul-kulla peyar theriyaadha oru unarvu yerudhu. Yaaro avana kaappaatha nenaikuraanga.
@face dhanasree right
@shot close dhanasree
NARRATOR: Dhanasree looks out too. Memories come, one after another.
  ta: Dhanasree-um veliya paakura. Nyabagangal ondrinpin ondraa varudhu.

@scene gen:house_night
@cast rajesh@0.36> vijaya@0.64<
@prop shelf@0.1^ door@0.9^
@caption Years ago
  ta: Pala varushathukku munnaadi
@shot memory
@music standoff
NARRATOR: Years ago. Her father was a head constable then.
  ta: Pala varushathukku munnaadi. Appo avanga appa head constable.
@shot on rajesh
RAJESH: Vijaya, you haven't been right for a while. Home late every day, on the phone late at night, going out without a word, coming back with money from somewhere...
  ta: Vijaya, konjo naal-ah vey nee nadandhurkuradhu seri illa. Ippo-lam daily-um veetuku late-ah vara. Late-night la phone pesitu iruka, sollama yengayo poidura, yenga irundho neraya panam kondu vara…
@shot on vijaya
VIJAYA: Are you suspecting me? I earn it. Stop asking questions. You're only a head constable at the station, not at home.
  ta: Yenna sandhega padreengala yenna? Na sambarikuran yenaku varudhu. Summa kelvi kettutu irukadheenga. Station-la mattum-dhaan neenga head-constable, veetla illa.
@shot pan left
NARRATOR: He followed her one night, and saw her meet two men in an alley and take an envelope. Days later, at the station, he read reports of girls who had gone missing from the towns nearby. He recognised the names. He had heard her say them on the phone.
  ta: Oru raathiri aval pinnaadiye ponaar; oru sandhula rendu aalungala meet panni oru envelope vaanguradha paathaar. Sila naal kazhichu, station-la, pakkathu oorgal-la irundhu kaanaama pona ponnunga pathina reports padichaar. Andha pergal avarukku theriyum. Aval phone-la solradha kettirukaar.
@shot close rajesh
RAJESH (angry): Girls are disappearing, and you're part of it.
  ta: Ponnunga kaanaama poraanga, adhula nee irukka.
@shot orbit vijaya
@shot dutch
NARRATOR: Vijayashree laughed, a strange laugh. The same laugh Dhanasree has now.
  ta: Vijayashree sirichaa, oru vinoadhamaana sirippu. Ippo Dhanasree sirikkura adhe sirippu.
VIJAYA: Rajesh, you won't understand. This is my chance to live the way I want. Everything I wanted as a child, I'll have. Want money? Ask. I'll give you some.
  ta: Rajesh, unaku idhellam puriyadhu. Pudicha madhiri vaazha yenaku kedacha oru nalla vaipu idhu. Chinna vayasula yenna-yenna yellam aasa pattano… Adhellam naaney neravethika poren. Unakum kaasu venuna kelu, na tharan.
@shot level
@shot close vijaya
VIJAYA: What can you do? Arrest me? Have you thought about Dhanasree? How she'll be without her mother?
  ta: Yenna panna mudiyum unnala? Arrest pannuviya? Dhanasree pathi nenachu paathiya… Amma illama yepdi ava irupa-nu yosichiya?
@cast dhanasree=little_dhana@0.86<
@shot on dhanasree
DHANASREE: Amma... what happened? You two won't let me sleep...
  ta: Yenna-ma aachu…! Rendu perum yenna thoongavey vida maatringa…
@shot two vijaya dhanasree
VIJAYA (happy): Oh, sorry, darling. Go and lie down. Amma will come and sing you a lullaby.
  ta: Achoo! Sorry-ma. Onnu illa-da chellam, Ne poi padu. Amma vandhu thaalatu paadren.
@scene gen:house_day
@cast dhanasree=little_dhana@0.4>:sit rajesh@0.62<:sit
@prop desk@0.51 chair@0.4 chair@0.62
@shot memory
NARRATOR: The day before it happened, Rajesh sat Dhanasree down at the kitchen table. She was thirteen.
  ta: Adhu nadakkuradhukku mundhina naal, Rajesh Dhanasree-a kitchen table-la ukkaara vechaar. Avalukku padhimoonu vayasu.
@shot close rajesh
RAJESH: Dhana, listen carefully. Your mother... she's doing something terrible. Girls have been going missing. And now... you're her next target.
  ta: Dhana, na solradha gavanama kelu. Un amma… ava yedho periya thappu pannitu iruka. Ponnunga kaanaama poraanga. Ippo… nee-dhan avaloda adhutha target.
@shot close dhanasree
DHANASREE (scared): Amma? Why would Amma... Don't joke, pa.
  ta: Amma? Amma yen idhellam… Veladadheenga pa.
RAJESH: I'm serious. You're braver than you think. They'll take you somewhere, and we'll track you and come. But if anything happens to you... use this.
  ta: Nejama dhaan solran. Dhanasree, nee nenaikuradha vida, nee romba dhairiyamanava. Unna oru yedathuku kondu poi vechuruvanga. Unna track panni nangalum anga vandhuruvom. Aana oruvela unaku yedachu aachuna, idha use pannu. Puriyudha?
@shot push rajesh
NARRATOR: He slides a handgun across the table, and shows her how: the magazine, one bullet at a time, press hard, push it in until it clicks, pull back the slide.
  ta: Oru thuppakkiya table-la thallaraar, eppadi-nu kaattaraar: magazine, ovvoru bullet-aa, nalla azhuthu, "click" varra varaikum ulla thallu, slide-a pinnaadi izhu.
RAJESH: If you're caught and there's no other way, aim and pull the trigger. Only if there is no other way.
  ta: Nee yedachu prechanala maatikutta, unaku vera vazhiye illa-na, aim paani trigger-ah pull pannu. Aana unakku vera vazhi-ae illana maatum-dhaan apdi pannanum.
@shot close dhanasree
DHANASREE (scared): I don't know if I can do this, appa.
  ta: Yennala idha panna mudiyumaa-nu therla appa.
@shot two rajesh dhanasree
RAJESH: You can, Dhana. Don't be scared. We'll be right beside you.
  ta: Unnala mudiyum, Dhana. Bayapadadha, nanga un pakkathulaye dhaan irupom.
@clue vijaya
@scene gen:train
@cast ragul@0.4>^ dhanasree@0.6>
@music tense
@shot close dhanasree
@shot dutch
DHANASREE (thinking): Somehow. Whatever it takes. However many more times I die of fear... I will definitely kill him.
  ta: Yepdi aavadhu, yenna panniyavadhu, innum yethana thadava na bayandhu bayandhu sethalum… Kandipaa avana kolluvan.
@shot level
@shot shake
@shot flash
NARRATOR: Another train rushes past on the opposite track.
  ta: Edhir thadathula innoru train "vishhh"-nu thaandi pogudhu.
@scene none
@fx fade_out
@next p01/v11
@end
