# Act I, Venture 11: "Stronger than you think". 3 October 2022.
# Playable: behind the bin (choice: stay / go to the police; he goes); the chase (Ragul fleeing Nithish);
# Dhanasree at the restroom door. Word battle: talk Dharshna out.
# Cinematic: the fire engine, the jeep, Ramanan collapses (implied), the standoff begins.
# Content: suicidal words ("just kill me"): content note first.

@label start
@venture 1 11
@title Stronger than you think
  ta: Nee nenaikuradha vida strong
@time 3 October 2022, afternoon
@warn This chapter includes suicidal thoughts. If you are struggling, Tele-MANAS is free on 14416 in India, any time.
  ta: Indha chapter-la thatkolai ennangal irukku. Kashtama irundhaa, India-la Tele-MANAS 14416, ilavasam, eppo venaalum.
@set hostel_fire
@set mit_cloudy
@set nithish_cuffed
@set truth_known
@party dhanasree ragul
@give handgun
@card
@save start
@scene gen:campus_cloudy
@cast arun@0.42>:phone
@caption Campus, 3 October, afternoon
  ta: Campus, 3 October, madhiyaanam
@music fire
@shot close arun
ARUN: Dharshna isn't in the hostel, Dhana. I went in. There's a fire in the girls' NRI hostel. Her phone's off.
  ta: Inga girls NRI hostel-la thee pudichiruchu. Na ulla poi paathen, aana Dharshna hostel-la illa. Call panna phone switched off-nu varudhu.
@scene gen:train
@cast ragul@0.36>^ dhanasree@0.56>:phone
@caption Suburban train
  ta: Suburban train
@shot close dhanasree
DHANASREE (thinking): Dharshna... where have you gone?! ...Arun, keep looking. I'm nearly at the station.
  ta: Dharshna… Yenga poi tholanja?! Arun, nee ava yenga irukan-nu paathutu iru. Nan station vantan.
@sfx siren
@scene gen:campus_cloudy
@cast rajesh@0.44> nithish@0.58>
@prop firetruck@0.2^ jeep@0.52^
@caption MIT road
  ta: MIT road
@shot pan right
NARRATOR: A fire engine races up the MIT road, siren wailing. On the highway, Rajesh's jeep turns toward the college, Nithish cuffed in the back.
  ta: Oru fire engine siren-oda MIT road-la varudhu. Highway-la Rajesh jeep college pakkam thirumbudhu; pinnaadi vilangoda Nithish.
@shot close nithish
NITHISH (thinking): The NRI hostel... nothing can happen to Dharshna. No. This is my fault. If I'd listened to Dhanasree from the start, they wouldn't have caught me. But I can't just rely on her now. How do I get away from these people?
  ta: NRI hostel-laya, Dharshna-ku yedhuvum airuka koodadhu. Illa. Idhu yennoda thappu-dhaan, naa modhala Dhanasree sonnadha ketu irundhurundha, police yenna pudichiruka maatanga. Dhanasree-ah mattum nambi yennala iruka mudiyadhu. Ippo eppadi ivunga kitta irundhu thappikuradhu…?
@scene gen:campus_cloudy
@prop gate@0.2^
@caption The back gate
  ta: Back gate
@enter dhanasree left 0.5
@enter ragul left 0.38
@shot wide
NARRATOR: Dhanasree and Ragul run in through the back gate. The guard shouts after them; a phone call distracts him. Ragul sees the flames in the distance, and his fear turns into excitement.
  ta: Dhanasree-um Ragul-um back gate vazhiya odi varaanga. Security kathuraar; oru call vandhu thirumbaraar. Dhoorathula neruppa paatha Ragul-ku bayam utchaagamaa maarudhu.
@shot close ragul
RAGUL (thinking): I feel like something big is going to happen today.
  ta: Innaiku yennamo perusa nadaka pogudhu-nu thonudhu.
@scene none
@set v11_gate
@room hostel_road gate gate

@label gate
@fx fade_in
@music tense
@shot on nithish_jeep
NARRATOR: A police jeep pulls up at the hostel gate. Nithish is inside, cuffed.
  ta: Hostel gate-la oru police jeep nikkudhu. Ulla vilangoda Nithish.
DHANASREE: Rahul, come! Behind the bin!
  ta: Rahul, va.
@objective Hide behind the bin.
  ta: Kuppa thotti pinnaadi olinjiko.
@end

@label bin
@done
@shot on nithish_jeep
RAJESH: You watch him. I'll go and see what's happening.
  ta: Yov, nee ivana paathuko. Naa poi yenna-nu paathutu varan.
DHANASREE: Nithish is in there!
  ta: Nithish ulla-dhaan irukan!
@shot close ragul
NARRATOR: Ragul's phone vibrates in his pocket. Ramanan. Dhanasree doesn't notice.
  ta: Ragul pocket-la phone adirudhu. Ramanan. Dhanasree gavanikkala.
RAGUL (thinking): If I don't answer, he'll suspect me. If I do, she'll suspect me. What do I do...
  ta: Phone attend pannama irundha yen-mela avaruku sandhegam vandhurum. Attend panni pesuna… Dhanasree ku yen mela sandhegam varum… Yenna pandradhu…
@shot slow
NARRATOR: "Don't be scared. Even if I die, I'll save you." And: "If you help a murderer, we'll arrest you too."
  ta: "Bayapadadha. Na sethavadhu, unna kaapathiruvan." Aprom: "Kolayali-ku udhavi pannuna-nu unnayum sethu arrest panniduvom."
@choice v11_bin
  - Stay hidden with Dhanasree -> stay
    ta: Dhanasree kooda olinjirundhu iru
  - Go out to the police -> go
    ta: Police kitta po
@label stay
@set v11_stayed
RAGUL (thinking): Stay. Just stay here, like she said...
  ta: Iru. Ava sonna maari inga-ye iru…
RAGUL (thinking): ...But I can't fully trust her. I don't know what she knows, or why she's doing all this. She won't tell me even if I ask.
  ta: …Aana Dhanasree-ah yennala innum mulusa namba mudiyadhu. Avaluku yenna-yellam theriyum, yen idhellam pandra, apdi-nu yedhuvum yenakku theriyadhu. Ketalum solla maata.
@goto go_out
@label go
RAGUL (thinking): I can't fully trust Dhanasree. I don't know what she knows, or why she's doing all this.
  ta: Dhanasree-ah yennala innum mulusa namba mudiyadhu. Avaluku yenna-yellam theriyum, yen idhellam pandra, apdi-nu yedhuvum yenakku theriyadhu.
@label go_out
@shot normal
@shot close ragul
RAGUL (thinking): Being a witness against Nithish is my best option now.
  ta: Adhanala Nithish-ku yedhura saachi solradhu-dhaan ippo yenaku irukura best option.
@set v11_went_out
DHANASREE (angry): Where are you going?! Dei!
  ta: Yenga pora?! Deii!
RAMANAN: What are you doing coming from over there?
  ta: Yennada inga irundhu vara?
RAGUL: I saw something on the ground, sir, like a coin. Just paper.
  ta: Keela yennamo paathen sir coin maari, paatha verum paper.
RAMANAN: Fine. Come and sit in the jeep. Whatever you told us, you'll say it properly in court, won't you?
  ta: Seri, va vandhu vandeela yeru. Yenga kitta yenna sonniyo adhellam correct-ah court-la solliruvala?
@shot close player
DHANASREE (thinking): What's happening? Why is Ragul getting into the jeep? Why is he talking to Ramanan...? I don't understand...
  ta: Yenna nadakudhu? Ragul yen jeep-la yeri okkaranum… Yenakku purila? Yen Ragul Ramanan kuda pesitu irukan…
NITHISH (angry): Dei, Ragul!
  ta: Dei Ragul!
RAMANAN (angry): Sit quietly!
  ta: Amaidhiya okkaru!
@shot on nithish_jeep
NARRATOR: Ragul doesn't even glance at Nithish. He takes Ramanan's hands in his.
  ta: Ragul Nithish pakkam kooda paakala. Ramanan kaiya than kaila pudikkuraan.
RAGUL (scared): Please, sir. Protect me from him, somehow.
  ta: Yenna yepdi-aavadhu ivan kitta irundhu kaapathirunga sir.
@fx migraine
NITHISH: Sir, I need to talk to him. One minute, sir. Just one minute.
  ta: Sir, na avan kitta konjam pesanum. Oru nimisham sir… Orey oru nimisham.
RAMANAN: Sit quietly, or I'll make you. Sir—
  ta: Amaidhiya okkariya, illa okkara vekkuta. Sir…
@sfx hurt
@shot slow
@shot on ramanan_down
NARRATOR: Mid-sentence, Ramanan drops to the ground, unconscious. Nithish freezes. Then he opens the jeep door.
  ta: Pesikittey Ramanan mayangi keezha vizhuraar. Nithish uraiyuraan. Aprom jeep kadhava thorakkuraan.
@set v11_ramanan_down
@clue ramanan
@shot normal
@shot on nithish_jeep
NITHISH (angry): Dei, Ragul! What did you tell the police about me?
  ta: Dei Ragul! Yenna pathi police kitta yenna sonna?
RAGUL (scared): Sorry, da, Nithish.
  ta: Sorry da, Nithish.
NITHISH (angry): TELL ME! What did you say?
  ta: Sollu! Yenna sonna?
RAJESH (angry): Dei! Why are you out of the jeep?!
  ta: Dei! Jeep-ah vittu yedhuku veliya vandha?!
@shot shake
NARRATOR: Nithish lunges for Ragul's neck with his cuffed hands. Ragul twists away and runs.
  ta: Nithish vilangu kaiyaala Ragul kazhutha pudikka paayraan. Ragul thappi odraan.
@set v11_chase
@music chase
@objective Run from Nithish!
  ta: Nithish kitta irundhu odu!
@end

@label meanwhile
@done
@fx fade_out
@party dhanasree
@set v11_find_dharshna
@room humanities entrance find

@label find
@fx fade_in
@music sorrow
DHANASREE (thinking): Dharshna... she has to be there!
  ta: Dharshna… ava anga-dhaan irukanum!
@shot pan right
NARRATOR: The old, quiet building opposite Hangar 1: the Department of Applied Science and Humanities. Somewhere inside, someone is crying softly.
  ta: Hangar 1-ku edhira irukura pazhaya amaidhiyaana katti-dam: Department of Applied Science and Humanities. Ulla engo yaaro mella azhura saththam.
@objective Find Dharshna.
  ta: Dharshna-va kandupudi.
@end

@label restroom
@done
@sfx knock
@wordbattle restroom
NARRATOR: Dharshna stands in the doorway, eyes swollen, face pale.
  ta: Kann veengi, mugam veluthu, Dharshna vaasal-la nikkuraa.
DHARSHNA: I'm scared I'll hurt you.
  ta: Na unna hurt panniduvan-nu yenaku bayama iruku.
DHANASREE: Nothing will happen.
  ta: Onnu aagadhu.
@shot close player
NARRATOR: Without a word Dharshna steps forward, and Dhanasree pulls her into a tight hug. Dharshna trembles in her arms. Dhanasree holds on.
  ta: Oru vaarthai illaama Dharshna munnaadi varaa, Dhanasree avala irukki anaichukkura. Dharshna aval kaila nadungura. Dhanasree vidala.
DHANASREE: I'm here. We'll solve this together.
  ta: Na irukan. Namma sendhu indha prechaniaiya theepom.
DHARSHNA (sad): Thanks, Dhanasree. I was so scared something would happen to me.
  ta: Thanks Dhanasree. Na romba bayandhutan, yenakku yedhavadhu aidumo-nu.
DHANASREE: Don't be scared. Even if I die, I'll save you. Now just do what I say. I'll explain everything later.
  ta: Bayapadadha, unaku onnum aagadhu. Na sethavadhu, unna kaapathiruven. Ippo na solradha maatum sei. Na yellam unaku aprom explain pandren.
@set v11_door_open
@codex p01_stronger
DHANASREE: Arun, I found Dharshna. Are there police near the library? No? Then go back to the hostel. If they see you here, they'll suspect you.
  ta: Arun, Dharshna-va na kandupudichitan. Anga police yaaradhu irukangala? Illa? Ok, nee hostel poidu. Inga irundha police-ku un mela sandhegam varum.
NARRATOR: They slip out and take the narrow path by Hangar 1, a shortcut. On the other side, Dhanasree spots Ragul running, Nithish right behind him, Rajesh behind them both.
  ta: Rendu perum nazhuvi Hangar 1 pakkathu kurukku vazhiya odaraanga. Marupakkam, Ragul odradha Dhanasree paakura; pinnaadiye Nithish, avangala thaandi Rajesh.
DHANASREE (angry): Ugh!
  ta: Ugh!
@fx fade_out
@party ragul
@room cut_road chase_in chase2

@label chase2
@fx fade_in
@music chase
@objective Keep running!
  ta: Oditey iru!
@end

@label trips
@set v11_done
@done
@music none
RAJESH (shouting): Nithish, STOP!
  ta: Nithish, nillu!
@sfx hurt
@shot slow
@shot on nithish_down
NARRATOR: The spot where the first body lay. Nithish trips on a stone and falls hard. Ragul stops and turns.
  ta: Modhal body kedandha adhe idam. Nithish oru kallula thadukki balama vizhuraan. Ragul nindhu thirumbaraan.
@shot normal
@shot on dhanasree_gun
@shot dutch
NARRATOR: Rajesh is almost on him. And then Dhanasree is there. She draws a gun and points it straight at her father.
  ta: Rajesh kittathatta avana pudikka poraar. Appo Dhanasree vandhuttaa. Oru thuppakkiya eduthu nerya avanga appa-va kurivaikkura.
@fx shake
@shot level
@shot close rajesh_standoff
NARRATOR: Rajesh freezes. He can't believe what he's seeing.
  ta: Rajesh uraiyuraar. Kannaala paakuradha nambave mudiyala.
@fx fade_out
@next p01/v12
@end
