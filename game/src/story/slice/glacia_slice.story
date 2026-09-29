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
@objective Head east (right), past the frozen pond, towards the glitter in the trees.
  ta: Urainja kulathai thaandi, kizhakku (valadhu) pakkam, marangalukulla minnura idathukku po.
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
@objective Follow the Winter Path east with Dhanasree.
  ta: Dhanasree kooda Winter Path vazhiya kizhakku po.
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
@objective Keep going east. Something warm is lying on the raised bank.
  ta: Innum kizhakku po. Andha mettu mela edho soodaa kedakkudhu.
@end

@label feather
NARRATOR: A single feather, longer than your arm, rests on the snow. It is still warm.
  ta: Un kaiya vida neelamaana oru irage pani mela kedakkudhu. Innum soodaa irukku.
@give acanus_feather
@set slice_feather_taken
NARRATOR: Holding it, the air feels soft enough to rest on. Hold jump while falling to glide.
  ta: Idha pidichaa, kaaththu mela saanjukalam pola irukku. Keela vizhumbodhu jump-a pidichaa mithakkalam.
@objective Glide up to the chest on the high ledge ahead, then follow the path to its end.
  ta: Munnaadi uyarama irukura ledge-la irukura pettikku mithandhu po, aprom path mudiyura varaikum po.
@end

@label chest
DHANASREE: Pluffine wool. Wear it. Glacia's cold bites harder the further in we go.
  ta: Pluffine wool. Pottuko. Ulla poga poga Glacia kulir innum kadikkum.
NARRATOR: Keepsakes like this are worn from the menu: open it, choose Party, then pick who wears it.
  ta: Indha maadhiri keepsake-a menu-la podalaam: menu thira, Party edu, yaaru pottukanum-nu thernthedu.
@if slice_done -> chest_after
@objective Follow the path to its end (far right).
  ta: Path mudiyura varaikum po (romba valadhu pakkam).
@end
@label chest_after
@end

@label ending
@set slice_done
@done
NARRATOR: The path ends at the edge of the trees. Beyond it lies the rest of Glacia, and it hasn't been built yet.
  ta: Marangal mudiyura idathula path mudiyudhu. Adhukku apram meedhi Glacia, adhu innum kattala.
NARRATOR: This is the end of the Glacia test area. The story itself starts from New game on the title screen, with Act I.
  ta: Idhodu Glacia test area mudinjudhu. Kadhai title screen-la New game-la, Act I-la irundhu aarambikkudhu.
@choice slice_end
  - Roll the credits -> slice_credits
    ta: Credits paakalaam
  - Keep exploring -> slice_explore
    ta: Innum konjam sutthi paakren
@label slice_credits
@credits
@label slice_explore
@objective Explore as you like. The feather reaches the high ledge back on the Frozen Shore. Quit to the title from the menu when you're done.
  ta: Unga ishtam pola sutthunga. Feather irundhaa Frozen Shore-la irukura uyarama ledge-ku pogalaam. Mudinjadhum menu-la irundhu title-ku pogalaam.
@end

@label dream
@codex glowing_ball
@fx migraine
RAGUL (pained): That dream again... the glowing ball... ugh, my head.
  ta: Andha kanavu thirumba... minnura urundai... aah, thalai.
@end
