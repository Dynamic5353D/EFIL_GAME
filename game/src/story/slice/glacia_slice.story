# M1 engine test slice. Not canon: it borrows Ventures 13-16 to exercise the engine
# (dialogue, choices, flags, battles, codex, abilities). Act II proper is built in M3.

@label intro
@venture 2 15
@title Engine test: into the snow
  ta: Engine test: paniyukkul
@time Blue-1020, festival morning
@warn This slice contains violence and dark themes.
  ta: Indha slice-la vanmuraiyum iruntha vishayangalum irukku.
@card
@music glacia
NARRATOR: Snow. Endless, silent snow, and a boy lying face down in it.
  ta: Pani. Mudivillaadha, sathamillaadha pani. Adhula oru paiyan kavundhu kedakkaan.
RAGUL (groggy): Where... where am I?
  ta: Naa... naa yenga iruken?
@fx slap
RAGUL: Ow! Not a dream. Definitely not a dream.
  ta: Aah! Kanavu illa. Kandippa kanavu illa.
RAGUL (thinking): Nithish snapped his fingers. A red flash. And then... this.
  ta: Nithish viral sodakkunaan. Oru sivappu flash. Aprom... idhu.
RAGUL (thinking): Did I time-travel? Is this some isekai?
  ta: Time travel pannitena? Idhu enna isekai-ah?
NARRATOR: Beyond the frozen pond, something glitters in the trees.
  ta: Andha urainja kulathukku apram, marangalukulla edho minnudhu.
@set slice_intro_done
@end

@label tree
NARRATOR: A Rosoar tree, heavy with small red fruit. Its glow feels like a hearth.
  ta: Chinna sivappu pazhangal thongura oru Rosoar maram. Adhoda velicham oru adupu maari soodaa irukku.
RAGUL: If I sit here for a bit... my head doesn't hurt as much.
  ta: Inga konja neram ukkandha... thalavali konjam kammiya irukku.
@end

@label dhanasree
@music winter_path
DHANASREE (shouting): Rahul!
  ta: Rahul!
RAGUL (confused): Dhanasree... what is this place? Did you already know a place like this existed?
  ta: Dhanasree... Yenna yedam idhu? Ipdi-oru yedam irukku-nu unaku yerkanavey theriyuma?
DHANASREE: I know. This planet is called Glacia.
  ta: Theriyum. Indha planet peru Glacia.
RAGUL (shocked): A planet? So this isn't Earth?!
  ta: Planet-ah? Appo idhu Boomi illaya?!
DHANASREE: No.
  ta: Illa.
RAGUL (shocked): Then... are you an alien?!
  ta: Appo nee Alien-ah?!
DHANASREE (annoyed): Idiot, I've been in college with you for three months.
  ta: Dei mundam, un-kooda dhana moonu maasam-ah college padichitu irukan.
@codex glacia
DHANASREE: Nobody here knows fighting, grief or stress. They have a Magic Guard. Nothing from outside can hurt them.
  ta: Inga irukavangaluku sanda, sogam, stress yedhuvumey theriyadhu. Avunga kitta "Magic Guard" iruku. Veliya irundhu yenna adi vilundhalum onnum aagadhu.
DHANASREE (serious): But the things that crawled out of the Cascades don't belong here. They have no guard, and they don't play fair.
  ta: Aana Cascades-la irundhu vandha andha jandhukkal inga oda illa. Avangaluku guard-um illa, nyayamum illa.
@choice home
  - How do we get home? -> ask_home
    ta: Veetuku yepdi poradhu?
  - Why didn't you tell me any of this before? -> ask_why
    ta: Idhellam munnadiye yen sollala?
@label ask_home
@set slice_asked_about_home
DHANASREE: Not yet. First we survive today. Stay close.
  ta: Ippo illa. Modhalla indha naal-a thaandanum. Pakkathulaye iru.
@rel ragul dhanasree 1
@goto join
@label ask_why
DHANASREE: I have my reasons. Trust me, for now.
  ta: Munnadiye solladhadhuku yenkitta reason iruku. Ippothaiku yenna nambu.
RAGUL (thinking): "Trust me." That's all she ever says.
  ta: "Yenna nambu." Eppavum idhe dhaan solluva.
@goto join
@label join
@join dhanasree 3
@set slice_met_dhanasree
NARRATOR: Dhanasree joins you. Her staff hums with a faint green light.
  ta: Dhanasree ungaloda serndhaa. Aval kambu mella pachai velichathula adhirudhu.
@end

@label pack
@music tense
NARRATOR: Ink-black vines peel away from the trees. Burning blue eyes open, one pair after another.
  ta: Marangal mela irundhu mai maari karuppu kodigal pirinji varudhu. Neela kangal ondrondraa thirakkudhu.
DHANASREE: Vales. Ordinary hits only splash them into ink. Light, fire or a shattering blow ends them. Otherwise they get back up.
  ta: Vales. Saadharana adi-la ink-ah sidharum, thirumba ezhundhurum. Velicham, neruppu, illa norukkura adi dhaan mudikkum.
DHANASREE (serious): Rahul, your touch works on them too. Just... don't let it go to your head.
  ta: Rahul, un thodal-um avanga mela velai seiyyum. Aana... thalaikku yethikaadha.
@battle vale_pack
@set slice_vale_pack_defeated
@codex vales
RAGUL (panting): They just... kept... coming back.
  ta: Thirumba... thirumba... vandhutte irundhanga.
DHANASREE: That's Glacia's gift to us. Pain that nobody else here can feel.
  ta: Glacia namakku kudukura gift adhu. Inga vera yaarukkum theriyadha vali.
@music winter_path
@end

@label feather
NARRATOR: A single feather, longer than your arm, rests on the snow. It is still warm.
  ta: Un kaiya vida neelamaana oru irage pani mela kedakkudhu. Innum soodaa irukku.
@give acanus_feather
@set slice_feather_taken
NARRATOR: Holding it, the air feels soft enough to rest on. Hold jump while falling to glide.
  ta: Idha pidichaa, kaaththu mela saanjukalam pola irukku. Keela vizhumbodhu jump-a pidichaa mithakkalam.
@end

@label dream
@codex glowing_ball
@fx migraine
RAGUL (pained): That dream again... the glowing ball... ugh, my head.
  ta: Andha kanavu thirumba... minnura urundai... aah, thalai.
@end
