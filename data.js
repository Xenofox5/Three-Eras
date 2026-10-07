'use strict';
/* ================= DATA ================= */
const ERA = {
  first:   { name: 'First Era',   color: '#e2a35a' },
  second:  { name: 'Second Era',  color: '#c7a0ff' },
  current: { name: 'Current Era', color: '#5ec2ff' },
  echo:    { name: 'Echoes',      color: '#ff7a8a' }
};

const STATUS = {
  burn:      { name: 'Burn', icon: '🔥', type: 'debuff', dot: true, max: 3, color: '#ff7a2f', desc: 'Takes fire damage at the start of each turn. Stacks up to 3 times.' },
  shock:     { name: 'Shock', icon: '⚡', type: 'debuff', dot: true, max: 2, color: '#6fd6ff', desc: 'Takes lightning damage at the start of each turn. Flynn deals 25% more damage to Shocked targets.' },
  bleed:     { name: 'Bleed', icon: '🩸', type: 'debuff', dot: true, max: 3, color: '#ff3b5c', desc: 'Loses HP at the start of each turn. Stacks up to 3 times.' },
  poison:    { name: 'Poison', icon: '☠️', type: 'debuff', dot: true, max: 3, color: '#9be05a', desc: 'Takes poison damage at the start of each turn. Stacks up to 3 times.' },
  stun:      { name: 'Stunned', icon: '💫', type: 'debuff', color: '#ffd84a', desc: 'Skips its next turn. Bosses resist and are delayed instead.' },
  blind:     { name: 'Blinded', icon: '🌫️', type: 'debuff', color: '#b9bdd0', desc: '35% chance to miss attacks.' },
  atkUp:     { name: 'ATK Up', icon: '⚔️', type: 'buff', stat: 'atk', color: '#ff7a6b' },
  atkDown:   { name: 'ATK Down', icon: '⚔️', type: 'debuff', stat: 'atk', neg: true, color: '#ff7a6b' },
  defUp:     { name: 'DEF Up', icon: '🛡️', type: 'buff', stat: 'def', color: '#7fb2ff' },
  defDown:   { name: 'DEF Down', icon: '🛡️', type: 'debuff', stat: 'def', neg: true, color: '#7fb2ff' },
  spdUp:     { name: 'SPD Up', icon: '💨', type: 'buff', stat: 'spd', color: '#7dffc4' },
  spdDown:   { name: 'SPD Down', icon: '💨', type: 'debuff', stat: 'spd', neg: true, color: '#7dffc4' },
  taunt:     { name: 'Taunting', icon: '🎯', type: 'buff', color: '#ff9a3c', desc: 'Enemies must aim single-target attacks at this unit, except moves marked as ignoring Taunt.' },
  regen:     { name: 'Regen', icon: '💚', type: 'buff', color: '#5dff8f', desc: 'Heals 5% max HP at the start of each turn.' },
  hunted:    { name: 'Hunted', icon: '👁️', type: 'debuff', color: '#4fb3ff', desc: 'Takes 25% more damage from the Yunze who marked it (40% with Reaper). Other attackers get no bonus.' },
  afterimage:{ name: 'Afterimage', icon: '👤', type: 'buff', color: '#9fd0ff', desc: 'Dodges the next attack completely.' },
  undying:   { name: 'Unbreakable', icon: '✨', type: 'buff', color: '#ffd36b', desc: 'Cannot fall below 1 HP.' },
  guarding:  { name: 'Guarding', icon: '🛡️', type: 'buff', color: '#c9d2e6', desc: 'Takes single-target hits aimed at the guarded ally, with 20% less damage.' },
  guarded:   { name: 'Guarded', icon: '🤝', type: 'buff', color: '#c9d2e6', desc: 'Single-target attacks against this unit hit the guardian instead.' },
  crystal:   { name: 'Crystal Sphere', icon: '💎', type: 'buff', color: '#ffe066', desc: 'Blocks the next hit completely.' },
  terrified: { name: 'Terrified', icon: '😨', type: 'debuff', fixed: true, mods: { atk: -0.3, spd: -0.2 }, color: '#a58cff', desc: 'Yunze is on the field. ATK -30% and SPD -20%. Gemia\'s ultimate breaks the fear.' },
  resolute:  { name: 'Resolute', icon: '💢', type: 'buff', fixed: true, color: '#ff6f91', desc: 'Immune to fear for the rest of the battle.' },
  flow:      { name: 'Flow', icon: '🌸', type: 'buff', mods: { atk: 0.25, eva: 0.15 }, color: '#ff6f91', desc: 'ATK +25%, evasion +15%, and Swift Cut strikes twice for 60% ATK each.' },
  enrage:    { name: 'Enraged', icon: '😡', type: 'buff', fixed: true, mods: { atk: 0.3 }, color: '#ff4d4d', desc: 'ATK +30%.' },
  warded:    { name: 'Warded', icon: '🔆', type: 'buff', fixed: true, color: '#fff2a8', desc: 'Takes 50% less damage while any Light Wisp lives.' },
  grace:     { name: 'Grace', icon: '✦', type: 'buff', fixed: true, max: 5, perStack: { crit: 0.05 }, color: '#ffd56b', desc: 'Per stack: +5% crit chance and 3% less damage taken (The Chosen). Judgement of Wings spends every stack for extra damage.' },
  stance:    { name: 'Stance', icon: '👊', type: 'buff', fixed: true, color: '#5ec2ff', desc: 'Close: two-hit combo. Far: energy orb that splashes every enemy. Swaps after each basic attack or skill.' },
  mended:    { name: 'Mended', icon: '🩹', type: 'debuff', fixed: true, color: '#7fd8a0', desc: 'Recently healed by Yousuf. His next heals on this ally are 25% weaker until it wears off. Regen ticks are not affected.' },
  vengeance: { name: 'Vengeance', icon: '⚡', type: 'buff', fixed: true, max: 5, color: '#c9d2e6', desc: 'Stored from hits taken. His next Spear Thrust spends every stack for +16% damage and a 2% max HP heal each.' },
  channel:   { name: 'Channelling', icon: '☄️', type: 'buff', fixed: true, mods: { eva: 0.18 }, color: '#ff7a2f', desc: 'Holding Fire Beam on one target. Heat Haze: +18% evasion while channelling. Each Sustain hits harder. Breaks if he takes 30% of his max HP before his next turn, is stunned, or does anything else.' },
  unsealed:  { name: 'Unsealed', icon: '🔓', type: 'buff', mods: { crit: 0.5, cdmg: 0.3, eva: 0.35 }, color: '#3dff9a', desc: 'Harry at full power: +35% damage, +50% crit chance, +30% crit damage, +35% evasion, and +40% Backlash chance (any build). His ultimate does not charge while Unsealed.' },
  charging:  { name: 'Charging', icon: '🔋', type: 'buff', fixed: true, color: '#9fe6ff', desc: 'Gathering a huge attack for its next turn. Deal enough damage before then to break it. The number shows the damage still needed.' },
  mirror:    { name: 'Mirror Stance', icon: '🪞', type: 'buff', color: '#cfe8ff', desc: 'Sends 40% of all direct damage it takes back at the attacker.' },
  plated:    { name: 'Plated', icon: '🔩', type: 'buff', fixed: true, max: 12, color: '#c9d2e6', desc: 'Takes 50% less damage. Every direct hit knocks off one plate. With no plates left it becomes Exposed.' },
  exposed:   { name: 'Exposed', icon: '💔', type: 'debuff', color: '#ff6b78', desc: 'Takes 50% more damage.' },
  accUp:     { name: 'ACC Up', icon: '🎯', type: 'buff', stat: 'acc', color: '#ffe9a0' },
  unbound:   { name: 'Unbound', icon: '🟢', type: 'buff', fixed: true, mods: { atk: 0.35, spd: 0.15 }, color: '#3dff9a', desc: 'True power, briefly released. ATK +35% and SPD +15%.' },
  determined:{ name: 'Determined', icon: '🔆', type: 'buff', fixed: true, mods: { atk: 0.4, crit: 0.1 }, color: '#fff2a8', desc: 'Back on his feet with a fraction of his health left. ATK +40% and +10% crit chance for the rest of the battle.' }
};

/* Characters whose damage gets +20% against a named rival */
const RIVALS = {
  elphi: ['yunze'],
  yunze: ['lachlan', 'yousuf', 'gemia', 'david', 'elphi'],
  harry: ['chosen', 'elphi'],
  gemia: ['yunze'],
  david: ['yunze'],
  chosen: ['harry']
};

const HEROES = {
  angus: {
    id: 'angus', name: 'Angus', title: 'The Unyielding Aura', eras: ['first'], role: 'Tank', color: '#ff9a3c',
    stats: { hp: 1620, atk: 108, def: 120, spd: 92, crit: 0.08, cdmg: 0.5 },
    look: { skin: '#e2b48c', hair: '#6b4428', hairStyle: 'short', eye: '#ff8a1e', body: 'armour', bodyColor: '#c58b4f', trim: '#f4c98a', aura: '#ff9a3c', bg: '#7a3d12', weapon: 'sword', brow: 'firm' },
    passive: { name: 'Unyielding Aura', desc: 'Takes 12% less damage. Heals 3% max HP at the start of each of his turns. His aura saps anyone who strikes him: they lose 6% ATK until the end of their next turn.' },
    basic: { name: 'Steadfast Cut', icon: '🗡️', target: 'enemy', desc: 'Deal 115% ATK to one enemy.' },
    skill: { name: 'Aura of Iron', icon: '🛡️', cost: 1, target: 'self', desc: 'Taunt all enemies for 2 turns. Gain a Shield worth 12% max HP and DEF +20% for 2 turns. Some boss moves ignore Taunt.' },
    ult:   { name: 'Unbreakable', icon: '🔆', target: 'allEnemies', desc: 'Deal 145% ATK to all enemies. Angus cannot fall below 1 HP for 2 turns and all allies gain DEF +25% for 2 turns.' }
  },
  flynn: {
    id: 'flynn', name: 'Flynn', title: 'Stormcaller', eras: ['first'], role: 'Striker', color: '#6fd6ff',
    stats: { hp: 1180, atk: 128, def: 68, spd: 126, crit: 0.12, cdmg: 0.5 },
    look: { skin: '#f0cfb2', hair: '#f4f6ff', hairStyle: 'spiky', eye: '#3d9bff', body: 'coat', bodyColor: '#28406e', trim: '#8fd8ff', bg: '#173a66', weapon: 'bolt', eyeGlow: false },
    passive: { name: 'Overcharge', desc: 'Deals 25% more damage to Shocked enemies. When an enemy he Shocked falls, the Shock arcs to another enemy.' },
    basic: { name: 'Spark Jab', icon: '⚡', target: 'enemy', desc: 'Deal 100% ATK to one enemy. 50% chance to Shock for 2 turns.' },
    skill: { name: 'Chain Lightning', icon: '🌩️', cost: 1, target: 'enemy', desc: 'Deal 120% ATK to one enemy, then arc to up to 2 others for 60% ATK. Shocks everything it hits.' },
    ult:   { name: 'Thunderstorm', icon: '⛈️', target: 'allEnemies', desc: 'Call down 6 bolts on random enemies, each dealing 65% ATK and Shocking. Bolts hitting an already Shocked enemy have a 25% chance to Stun.' }
  },
  leo: {
    id: 'leo', name: 'Leo', title: 'The Burning Robe', eras: ['first'], role: 'Mage', color: '#ff7a2f',
    stats: { hp: 1360, atk: 136, def: 68, spd: 112, crit: 0.1, cdmg: 0.5 },
    look: { skin: '#dcb08a', hair: '#141218', hairStyle: 'swept', eye: '#1a1a1a', body: 'robe', bodyColor: '#6e1a1f', trim: '#ffb057', bg: '#5a1a0c', weapon: 'flame' },
    passive: { name: 'Kindling', desc: 'Deals 20% more damage to Burning enemies.' },
    basic: { name: 'Flame Bolt', icon: '🔥', target: 'enemy', desc: 'Deal 100% ATK to one enemy and Burn it for 2 turns.' },
    skill: { name: 'Fire Beam', icon: '☄️', cost: 1, target: 'enemy', desc: 'Start a beam: 125% ATK to the target, 50% to every enemy behind it, and Burn. Leo then Channels, gaining Heat Haze (+18% evasion). While he holds it, this becomes Sustain Beam: free (but gives no SP), same target, harder each turn: 170%, 210%, then 250% ATK, re-applying Burn. It breaks if he takes 30% of his max HP before his next turn or is stunned. Any other action releases it. Enemies may aim at him to break it.' },
    ult:   { name: 'Inferno Column', icon: '🌋', target: 'allEnemies', desc: 'Deal 190% ATK to all enemies and apply 2 stacks of Burn for 3 turns.' }
  },
  harry: {
    id: 'harry', name: 'Harry', title: 'The Wanderer', eras: ['first', 'second', 'current'], role: 'Legend', legend: true, color: '#3dff9a',
    stats: { hp: 1340, atk: 130, def: 105, spd: 118, crit: 0.15, cdmg: 0.6 },
    look: { skin: '#e8c8a8', hair: '#0e0e12', hairStyle: 'messy', eye: '#121214', glowEye: '#3dff9a', body: 'coat', bodyColor: '#22262e', trim: '#4a5260', bg: '#13261d', weapon: 'katana' },
    passive: { name: 'Close to Immortal', desc: '15% chance to evade attacks. Cannot be stunned. Once per battle, survives a lethal blow with 1 HP. Present in all three eras.' },
    basic: { name: 'Katana Draw', icon: '🗡️', target: 'enemy', desc: 'Deal 92% ATK to one enemy, ignoring 30% of its DEF.' },
    skill: { name: 'Crush', icon: '✊', cost: 1, target: 'enemy', desc: 'His eyes glow green. The target jerks and spits blood: 135% ATK that ignores DEF and cannot miss. Bleeds for 2 turns.' },
    ult:   { name: 'Unsealed', icon: '🔓', target: 'allEnemies', desc: 'Crush every enemy for 260% ATK, ignoring DEF. Then he is Unsealed for 3 turns: +35% damage, +50% crit chance, +30% crit damage, +35% evasion, and attackers risk Backlash (40% chance to be crushed for 140% ATK). His ultimate charges 45% slower than other heroes and not at all while Unsealed.' }
  },
  chosen: {
    id: 'chosen', name: 'The Chosen', title: 'Hero of Myth', eras: ['second'], role: 'Champion', color: '#ffd56b',
    stats: { hp: 1450, atk: 122, def: 118, spd: 114, crit: 0.1, cdmg: 0.55 },
    look: { skin: '#f0d0b0', hair: '#f6d77a', hairStyle: 'long', eye: '#222', body: 'armour', bodyColor: '#d9a93a', trim: '#fff0b0', helm: 'winged', bg: '#5e4a12', weapon: 'lance' },
    passive: { name: 'Gilded Myth', desc: 'Takes 12% less damage. Every action grants a Grace stack (max 5). Each stack gives +5% crit chance and 3% less damage taken.' },
    basic: { name: 'Lance Thrust', icon: '🔱', target: 'enemy', desc: 'Deal 105% ATK to one enemy.' },
    skill: { name: 'Gilded Dance', icon: '💃', cost: 1, target: 'enemy', desc: 'Strike 3 times for 55% ATK each. Gain a Shield worth 10% of her max HP and an extra Grace stack.' },
    ult:   { name: 'Judgement of Wings', icon: '🪽', target: 'enemy', desc: 'Dive from above for 260% ATK, +20% per Grace stack spent, then heal herself for 20% max HP. Spending Grace also spends its damage reduction.' }
  },
  elphi: {
    id: 'elphi', name: 'Elphi', title: 'The Light Bearer', eras: ['second'], role: 'Guardian', color: '#fff2a8',
    stats: { hp: 1420, atk: 128, def: 92, spd: 106, crit: 0.1, cdmg: 0.5 },
    look: { skin: '#ecc9a6', hair: '#c9b48a', hairStyle: 'swept', eye: '#8aa6c8', body: 'armour', bodyColor: '#8a909c', trim: '#e6eaf2', bg: '#4d4a2a', weapon: 'lightsword' },
    passive: { name: 'Last Light', desc: 'The first time each ally drops below 30% HP, Elphi shields them with light worth 10% of his max HP, once per ally per battle. He does not stay down either: the first time he falls he rises again with 45% of his max HP, and keeps ATK +40% and +10% crit chance for the rest of the fight.' },
    basic: { name: 'Lightblade', icon: '⚔️', target: 'enemy', desc: 'Deal 120% ATK to one enemy and heal himself for 15% of the damage.' },
    skill: { name: 'Radiant Arc', icon: '🌟', cost: 1, target: 'allEnemies', desc: 'Deal 85% ATK to all enemies. 60% chance to Blind each for 1 turn.' },
    ult:   { name: 'Sanctum Blade', icon: '🗡️', target: 'enemy', desc: 'A colossal sword of light deals 300% ATK. All allies gain a Shield worth 11% of his max HP.' }
  },
  daniel: {
    id: 'daniel', name: 'Danielle', title: 'The Crystal Duelist', eras: ['second'], role: 'Warden', color: '#ffe066',
    stats: { hp: 1320, atk: 116, def: 124, spd: 108, crit: 0.1, cdmg: 0.5 },
    look: { skin: '#ecc8a6', hair: '#6b4426', hairStyle: 'long', eye: '#5a3a20', body: 'coat', bodyColor: '#3c3550', trim: '#ffe066', bg: '#4d4212', weapon: 'crystal', lashes: true },
    passive: { name: 'Riposte', desc: 'When a single-target attack hits her, 45% chance to answer with her rapier for 95% ATK. Ripostes cannot miss and have +25% crit chance. Evading an attack leaves nothing to answer, so evasion and riposte never both happen. If a Crystal Sphere blocks the hit she always ripostes. One riposte per attack, and area attacks never trigger it.' },
    basic: { name: 'Rapier Lunge', icon: '🤺', target: 'enemy', desc: 'Deal 110% ATK to one enemy with +20% crit chance.' },
    skill: { name: 'Crystal Ward', icon: '🔮', cost: 1, target: 'ally', desc: 'Give an ally a Shield worth 14% of Danielle\'s max HP and DEF +15% for 2 turns. Crystal Ward can\'t raise an ally\'s Shield above 35% of their max HP, so recasting tops it up rather than stacking.' },
    ult:   { name: 'Unbreakable Sphere', icon: '💎', target: 'enemy', desc: 'Every ally gains a Crystal Sphere that blocks the next hit within 2 turns. Then smash one enemy for 180% ATK and Stun it.' }
  },
  yunze: {
    id: 'yunze', name: 'Yunze', title: 'The Smiling Hunter', eras: ['second', 'current'], role: 'Legend', legend: true, color: '#4fb3ff',
    stats: { hp: 1160, atk: 140, def: 62, spd: 190, crit: 0.18, cdmg: 0.6 },
    look: { skin: '#eccbaa', hair: '#0d0d14', hairStyle: 'messy', eye: '#4fb3ff', eyeGlow: true, body: 'coat', bodyColor: '#141a2c', trim: '#4fb3ff', bg: '#0f2a4d', weapon: 'dagger', smile: true },
    passive: { name: 'Hunter of the Strong', desc: '20% chance to evade attacks. Picks out the strongest of a group: deals 30% more damage to the enemy with the highest max HP when there are two or more.' },
    basic: { name: 'Switch Hands', icon: '🔪', target: 'enemy', desc: 'The blade swaps hands too fast to see: 2 hits of 40% ATK.' },
    skill: { name: 'Phantom Switch', icon: '👤', cost: 1, target: 'enemy', desc: 'Costs no SP, but can only be used every third turn. Appear beside the target for 125% ATK with +40% crit chance. Marks it as Hunted for 2 turns: it takes 25% more damage from Yunze only. Leaves an Afterimage that dodges the next attack.' },
    ult:   { name: 'Thousand Afterimages', icon: '🌀', target: 'allEnemies', desc: '7 strikes of 40% ATK on random enemies, favouring Hunted ones. His next turn comes 50% sooner.' }
  },
  malakai: {
    id: 'malakai', name: 'Malakai', title: 'The Alchemist', eras: ['second', 'current'], role: 'Alchemist', color: '#ffb23d',
    stats: { hp: 1120, atk: 116, def: 72, spd: 112, crit: 0.1, cdmg: 0.5 },
    look: { skin: '#f0cdaa', hair: '#ff7a1f', hairStyle: 'swept', eye: '#ffd21f', body: 'robe', bodyColor: '#3b2a1a', trim: '#ffb23d', bg: '#5a3410', weapon: 'flask' },
    passive: { name: 'Elite Clientele', desc: 'Each time he uses his skill, 50% chance to refund the SP.' },
    basic: { name: 'Volatile Flask', icon: '🧪', target: 'enemy', desc: 'Deal 90% ATK to one enemy and apply a random debuff: Poison, ATK Down or DEF Down.' },
    skill: { name: 'Elite Bargain', icon: '🤝', cost: 1, target: 'ally', desc: 'An ally pays 8% of current HP for ATK +35% and SPD +20% for 2 turns.' },
    ult:   { name: 'Grand Transmutation', icon: '⚗️', target: 'allEnemies', desc: 'Strip every enemy buff and Shield, then Poison all enemies (2 stacks) and lower their DEF by 30%. Heal allies 20% max HP and cleanse their debuffs.' }
  },
  lachlan: {
    id: 'lachlan', name: 'Lachlan', title: 'Icon of the People', eras: ['current'], role: 'Versatile', color: '#4f8dff',
    stats: { hp: 1290, atk: 134, def: 90, spd: 110, crit: 0.12, cdmg: 0.5 },
    look: { skin: '#f0d2b6', hair: '#eef2ff', hairStyle: 'swept', eye: '#3a7dff', body: 'armour', bodyColor: '#2a3f7a', trim: '#7fb0ff', bg: '#132a66', weapon: 'orb' },
    passive: { name: 'Azure Shield', desc: 'Starts battle with a Shield worth 30% max HP. Regenerates 6% max HP of Shield each turn, up to 30%. Swaps stance after each basic attack or skill.' },
    basic: { name: 'Close / Far', icon: '👊', target: 'enemy', desc: 'Close stance: 2 hits of 65% ATK. Far stance: an energy orb for 85% ATK that splashes 35% ATK onto every other enemy.' },
    skill: { name: 'Azure Blast', icon: '🔵', cost: 1, target: 'enemy', desc: 'Deal 160% ATK and lower DEF by 25% for 2 turns. Restores 10% max HP of Shield.' },
    ult:   { name: 'Azure Nova', icon: '💠', target: 'allEnemies', desc: 'Deal 200% ATK to all enemies and fully restore the Azure Shield.' }
  },
  yousuf: {
    id: 'yousuf', name: 'Yousuf', title: 'The Prodigy', eras: ['current'], role: 'Healer', color: '#5dff8f',
    stats: { hp: 1060, atk: 92, def: 68, spd: 116, crit: 0.12, cdmg: 0.5 },
    look: { skin: '#d9a77c', hair: '#8a6a3a', hairStyle: 'short', eye: '#3fbf6a', body: 'robe', bodyColor: '#e9e4d2', trim: '#5dff8f', bg: '#14452a', weapon: 'staff', young: true },
    passive: { name: 'Prodigy', desc: 'Healing cap: allies he heals are Mended for 2 turns, and his heals on a Mended ally are 25% weaker. ' + 'His heals can crit for 50% extra healing. Heals on himself are 10% weaker.' },
    basic: { name: 'Staff Strike', icon: '🪄', target: 'enemy', desc: 'Deal 100% ATK to one enemy. The ally with the lowest HP heals for 45% of the damage.' },
    skill: { name: 'Mending Light', icon: '✚', cost: 1, target: 'ally', desc: 'Heal an ally for 11% of their max HP + 100% ATK, cleanse 1 debuff and grant Regen for 2 turns.' },
    ult:   { name: 'Prodigy\'s Blessing', icon: '🌿', target: 'allAllies', desc: 'Revive one fallen ally at 25% HP. Heal all allies 18% max HP, cleanse all debuffs and grant Regen for 2 turns.' }
  },
  gemia: {
    id: 'gemia', name: 'Gemia', title: 'The Scarred Blade', eras: ['current'], role: 'Skirmisher', color: '#ff6f91',
    stats: { hp: 1360, atk: 130, def: 88, spd: 138, crit: 0.14, cdmg: 0.5 },
    look: { skin: '#eac6a4', hair: '#4a2430', hairStyle: 'ponytail', eye: '#6a4632', body: 'armour', bodyColor: '#6a7286', trim: '#ff8fae', bg: '#4d1a2a', weapon: 'sword', scars: true },
    passive: { name: 'Faster Than Most', desc: 'Her basic attack brings her next turn 20% sooner. If Yunze is on the field, she starts Terrified.' },
    basic: { name: 'Swift Cut', icon: '⚔️', target: 'enemy', desc: 'Deal 110% ATK to one enemy. Her next turn comes 20% sooner.' },
    skill: { name: 'Flurry', icon: '🌪️', cost: 1, target: 'enemy', desc: '4 hits of 52% ATK. Each hit has a 25% chance to cause Bleed.' },
    ult:   { name: 'Scarred Resolve', icon: '💢', target: 'enemy', desc: 'Deal 280% ATK to one enemy, then enter Flow for 3 turns: ATK +25%, evasion +15%, and Swift Cut strikes twice (60% ATK each). The first use breaks her fear for good (Resolute).' }
  },
  david: {
    id: 'david', name: 'David', title: 'The Spear of the Guard', eras: ['current'], role: 'Defender', color: '#c9d2e6',
    stats: { hp: 1620, atk: 122, def: 112, spd: 98, crit: 0.1, cdmg: 0.5 },
    look: { skin: '#e2bc98', hair: '#9a9ea8', hairStyle: 'short', eye: '#8a8f99', body: 'armour', bodyColor: '#7c828e', trim: '#c9d2e6', bg: '#2c3240', weapon: 'spear', brow: 'firm' },
    passive: { name: 'Sworn Guard', desc: 'While guarding an ally he takes 50% less damage, and every hit he intercepts for them heals him 3% of his max HP. Vengeance: every hit he takes stores a stack, up to 5. His next Spear Thrust spends them all for +16% damage and a 2% max HP heal per stack.' },
    basic: { name: 'Spear Thrust', icon: '🔱', target: 'enemy', desc: 'Deal 115% ATK to one enemy and lower its DEF by 15% for 2 turns. Spends Vengeance for +16% damage and a 2% heal per stack.' },
    skill: { name: 'Hold the Line', icon: '🛡️', cost: 1, target: 'ally', desc: 'Guard an ally for 2 turns: single-target attacks on them hit David instead. Gains DEF +25%. On himself, he Taunts instead.' },
    ult:   { name: 'Phalanx Sweep', icon: '🌀', target: 'allEnemies', desc: 'Deal 170% ATK to all enemies. All allies gain DEF +30% for 2 turns and David Taunts for 1 turn.' }
  }
};
const HERO_ORDER = ['angus', 'flynn', 'leo', 'harry', 'chosen', 'elphi', 'daniel', 'yunze', 'malakai', 'lachlan', 'yousuf', 'gemia', 'david'];

/* ---------- Enemies ---------- */
const ENEMIES = {
  bandit: { name: 'Bandit', color: '#d0764e', stats: { hp: 780, atk: 100, def: 45, spd: 100 },
    look: { kind: 'human', skin: '#d6a27a', hair: '#3b2a1e', hairStyle: 'messy', eye: '#3a2a1a', body: 'coat', bodyColor: '#5b4636', trim: '#8b6a4a', bandana: '#8e2b2b', bg: '#6a301e', weapon: 'dagger' },
    moves: [
      { id: 'slash', name: 'Rusty Slash', icon: '🗡️', target: 'single', mult: 1, w: 3, fx: 'slash' },
      { id: 'trick', name: 'Dirty Trick', icon: '🌫️', target: 'single', mult: 0.5, status: { key: 'blind', turns: 1 }, w: 2, cd: 3, fx: 'dust' }
    ] },
  archer: { name: 'Bandit Archer', color: '#9bbf5a', stats: { hp: 620, atk: 106, def: 35, spd: 118 },
    look: { kind: 'hood', cloak: '#3d4a2c', eye: '#e8d27a', bg: '#2e3a1a' },
    moves: [
      { id: 'arrow', name: 'Aimed Shot', icon: '🏹', target: 'single', mult: 1.05, w: 3, fx: 'arrow', tp: 'squishy' },
      { id: 'volley', name: 'Volley', icon: '🌧️', target: 'all', mult: 0.55, w: 3, cd: 3, fx: 'volley' }
    ] },
  brute: { name: 'Bandit Brute', color: '#c98a5a', stats: { hp: 1250, atk: 112, def: 75, spd: 84 },
    look: { kind: 'human', skin: '#c48c62', hair: '#c48c62', hairStyle: 'bald', eye: '#2a1a10', body: 'coat', bodyColor: '#4a3426', trim: '#7a5a3a', bg: '#4a2a18', weapon: 'club', big: true },
    moves: [
      { id: 'club', name: 'Club', icon: '🪵', target: 'single', mult: 1.2, w: 3, fx: 'smash' },
      { id: 'crack', name: 'Skull Crack', icon: '💫', target: 'single', mult: 1.0, status: { key: 'stun', turns: 1, chance: 0.4 }, w: 2, cd: 3, fx: 'smash' }
    ] },
  wolf: { name: 'Ash Wolf', color: '#ff8a3a', stats: { hp: 640, atk: 96, def: 35, spd: 134 },
    look: { kind: 'wolf', fur: '#5d626e', eye: '#ff8a3a', bg: '#4a2516' },
    moves: [
      { id: 'bite', name: 'Bite', icon: '🦷', target: 'single', mult: 1.0, status: { key: 'bleed', turns: 2, chance: 0.4, dot: 0.25 }, w: 3, fx: 'claw' },
      { id: 'lunge', name: 'Throat Lunge', icon: '🐺', target: 'single', mult: 1.35, tp: 'lowest', w: 2, cd: 2, fx: 'claw' }
    ] },
  alpha: { name: 'Ashfang Alpha', color: '#ff5a2a', elite: true, stats: { hp: 1600, atk: 116, def: 60, spd: 122 },
    look: { kind: 'wolf', fur: '#2e2f36', eye: '#ff3a1a', bg: '#5a1a0a', big: true },
    moves: [
      { id: 'maul', name: 'Maul', icon: '🦷', target: 'single', mult: 1.3, status: { key: 'bleed', turns: 2, chance: 0.6, dot: 0.25 }, w: 3, fx: 'claw' },
      { id: 'howl', name: 'Pack Howl', icon: '🌕', target: 'allies', allies: { key: 'atkUp', turns: 2, value: 0.3 }, w: 2, cd: 4, fx: 'buff' }
    ] },
  sprite: { name: 'Rock Sprite', color: '#b8a888', priority: true, stats: { hp: 520, atk: 78, def: 95, spd: 120 },
    look: { kind: 'sprite', rock: '#8a8070', eye: '#7ff0ff', bg: '#3a3428' },
    moves: [
      { id: 'pebble', name: 'Pebble Shot', icon: '🪨', target: 'single', mult: 1.0, w: 2, fx: 'rock' },
      { id: 'mend', name: 'Stone Mend', icon: '✚', target: 'ally', heal: 0.12, w: 4, cd: 2, cond: e => friendsOf(e).some(a => a.hp / a.maxHp < 0.85) }
    ] },
  golem: { name: 'Stone Golem', color: '#a8a090', elite: true, stats: { hp: 3200, atk: 120, def: 175, spd: 70 },
    look: { kind: 'golem', rock: '#7a7468', eye: '#7ff0ff', bg: '#2e2a22', big: true },
    moves: [
      { id: 'smash', name: 'Boulder Fist', icon: '👊', target: 'single', mult: 1.45, w: 3, fx: 'smash' },
      { id: 'quake', name: 'Quake', icon: '🌋', target: 'all', mult: 0.8, status: { key: 'stun', turns: 1, chance: 0.25 }, w: 3, cd: 3, fx: 'quake' },
      { id: 'harden', name: 'Harden', icon: '🪨', target: 'self', self: { key: 'defUp', turns: 3, value: 0.5 }, shield: 0.12, w: 2, cd: 4 }
    ] },
  drake: { name: 'Ember Drake', color: '#ff7a3a', stats: { hp: 720, atk: 98, def: 50, spd: 116 },
    look: { kind: 'wyvern', scale: '#a8402a', eye: '#ffd23a', bg: '#4a1a0a' },
    moves: [
      { id: 'spit', name: 'Ember Spit', icon: '🔥', target: 'single', mult: 1.0, status: { key: 'burn', turns: 2, chance: 0.5, dot: 0.25 }, w: 3, fx: 'fireball' },
      { id: 'claw', name: 'Rake', icon: '🐾', target: 'single', mult: 1.2, w: 2, fx: 'claw' }
    ] },
  wyvern: { name: 'Ember Wyvern', title: 'Lord of the Ash Peaks', color: '#ff5a2a', boss: true, stats: { hp: 5600, atk: 128, def: 88, spd: 104 },
    look: { kind: 'wyvern', scale: '#7a1a14', eye: '#ffe23a', bg: '#5a0e06', big: true, horns: true },
    moves: [
      { id: 'breath', name: 'Flame Breath', icon: '🔥', target: 'all', mult: 0.75, status: { key: 'burn', turns: 2, chance: 0.8, dot: 0.25 }, w: 3, cd: 2, fx: 'firebreath' },
      { id: 'tail', name: 'Tail Swipe', icon: '🐉', target: 'single', mult: 1.5, w: 3, fx: 'smash' },
      { id: 'roar', name: 'Terrible Roar', icon: '📢', target: 'all', status: { key: 'defDown', turns: 2, value: 0.25 }, w: 2, cd: 4, fx: 'roar' }
    ],
    half: { title: 'The wyvern is enraged', sub: 'ATK +30%', run: e => addStatus(e, 'enrage', 99) } },
  cultist: { name: 'Hollow Cultist', color: '#b066ff', stats: { hp: 780, atk: 102, def: 45, spd: 108 },
    look: { kind: 'hood', cloak: '#2a1a3a', eye: '#c27aff', bg: '#24123a' },
    moves: [
      { id: 'bolt', name: 'Dark Bolt', icon: '🟣', target: 'single', mult: 1.1, w: 3, fx: 'darkbolt' },
      { id: 'curse', name: 'Wither Curse', icon: '🕯️', target: 'single', status: { key: 'atkDown', turns: 2, value: 0.25 }, tp: 'strongest', w: 2, cd: 3, fx: 'hex' }
    ] },
  zealot: { name: 'Hollow Zealot', color: '#ff4a6a', stats: { hp: 1050, atk: 116, def: 60, spd: 100 },
    look: { kind: 'hood', cloak: '#4a1020', eye: '#ff5a5a', bg: '#3a0a18' },
    moves: [
      { id: 'cleave', name: 'Cleave', icon: '🪓', target: 'single', mult: 1.2, w: 3, fx: 'slash' },
      { id: 'frenzy', name: 'Frenzy', icon: '😤', target: 'self', self: { key: 'atkUp', turns: 2, value: 0.4 }, w: 2, cd: 3 }
    ] },
  priest: { name: 'Hollow Priest', color: '#e0d0ff', priority: true, stats: { hp: 960, atk: 86, def: 60, spd: 112 },
    look: { kind: 'hood', cloak: '#3a3050', eye: '#fff0a0', halo: true, bg: '#2a2440' },
    moves: [
      { id: 'mend', name: 'Hollow Mending', icon: '✚', target: 'allies', heal: 0.12, w: 4, cd: 2, cond: e => friendsOf(e).some(a => a.hp / a.maxHp < 0.8) },
      { id: 'ward', name: 'Dark Ward', icon: '🛡️', target: 'ally', shield: 0.15, w: 2, cd: 3 },
      { id: 'smite', name: 'Smite', icon: '✴️', target: 'single', mult: 0.95, w: 2, fx: 'darkbolt' }
    ] },
  homunculus: { name: 'Homunculus', color: '#ffb23d', onDeath: 'explode', stats: { hp: 640, atk: 92, def: 50, spd: 110 },
    look: { kind: 'blob', goo: '#e0852a', eye: '#ffe23a', bg: '#4a2a0a' },
    moves: [
      { id: 'lash', name: 'Acid Lash', icon: '🧪', target: 'single', mult: 1.0, status: { key: 'poison', turns: 2, chance: 0.5, dot: 0.25 }, w: 3, fx: 'acid' }
    ] },
  wisp: { name: 'Light Wisp', color: '#fff2a8', priority: true, stats: { hp: 640, atk: 72, def: 60, spd: 124 },
    look: { kind: 'wisp', glow: '#fff2a8', bg: '#3a3818' },
    moves: [
      { id: 'glimmer', name: 'Glimmer', icon: '✨', target: 'single', mult: 0.85, w: 2, fx: 'light' },
      { id: 'mendlight', name: 'Mend the Guardian', icon: '✚', target: 'ally', heal: 0.06, tp: 'boss', w: 3, cd: 2, cond: e => friendsOf(e).some(a => a.hp / a.maxHp < 0.9) }
    ] },

  /* ---- Hero bosses ---- */
  malakaiBoss: { heroId: 'malakai', name: 'Malakai', title: 'His deals are never fair', color: '#ffb23d', boss: true, stats: { hp: 5200, atk: 124, def: 80, spd: 114, crit: 0.1 },
    moves: [
      { id: 'flask', name: 'Volatile Flask', icon: '🧪', target: 'single', mult: 1.1, status: { key: 'alch', turns: 2 }, w: 3, fx: 'flask' },
      { id: 'acid', name: 'Acid Rain', icon: '🌧️', target: 'all', mult: 0.6, status: { key: 'poison', turns: 2, dot: 0.3 }, w: 3, cd: 2, fx: 'acidrain' },
      { id: 'transmute', name: 'Transmute', icon: '⚗️', target: 'all', w: 4, cd: 3, fx: 'transmute', run: 'transmute', cond: e => foesOf(e).some(p => p.shield > 0 || p.statuses.some(s => STATUS[s.key].type === 'buff' && !STATUS[s.key].fixed)) },
      { id: 'summon', name: 'Summon Homunculus', icon: '🫧', target: 'self', w: 5, cd: 3, run: 'summon', cond: e => friendsOf(e).length < 3 },
      { id: 'elixir', name: 'Elixir', icon: '🍶', target: 'self', heal: 0.12, w: 3, cd: 4, cond: e => e.hp / e.maxHp < 0.6 }
    ] },
  elphiBoss: { heroId: 'elphi', name: 'Elphi', title: 'He is protecting something', color: '#fff2a8', boss: true, stats: { hp: 6000, atk: 132, def: 100, spd: 108, crit: 0.1 },
    moves: [
      { id: 'blade', name: 'Lightblade', icon: '⚔️', target: 'single', mult: 1.3, w: 3, fx: 'lightslash' },
      { id: 'arc', name: 'Radiant Arc', icon: '🌟', target: 'all', mult: 0.8, status: { key: 'blind', turns: 1, chance: 0.5 }, w: 3, cd: 2, fx: 'radiant' },
      { id: 'sanctum', name: 'Sanctum Blade', icon: '🗡️', target: 'single', mult: 2.3, tp: 'strongest', w: 4, cd: 4, fx: 'giantblade' },
      { id: 'vow', name: 'Guardian\'s Vow', icon: '🛡️', target: 'self', shield: 0.12, w: 2, cd: 4 }
    ] },
  chosenBoss: { heroId: 'chosen', name: 'The Chosen', title: 'Masked, always', color: '#ffd56b', boss: true, multi: 2, stats: { hp: 7600, atk: 128, def: 96, spd: 116, crit: 0.1 },
    moves: [
      { id: 'thrust', name: 'Lance Thrust', icon: '🔱', target: 'single', mult: 1.1, self: { key: 'grace', turns: 99, stacks: 1, silent: true }, w: 3, fx: 'lance' },
      { id: 'dance', name: 'Gilded Dance', icon: '💃', target: 'single', mult: 0.5, hits: 3, self: { key: 'atkUp', turns: 2, value: 0.2 }, w: 3, cd: 2, fx: 'lance' },
      { id: 'judge', name: 'Judgement of Wings', icon: '🪽', target: 'single', mult: 2.0, tp: 'strongest', w: 5, cd: 4, fx: 'wings', run: 'spendGrace' },
      { id: 'ascent', name: 'Winged Ascent', icon: '🕊️', target: 'self', self: [{ key: 'afterimage', turns: 2 }, { key: 'atkUp', turns: 3, value: 0.3 }], w: 2, cd: 5 }
    ],
    half: { title: 'The Chosen takes flight', sub: 'SPD +20%', run: e => addStatus(e, 'spdUp', 99, { value: 0.2 }) } },
  yunzeBoss: { heroId: 'yunze', name: 'Yunze', title: 'He smiles while he hunts', color: '#4fb3ff', boss: true, multi: 2, evade: 0.2, stats: { hp: 6600, atk: 136, def: 70, spd: 150, crit: 0.18, cdmg: 0.6 },
    moves: [
      { id: 'switch', name: 'Switch Hands', icon: '🔪', target: 'single', mult: 0.6, hits: 2, w: 3, fx: 'dagger' },
      { id: 'phantom', name: 'Phantom Switch', icon: '👤', target: 'single', mult: 1.6, critBonus: 0.3, tp: 'strongest', status: { key: 'hunted', turns: 2 }, self: { key: 'afterimage', turns: 2, silent: true }, w: 4, cd: 2, fx: 'phantom' },
      { id: 'thousand', name: 'Thousand Afterimages', icon: '🌀', target: 'all', w: 5, cd: 4, run: 'thousand', est: 0.5, estHits: 2 },
      { id: 'smile', name: 'Smile', icon: '😊', target: 'self', self: [{ key: 'afterimage', turns: 2 }, { key: 'spdUp', turns: 2, value: 0.2 }], w: 2, cd: 3 }
    ],
    half: { title: 'His smile widens', sub: 'ATK +30%', run: e => addStatus(e, 'enrage', 99) } },
  harryBoss: { heroId: 'harry', name: 'Harry', title: 'Few people know he exists', color: '#3dff9a', boss: true, multi: 2, evade: 0.1, stunImmune: true, stats: { hp: 7000, atk: 140, def: 86, spd: 124, crit: 0.15, cdmg: 0.6 },
    moves: [
      { id: 'katana', name: 'Katana Draw', icon: '🗡️', target: 'single', mult: 1.2, pierce: 0.3, w: 4, fx: 'katana' },
      { id: 'crush', name: 'Crush', icon: '✊', target: 'single', mult: 1.8, pierce: 1, sure: true, tp: 'strongest', status: { key: 'bleed', turns: 2, dot: 0.3 }, w: 4, cd: 3, fx: 'crush' },
      { id: 'step', name: 'Unseen Step', icon: '👣', target: 'self', self: { key: 'afterimage', turns: 2 }, w: 2, cd: 3 }
    ],
    moves2: [
      { id: 'katana', name: 'Katana Draw', icon: '🗡️', target: 'single', mult: 1.3, pierce: 0.3, w: 3, fx: 'katana' },
      { id: 'crush', name: 'Crush', icon: '✊', target: 'single', mult: 1.9, pierce: 1, sure: true, status: { key: 'bleed', turns: 2, dot: 0.3 }, w: 4, cd: 1, fx: 'crush' },
      { id: 'collapse', name: 'Collapse', icon: '🟢', target: 'all', mult: 1.05, pierce: 1, sure: true, w: 5, cd: 3, fx: 'crushAll' }
    ],
    phase2: { title: 'He was holding back', sub: 'His eyes glow a cold green' } }
};

/* ---------- Campaign ---------- */
const STAGES = [
  { id: 'road',    era: 'first',   name: 'The Bandit Road',     atk: 2.1, hp: 1.25, enemies: ['bandit', 'archer', 'bandit'], reward: 'yousuf',
    desc: 'Cutthroats work the old trade road at dusk.' },
  { id: 'pack',    era: 'first',   name: 'Ashfang Pack',        atk: 1.75, hp: 0.9, enemies: ['wolf', 'wolf', 'alpha', 'wolf', 'wolf'],
    desc: 'Five wolves with embers for eyes. Each is weak alone and hard to hit. Area attacks shine here.' },
  { id: 'king',    era: 'first',   name: 'The Bandit King',     atk: 2.0, hp: 1.25, enemies: ['bandit', 'archer', 'banditKing', 'bandit'], boss: true, reward: 'david',
    desc: 'Varro rules the road. He calls in more of his gang and executes whoever is weakest.' },
  { id: 'quarry',  era: 'first',   name: 'The Sleeping Quarry', atk: 2.2, hp: 1.3, enemies: ['sprite', 'golem', 'sprite'],
    desc: 'Something in the quarry has woken up. Its DEF is enormous, so pierce it or wear it down.' },
  { id: 'mire',    era: 'first',   name: 'Mirefen',             atk: 2.9, hp: 1.6, enemies: ['witch', 'lurker'], reward: 'gemia',
    desc: 'The bog witch rots you with poison while her lurker drags you under. Only two of them, but both are tough. Cleanse or kill her fast.' },
  { id: 'shrine',  era: 'first',   name: 'The Storm Shrine',    atk: 1.65, hp: 1.1, enemies: ['stormling', 'stormling', 'tempestIdol', 'stormling', 'stormling'], boss: true,
    desc: 'Four stormlings guard the idol. The idol gathers a storm, then releases it on your whole team. Hit it hard while it charges to break it.' },
  { id: 'wyvern',  era: 'first',   name: 'Ember Wyvern',        atk: 2.0, hp: 1.25, enemies: ['drake', 'wyvern', 'drake'], boss: true, reward: 'daniel',
    desc: 'The wyvern of the Ash Peaks. It enrages at half HP.' },

  { id: 'cult',    era: 'second',  name: 'Hollow Sun Cult',     atk: 2.0, hp: 1.1, enemies: ['zealot', 'cultist', 'priest', 'cultist', 'zealot'],
    desc: 'Five of the faithful. Kill the priest first or the cult keeps standing back up.' },
  { id: 'prophet', era: 'second',  name: 'The Hollow Prophet',  atk: 2.1, hp: 1.3, enemies: ['cultist', 'prophet', 'zealot', 'cultist'], boss: true, reward: 'lachlan',
    desc: 'The prophet raises fallen cultists once each. Kill him or burn through them together.' },
  { id: 'malakai', era: 'second',  name: 'Malakai\'s Bargain',  atk: 1.9, hp: 1.25, enemies: ['homunculus', 'malakaiBoss', 'homunculus'], boss: true, reward: 'malakai',
    desc: 'The alchemist summons homunculi that burst when they die. He also strips buffs.' },
  { id: 'mirror',  era: 'second',  name: 'The Mirror Hall',     atk: 1.6, hp: 1.3, enemies: ['shard', 'mirrorKnight', 'shard'], boss: true,
    desc: 'In Mirror Stance the knight sends 40% of all damage back at the attacker. Watch his intent and hold back when he raises it.' },
  { id: 'elphi',   era: 'second',  name: 'Guardian of Light',   atk: 2.2, hp: 1.3, enemies: ['wisp', 'elphiBoss', 'wisp'], boss: true, reward: 'elphi',
    desc: 'Elphi takes half damage while his wisps live.' },
  { id: 'chosen',  era: 'second',  name: 'The Chosen',          atk: 1.5, hp: 1.1, enemies: ['chosenBoss'], boss: true, reward: 'chosen',
    desc: 'The hero of myth. Acts twice per turn and builds Grace for a devastating dive.' },

  { id: 'gate',    era: 'current', name: 'The Fallen Gate',     atk: 2.1, hp: 1.2, enemies: ['sellsword', 'crossbow', 'shieldbearer', 'crossbow'],
    desc: 'Mercenaries hold the city gate. Two crossbowmen pick off your weakest hero while the shieldbearer covers the line.' },
  { id: 'warden',  era: 'current', name: 'The Iron Warden',     atk: 2.2, hp: 1.3, enemies: ['ironWarden', 'crossbow'], boss: true,
    desc: 'Its plates halve all damage. Every hit knocks one off. Strip them all and it is exposed. Multi-hit attacks shine here.' },
  { id: 'shadows', era: 'current', name: 'The Hunter\'s Shadows', atk: 1.9, hp: 1.0, enemies: ['shade', 'shade', 'shade', 'shade'],
    desc: 'Four afterimages Yunze left behind. Fast and evasive, and Gemia is afraid of them.' },
  { id: 'yunze',   era: 'current', name: 'The Smiling Hunter',  atk: 1.08, hp: 1.0, enemies: ['yunzeBoss'], boss: true, reward: 'yunze',
    desc: 'Yunze hunts the strongest. Acts twice per turn, evades often and marks his prey.' },
  { id: 'harry',   era: 'current', name: 'The Wanderer',        atk: 0.9, hp: 0.85, enemies: ['harryBoss'], boss: true, reward: 'harry',
    desc: 'He has been here in every era. Nobody has seen him use his full power.' },

  { id: 'e_legends', era: 'echo', name: 'Echo: Two Legends',  atk: 1.35, hp: 1.1, enemies: ['chosenBoss', 'elphiBoss'], boss: true,
    desc: 'The Chosen and Elphi at once. Neither ever met Harry here.' },
  { id: 'e_ash',     era: 'echo', name: 'Echo: Ash and Iron', atk: 2.0, hp: 1.35, enemies: ['wyvern', 'ironWarden'], boss: true,
    desc: 'The wyvern and the Warden side by side. Burns, plates and a lot of HP.' },
  { id: 'e_massacre', era: 'echo', name: 'Echo: The Escort',  atk: 1.05, hp: 0.95, enemies: ['shade', 'shade', 'yunzeBoss', 'shade', 'shade'], boss: true,
    desc: 'The night Yousuf\'s escort fell. Yunze brings four afterimages.' },
  { id: 'e_unbound', era: 'echo', name: 'Echo: Unbound',      atk: 0.95, hp: 1.0, enemies: ['harryBoss'], boss: true,
    desc: 'Harry, closer to his full power. The hardest fight in the game.' }
];

/* ---------- Synergies ---------- */
const eraCount = (team, era) => team.filter(id => HEROES[id].eras.includes(era)).length;
const SYNERGIES = [
  { id: 'guard', name: 'Yousuf\'s Guard', icon: '🛡️', color: '#5dff8f',
    test: t => ['yousuf', 'gemia', 'david'].every(x => t.includes(x)),
    desc: 'Yousuf, Gemia and David together. All three gain ATK +15% and DEF +15%. Yousuf takes 25% less damage.',
    apply: P => P.forEach(p => { p.mods.atk += 0.15; p.mods.def += 0.15; if (p.id === 'yousuf') p.flags.escort = true; }) },
  { id: 'first', name: 'Old Blood', icon: '🏺', color: ERA.first.color,
    test: t => eraCount(t, 'first') >= 3,
    desc: 'Three First Era heroes. Max HP +15% and DEF +10%.',
    apply: P => P.forEach(p => { p.mods.hp += 0.15; p.mods.def += 0.1; }) },
  { id: 'second', name: 'Age of Myth', icon: '🏛️', color: ERA.second.color,
    test: t => eraCount(t, 'second') >= 3,
    desc: 'Three Second Era heroes. Crit chance +12% and crit damage +25%.',
    apply: P => P.forEach(p => { p.mods.crit += 0.12; p.mods.cdmg += 0.25; }) },
  { id: 'current', name: 'Last Generation', icon: '🌆', color: ERA.current.color,
    test: t => eraCount(t, 'current') >= 3,
    desc: 'Three Current Era heroes. Start each battle with 5 SP and 30% ultimate charge.',
    apply: (P, B) => { if (P[0] && P[0].side === 'enemy') B.startSpE = 5; else B.startSp = 5; P.forEach(p => { p.ult = 30; }); } },
  { id: 'storm', name: 'Storm and Flame', icon: '🌩️', color: '#ff9a5a',
    test: t => t.includes('flynn') && t.includes('leo'),
    desc: 'Flynn and Leo together. Burn and Shock deal 30% more damage.',
    apply: P => P.forEach(p => { p.flags.storm = true; }) },
  { id: 'wall', name: 'Shield Wall', icon: '🧱', color: '#c9d2e6',
    test: t => t.includes('angus') && t.includes('david'),
    desc: 'Angus and David together. Both gain DEF +20% and start with a Shield worth 10% max HP.',
    apply: P => P.forEach(p => { if (p.id === 'angus' || p.id === 'david') { p.mods.def += 0.2; p.flags.wallShield = true; } }) },
  { id: 'radiant', name: 'Radiant Ward', icon: '🔆', color: '#fff2a8',
    test: t => t.includes('elphi') && t.includes('daniel'),
    desc: 'Elphi and Danielle together. Every Shield the team grants is 25% stronger.',
    apply: P => P.forEach(p => { p.mods.shield += 0.25; }) },
  { id: 'immortal', name: 'Old Acquaintances', icon: '⏳', color: '#a8ffd8',
    test: t => t.includes('harry') && t.includes('malakai'),
    desc: 'Harry and Malakai have both outlived eras. Both gain SPD +10% and 20% ultimate charge at the start.',
    apply: P => P.forEach(p => { if (p.id === 'harry' || p.id === 'malakai') { p.mods.spd += 0.1; p.ult = Math.max(p.ult, 20); } }) }
];

/* ---------- Gauntlet boons ---------- */
const BOONS = {
  whetstone: { name: 'Whetstone', icon: '⚔️', desc: 'Team ATK +12%.', apply: P => P.forEach(p => p.mods.atk += 0.12) },
  ironskin:  { name: 'Iron Skin', icon: '🛡️', desc: 'Team DEF +18%.', apply: P => P.forEach(p => p.mods.def += 0.18) },
  boots:     { name: 'Swift Boots', icon: '💨', desc: 'Team SPD +8%.', apply: P => P.forEach(p => p.mods.spd += 0.08) },
  draught:   { name: 'Vital Draught', icon: '❤️', desc: 'Team max HP +15%.', apply: P => P.forEach(p => p.mods.hp += 0.15) },
  keen:      { name: 'Keen Eye', icon: '🎯', desc: 'Team crit chance +10%.', apply: P => P.forEach(p => p.mods.crit += 0.1) },
  brutal:    { name: 'Brutal Edge', icon: '💥', desc: 'Team crit damage +35%.', apply: P => P.forEach(p => p.mods.cdmg += 0.35) },
  vamp:      { name: 'Thirsting Steel', icon: '🩸', desc: 'Heal for 10% of all damage dealt.', apply: P => P.forEach(p => p.mods.lifesteal += 0.1) },
  rhythm:    { name: 'Battle Rhythm', icon: '🥁', desc: 'Ultimates charge 30% faster.', apply: P => P.forEach(p => p.mods.ultGain += 0.3) },
  reserve:   { name: 'Deep Reserve', icon: '🔷', desc: 'Max SP +1 and start each battle with 1 extra SP.', apply: (P, B) => { B.spMax += 1; B.bonusSp = (B.bonusSp || 0) + 1; } },
  exec:      { name: 'Executioner', icon: '🪓', desc: 'Deal 30% more damage to enemies below 30% HP.', apply: P => P.forEach(p => p.mods.exec += 0.3) },
  kindling:  { name: 'Lingering Wounds', icon: '🔥', desc: 'Burn, Shock, Bleed and Poison you inflict deal 40% more damage.', apply: P => P.forEach(p => p.mods.dot += 0.4) },
  head:      { name: 'Head Start', icon: '⏩', desc: 'Your team acts first at the start of each battle.', apply: (P, B) => { B.headStart = true; } },
  herbs:     { name: 'Mending Herbs', icon: '🌿', desc: 'Healing +30% and Shields +20%.', apply: P => P.forEach(p => { p.mods.heal += 0.3; p.mods.shield += 0.2; }) },
  phoenix:   { name: 'Phoenix Ash', icon: '🪶', desc: 'Once per battle, the first ally to fall revives at 30% HP.', apply: (P, B) => { B.phoenix = true; } },
  campfire:  { name: 'Campfire', icon: '🏕️', desc: 'Right now: heal every ally to full and revive the fallen.', instant: true }
};
const GAUNTLET_POOL = [
  ['bandit', 'archer', 'brute', 'wolf', 'drake', 'sprite'],
  ['bandit', 'archer', 'brute', 'wolf', 'drake', 'alpha', 'cultist', 'zealot', 'priest', 'homunculus'],
  ['alpha', 'cultist', 'zealot', 'priest', 'homunculus', 'wisp', 'brute', 'golem']
];
const GAUNTLET_BOSSES = [
  ['drake', 'wyvern', 'drake'],
  ['homunculus', 'malakaiBoss', 'homunculus'],
  ['wisp', 'elphiBoss', 'wisp'],
  ['chosenBoss'],
  ['yunzeBoss'],
  ['harryBoss']
];

/* ================= v1.1 CONTENT ================= */
Object.assign(ENEMIES, {
  banditKing: { name: 'Varro', title: 'King of the Old Road', color: '#e0a040', boss: true, stats: { hp: 4800, atk: 118, def: 72, spd: 106, crit: 0.12, eva: 0.06 },
    look: { kind: 'human', skin: '#c99068', hair: '#2a1a10', hairStyle: 'messy', eye: '#2a1a0e', body: 'armour', bodyColor: '#6a4a2a', trim: '#e0a040', crown: true, bg: '#5a2e10', weapon: 'sword', big: true, brow: 'firm', beard: '#2a1a10' },
    moves: [
      { id: 'cleave', name: 'Kingsblade', icon: '🗡️', target: 'single', mult: 1.3, w: 3, fx: 'slash' },
      { id: 'execute', name: 'Execute', icon: '🪓', target: 'single', mult: 1.9, tp: 'lowest', acc: -0.05, w: 4, cd: 3, fx: 'smash' },
      { id: 'rally', name: 'Rally the Road', icon: '📯', target: 'allies', heal: 0.06, allies: { key: 'atkUp', turns: 2, value: 0.25 }, w: 3, cd: 3, fx: 'buff' },
      { id: 'call', name: 'Call the Gang', icon: '📣', target: 'self', run: 'summon', summonId: 'bandit', w: 5, cd: 3, cond: e => friendsOf(e).length < 3 }
    ],
    half: { title: 'The king draws a second blade', sub: 'ATK +30%', run: e => addStatus(e, 'enrage', 99) } },
  lurker: { name: 'Mire Lurker', color: '#8ab05a', stats: { hp: 1500, atk: 108, def: 85, spd: 88, eva: 0.02 },
    look: { kind: 'blob', goo: '#4a6a3a', eye: '#e8f05a', bg: '#1e2e16' },
    moves: [
      { id: 'drag', name: 'Drag Under', icon: '🫳', target: 'single', mult: 1.2, acc: -0.08, status: { key: 'spdDown', turns: 2, value: 0.25 }, w: 3, fx: 'smash' },
      { id: 'engulf', name: 'Engulf', icon: '🫧', target: 'single', mult: 0.9, status: { key: 'stun', turns: 1, chance: 0.45 }, w: 2, cd: 3, fx: 'acid' }
    ] },
  witch: { name: 'Bog Witch', color: '#9be05a', priority: true, stats: { hp: 950, atk: 104, def: 50, spd: 112, eva: 0.08 },
    look: { kind: 'hood', cloak: '#2e4a22', eye: '#b8ff5a', bg: '#1a2a12', hat: true },
    moves: [
      { id: 'hex', name: 'Rot Hex', icon: '☠️', target: 'single', mult: 0.7, status: { key: 'poison', turns: 3, stacks: 2, dot: 0.3 }, w: 3, fx: 'hex' },
      { id: 'sink', name: 'Sinking Curse', icon: '🕯️', target: 'all', status: { key: 'defDown', turns: 2, value: 0.2 }, w: 2, cd: 3, fx: 'hex' },
      { id: 'brew', name: 'Bog Brew', icon: '🍵', target: 'allies', heal: 0.12, w: 4, cd: 2, cond: e => friendsOf(e).some(a => a.hp / a.maxHp < 0.8) }
    ] },
  stormling: { name: 'Stormling', color: '#6fd6ff', stats: { hp: 650, atk: 98, def: 55, spd: 128, eva: 0.15 },
    look: { kind: 'wisp', glow: '#6fd6ff', bg: '#0e2440' },
    moves: [
      { id: 'zap', name: 'Arc Zap', icon: '⚡', target: 'single', mult: 0.95, status: { key: 'shock', turns: 2, chance: 0.5, dot: 0.25 }, w: 3, fx: 'bolt' },
      { id: 'feed', name: 'Feed the Idol', icon: '🔋', target: 'ally', tp: 'boss', shield: 0.08, w: 2, cd: 3 }
    ] },
  tempestIdol: { name: 'The Tempest Idol', title: 'It hums before it strikes', color: '#6fd6ff', boss: true, stats: { hp: 6200, atk: 124, def: 110, spd: 96, eva: 0 },
    look: { kind: 'golem', rock: '#4a5a78', eye: '#9fe6ff', bg: '#0e1e3a', big: true },
    moves: [
      { id: 'slam', name: 'Thunder Slam', icon: '🔨', target: 'single', mult: 1.35, acc: -0.08, w: 3, fx: 'smash' },
      { id: 'field', name: 'Static Field', icon: '🌩️', target: 'all', mult: 0.6, status: { key: 'shock', turns: 2, chance: 0.6, dot: 0.25 }, w: 3, cd: 2, fx: 'staticfield' },
      { id: 'charge', name: 'Gather the Storm', icon: '🔋', target: 'self', run: 'charge', breakAt: 0.12, w: 5, cd: 4 }
    ],
    charged: { id: 'cataclysm', name: 'Cataclysm', icon: '⛈️', target: 'all', mult: 1.8, sure: true, fx: 'cataclysm' } },
  prophet: { name: 'The Hollow Prophet', title: 'The cult\'s faith walks on two legs', color: '#ffd56b', boss: true, stats: { hp: 5600, atk: 120, def: 80, spd: 110, eva: 0.06 },
    look: { kind: 'hood', cloak: '#4a3a10', eye: '#ffe066', halo: true, bg: '#2e2408' },
    moves: [
      { id: 'smite', name: 'Hollow Smite', icon: '✴️', target: 'single', mult: 1.3, w: 3, fx: 'darkbolt' },
      { id: 'sermon', name: 'Sermon', icon: '📿', target: 'allies', heal: 0.1, allies: { key: 'atkUp', turns: 2, value: 0.2 }, w: 3, cd: 3 },
      { id: 'raise', name: 'Rise Again', icon: '⚰️', target: 'self', run: 'raise', w: 7, cd: 3, cond: e => B.enemies.some(x => !x.alive && !x.def.boss && !x.flags.raised) },
      { id: 'judgement', name: 'Judgement', icon: '☀️', target: 'all', mult: 0.75, status: { key: 'atkDown', turns: 2, value: 0.2, chance: 0.5 }, w: 3, cd: 2, fx: 'radiant' }
    ] },
  shard: { name: 'Mirror Shard', color: '#cfe8ff', priority: true, stats: { hp: 720, atk: 90, def: 70, spd: 118, eva: 0.12 },
    look: { kind: 'shard', glow: '#cfe8ff', bg: '#1e2a3e' },
    moves: [
      { id: 'glint', name: 'Glint', icon: '✨', target: 'single', mult: 0.9, status: { key: 'blind', turns: 1, chance: 0.3 }, w: 3, fx: 'light' },
      { id: 'polish', name: 'Polish', icon: '💠', target: 'ally', tp: 'boss', shield: 0.1, w: 3, cd: 2 }
    ] },
  mirrorKnight: { name: 'The Mirror Knight', title: 'Strike him at the wrong moment and you strike yourself', color: '#cfe8ff', boss: true, multi: 2, stats: { hp: 6400, atk: 128, def: 100, spd: 108, crit: 0.12, eva: 0.08 },
    look: { kind: 'human', skin: '#d8dde8', hair: '#c0c8d8', hairStyle: 'short', eye: '#9fd0ff', body: 'armour', bodyColor: '#9aa6bc', trim: '#e8f2ff', helm: 'visor', visorGlow: '#9fd0ff', bg: '#1e2a44', weapon: 'sword' },
    moves: [
      { id: 'edge', name: 'Silver Edge', icon: '⚔️', target: 'single', mult: 1.3, w: 3, fx: 'lightslash' },
      { id: 'mirror', name: 'Mirror Stance', icon: '🪞', target: 'self', self: { key: 'mirror', turns: 1 }, w: 5, cd: 3 },
      { id: 'shatter', name: 'Shatterstorm', icon: '💥', target: 'all', mult: 0.85, w: 3, cd: 2, fx: 'radiant' },
      { id: 'turned', name: 'Turned Blade', icon: '↩️', target: 'single', mult: 1.0, tp: 'strongest', status: { key: 'atkDown', turns: 2, value: 0.25 }, w: 2, cd: 3, fx: 'slash' }
    ],
    half: { title: 'The mirror cracks', sub: 'SPD +20%', run: e => addStatus(e, 'spdUp', 99, { value: 0.2 }) } },
  sellsword: { name: 'Sellsword', color: '#c9a07a', stats: { hp: 1100, atk: 118, def: 70, spd: 104, eva: 0.08 },
    look: { kind: 'human', skin: '#d8b08a', hair: '#4a3a2a', hairStyle: 'short', eye: '#3a2a1a', body: 'armour', bodyColor: '#5a5a62', trim: '#c9a07a', bg: '#3a2a20', weapon: 'sword', brow: 'firm' },
    moves: [
      { id: 'cut', name: 'Paid Cut', icon: '⚔️', target: 'single', mult: 1.2, w: 3, fx: 'slash' },
      { id: 'sunder', name: 'Sunder', icon: '🔨', target: 'single', mult: 1.0, tp: 'strongest', status: { key: 'defDown', turns: 2, value: 0.25 }, w: 2, cd: 3, fx: 'smash' }
    ] },
  crossbow: { name: 'Crossbowman', color: '#a8c070', stats: { hp: 820, atk: 122, def: 45, spd: 112, eva: 0.1, acc: 0.1 },
    look: { kind: 'hood', cloak: '#3a3a2a', eye: '#ffd56b', bg: '#24241a' },
    moves: [
      { id: 'heavy', name: 'Heavy Bolt', icon: '🏹', target: 'single', mult: 1.35, tp: 'squishy', w: 3, fx: 'arrow' },
      { id: 'pin', name: 'Pinning Shot', icon: '📌', target: 'single', mult: 0.8, status: { key: 'spdDown', turns: 2, value: 0.3 }, w: 2, cd: 3, fx: 'arrow' }
    ] },
  shieldbearer: { name: 'Shieldbearer', color: '#9aa6bc', elite: true, stats: { hp: 1900, atk: 104, def: 130, spd: 92, eva: 0.02 },
    look: { kind: 'human', skin: '#c89a78', hair: '#2a2a2a', hairStyle: 'bald', eye: '#2a1a10', body: 'armour', bodyColor: '#7a8294', trim: '#c9d2e6', bg: '#2a3040', weapon: 'club', big: true, helm: 'visor', visorGlow: '#ffd56b' },
    moves: [
      { id: 'bash', name: 'Shield Bash', icon: '🛡️', target: 'single', mult: 1.0, status: { key: 'stun', turns: 1, chance: 0.35 }, w: 3, fx: 'smash' },
      { id: 'brace', name: 'Brace the Line', icon: '🧱', target: 'allies', shield: 0.12, w: 3, cd: 3 }
    ] },
  ironWarden: { name: 'The Iron Warden', title: 'Its plates must break before it does', color: '#ff9a5a', boss: true, stats: { hp: 7000, atk: 128, def: 120, spd: 94, eva: 0 },
    look: { kind: 'golem', rock: '#6a7080', eye: '#ff8a3a', bg: '#2a1a10', big: true, plates: true },
    moves: [
      { id: 'hammer', name: 'Warden\'s Hammer', icon: '🔨', target: 'single', mult: 1.45, acc: -0.08, w: 3, fx: 'smash' },
      { id: 'vent', name: 'Furnace Vent', icon: '🔥', target: 'all', mult: 0.7, status: { key: 'burn', turns: 2, chance: 0.7, dot: 0.25 }, w: 3, cd: 2, fx: 'firebreath' },
      { id: 'reforge', name: 'Reforge', icon: '⚙️', target: 'self', run: 'reforge', w: 8, cd: 3, cond: e => !has(e, 'plated') && !has(e, 'exposed') }
    ] },
  shade: { heroId: 'yunze', ghost: true, name: 'Afterimage', color: '#4fb3ff', stats: { hp: 900, atk: 112, def: 50, spd: 138, crit: 0.15, eva: 0.25 },
    moves: [
      { id: 'switch', name: 'Switch Hands', icon: '🔪', target: 'single', mult: 0.55, hits: 2, w: 3, fx: 'dagger' },
      { id: 'flicker', name: 'Flicker', icon: '👤', target: 'self', self: { key: 'afterimage', turns: 2 }, w: 2, cd: 3 }
    ] }
});

/* Evasion (chance to dodge) and accuracy (cancels evasion) */
const EVA_TABLE = {
  angus: 0.03, flynn: 0.1, leo: 0.08, harry: 0.15, chosen: 0.1, elphi: 0.06, daniel: 0.08, yunze: 0.17, malakai: 0.07, lachlan: 0.06, yousuf: 0.08, gemia: 0.17, david: 0.04,
  bandit: 0.08, archer: 0.12, brute: 0.03, wolf: 0.16, alpha: 0.12, sprite: 0.1, golem: 0, drake: 0.1, wyvern: 0.05, cultist: 0.08, zealot: 0.06, priest: 0.06,
  homunculus: 0.04, wisp: 0.18, malakaiBoss: 0.1, elphiBoss: 0.08, chosenBoss: 0.12, yunzeBoss: 0.2, harryBoss: 0.12
};
const ACC_TABLE = { chosen: 0.05, harry: 0.05, archer: 0.08 };
for (const [id, v] of Object.entries(EVA_TABLE)) { const d = HEROES[id] || ENEMIES[id]; if (d.stats.eva == null) d.stats.eva = v; }
for (const [id, v] of Object.entries(ACC_TABLE)) { const d = HEROES[id] || ENEMIES[id]; d.stats.acc = v; }
const HEAVY = { brute: ['club', 'crack'], golem: ['smash'], wyvern: ['tail'], alpha: ['maul'] };
for (const [id, ms] of Object.entries(HEAVY)) ENEMIES[id].moves.forEach(m => { if (ms.includes(m.id)) m.acc = -0.08; });
ENEMIES.archer.moves[0].acc = 0.1;
HEROES.harry.passive.desc = '15% evasion. Cannot be stunned. Once per battle, survives a lethal blow with 1 HP. Present in all three eras.';
HEROES.yunze.passive.desc = 'Lone Hunter. 17% evasion. Extremely fast: SPD 190, so he acts about twice as often as most heroes. He works alone: his basics give the team no SP and his skill costs none. Deals 30% more damage to the enemy with the highest max HP. His ultimate charges 30% slower per action.';

/* ---------- Unlocks ---------- */
const GAME_VERSION = '0.4.6';

const STARTERS = ['angus', 'flynn', 'leo'];
const UNLOCK_FROM = {};
STAGES.forEach(s => { if (s.reward) UNLOCK_FROM[s.reward] = s.id; });

/* ---------- Builds ---------- */
const BALANCED = { id: 'balanced', name: 'Balanced', icon: '⚖️', desc: 'The standard kit. No trade-offs.' };
const BUILDS = {
  angus: [
    { id: 'bulwark', name: 'Bulwark', icon: '🛡️', desc: 'Max HP +12% and DEF +10%, ATK -15%. Aura of Iron taunts for 3 turns.', mods: { hp: 0.12, def: 0.1, atk: -0.15 }, tags: { tauntTurns: 3 } },
    { id: 'warlord', name: 'Warlord', icon: '⚔️', desc: 'ATK +20%, DEF -10%. Steadfast Cut deals 155% ATK.', mods: { atk: 0.2, def: -0.1 }, tags: { basicMult: 1.55 } }
  ],
  flynn: [
    { id: 'overload', name: 'Overload', icon: '💥', desc: 'Crit damage +30%. Chain Lightning arcs deal 85% ATK instead of 60%. Spark Jab only Shocks 20% of the time.', mods: { cdmg: 0.3 }, tags: { arcMult: 0.85, shockCh: 0.2 } },
    { id: 'static', name: 'Static', icon: '⚡', desc: 'Spark Jab always Shocks. Shock you apply deals 40% more damage. ATK -8%.', mods: { atk: -0.08, dot: 0.4 }, tags: { sureShock: 1 } }
  ],
  leo: [
    { id: 'pyro', name: 'Pyromancer', icon: '🔥', desc: 'Burn you apply deals 40% more damage and the beam adds 2 Burn stacks per hit. The beam ramps slower (105%, 130%, 155%, 180% ATK) but only breaks at 40% of his max HP.', mods: { dot: 0.4 }, tags: { beamBurn: 2, ramp: [1.05, 1.3, 1.55, 1.8], beamBreak: 0.4 } },
    { id: 'lancer', name: 'Lancer', icon: '☄️', desc: 'The beam ramps faster and higher (130%, 180%, 235%, 290% ATK) but breaks at 18% of his max HP. Flame Bolt no longer Burns.', tags: { ramp: [1.3, 1.8, 2.35, 2.9], beamBreak: 0.18, noBoltBurn: 1 } }
  ],
  harry: [
    { id: 'stillwater', name: 'Still Water', icon: '🌊', desc: 'Backlash: when an enemy attacks him with a single-target move, 30% chance to crush them back for 140% ATK, ignoring DEF. Always triggers if he dodges. Once per enemy action. ATK -10%.', mods: { atk: -0.1 }, tags: { backlash: 0.3 } },
    { id: 'force', name: 'Force', icon: '✊', desc: 'Crush deals 200% ATK instead of 135%. SPD -8%.', mods: { spd: -0.08 }, tags: { crushMult: 2.0 } }
  ],
  chosen: [
    { id: 'valkyrie', name: 'Valkyrie', icon: '🪽', desc: 'Judgement of Wings gains 35% per Grace stack instead of 20%. Max HP -4%.', mods: { hp: -0.04 }, tags: { gracePer: 0.35 } },
    { id: 'dancer', name: 'Dancer', icon: '💃', desc: 'SPD +10%. Gilded Dance strikes 4 times, but no longer gives her a Shield.', mods: { spd: 0.1 }, tags: { danceHits: 4, noDanceShield: 1 } }
  ],
  elphi: [
    { id: 'sentinel', name: 'Sentinel', icon: '🛡️', desc: 'DEF +10%, ATK -10%. Sanctum Blade Shields are 35% stronger and he rises with 60% of his max HP instead of 45%.', mods: { def: 0.1, atk: -0.1 }, tags: { ultShield: 0.15, riseHp: 0.6 } },
    { id: 'dawn', name: 'Dawnbreaker', icon: '🌟', desc: 'Radiant Arc deals 100% ATK and Blinds 85% of the time. DEF -10%, and he rises with only 30% of his max HP.', mods: { def: -0.1 }, tags: { arcMult: 1.0, blindCh: 0.85, riseHp: 0.3 } }
  ],
  daniel: [
    { id: 'bastion', name: 'Bastion', icon: '🔮', desc: 'Crystal Ward Shields are 15% stronger and can reach 45% of the ally\'s max HP. Riposte chance drops from 45% to 30%.', tags: { wardMult: 1.15, wardCap: 0.45, counter: 0.3 } },
    { id: 'duelist', name: 'Duelist', icon: '🤺', desc: 'ATK +12%. Riposte chance rises from 45% to 70% and ripostes deal 120% ATK. Crystal Ward Shields are 20% weaker and cap at 30% of the ally\'s max HP.', mods: { atk: 0.12 }, tags: { counter: 0.7, ripMult: 1.2, wardMult: 0.8, wardCap: 0.3 } }
  ],
  yunze: [
    { id: 'phantom', name: 'Phantom', icon: '👤', desc: 'Evasion +4%. Switch Hands leaves an Afterimage 20% of the time. ATK -12%.', mods: { eva: 0.04, atk: -0.12 }, tags: { basicImage: 0.2 } },
    { id: 'reaper', name: 'Reaper', icon: '💀', desc: 'Crit damage +40%. Hunted targets take 40% more damage from him instead of 25%. Evasion -8%.', mods: { cdmg: 0.4, eva: -0.08 }, tags: { hunt: 0.4 } }
  ],
  malakai: [
    { id: 'apothecary', name: 'Apothecary', icon: '🍶', desc: 'Elite Bargain costs no HP and heals the ally for 5% max HP instead, but its ATK boost drops from +35% to +22%.', tags: { freeBargain: 1, bargainAtk: 0.22, bargainHeal: 0.05 } },
    { id: 'toxin', name: 'Toxicologist', icon: '☠️', desc: 'Poison you apply deals 65% more damage. Volatile Flask always Poisons. Grand Transmutation heals allies for 14% instead of 20%.', mods: { dot: 0.65 }, tags: { alwaysPoison: 1, transHeal: 0.14 } }
  ],
  lachlan: [
    { id: 'aegis', name: 'Aegis', icon: '🔵', desc: 'Azure Shield caps at 44% max HP and regenerates 8.5% per turn. ATK -10%.', mods: { atk: -0.1 }, tags: { shieldCap: 0.44, shieldRegen: 0.085 } },
    { id: 'orbcaster', name: 'Orbcaster', icon: '💠', desc: 'ATK +8%. Far stance splash deals 50% ATK. Azure Shield caps at 25%.', mods: { atk: 0.08 }, tags: { splash: 0.5, shieldCap: 0.25 } }
  ],
  yousuf: [
    { id: 'mender', name: 'Mender', icon: '✚', desc: 'Healing +10%. ATK -10%, SPD -6%.', mods: { heal: 0.1, atk: -0.1, spd: -0.06 } },
    { id: 'battlemage', name: 'Battle Mage', icon: '🪄', desc: 'ATK +25%. Staff Strike heals for 100% of the damage dealt. Healing from other sources -15%.', mods: { atk: 0.25, heal: -0.15 }, tags: { staffHeal: 1.0 } }
  ],
  gemia: [
    { id: 'tempo', name: 'Tempo', icon: '⏩', desc: 'Swift Cut brings her next turn 35% sooner. ATK -5%.', mods: { atk: -0.05 }, tags: { advance: 0.35 } },
    { id: 'storm', name: 'Bladestorm', icon: '🌪️', desc: 'Flurry strikes 5 times with a 40% Bleed chance per hit. SPD -6%.', mods: { spd: -0.06 }, tags: { flurryHits: 5, bleedCh: 0.4 } }
  ],
  david: [
    { id: 'phalanx', name: 'Phalanx', icon: '🧱', desc: 'While guarding he takes 45% less damage instead of 40%. DEF +10%. ATK -10%.', mods: { def: 0.1, atk: -0.1 }, tags: { guardDr: 0.45 } },
    { id: 'impaler', name: 'Impaler', icon: '🔱', desc: 'ATK +18%. Spear Thrust lowers DEF by 25% instead of 15%.', mods: { atk: 0.18 }, tags: { spearDef: 0.25 } }
  ]
};
for (const id of Object.keys(BUILDS)) BUILDS[id].unshift(BALANCED);
const buildOf = (id, bid) => (BUILDS[id] || [BALANCED]).find(b => b.id === bid) || BALANCED;

/* ---------- Balance changes (newest first) ----------
   t: buff | nerf | rework | new | harder | easier | adjust
   kind: hero (who = hero id) | enemy (who = enemy id) | stage (who = stage id) | system (who = label) */
const BALANCE = [
  { v: '0.4.6', date: 'Elphi reworked', changes: [
    { t: 'rework', kind: 'hero', who: 'elphi', what: 'Last Light', text: 'New: he rises once per battle', from: 'nothing', to: 'the first time he falls he returns with 45% of his max HP and keeps ATK +40% and +10% crit chance', note: 'He is the one who stood in the way and did not stop. Once per battle only.' },
    { t: 'buff', kind: 'hero', who: 'elphi', what: 'Lightblade', text: 'Damage', from: '100%', to: '120% ATK' },
    { t: 'nerf', kind: 'hero', who: 'elphi', what: 'Sanctum Blade', text: 'Shield for every ally', from: '15%', to: '11% of his max HP' },
    { t: 'nerf', kind: 'hero', who: 'elphi', what: 'Last Light', text: 'Shield when an ally drops low', from: '15%', to: '10% of his max HP' },
    { t: 'adjust', kind: 'hero', who: 'elphi', what: 'Sentinel / Dawnbreaker', text: 'Both builds now also decide how much he rises with', from: 'no effect', to: 'Sentinel 60%, Dawnbreaker 30%', note: 'Composite 55.4 to 56.0, so the shield cuts pay for the rest. Duel 34 to 50. He leans on the sword now rather than on shielding everyone.' }
  ] },
  { v: '0.4.5', date: 'Aamay reworked', changes: [
    { t: 'rework', kind: 'hero', who: 'aamay', what: 'The Chronicle', text: 'What adds a Page', from: 'any action by anyone', to: 'any action by an enemy', note: 'Standing him beside a fast hero used to fill the Chronicle twice as fast, which is what made the Yunze pairing absurd.' },
    { t: 'buff', kind: 'hero', who: 'aamay', what: 'The Chronicle', text: 'Pages it holds', from: '12', to: '20, plus 2 for every hero who falls on either side' },
    { t: 'nerf', kind: 'hero', who: 'aamay', what: 'The Last Page', text: 'Damage per Page', from: '30%', to: '15% ATK' },
    { t: 'nerf', kind: 'hero', who: 'aamay', what: 'The Last Page', text: 'Ultimate charge rate', from: 'normal', to: '40% slower' },
    { t: 'rework', kind: 'hero', who: 'aamay', what: 'The Chronicle', text: 'New: he works where nobody visits', from: 'nothing', to: 'while another hero stands, an enemy aiming at him looks elsewhere 30% of the time, fading to nothing as the Chronicle fills', note: 'He is safest with nothing written and fully exposed when the ultimate is ready. Unlike Seraphine he can always be reached.' },
    { t: 'nerf', kind: 'hero', who: 'aamay', text: 'Max HP / ATK', from: '1300 / 124', to: '1180 / 110' },
    { t: 'nerf', kind: 'hero', who: 'aamay', what: 'Ink Flick', text: 'Damage', from: '95%', to: '85% ATK' },
    { t: 'nerf', kind: 'hero', who: 'aamay', what: 'Seal in Ink', text: 'Damage', from: '70%', to: '55% ATK' },
    { t: 'buff', kind: 'hero', who: 'aamay', what: 'Seal in Ink', text: 'Debuff', from: 'SPD -20% for 2 turns', to: 'SPD -30% and ATK -20%, both for 3 turns' },
    { t: 'adjust', kind: 'hero', who: 'aamay', what: 'Archivist / Inquisitor', text: 'Rebuilt around the new numbers', from: '16 Pages / 24% each', to: '26 Pages / 12% each', note: 'Composite 50.6 to 58.3. Surviving was his weakness, so being overlooked is worth far more than the rest costs.' }
  ] },
  { v: '0.4.4', date: 'Last Stand removed, David, Seraphine, Harry, Lachlan', changes: [
    { t: 'rework', kind: 'system', who: 'Last Stand', text: 'Removed entirely', from: '+35% damage and 15% less taken for the last hero standing, on ten heroes', to: 'gone', note: 'It was there to prop supports up in duels and put the same paragraph in ten passives. It also quietly applied to a hero boss fighting alone. Duel numbers get fixed per hero from now on.' },
    { t: 'buff', kind: 'hero', who: 'david', what: 'Sworn Guard', text: 'Damage cut while guarding', from: '40%', to: '50%' },
    { t: 'buff', kind: 'hero', who: 'david', what: 'Sworn Guard', text: 'Healing per hit intercepted for the guarded ally', from: 'none', to: '3% of his max HP', note: 'His guard now catches the fourteen skills that used to walk past it, so the reward grows with the extra work. Composite 48.7 to 56.' },
    { t: 'nerf', kind: 'hero', who: 'seraphine', what: 'Behind the Scenes', text: 'What hides her', from: 'any living ally, creatures included, and every enemy', to: 'a living hero only, and bosses see her anyway' },
    { t: 'nerf', kind: 'hero', who: 'harry', what: 'Crush', text: 'Damage', from: '150%', to: '135% ATK', note: 'Force build 220% to 200%. He was the only hero above the band at 63.6, now 59.2.' },
    { t: 'nerf', kind: 'hero', who: 'lachlan', text: 'Max HP', from: '1400', to: '1290', note: 'Top of the duel table at 93, now 85.' },
    { t: 'adjust', kind: 'hero', who: 'harry', what: 'Force', text: 'Build text quoted a baseline that was never true', from: 'instead of 175%', to: 'instead of 135%' }
  ] },
  { v: '0.4.1', date: 'Guard, creatures and mimicry', changes: [
    { t: 'rework', kind: 'hero', who: 'david', what: 'Hold the Line', text: 'Which attacks the guard catches', from: 'only ordinary attacks', to: 'every single-target attack', note: 'Fourteen skills bypassed it, including Crush, Phantom Switch, Finger Frame and Sanctum Blade. Area attacks still ignore it, as described.' },
    { t: 'rework', kind: 'hero', who: 'vasco', what: 'Mimicry', text: 'What it copies', from: 'a flat 100% / 140% / 180% by slot, effects dropped', to: 'the real strength and effect of the move', note: 'Still capped so a boss move comes back balanced.' },
    { t: 'adjust', kind: 'rule', what: 'End of battle summary', text: 'Damage dealt and soaked by a creature', from: 'lost when it died', to: 'credited to whoever summoned it' }
  ] },
  { v: '0.3.8', old: '0.92', date: 'Alfred, duels and healers', changes: [
    { t: 'nerf', kind: 'hero', who: 'alfred', text: 'Crit chance', from: '20%', to: '14%' },
    { t: 'nerf', kind: 'hero', who: 'alfred', what: 'Finger Frame', text: 'Framed crit bonus for the whole team', from: '+25%', to: '+15%' },
    { t: 'nerf', kind: 'hero', who: 'alfred', text: 'Odd Cut / Finger Frame / Broken Rhythm', from: '115% / 110% / 6 × 80%', to: '112% / 95% / 6 × 75%' },
    { t: 'buff', kind: 'hero', who: 'alfred', text: 'Max HP / DEF', from: '1460 / 88', to: '1560 / 95', note: 'Keeps him playable after the damage and crit cuts. Composite 42 → 38.' },
    { t: 'new', kind: 'system', who: 'Last Stand', text: 'The last hero standing on a side deals 35% more damage and takes 15% less, for supports and defenders only: Angus, Elphi, Malakai, Yousuf, David, Soham, Ethan, Ben, Kingsley and Aamay.', note: 'Narrows 1v1 duels without changing team fights much.' },
    { t: 'nerf', kind: 'hero', who: 'yunze', what: 'Lone Hunter', text: 'Bonus vs the highest max HP enemy', from: 'always', to: 'only with two or more enemies', note: '1v1 win rate 95% → 79%.' },
    { t: 'nerf', kind: 'hero', who: 'lachlan', what: 'Azure Shield', text: 'Cap / regen per turn', from: '35% / 7%', to: '30% / 6% of max HP' },
    { t: 'adjust', kind: 'hero', who: 'soham', what: 'Hexagon', text: 'With no allies left, Hexagon on himself gives the strong single shield instead of the team wall.' },
    { t: 'nerf', kind: 'hero', who: 'yousuf', text: 'Heals on himself', from: '100%', to: '90%' },
    { t: 'nerf', kind: 'hero', who: 'kingsley', text: 'Heals on himself', from: '100%', to: '90%' },
    { t: 'buff', kind: 'hero', who: 'yousuf', text: 'Mending Light / Staff Strike heal / Mended penalty', from: '10% + 95% ATK / 40% / -30%', to: '11% + 100% ATK / 45% / -25%', note: 'Offsets the self-heal cut for his allies.' },
    { t: 'buff', kind: 'hero', who: 'ethan', text: 'Royal Blade / ATK', from: '95% / 116', to: '115% / 120' },
    { t: 'adjust', kind: 'system', who: 'AI', text: 'Ethan no longer re-casts Royal Decree every turn when he is alone and already buffed.' },
    { t: 'buff', kind: 'hero', who: 'ben', text: 'Sharp Word / DEF', from: '110% / 86', to: '120% / 95' },
    { t: 'easier', kind: 'stage', who: 'kingtrial', text: 'Boss ATK / HP', from: '1.2× / 3.0×', to: '1.0× / 2.6×' },
    { t: 'easier', kind: 'stage', who: 'archive', text: 'Boss ATK / HP', from: '1.25× / 3.6×', to: '0.95× / 2.7×', note: 'Aamay gains Last Stand once his Ink Wraiths fall.' }
  ] },
  { v: '0.3.6', old: '0.9', date: 'The court of Ethan', changes: [
    { t: 'new', kind: 'hero', who: 'trigg', text: 'Summoner. Calls up to 2 creatures (imps; a Hellhound from his ultimate) that fight on their own turns and crumble if he falls.' },
    { t: 'new', kind: 'hero', who: 'alfred', text: 'Marksman. Tempo shifts every turn (Allegro 80% and acts sooner, Andante, Grave 140%). Finger Frame makes a target easy to hit and crit for the whole team.' },
    { t: 'new', kind: 'hero', who: 'ethan', text: 'Team buffer. Treasury makes SP, allies deal +8% damage while he stands, Royal Decree buffs the whole team.' },
    { t: 'new', kind: 'hero', who: 'ben', text: 'Turn controller. Give the Order (free, every other turn) makes an ally act at once; his ultimate delays every enemy.' },
    { t: 'new', kind: 'hero', who: 'kingsley', text: 'Second healer. Songs heal over time and cleanse; Borrowed Trinket draws one of four magic items at random.' },
    { t: 'new', kind: 'hero', who: 'vasco', text: 'Trickster. Mimics the last enemy attack on his team. Below 40% HP he becomes the Vessel: ATK +35%, lifesteal, double damage to Shields.' },
    { t: 'new', kind: 'hero', who: 'aamay', text: 'Hard control. Silence stops skills and ultimates (monsters use only their basic attack). His Chronicle gains a Page for every action and his ultimate spends them.' },
    { t: 'nerf', kind: 'hero', who: 'soham', what: 'Hexagon', text: 'Single / team Hex Shield', from: '32% / 11%', to: '29% / 10% of his max HP' },
    { t: 'nerf', kind: 'hero', who: 'soham', what: 'Hexagon Crush', text: 'Team Hex Shield', from: '15%', to: '13%' },
    { t: 'nerf', kind: 'hero', who: 'soham', what: 'Builds', text: 'Monolith single / Hex Breaker strength and blast', from: '44% / 80% and 70%', to: '40% / 75% and 65%', note: 'Both led Balanced by about 10 points.' },
    { t: 'nerf', kind: 'hero', who: 'elphi', what: 'Dawnbreaker build', text: 'Radiant Arc', from: '110%', to: '100% ATK' },
    { t: 'new', kind: 'system', who: 'Creatures', text: 'Summoned creatures fight on your row, act automatically, and do not count for stars or the battle summary.' },
    { t: 'new', kind: 'system', who: 'Statuses', text: 'Silenced, Framed, Song, Tempo, the Vessel and the Chronicle.' },
    { t: 'new', kind: 'system', who: 'Sudden death', text: 'From turn 150, all damage rises 5% every 10 turns and healing is halved, so stalemates end. Normal fights finish well before this.' }
  ] },
  { v: '0.3.4', old: '0.83', date: 'Tightening the field', changes: [
    { t: 'nerf', kind: 'hero', who: 'soham', what: 'Hexagon', text: 'Single / team Hex Shield', from: '38% / 13%', to: '32% / 11% of his max HP', note: 'Campaign 70% was the highest of any hero.' },
    { t: 'nerf', kind: 'hero', who: 'soham', what: 'Hexagon Crush', text: 'Team Hex Shield', from: '20%', to: '15%' },
    { t: 'nerf', kind: 'hero', who: 'soham', what: 'Monolith build', text: 'Single / team Hex Shield', from: '55% / 12%', to: '44% / 9%' },
    { t: 'nerf', kind: 'hero', who: 'harry', text: 'Katana Draw', from: '100%', to: '92% ATK', note: 'Composite 67.5, seven points above the next hero. Now 63, still the strongest.' },
    { t: 'nerf', kind: 'hero', who: 'harry', text: 'Crush', from: '160%', to: '150% ATK' },
    { t: 'nerf', kind: 'hero', who: 'harry', what: 'Unsealed', text: 'Damage bonus', from: '+42%', to: '+35%' },
    { t: 'nerf', kind: 'hero', who: 'harry', text: 'Max HP', from: '1400', to: '1340' },
    { t: 'nerf', kind: 'hero', who: 'yunze', text: 'Switch Hands', from: '2 × 42%', to: '2 × 40% ATK' },
    { t: 'nerf', kind: 'hero', who: 'seraphine', what: 'Twin Halos', text: 'Halo cuts', from: '40%', to: '35% ATK', note: 'Puppeteer 32% → 28%, Twin Edge 52% → 46%.' },
    { t: 'nerf', kind: 'hero', who: 'daniel', text: 'Riposte chance', from: '50%', to: '45%', note: 'Duelist 75% → 70%.' },
    { t: 'nerf', kind: 'hero', who: 'daniel', text: 'Crystal Ward Shield', from: '16%', to: '14% of her max HP' },
    { t: 'nerf', kind: 'hero', who: 'elphi', what: 'Last Light', text: 'Shield', from: '18%', to: '15% of his max HP' },
    { t: 'buff', kind: 'hero', who: 'gemia', text: 'ATK', from: '124', to: '130', note: 'Lowest composite (44).' },
    { t: 'buff', kind: 'hero', who: 'gemia', text: 'Flurry', from: '4 × 48%', to: '4 × 52% ATK' },
    { t: 'buff', kind: 'hero', who: 'leo', text: 'Max HP', from: '1300', to: '1360' },
    { t: 'buff', kind: 'hero', who: 'leo', what: 'Fire Beam', text: 'Ramp', from: '120 / 160 / 200 / 240%', to: '125 / 170 / 210 / 250%' },
    { t: 'buff', kind: 'hero', who: 'peguicha', text: 'Twin Reap / Cinderbead hit', from: '2 × 72% / 90%', to: '2 × 78% / 100%', note: '3v3 win rate was 38%.' },
    { t: 'buff', kind: 'hero', who: 'peguicha', text: 'Bead pain / Hellfire', from: '34% / 190%', to: '38% / 210% ATK' },
    { t: 'buff', kind: 'hero', who: 'david', text: 'ATK', from: '116', to: '122' },
    { t: 'buff', kind: 'hero', who: 'david', text: 'Guarding damage reduction', from: '35%', to: '40%' },
    { t: 'nerf', kind: 'hero', who: 'angus', what: 'Bulwark build', text: 'Max HP / DEF bonus', from: '+20% / +15%', to: '+12% / +10%', note: 'Bulwark led his builds by 8 points.' },
    { t: 'nerf', kind: 'hero', who: 'malakai', what: 'Apothecary build', text: 'Bargain heal / ATK boost', from: '10% / +25%', to: '5% / +22%', note: 'Apothecary led his builds by 11 points.' }
  ] },
  { v: '0.3.3', old: '0.82', date: 'Sharper identities', changes: [
    { t: 'new', kind: 'hero', who: 'angus', what: 'Unyielding Aura', text: 'Anyone who strikes Angus is Sapped: ATK -6% until the end of their next turn.' },
    { t: 'new', kind: 'hero', who: 'flynn', what: 'Overcharge', text: 'When an enemy Flynn Shocked falls, the Shock arcs to another enemy.' },
    { t: 'rework', kind: 'hero', who: 'elphi', what: 'Passive', text: 'Protector', from: 'allies below 50% HP take 15% less damage', to: 'Last Light: the first time each ally drops below 30% HP, a Shield worth 18% of his max HP' },
    { t: 'adjust', kind: 'system', who: 'Damage modifiers', text: 'Elphi\'s old damage reduction overlapped with Angus. Each defender now protects in a different way: Angus weakens attackers, Elphi saves allies at the brink, David redirects, Danielle and Soham shield.' }
  ] },
  { v: '0.3.2', old: '0.81', date: 'Vehra takes flight', changes: [
    { t: 'buff', kind: 'hero', who: 'vehra', text: 'SPD', from: '112', to: '128' },
    { t: 'new', kind: 'hero', who: 'vehra', what: 'Aloft', text: 'After each Rend and after Stonewing Crash she takes to the air: +18% evasion until her next turn. Stone Form grounds her.' },
    { t: 'new', kind: 'hero', who: 'vehra', what: 'Bloodlust', text: 'Damage to enemies below half HP', from: '+0%', to: '+30%', note: 'She also hunts the weakest enemy.' },
    { t: 'buff', kind: 'hero', who: 'vehra', text: 'Base evasion', from: '5%', to: '8%' },
    { t: 'nerf', kind: 'hero', who: 'vehra', text: 'Max HP / DEF / ATK', from: '1450 / 92 / 126', to: '1260 / 80 / 118' },
    { t: 'nerf', kind: 'hero', who: 'vehra', what: 'Stone Form', text: 'Damage reduction / mend', from: '60% / 12%', to: '50% / 9%' },
    { t: 'adjust', kind: 'hero', who: 'vehra', what: 'Bloodwing build', text: 'Bloodlust / lifesteal / Stone reduction', from: '+30% / 35% / 40%', to: '+45% / 35% / 30%' },
    { t: 'nerf', kind: 'hero', who: 'vehra', what: 'Granite build', text: 'Stone Form Shield', from: '8%', to: '6% of max HP' },
    { t: 'harder', kind: 'stage', who: 'vehra', text: 'Boss ATK / HP', from: '1.15× / 3.2×', to: '1.3× / 3.6×' },
    { t: 'adjust', kind: 'stage', who: 'cinder', text: 'Boss ATK / HP', from: '0.95× / 2.2×', to: '1.0× / 2.3×' }
  ] },
  { v: '0.3.1', old: '0.8', date: 'Stone, hexagons and halos', changes: [
    { t: 'rework', kind: 'hero', who: 'vehra', what: 'Role', text: 'Assassin', from: 'evasive double-claw striker', to: 'Stonewing: a sturdy bruiser who turns to stone and heals herself' },
    { t: 'rework', kind: 'hero', who: 'vehra', text: 'Stats', from: 'HP 1150, DEF 62, SPD 136, evasion 14%', to: 'HP 1450, DEF 92, SPD 112, evasion 5%' },
    { t: 'new', kind: 'hero', who: 'vehra', what: 'Stone Form', text: 'Skill: 60% less damage, Taunt, stun immunity and a 12% max HP mend at the start of her next turn. No dodging while stone.' },
    { t: 'new', kind: 'hero', who: 'vehra', what: 'Infernal Vigour', text: 'Her claws heal her for 20% of the damage they deal. Rend is one 110% strike with a 40% Bleed chance.' },
    { t: 'rework', kind: 'hero', who: 'vehra', what: 'Ultimate', text: 'Hellwing Frenzy', from: '6 strikes of 45%', to: 'Stonewing Crash: 220% to one target, 80% to the rest, 50% Stun, heals allies 8%' },
    { t: 'rework', kind: 'hero', who: 'soham', what: 'Hex Wall', text: 'Defence', from: 'an always-on wall soaking 30% of every hit', to: 'Hex Shields: strong but brittle, shattering after a set number of hits' },
    { t: 'new', kind: 'hero', who: 'soham', what: 'Hexagon', text: 'On an ally: Hex Shield worth 38% of his max HP for 3 hits. On himself: 13% on every ally for 2 hits. Usable every other turn. Hex Shields block stuns.' },
    { t: 'new', kind: 'hero', who: 'seraphine', what: 'Behind the Scenes', text: 'While any ally stands, enemies cannot single-target her.' },
    { t: 'new', kind: 'hero', who: 'seraphine', what: 'Severance', text: 'Her cuts leave marks (up to 5). Halo Storm detonates them for 30% ATK per stack.' },
    { t: 'nerf', kind: 'hero', who: 'harry', text: 'ATK', from: '134', to: '130', note: 'Harry led all three measures: campaign 64%, 3v3 76%, 1v1 81%.' },
    { t: 'nerf', kind: 'hero', who: 'harry', text: 'Crush', from: '175%', to: '160% ATK' },
    { t: 'nerf', kind: 'hero', who: 'harry', what: 'Unsealed', text: 'Damage / crit chance bonus', from: '+50% / +60%', to: '+42% / +50%' },
    { t: 'nerf', kind: 'hero', who: 'daniel', text: 'Riposte chance', from: '55%', to: '50%', note: 'Campaign 71% was well above her 3v3 54%.' },
    { t: 'nerf', kind: 'hero', who: 'daniel', text: 'Crystal Ward Shield', from: '18%', to: '16% of her max HP' },
    { t: 'nerf', kind: 'hero', who: 'yunze', text: 'Evasion', from: '20%', to: '17%', note: 'He still wins 97% of duels: his speed makes him the game\'s duellist. Team results are average.' },
    { t: 'rework', kind: 'hero', who: 'peguicha', what: 'Cinderbeads', text: 'Cleansing', from: 'removable', to: 'cannot be cleansed (they are physical beads)' },
    { t: 'buff', kind: 'hero', who: 'peguicha', text: 'Bead pain / ATK and DEF loss per bead', from: '28% / 8%', to: '34% / 10%', note: '3v3 win rate was 32%, the lowest.' },
    { t: 'buff', kind: 'hero', who: 'peguicha', text: 'Twin Reap', from: '2 × 65%', to: '2 × 72% ATK' },
    { t: 'adjust', kind: 'hero', who: 'peguicha', what: 'Reaper build', text: 'Twin Reap hits', from: '3 × 65%', to: '3 × 55%' },
    { t: 'buff', kind: 'hero', who: 'gemia', text: 'Swift Cut / Flurry', from: '100% / 4 × 42%', to: '110% / 4 × 48%' },
    { t: 'buff', kind: 'hero', who: 'gemia', text: 'Max HP / SPD', from: '1300 / 132', to: '1360 / 138' },
    { t: 'buff', kind: 'hero', who: 'leo', text: 'Max HP', from: '1240', to: '1300' },
    { t: 'buff', kind: 'hero', who: 'leo', what: 'Heat Haze', text: 'Evasion while channelling', from: '+12%', to: '+18%' },
    { t: 'buff', kind: 'hero', who: 'david', text: 'Guarding damage reduction', from: '30%', to: '35%' },
    { t: 'buff', kind: 'hero', who: 'david', text: 'Vengeance per stack', from: '+12%', to: '+16% damage' },
    { t: 'easier', kind: 'stage', who: 'cinder', text: 'Boss ATK / HP', from: '1.1× / 2.6×', to: '0.95× / 2.2×', note: 'Uncleansable beads made it much harder.' },
    { t: 'easier', kind: 'stage', who: 'hexwall', text: 'ATK / boss ATK / boss HP', from: '2.4× / 1.3× / 3.4×', to: '2.1× / 1.1× / 3.0×' },
    { t: 'easier', kind: 'stage', who: 'hidden', text: 'Boss ATK / HP', from: '0.9× / 1.9×', to: '0.8× / 1.6×', note: 'Seraphine can no longer be single-targeted while The Chosen stands.' }
  ] },
  { v: '0.3.0', old: '0.7', date: 'New heroes', changes: [
    { t: 'new', kind: 'hero', who: 'peguicha', text: 'New hero. Cinderbeads: embedded beads deal pain each turn (28% ATK per bead) and lower ATK and DEF by 8% per bead. He heals for 30% of their pain. Hellfire charges 30% slower.' },
    { t: 'new', kind: 'hero', who: 'vehra', text: 'New hero. 14% evasion, +25% damage to enemies below half HP. Wing Dive leaves her Airborne, dodging the next attack.' },
    { t: 'new', kind: 'hero', who: 'soham', text: 'New hero. Hex Wall: starts at 50% of his max HP, soaks 30% of every direct hit on his team until it runs out.' },
    { t: 'new', kind: 'hero', who: 'seraphine', text: 'New hero. Twin Halos cut twice for 40% ATK after each of her actions. Halo Storm gives The Chosen an immediate turn.' },
    { t: 'new', kind: 'system', who: 'Team bonuses', text: 'Infernal Pact (Peguicha and Vehra): +15% damage to debuffed enemies. The Hidden Hand (Seraphine and The Chosen): The Chosen ATK +15%, Seraphine crit +10%.' },
    { t: 'new', kind: 'system', who: 'Rivals', text: 'Harry and Soham are rivals. Seraphine deals +20% damage to Harry.' },
    { t: 'adjust', kind: 'hero', who: 'daniel', text: 'Daniel is now Danielle. Kit unchanged.' }
  ] },
  { v: '0.2.7', old: '0.63', date: 'Healing cap, Angus and Aegis', changes: [
    { t: 'new', kind: 'hero', who: 'yousuf', what: 'Healing cap', text: 'Allies he heals become Mended for 2 turns. His heals on a Mended ally are 30% weaker. Regen ticks are unaffected.', note: 'Spreading heals stays fully effective. Simulated team win 73% → 63%.' },
    { t: 'nerf', kind: 'hero', who: 'angus', text: 'Max HP', from: '1750', to: '1620' },
    { t: 'buff', kind: 'hero', who: 'angus', text: 'ATK', from: '98', to: '108' },
    { t: 'buff', kind: 'hero', who: 'angus', text: 'Steadfast Cut', from: '100%', to: '115% ATK' },
    { t: 'buff', kind: 'hero', who: 'angus', text: 'Unbreakable damage', from: '120%', to: '145% ATK' },
    { t: 'adjust', kind: 'hero', who: 'angus', what: 'Warlord build', text: 'Steadfast Cut', from: '140%', to: '155% ATK', note: 'Keeps Warlord ahead of the new base damage.' },
    { t: 'nerf', kind: 'hero', who: 'lachlan', what: 'Aegis build', text: 'Shield cap / regen per turn', from: '50% / 10%', to: '44% / 8.5% of max HP' }
  ] },
  { v: '0.2.6', old: '0.62', date: 'David, Gemia and The Chosen', changes: [
    { t: 'new', kind: 'hero', who: 'david', what: 'Vengeance', text: 'Every hit he takes stores a stack (max 5). His next Spear Thrust spends them for +12% damage and a 2% max HP heal per stack.' },
    { t: 'buff', kind: 'hero', who: 'david', text: 'ATK', from: '112', to: '116', note: 'Simulated team win 46% → 52%.' },
    { t: 'rework', kind: 'hero', who: 'gemia', what: 'Scarred Resolve', text: 'After the hit', from: 'Resolute: permanent ATK +25% (once)', to: 'Flow for 3 turns, every use: ATK +25%, evasion +15%, Swift Cut strikes twice at 60%', note: 'The first use still breaks her fear for good. Resolute now only means fear immunity.' },
    { t: 'nerf', kind: 'hero', who: 'gemia', text: 'Scarred Resolve hit', from: '300%', to: '280% ATK' },
    { t: 'nerf', kind: 'hero', who: 'gemia', text: 'Max HP', from: '1350', to: '1300' },
    { t: 'nerf', kind: 'hero', who: 'gemia', text: 'DEF', from: '92', to: '88', note: 'Damage per turn 47 → 38 in simulation. Team win rate unchanged at 45%.' },
    { t: 'rework', kind: 'hero', who: 'chosen', what: 'Role', text: 'Duelist', from: 'team damage buffer', to: 'solo tank and damage dealer (Champion)' },
    { t: 'buff', kind: 'hero', who: 'chosen', text: 'Max HP', from: '1260', to: '1450' },
    { t: 'buff', kind: 'hero', who: 'chosen', text: 'DEF', from: '88', to: '118' },
    { t: 'new', kind: 'hero', who: 'chosen', what: 'Gilded Myth', text: 'Damage reduction', from: '0%', to: '12%, plus 3% per Grace stack (up to 27%)', note: 'Spending Grace on Judgement of Wings also spends the reduction.' },
    { t: 'nerf', kind: 'hero', who: 'chosen', text: 'ATK', from: '126', to: '122' },
    { t: 'rework', kind: 'hero', who: 'chosen', what: 'Gilded Dance', text: 'Bonus effect', from: 'all allies ATK +20%', to: 'Shield on herself worth 10% max HP' },
    { t: 'rework', kind: 'hero', who: 'chosen', what: 'Judgement of Wings', text: 'Heal', from: 'all allies 15%', to: 'herself 20%' },
    { t: 'rework', kind: 'hero', who: 'chosen', what: 'Dancer build', text: 'Downside', from: 'no team ATK buff', to: 'no Shield from Gilded Dance' }
  ] },
  { v: '0.2.5', old: '0.61', date: 'Leo\'s channelled beam', changes: [
    { t: 'rework', kind: 'hero', who: 'leo', what: 'Fire Beam', text: 'Start hit', from: '150% target / 60% others', to: '120% target / 50% others, then Channel', note: 'While channelling, the skill becomes Sustain Beam: free, no SP gain, same target, 160%, 200%, then 240% ATK, re-applying Burn each time.' },
    { t: 'new', kind: 'hero', who: 'leo', what: 'Channel', text: 'The beam breaks if Leo takes 30% of his max HP before his next turn or is stunned. Any other action releases it. It ends if the target dies.' },
    { t: 'new', kind: 'hero', who: 'leo', what: 'Heat Haze', text: 'Evasion while channelling', from: '+0%', to: '+12%' },
    { t: 'rework', kind: 'hero', who: 'leo', what: 'Pyromancer build', text: 'Trade-off', from: 'Burn +55%, weaker beam', to: 'Burn +40%, 2 Burn stacks per beam hit, ramp 105% to 180%, breaks at 40%' },
    { t: 'rework', kind: 'hero', who: 'leo', what: 'Lancer build', text: 'Trade-off', from: 'Beam 190%, ATK +12%', to: 'Ramp 130% to 290%, breaks at 18%, no ATK bonus' },
    { t: 'new', kind: 'system', who: 'Enemy targeting', text: 'Enemies aim at a channelling hero 25% of the time to try to break the beam.' }
  ] },
  { v: '0.2.4', old: '0.6', date: 'Research pass', changes: [
    { t: 'nerf', kind: 'hero', who: 'yousuf', text: 'Staff Strike heal', from: '45%', to: '40% of damage', note: 'Teams with Yousuf won 79% of simulated fights, the highest by far.' },
    { t: 'nerf', kind: 'hero', who: 'yousuf', text: 'Mending Light', from: '12% max HP + 120% ATK', to: '10% + 95% ATK' },
    { t: 'nerf', kind: 'hero', who: 'yousuf', text: 'Regen per turn', from: '5%', to: '4% max HP' },
    { t: 'nerf', kind: 'hero', who: 'yousuf', text: 'Prodigy\'s Blessing heal', from: '24%', to: '18%' },
    { t: 'nerf', kind: 'hero', who: 'yousuf', text: 'Prodigy\'s Blessing revive', from: '35%', to: '25% HP' },
    { t: 'nerf', kind: 'hero', who: 'yousuf', what: 'Mender build', text: 'Healing bonus', from: '+20%', to: '+10%, and SPD -6%' },
    { t: 'nerf', kind: 'hero', who: 'daniel', text: 'Crystal Ward Shield', from: '20%', to: '18% of her max HP', note: 'Teams with Danielle won 70%, second highest.' },
    { t: 'nerf', kind: 'hero', who: 'daniel', text: 'Crystal Ward DEF buff', from: '+20%', to: '+15%' },
    { t: 'nerf', kind: 'hero', who: 'daniel', text: 'Crystal Sphere duration', from: '3 turns', to: '2 turns' },
    { t: 'nerf', kind: 'hero', who: 'daniel', what: 'Bastion build', text: 'Shield bonus', from: '+25%', to: '+15%' },
    { t: 'buff', kind: 'hero', who: 'leo', text: 'Max HP', from: '1020', to: '1240', note: 'Leo won 34% and fell in 88% of fights, both the worst.' },
    { t: 'buff', kind: 'hero', who: 'leo', text: 'DEF', from: '52', to: '68' },
    { t: 'buff', kind: 'hero', who: 'leo', text: 'SPD', from: '104', to: '112' },
    { t: 'buff', kind: 'hero', who: 'leo', text: 'Evasion', from: '5%', to: '8%' },
    { t: 'buff', kind: 'hero', who: 'leo', what: 'Pyromancer build', text: 'Burn bonus', from: '+40%', to: '+55%' },
    { t: 'buff', kind: 'hero', who: 'flynn', text: 'Max HP', from: '1080', to: '1180', note: 'Flynn fell in 80% of fights.' },
    { t: 'buff', kind: 'hero', who: 'flynn', text: 'DEF', from: '58', to: '68' },
    { t: 'buff', kind: 'hero', who: 'flynn', text: 'Evasion', from: '8%', to: '10%' },
    { t: 'buff', kind: 'hero', who: 'gemia', text: 'Max HP', from: '1160', to: '1350', note: 'Gemia won 39% and fell in 75% of fights.' },
    { t: 'buff', kind: 'hero', who: 'gemia', text: 'DEF', from: '72', to: '92' },
    { t: 'buff', kind: 'hero', who: 'gemia', text: 'Evasion', from: '14%', to: '17%' },
    { t: 'buff', kind: 'hero', who: 'david', text: 'Max HP', from: '1460', to: '1620', note: 'A defender who fell in 80% of fights, with the lowest Impact of anyone.' },
    { t: 'buff', kind: 'hero', who: 'david', text: 'DEF', from: '104', to: '112' },
    { t: 'buff', kind: 'hero', who: 'david', text: 'Guarding damage reduction', from: '20%', to: '30%' },
    { t: 'buff', kind: 'hero', who: 'david', what: 'Phalanx build', text: 'Guarding damage reduction', from: '35%', to: '45%' },
    { t: 'buff', kind: 'hero', who: 'david', text: 'Spear Thrust', from: '100%', to: '115% ATK' },
    { t: 'buff', kind: 'hero', who: 'chosen', what: 'Valkyrie build', text: 'Grace bonus / HP penalty', from: '30% per stack / -8%', to: '35% / -4%', note: 'Valkyrie trailed Balanced.' },
    { t: 'nerf', kind: 'hero', who: 'yunze', what: 'Phantom build', text: 'Evasion / Afterimage chance / ATK', from: '+10% / 30% / -8%', to: '+4% / 20% / -12%', note: 'Phantom led Yunze\'s builds by 6 to 9 points.' },
    { t: 'buff', kind: 'hero', who: 'malakai', what: 'Toxicologist build', text: 'Poison bonus / Transmutation heal', from: '+50% / 10%', to: '+65% / 14%', note: 'Trailed Apothecary by 12 points.' },
    { t: 'nerf', kind: 'hero', who: 'lachlan', what: 'Orbcaster build', text: 'ATK / far splash', from: '+10% / 60%', to: '+8% / 50%' },
    { t: 'nerf', kind: 'hero', who: 'elphi', what: 'Sentinel build', text: 'DEF / Sanctum Blade Shields', from: '+15% / +50%', to: '+10% / +25%' }
  ] },
  { v: '0.2.3', old: '0.5', date: 'Yunze the lone hunter', changes: [
    { t: 'rework', kind: 'hero', who: 'yunze', what: 'Lone Hunter', text: 'Switch Hands SP gain', from: '+1 team SP', to: 'none' },
    { t: 'rework', kind: 'hero', who: 'yunze', what: 'Lone Hunter', text: 'Phantom Switch cost', from: '1 team SP', to: 'free, usable every third turn' },
    { t: 'rework', kind: 'hero', who: 'yunze', what: 'Hunted', text: 'Who gets the bonus', from: 'everyone (+25%)', to: 'only the Yunze who marked it (+25%, Reaper +40%)' },
    { t: 'new', kind: 'system', who: 'Taunt', text: 'Taunt now also forces heroes to target the taunter, for opponents in custom battles.' },
    { t: 'adjust', kind: 'system', who: 'Storm and Flame', text: 'The DoT bonus now belongs to the team that has the bonus, so it works for opponents too. No change for your team.' }
  ] },
  { v: '0.2.2', old: '0.42', date: 'Tougher Harry, faster Yunze', changes: [
    { t: 'buff', kind: 'hero', who: 'harry', text: 'DEF', from: '78', to: '105' },
    { t: 'buff', kind: 'hero', who: 'harry', text: 'Max HP', from: '1320', to: '1400' },
    { t: 'nerf', kind: 'hero', who: 'harry', text: 'ATK', from: '140', to: '134' },
    { t: 'nerf', kind: 'hero', who: 'harry', what: 'Ultimate charge', text: 'Charge rate', from: '65%', to: '55%', note: 'Unsealed now comes about every 12 of his turns instead of 10.' },
    { t: 'rework', kind: 'hero', who: 'yunze', text: 'SPD', from: '146', to: '190', note: 'He now acts about twice as often as most heroes.' },
    { t: 'nerf', kind: 'hero', who: 'yunze', text: 'Switch Hands', from: '2 × 55%', to: '2 × 42% ATK' },
    { t: 'nerf', kind: 'hero', who: 'yunze', text: 'Phantom Switch', from: '160%', to: '125% ATK' },
    { t: 'nerf', kind: 'hero', who: 'yunze', text: 'Thousand Afterimages', from: '7 × 50%', to: '7 × 40% ATK' },
    { t: 'nerf', kind: 'hero', who: 'yunze', what: 'Ultimate charge', text: 'Charge per action', from: '100%', to: '70%', note: 'Keeps his extra turns from turning into constant ultimates.' }
  ] },
  { v: '0.2.1', old: '0.41', date: 'Harry cycles less, Danielle stacks less', changes: [
    { t: 'nerf', kind: 'hero', who: 'harry', what: 'Ultimate charge', text: 'Charge rate', from: '100%', to: '65%', note: 'Applies to actions and hits taken.' },
    { t: 'nerf', kind: 'hero', who: 'harry', what: 'Ultimate charge', text: 'Charge while Unsealed', from: 'normal', to: 'none', note: 'He also starts from 0 after using it instead of 5%. Unsealed now covers about 3 of every 10 of his turns instead of almost all of them.' },
    { t: 'buff', kind: 'hero', who: 'harry', text: 'Unsealed ultimate damage', from: '220%', to: '260% ATK' },
    { t: 'buff', kind: 'hero', who: 'harry', what: 'Unsealed', text: 'Damage bonus', from: '+35%', to: '+50%' },
    { t: 'buff', kind: 'hero', who: 'harry', what: 'Unsealed', text: 'Crit chance bonus', from: '+40%', to: '+60%', note: 'Puts him at 75% crit.' },
    { t: 'buff', kind: 'hero', who: 'harry', what: 'Unsealed', text: 'Crit damage bonus', from: '+0%', to: '+30%' },
    { t: 'buff', kind: 'hero', who: 'harry', what: 'Unsealed', text: 'Backlash chance on any build', from: '0% (Still Water 30%)', to: '+40% (Still Water 70%)', note: 'Still always triggers when he dodges, once per enemy action.' },
    { t: 'nerf', kind: 'hero', who: 'daniel', what: 'Crystal Ward', text: 'Shield cap on the ally', from: '80%', to: '35% of their max HP', note: 'Recasting tops the Shield up instead of stacking it. One cast is unchanged at 20% of Danielle\'s max HP.' },
    { t: 'buff', kind: 'hero', who: 'daniel', what: 'Riposte', text: 'Chance', from: '45%', to: '55%' },
    { t: 'nerf', kind: 'hero', who: 'daniel', what: 'Riposte', text: 'Damage', from: '110%', to: '95% ATK' },
    { t: 'adjust', kind: 'hero', who: 'daniel', what: 'Bastion build', text: 'Riposte chance / Shield cap', from: '25% / 80%', to: '30% / 45%' },
    { t: 'adjust', kind: 'hero', who: 'daniel', what: 'Duelist build', text: 'Riposte chance / damage / Shield cap', from: '65% / 110% / 80%', to: '75% / 120% / 30%' }
  ] },
  { v: '0.2.0', old: '0.4', date: 'Harry rework, Danielle buffs', changes: [
    { t: 'rework', kind: 'hero', who: 'harry', what: 'Ultimate', text: 'A Glimpse of Power is now Unsealed. Damage to all enemies', from: '230% + crush below 25% HP', to: '220%, then Unsealed for 3 turns', note: 'Unsealed: +35% damage, +40% crit chance, +35% evasion. His eyes stay green while it lasts.' },
    { t: 'nerf', kind: 'hero', who: 'harry', text: 'ATK', from: '148', to: '140' },
    { t: 'nerf', kind: 'hero', who: 'harry', text: 'Katana Draw', from: '110%', to: '100% ATK' },
    { t: 'nerf', kind: 'hero', who: 'harry', text: 'Crush', from: '190%', to: '175% ATK' },
    { t: 'rework', kind: 'hero', who: 'harry', what: 'Build', text: 'Blade is replaced by Still Water.', note: 'Backlash: 30% chance to crush a single-target attacker for 140% ATK ignoring DEF, always on a dodge, once per enemy action. ATK -10%.' },
    { t: 'adjust', kind: 'hero', who: 'harry', what: 'Force build', text: 'Crush', from: '230% / SPD -6%', to: '220% / SPD -8%' },
    { t: 'rework', kind: 'hero', who: 'daniel', what: 'Passive', text: 'Uncrackable is now Riposte. Counter', from: '35% chance, 85% ATK', to: '45% chance, 110% ATK', note: 'Ripostes cannot miss, have +25% crit chance, and always trigger when a Crystal Sphere blocks the hit.' },
    { t: 'buff', kind: 'hero', who: 'daniel', text: 'SPD', from: '100', to: '108' },
    { t: 'buff', kind: 'hero', who: 'daniel', text: 'Rapier Lunge crit chance', from: '+0%', to: '+20%' },
    { t: 'rework', kind: 'hero', who: 'daniel', what: 'Bastion build', text: 'Trade-off', from: 'Shields +30%, ATK -10%', to: 'Shields +25%, Riposte chance 25%' },
    { t: 'adjust', kind: 'hero', who: 'daniel', what: 'Duelist build', text: 'Riposte chance and Shield penalty', from: '55% / Shields -25%', to: '65% / Shields -20%' }
  ] },
  { v: '0.1.3', old: '0.31', date: 'Builds pass', changes: [
    { t: 'nerf', kind: 'hero', who: 'chosen', what: 'Dancer build', text: 'Gilded Dance no longer raises allies\' ATK +20% for 2 turns.', note: 'Dancer had no downside before. It still keeps +10% SPD and 4 hits.' },
    { t: 'nerf', kind: 'hero', who: 'flynn', what: 'Overload build', text: 'Spark Jab Shock chance', from: '50%', to: '20%', note: 'Previously had no downside.' },
    { t: 'nerf', kind: 'hero', who: 'leo', what: 'Pyromancer build', text: 'Fire Beam damage', from: '150% / 60%', to: '115% / 40%', note: 'Target / others. Previously had no downside.' },
    { t: 'nerf', kind: 'hero', who: 'yunze', what: 'Phantom build', text: 'ATK', from: '+0%', to: '-8%', note: 'Previously had no downside.' },
    { t: 'nerf', kind: 'hero', who: 'malakai', what: 'Apothecary build', text: 'Elite Bargain ATK boost', from: '+35%', to: '+25%', note: 'Previously had no downside.' },
    { t: 'nerf', kind: 'hero', who: 'malakai', what: 'Toxicologist build', text: 'Grand Transmutation ally heal', from: '20%', to: '10%', note: 'Previously had no downside.' },
    { t: 'nerf', kind: 'hero', who: 'david', what: 'Phalanx build', text: 'ATK', from: '+0%', to: '-10%', note: 'Previously had no downside.' }
  ] },
  { v: '0.1.2', old: '0.3', date: 'Enemy counts', changes: [
    { t: 'rework', kind: 'stage', who: 'pack', text: 'Enemies 3 → 5. ATK', from: '2.15× / HP 1.25×', to: '1.75× / HP 0.9×' },
    { t: 'rework', kind: 'stage', who: 'king', text: 'Enemies 3 → 4. HP', from: '1.3×', to: '1.25×' },
    { t: 'rework', kind: 'stage', who: 'mire', text: 'Enemies 3 → 2. ATK', from: '2.3× / HP 1.35×', to: '2.9× / HP 1.6×' },
    { t: 'rework', kind: 'stage', who: 'shrine', text: 'Enemies 3 → 5. ATK', from: '1.9× / HP 1.3×', to: '1.65× / HP 1.1×' },
    { t: 'rework', kind: 'stage', who: 'cult', text: 'Enemies 3 → 5. ATK', from: '2.4× / HP 1.35×', to: '2.0× / HP 1.1×' },
    { t: 'rework', kind: 'stage', who: 'prophet', text: 'Enemies 3 → 4. ATK', from: '2.2× / HP 1.4×', to: '2.1× / HP 1.3×' },
    { t: 'rework', kind: 'stage', who: 'gate', text: 'Enemies 3 → 4. ATK', from: '2.4× / HP 1.35×', to: '2.1× / HP 1.2×' },
    { t: 'rework', kind: 'stage', who: 'warden', text: 'Enemies 3 → 2. ATK', from: '2.1× / HP 1.35×', to: '2.2× / HP 1.3×' },
    { t: 'rework', kind: 'stage', who: 'shadows', text: 'Enemies 3 → 4. ATK', from: '2.2× / HP 1.3×', to: '1.9× / HP 1.0×' },
    { t: 'rework', kind: 'stage', who: 'e_massacre', text: 'Enemies 3 → 5. ATK', from: '1.15× / HP 1.0×', to: '1.05× / HP 0.95×' },
    { t: 'rework', kind: 'system', who: 'Gauntlet', text: 'Wave size', from: 'always 3', to: '2 to 5', note: 'Per enemy: 2 enemies 130% HP and 115% ATK, 4 enemies 80% and 88%, 5 enemies 68% and 80%.' },
    { t: 'adjust', kind: 'system', who: 'Summons', text: 'Summoners fill the first empty slot in any size of line.' }
  ] },
  { v: '0.1.1', old: '0.2', date: 'Accuracy and difficulty', changes: [
    { t: 'new', kind: 'system', who: 'Evasion and accuracy', text: 'Hit chance = 100% + attacker ACC - target EVA (minimum 5%). Previews show hit chance below 100%.' },
    { t: 'new', kind: 'system', who: 'Taunt', text: 'Some signature moves ignore Taunt. They are marked 🎯✕ on the intent. Guard still redirects them.' },
    { t: 'rework', kind: 'system', who: 'Enemy targeting', text: 'Random targets', from: '100% random', to: '30% lowest HP, 15% lowest DEF, rest random', note: 'Bosses pick the lowest HP 45% of the time.' },
    { t: 'nerf', kind: 'system', who: 'Heavy enemy attacks', text: 'Accuracy', from: '+0%', to: '-8%', note: 'Club, Skull Crack, Boulder Fist, Tail Swipe, Maul and heavy boss moves.' },
    { t: 'buff', kind: 'enemy', who: 'archer', text: 'Aimed Shot accuracy', from: '+0%', to: '+10%' },
    { t: 'buff', kind: 'hero', who: 'daniel', text: 'ATK', from: '106', to: '116' },
    { t: 'buff', kind: 'hero', who: 'daniel', text: 'Rapier Lunge', from: '100%', to: '110% ATK' },
    { t: 'buff', kind: 'hero', who: 'daniel', text: 'Crystal counter', from: '70%', to: '85% ATK' },
    { t: 'buff', kind: 'hero', who: 'daniel', text: 'Unbreakable Sphere hit', from: '160%', to: '180% ATK' },
    { t: 'nerf', kind: 'hero', who: 'daniel', text: 'Crystal Ward Shield', from: '25%', to: '20% of max HP' },
    { t: 'nerf', kind: 'hero', who: 'angus', text: 'Damage reduction', from: '15%', to: '12%' },
    { t: 'nerf', kind: 'hero', who: 'angus', text: 'Self-heal per turn', from: '4%', to: '3%' },
    { t: 'nerf', kind: 'hero', who: 'angus', text: 'Aura of Iron Shield', from: '18%', to: '12% of max HP' },
    { t: 'nerf', kind: 'hero', who: 'angus', text: 'Aura of Iron DEF buff', from: '+30%', to: '+20%' },
    { t: 'nerf', kind: 'hero', who: 'yousuf', text: 'Staff Strike heal', from: '60%', to: '45% of damage' },
    { t: 'nerf', kind: 'hero', who: 'yousuf', text: 'Mending Light', from: '13% max HP + 140% ATK', to: '12% + 120% ATK' },
    { t: 'nerf', kind: 'hero', who: 'yousuf', text: 'Prodigy\'s Blessing heal', from: '28%', to: '24%' },
    { t: 'adjust', kind: 'hero', who: 'harry', text: 'Evasion now uses the shared EVA stat. Value unchanged at 15%.' },
    { t: 'adjust', kind: 'hero', who: 'yunze', text: 'Evasion now uses the shared EVA stat. Value unchanged at 20%.' },
    { t: 'harder', kind: 'stage', who: 'road', text: 'ATK', from: '1.9× / HP 1.15×', to: '2.1× / HP 1.25×' },
    { t: 'harder', kind: 'stage', who: 'quarry', text: 'ATK', from: '1.8× / HP 1.05×', to: '2.2× / HP 1.3×' },
    { t: 'harder', kind: 'stage', who: 'wyvern', text: 'ATK', from: '1.7× / HP 1.0×', to: '2.0× / HP 1.25×' },
    { t: 'harder', kind: 'stage', who: 'cult', text: 'ATK', from: '1.7× / HP 1.1×', to: '2.4× / HP 1.35×' },
    { t: 'harder', kind: 'stage', who: 'malakai', text: 'ATK', from: '1.5× / HP 1.0×', to: '1.9× / HP 1.25×' },
    { t: 'harder', kind: 'stage', who: 'elphi', text: 'ATK', from: '1.5× / HP 1.0×', to: '2.2× / HP 1.3×' },
    { t: 'harder', kind: 'stage', who: 'chosen', text: 'ATK', from: '1.35× / HP 1.0×', to: '1.5× / HP 1.1×' },
    { t: 'harder', kind: 'stage', who: 'yunze', text: 'ATK', from: '1.05×', to: '1.08×' },
    { t: 'easier', kind: 'stage', who: 'harry', text: 'ATK', from: '1.0× / HP 0.9×', to: '0.9× / HP 0.85×', note: 'Offsets the new accuracy rules, which hit this fight hardest.' }
  ] },
  { v: '0.1.0', old: '0.1', date: 'Launch tuning', changes: [
    { t: 'nerf', kind: 'hero', who: 'yousuf', text: 'Mending Light', from: '16% max HP + 160% ATK', to: '13% + 140% ATK' },
    { t: 'new', kind: 'system', who: 'Gauntlet scaling', text: 'Per wave: enemy HP +15% and ATK +8.5%, starting at 150% ATK. Bosses take 72% of the ATK scaling.' }
  ] }
];
const UPDATES = [
  { v: '0.4.6', items: [
    'Elphi reworked. He no longer stays down: the first time he falls he gets back up with 45% of his max HP and fights the rest of the battle with ATK +40% and +10% crit chance. Sentinel brings him back at 60%, Dawnbreaker at only 30%.',
    'His light sword does the work his shields used to. Lightblade hits for 120% instead of 100%, while the Shield from Sanctum Blade drops from 15% to 11% of his max HP and the one Last Light gives a falling ally drops from 15% to 10%.'
  ] },
  { v: '0.4.5', items: [
    'Aamay reworked. He now writes down only what the enemy does, so pairing him with a fast hero no longer fills the Chronicle twice as quickly. It holds 20 Pages instead of 12, and 2 more for every hero who falls on either side, but each Page is worth half what it was and his ultimate charges 40% slower.',
    'Aamay works in a basement nobody visits. While another hero still stands and the Chronicle is empty, an enemy aiming at him looks elsewhere 30% of the time. That protection fades as he writes and is gone once the Chronicle is full, so the moment he is most dangerous is the moment he is easiest to reach. He can always be reached, which is what keeps him different from Seraphine.',
    'Seal in Ink hits softer but holds harder: 55% ATK instead of 70%, and the target now loses 30% SPD and 20% ATK for 3 turns rather than 20% SPD for 2. Ink Flick drops to 85% ATK, and his max HP and ATK both come down.'
  ] },
  { v: '0.4.4', items: [
    'Last Stand is gone. It gave the last hero standing more damage and less damage taken, and the same paragraph was pasted into ten passives, which made every one of them harder to read for a rule that only really mattered in duels. It also quietly applied to a hero boss fighting alone, which nothing told you. Heroes who need help in duels will get it one at a time instead.',
    'David is paid for the work he does. Guarding now cuts half the damage instead of 40%, and every hit he takes for the ally he is guarding heals him 3% of his max HP. His guard started catching far more in the last update, so this grows with it.',
    'Seraphine is easier to reach. A summoned creature no longer counts as cover, so only a living hero keeps her out of sight, and bosses see her regardless.',
    'Harry Crush down from 150% to 135% ATK, and Lachlan loses some max HP. Harry was the only hero stronger than the target band; Lachlan sat on top of the duel table.'
  ] },
  { v: '0.4.3', items: [
    'Builds now show what they change as numbers, not only prose. The stat block in a hero sheet is drawn with the equipped build applied and marks what moved, and every build lists its stat changes as chips.',
    'The 1v1 grid can no longer be read the wrong way round. The corner names both axes, each cell says in words who beat whom and out of how many duels, and the text explains that anything near 50 is a close matchup rather than a precise number.',
    'Descriptions fixed where they left something out. Trigg now names the Pit Imp and gives its claw and its 40% Burn chance. Kingsley says a second Song refreshes the first rather than adding another. Danielle explains that evading an attack means there is nothing to riposte, so evasion and riposte never both happen. Seraphine says that Severance marks do nothing until Halo Storm detonates them, and that they stop at 5.'
  ] },
  { v: '0.4.2', items: [
    'Every past update and balance entry has been renamed onto the new numbering, in the same order, with its old number shown beside it. The old numbering had run out of room at 0.93, and it had already used 0.4, 0.41 and 0.42, which clashed with the new ones.',
    'The Guide now says exactly what moves each part of the version number, so it is clear why it moves as slowly as it does.'
  ] },
  { v: '0.4.1', items: [
    'Four fixes to things that were quietly not working. Hold the Line only redirected attacks that went through the ordinary attack path, so fourteen single-target skills, among them Crush, Phantom Switch, Finger Frame and Sanctum Blade, walked straight past the guard. They all respect it now.',
    'What a summoned creature does now counts for whoever summoned it. The imps Trigg calls up were removed from the field when they died and took their damage dealt and damage soaked with them, so none of it reached the end of battle summary.',
    'Mimicry copies the move that was actually used. It had been guessing a flat 100%, 140% or 180% from which slot the move came out of, and it dropped any Burn, Shock or Poison the original carried. It now copies the real strength and the real effect, still capped so a boss move comes back at a sane level.',
    'Afterimage now shows on the card as well as in the status list. A hero fading out with no explanation read as a glitch; it means the next attack against them misses completely.'
  ] },
  { v: '0.4.0', items: [
    'Version numbers restart at 0.4. The old 0.9x suggested the game was nearly finished, which it is not.',
    'The battle screen now fits a computer. Portraits were taking their height from the space the arena had left and their width from the card, so on a laptop they stretched out flat, as wide as 168 by 66. They are square again, the enemy row sizes itself so four or five foes are not tall and thin, and on a wide window the action panel moves beside the arena instead of under it.',
    'The title screen no longer cuts off its own bottom on a short window, which used to hide Save backup and the Effects setting.',
    'Dev mode: five taps on the version number under the logo, or add ?dev to the address, unlocks every hero and stage for testing. Stars and records are left alone.',
    'The 1v1 research was being sampled twice per matchup and the two answers disagreed by as much as 29 points. Every pair is now played once with 300 fights instead of 24, so the duel grid is both consistent and far steadier. The Stats screen also reports the real number of fights behind it, which it had been overstating.'
  ] },
  { v: '0.3.9', old: '0.93', items: ['Battle effects no longer vanish on devices that ask for reduced motion. Windows in particular reports this whenever animation effects are switched off, which left attacks, damage numbers and hits invisible.', 'New Effects setting on the title screen: Full, Reduced or Auto. Reduced now drops only screen shake, lunges and flashes, and keeps the damage numbers and hit effects you need to follow a fight.'] },
  { v: '0.3.8', old: '0.92', items: ['Balance pass: Alfred nerfed, 1v1 duels narrowed with Last Stand, healers heal themselves slightly less. Simulated stats refreshed.'] },
  { v: '0.3.7', old: '0.91', items: ['New portraits so every hero looks distinct: Ben (spectacles, chain of office, decree scroll), Aamay (hooded scribe with a candle and open book), Trigg (pale, gaunt, long wild hair) and Kingsley (feathered bard\'s cap).'] },
  { v: '0.3.6', old: '0.9', items: ['Seven new heroes: Trigg, Alfred, Ethan, Ben, Kingsley, Vasco and Aamay, each filling a role the roster lacked. 24 heroes in total.', 'Five new stages where you fight and unlock them: Trigg\'s Menagerie, The Blurred Duel, The King\'s Trial, The Palace Revels and The Basement Archive. 31 stages in total. Some stages now unlock two heroes.', 'Five new team bonuses: Peguicha\'s Court, The Crown\'s Counsel, Royal Hospitality, Borrowed Magic and The Hollow Vessel.', 'Soham\'s Hex Shields now show in gold, separately from blue Shields, on the HP bar and in the numbers.', 'Hex Breaker has a proper exploding-hexagon effect when a Hex Shield bursts.'] },
  { v: '0.3.5', old: '0.84', items: ['Offline version: a single file you can download and play with no internet. Fonts are built in and progress saves on the device.', 'Save backup on the title screen: copy your save as a code (or download it as a file offline) and load it into the other version. Merge keeps the best of both; Replace overwrites.'] },
  { v: '0.3.4', old: '0.83', items: ['Balance pass across 13 heroes and 3 builds, guided by campaign, 3v3 and 1v1 results. Composite spread narrowed from 44 to 68 down to 46 to 63.', 'Simulated stats refreshed.'] },
  { v: '0.3.3', old: '0.82', items: ['Angus, Flynn and Elphi have more distinct passives.', 'A developer handbook and source bundle now exist so development can continue from anywhere.', 'Simulated stats refreshed.'] },
  { v: '0.3.2', old: '0.81', items: ['Vehra lifts off her card while Aloft, and her Rend previews include Bloodlust against wounded enemies.', 'Simulated stats refreshed.'] },
  { v: '0.3.1', old: '0.8', items: ['Vehra reworked around Stone Form and self-healing. She now plays nothing like Yunze.', 'Soham reworked: brittle Hex Shields on one ally or the whole team, with gold shield stripes and a hits-left count on the card.', 'Seraphine hides Behind the Scenes (shown as Unseen on her card) and builds Severance for her ultimate.', 'Simulated stats now use three measures: campaign fights, 3v3 hero battles and 1v1 duels, with a 1v1 matchup grid.', 'Fixed a crash when Yousuf fell in the middle of his own attack.'] },
  { v: '0.3.0', old: '0.7', items: ['Four new heroes: Peguicha, Vehra and Soham from the First Era, and Seraphine from the Second Era. Each has two builds.', 'Four new boss stages, where you fight and unlock them: Vehra\'s Hunt, The Cinderbead, The Hexagon Wall and The Hidden Hand. Campaign now has 26 stages.', 'Bosses can now be heroes, controlled by the game with intents like any enemy.', 'Soham\'s Hex Wall is drawn across his team\'s row with its remaining strength.', 'Daniel is now Danielle, with a new portrait.', 'Versions renumbered: launch is v0.1, major updates step by 0.1, smaller ones by 0.01.'] },
  { v: '0.2.7', old: '0.63', items: ['Yousuf\'s heal previews show when a target is Mended and the heal will be weaker.', 'Simulated stats refreshed.'] },
  { v: '0.2.6', old: '0.62', items: ['David stores Vengeance from hits he takes and unleashes it with Spear Thrust.', 'Gemia enters Flow every time she uses Scarred Resolve.', 'The Chosen is now a solo Champion: sturdy, self-sufficient and hard-hitting.', 'Simulated stats refreshed.'] },
  { v: '0.2.5', old: '0.61', items: ['Leo\'s Fire Beam is now channelled. A glowing beam stays between Leo and his target while he holds it and thickens as it ramps. His skill button turns into Sustain Beam with the next stage shown.', 'Simulated stats refreshed.'] },
  { v: '0.2.4', old: '0.6', items: ['New Stats screen: your record per hero and per build, a history of your last 50 battles, and the simulated results for every hero and build.', 'Hero details show simulated and personal stats, and each build option shows its simulated win rate and your record with it.', 'Your records are saved with your progress, including to your Claude account.'] },
  { v: '0.2.3', old: '0.5', items: ['Custom battle: up to 3 of your heroes against up to 5 opponent heroes, with builds and a strength setting. Opponents show intents, use their own SP and get their own team bonuses.', 'The battle summary is now a full table: damage, healing, Shields, damage taken, kills, biggest hit, crits, hit rate, dodges, buffs, debuffs, actions and ultimates. Best is picked by an Impact score built from all of them.'] },
  { v: '0.2.0', old: '0.4', items: ['Every battle card has an i button. Tap it, or press and hold the card, to see details at any time, even while choosing a target.', 'Turn order icons and the active hero\'s portrait open details too.', 'Harry has a new ultimate, Unsealed, with its own banner and a lasting green glow.'] },
  { v: '0.1.3', old: '0.31', items: ['Balance changes now have their own list with buff, nerf and rework markers.', 'Hero details show the recent balance changes for that hero.', 'Every build now has a real trade-off.'] },
  { v: '0.1.2', old: '0.3', items: ['Fights can have 1 to 5 enemies, with a compact card layout for 4 or 5.', 'Progress saves to your Claude account as well as the device.'] },
  { v: '0.1.1', old: '0.2', items: ['Campaign grows from 10 to 22 stages: 6 new bosses and 4 post-game Echoes.', 'New enemies: Varro the Bandit King, Bog Witch, Mire Lurker, Stormlings, the Tempest Idol, the Hollow Prophet, Mirror Shards, the Mirror Knight, Sellswords, Crossbowmen, Shieldbearers, the Iron Warden and Yunze\'s afterimages.', 'Heroes unlock through the campaign. Angus, Flynn and Leo are the starters.', 'Two builds for every hero.', 'The Guide: rules, stats and formulas, statuses, team bonuses, builds and every enemy.', 'Battle screen sizes itself to the phone so cards and text no longer overlap.'] },
  { v: '0.1.0', old: '0.1', items: ['First release: 13 heroes, 10 campaign stages and the Gauntlet.'] }
];

/* Moves that ignore Taunt (signature boss moves and precise shots) */
const PIERCE_TAUNT = { wolf: ['lunge'], archer: ['arrow'], crossbow: ['heavy'], banditKing: ['execute'], elphiBoss: ['sanctum'], chosenBoss: ['judge'],
  yunzeBoss: ['phantom'], harryBoss: ['crush'], malakaiBoss: ['flask'], mirrorKnight: ['turned'], prophet: ['smite'], shade: ['switch'] };
for (const [id, ms] of Object.entries(PIERCE_TAUNT)) ENEMIES[id].moves.concat(ENEMIES[id].moves2 || []).forEach(m => { if (ms.includes(m.id)) m.pierceTaunt = true; });

/* ================= v0.7: new heroes ================= */
Object.assign(STATUS, {
  cinder:    { name: 'Cinderbead', icon: '📿', type: 'debuff', fixed: true, dot: true, max: 3, perStack: { atk: -0.1, def: -0.1 }, color: '#d1203a', desc: 'A burning bead driven into the body. Each bead deals pain damage (38% of his ATK) at the start of every turn and lowers ATK and DEF by 10%. Up to 3. They are physical beads and cannot be cleansed. They return to Peguicha when the victim falls.' },
  bracelet:  { name: 'Cinderbeads', icon: '📿', type: 'buff', fixed: true, max: 5, color: '#ff4a5c', desc: 'Beads left on Peguicha\'s bracelet. Cinderbead spends one. They return when an enemy carrying them falls, or when Hellfire ignites them.' },
  airborne:  { name: 'Airborne', icon: '🦇', type: 'buff', color: '#c0507a', desc: 'In the air on demonic wings. Dodges the next attack completely.' },
  sapped:    { name: 'Sapped', icon: '🔆', type: 'debuff', mods: { atk: -0.06 }, color: '#ff9a3c', desc: 'Struck Angus and felt his aura: ATK -6%.' },
  stone:     { name: 'Stone Form', icon: '🗿', type: 'buff', mods: { eva: -0.6 }, color: '#a8a29a', desc: 'Turned to stone: takes 50% less damage, cannot be stunned, cannot dodge, and mends 9% max HP at the start of her next turn.' },
  aloft:     { name: 'Aloft', icon: '🦇', type: 'buff', mods: { eva: 0.18 }, color: '#c0507a', desc: 'In the air on demonic wings: +18% evasion until her next turn.' },
  hexshield: { name: 'Hex Shield', icon: '⬡', type: 'buff', fixed: true, color: '#ffe066', desc: 'A strong but brittle Shield from Soham. It shatters after a set number of hits however much is left. While it holds, this unit cannot be stunned.' },
  sever:     { name: 'Severance', icon: '✂', type: 'debuff', fixed: true, max: 5, color: '#e8dcff', desc: 'Marks left by the halos, up to 5 on one enemy. They do nothing until Halo Storm detonates them for 30% ATK each.' },
  hexwall:   { name: 'Hex Wall', icon: '⬡', type: 'buff', fixed: true, color: '#ffe066', desc: 'Soham\'s wall of yellow light stands in front of his team. It soaks 30% of every direct hit on his allies until its strength runs out.' },
  encircled: { name: 'Encircled', icon: '⭕', type: 'debuff', dot: true, mods: { spd: -0.15 }, color: '#f0e6ff', desc: 'Seraphine\'s halos circle it, cutting for 60% of her ATK at the start of each of its turns. SPD -15%.' }
});

Object.assign(HEROES, {
  peguicha: {
    id: 'peguicha', name: 'Peguicha', title: 'The Cinderbead Reaper', eras: ['first'], role: 'Tormentor', color: '#d1203a',
    stats: { hp: 1550, atk: 140, def: 95, spd: 108, crit: 0.1, cdmg: 0.5, eva: 0.07 },
    look: { skin: '#e2b896', hair: '#141016', hairStyle: 'swept', eye: '#e0102a', eyeGlow: false, body: 'coat', bodyColor: '#2a0e14', trim: '#d1203a', bg: '#3a0a12', weapon: 'scythes', beads: true, brow: 'firm' },
    passive: { name: 'Cinderbeads', desc: 'His bracelet holds 5 Cinderbeads. An enemy carrying beads suffers pain damage every turn and loses 10% ATK and DEF per bead (up to 3). Beads return to the bracelet when the victim falls. He feeds on their pain, healing for 30% of the pain damage his beads deal. His ultimate charges 30% slower: the hellfire does not come often.' },
    basic: { name: 'Twin Reap', icon: '⚔️', target: 'enemy', desc: 'Both scythes strike: 2 hits of 78% ATK.' },
    skill: { name: 'Cinderbead', icon: '📿', cost: 1, target: 'enemy', desc: 'Detach a bead and drive it into an enemy: 100% ATK, and the bead stays embedded (pain 38% ATK per turn, ATK and DEF -10%). Needs a bead on the bracelet.' },
    ult:   { name: 'Hellfire', icon: '🔥', target: 'allEnemies', desc: 'Summon hellish fire on every enemy for 210% ATK and Burn them. Each embedded bead ignites for +50% damage, then returns to the bracelet.' }
  },
  vehra: {
    id: 'vehra', name: 'Vehra', title: 'Wings of the Pit', eras: ['first'], role: 'Stonewing', color: '#c0507a',
    stats: { hp: 1260, atk: 118, def: 80, spd: 128, crit: 0.12, cdmg: 0.5, eva: 0.08 },
    look: { skin: '#e8c2b0', hair: '#120c14', hairStyle: 'long', eye: '#e0102a', body: 'armour', bodyColor: '#3a1424', trim: '#c0507a', bg: '#2a0a1a', weapon: 'claws', wings: 'demon', lashes: true },
    passive: { name: 'Bloodlust', desc: 'Deals 30% more damage to enemies below half HP and hunts the weakest. Her claw strikes heal her for 20% of the damage they deal. After each Rend she takes to the air: Aloft, +18% evasion until her next turn.' },
    basic: { name: 'Rend', icon: '🐾', target: 'enemy', desc: 'Her hand becomes a claw: one heavy strike for 110% ATK with a 40% chance to cause Bleed. Heals her for 20% of the damage, then she takes to the air (Aloft).' },
    skill: { name: 'Stone Form', icon: '🗿', cost: 1, target: 'self', desc: 'She lands and turns to stone until the end of her next turn: takes 50% less damage, Taunts all enemies, cannot be stunned, and mends 9% max HP at the start of her next turn. She cannot dodge or fly while stone.' },
    ult:   { name: 'Stonewing Crash', icon: '🪨', target: 'enemy', desc: 'Her wings turn to stone as she crashes down: 220% ATK to the target (50% chance to Stun) and 80% to every other enemy. Then she heals all allies for 8% max HP and climbs back into the air (Aloft).' }
  },
  soham: {
    id: 'soham', name: 'Soham', title: 'The Hexagon Wall', eras: ['first'], role: 'Warden', color: '#ffe066',
    stats: { hp: 1550, atk: 108, def: 110, spd: 100, crit: 0.08, cdmg: 0.5, eva: 0.04 },
    look: { skin: '#c99068', hair: '#141012', hairStyle: 'messy', eye: '#ffd21f', eyeGlow: true, body: 'robe', bodyColor: '#3a3220', trim: '#ffe066', bg: '#3a3010', weapon: 'hex', brow: 'firm' },
    passive: { name: 'Hexagon Mark', desc: 'His Hex Shields are stronger than ordinary Shields but brittle: each shatters after a set number of hits, however much is left. While a Hex Shield holds, that ally cannot be stunned. Raising a hexagon drains him: his skill can only be used every other turn. With no allies left, Hexagon on himself gives the strong single shield.' },
    basic: { name: 'Palm Strike', icon: '✋', target: 'enemy', desc: 'Strike with the marked palm for 100% ATK.' },
    skill: { name: 'Hexagon', icon: '⬡', cost: 1, target: 'ally', desc: 'On an ally: one strong Hex Shield worth 32% of Soham\'s max HP that lasts 3 hits. On himself: a wall for the whole team, a Hex Shield worth 11% of his max HP on every ally that lasts 2 hits. Usable every other turn.' },
    ult:   { name: 'Hexagon Crush', icon: '🟨', target: 'allEnemies', desc: 'Drive a hexagon into every enemy for 170% ATK with a 35% chance to Stun, then give every ally a Hex Shield worth 15% of his max HP (2 hits).' }
  },
  seraphine: {
    id: 'seraphine', name: 'Seraphine', title: 'The Hand Behind the Myth', eras: ['second'], role: 'Bladecaller', color: '#f0e6ff',
    stats: { hp: 1400, atk: 136, def: 80, spd: 120, crit: 0.14, cdmg: 0.55, eva: 0.12, acc: 0.05 },
    look: { skin: '#f0d6c8', hair: '#2a1a3a', hairStyle: 'long', eye: '#f0e6ff', body: 'robe', bodyColor: '#e8e2f2', trim: '#b89cff', bg: '#241a38', weapon: 'halos', helm: 'mask' },
    passive: { name: 'Behind the Scenes', desc: 'While another hero on her side still stands, ordinary enemies cannot aim single-target attacks at her. Summoned creatures are not cover, and bosses see her anyway. After each of her actions both halos keep cutting on their own: 2 strikes of 35% ATK on random enemies. Every cut leaves a Severance mark, which does nothing on its own and only pays off when Halo Storm detonates it. The Chosen secretly obeys her.' },
    basic: { name: 'Halo Cut', icon: '⭕', target: 'enemy', desc: 'Send a halo through one enemy for 110% ATK, leaving a Severance mark. Marks stack up to 5 on the same enemy.' },
    skill: { name: 'Orbiting Blades', icon: '🌀', cost: 1, target: 'enemy', desc: 'Both halos circle an enemy: 80% ATK and 2 Severance marks now, then it is Encircled for 2 turns (60% ATK cut at the start of each of its turns, SPD -15%).' },
    ult:   { name: 'Halo Storm', icon: '💫', target: 'allEnemies', desc: '8 cuts of 45% ATK across all enemies, favouring Encircled ones. Then every Severance mark on every enemy detonates at once for 30% ATK per mark, and the marks are spent. If The Chosen fights beside her, The Chosen takes her turn immediately.' }
  }
});
HERO_ORDER.splice(0, HERO_ORDER.length, 'angus', 'flynn', 'leo', 'harry', 'peguicha', 'vehra', 'soham', 'chosen', 'elphi', 'daniel', 'yunze', 'malakai', 'seraphine', 'lachlan', 'yousuf', 'gemia', 'david');
RIVALS.harry = (RIVALS.harry || []).concat(['soham']);
RIVALS.soham = ['harry'];
RIVALS.seraphine = ['harry'];

BUILDS.peguicha = [BALANCED,
  { id: 'reaper', name: 'Reaper', icon: '⚔️', desc: 'Twin Reap strikes 3 times at 55% ATK each. Enemies can only carry 2 beads instead of 3.', tags: { reapHits: 3, reapMult: 0.55, beadMax: 2 } },
  { id: 'hellbinder', name: 'Hellbinder', icon: '🔥', desc: 'Hellfire charges at the normal rate and each bead ignites for +90%, but the bracelet only holds 4 beads.', tags: { hellRate: 1, ignite: 0.9, beads: 4 } }];
BUILDS.vehra = [BALANCED,
  { id: 'granite', name: 'Granite', icon: '🪨', desc: 'Stone Form also gives her a Shield worth 6% of her max HP. ATK -15%.', mods: { atk: -0.15 }, tags: { stoneShield: 0.06 } },
  { id: 'bloodwing', name: 'Bloodwing', icon: '🩸', desc: 'Bloodlust rises to +45% and her claws heal for 35% of their damage, but Stone Form only cuts damage by 30%.', tags: { bloodlust: 0.45, lifesteal: 0.35, stoneDr: 0.3 } }];
BUILDS.soham = [BALANCED,
  { id: 'monolith', name: 'Monolith', icon: '🧱', desc: 'A single Hex Shield is worth 40% of his max HP and lasts 4 hits. The team wall drops to 8% each.', tags: { singleHex: 0.4, singleHits: 4, teamHex: 0.08 } },
  { id: 'breaker', name: 'Hex Breaker', icon: '💥', desc: 'Hex Shields are 25% weaker, but whenever one shatters or runs out it explodes for 65% ATK to every enemy.', tags: { hexMult: 0.75, hexBlast: 0.65 } }];
BUILDS.seraphine = [BALANCED,
  { id: 'puppeteer', name: 'Puppeteer', icon: '🎭', desc: 'Halo Storm hands a turn to The Chosen, or to the ally with the highest ATK if she is absent. Halo cuts deal 28% instead of 35%.', tags: { anyPuppet: 1, haloMult: 0.28 } },
  { id: 'twinedge', name: 'Twin Edge', icon: '⭕', desc: 'Halo cuts deal 46% ATK instead of 35%. Max HP -10%.', mods: { hp: -0.1 }, tags: { haloMult: 0.46 } }];

SYNERGIES.push(
  { id: 'pact', name: 'Infernal Pact', icon: '😈', color: '#d1203a',
    desc: 'Peguicha and Vehra together. Both deal 15% more damage to enemies carrying any debuff.',
    test: t => t.includes('peguicha') && t.includes('vehra'),
    apply: P => P.forEach(p => { if (p.id === 'peguicha' || p.id === 'vehra') p.flags.pact = true; }) },
  { id: 'hidden', name: 'The Hidden Hand', icon: '🎭', color: '#f0e6ff',
    desc: 'Seraphine and The Chosen together. The Chosen gains ATK +15% and Seraphine +10% crit chance.',
    test: t => t.includes('seraphine') && t.includes('chosen'),
    apply: P => P.forEach(p => { if (p.id === 'chosen') p.mods.atk += 0.15; if (p.id === 'seraphine') p.mods.crit += 0.1; }) }
);

/* new stages: hero bosses use 'h:' ids and the stage's heroAtk / heroHp multipliers */
const foeId = x => String(x).replace(/^h:/, '');
const isHeroFoe = x => String(x).startsWith('h:');
const foeName = x => (isHeroFoe(x) ? HEROES[foeId(x)].name : ENEMIES[x].name);
(() => {
  const at = id => STAGES.findIndex(s => s.id === id);
  STAGES.splice(at('shrine'), 0,
    { id: 'vehra', era: 'first', name: 'Vehra\'s Hunt', atk: 1.9, hp: 1.1, heroAtk: 1.3, heroHp: 3.6, enemies: ['wolf', 'h:vehra', 'wolf'], boss: true, reward: 'vehra',
      desc: 'Peguicha\'s assistant hunts from above on demonic wings. She goes for the wounded, takes to the air after every strike, and turns to stone when cornered.' });
  STAGES.splice(at('wyvern'), 0,
    { id: 'cinder', era: 'first', name: 'The Cinderbead', atk: 1.9, hp: 1.1, heroAtk: 1.0, heroHp: 2.3, enemies: ['h:vehra', 'h:peguicha'], boss: true, reward: 'peguicha',
      desc: 'Peguicha drives burning beads into your heroes, weakening them every turn. The beads cannot be cleansed, so kill him before his hellfire comes.' },
    { id: 'hexwall', era: 'first', name: 'The Hexagon Wall', atk: 2.1, hp: 1.2, heroAtk: 1.1, heroHp: 3.0, enemies: ['archer', 'brute', 'h:soham', 'archer'], boss: true, reward: 'soham',
      desc: 'Soham, once Harry\'s friend, raises brittle hexagons of yellow light over his archers and their brute. Each shatters after a few hits, so spread your attacks or hammer one target.' });
  STAGES.splice(at('chosen') + 1, 0,
    { id: 'hidden', era: 'second', name: 'The Hidden Hand', atk: 1.5, hp: 1.1, heroAtk: 0.8, heroHp: 1.6, enemies: ['h:chosen', 'h:seraphine'], boss: true, reward: 'seraphine',
      desc: 'The masked woman who gave The Chosen her orders. Her halos cut from across the field, and The Chosen moves when she commands.' });
  STAGES.forEach(s => { if (s.reward) UNLOCK_FROM[s.reward] = s.id; });
})();
const stageFoes = st => st.enemies.map(x => (isHeroFoe(x)
  ? { id: foeId(x), hero: true, boss: true, atkMul: st.heroAtk || 1, hpMul: st.heroHp || 2.5 }
  : { id: x, atkMul: st.atk, hpMul: st.hp }));

/* ================= v0.9: the court of Ethan, Trigg and Alfred ================= */
Object.assign(STATUS, {
  silenced:  { name: 'Silenced', icon: '🖋', type: 'debuff', color: '#7a8ab0', desc: 'Sealed in ink. Heroes cannot use skills or ultimates; monsters can only use their basic attack.' },
  framed:    { name: 'Framed', icon: '👌', type: 'debuff', color: '#9fb8ff', desc: 'Seen clearly through Alfred\'s finger frame. Hits on it cannot miss and have +15% crit chance.' },
  tempo:     { name: 'Tempo', icon: '🎼', type: 'buff', fixed: true, color: '#9fb8ff', desc: 'Alfred\'s rhythm, which changes every turn.' },
  song:      { name: 'Song', icon: '🎵', type: 'buff', color: '#7ad06a', desc: 'Kingsley\'s music: heals 6% max HP and removes a debuff at the start of each of its turns.' },
  vessel:    { name: 'The Vessel', icon: '😈', type: 'buff', fixed: true, mods: { atk: 0.35 }, color: '#d1203a', desc: 'Peguicha\'s power wears Vasco\'s face: ATK +35%, hits heal him for 25% of their damage and deal double damage to Shields.' },
  pages:     { name: 'Chronicle', icon: '📖', type: 'buff', fixed: true, max: 40, color: '#7a8ab0', desc: 'Pages written about what the enemy has done. The Last Page spends them all for 15% ATK each against every enemy.' },
});
Object.assign(ENEMIES, {
  imp: { name: 'Pit Imp', color: '#e0502a', creature: true, stats: { hp: 520, atk: 100, def: 50, spd: 118, eva: 0.08 },
    look: { kind: 'wyvern', scale: '#a8241c', eye: '#ffd56b', bg: '#2a0a06', horns: true },
    moves: [{ id: 'claw', name: 'Ember Claw', icon: '🔥', target: 'single', mult: 1.0, status: { key: 'burn', turns: 2, chance: 0.4, dot: 0.2 }, w: 3, fx: 'claw' }] },
  hellhound: { name: 'Hellhound', color: '#ff6a2a', creature: true, stats: { hp: 1100, atk: 110, def: 80, spd: 104, eva: 0.05 },
    look: { kind: 'wolf', fur: '#3a1410', eye: '#ff8a1f', bg: '#2a0804' },
    moves: [{ id: 'maul', name: 'Hell Maul', icon: '🐺', target: 'single', mult: 1.2, w: 3, fx: 'claw' },
      { id: 'howl', name: 'Infernal Howl', icon: '📢', target: 'self', self: { key: 'taunt', turns: 1 }, w: 2, cd: 3 }] },
  inkwraith: { name: 'Ink Wraith', color: '#7a8ab0', stats: { hp: 900, atk: 104, def: 60, spd: 112, eva: 0.12 },
    look: { kind: 'hood', cloak: '#0e0e16', eye: '#e8ecff', bg: '#08080e' },
    moves: [{ id: 'grasp', name: 'Ink Grasp', icon: '🖤', target: 'single', mult: 1.0, status: { key: 'spdDown', turns: 2, chance: 0.4, value: 0.2 }, w: 3, fx: 'hex' },
      { id: 'blot', name: 'Blot', icon: '💧', target: 'all', mult: 0.6, status: { key: 'blind', turns: 1, chance: 0.3 }, w: 2, cd: 3, fx: 'acidrain' }] }
});
Object.assign(HEROES, {
  trigg: { id: 'trigg', name: 'Trigg', title: 'Right Hand of the Pit', eras: ['first'], role: 'Summoner', color: '#e0502a',
    stats: { hp: 1280, atk: 120, def: 76, spd: 106, crit: 0.08, cdmg: 0.5, eva: 0.06 },
    look: { skin: '#dccbc2', hair: '#0e0c10', hairStyle: 'wild', eye: '#e0102a', body: 'robe', bodyColor: '#2a1210', trim: '#e0502a', bg: '#2a0e08', weapon: 'chains', gaunt: true },
    passive: { name: 'Hellish Retinue', desc: 'Commands up to 2 creatures at a time, Pit Imps and the Hellhound. They act on their own turns and crumble if he falls.' },
    basic: { name: 'Cinder Lash', icon: '⛓️', target: 'enemy', desc: 'Lash one enemy with burning chains for 95% ATK.' },
    skill: { name: 'Summon Imp', icon: '👹', cost: 1, target: 'self', desc: 'Call a Pit Imp with 32% of his HP and 75% of his ATK. It acts on its own turns, clawing one enemy for 100% of its own ATK with a 40% chance to Burn for 2 turns. At his limit, his creatures are mended for 25% of their max HP instead.' },
    ult: { name: 'Hellgate', icon: '🔥', target: 'allEnemies', desc: 'Every creature he commands bursts in hellfire for 110% of his ATK to all enemies. Then a Hellhound answers the call: 70% of his HP, 90% of his ATK, and it Taunts.' } },
  alfred: { id: 'alfred', name: 'Alfred', title: 'The Blurred Blade', eras: ['second'], role: 'Marksman', color: '#9fb8ff',
    stats: { hp: 1560, atk: 138, def: 95, spd: 118, crit: 0.14, cdmg: 0.6, eva: 0.16, acc: 0.1 },
    look: { skin: '#e8c6a8', hair: '#141016', hairStyle: 'bun', eye: '#c8d4ff', body: 'coat', bodyColor: '#2a3046', trim: '#9fb8ff', bg: '#1a2238', weapon: 'katana', lines: true },
    passive: { name: 'Blurred Sight', desc: 'He sees through blur: 16% evasion, he cannot be Blinded, and he ignores half of every target\'s evasion. His tempo changes every turn: Allegro (hits 80%, next turn 50% sooner), Andante (steady) or Grave (slow and crushing: hits 130%).' },
    basic: { name: 'Odd Cut', icon: '🗡️', target: 'enemy', desc: 'Cut one enemy for 112% ATK, shaped by his current tempo.' },
    skill: { name: 'Finger Frame', icon: '👌', cost: 1, target: 'enemy', desc: 'He frames an enemy through his fingers: 95% ATK, then it is Framed for 2 turns. Every ally\'s hits on it cannot miss and gain +15% crit chance, and his next hit on it is a certain crit.' },
    ult: { name: 'Broken Rhythm', icon: '🎼', target: 'allEnemies', desc: '6 cuts of 75% ATK, each in a different tempo, favouring Framed enemies. Cuts on Framed enemies always crit.' } },
  ethan: { id: 'ethan', name: 'Ethan', title: 'The Merciful King', eras: ['current'], role: 'Sovereign', color: '#f0d070',
    stats: { hp: 1500, atk: 120, def: 100, spd: 102, crit: 0.08, cdmg: 0.5, eva: 0.04 },
    look: { skin: '#e8c8a8', hair: '#f2f2f6', hairStyle: 'long', eye: '#6a4426', body: 'armour', bodyColor: '#4a2a6a', trim: '#f0d070', bg: '#2a1a40', weapon: 'sword', crown: true },
    passive: { name: 'Treasury', desc: 'At the start of each of his turns his team gains 1 SP if it has fewer than 3. While he stands, his allies deal 8% more damage.' },
    basic: { name: 'Royal Blade', icon: '⚔️', target: 'enemy', desc: 'Strike one enemy for 115% ATK.' },
    skill: { name: 'Royal Decree', icon: '📜', cost: 1, target: 'allAllies', desc: 'All allies gain ATK +20% and SPD +10% for 2 turns.' },
    ult: { name: 'Shelter of the Crown', icon: '🏰', target: 'allAllies', desc: 'Every ally gains a Shield worth 15% of his max HP, is cleansed, and has their buffs extended by 1 turn. His team gains 2 SP.' } },
  ben: { id: 'ben', name: 'Ben', title: 'The King\'s Advisor', eras: ['current'], role: 'Tactician', color: '#c8a070',
    stats: { hp: 1340, atk: 122, def: 95, spd: 124, crit: 0.12, cdmg: 0.5, eva: 0.08 },
    look: { skin: '#e8c4a4', hair: '#6b4426', hairStyle: 'parted', eye: '#5a3a20', body: 'coat', bodyColor: '#5a1a26', trim: '#e8b830', bg: '#3a2418', weapon: 'scroll', glasses: true, chain: true },
    passive: { name: 'Cold Counsel', desc: 'Deals 40% more damage to enemies whose turn has been delayed, or who are Stunned. He gives the orders a merciful king will not.' },
    basic: { name: 'Sharp Word', icon: '🗯️', target: 'enemy', desc: '120% ATK to one enemy and its next turn comes 15% later.' },
    skill: { name: 'Give the Order', icon: '☝️', cost: 0, target: 'ally', desc: 'Costs no SP, usable every other turn. Another ally acts immediately with ATK +25% for that turn and gains 20% ultimate charge.' },
    ult: { name: 'The Hard Decision', icon: '⚖️', target: 'allEnemies', desc: 'Every enemy\'s next turn comes 40% later (20% for bosses), and the enemy with the highest ATK is Exposed (+50% damage taken) for 2 turns.' } },
  kingsley: { id: 'kingsley', name: 'Kingsley', title: 'The Palace Bard', eras: ['current'], role: 'Bard', color: '#7ad06a',
    stats: { hp: 1200, atk: 110, def: 74, spd: 112, crit: 0.1, cdmg: 0.5, eva: 0.08 },
    look: { skin: '#f0d0b4', hair: '#d8642a', hairStyle: 'messy', eye: '#3aa060', body: 'coat', bodyColor: '#2a4a2a', trim: '#f0c040', bg: '#183018', weapon: 'lute', hat: 'bard', smile: true },
    passive: { name: 'Encore', desc: 'Allies with a Song heal 6% of their max HP and lose one debuff at the start of each of their turns. His heals on himself are 10% weaker.' },
    basic: { name: 'Jaunty Tune', icon: '🎵', target: 'enemy', desc: 'Play at one enemy for 80% ATK. The ally with the lowest HP gains a Song for 2 turns. Playing again on an ally who already has one refreshes it back to 2 turns rather than adding a second.' },
    skill: { name: 'Borrowed Trinket', icon: '🎁', cost: 1, target: 'self', desc: 'Pull one of Vasco\'s magic items at random: Lantern (heal all allies 14%), Mirror Charm (Shield the lowest ally for 22% of his max HP), Jester\'s Bell (Blind every enemy and a 50% chance to Stun one) or Spark Box (75% ATK to every enemy).' },
    ult: { name: 'Grand Finale', icon: '🎶', target: 'allAllies', desc: 'Every ally gains a Song for 3 turns and SPD +15% for 2 turns, and is cleansed.' } },
  vasco: { id: 'vasco', name: 'Vasco', title: 'The Jester', eras: ['current'], role: 'Trickster', color: '#a050d0',
    stats: { hp: 1260, atk: 124, def: 76, spd: 116, crit: 0.12, cdmg: 0.55, eva: 0.1 },
    look: { skin: '#e6c2a2', hair: '#6b4426', hairStyle: 'short', eye: '#141016', glowEye: '#ff2a3a', body: 'coat', bodyColor: '#5a1a6a', trim: '#f0c040', bg: '#24102e', weapon: 'cards', helm: 'jester' },
    passive: { name: 'Two Faces', desc: 'The first time he drops below 40% HP his alter ego wakes for the rest of the battle: Peguicha\'s Vessel. ATK +35%, his hits heal him for 25% of their damage and deal double damage to Shields, and his kit turns dark.' },
    basic: { name: 'Prank', icon: '🃏', target: 'enemy', desc: 'Jester: 80% ATK and a random trick (Blind, ATK -20% or SPD -20%). Vessel: Hellmark, 120% ATK and Burn.' },
    skill: { name: 'Mimicry', icon: '🎭', cost: 1, target: 'enemy', desc: 'Jester: copies the last attack an enemy used on his team, at his own ATK. Vessel: Peguicha\'s Gift, 150% ATK that strips the target\'s buffs and Shields.' },
    ult: { name: 'Curtain Call', icon: '🎪', target: 'allEnemies', desc: 'The mask comes off: he wakes as the Vessel if he has not, then deals 190% ATK to every enemy and Burns them.' } },
  aamay: { id: 'aamay', name: 'Aamay', title: 'The Basement Scribe', eras: ['current'], role: 'Chronicler', color: '#7a8ab0',
    stats: { hp: 1180, atk: 110, def: 80, spd: 110, crit: 0.1, cdmg: 0.5, eva: 0.08 },
    look: { skin: '#d8a882', hair: '#141016', hairStyle: 'short', eye: '#5a3a20', body: 'robe', bodyColor: '#16161c', trim: '#3a3c4a', bg: '#08080c', weapon: 'book', helm: 'cowl', ink: true },
    passive: { name: 'The Chronicle', desc: 'He writes down what the enemy does: every enemy action adds a Page, up to 20. Nothing his own side does is worth recording. Each hero who falls on either side raises the limit by 2, since there is more to write. He works in a basement nobody visits, so while another hero still stands and the Chronicle is empty, an enemy that aims at him looks elsewhere 30% of the time. That protection fades as he writes, and is gone entirely once the Chronicle is full, so the moment he is most dangerous is the moment he is easiest to reach. He can always be reached, unlike someone truly hidden.' },
    basic: { name: 'Ink Flick', icon: '🖋️', target: 'enemy', desc: '85% ATK with a 30% chance to Silence for 1 turn.' },
    skill: { name: 'Seal in Ink', icon: '📕', cost: 1, target: 'enemy', desc: '55% ATK, then the target is Silenced for 2 turns (bosses 1) and loses 30% SPD and 20% ATK for 3 turns. Silenced heroes cannot use skills or ultimates; monsters only use their basic attack.' },
    ult: { name: 'The Last Page', icon: '📖', target: 'allEnemies', desc: 'Read the Chronicle aloud: 15% ATK per Page to every enemy, then Silence them all for 1 turn. The Pages are spent. His ultimate charges 40% slower than other heroes, so the Chronicle has time to fill.' } }
});
HERO_ORDER.splice(0, HERO_ORDER.length, 'angus', 'flynn', 'leo', 'harry', 'peguicha', 'vehra', 'soham', 'trigg', 'chosen', 'elphi', 'daniel', 'yunze', 'malakai', 'seraphine', 'alfred', 'lachlan', 'yousuf', 'gemia', 'david', 'ethan', 'ben', 'kingsley', 'vasco', 'aamay');
Object.assign(BUILDS, {
  trigg: [BALANCED,
    { id: 'packmaster', name: 'Packmaster', icon: '👹', desc: 'Commands up to 3 creatures, but they have 20% less HP.', tags: { creatureCap: 3, creatureHp: 0.8 } },
    { id: 'pyrebinder', name: 'Pyrebinder', icon: '🔥', desc: 'Whenever one of his creatures falls it bursts for 50% of his ATK to all enemies. Imps have 15% less ATK.', tags: { deathBurst: 0.5, impAtk: 0.85 } }],
  alfred: [BALANCED,
    { id: 'steady', name: 'Steady Eye', icon: '👁️', desc: 'His tempo no longer swings to Grave, only Allegro or Andante. Finger Frame lasts 3 turns. ATK -8%.', mods: { atk: -0.08 }, tags: { noGrave: 1, frameTurns: 3 } },
    { id: 'chaos', name: 'Wild Rhythm', icon: '🌀', desc: 'Allegro hits for 90% and Grave for 155%, but he never rests in Andante. Evasion -5%.', mods: { eva: -0.05 }, tags: { wild: 1 } }],
  ethan: [BALANCED,
    { id: 'warking', name: 'War King', icon: '⚔️', desc: 'Royal Decree grants ATK +30% but no SPD. Treasury only fires below 2 SP.', tags: { decreeAtk: 0.3, decreeSpd: 0.001, treasuryBelow: 2 } },
    { id: 'patron', name: 'Patron', icon: '💰', desc: 'Treasury fires below 4 SP. Shelter Shields drop to 10%. ATK -10%.', mods: { atk: -0.1 }, tags: { treasuryBelow: 4, shelter: 0.1 } }],
  ben: [BALANCED,
    { id: 'schemer', name: 'Schemer', icon: '🕸️', desc: 'Sharp Word delays by 30% instead of 15%, but deals 80% ATK.', tags: { wordDelay: 0.3, wordMult: 0.8 } },
    { id: 'zealot', name: 'Zealous Aide', icon: '☝️', desc: 'Give the Order grants ATK +40% instead of 25%. Max HP -10%.', mods: { hp: -0.1 }, tags: { orderAtk: 0.4 } }],
  kingsley: [BALANCED,
    { id: 'virtuoso', name: 'Virtuoso', icon: '🎶', desc: 'Songs heal 8% instead of 6%, but trinkets are 30% weaker.', tags: { songHeal: 0.08, trinket: 0.7 } },
    { id: 'collector', name: 'Collector', icon: '🎁', desc: 'Trinkets are 35% stronger, but Songs heal only 4%.', tags: { songHeal: 0.04, trinket: 1.35 } }],
  vasco: [BALANCED,
    { id: 'harlequin', name: 'Harlequin', icon: '🃏', desc: 'Pranks always trick twice. The Vessel only wakes below 25% HP.', tags: { doubleTrick: 1, wakeAt: 0.25 } },
    { id: 'hollow', name: 'Hollow', icon: '😈', desc: 'The Vessel wakes below 60% HP, but its lifesteal drops to 15%.', tags: { wakeAt: 0.6, vesselSteal: 0.15 } }],
  aamay: [BALANCED,
    { id: 'archivist', name: 'Archivist', icon: '📚', desc: 'The Chronicle starts at 26 Pages instead of 20, but Seal in Ink only Silences for 1 turn.', tags: { pageMax: 26, sealTurns: 1 } },
    { id: 'inquisitor', name: 'Inquisitor', icon: '🖋', desc: 'Ink Flick Silences 55% of the time. Each Page is worth 12% instead of 15%.', tags: { flickCh: 0.55, pageMult: 0.12 } }]
});
SYNERGIES.push(
  { id: 'court', name: 'Peguicha\'s Court', icon: '👹', color: '#e0502a', desc: 'Trigg with Peguicha or Vehra. His creatures have 20% more HP and ATK.',
    test: t => t.includes('trigg') && (t.includes('peguicha') || t.includes('vehra')), apply: P => P.forEach(p => { if (p.id === 'trigg') p.flags.court = true; }) },
  { id: 'counsel', name: 'The Crown\'s Counsel', icon: '⚖️', color: '#f0d070', desc: 'Ethan and Ben. Royal Decree lasts 3 turns, and Give the Order also gives the team 1 SP.',
    test: t => t.includes('ethan') && t.includes('ben'), apply: P => P.forEach(p => { if (p.id === 'ethan' || p.id === 'ben') p.flags.counsel = true; }) },
  { id: 'hospitality', name: 'Royal Hospitality', icon: '🏰', color: '#5dff8f', desc: 'Ethan and Yousuf. Yousuf\'s healing +15%, Ethan DEF +15%.',
    test: t => t.includes('ethan') && t.includes('yousuf'), apply: P => P.forEach(p => { if (p.id === 'yousuf') p.mods.heal += 0.15; if (p.id === 'ethan') p.mods.def += 0.15; }) },
  { id: 'borrowed', name: 'Borrowed Magic', icon: '🎁', color: '#a050d0', desc: 'Kingsley and Vasco. Kingsley\'s trinkets are 25% stronger and Vasco gains +10% crit chance.',
    test: t => t.includes('kingsley') && t.includes('vasco'), apply: P => P.forEach(p => { if (p.id === 'kingsley') p.flags.borrowed = true; if (p.id === 'vasco') p.mods.crit += 0.1; }) },
  { id: 'hollowvessel', name: 'The Hollow Vessel', icon: '😈', color: '#d1203a', desc: 'Vasco and Peguicha. The Vessel wakes in Vasco below 55% HP instead of 40%.',
    test: t => t.includes('vasco') && t.includes('peguicha'), apply: P => P.forEach(p => { if (p.id === 'vasco') p.flags.wakeEarly = true; }) }
);
(() => {
  const at = id => STAGES.findIndex(s => s.id === id);
  STAGES.splice(at('cinder') + 1, 0,
    { id: 'menagerie', era: 'first', name: 'Trigg\'s Menagerie', atk: 2.2, hp: 1.1, heroAtk: 1.35, heroHp: 3.6, enemies: ['imp', 'h:trigg', 'imp'], boss: true, reward: 'trigg',
      desc: 'Peguicha\'s lanky right hand fights behind a wall of creatures from the pit. Kill Trigg and they crumble.' });
  STAGES.splice(at('mirror') + 1, 0,
    { id: 'blurred', era: 'second', name: 'The Blurred Duel', atk: 1.5, hp: 1.1, heroAtk: 1.6, heroHp: 5.2, enemies: ['h:alfred'], boss: true, reward: 'alfred',
      desc: 'A swordsman who sees in blurred lines and never keeps the same rhythm twice. Watch his tempo.' });
  STAGES.splice(at('gate') + 1, 0,
    { id: 'kingtrial', era: 'current', name: 'The King\'s Trial', atk: 2.3, hp: 1.15, heroAtk: 1.0, heroHp: 2.6, enemies: ['sellsword', 'h:ethan', 'h:ben'], boss: true, reward: ['ethan', 'ben'],
      desc: 'Before he grants shelter, King Ethan tests the strength of Yousuf\'s guard. His advisor gives the orders the king will not.' },
    { id: 'revels', era: 'current', name: 'The Palace Revels', atk: 2.0, hp: 1.1, heroAtk: 0.8, heroHp: 1.8, enemies: ['h:kingsley', 'h:vasco'], boss: true, reward: ['kingsley', 'vasco'],
      desc: 'A performance for the guests goes wrong. Push the jester too far and something darker looks out from behind his face.' },
    { id: 'archive', era: 'current', name: 'The Basement Archive', atk: 2.3, hp: 1.1, heroAtk: 0.95, heroHp: 2.7, enemies: ['inkwraith', 'h:aamay', 'inkwraith'], boss: true, reward: 'aamay',
      desc: 'Below the palace a scribe writes down everything that happens. The longer the fight, the longer his Chronicle.' });
  STAGES.forEach(s => { if (s.reward) [].concat(s.reward).forEach(r => { UNLOCK_FROM[r] = s.id; }); });
})();
