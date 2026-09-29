# Act I, Venture 12: "The snap". 3 October 2022, cloudy afternoon.
# Word battle (boss): Dhanasree vs Rajesh. Playable: the Humanities hide (as Dhanasree); the plane yard
# and the oil-and-rope trap (as Nithish, cuffed).
# Cinematic: Rajam Hall, the gunshot (cut away at the moment of impact), the warehouse (cut to black),
# the hands, the Snap.
# Content: a shooting (content note first); nothing is shown past the moment of the shot.

@label start
@venture 1 12
@title The snap
  ta: Sodakku
@time 3 October 2022, cloudy afternoon
@warn This chapter includes a shooting. The screen cuts away before anything is shown.
  ta: Indha chapter-la oru thuppaakki soodu irukku. Edhuvum kaattaradhukku munnaadi screen maarum.
@set mit_cloudy
@set hostel_fire
@set nithish_cuffed
@set truth_known
@set v11_done
@set v12_standoff
@party dhanasree
@give handgun
@card
@save start
@room cut_road standoff standoff

@label standoff
@fx fade_in
@music standoff
NARRATOR: The cut road. Dhanasree's gun is pointed at her father. Nithish is on the ground between them.
  ta: Cut road. Dhanasree thuppakki avanga appa-va kurivaikkudhu. Rendu perukkum naduvula Nithish keezha.
@shot close nithish
NITHISH (shocked): Dhanasree...
  ta: Dhanasree…
RAGUL (thinking): A gun? Where did she get that? If I'd known... I'd have stayed with her. (He trembles.)
  ta: Gun-ah? Iva kitta yepdi? Idhu therinjirundha… na… iva koodaye irundhurupan.
NARRATOR: Around ten policemen close in behind her.
  ta: Aval pinnaadi oru pathu police nerungaraanga.
@wordbattle rajesh
DHANASREE (shouting): Nithish, get up!
  ta: Nithish yendhiri!
NARRATOR: She hauls him to his feet and turns the gun on Ragul.
  ta: Avana thooki nirutthi, thuppakkiya Ragul pakkam thiruppura.
DHANASREE: You. Follow me.
  ta: Nee yenna follow pannu.
POLICE: She's got a handgun! Careful. Use weapons only if you have to.
  ta: Ava handgun vechuruka. Paathu! Theva patta weapons use pannunga.
POLICE: But sir... that's the Inspector's daughter.
  ta: Aana… sir, adhu Inspector-oda ponnu.
NARRATOR: They run for the library. Nithish's leg is failing him. A policeman blocks the way, and they scatter: Dhanasree with Ragul and Dharshna one way, Nithish the other.
  ta: Library pakkam odraanga. Nithish kaal thaangala. Oru police vazhi mariykkaar; ellarum sidharaanga: Dhanasree, Ragul, Dharshna oru pakkam, Nithish innoru pakkam.
DHANASREE (shouting): Nithish, get there somehow! Rajam Hall!
  ta: Nithish, yepdi aavadhu anga vandhuru! Rajam Hall!
@set v12_fled
@party dhanasree ragul dharshna
@set v12_hum
@room humanities entrance hum

@label hum
@fx fade_in
@music stealth
DHANASREE (thinking): Until Nithish reaches Rajam Hall, I have to keep them busy.
  ta: Nithish Rajam Hall reach agura varaikum, na yepdi-aavadhu ivungala distract pannanum.
GIRL: Hey! Isn't that Dharshna? The police are chasing them... Let's not stay here.
  ta: Aei! Adhu, Dharshna dhaana? Police yellam thorathudhu avungala… Va namma inga nika venam, poidalam.
@objective Upstairs, quickly!
  ta: Mela, seekram!
@end

@label police_in
@set v12_search
@sfx door
@shot wide
POLICE (angry): Where did they go? Some of you go upstairs. The rest, search this floor.
  ta: Yenga poi tholanjanga! Neenga konjo peru mela ponga, meedhi peru indha floor-la thedunga.
@objective Hide behind the big door. When the way is clear, get back down and out.
  ta: Periya kadhavu pinnaadi olinjiko. Vazhi kaaliyaanadhum keezha irangi veliya po.
@end

@label hum_escape
@set v12_escaped_hum
@done
@shot close player
NARRATOR: Out of the building, past the library, into Rajam Hall. They stand behind a wall, breathing hard.
  ta: Katti-dathula irundhu veliya, library-a thaandi, Rajam Hall-kulla. Oru suvar pinnaadi moochu vaangi nikkuraanga.
DHANASREE (thinking): I think we've bought Nithish enough time.
  ta: Nithish-ku podhumana time vangitom-nu nenaikuran.
@shot close player
@shot shake
DHANASREE (scared): Where's Nithish?!
  ta: Nithish yenga?!
DHARSHNA: He's not here!
  ta: Avana kanom!
@fx fade_out
@party nithish
@set v12_planes
@room hangar_yard yard plane_yard

@label plane_yard
@fx fade_in
@music stealth
@shot orbit player
NARRATOR: Nithish crouches behind an old fighter plane, heart racing. Two officers are searching the yard.
  ta: Nithish oru pazhaya fighter plane pinnaadi kuninjurukaan, idhayam thudikkudhu. Rendu officer yard-a thedaraanga.
POLICE: There was another one. Where did he go?
  ta: Innoruthan irundhaan-la, avan yenga-ya ponan?
POLICE: Search properly! He can't have gone far on that leg.
  ta: Nalla thedu! Avan inga dhaan yengachu irupan. Romba dhooram poiruka mudiyadhu avanaala.
@shot close player
NITHISH (thinking): I have to get to Rajam Hall somehow. They can't catch me. ...I need a way to trick them.
  ta: Na yepdi-aavadhu Rajam Hall poganum. Ivunga yenna pidikka vida koodadhu. Ivungala yemaathura maari yedhavadhu venum.
@objective Slip between the planes to the maintenance shed. Find something to trick them with.
  ta: Plane-galukku naduvula nazhuvi maintenance shed-ku po. Avangala yemaatha edhavadhu thedu.
@end

@label shed
@set v12_have_things
@give oil_can
@give rope
@shot close player
NITHISH (thinking): A can of oil... and a long rope. This might work.
  ta: Oru oil dabba… oru neenda kayiru. Idhu… vela seiyum-nu nenaikuran.
@objective Pour the oil in front of the shed.
  ta: Shed munnaadi oil-a oothu.
@end

@label oil
@set v12_oiled
@take oil_can
NARRATOR: He pours the oil across the ground in front of the shed. It spreads, dark and slick.
  ta: Shed munnaadi tharaila oil-a oothuraan. Adhu karuppa, vazhukkala parakkudhu.
@objective Tie the rope inside the shed.
  ta: Shed-kulla kayiru kattu.
@end

@label rope
@set v12_roped
@take rope
NARRATOR: He ties one end of the rope inside the shed and throws the other end out the door.
  ta: Kayiroda oru muna shed-kulla katti, innoru munaya kadhavu vazhiya veliya veesuraan.
@objective Get behind the shed and call them over.
  ta: Shed pinnaadi poi avangala koopidu.
@end

@label decoy
@set v12_slipped
@done
@shot close player
NITHISH (shouting): Over HERE!
  ta: Inga!
@shot wide
@shot slow
NARRATOR: He ducks behind the shed. The officers rush toward his voice, hit the oil, and go down hard.
  ta: Shed pinnaadi olinjikkuraan. Officers kural pakkam odi varaanga, oil-la kaal vachu, balama vizhuraanga.
@fx shake
@shot normal
POLICE: Watch it!
  ta: Paathu!
POLICE (angry): Hey! He's running over there!
  ta: Yov! Avan anga oditu irukan!
@music chase
@objective Run to Rajam Hall!
  ta: Rajam Hall-ku odu!
@end

@label rajam
@set v12_snap
@done
@music standoff
@scene gen:campus_cloudy
@cast nithish@0.46> officer3@0.72<:point ragul@0.12>^ dharshna@0.2>^
@prop statue@0.3 lamp@0.86^
@caption Rajam Hall
  ta: Rajam Hall
@enter nithish left 0.46
@shot wide
POLICE (angry): Stop! Or I'll shoot!
  ta: Odadha Nillu! Illana sutruvan!
@shot two nithish officer3
NARRATOR: A few steps from Rajam Hall, Nithish looks over his shoulder. A policeman, gun drawn. He stops. He raises his hands.
  ta: Rajam Hall-ku sila adi munnaadi, Nithish thirumbi paakuraan. Oru police, thuppakki neettikittu. Nikkuraan. Kaiya thookkuraan.
@shot on dharshna
NARRATOR: Inside, at the windows, Dharshna grips her locket. Ragul bites his nails.
  ta: Ulla, jannal pakkam, Dharshna locket-a irukki pudikkura. Ragul nagatha kadikkuraan.
DHARSHNA (thinking): Everything will be alright. Nothing will happen. Nothing will happen...
  ta: Yellam seri aidum. Onnu-aagadhu. Onnu-aagadhu…
@shot close ragul
RAGUL (thinking): What if the police ask why I ran with Dhanasree? I should have stayed with the police instead of running after her. I'm caught for sure! That's it, it's over!
  ta: Yen Dhanasree-oda odi vandha-nu police keta yenna pandradhu… Kammunu police-koodavey irundhurkalamoo, Dhanasree pinnadi odi vandhadhuku badhula. Na vasama maatikiten! Avlo-dhan pochu!
@shot close nithish
NITHISH (sad): So that's it... my life ends here. Aatha... forgive me. Your son is about to die. He can't save the family now.
  ta: Avlo-dhana… Yennoda vaalka idhoda mudinjudha… 'aatha'… Yenna manichuru-'tha, un paiyan konja nerathula saava poran. Un paiyan-aala kudumbatha kaapatha mudiyadhu inimel.
@shot push nithish
NITHISH (sad): You're so brave, 'tha. I know you can bear it. But you walked four miles every day so I could study... and it's all wasted in a single day. Forgive me, 'tha.
  ta: 'Tha, nee romba dhairiyamanava. Unnala adha thanngika mudiyum-nu yenaku theriyum. Aana… nee kashtapattu dhenamum naalu mile nadandhu yenna padikka vechu college-ku anupunadhu… yellam indha naal-naale veena pochu 'tha... Yenna… yenna mannichiru 'tha.
@shot dutch
@shot shake
NITHISH (shouting): GOD, SAVE ME!
  ta: KADAVULEYYY, YENNA KAAPATHU!
@shot level
@pose nithish kneel
@shot two nithish officer3
NARRATOR: He falls to his knees. The wind blows dust across the courtyard. The officer's gun is on his head.
  ta: Mutti poduraan. Kaathu muttrathula thoosiya parakkudhu. Officer thuppakki avan thalai mela.
@shot close officer3
OFFICER3 (mocking): Thought you could run? You're not running anywhere now.
  ta: Thappichu odiralam-nu nenachiya? Idhuku-mela unnala yengayum oda mudiyadhu.
@cast dhanasree@0.3>:point
@enter dhanasree 0.3 0.38
@shot on dhanasree
NARRATOR: Dhanasree steps out from behind the statue, gun raised, eyes cold.
  ta: Silai pinnaadi irundhu Dhanasree veliya varaa, thuppakki oongi, kann kulirndhu.
@face officer3 dhanasree
@shot two dhanasree officer3
OFFICER3: Hey, hey... Put that down. Do you know what you're doing?!
  ta: Hey, hey... Adha keela podu. Nee yenna pannitu irukenu theriyudha?!
DHANASREE: Step away from him.
  ta: Avan-ah vittu thalli ponga.
@shot close officer3
OFFICER3 (mocking): You think you can shoot me? You don't even know how to hold that gun properly. I've seen plenty like you. Holding a gun doesn't make you a killer.
  ta: Unnala yenna suda mudiyum-nu nenaikuriya? Andha gun-ah olunga yepdi pudikanum-ney therila unaku. Unna maari na yethana per-a paathurukan. Summa kaila gun vechurundha kola-kaaran aiduvangala?
@shot shake
OFFICER3 (angry): Drop the gun! I'll ruin your whole life, listen to me!
  ta: Gun-ah podri keela! Unnoda vaalkaiye naan alichuruvan, sonna kelu.
@shot close dhanasree
@shot push dhanasree
DHANASREE: My life was ruined long ago.
  ta: Yen vaazhka yeppavo alinjupochu.
@scene gen:warehouse
@cast guy@0.54<^ dhanasree=little_dhana@0.38> vijaya@0.66<
@prop crate@0.84^ crate@0.9^ crate@0.14^
@caption Years ago
  ta: Pala varushathukku munnaadi
@shot memory
@music none
@shot pan right
NARRATOR: A warehouse, late at night, years ago. Thirteen-year-old Dhanasree, brought in by her mother's men, playing along with her father's plan. Her mother smiles at her.
  ta: Pala varushathukku munnaadi, nadu raathiri, oru godown. Padhimoonu vayasu Dhanasree, amma aalungalaala kondu varappattu, appa-voda plan-padi nadikkura. Amma aval-a paathu sirikkuraa.
@shot close vijaya
VIJAYA: You're a lucky girl, Dhanasree.
  ta: Nee oru adhirstamana ponnu, Dhanasree.
@shot close dhanasree
DHANASREE (scared): Amma, why? Why are you doing all this?
  ta: Amma, yen? Yen idhellam pandreenga?
@shot push vijaya
VIJAYA (happy): For what I need, Dhana. One day you'll understand. This world is cruel. We have to be crueller than it to live.
  ta: Yennoda thevaikaga naan pandren, Dhana. Oru naal unakkey puriyum. Indha ulagam koduramanadhu, namma adha-vida kodurama irundha-dhaan vaazha mudiyum.
@enter guy 0.54 0.46
@pose dhanasree point
@shot two dhanasree vijaya
NARRATOR: A man grabs her arm. She pulls out the gun and aims it at her mother.
  ta: Oru aal aval kaiya pudikkuraan. Aval thuppakkiya eduthu ammavai kurivaikkura.
DHANASREE (scared): I won't let you do this!!
  ta: Ungala ipdi naan panna vida maaten!!
@shot close vijaya
VIJAYA (happy): You can't shoot me. You don't even know how to hold that gun properly.
  ta: Unnala yenna suda mudiyadhu. Andha gun-ah yepdi olunga pudikanum-ney therila unaku.
@shot close dhanasree
NARRATOR: Her father's voice: "You can, Dhana. Don't be scared."
  ta: Appa kural: "Unnala mudiyum, Dhana. Bayapadadha."
@scene gen:campus_cloudy
@cast dhanasree@0.36>:point nithish@0.52<:kneel officer3@0.7<:point
@prop statue@0.24 lamp@0.86^
@music standoff
@shot two dhanasree officer3
OFFICER3: This is your last warning. Drop the gun.
  ta: Na unna kadasiya warn pandren. Gun-ah keela podu.
@shot slow
@shot close dhanasree
NARRATOR: For a moment everything goes quiet: the wind, the footsteps, all of it. She pulls the slide back the way her father showed her, and presses the trigger.
  ta: Oru nodi ellam amaidhi: kaathu, kaaladi saththam, ellamey. Appa sollikoduththa maari slide-a pinnaadi izhuththu, trigger-a azhuththuraa.
@fx bang
@scene gen:warehouse
@cast dhanasree=little_dhana@0.44>:point
@shot memory
@shot close dhanasree
NARRATOR: Years ago, in the warehouse, the same sound. "Dhana..." And a girl, frozen, the gun still in her hand. "Amma..."
  ta: Pala varushathukku munnaadi, godown-la, adhe saththam. "Dhana…" Uraindha oru ponnu, kaila innum thuppakki. "Amma…"
@scene gen:campus_cloudy
@cast dhanasree@0.36> nithish@0.52<:kneel officer3@0.7:ko
@prop statue@0.24 lamp@0.86^
@fx unblack
@shot wide
NARRATOR: The wind comes back. The officer is on the ground and doesn't move. Dhanasree lowers the gun, her hand shaking a little, her face still set.
  ta: Kaathu thirumba varudhu. Officer keezha, asaivillaama. Dhanasree thuppakkiya irakkura, kai konjam nadungudhu, mugam maaraama.
NITHISH (shocked): Dhanasree...
  ta: Dhanasree…
@pose nithish idle
@shot two dhanasree nithish
DHANASREE: Get up, Nithish. We don't have time. Come.
  ta: Yendhiri Nithish, namakku time illa. Va.
@clue officer3
@music tense
@sfx crowd
@enter ragul left 0.2
@enter dharshna left 0.28
@shot close ragul
RAGUL (scared): Dhanasree... you...
  ta: Dhanasree.. Nee..
@enter police right 0.9
@enter rajesh right 0.8
@shot shake
@shot wide
POLICE (angry): Everyone, hands up!
  ta: Ellarum kaiya mela thookunga!
DHANASREE: Nithish, hold Ragul's hand.
  ta: Nithish, Ragul kaiya pudi.
NITHISH: Why should I hold HIS hand?
  ta: Na yedhuku ivan kaiya pudikanum?
DHANASREE: Nithish. Trust me.
  ta: Nithish, yenna nambu.
@shot two nithish ragul
NARRATOR: She grabs his cuffed hands and forces one into Ragul's.
  ta: Avan vilangu kaiya pudichu, oru kaiya Ragul kaila thinikkura.
DHANASREE: Dharshna, hold Nithish's hand. Don't you trust me, Dharshna?
  ta: Dharshna, nee Nithish kaiya pudi. Yenna namburila Dharshna?
@shot wide
NARRATOR: Dharshna nods and takes his hand. Dhanasree takes the other.
  ta: Dharshna thalaiyaatti avan kaiya pudikkura. Dhanasree innoru kaiya.
RAGUL (scared): What are we doing, Dhanasree? Why is everyone holding Nithish's hand?
  ta: Yenna panna porom Dhanasree, yedhuku yellarum Nithish kaiya pudichirukom?
@shot orbit nithish
DHANASREE: Nithish. Snap your fingers.
  ta: Nithish, sodakku podu.
DHARSHNA (angry): Dhanasree, have you gone mad?!
  ta: Yenna Dhanasree unaku paithiyam pudichirucha?!
@shot close nithish
NITHISH (angry): This is no time to joke! YOU SAID EVERYTHING WOULD BE FINE ONCE YOU FOUND DHARSHNA!!
  ta: Veladradhuku idhu neram illa… NEEDHANA DHARSHNA KITTA POITA YELLA PRECHANAIYUM SERI AIDUM-NU SONNA!!
DHANASREE: Nithish, don't be angry. Just do what I say. Trust me.
  ta: Nithish, kova padadha, na sonnadha mattum sei. Yenna nambu Nithish.
NITHISH (sad): What's snapping my fingers going to do?! The little hope I had left of living is gone...
  ta: Sodakku podradhu-naala yenna aira podhu?! Vaazha irundha konja nambikkaiyum pochu….
@shot memory
@shot close nithish
JANANI: Trusting someone is good. Only blind trust is wrong.
  ta: Oruthara namburadhu, nalladhu dhaan. Kanmoodi-thanama namburadhu-dhaan thappu.
@shot present
@shot on rajesh
RAJESH (shouting): Everyone, hands up and on your knees!
  ta: Yellarum, kaiya thooki mutti podunga!
@shot close nithish
@shot dutch
NITHISH (angry): HYYYYAAAAAH!
  ta: HYYYYAAAAAH!
@fx snap
@shot level
@shot slow
@shot wide
NARRATOR: As the three of them hold his cuffed hands, Nithish snaps his fingers. A flash of crimson bursts from his hand and swallows him whole, then spills outward in jagged streaks of light.
  ta: Moonu perum avan vilangu kaiya pudichirukka, Nithish sodakku podraan. Avan kaila irundhu oru sivappu minnal vedichu avana muzhusaa vizhungi, kooraana velicha kodugalaa veliya sidharudhu.
@scene gen:campus_cloudy
@cast rajesh@0.62< police@0.78<^ constable=police@0.86<^
@prop statue@0.24 lamp@0.86^
@shot close rajesh
NARRATOR: The policemen freeze, their guns forgotten. Rajesh blinks, trying to understand what he just saw. But they are gone. Gone from the street. Gone from the world they had known.
  ta: Police-ellam uraiyuraanga, thuppakki marandhu. Rajesh kann imaikkiraar, paathadha purinjukka. Aana avanga illa. Theruvula illa. Avangalukku therinja ulagathulaye illa.
@fx fade_out
@scene frozen_pond
@cast ragul@0.5>:ko
@caption Somewhere white
  ta: Engo vellaiyaa
@shot orbit ragul
@music lullaby
@fx fade_in
NARRATOR: Snow. Endless, silent snow. And a boy, asleep on a white plain.
  ta: Pani. Mudivillaadha, sathamillaadha pani. Oru vella samaveliyil thoongura oru paiyan.
NARRATOR: End of Purpose 1. To be continued.
  ta: Purpose 1 mudivu. Thodarum.
@set nithish_cuffed = false
@credits
@end
