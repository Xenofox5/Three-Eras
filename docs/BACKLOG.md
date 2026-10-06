# Backlog

Owner's notes of 2026-10-06, organised. Tick items off as they ship and record the version.
Nothing here is a balance number yet: every item in group D needs `npm run balance` after it.

## A. Foundation (do first, everything else depends on it)

- [x] **The 1v1 matrix sampled every matchup twice.** `tools/pvp_tail.js` looped over ordered
  pairs, so `M[a][b]` and `M[b][a]` were two independent estimates of the same matchup and
  disagreed by up to 29 points. Each unordered pair is now played once and the mirror cell is
  its complement, which also halves the duel runtime. (v0.93)
- [x] **`duelN` was hardcoded to 32** in `tools/gen_simstats.js` while `balance.sh` ran 12 per
  side (24 fights). The Stats screen now reports the real number. (v0.93)
- [x] **Desktop layout.** Portraits took their height from the arena's vertical budget and
  their width from the card, so a short desktop window stretched them flat: 168x66 on a laptop
  with a taskbar, 168x50 on a short window. Cards are now capped at the square size, the enemy
  row gets its own size so four or five foes are not tall and thin, and on a wide window the
  action panel sits beside the arena instead of under it. The title screen also clipped its
  bottom with no way to scroll, which is what forced zooming out. (v0.93)
- [x] **Dev unlock.** Five taps on the version tag under the logo toggles dev mode, or add
  `?dev` to the address. Every hero and stage opens; stars and records are untouched. The tag
  turns gold and reads "dev" while it is on. (v0.93)

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

## C. Clarity (no balance impact, safe to do in one pass)

- [ ] **Description audit.** Concision and precision across abilities, passives, builds and
  statuses. Stop merging separate effects into one sentence. Keep flavour, never at the cost
  of the reader knowing the numbers.
- [ ] **Every effect must be stated.** Example found: Trigg's basic applies Burn through its
  imps but no description says so.
- [ ] **Builds must show what they change.** Selecting a build should show the changed stats
  and ability numbers in the hero's info, not just prose.
- [ ] **Kingsley.** Say plainly that his basic's Song caps at 2 stacks, and what each trinket does.
- [ ] **Seraphine.** Abilities and animations are confusing. Sever, Encircled and the Hidden
  Hand puppet all need to read clearly on the battle screen.
- [ ] **Danielle.** Riposte and evasion interact and neither is explained. State the riposte
  chance, when it can trigger, and that it is once per incoming attack.
- [ ] **The 1v1 grid is easy to misread.** It cost the owner real trust: a cell was read in the
  wrong direction. Label the axes on the grid itself and stop presenting 0% and 100% from a
  couple of dozen fights as certainties.

## D. Balance and reworks (each needs a `npm run balance` pass)

### Last Stand
- [ ] **Remove Last Stand from hero passives.** It exists to prop up supports in 1v1 and it
  confuses everyone. Decide what replaces it, if anything.
- [ ] **Remove it from Ethan** specifically.
- [ ] **Decide what it means for bosses.** Currently `LAST_STAND` only lists hero ids, so a
  boss never gets it, but nothing says so.

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
- [ ] **Aamay rework.** Nerf ult frequency and Chronicle damage significantly, raise the max
  Chronicle stack. Seal in Ink: less damage, stronger debuffs. Passive: harder to target while
  allies are alive (he hides in his basement) and slightly lower HP. Gains something, for
  example a higher Chronicle cap, when a unit falls for good. Keep the Yunze pairing in check.
- [ ] **Seraphine.** Her version of "stays out of the fight and survives longer" (`unseen`) is
  a bit too strong. Keep most of it, tune it down, and make it not overlap with Aamay's new passive.
- [ ] **Kingsley.** Slight buff. One more random trinket, so five.
- [ ] **The Chosen.** Slightly too tanky.
- [ ] **Angus.** Cycling Unbreakable makes him effectively immortal (seen in a 5v1). Nerf the
  cycle, buff his offence slightly to compensate.
- [ ] **Danielle.** Riposte chance is too high.
- [ ] **Alfred.** Verify the tempo multipliers do what the descriptions say, and make the three
  tempos feel more distinct from each other.
- [ ] **Low win rate heroes.** From the v0.92 table: Ben 35.1, Yousuf 32.5 in 3v3, Alfred 39.5,
  Leo 39.8, Aamay 39.8, Flynn 40.4. Buff or rework rather than nudging one number.

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

Their 12 first-round duels were compared against the v0.92 matrix: the sim favoured the same
winner in 10 of 12, with two upsets at 29% and 8.3%. Ben beating Kingsley agreed with the
matrix, which gives Ben 100% against him. The matrix row is the winner, the column is the
loser. That cell was right; the sampling bug in group A was the real problem.
