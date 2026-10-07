# Backlog

Owner's notes of 2026-10-06, organised. Tick items off as they ship and record the version.
Nothing here is a balance number yet: every item in group D needs `npm run balance` after it.

## A. Foundation (do first, everything else depends on it)

- [x] **The 1v1 matrix sampled every matchup twice.** `tools/pvp_tail.js` looped over ordered
  pairs, so `M[a][b]` and `M[b][a]` were two independent estimates of the same matchup and
  disagreed by up to 29 points. Each unordered pair is now played once and the mirror cell is
  its complement, which also halves the duel runtime. (v0.4.0)
- [x] **`duelN` was hardcoded to 32** in `tools/gen_simstats.js` while `balance.sh` ran 12 per
  side (24 fights). The Stats screen now reports the real number. (v0.4.0)
- [x] **Desktop layout.** Portraits took their height from the arena's vertical budget and
  their width from the card, so a short desktop window stretched them flat: 168x66 on a laptop
  with a taskbar, 168x50 on a short window. Cards are now capped at the square size, the enemy
  row gets its own size so four or five foes are not tall and thin, and on a wide window the
  action panel sits beside the arena instead of under it. The title screen also clipped its
  bottom with no way to scroll, which is what forced zooming out. (v0.4.0)
- [x] **Dev unlock.** Five taps on the version tag under the logo toggles dev mode, or add
  `?dev` to the address. Every hero and stage opens; stars and records are untouched. The tag
  turns gold and reads "dev" while it is on. (v0.4.0)

## B. Bugs (done in v0.4.1)

- [x] **Vasco's mimicry.** It guessed a flat 100/140/180% from which slot the move came out of
  rather than reading the real multiplier, and it threw away any status the original carried.
  It now records the largest multiplier the action actually used and the effect it applied.
  Still improvises if nothing has been seen yet, which is by design. (v0.4.1)
- [x] **David's Guard.** The redirect lived only in `strike()`, so the fourteen single-target
  skills that call `resolveHit` directly walked past it: Crush, Phantom Switch, Finger Frame,
  Sanctum Blade, Judgement of Wings, Seal in Ink, Cinderbead, Orbit, Mimicry, Fire Beam and
  more. The redirect moved into `resolveHit`, so every single-target hit respects it and area
  hits still ignore it. Covered by `npm run test:engine`. (v0.4.1)
- [x] **End-of-battle stats.** A creature is spliced out of its side when it dies, taking its
  damage dealt and soaked with it. Its contribution is now credited to whoever summoned it, on
  death and again at the end of the battle for survivors. Turn counts stay out, since those
  describe the owner's own turns. (v0.4.1)
- [x] **Yunze going semi-invisible** is the Afterimage buff, which makes the next attack on him
  miss completely. It was a status badge and nothing else, so it read as a glitch. The card now
  fades and takes a dashed border, the same language as the Afterimage enemies in the Shadows
  stage, which are the same idea. (v0.4.1)
- [x] **Soham's yellow shield** was already separate, and it is confirmed on screen: gold diagonal
  stripes with a `+388⬡` readout, against blue stripes and `+205🛡` for an ordinary shield. No change needed.

## C. Clarity (mostly done in v0.4.3)

- [x] **Description audit.** (partly, v0.4.3) Concision and precision across abilities, passives, builds and
  statuses. Stop merging separate effects into one sentence. Keep flavour, never at the cost
  of the reader knowing the numbers.
- [x] **Every effect must be stated.** Now enforced by `npm run check:desc`, which reads the KIT source and each summoned creature and fails if a status is applied that no description names. 45/45 clean. (v0.4.3) Example found: Trigg's basic applies Burn through its
  imps but no description says so.
- [x] **Builds must show what they change.** The hero sheet draws its stat block with the equipped build applied and marks what moved, and each build lists its stat changes as chips. (v0.4.3) Selecting a build should show the changed stats
  and ability numbers in the hero's info, not just prose.
- [x] **Kingsley.** Says a second Song refreshes the first rather than adding another. (v0.4.3) Trinket count and animation stay in group D. Originally: say plainly that his basic's Song caps at 2 stacks, and what each trinket does.
- [x] **Seraphine, wording.** Severance marks now say they do nothing until Halo Storm detonates them and that they cap at 5. (v0.4.3) Animations stay in group D. Originally: abilities and animations are confusing. Sever, Encircled and the Hidden
  Hand puppet all need to read clearly on the battle screen.
- [x] **Danielle, wording.** The passive now says a riposte only answers an attack that hits, so evasion and riposte never both happen, one per attack, never from area attacks. (v0.4.3) The chance nerf stays in group D. Originally: riposte and evasion interact and neither is explained. State the riposte
  chance, when it can trigger, and that it is once per incoming attack.
- [x] **The 1v1 grid.** The corner names both axes with arrows, every cell says in words who beat whom out of how many duels, and the text leads with a worked example. (v0.4.3) It cost the owner real trust: a cell was read in the
  wrong direction. Label the axes on the grid itself and stop presenting 0% and 100% from a
  couple of dozen fights as certainties.

## D. Balance and reworks (each needs a `npm run balance` pass)

### Last Stand
- [x] **Last Stand removed entirely** in v0.4.4, status and all. It gave +35% damage and 15% less
  taken to the last hero standing and was pasted into ten passives, Ethan among them. Nothing
  replaces it: duel numbers get fixed per hero from now on.
- [x] **The boss question is answered by removing it.** It never reached monster bosses, but it did
  quietly apply to a hero boss fighting alone, which nothing in the game said. Gone with the rest.

### Named heroes
- [ ] **Ben.** Give the Order is abusable (a free extra turn plus ATK up plus ult charge).
  Nerf it. Compensate outside his damage if he ends up too weak.
- [x] **Elphi reworked** in v0.4.6. The first time he falls he rises with 45% of his max HP and
  keeps ATK +40% and +10% crit chance for the rest of the fight, once per battle. Sentinel brings
  him back at 60%, Dawnbreaker at 30%, so the builds now decide how much of him comes back.
  Lightblade 100% to 120% ATK; the Sanctum Blade shield 15% to 11% of his max HP and the Last
  Light shield 15% to 10%. Composite 55.4 to 56.0, so the shield cuts paid for the rest, and his
  duel rate went 34 to 50. He leans on the sword now instead of shielding everyone.
- [x] **Vasco reworked** in v0.4.8 and again in v0.4.9 after the owner said the first version was
  not what they meant. He has two kits, and **he** chooses which one by using Curtain Call, which
  is the switch and nothing else: he acts again at once, so it costs only the charge. HP decides
  nothing. The jester funds the team a Skill Point per basic; the Vessel hits far harder, drinks
  30% of its damage and earns the team nothing, so running dry is what sends him back.
  **This took seven balance runs.** Removing a 190% area ultimate and replacing it with a toggle
  cost him about 16 points, and getting it back needed the switch made free in tempo, the width
  moved into Gift of the Pit, and both kits raised. He ends at 46.2 against a starting 52.1.
- [x] **Aamay reworked** in v0.4.5. Everything asked for: Pages only come from enemy actions, which
  kills the Yunze pairing; the Chronicle holds 20 instead of 12 and gains 2 per fallen hero; each
  Page is worth 15% instead of 30%; the ultimate charges 40% slower; Seal in Ink drops to 55% ATK
  but now takes 30% SPD and 20% ATK for 3 turns; max HP 1300 to 1180 and ATK 124 to 110.
  **The basement passive is a bigger buff than it looks.** Dying was his defining weakness, at 74%
  of fights, and being overlooked cut that to about 50%, worth roughly 20 points of campaign win
  rate on its own. Four balance runs went 58.9, 60.9, 60.7 and 58.3 against a starting 50.6. It is
  tied to the Chronicle so it fades to nothing as he fills it, and the other nerfs offset the rest.
  He sits at 58.3, top of the band. If that is still too strong the passive has to give more ground,
  because the rest of him has little left to cut.
- [x] **Seraphine narrowed** in v0.4.4, keeping the idea and cutting two ways: a summoned creature
  no longer counts as cover, so only a living hero hides her, and a boss sees her regardless. Still
  needs to not overlap with the Aamay passive, which is still open below.
- [x] **Kingsley** in v0.4.15. A fifth item, the Loaded Dice, which pays the team 2 SP and gives
  everyone Crit Up. The item he pulled now shows above him instead of only tinting the screen.
  Tune 80% to 95%, Songs 6% to 7%. Composite 49.6 to 50.6.
- [x] **The Chosen** in v0.4.15. Grace gives 2% damage reduction per stack instead of 3%, so 22%
  at five stacks rather than 27%, and the dive mends 15% instead of 20%. Composite 55.4 to 51.9.
- [x] **Angus** in v0.4.15. Unbreakable leaves him Spent for 4 turns with no ultimate charge at
  all, which takes his invulnerable share of a fight from about half to about a quarter. Sword
  115% to 130% and the ultimate 145% to 160% pay for it: composite 51.4 to 51.7.
- [x] **David buffed** in v0.4.4: guarding cuts 50% of damage instead of 40%, and every hit he
  intercepts heals him 3% of his max HP, so the reward grows with how much he now catches.
  Originally: asked for directly on 2026-10-07, and the v0.4.1 Guard fix
  argues for it: his guard now catches fourteen single-target skills that used to walk past it, so
  he soaks far more than he did while his composite barely moved (48.7). He is doing more work for
  the same result. Buff his own survivability or his payoff for guarding, not his damage, since the
  guard is the point of him.
- [x] **Danielle** in v0.4.15. 45% to 32%, Bastion 30% to 22%, Duelist 70% to 52%, and each
  answer hits for 115% instead of 95% so the ones that land are worth watching.
- [x] **Alfred** in v0.4.15, without the rework he was told not to get. The tooltip claimed Grave
  hit for 140% when the engine has always used 130%, and ignored Wild Rhythm; Broken Rhythm cycled
  a Grave of 140% that exists nowhere else. Each tempo now has its own reason to want it: Allegro
  buys time, Andante cannot miss, Grave ignores 30% of the target DEF.
- [x] **Lachlan.** Max HP 1400 to 1290 in v0.4.4. Composite 55.1 to 48.3, duel 93 to 85. Still the
  top duellist, so group E still points at him.
- [x] **Malakai** in v0.4.15. The flask follows a fixed order with the next phial on a badge, and
  every third is on the house: it splashes every enemy and pays the team a Skill Point. The bargain
  sells the ally’s debuffs on to the strongest enemy, so it reads off the board instead of doing
  one thing. Flask 90% to 110%. Composite 48.0 to 53.6.
- [x] **Harry.** Crush 150% to 135% ATK in v0.4.4, Force build 220% to 200%. Composite 63.6 to
  59.2, so he is inside the band for the first time. The Force build text also quoted a 175%
  baseline that was never true.
- [ ] **Low win rate heroes.** Current composites after v0.4.4: Alfred 37.8, Ben 39.5, Yousuf 41.7.
  These are now the only three outside the 45 to 60 band and all three want a rework, not a nudged
  number. Older v0.3.8 figures for reference: Ben 35.1, Yousuf 32.5 in 3v3, Alfred 39.5,
  Leo 39.8, Aamay 39.8, Flynn 40.4. Buff or rework rather than nudging one number.


### Owner feedback on the reworks, handled in v0.4.7

- [x] **The Aamay hiding roll was unreadable.** A 30% chance to be overlooked showed nothing on
  screen, so there was no way to tell it had fired. Replaced with a plain cycle and a status that
  counts down on the card.
- [x] **The Last Page was confusing.** The description now works the numbers through, the badge
  shows Pages held out of the limit, and the status text gives the exact damage it would deal now.
  The live text had also been left quoting 30% a Page after the rework halved it to 15%.
- [x] **Hiding swapped between Aamay and Seraphine**, since Aamay is the more obscure of the two.
  He cannot be aimed at while another hero stands; she slips out of view one round in three.
- [x] **Elphi rose too easily.** Down to 30% max HP and ATK +30%, from 45% and +40%.

### Owner feedback handled in v0.4.9 and v0.4.10

- [x] **Vasco was not what was asked for.** Redone: the ultimate is the switch and nothing else,
  it costs no tempo, and the two kits want different things. Seven balance runs to land at 46.2.
- [x] **Out of Sight lasted far too long.** A status granted on a unit own turn survives that turn
  and only expires at the end of the next one, so Seraphine was untargetable for about two thirds
  of a fight instead of a third. Measured: 65% of turns before, 35% after.
- [x] **Out of Sight looked wrong**: near greyscale, which read as dead, under a tag saying Unseen.
  She now keeps her colour behind a pale veil and the tag says what the state is.
- [x] **Team bonuses are readable on a computer.** The active ones show what they do without being
  tapped, and sheets open centred instead of clinging to the bottom edge where they were cut off.
- [x] **Dates on every update**, exact from the repository where it exists and marked as estimates
  for the days before it. Development is taken to have started about 2 October 2026.
- [x] **A rework must check everything that names the hero.** Written into CLAUDE.md after the
  Vasco rework touched two team bonuses. `npm run test:engine` asserts both Vasco pairings.

### Owner feedback handled in v0.4.13

- [x] **Mimicry replaced.** It was unreadable: you could not tell what you were about to get. The
  jester deals a Wild Card for the team instead, one of five with a card that turns over on screen.
- [x] **Vessel damage cut hard**, as asked: 150% to 115% and 130% to 82%, ATK +35% to +15%. It gets
  the strength back as lifesteal, which is what it is for.
- [x] **The two faces are close.** 47.3% against 40.0% played on their own, from 34.2% and 53.3%.
- [x] **Encircled cuts around the enemy**, not from Seraphine.
- [x] **The HTML entity in the changelog** that showed as Vasco&rsquo;s is gone.
- [x] **Yousuf and Ben buffed** rather than reworked, as asked: Yousuf 41.0 to 47.5, Ben 38.9 to 45.5.
  Give the Order also took the nerf the owner originally asked for.
- [x] **Alfred left alone** on the owner's call. His composite reads low at 40.6 but his duel rate is
  81, near the top, so he is a duellist rather than an underpowered hero.

### Skill Point costs, v0.4.14

- [x] **Skills can cost 2 SP.** Two do: Harry Crush and Vasco Wild Card. Kept deliberately small.
- [x] **Everything reads the real cost** rather than assuming one, in the action bar and both sheets.
- [ ] **More 2 SP candidates, if wanted.** Seraphine Orbiting Blades and Elphi Radiant Arc are the
  next most plausible. Aamay was tried and reverted: his skill is the whole of what he does and he
  makes no points of his own, so the price took him from 60.0 to 39.8.

### Owner feedback handled in v0.4.16

- [x] **Lachlan was unkillable.** Shield cap 30% to 25%, regeneration 6% to 5%, Azure Blast 10% to
  8%, and Azure Nova gives half a wall back instead of filling it. Composite 51.3 to 45.6, duel 88
  to 69, falls 52 to 59. Group E below is partly answered by this: he is no longer the top duellist.
- [x] **The Vessel damage reduction removed**, as asked. Composite 53.0 to 49.6.
- [x] **Harry Crush 135% to 145%**, affordable now that it costs two Skill Points.
- [x] **Malakai flask 110% to 100%** and the free splash 55% to 45%.
- [x] **The King’s Trial fixed.** It was a sudden-death stalemate, not a damage problem: two
  support bosses at 2.6x HP dragged the fight past turn 150, where the rules turn on the heroes.
  100/90/97/97 now, from 100/13/27/0.
- [x] **Seraphine Severance and Hidden Hand animated.** The last two things on her that happened
  with nothing on screen. `npm run check:visual` counts what each one draws.
- [x] **Ben back into the band**, 42.7 with Sharp Word at 120%, measured again after the buff.

### Still open

- [ ] **Alfred sits at 39.5**, the only hero outside the 45 to 60 band, on the owner’s instruction
  that he needs no buff. His duel rate is 84, near the top, so he is a duellist rather than a weak
  hero. Revisit only if the owner asks.
- [ ] **Hexagon Wall, one team in four.** vehra/peguicha/yousuf wins 0% of 30 runs while the other
  three test teams win 100%, 100% and 93%. Diagnosed: the two archers deal 3241 of the damage and
  the team has no area damage to crack four hexshielded enemies in time. Dropping the stage ATK to
  1.85 only moves that team to 17% while trivialising it for everyone else, so it is a team
  composition wall rather than a tuning problem. Left alone deliberately.
## F. New heroes (this is what makes it v0.5.0)

Three new heroes, from the owner on 2026-10-07. Under the versioning rule this is the only kind
of work that moves the middle number, so these ship together as **v0.5.0**.

- [ ] **H. Benjamin** (pre-first era). An ancient skeletal wizard with necromancy, skulls floating
  around his hands. He predates every other figure in the record, and whatever he did to sustain
  himself is where the near-immortality of Harry and Yunze comes from.
- [ ] **Ephraim** (first era). A short berserker brawler: tough knuckles, high endurance, fights
  like a pitbull. Black hair, black eyes.
- [ ] **Isaac** (third era, which is `current` in the code). An invisibility user. A fast observer
  and messenger, and the source behind Aamay: Isaac watches, Aamay writes it down in the basement.
  Wild black hair, black eyes.

### Decisions these need before any code

- [ ] **Does "pre-first era" become a fourth era?** `ERA` has first, second, current and echo. A new
  era is not a small change: it feeds the era synergies (Old Blood wants three First Era heroes),
  the Heroes gallery grouping, the campaign headings, and the game is called Three Eras. The
  alternative is that H. Benjamin sits in the First Era as its oldest figure, with the lore doing
  the work instead of a new category. Owner decides.
- [ ] **Isaac still needs his own answer, but the other two are settled now.** Aamay cannot be aimed at while a hero stands; Seraphine slips out one round in three. Originally: three hiding mechanics would overlap. Seraphine cannot be targeted while an ally
  stands, Aamay is due a passive that makes him harder to target while allies live, and Isaac is an
  invisibility user. They need to be clearly different from each other or two of them will feel the
  same. Worth settling alongside the Seraphine nerf already in group D.

### What each new hero needs (so this is not underestimated)

Per hero: `HEROES` entry with stats, `look` and four descriptions; a `KIT` entry for basic, skill
and ult; `previewFor` cases for all three; an `aiChoose` case if the skill needs judgement; `FX`
entries and `HOOK` bindings for the animations; two builds; a portrait that reads as distinct from
the other 24; a campaign stage to unlock from, with `reward` wired into `UNLOCK_FROM`; a hero-boss
version if they appear as one; entries in `BIO`, and a balance pass afterwards. `npm run check:desc`
and `npm run check:dupes` must stay clean.

## E. Deferred by the owner

- [ ] **1v1 ordering.** Peguicha, Yunze and Harry should be the three best duellists; Lachlan
  (94.2), The Chosen (87.3) and Seraphine (84.2) currently sit above them. The owner said to
  ignore the big 1v1 problems for now, so this waits until group D settles.

## Measured facts worth keeping

- A full `npm run balance` takes **1m50s**, so balance iteration is cheap.
- Duels are the cheap part: the whole 1v1 matrix is about 2 seconds at the old sample size.
  The per-side sample is now 150 (300 fights per pair), which takes the error on a cell from
  roughly 10 points to 2.5 and still only costs about 30 seconds.
- Baseline composites from a fresh run on current source (campaign and 3v3 averaged), worst
  first: Alfred 38.7, Ben 40.6, Yousuf 42.3, Peguicha 43.6, Malakai 46.4, Leo 46.7, aamay 47.6,
  Seraphine 48.4, and at the top Harry 63.6, Yunze 58.0, Vehra 54.1, Elphi 54.0. Target is 45
  to 60, so Alfred, Ben, Yousuf and Peguicha are below it and Harry is above.

## Notes from checking the owner's tournament

Their 12 first-round duels were compared against the v0.3.8 matrix: the sim favoured the same
winner in 10 of 12, with two upsets at 29% and 8.3%. Ben beating Kingsley agreed with the
matrix, which gives Ben 100% against him. The matrix row is the winner, the column is the
loser. That cell was right; the sampling bug in group A was the real problem.
