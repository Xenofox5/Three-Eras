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
- [ ] **Elphi rework.** Shields slightly down, light sword emphasised. Give him a second life:
  he returns weaker with lower HP but more determined and stronger offensively. He currently
  dominates shields and is generally a bit too strong.
- [ ] **Vasco rework.** The Vessel should either trigger below a HP threshold or switch back
  and forth, and each ego gets its own set of moves rather than the same moves behaving
  differently. Both egos must be useful on their own. Mimicry must stay capped so copying a
  boss move gives a balanced version.
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
- [ ] **Kingsley.** Slight buff. One more random trinket, so five.
- [ ] **The Chosen.** Slightly too tanky.
- [ ] **Angus.** Cycling Unbreakable makes him effectively immortal (seen in a 5v1). Nerf the
  cycle, buff his offence slightly to compensate.
- [x] **David buffed** in v0.4.4: guarding cuts 50% of damage instead of 40%, and every hit he
  intercepts heals him 3% of his max HP, so the reward grows with how much he now catches.
  Originally: asked for directly on 2026-10-07, and the v0.4.1 Guard fix
  argues for it: his guard now catches fourteen single-target skills that used to walk past it, so
  he soaks far more than he did while his composite barely moved (48.7). He is doing more work for
  the same result. Buff his own survivability or his payoff for guarding, not his damage, since the
  guard is the point of him.
- [ ] **Danielle.** Riposte chance is too high.
- [ ] **Alfred.** Verify the tempo multipliers do what the descriptions say, and make the three
  tempos feel more distinct from each other.
- [x] **Lachlan.** Max HP 1400 to 1290 in v0.4.4. Composite 55.1 to 48.3, duel 93 to 85. Still the
  top duellist, so group E still points at him.
- [ ] **Malakai.** Buff Living Bargain, rework the skill, and rework the passive so he plays less
  monotonously. Composite 46.1, near the bottom.
- [x] **Harry.** Crush 150% to 135% ATK in v0.4.4, Force build 220% to 200%. Composite 63.6 to
  59.2, so he is inside the band for the first time. The Force build text also quoted a 175%
  baseline that was never true.
- [ ] **Low win rate heroes.** Current composites after v0.4.4: Alfred 37.8, Ben 39.5, Yousuf 41.7.
  These are now the only three outside the 45 to 60 band and all three want a rework, not a nudged
  number. Older v0.3.8 figures for reference: Ben 35.1, Yousuf 32.5 in 3v3, Alfred 39.5,
  Leo 39.8, Aamay 39.8, Flynn 40.4. Buff or rework rather than nudging one number.

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
- [ ] **Three hiding mechanics would now overlap.** Seraphine cannot be targeted while an ally
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
