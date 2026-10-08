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
  critUp:    { name: 'Crit Up', icon: '💥', type: 'buff', stat: 'crit', color: '#ffd56b' },
  taunt:     { name: 'Taunting', icon: '🎯', type: 'buff', color: '#ff9a3c', desc: 'Enemies must aim single-target attacks at this unit, except moves marked as ignoring Taunt.' },
  regen:     { name: 'Regen', icon: '💚', type: 'buff', color: '#5dff8f', desc: 'Heals 5% max HP at the start of each turn.' },
  hunted:    { name: 'Hunted', icon: '👁️', type: 'debuff', color: '#4fb3ff', desc: 'Takes 25% more damage from the Yunze who marked it (40% with Reaper). Other attackers get no bonus.' },
  afterimage:{ name: 'Afterimage', icon: '👤', type: 'buff', color: '#9fd0ff', desc: 'Dodges the next attack completely.' },
  undying:   { name: 'Unbreakable', icon: '✨', type: 'buff', color: '#ffd36b', desc: 'Cannot fall below 1 HP.' },
  spent:     { name: 'Spent', icon: '🕯', type: 'debuff', color: '#9a8f7a', desc: 'Gains no ultimate charge at all while it lasts.' },
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
  determined:{ name: 'Determined', icon: '🔆', type: 'buff', fixed: true, mods: { atk: 0.3, crit: 0.1 }, color: '#fff2a8', desc: 'Back on his feet with a fraction of his health left. ATK +30% and +10% crit chance for the rest of the battle.' },
  hidden:    { name: 'Out of Sight', icon: '🕯', type: 'buff', color: '#7a8ab0', desc: 'Enemies cannot aim single-target attacks at it. Attacks that hit the whole team still land.' }
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
    basic: { name: 'Steadfast Cut', icon: '🗡️', target: 'enemy', desc: 'Deal 130% ATK to one enemy.' },
    skill: { name: 'Aura of Iron', icon: '🛡️', cost: 1, target: 'self', desc: 'Taunt all enemies for 2 turns. Gain a Shield worth 12% max HP and DEF +20% for 2 turns. Some boss moves ignore Taunt.' },
    ult:   { name: 'Unbreakable', icon: '🔆', target: 'allEnemies', desc: 'Deal 160% ATK to all enemies. Angus cannot fall below 1 HP for 2 turns and all allies gain DEF +25% for 2 turns. Holding out like that costs him: he is Spent for 4 turns and gains no ultimate charge at all, so he cannot simply stand in it forever.' }
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
    skill: { name: 'Crush', icon: '✊', cost: 2, target: 'enemy', desc: 'His eyes glow green. The target jerks and spits blood: 145% ATK that ignores DEF and cannot miss. Bleeds for 2 turns.' },
    ult:   { name: 'Unsealed', icon: '🔓', target: 'allEnemies', desc: 'Crush every enemy for 260% ATK, ignoring DEF. Then he is Unsealed for 3 turns: +35% damage, +50% crit chance, +30% crit damage, +35% evasion, and attackers risk Backlash (40% chance to be crushed for 140% ATK). His ultimate charges 45% slower than other heroes and not at all while Unsealed.' }
  },
  chosen: {
    id: 'chosen', name: 'The Chosen', title: 'Hero of Myth', eras: ['second'], role: 'Champion', color: '#ffd56b',
    stats: { hp: 1450, atk: 122, def: 118, spd: 114, crit: 0.1, cdmg: 0.55 },
    look: { skin: '#f0d0b0', hair: '#f6d77a', hairStyle: 'long', eye: '#222', body: 'armour', bodyColor: '#d9a93a', trim: '#fff0b0', helm: 'winged', bg: '#5e4a12', weapon: 'lance' },
    passive: { name: 'Gilded Myth', desc: 'Takes 12% less damage. Every action grants a Grace stack (max 5). Each stack gives +5% crit chance and 2% less damage taken.' },
    basic: { name: 'Lance Thrust', icon: '🔱', target: 'enemy', desc: 'Deal 105% ATK to one enemy.' },
    skill: { name: 'Gilded Dance', icon: '💃', cost: 1, target: 'enemy', desc: 'Strike 3 times for 55% ATK each. Gain a Shield worth 10% of her max HP and an extra Grace stack.' },
    ult:   { name: 'Judgement of Wings', icon: '🪽', target: 'enemy', desc: 'Dive from above for 260% ATK, +20% per Grace stack spent, then heal herself for 15% max HP. Spending Grace also spends its damage reduction.' }
  },
  elphi: {
    id: 'elphi', name: 'Elphi', title: 'The Light Bearer', eras: ['second'], role: 'Guardian', color: '#fff2a8',
    stats: { hp: 1420, atk: 128, def: 92, spd: 106, crit: 0.1, cdmg: 0.5 },
    look: { skin: '#ecc9a6', hair: '#c9b48a', hairStyle: 'swept', eye: '#8aa6c8', body: 'armour', bodyColor: '#8a909c', trim: '#e6eaf2', bg: '#4d4a2a', weapon: 'lightsword' },
    passive: { name: 'Last Light', desc: 'The first time each ally drops below 30% HP, Elphi shields them with light worth 10% of his max HP, once per ally per battle. He does not stay down either: the first time he falls he rises again with 30% of his max HP, and keeps ATK +30% and +10% crit chance for the rest of the fight.' },
    basic: { name: 'Lightblade', icon: '⚔️', target: 'enemy', desc: 'Deal 120% ATK to one enemy and heal himself for 15% of the damage.' },
    skill: { name: 'Radiant Arc', icon: '🌟', cost: 1, target: 'allEnemies', desc: 'Deal 85% ATK to all enemies. 60% chance to Blind each for 1 turn.' },
    ult:   { name: 'Sanctum Blade', icon: '🗡️', target: 'enemy', desc: 'A colossal sword of light deals 300% ATK. All allies gain a Shield worth 11% of his max HP.' }
  },
  daniel: {
    id: 'daniel', name: 'Danielle', title: 'The Crystal Duelist', eras: ['second'], role: 'Warden', color: '#ffe066',
    stats: { hp: 1320, atk: 116, def: 124, spd: 108, crit: 0.1, cdmg: 0.5 },
    look: { skin: '#ecc8a6', hair: '#6b4426', hairStyle: 'long', eye: '#5a3a20', body: 'coat', bodyColor: '#3c3550', trim: '#ffe066', bg: '#4d4212', weapon: 'crystal', lashes: true },
    passive: { name: 'Riposte', desc: 'When a single-target attack hits her, 32% chance to answer with her rapier for 115% ATK. Ripostes cannot miss and have +25% crit chance. Evading an attack leaves nothing to answer, so evasion and riposte never both happen. If a Crystal Sphere blocks the hit she always ripostes. One riposte per attack, and area attacks never trigger it.' },
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
    passive: { name: 'Elite Clientele', desc: 'He mixes in a fixed order and the badge above him shows which phial is next: Venom, Sedative, Solvent. Every third flask, the Solvent, is on the house: it splashes 45% ATK and the same debuff onto every other enemy, and hands the team an extra Skill Point.' },
    basic: { name: 'Volatile Flask', icon: '🧪', target: 'enemy', desc: 'Deal 100% ATK to one enemy and apply whichever phial is next: Venom Poisons, Sedative lowers ATK by 22%, Solvent lowers DEF by 22%.' },
    skill: { name: 'Elite Bargain', icon: '🤝', cost: 1, target: 'ally', desc: 'An ally pays 8% of current HP. Every debuff on them is sold on to the enemy with the highest ATK, and they gain ATK +30% and SPD +20% for 2 turns. If they had nothing to sell, that enemy is Poisoned instead.' },
    ult:   { name: 'Grand Transmutation', icon: '⚗️', target: 'allEnemies', desc: 'Strip every enemy buff and Shield, then Poison all enemies (2 stacks) and lower their DEF by 30%. Heal allies 20% max HP and cleanse their debuffs.' }
  },
  lachlan: {
    id: 'lachlan', name: 'Lachlan', title: 'Icon of the People', eras: ['current'], role: 'Versatile', color: '#4f8dff',
    stats: { hp: 1290, atk: 134, def: 90, spd: 110, crit: 0.12, cdmg: 0.5 },
    look: { skin: '#f0d2b6', hair: '#eef2ff', hairStyle: 'swept', eye: '#3a7dff', body: 'armour', bodyColor: '#2a3f7a', trim: '#7fb0ff', bg: '#132a66', weapon: 'orb' },
    passive: { name: 'Azure Shield', desc: 'Starts battle with a Shield worth 25% max HP. Regenerates 5% max HP of Shield each turn, up to 25%. Swaps stance after each basic attack or skill.' },
    basic: { name: 'Close / Far', icon: '👊', target: 'enemy', desc: 'Close stance: 2 hits of 65% ATK. Far stance: an energy orb for 85% ATK that splashes 35% ATK onto every other enemy.' },
    skill: { name: 'Azure Blast', icon: '🔵', cost: 1, target: 'enemy', desc: 'Deal 160% ATK and lower DEF by 25% for 2 turns. Restores 8% max HP of Shield.' },
    ult:   { name: 'Azure Nova', icon: '💠', target: 'allEnemies', desc: 'Deal 200% ATK to all enemies and restore half a wall of Azure Shield, 12.5% of his max HP. It no longer fills the Shield back up on its own, so the wall can be broken through.' }
  },
  yousuf: {
    id: 'yousuf', name: 'Yousuf', title: 'The Prodigy', eras: ['current'], role: 'Healer', color: '#5dff8f',
    stats: { hp: 1060, atk: 92, def: 68, spd: 116, crit: 0.12, cdmg: 0.5 },
    look: { skin: '#d9a77c', hair: '#8a6a3a', hairStyle: 'short', eye: '#3fbf6a', body: 'robe', bodyColor: '#e9e4d2', trim: '#5dff8f', bg: '#14452a', weapon: 'staff', young: true },
    passive: { name: 'Prodigy', desc: 'Healing cap: allies he heals are Mended for 2 turns, and his heals on a Mended ally are 25% weaker. ' + 'His heals can crit for 50% extra healing. Heals on himself are 10% weaker.' },
    basic: { name: 'Staff Strike', icon: '🪄', target: 'enemy', desc: 'Deal 100% ATK to one enemy. The ally with the lowest HP heals for 60% of the damage.' },
    skill: { name: 'Mending Light', icon: '✚', cost: 1, target: 'ally', desc: 'Heal an ally for 13% of their max HP + 120% ATK, cleanse 1 debuff and grant Regen for 2 turns.' },
    ult:   { name: 'Prodigy\'s Blessing', icon: '🌿', target: 'allAllies', desc: 'Revive one fallen ally at 35% HP. Heal all allies 22% max HP, cleanse all debuffs and grant Regen for 2 turns.' }
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
const GAME_VERSION = '0.5.5';

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
    { id: 'force', name: 'Force', icon: '✊', desc: 'Crush deals 200% ATK instead of 145%. SPD -8%.', mods: { spd: -0.08 }, tags: { crushMult: 2.0 } }
  ],
  chosen: [
    { id: 'valkyrie', name: 'Valkyrie', icon: '🪽', desc: 'Judgement of Wings gains 35% per Grace stack instead of 20%. Max HP -4%.', mods: { hp: -0.04 }, tags: { gracePer: 0.35 } },
    { id: 'dancer', name: 'Dancer', icon: '💃', desc: 'SPD +10%. Gilded Dance strikes 4 times, but no longer gives her a Shield.', mods: { spd: 0.1 }, tags: { danceHits: 4, noDanceShield: 1 } }
  ],
  elphi: [
    { id: 'sentinel', name: 'Sentinel', icon: '🛡️', desc: 'DEF +10%, ATK -10%. Sanctum Blade Shields are 35% stronger and he rises with 40% of his max HP instead of 30%.', mods: { def: 0.1, atk: -0.1 }, tags: { ultShield: 0.15, riseHp: 0.4 } },
    { id: 'dawn', name: 'Dawnbreaker', icon: '🌟', desc: 'Radiant Arc deals 100% ATK and Blinds 85% of the time. DEF -10%, and he rises with only 20% of his max HP.', mods: { def: -0.1 }, tags: { arcMult: 1.0, blindCh: 0.85, riseHp: 0.2 } }
  ],
  daniel: [
    { id: 'bastion', name: 'Bastion', icon: '🔮', desc: 'Crystal Ward Shields are 15% stronger and can reach 45% of the ally\'s max HP. Riposte chance drops from 32% to 22%.', tags: { wardMult: 1.15, wardCap: 0.45, counter: 0.22 } },
    { id: 'duelist', name: 'Duelist', icon: '🤺', desc: 'ATK +12%. Riposte chance rises from 32% to 52% and ripostes deal 140% ATK. Crystal Ward Shields are 20% weaker and cap at 30% of the ally\'s max HP.', mods: { atk: 0.12 }, tags: { counter: 0.52, ripMult: 1.4, wardMult: 0.8, wardCap: 0.3 } }
  ],
  yunze: [
    { id: 'phantom', name: 'Phantom', icon: '👤', desc: 'Evasion +4%. Switch Hands leaves an Afterimage 20% of the time. ATK -12%.', mods: { eva: 0.04, atk: -0.12 }, tags: { basicImage: 0.2 } },
    { id: 'reaper', name: 'Reaper', icon: '💀', desc: 'Crit damage +40%. Hunted targets take 40% more damage from him instead of 25%. Evasion -8%.', mods: { cdmg: 0.4, eva: -0.08 }, tags: { hunt: 0.4 } }
  ],
  malakai: [
    { id: 'apothecary', name: 'Apothecary', icon: '🍶', desc: 'Elite Bargain costs no HP and heals the ally for 5% max HP instead, but its ATK boost drops from +30% to +22%.', tags: { freeBargain: 1, bargainAtk: 0.22, bargainHeal: 0.05 } },
    { id: 'toxin', name: 'Toxicologist', icon: '☠️', desc: 'Poison you apply deals 65% more damage. Volatile Flask mixes Venom every time instead of following the order, though every third is still on the house. Grand Transmutation heals allies for 14% instead of 20%.', mods: { dot: 0.65 }, tags: { alwaysPoison: 1, transHeal: 0.14 } }
  ],
  lachlan: [
    { id: 'aegis', name: 'Aegis', icon: '🔵', desc: 'Azure Shield caps at 38% max HP and regenerates 7% per turn. ATK -10%.', mods: { atk: -0.1 }, tags: { shieldCap: 0.38, shieldRegen: 0.07 } },
    { id: 'orbcaster', name: 'Orbcaster', icon: '💠', desc: 'ATK +8%. Far stance splash deals 50% ATK. Azure Shield caps at 20%.', mods: { atk: 0.08 }, tags: { splash: 0.5, shieldCap: 0.2 } }
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
  { v: '0.5.5', d: '2026-10-08', date: 'The Balance screen unbroken, and Skulls worth carrying', changes: [
    { t: 'fix', kind: 'system', who: 'Balance screen', text: 'A change logged with a type the renderer had no row style for', from: 'the Balance screen and every hero sheet that showed that change threw and did nothing when tapped', to: 'the type exists, and an unknown one falls back instead of throwing', note: 'Two entries last update used t: fix, which was not in the table. One missing key took out the whole screen and H. Benjamin\u2019s sheet with it, and nothing failed until it was clicked. The browser suite now opens every hero sheet and the Balance screen on every run.' },
    { t: 'rework', kind: 'hero', who: 'hbenjamin', what: 'How Skulls are earned and lost', from: 'one for every fresh Wither, kept forever, mending him while held', to: 'one per enemy ever, one per death anywhere, and one spent at the start of each of his turns', note: 'A mark wears off, so he could re-mark the same enemy over and over and the pile only ever went up. Now a given enemy pays once, the pile runs down on its own, and coming apart spends every one he is carrying. That leaves the dead as the only renewable source, which is what makes a death worth something.' },
    { t: 'buff', kind: 'hero', who: 'hbenjamin', what: 'What a Skull is worth', from: '5% of max HP a turn while held', to: '14% when it is spent', note: 'Scarcity was the point, so one is worth carrying rather than there being more of them. Composite 49.4 to 41.5 on the economy change alone, and back to 45.3 with this.' },
    { t: 'adjust', kind: 'hero', who: 'hbenjamin', text: 'Max HP and DEF', from: '1010 / 60', to: '1080 / 64' }
  ] },
  { v: '0.5.4', d: '2026-10-08', date: 'Holding a turn, the Corpse given its own kit, and a lifesteal that was paying out on misses', changes: [
    { t: 'new', kind: 'system', who: 'Hold', text: 'A fourth button on the action bar: take no action at all', from: 'you had to attack with something', to: 'Hold costs nothing, earns no Skill Points, and charges the ultimate 10%', note: 'Against a riposte, a counter-attacker or anyone who only punishes you for swinging, the best move is sometimes not to move. Only the player can take it; nothing in the AI ever does.' },
    { t: 'fix', kind: 'hero', who: 'hbenjamin', what: 'Marrow Draw', text: 'What a dodged one does', from: 'the drain was checked but the mark that follows it was not, so a dodge still Withered the target and still paid him', to: 'a blow that never lands does nothing at all', note: 'This is the lifesteal-on-a-dodge the owner spotted. Plaguebearer had the same hole: a missed flask still Withered the whole room.' },
    { t: 'rework', kind: 'hero', who: 'hbenjamin', what: 'The Skulls', text: 'What they are and what they do', from: 'an invisible 7% heal whenever he Withered something', to: 'a counted badge, up to 4, taken from every fresh mark and from every unit that falls anywhere on the field, each mending him 5% of his max HP a turn', note: 'The owner wanted the lifesteal kept and the skulls made visible, and wanted him to have something to do with the dead. The badge is on his card and the count is in the tooltip.' },
    { t: 'rework', kind: 'hero', who: 'hbenjamin', what: 'The Corpse', text: 'Its three moves', from: 'his own kit at a discount', to: 'Gnaw at 25% ATK, Gather the Dead which spends every Skull for 9% max HP each, and The Second Breath', note: 'A corpse should be trying to get up, not trying to fight. It hurts almost nothing and takes 65% less damage instead of 55%, and standing up needs 45% of his max HP rather than 35%.' },
    { t: 'nerf', kind: 'hero', who: 'hbenjamin', text: 'Max HP, DEF, Grave Whisper and Marrow Draw', from: '1180 HP, 74 DEF, 130% and 150% ATK', to: '1010 HP, 60 DEF, 115% and 140% ATK', note: 'Paying for a tankier Corpse, as asked. He comes apart at 18% of his max HP rather than 25%.' },
    { t: 'nerf', kind: 'hero', who: 'ephraim', text: 'Max HP and ATK', from: '1420 / 118', to: '1280 / 120, with Knuckle Down 48% to 44%, Seize 112% to 100% and the ultimate 62% to 56%', note: 'Asked for again and significant this time: composite 54.0 to 45.7 across two versions, and his duel rate 96 to 70.' },
    { t: 'adjust', kind: 'hero', who: 'ephraim', what: 'Riled and Rabid', text: 'When they start', from: '50% and 25% health', to: '65% and 30%', note: 'They began so late that for most of a fight he had no bonus of any kind, which took him to 38.5 once the grip was gone.' },
    { t: 'adjust', kind: 'hero', who: 'ephraim', what: 'Knuckle Down, Seize and the ultimate on screen', text: 'How he reaches the enemy', from: 'no approach at all after the shared melee effect was dropped', to: 'he lunges in, throws the whole action from there, and walks back', note: 'One approach for the action rather than one per hit, which is what made the shared effect look like teleporting.' },
    { t: 'fix', kind: 'system', who: 'Card portraits', text: 'A hero whose portrait changes with a status', from: 'the repaint looked for def.heroId, which only hero bosses have, so H. Benjamin stayed upright on screen while the engine had him in a heap', to: 'it resolves the hero on either side' },
    { t: 'adjust', kind: 'hero', who: 'hbenjamin', what: 'His boss version', text: 'What a carried Skull mends', from: '5% of max HP each', to: '1.5%', note: 'Four skulls on a 3000 health pool is 600 a turn and nothing in the game kills that. The Oldest Grave went to 0% against the test team that brings a healer.' }
  ] },
  { v: '0.5.3', d: '2026-10-08', date: 'Ephraim reworked again, the Skulls put back where they belong', changes: [
    { t: 'rework', kind: 'hero', who: 'ephraim', what: 'Lockjaw becomes Pitbull', text: 'What drives him', from: 'a hidden grip on one enemy paying out through two modifiers you could not see', to: 'two states off his own health bar, each with its own badge', note: 'Even with the rules right the grip read as him letting go for no reason, because nothing on screen showed it moving. Under half health he is Riled, ATK +22% and a 5% mend a turn; under a quarter he is Rabid, ATK +42% and 7%. Nothing hidden and nothing to track.' },
    { t: 'nerf', kind: 'hero', who: 'ephraim', text: 'ATK, and what the two states give', from: '126 ATK, +16% to a Quarry, 12% off everything else', to: '118 ATK, +22% and +42% only when he is already hurt', note: 'Asked for twice. Composite 55.7 to 50.8 and his duel rate 96 to 80, so he is no longer near the top of a table he had no business being on.' },
    { t: 'adjust', kind: 'hero', who: 'ephraim', what: 'Knuckle Down and Seize on screen', text: 'What the animation does', from: 'both went through the shared melee effect, which rotates the slash 38 degrees per hit and lunges his card 42% across the board and back', to: 'a fist that comes in on one axis and lands in the same place every time, and two jaws that close from fixed points', note: 'A three hit combo was three different angles and three round trips, which is what looked random.' },
    { t: 'rework', kind: 'hero', who: 'hbenjamin', what: 'The Skulls', text: 'What they are', from: 'two creatures that joined the team row when he fell', to: 'the skulls already drifting at his hands, which feed him 7% of his max HP for every new enemy he Withers', note: 'As units they read as somebody else\u2019s summons sitting in his team. The Corpse is unchanged: he still comes apart once and can still get himself up.' },
    { t: 'adjust', kind: 'hero', who: 'hbenjamin', what: 'Withered from a boss', text: 'What his mark does when he is the one fighting you', from: 'closed healing outright and could not be lifted, the same as the hero version', to: 'smothers it to 40% instead', note: 'Uncleansable is a tool in the player hands and a wall pointed the other way: the boss re-marks the healer every turn and nothing answers it. The Oldest Grave fell to 0% against the one test team that brings a healer. The hero version is untouched.' },
    { t: 'adjust', kind: 'hero', who: 'hbenjamin', what: 'The skull feed from a boss', from: '7% of max HP a mark', to: '2.5%', note: '7% of a boss pool on three marks a turn is not a mend, it is a wall.' },
    { t: 'adjust', kind: 'hero', who: 'ephraim', what: 'His portrait', text: 'The torso', from: 'two shoulder ellipses on a trapezium with a stroke across the join, so his chest read as a hard horizontal line', to: 'one silhouette with the shading inside it', note: 'The owner said he looked clipped in the middle, and he did.' },
    { t: 'harder', kind: 'stage', who: 'kennels', text: 'Hero boss multipliers', from: 'ATK 1.7\u00d7, hero ATK 1.15\u00d7, hero HP 2.1\u00d7', to: 'ATK 1.8\u00d7, hero ATK 1.3\u00d7, hero HP 2.5\u00d7', note: 'He is weaker, so the stage had to come up to stay a fight.' }
  ] },
  { v: '0.5.2', d: '2026-10-08', date: 'Withered fixed, the grip made plain, and the menu on a computer', changes: [
    { t: 'rework', kind: 'hero', who: 'hbenjamin', what: 'Withered', text: 'Whether it can be cleansed', from: 'an ordinary debuff, so any cleanse lifted it', to: 'it cannot be lifted at all and only runs out', note: 'It did not work, and the reason was a fix made for it one version ago: every heal that also cleanses was changed to cleanse first, so Yousuf, Kingsley, Malakai and every Song tick simply took the mark off and then healed through it. The anti-healer is an anti-healer now. Composite 45.7 to 49.6.' },
    { t: 'rework', kind: 'hero', who: 'ephraim', what: 'Lockjaw', text: 'What moves the grip', from: 'anything he hit became his Quarry, so punching something else silently moved it', to: 'only Drag Down takes hold, and he will not let go while it is still standing', note: 'The owner could not tell why he kept letting go. One button takes hold and nothing else moves it, which is also what a pitbull is meant to do. Composite 55.7 to 54.1.' },
    { t: 'nerf', kind: 'hero', who: 'isaac', what: 'Invisible', text: 'Evasion and the ambush', from: '+40% evasion, +25% damage', to: '+28% evasion, +18% damage', note: 'Asked for directly. Composite 51.7 to 49.6.' },
    { t: 'adjust', kind: 'hero', who: 'isaac', what: 'Invisible on the battle screen', text: 'How you can tell', from: 'a badge among five others', to: 'his card fades out and takes a dashed outline, the way an Afterimage does', note: 'The whole of him is whether he is visible, so it should be the first thing you notice about his card.' },
    { t: 'adjust', kind: 'hero', who: 'hbenjamin', what: 'Gravekeeper', text: 'What it costs', from: 'Marrow Draw takes half the damage back', to: '70% of it', note: 'It trailed his other two builds by 12 points.' },
    { t: 'adjust', kind: 'system', who: 'Hero grids', text: 'How wide the Heroes, team and custom screens are on a computer', from: 'a 560px phone column: five heroes across and six rows of scrolling', to: 'up to 1360px: eight or nine across', note: 'Twenty-seven heroes do not fit a phone column. The roster card also let long names run underneath the info button, which is why H. Benjamin, Seraphine and The Chosen were all cut off.' }
  ] },
  { v: '0.5.1', d: '2026-10-08', date: 'The three new heroes reworked on owner feedback', changes: [
    { t: 'rework', kind: 'hero', who: 'hbenjamin', what: 'The Oldest Bargain', text: 'What happens when he goes down', from: 'a stack of Skulls on a badge, each one spent to survive a killing blow', to: 'he comes apart: a Corpse with its own three moves and two Skulls that fight on their own', note: 'A number on a badge is not a feature anyone can see. The Corpse keeps acting at 25% of his max HP, takes 55% less damage, and mending it to 35% puts him back together. He only has the one bargain.' },
    { t: 'nerf', kind: 'hero', who: 'hbenjamin', what: 'His ultimate', text: 'What it does', from: 'The Second Breath: two turns of Unbreakable for the whole team and three Skulls back', to: 'The Long Rot: every enemy Withered for 3 turns and down 25% ATK and 25% DEF', note: 'He could stand at 1 HP and keep handing the team immortality, the same loop Angus had. He is a debuffer, so the ultimate debuffs.' },
    { t: 'adjust', kind: 'hero', who: 'hbenjamin', text: 'Max HP / DEF / ATK', from: '1250 / 78 / 118', to: '1180 / 74 / 136', note: 'Frail on his feet and stubborn once he is down, which is the shape the owner asked for.' },
    { t: 'buff', kind: 'hero', who: 'hbenjamin', what: 'Withered', text: 'Who it helps', from: 'only him, +20% damage', to: '+20% from him and +12% from the rest of his side', note: 'The mark paid nobody but him, so bringing a debuffer bought the team a heal block and nothing else. This is what took him from 37.9 to 46.8.' },
    { t: 'rework', kind: 'hero', who: 'ephraim', what: 'Pitbull becomes Lockjaw', text: 'What he does', from: 'a damage curve off missing health and a Taunt', to: 'he takes hold of one enemy at a time and everything points at it', note: 'The owner called him boring, and he was: there was nothing to decide. He deals 16% more to his Quarry and takes 12% less from everything that is not it, holds only one thing at a time, and mends 10% when it falls. Drag Down hauls it back 35%, and Shake ignores 40% of its DEF.' },
    { t: 'nerf', kind: 'hero', who: 'ephraim', text: 'Max HP / DEF', from: '1600 / 104', to: '1420 / 98', note: 'The grip measured 73.1 with a duel rate of 99, the strongest anything has read on this table. 57.2 and 88 now.' },
    { t: 'rework', kind: 'hero', who: 'isaac', what: 'Never Seen Coming', text: 'What being unseen does', from: 'single-target attacks could not be aimed at him at all', to: 'Invisible: +40% evasion', note: 'Something always has to be targetable, so the old version quietly switched itself off the moment he was the last one standing. Hard to hit is worth the same whether there are three of them left or one.' },
    { t: 'nerf', kind: 'hero', who: 'isaac', what: 'Quick Word, the ambush and Everything He Saw', from: '110% / 30% / 220%', to: '100% / 25% / 200% ATK' },
    { t: 'adjust', kind: 'hero', who: 'hbenjamin', what: 'His portrait', text: 'What he looks like', from: 'a gaunt man with shading', to: 'a skull in a hood, and a tipped-over one once he has come apart', note: 'cloak, beard and bandana all take a colour, and all three new heroes were passing true, so every distinguishing feature on every one of them rendered as fill="true" and drew nothing. That is why they came out looking like Harry in a different palette.' },
    { t: 'adjust', kind: 'hero', who: 'ephraim', what: 'His portrait', text: 'What he looks like', from: 'plate armour, like Angus and The Chosen', to: 'bare chest, wrapped knuckles, red bandana and scars' },
    { t: 'adjust', kind: 'hero', who: 'isaac', what: 'His portrait', text: 'What he looks like', from: 'a dark coat, like Harry and Yunze', to: 'a scarf pulled over his face, which nothing else in the roster wears' },
    { t: 'easier', kind: 'stage', who: 'kennels', text: 'Hero boss multipliers', from: 'ATK 1.65\u00d7, hero ATK 1.1\u00d7, hero HP 2.3\u00d7', to: 'ATK 1.7\u00d7, hero ATK 1.15\u00d7, hero HP 2.1\u00d7', note: 'The grip made the boss version far harder than the hero version. Retuned twice, once for the rework and once for the nerf that followed it.' },
    { t: 'harder', kind: 'stage', who: 'oldestgrave', text: 'Hero boss multipliers', from: 'ATK 1.8\u00d7, hero ATK 1.0\u00d7, hero HP 2.0\u00d7', to: 'ATK 2.1\u00d7, hero ATK 1.3\u00d7, hero HP 3.0\u00d7', note: 'He is frail now, so the grave fell to 100% against all four test teams.' }
  ] },
  { v: '0.5.0', d: '2026-10-07', date: 'Three new heroes', changes: [
    { t: 'new', kind: 'hero', who: 'hbenjamin', what: 'H. Benjamin, The Oldest Name', text: 'A necromancer from before the First Era had a name for itself. He holds Skulls: a blow that would kill him spends one instead and leaves him standing, and every enemy that falls hands one back. What he marks cannot be healed at all.', from: '24 heroes', to: '27' },
    { t: 'new', kind: 'hero', who: 'ephraim', what: 'Ephraim, The Pitbull', text: 'A First Era brawler who fights with his hands. The more of him is gone the harder he bites: +1% ATK for every 2% of max HP missing, and below half health nothing can stun him.', from: '24 heroes', to: '27' },
    { t: 'new', kind: 'hero', who: 'isaac', what: 'Isaac, The Watcher', text: 'The Current Era observer who feeds the Chronicle. Invisibility he spends rather than holds: unseen until he strikes, and the strike out of sight hits 30% harder and always crits.', from: '24 heroes', to: '27' },
    { t: 'new', kind: 'stage', who: 'kennels', text: 'The Kennels, a First Era stage that unlocks Ephraim', from: '31 stages', to: '34' },
    { t: 'new', kind: 'stage', who: 'oldestgrave', text: 'The Oldest Grave, a First Era stage that unlocks H. Benjamin', from: '31 stages', to: '34' },
    { t: 'new', kind: 'stage', who: 'rooftops', text: 'The Rooftops, a Current Era stage that unlocks Isaac', from: '31 stages', to: '34' },
    { t: 'new', kind: 'system', who: 'Team bonuses', text: 'Three more: The Oldest Debt (H. Benjamin with Harry or Yunze), The Basement Report (Isaac with Aamay) and Off the Chain (Ephraim with Peguicha or Trigg)', from: '', to: '' },
    { t: 'rework', kind: 'system', who: 'Healing', text: 'Every heal that also cleanses now cleanses first', from: 'healed, then removed the debuff', to: 'removes the debuff, then heals', note: 'It never mattered while Mended was the only debuff touching healing, because that one merely reduces it. Withered blocks healing outright, which showed that Yousuf, Kingsley and Malakai were each removing the thing that had just stopped the heal they had already spent.' },
    { t: 'nerf', kind: 'hero', who: 'hbenjamin', what: 'His boss version', text: 'Skulls and how long his mark lasts, as a boss only', from: 'the same as the hero: up to 5 Skulls and a 3 turn mark', to: '2 Skulls and a 1 turn mark', note: 'At three times health the extra lives were doubled up and a permanent heal block left the player with no healer at all. The stage was 0% against all four test teams.' },
    { t: 'rework', kind: 'system', who: 'Build defaults', text: 'Two new abilities read their default with ?? instead of ||, and bt() returns 0 for a tag a build does not set rather than undefined', from: 'on the Balanced build the default evaluated to zero', to: 'the default applies', note: 'It cost Balanced Isaac his entire ambush bonus and Balanced H. Benjamin his entire drain, and it hid itself: raising either number three times moved nothing, because the number was never being read. Found by the build table refusing to move. Isaac measured 69.8 once it worked and has been cut to 54.1. npm run test:engine now fails on any bt default written with ??.' },
    { t: 'nerf', kind: 'hero', who: 'isaac', what: 'Quick Word, the ambush and Everything He Saw', text: 'Damage, once the ambush actually applied', from: '130% / 50% / 270%', to: '110% / 30% / 220% ATK', note: 'Composite 69.8 to 54.1.' },
    { t: 'adjust', kind: 'hero', who: 'isaac', what: 'Ghostwalk', text: 'What it pays with', from: 'max HP', to: 'Slipping Away no longer Exposes anyone', note: 'Max HP is not a price for a hero nothing can aim at, which is why it measured 22 points above Balanced while supposedly paying 20% of it. It gives up the team utility instead: 52% ambush against 30%, and nobody gets marked.' },
    { t: 'adjust', kind: 'hero', who: 'hbenjamin', what: 'Gravekeeper', text: 'What it starts with', from: '5 Skulls, 18% mend, no cost', to: '4 Skulls, 15% mend, max HP -8%', note: 'It measured 14 points above his other two.' }
  ] },
  { v: '0.4.16', d: '2026-10-07', date: 'Lachlan\u2019s wall, the King\u2019s Trial, and two animations Seraphine never had', changes: [
    { t: 'nerf', kind: 'hero', who: 'lachlan', what: 'Azure Shield', text: 'Cap and regeneration', from: '30% max HP, 6% back each turn', to: '25% max HP, 5% back each turn', note: 'Aegis 44% and 8.5% to 38% and 7%, Orbcaster 25% to 20%. He soaked more than anyone on the table.' },
    { t: 'nerf', kind: 'hero', who: 'lachlan', what: 'Azure Nova', text: 'What it gives back', from: 'the Shield filled all the way up', to: 'half a wall, 12.5% of his max HP', note: 'The ultimate handed the whole wall back, so there was never a window where the Shield was down. Composite 51.3 to 44.8, falls 52 to 59, and his duel rate drops from 88 at the top of the table to 69. Two runs read 45.6 and 44.8, so he now sits on the bottom edge of the band, which is the point of the pass.' },
    { t: 'nerf', kind: 'hero', who: 'lachlan', what: 'Azure Blast', text: 'Shield restored', from: '10%', to: '8% max HP' },
    { t: 'nerf', kind: 'hero', who: 'vasco', what: 'The Vessel', text: 'Damage taken', from: '15% less', to: 'normal', note: 'Asked for directly. It was added one update ago to close the gap between the two faces and the owner would rather the gap closed another way. Composite 53.0 to 49.6.' },
    { t: 'buff', kind: 'hero', who: 'harry', what: 'Crush', text: 'Damage', from: '135%', to: '145% ATK', note: 'It costs two Skill Points now, so it can afford to hit for more of what it used to. Force build still 200%.' },
    { t: 'nerf', kind: 'hero', who: 'malakai', what: 'Volatile Flask', text: 'Damage, and the free splash', from: '110% / 55%', to: '100% / 45% ATK', note: 'The rework was meant to make him readable, not to make him a damage dealer. Composite barely moves, 53.0 to 53.9, because his value is the debuffs and the Skill Point.' },
    { t: 'buff', kind: 'hero', who: 'ben', what: 'Sharp Word', text: 'Damage and delay', from: '120% ATK, 15% later', to: '135% ATK, 20% later', note: 'He drifted back to 42.7 after the pass around him. His judgement is the weapon, so the word hits harder and delays longer, which feeds his own Cold Counsel more often.' },
    { t: 'easier', kind: 'stage', who: 'kingtrial', text: 'Enemy ATK, and the hero bosses', from: 'ATK 2.3\u00d7, hero ATK 1.0\u00d7, hero HP 2.6\u00d7', to: 'ATK 1.75\u00d7, hero ATK 1.15\u00d7, hero HP 1.55\u00d7', note: 'Two support heroes at 2.6x HP could neither be killed quickly nor kill, so the fight ran past turn 150 into sudden death and that took the heroes with it: three of the four test teams averaged 190 to 240 turns and lost, at 13%, 27% and 0%. Now 100%, 90%, 97% and 97%, with the survivors on 39 to 63% health.' }
  ] },
  { v: '0.4.15', d: '2026-10-07', date: 'Malakai, Angus, Kingsley and four more passes', changes: [
    { t: 'rework', kind: 'hero', who: 'malakai', what: 'Elite Clientele and Volatile Flask', text: 'What the flask does', from: 'a random one of three debuffs, and a 50% coin flip to refund the Skill Point', to: 'a fixed order of three phials with the next one on a badge, and every third flask splashes every enemy and pays the team a point', note: 'Both halves of him used to be invisible: nothing on screen said what you were about to get or what you had just got. Composite 48.0 to 53.6.' },
    { t: 'buff', kind: 'hero', who: 'malakai', what: 'Volatile Flask', text: 'Damage', from: '90%', to: '110% ATK' },
    { t: 'rework', kind: 'hero', who: 'malakai', what: 'Elite Bargain', text: 'What the deal is', from: 'the same ATK and SPD buff every time', to: 'every debuff on the ally is sold on to the strongest enemy, and the buff follows', note: 'ATK +35% to +30%. The deal now reads off the board, so it is a different spell in every fight, and the buyer always gets the worse end of it.' },
    { t: 'nerf', kind: 'hero', who: 'angus', what: 'Unbreakable', text: 'How often he can stand in it', from: 'back before it ran out, so cycling it made him effectively immortal', to: 'Spent for 4 turns afterwards, gaining no ultimate charge at all', note: 'His invulnerable share of a fight falls from about a half to about a quarter.' },
    { t: 'buff', kind: 'hero', who: 'angus', what: 'Steadfast Cut / Unbreakable', text: 'Damage, paying for the cycle nerf', from: '115% / 145%', to: '130% / 160% ATK', note: 'Composite 51.4 to 51.7, so he is as strong as he was and no longer unkillable.' },
    { t: 'nerf', kind: 'hero', who: 'chosen', what: 'Gilded Myth', text: 'Damage reduction per Grace stack', from: '3%', to: '2%', note: 'At 5 stacks that is 22% off everything rather than 27%, on top of 118 DEF. Composite 55.4 to 51.9.' },
    { t: 'nerf', kind: 'hero', who: 'chosen', what: 'Judgement of Wings', text: 'Self heal', from: '20%', to: '15% max HP' },
    { t: 'nerf', kind: 'hero', who: 'daniel', what: 'Riposte', text: 'Chance', from: '45%', to: '32%', note: 'Bastion 30% to 22%, Duelist 70% to 52%. An answer on nearly every other hit was happening too often to follow.' },
    { t: 'buff', kind: 'hero', who: 'daniel', what: 'Riposte', text: 'Damage, so each answer is worth watching', from: '95%', to: '115% ATK', note: 'Duelist 120% to 140%.' },
    { t: 'new', kind: 'hero', who: 'kingsley', what: 'Borrowed Trinket', text: 'A fifth item in the bag: Loaded Dice, which pays the team 2 Skill Points and gives every ally Crit Up +12% for 2 turns', from: 'four items', to: 'five, and the one he pulled now shows above him' },
    { t: 'buff', kind: 'hero', who: 'kingsley', what: 'Jaunty Tune and Encore', text: 'Tune damage and Song healing', from: '80% ATK / 6%', to: '95% ATK / 7% max HP', note: 'Virtuoso 8% to 9%, Collector 4% to 5%. Composite 49.6 to 50.6.' },
    { t: 'adjust', kind: 'hero', who: 'alfred', what: 'The three tempos', text: 'What separates them', from: 'only a damage number, and two of the numbers printed on screen were not the ones the engine used', to: 'Allegro buys time, Andante cannot miss, Grave ignores 30% of the target DEF', note: 'The tempo tooltip claimed Grave hit for 140% when the engine has always used 130%, and ignored Wild Rhythm entirely. Broken Rhythm also cycled a Grave of 140% that exists nowhere else.' },
    { t: 'nerf', kind: 'hero', who: 'vasco', what: 'Prank', text: 'Damage', from: '155%', to: '130% ATK', note: 'Asked for directly. 155% was the lift that got the jester off the floor in 0.4.13 and it lifted him too far for a basic that also pulls two debuffs and pays the team a point.' },
    { t: 'adjust', kind: 'hero', who: 'soham', what: 'The Hex Shield on the health bar', text: 'Colour when it stacks with an ordinary Shield', from: 'both segments went yellow, so there was no telling where one ended', to: 'the ordinary Shield stays blue and his own stays yellow, in that order', note: 'A rule left over from before the hexshield had its own segment was repainting the ordinary Shield as well.' },
    { t: 'harder', kind: 'stage', who: 'revels', text: 'Hero ATK / HP multipliers', from: '0.8× / 1.8×', to: '0.95× / 2.1×', note: 'The Prank nerf hit the boss version of Vasco too, and the stage fell to 100% against all four test teams. It is 83 to 100% now.' },
    { t: 'adjust', kind: 'system', who: 'Info sheets', text: 'The in-battle sheet lost its Skill Point labels when it grew the two-faces view, and the gallery sheet had always printed +1 SP on every hero', from: 'Basic / Skill with no numbers, or a hardcoded +1 SP', to: 'one helper both sheets use, which says what each face really pays and costs', note: 'It was wrong for Yunze and for the Vessel, neither of which earns anything. npm run check:visual now asserts it on the rendered panel.' }
  ] },
  { v: '0.4.14', d: '2026-10-07', date: 'Skills that cost two Skill Points', changes: [
    { t: 'nerf', kind: 'hero', who: 'harry', what: 'Crush', text: 'Price', from: '1 SP', to: '2 SP', note: 'No change to the damage. He was the strongest hero on the table and this is the lever that costs him tempo rather than power. Composite 60 to 55.4.' },
    { t: 'adjust', kind: 'hero', who: 'vasco', what: 'Wild Card', text: 'Price, and what the cards are worth', from: '1 SP', to: '2 SP, with every card stronger', note: 'The jester earns a point on every basic, so the card is his own loop: earn two, spend two. Diamonds hands both back.' },
    { t: 'buff', kind: 'hero', who: 'vasco', what: 'The Vessel', text: 'Damage taken', from: 'normal', to: '15% less', note: 'Locked into one face it fell in 75% of fights against the jester 50%. Its damage was cut on purpose, so the gap closes on survival instead: 67% now.' },
    { t: 'adjust', kind: 'system', who: 'Skill Points', text: 'The action bar and hero pages read the real price of a skill instead of assuming one', from: 'always said 1 SP', to: 'says what it costs', note: 'Aamay was tried at 2 SP and reverted: Seal in Ink is the whole of what he does and he makes no points of his own, so the price took him from 60.0 to 39.8 in a single step.' }
  ] },
  { v: '0.4.13', d: '2026-10-07', date: 'Wild Card, Vessel cut, Yousuf and Ben', changes: [
    { t: 'rework', kind: 'hero', who: 'vasco', what: 'Mimicry becomes Wild Card', text: 'What the jester skill does', from: 'repeats the last attack an enemy used', to: 'deals one of five cards for the whole team', note: 'Copying was unreadable in play: you could not tell what you were about to get, and often the answer was nothing useful. Hearts heals, Spades sharpens, Clubs shields, Diamonds pays, and the Joker does all four at 40%.' },
    { t: 'nerf', kind: 'hero', who: 'vasco', what: 'Hellmark / Gift of the Pit', text: 'Vessel damage, cut hard as asked', from: '150% / 130% to all', to: '115% / 82% to all' },
    { t: 'nerf', kind: 'hero', who: 'vasco', what: 'The Vessel', text: 'ATK', from: '+35%', to: '+15%' },
    { t: 'buff', kind: 'hero', who: 'vasco', what: 'The Vessel', text: 'Healing from its hits, so it survives on what it takes rather than out-damaging anyone', from: '25%', to: '35% of the damage' },
    { t: 'buff', kind: 'hero', who: 'vasco', what: 'Prank', text: 'Damage', from: '95%', to: '155% ATK', note: 'Measured face against face over 110 fights each, the jester now wins 47.3% and the Vessel 40.0%, against 34.2% and 53.3% before the pass.' },
    { t: 'buff', kind: 'hero', who: 'yousuf', what: 'Mending Light / Staff Strike / Blessing', text: 'Healing across the kit', from: '11% + 100% ATK / 45% / 18% and a 25% revive', to: '13% + 120% ATK / 60% / 22% and a 35% revive', note: 'Buffs to what he already does rather than a rework. His 3v3 rate was 33, the lowest on the table. Composite 41.0 to 47.5.' },
    { t: 'nerf', kind: 'hero', who: 'ben', what: 'Give the Order', text: 'How often, and how much attack it hands out', from: 'every other turn, ATK +25%', to: 'once every three turns, ATK +20%', note: 'This was the part the owner called abusable.' },
    { t: 'buff', kind: 'hero', who: 'ben', what: 'Cold Counsel / The Hard Decision', text: 'His own judgement pays for the nerf: more damage to a delayed target, and the ultimate now softens the whole room', from: '+40% and a delay', to: '+55%, and every enemy also loses 20% ATK for 2 turns', note: 'Composite 38.9 to 45.5, without touching his own attacks.' }
  ] },
  { v: '0.4.12', d: '2026-10-07', date: 'Vasco: both faces lifted together', changes: [
    { t: 'buff', kind: 'hero', who: 'vasco', what: 'Prank / Hellmark / Gift of the Pit', text: 'Damage on both kits, raised together so the balance between them holds', from: '120% / 120% / 90%', to: '140% / 140% / 105% ATK' },
    { t: 'buff', kind: 'hero', who: 'vasco', what: 'The Vessel', text: 'ATK', from: '+20%', to: '+25%', note: 'Measured on their own over 110 fights each, the two faces now win 41.8% apiece, against 34.2% and 53.3% before this pass. Composite 44.5.' }
  ] },
  { v: '0.4.11', d: '2026-10-07', date: 'Vasco: the two faces balanced', changes: [
    { t: 'buff', kind: 'hero', who: 'vasco', what: 'Prank', text: 'Damage, and the tricks it pulls', from: '95% ATK, one trick at 20% for 2 turns', to: '120% ATK, two tricks at 25% for 3 turns' },
    { t: 'buff', kind: 'hero', who: 'vasco', what: 'Mimicry', text: 'Copying a move that hit the whole team', from: 'came back as a single hit', to: 'comes back wide, at a lower rate for each enemy', note: 'It had never been able to copy an area attack at all.' },
    { t: 'nerf', kind: 'hero', who: 'vasco', what: 'The Vessel', text: 'ATK and lifesteal', from: '+35% and 30%', to: '+20% and 20%' },
    { t: 'nerf', kind: 'hero', who: 'vasco', what: 'Hellmark / Gift of the Pit', text: 'Damage, and Gift no longer shatters Shields outright', from: '150% / 130% to all', to: '120% / 90% to all', note: 'Measured head to head over 120 fights each, the jester won 34.2% and the Vessel 53.3%, dealing three times the damage. These numbers close that gap and still need a confirming run.' }
  ] },
  { v: '0.4.10', d: '2026-10-07', date: 'Out of Sight fixed', changes: [
    { t: 'nerf', kind: 'hero', who: 'seraphine', what: 'Behind the Scenes', text: 'How long Out of Sight lasted', from: 'about two thirds of a fight', to: 'the gap between her turns, as described', note: 'A status granted on a unit own turn survives that turn and only expires at the end of the next one, so it ran roughly twice as long as intended. Measured across a full battle: hidden 65% of the time, now 35%.' }
  ] },
  { v: '0.4.9', d: '2026-10-07', date: 'Vasco switches on purpose', changes: [
    { t: 'rework', kind: 'hero', who: 'vasco', what: 'Two Faces', text: 'What decides which face is out', from: 'his HP, automatically', to: 'he does, by using Curtain Call', note: 'The ultimate is the switch and nothing else. HP no longer changes anything on its own.' },
    { t: 'rework', kind: 'hero', who: 'vasco', what: 'Curtain Call', text: 'What it costs', from: 'a turn', to: 'nothing but the charge, since he acts again at once', note: 'A turn that deals nothing cannot compete with the 200% to 300% ultimate every other hero fires. It also charges 80% faster.' },
    { t: 'rework', kind: 'hero', who: 'vasco', what: 'Gift of the Pit', text: 'Reach', from: 'one enemy for 170%', to: 'every enemy for 130%, stripping all of their buffs and Shields', note: 'His only wide attack, now that the ultimate deals no damage.' },
    { t: 'buff', kind: 'hero', who: 'vasco', text: 'Max HP / DEF', from: '1260 / 76', to: '1360 / 82' },
    { t: 'buff', kind: 'hero', who: 'vasco', what: 'Hellmark / Prank', text: 'Damage', from: '120% / 80%', to: '150% / 95% ATK' },
    { t: 'buff', kind: 'hero', who: 'vasco', what: 'The Vessel', text: 'Healing from its hits', from: '25%', to: '30% of the damage' },
    { t: 'nerf', kind: 'hero', who: 'vasco', what: 'The Vessel', text: 'Skill Points the team earns from his basics while it is out', from: '1 each', to: 'none', note: 'It fights for itself. Putting the jester back on is how the team gets paid, which is what makes him change face. Composite 52.1 to 46.2 across seven balance runs.' },
    { t: 'adjust', kind: 'hero', who: 'vasco', what: 'Harlequin / Hollow', text: 'Rebuilt: they pick a side instead of moving a threshold that no longer exists', from: 'when the Vessel wakes', to: 'Harlequin doubles the jester tricks, Hollow deepens the Vessel drinking' }
  ] },
  { v: '0.4.8', d: '2026-10-07', date: 'Vasco reworked', changes: [
    { t: 'rework', kind: 'hero', who: 'vasco', what: 'Two Faces', text: 'What the two faces are', from: 'the same three moves behaving differently', to: 'two separate sets of three moves', note: 'The jester keeps Prank, Mimicry and Curtain Call. The Vessel brings Hellmark, Gift of the Pit and Nothing Left to Laugh At.' },
    { t: 'rework', kind: 'hero', who: 'vasco', what: 'Two Faces', text: 'How it changes hands', from: 'wakes once below 40% HP and stays for the battle', to: 'wakes below 40% HP and sleeps again above 60%, as often as the fight demands' },
    { t: 'buff', kind: 'hero', who: 'vasco', what: 'Nothing Left to Laugh At', text: 'The Vessel version of the ultimate', from: '190% ATK, the same as the jester version', to: '215% ATK and he heals for 30% of what it deals' },
    { t: 'buff', kind: 'hero', who: 'vasco', what: 'Prank', text: 'Damage, and the Blind now lasts as long as the other tricks', from: '80% ATK, Blind 1 turn', to: '85% ATK, every trick 2 turns' },
    { t: 'nerf', kind: 'hero', who: 'vasco', what: 'Mimicry', text: 'Ceiling on a copied move', from: '220%', to: '180% ATK', note: 'Composite 52.7 to 52.1, so the shape changed and the power did not.' }
  ] },
  { v: '0.4.7', d: '2026-10-07', date: 'Hiding swapped, Aamay explained, Elphi trimmed', changes: [
    { t: 'rework', kind: 'hero', who: 'aamay', what: 'The Chronicle', text: 'How he keeps out of reach', from: 'a 30% chance to be overlooked, which nothing on screen ever showed', to: 'while another hero stands he cannot be aimed at with single-target attacks at all', note: 'Swapped with Seraphine. He is the one nobody knows is there. Bosses still find him and area attacks still reach him.' },
    { t: 'rework', kind: 'hero', who: 'seraphine', what: 'Behind the Scenes', text: 'How she keeps out of reach', from: 'untargetable the whole time another hero stood', to: 'out of sight for one round on every third turn of hers', note: 'She is known and watched, so she can only slip away for a moment. It is a status with a countdown, so it can be read off the card.' },
    { t: 'nerf', kind: 'hero', who: 'elphi', what: 'Last Light', text: 'He rises with', from: '45% max HP and ATK +40%', to: '30% max HP and ATK +30%', note: 'Sentinel 60% to 40%, Dawnbreaker 30% to 20%.' },
    { t: 'adjust', kind: 'hero', who: 'aamay', what: 'The Last Page', text: 'Live status text still quoted 30% a Page after the rework halved it', from: '30%', to: '15%, with the current total shown' }
  ] },
  { v: '0.4.6', d: '2026-10-07', date: 'Elphi reworked', changes: [
    { t: 'rework', kind: 'hero', who: 'elphi', what: 'Last Light', text: 'New: he rises once per battle', from: 'nothing', to: 'the first time he falls he returns with 45% of his max HP and keeps ATK +40% and +10% crit chance', note: 'He is the one who stood in the way and did not stop. Once per battle only.' },
    { t: 'buff', kind: 'hero', who: 'elphi', what: 'Lightblade', text: 'Damage', from: '100%', to: '120% ATK' },
    { t: 'nerf', kind: 'hero', who: 'elphi', what: 'Sanctum Blade', text: 'Shield for every ally', from: '15%', to: '11% of his max HP' },
    { t: 'nerf', kind: 'hero', who: 'elphi', what: 'Last Light', text: 'Shield when an ally drops low', from: '15%', to: '10% of his max HP' },
    { t: 'adjust', kind: 'hero', who: 'elphi', what: 'Sentinel / Dawnbreaker', text: 'Both builds now also decide how much he rises with', from: 'no effect', to: 'Sentinel 60%, Dawnbreaker 30%', note: 'Composite 55.4 to 56.0, so the shield cuts pay for the rest. Duel 34 to 50. He leans on the sword now rather than on shielding everyone.' }
  ] },
  { v: '0.4.5', d: '2026-10-07', date: 'Aamay reworked', changes: [
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
  { v: '0.4.4', d: '2026-10-07', date: 'Last Stand removed, David, Seraphine, Harry, Lachlan', changes: [
    { t: 'rework', kind: 'system', who: 'Last Stand', text: 'Removed entirely', from: '+35% damage and 15% less taken for the last hero standing, on ten heroes', to: 'gone', note: 'It was there to prop supports up in duels and put the same paragraph in ten passives. It also quietly applied to a hero boss fighting alone. Duel numbers get fixed per hero from now on.' },
    { t: 'buff', kind: 'hero', who: 'david', what: 'Sworn Guard', text: 'Damage cut while guarding', from: '40%', to: '50%' },
    { t: 'buff', kind: 'hero', who: 'david', what: 'Sworn Guard', text: 'Healing per hit intercepted for the guarded ally', from: 'none', to: '3% of his max HP', note: 'His guard now catches the fourteen skills that used to walk past it, so the reward grows with the extra work. Composite 48.7 to 56.' },
    { t: 'nerf', kind: 'hero', who: 'seraphine', what: 'Behind the Scenes', text: 'What hides her', from: 'any living ally, creatures included, and every enemy', to: 'a living hero only, and bosses see her anyway' },
    { t: 'nerf', kind: 'hero', who: 'harry', what: 'Crush', text: 'Damage', from: '150%', to: '135% ATK', note: 'Force build 220% to 200%. He was the only hero above the band at 63.6, now 59.2.' },
    { t: 'nerf', kind: 'hero', who: 'lachlan', text: 'Max HP', from: '1400', to: '1290', note: 'Top of the duel table at 93, now 85.' },
    { t: 'adjust', kind: 'hero', who: 'harry', what: 'Force', text: 'Build text quoted a baseline that was never true', from: 'instead of 175%', to: 'instead of 135%' }
  ] },
  { v: '0.4.1', d: '2026-10-07', date: 'Guard, creatures and mimicry', changes: [
    { t: 'rework', kind: 'hero', who: 'david', what: 'Hold the Line', text: 'Which attacks the guard catches', from: 'only ordinary attacks', to: 'every single-target attack', note: 'Fourteen skills bypassed it, including Crush, Phantom Switch, Finger Frame and Sanctum Blade. Area attacks still ignore it, as described.' },
    { t: 'rework', kind: 'hero', who: 'vasco', what: 'Mimicry', text: 'What it copies', from: 'a flat 100% / 140% / 180% by slot, effects dropped', to: 'the real strength and effect of the move', note: 'Still capped so a boss move comes back balanced.' },
    { t: 'adjust', kind: 'rule', what: 'End of battle summary', text: 'Damage dealt and soaked by a creature', from: 'lost when it died', to: 'credited to whoever summoned it' }
  ] },
  { v: '0.3.8', old: '0.92', d: '2026-10-05', about: true, date: 'Alfred, duels and healers', changes: [
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
  { v: '0.3.6', old: '0.9', d: '2026-10-05', about: true, date: 'The court of Ethan', changes: [
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
  { v: '0.3.4', old: '0.83', d: '2026-10-04', about: true, date: 'Tightening the field', changes: [
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
  { v: '0.3.3', old: '0.82', d: '2026-10-04', about: true, date: 'Sharper identities', changes: [
    { t: 'new', kind: 'hero', who: 'angus', what: 'Unyielding Aura', text: 'Anyone who strikes Angus is Sapped: ATK -6% until the end of their next turn.' },
    { t: 'new', kind: 'hero', who: 'flynn', what: 'Overcharge', text: 'When an enemy Flynn Shocked falls, the Shock arcs to another enemy.' },
    { t: 'rework', kind: 'hero', who: 'elphi', what: 'Passive', text: 'Protector', from: 'allies below 50% HP take 15% less damage', to: 'Last Light: the first time each ally drops below 30% HP, a Shield worth 18% of his max HP' },
    { t: 'adjust', kind: 'system', who: 'Damage modifiers', text: 'Elphi\'s old damage reduction overlapped with Angus. Each defender now protects in a different way: Angus weakens attackers, Elphi saves allies at the brink, David redirects, Danielle and Soham shield.' }
  ] },
  { v: '0.3.2', old: '0.81', d: '2026-10-04', about: true, date: 'Vehra takes flight', changes: [
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
  { v: '0.3.1', old: '0.8', d: '2026-10-04', about: true, date: 'Stone, hexagons and halos', changes: [
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
  { v: '0.3.0', old: '0.7', d: '2026-10-04', about: true, date: 'New heroes', changes: [
    { t: 'new', kind: 'hero', who: 'peguicha', text: 'New hero. Cinderbeads: embedded beads deal pain each turn (28% ATK per bead) and lower ATK and DEF by 8% per bead. He heals for 30% of their pain. Hellfire charges 30% slower.' },
    { t: 'new', kind: 'hero', who: 'vehra', text: 'New hero. 14% evasion, +25% damage to enemies below half HP. Wing Dive leaves her Airborne, dodging the next attack.' },
    { t: 'new', kind: 'hero', who: 'soham', text: 'New hero. Hex Wall: starts at 50% of his max HP, soaks 30% of every direct hit on his team until it runs out.' },
    { t: 'new', kind: 'hero', who: 'seraphine', text: 'New hero. Twin Halos cut twice for 40% ATK after each of her actions. Halo Storm gives The Chosen an immediate turn.' },
    { t: 'new', kind: 'system', who: 'Team bonuses', text: 'Infernal Pact (Peguicha and Vehra): +15% damage to debuffed enemies. The Hidden Hand (Seraphine and The Chosen): The Chosen ATK +15%, Seraphine crit +10%.' },
    { t: 'new', kind: 'system', who: 'Rivals', text: 'Harry and Soham are rivals. Seraphine deals +20% damage to Harry.' },
    { t: 'adjust', kind: 'hero', who: 'daniel', text: 'Daniel is now Danielle. Kit unchanged.' }
  ] },
  { v: '0.2.7', old: '0.63', d: '2026-10-03', about: true, date: 'Healing cap, Angus and Aegis', changes: [
    { t: 'new', kind: 'hero', who: 'yousuf', what: 'Healing cap', text: 'Allies he heals become Mended for 2 turns. His heals on a Mended ally are 30% weaker. Regen ticks are unaffected.', note: 'Spreading heals stays fully effective. Simulated team win 73% → 63%.' },
    { t: 'nerf', kind: 'hero', who: 'angus', text: 'Max HP', from: '1750', to: '1620' },
    { t: 'buff', kind: 'hero', who: 'angus', text: 'ATK', from: '98', to: '108' },
    { t: 'buff', kind: 'hero', who: 'angus', text: 'Steadfast Cut', from: '100%', to: '115% ATK' },
    { t: 'buff', kind: 'hero', who: 'angus', text: 'Unbreakable damage', from: '120%', to: '145% ATK' },
    { t: 'adjust', kind: 'hero', who: 'angus', what: 'Warlord build', text: 'Steadfast Cut', from: '140%', to: '155% ATK', note: 'Keeps Warlord ahead of the new base damage.' },
    { t: 'nerf', kind: 'hero', who: 'lachlan', what: 'Aegis build', text: 'Shield cap / regen per turn', from: '50% / 10%', to: '44% / 8.5% of max HP' }
  ] },
  { v: '0.2.6', old: '0.62', d: '2026-10-03', about: true, date: 'David, Gemia and The Chosen', changes: [
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
  { v: '0.2.5', old: '0.61', d: '2026-10-03', about: true, date: 'Leo\'s channelled beam', changes: [
    { t: 'rework', kind: 'hero', who: 'leo', what: 'Fire Beam', text: 'Start hit', from: '150% target / 60% others', to: '120% target / 50% others, then Channel', note: 'While channelling, the skill becomes Sustain Beam: free, no SP gain, same target, 160%, 200%, then 240% ATK, re-applying Burn each time.' },
    { t: 'new', kind: 'hero', who: 'leo', what: 'Channel', text: 'The beam breaks if Leo takes 30% of his max HP before his next turn or is stunned. Any other action releases it. It ends if the target dies.' },
    { t: 'new', kind: 'hero', who: 'leo', what: 'Heat Haze', text: 'Evasion while channelling', from: '+0%', to: '+12%' },
    { t: 'rework', kind: 'hero', who: 'leo', what: 'Pyromancer build', text: 'Trade-off', from: 'Burn +55%, weaker beam', to: 'Burn +40%, 2 Burn stacks per beam hit, ramp 105% to 180%, breaks at 40%' },
    { t: 'rework', kind: 'hero', who: 'leo', what: 'Lancer build', text: 'Trade-off', from: 'Beam 190%, ATK +12%', to: 'Ramp 130% to 290%, breaks at 18%, no ATK bonus' },
    { t: 'new', kind: 'system', who: 'Enemy targeting', text: 'Enemies aim at a channelling hero 25% of the time to try to break the beam.' }
  ] },
  { v: '0.2.4', old: '0.6', d: '2026-10-03', about: true, date: 'Research pass', changes: [
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
  { v: '0.2.3', old: '0.5', d: '2026-10-03', about: true, date: 'Yunze the lone hunter', changes: [
    { t: 'rework', kind: 'hero', who: 'yunze', what: 'Lone Hunter', text: 'Switch Hands SP gain', from: '+1 team SP', to: 'none' },
    { t: 'rework', kind: 'hero', who: 'yunze', what: 'Lone Hunter', text: 'Phantom Switch cost', from: '1 team SP', to: 'free, usable every third turn' },
    { t: 'rework', kind: 'hero', who: 'yunze', what: 'Hunted', text: 'Who gets the bonus', from: 'everyone (+25%)', to: 'only the Yunze who marked it (+25%, Reaper +40%)' },
    { t: 'new', kind: 'system', who: 'Taunt', text: 'Taunt now also forces heroes to target the taunter, for opponents in custom battles.' },
    { t: 'adjust', kind: 'system', who: 'Storm and Flame', text: 'The DoT bonus now belongs to the team that has the bonus, so it works for opponents too. No change for your team.' }
  ] },
  { v: '0.2.2', old: '0.42', d: '2026-10-03', about: true, date: 'Tougher Harry, faster Yunze', changes: [
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
  { v: '0.2.1', old: '0.41', d: '2026-10-03', about: true, date: 'Harry cycles less, Danielle stacks less', changes: [
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
  { v: '0.2.0', old: '0.4', d: '2026-10-03', about: true, date: 'Harry rework, Danielle buffs', changes: [
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
  { v: '0.1.3', old: '0.31', d: '2026-10-02', about: true, date: 'Builds pass', changes: [
    { t: 'nerf', kind: 'hero', who: 'chosen', what: 'Dancer build', text: 'Gilded Dance no longer raises allies\' ATK +20% for 2 turns.', note: 'Dancer had no downside before. It still keeps +10% SPD and 4 hits.' },
    { t: 'nerf', kind: 'hero', who: 'flynn', what: 'Overload build', text: 'Spark Jab Shock chance', from: '50%', to: '20%', note: 'Previously had no downside.' },
    { t: 'nerf', kind: 'hero', who: 'leo', what: 'Pyromancer build', text: 'Fire Beam damage', from: '150% / 60%', to: '115% / 40%', note: 'Target / others. Previously had no downside.' },
    { t: 'nerf', kind: 'hero', who: 'yunze', what: 'Phantom build', text: 'ATK', from: '+0%', to: '-8%', note: 'Previously had no downside.' },
    { t: 'nerf', kind: 'hero', who: 'malakai', what: 'Apothecary build', text: 'Elite Bargain ATK boost', from: '+35%', to: '+25%', note: 'Previously had no downside.' },
    { t: 'nerf', kind: 'hero', who: 'malakai', what: 'Toxicologist build', text: 'Grand Transmutation ally heal', from: '20%', to: '10%', note: 'Previously had no downside.' },
    { t: 'nerf', kind: 'hero', who: 'david', what: 'Phalanx build', text: 'ATK', from: '+0%', to: '-10%', note: 'Previously had no downside.' }
  ] },
  { v: '0.1.2', old: '0.3', d: '2026-10-02', about: true, date: 'Enemy counts', changes: [
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
  { v: '0.1.1', old: '0.2', d: '2026-10-02', about: true, date: 'Accuracy and difficulty', changes: [
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
  { v: '0.1.0', old: '0.1', d: '2026-10-02', about: true, date: 'Launch tuning', changes: [
    { t: 'nerf', kind: 'hero', who: 'yousuf', text: 'Mending Light', from: '16% max HP + 160% ATK', to: '13% + 140% ATK' },
    { t: 'new', kind: 'system', who: 'Gauntlet scaling', text: 'Per wave: enemy HP +15% and ATK +8.5%, starting at 150% ATK. Bosses take 72% of the ATK scaling.' }
  ] }
];
const UPDATES = [
  { v: '0.5.5', d: '2026-10-08', items: [
    'The Balance screen works again, and so does H. Benjamin\u2019s page. Two changes in the last update were logged with a type the renderer did not have a style for, so it threw the moment anything tried to draw them: the whole Balance screen and every hero sheet that mentioned one of those changes simply did nothing when you tapped it. The type exists now, an unrecognised one falls back quietly instead of taking the screen down, and the test suite opens every hero sheet and the Balance screen on every run.',
    'Skulls are worth something now. They were free: a mark wears off after a couple of turns, so he could put it back on the same enemy and take another Skull, forever, and the pile only ever went up. A given enemy pays him once and never again, one Skull is spent at the start of each of his turns, and coming apart spends every one he is carrying. That leaves the dead as the only thing that keeps the pile topped up, on either side, which is the point: a death should be worth something to him.',
    'A spent Skull mends him 14% of his max HP rather than 5% a turn for holding it, because the scarcity is the idea and the answer is to make one matter rather than to hand out more.'
  ] },
  { v: '0.5.4', d: '2026-10-08', items: [
    'You can hold a turn. There is a fourth button under the three abilities that does nothing at all: no attack, no Skill Point, 10% ultimate charge. Against Danielle, or anyone who only punishes you for swinging, or a duel where every move you have makes things worse, not moving is a real answer and until now the game would not let you give it.',
    'H. Benjamin was lifestealing off attacks that missed. The drain on Marrow Draw was checked properly but the mark that follows it was not, so a dodged skill still Withered the target and still paid him for it. A blow that never lands now does nothing at all, and the Plaguebearer build had the same hole.',
    'His Skulls are a thing you can count again, and they are what keeps him alive. He carries up to 4, shown as a number on his card, and he takes one for every enemy he Withers fresh and one for every unit that falls anywhere on the field, his own side included. Each one mends him 5% of his max HP at the start of his turn. He is much frailer to pay for it: 1010 health and 60 armour, the lowest of either in the game.',
    'The Corpse is its own thing rather than his kit at a discount. It barely hurts anything, takes 65% less damage, and all three of its moves are about getting up: Gnaw marks and feeds, Gather the Dead spends every Skull he is carrying for 9% of his max HP each, and The Second Breath hauls him upright. Getting up needs 45% of his max HP now rather than 35%.',
    'Ephraim is significantly weaker and he reaches people properly. His health and his damage both come down, and his duel rate falls from 96 to 70. Riled and Rabid start earlier, at 65% and 30% health, because starting at half meant most of a fight went by with no bonus at all. All three of his attacks now lunge in, throw the whole action from there, and walk back.',
    'A hero whose portrait changes with a status now actually repaints, which is why the Corpse never appeared.'
  ] },
  { v: '0.5.3', d: '2026-10-08', items: [
    'Ephraim is driven by his own health bar and nothing else. The grip is gone: it was a hidden relationship between him and one enemy, set by one button and paying out through two numbers you could never see, and even once the rules were right it still read as him letting go for no reason. Hurt him instead and he changes, twice, with a badge for each. Under half health he is Riled: ATK +22%, nothing can Stun him, and he mends 5% of his max HP each turn. Under a quarter he is Rabid: ATK +42% and 7%. Both come and go with the bar you are already looking at, so there is nothing to keep track of.',
    'His punches land in the same place now. Knuckle Down and Seize both went through the shared melee effect, which rotates the slash by 38 degrees for every hit in a combo and throws his card 42% of the way across the board and back on each one. Three hits meant three angles and three round trips, which is what looked random and ugly. The fist comes in on one axis and the impact lands on one spot; the bite is two jaws closing from fixed points. Nothing moves his card at all.',
    'He is also properly weaker: 118 ATK instead of 126, and the two states give far less than the grip did. His duel rate drops from 96 to 80.',
    'H. Benjamin\u2019s Skulls are back where they belong. Making them units put two extra cards in your team row where they read as somebody else\u2019s summons. They are the skulls already drifting at his hands in his portrait, and what they do is feed him: every enemy he Withers that was not Withered already hands him 7% of his max HP, with a skull drifting off it and back to him. The Corpse is unchanged, so he still comes apart once and can still haul himself up.',
    'A boss marking you with Withered smothers healing to 40% rather than closing it. Uncleansable is the right thing in your hands, where you pick one enemy and it stops being healed. Pointed the other way it is not a tool, it is a wall: the boss re-marks your healer every single turn and nothing answers it, and The Oldest Grave fell to 0% against the one team that brings one.',
    'Ephraim no longer looks cut in half. His bare chest was two shoulder ellipses sitting on a trapezium with a line drawn across the join.'
  ] },
  { v: '0.5.2', d: '2026-10-08', items: [
    'Withered actually stops healing now. It never did, and the reason was a fix made for it one version ago: every heal that also cleanses was changed to cleanse first so a healer would stop wasting heals into a block, which meant Yousuf, Kingsley, Malakai and every Song tick took the mark straight back off and healed anyway. Withered cannot be lifted at all any more. It only runs out.',
    'Ephraim no longer lets go for no reason. Anything he punched used to become his Quarry, so aiming somewhere else silently moved the grip and it looked arbitrary. Drag Down is the only thing that takes hold now, and he will not let go of something that is still standing. One button, one target, and it stays until the thing falls, which is what a pitbull is for.',
    'Isaac is easier to read and weaker. His card fades out with a dashed outline while he is Invisible, the same language the Afterimage enemies use, so you can see at a glance whether he is hidden. Invisible gives +28% evasion rather than +40%, and the blow out of sight hits 18% harder rather than 25%.',
    'The Heroes, team and custom screens use the whole window on a computer. Twenty-seven heroes in a 560px phone column was five across and a lot of scrolling, with nine hundred pixels going spare either side. It is eight or nine across now, and long names no longer run underneath the info button.'
  ] },
  { v: '0.5.1', d: '2026-10-08', items: [
    'H. Benjamin comes apart instead of dying. The Skulls were a number on a badge, which is not something anyone can see, so they are units now: the first time a blow would finish him he collapses into a Corpse and two Skulls rise beside him. The Corpse has its own three weaker moves, takes 55% less damage and keeps debuffing; the Skulls take their own turns and bite. Mend the Corpse back to 35% of his max HP and he stands up, and the Skulls crumble with him. He only gets the one bargain. He is frailer than he was on his feet and hits harder, and his ultimate is a debuff rather than two turns of handing the whole team immortality, which he could do over and over from 1 HP.',
    'Withered is a team mark now. It blocked healing outright and gave him 20% more damage, and it gave the rest of the team nothing at all, so bringing a debuffer bought you a heal block and no reason to have him. Everyone else on his side hits a Withered enemy 12% harder.',
    'Ephraim has something to decide. He used to be a damage curve with a Taunt on it. He now takes hold of one enemy at a time: 16% more damage to whatever he has hold of, 12% less from everything that is not it, and he mends when it goes down. Only one thing at a time, so switching costs him. Drag Down hauls it back so its turn comes later, and Shake goes through its armour.',
    'Isaac is hard to hit rather than impossible to pick. Being unable to aim at him switched itself off the moment he was the last one standing, because something always has to be targetable. Invisible gives him +40% evasion instead, which is worth the same whether there are three of them left or one, and the status says Invisible rather than Out of Sight.',
    'All three of them looked like Harry in a different palette, and there was a reason: cloak, beard and bandana each take a colour and all three were being handed true, so every feature meant to tell them apart rendered as nothing. H. Benjamin is a skull in a hood now, with a tipped-over one for the Corpse and a floating one for each Skull. Ephraim is bare-chested with wrapped knuckles and a red bandana. Isaac has a scarf pulled over his face.'
  ] },
  { v: '0.5.0', d: '2026-10-07', items: [
    'Three new heroes, which is the only kind of work that moves the middle number. The roster is 27 and the campaign is 34 stages.',
    'H. Benjamin, The Oldest Name. A skeletal necromancer with skulls drifting at his hands, older than anything else in the record, and the reason Harry and Yunze are as hard to kill as they are: he lent it out. He holds Skulls, and a blow that would kill him spends one instead and leaves him standing on a sliver, mending as it goes. Every enemy that falls hands one back, and with none left he dies like anyone else. What he marks is Withered and cannot be healed at all, which is the first thing in the game that closes healing rather than reducing it.',
    'Ephraim, The Pitbull. A short First Era brawler who fights with his hands and gets worse to deal with the more of him you take off: +1% ATK for every 2% of his max HP that is missing, so half again on his last point. Below half health nothing can stun him, and everything he puts down mends him. His health bar is the meter, so there is nothing to count and nothing he can lose by being hit.',
    'Isaac, The Watcher. The fastest hero in the game, and the one who feeds Aamay. His invisibility is spent rather than held: he starts out of sight, nothing can aim at him while he is there, and striking gives him away. The blow he lands out of sight hits 30% harder and always crits, and Slipping Away puts him back out of sight every other turn while telling the team where the hardest hitter is. Put him with Aamay and the Chronicle fills twice as fast.',
    'Three stages to unlock them from: The Kennels and The Oldest Grave in the First Era, and The Rooftops in the Current Era. H. Benjamin sits in the First Era as its oldest figure rather than in an era of his own, because there is barely anyone back there with him.',
    'Two bugs came out of building these three. The first: every new ability that read a default with ?? was getting zero on the Balanced build, because the helper that reads build tags returns 0 for a tag the build does not set, not nothing. Balanced Isaac had no ambush bonus at all and Balanced H. Benjamin drained nothing, and it hid itself well: the numbers were raised three times and the build table never moved, because nothing was reading them. The test suite now fails on it.',
    'The second. Every heal in the game that also cleanses was healing first and cleansing second. It had never mattered, because Mended was the only debuff that touched healing and it merely reduces it. Withered blocks healing outright, and suddenly Yousuf, Kingsley and Malakai were each removing the thing that had stopped the heal they had already spent. They all cleanse first now.'
  ] },
  { v: '0.4.16', d: '2026-10-07', items: [
    'Lachlan can be broken through now. The Azure Shield caps at 25% instead of 30% and comes back 5% a turn instead of 6%, and Azure Nova restores half a wall rather than filling it all the way up. Refilling it completely meant there was never a moment when the Shield was actually down. He went from soaking more than anyone on the table to the bottom edge of the band, and his duel rate fell from 88, the highest in the game, to 69.',
    'The King\u2019s Trial was unwinnable for most teams, and not for the reason it looked. Ethan and Ben are both support heroes, so at 2.6 times health they could not be killed quickly and could not kill either: the fight ran past turn 150 into sudden death, which raises damage and halves healing, and that finished the heroes rather than the bosses. Three of the four test teams were averaging 190 to 240 turns and losing. They now have less health and hit a little harder, and the sellsword with them is no longer swinging at 2.3 times attack.',
    'Seraphine\u2019s Severance marks and her Hidden Hand finally show on screen. A mark used to land in complete silence: now a pale thread goes out from her and the scissors appear above the target, one for each mark, and the badge says how many are on it. The Hidden Hand drops strings onto the ally from above the arena and pulls them forward, instead of only printing a line of text.',
    'The Vessel no longer takes 15% less damage, Harry\u2019s Crush goes back up to 145% now that it costs two Skill Points, Malakai\u2019s flask comes down to 100%, and Ben\u2019s Sharp Word hits for 135% and delays by 20%.'
  ] },
  { v: '0.4.15', d: '2026-10-07', items: [
    'Malakai is countable now. He used to throw a random one of three debuffs and refund a Skill Point on a coin flip, and you could see neither. He mixes in a fixed order instead, Venom then Sedative then Solvent, with the next phial on a badge above him, and the flask hits for 110% rather than 90%. Every third one, the Solvent, is on the house: it splashes every other enemy with the same debuff and hands the team an extra Skill Point, which is the thing worth counting towards.',
    'His deal changed too. Elite Bargain used to do the same thing every time. Now it takes every debuff off the ally and sells it on to the enemy with the highest ATK, and the ally still gets the attack and speed. It reads off the board, so it is never the same spell twice, and if there was nothing to sell the enemy is Poisoned anyway.',
    'Angus can no longer stand inside Unbreakable forever. It came back faster than it ran out, which in a one against five made him effectively immortal. Holding out like that now leaves him Spent for 4 turns, gaining no ultimate charge at all. His sword pays for it: 115% to 130%, and the ultimate 145% to 160%, so he is as strong as he was and no longer unkillable.',
    'Kingsley has a fifth thing in the bag, the Loaded Dice, which pays the team two Skill Points and sharpens everybody. The item he pulls out also appears above him now, so you can see which one it was instead of guessing from the colour.',
    'Alfred\u2019s three tempos are three different things rather than three damage numbers. Allegro buys time, Andante cannot miss, and Grave goes through armour. The tooltip had also been claiming Grave hit for 140% when the engine has always used 130%.',
    'The Chosen is slightly less tanky, Danielle ripostes less often but harder, and the jester\u2019s Prank comes down from 155% to 130%.',
    'Soham’s Hex Shield reads apart from an ordinary one again. When both were on him the whole bar went yellow; the ordinary Shield is blue and sits first, his own is yellow and sits after it.',
    'The info sheet says what each move costs and pays again. It had lost those labels when it grew the view that shows both of Vasco\u2019s faces, and the version in the gallery had always printed +1 SP on every hero, which was never true for Yunze or for the Vessel.'
  ] },
  { v: '0.4.14', d: '2026-10-07', items: [
    'A skill can now cost two Skill Points instead of one, and two of them do. Crush is one: Harry loses no damage, he simply cannot throw it every turn. Wild Card is the other, and the cards are worth more for it, which makes the jester earning a point on every basic the point of him rather than a footnote.',
    'This gives the heroes who make Skill Points something real to make them for. Ethan, the jester and Malakai all matter more when the best skills cost more than a turn of attacking.',
    'The action bar and the hero pages now say what a skill actually costs. They had always said 1 SP, which was true until today.',
    'The Vessel takes 15% less damage. Its damage was cut on purpose in the last update, so it gets to be harder to kill instead of harder to survive.'
  ] },
  { v: '0.4.13', d: '2026-10-07', items: [
    'Mimicry is gone and the jester deals a Wild Card instead. Copying whatever an enemy last did never read well: there was no way to know what you were about to get, and often it was nothing worth having. He now turns over one of five cards for the whole team. Hearts heals, Spades sharpens, Clubs shields, Diamonds pays, and about one draw in ten is the Joker, which does all four at 40% strength. The card turns over on screen so you can see which one it was.',
    'The Vessel hits far less hard. Hellmark drops from 150% to 115% ATK, Gift of the Pit from 130% to 82% against every enemy, and its ATK bonus from +35% to +15%. It gets that back as survival instead: its hits now heal him for 35% of the damage. Played on their own the two faces win 47.3% and 40.0% of fights, where the jester used to win a third and the Vessel over half.',
    'Encircled now cuts where the halos already are. The damage each turn used to borrow the generic effect, which looked like something thrown from Seraphine rather than something closing in around the enemy it was already circling.',
    'Yousuf heals more across the whole kit, and Ben trades some of Give the Order for sharper judgement: it comes once every three turns instead of every other, and in exchange he punishes a delayed enemy harder and his ultimate drops the attack of the whole room.'
  ] },
  { v: '0.4.12', d: '2026-10-07', items: [
    'The two faces of Vasco are now worth the same. Played on their own they win 41.8% of fights each, where the jester used to win a third and the thing behind him over half. The first pass balanced them by pulling the Vessel down too far, so both have been raised together: Prank and Hellmark to 140% ATK and Gift of the Pit to 105%.'
  ] },
  { v: '0.4.11', d: '2026-10-07', items: [
    'Mimicry can copy an attack that hit the whole team. It never could: anything it borrowed came back as a single hit, whatever the original was. A wide move now comes back wide, at a lower rate for each enemy.',
    'The two faces of Vasco are closer together. Measured on their own, the jester won about a third of his fights and the thing behind him over half, dealing three times the damage. Prank now hits for 120% and pulls two tricks at 25% for 3 turns, while the Vessel loses ATK, lifesteal and damage, and Gift of the Pit no longer shatters every Shield outright.',
    'Both of his kits can be read wherever he is, in a fight or out of one, instead of only the one he happens to be holding.',
    'Team bonuses you have not reached yet can be listed on the team screen, so the pairings are discoverable instead of only showing once you already have them.'
  ] },
  { v: '0.4.10', d: '2026-10-07', items: [
    'Seraphine was out of sight far longer than one round in three. A status given on her own turn survives that turn and only runs out at the end of her next one, so she spent about two thirds of a fight untargetable instead of a third. Measured over a full battle it was 65% of turns; it is now 35%.',
    'Out of Sight also looked wrong. She was drawn in near greyscale, which read as dead rather than hidden, under a tag that just said Unseen. She now keeps her colour behind a pale veil and the tag says Out of sight.',
    'Team bonuses can be read on a computer. On a wide window the active ones show what they do without being tapped, and a sheet opens in the middle of the screen rather than clinging to the bottom edge where it was getting cut off.'
  ] },
  { v: '0.4.9', d: '2026-10-07', items: [
    'Vasco changes face because he decides to. Curtain Call is the switch and nothing else: it hands the room to the other kit and he acts again at once, so it costs him nothing but the charge, and it charges 80% faster than other ultimates. His HP no longer changes anything on its own.',
    'The two kits now want different things from a fight. The jester works the room and earns the team a Skill Point on every basic. The thing behind him only feeds: it hits far harder, heals for 30% of what it deals, tears every buff and Shield off the whole room with Gift of the Pit, and earns the team nothing at all. Running dry of Skill Points is what sends him back to the jester.',
    'Every update in the Guide now carries the date it shipped. The ones from before this repository existed are estimates and say so.'
  ] },
  { v: '0.4.8', d: '2026-10-07', items: [
    'Vasco now has two separate sets of moves rather than three buttons that behave differently. The jester keeps Prank, Mimicry and Curtain Call. The thing behind him brings its own: Hellmark, Gift of the Pit, and Nothing Left to Laugh At, which hits every enemy for 215% ATK and heals him for 30% of it.',
    'The mask can change hands more than once. It takes over below 40% HP as before, but now hands back once he climbs above 60%, so both sets matter in one fight. The gap between the two numbers keeps him from flickering every time he is healed a point.',
    'His hero page lists both sets, and in battle the action bar and his details show whichever one he is holding. Prank hits a little harder and all three of its tricks last 2 turns. A copied move is capped at 180% ATK instead of 220%.'
  ] },
  { v: '0.4.7', d: '2026-10-07', items: [
    'Aamay and Seraphine have traded hiding places. Aamay is the one nobody knows is down there, so while another of his heroes still stands he cannot be aimed at with single-target attacks at all. Bosses find him anyway and attacks on the whole team still reach him. Seraphine is known and watched, so she only slips out of view for one round on every third turn of hers.',
    'No more invisible dice. The old version gave Aamay a 30% chance to be overlooked, which nothing on screen ever showed, so there was no way to tell it had happened. Out of Sight is now a status on the card with a countdown, like every other.',
    'The Last Page says what it will do. The description works it through, the badge shows how many Pages he is holding out of his limit, and the status text gives the exact damage it would deal right now. That text had also been left quoting 30% a Page after the rework dropped it to 15%.',
    'Elphi rises with less: 30% of his max HP and ATK +30%, instead of 45% and +40%. Sentinel brings him back at 40% and Dawnbreaker at 20%.'
  ] },
  { v: '0.4.6', d: '2026-10-07', items: [
    'Elphi reworked. He no longer stays down: the first time he falls he gets back up with 45% of his max HP and fights the rest of the battle with ATK +40% and +10% crit chance. Sentinel brings him back at 60%, Dawnbreaker at only 30%.',
    'His light sword does the work his shields used to. Lightblade hits for 120% instead of 100%, while the Shield from Sanctum Blade drops from 15% to 11% of his max HP and the one Last Light gives a falling ally drops from 15% to 10%.'
  ] },
  { v: '0.4.5', d: '2026-10-07', items: [
    'Aamay reworked. He now writes down only what the enemy does, so pairing him with a fast hero no longer fills the Chronicle twice as quickly. It holds 20 Pages instead of 12, and 2 more for every hero who falls on either side, but each Page is worth half what it was and his ultimate charges 40% slower.',
    'Aamay works in a basement nobody visits. While another hero still stands and the Chronicle is empty, an enemy aiming at him looks elsewhere 30% of the time. That protection fades as he writes and is gone once the Chronicle is full, so the moment he is most dangerous is the moment he is easiest to reach. He can always be reached, which is what keeps him different from Seraphine.',
    'Seal in Ink hits softer but holds harder: 55% ATK instead of 70%, and the target now loses 30% SPD and 20% ATK for 3 turns rather than 20% SPD for 2. Ink Flick drops to 85% ATK, and his max HP and ATK both come down.'
  ] },
  { v: '0.4.4', d: '2026-10-07', items: [
    'Last Stand is gone. It gave the last hero standing more damage and less damage taken, and the same paragraph was pasted into ten passives, which made every one of them harder to read for a rule that only really mattered in duels. It also quietly applied to a hero boss fighting alone, which nothing told you. Heroes who need help in duels will get it one at a time instead.',
    'David is paid for the work he does. Guarding now cuts half the damage instead of 40%, and every hit he takes for the ally he is guarding heals him 3% of his max HP. His guard started catching far more in the last update, so this grows with it.',
    'Seraphine is easier to reach. A summoned creature no longer counts as cover, so only a living hero keeps her out of sight, and bosses see her regardless.',
    'Harry Crush down from 150% to 135% ATK, and Lachlan loses some max HP. Harry was the only hero stronger than the target band; Lachlan sat on top of the duel table.'
  ] },
  { v: '0.4.3', d: '2026-10-07', items: [
    'Builds now show what they change as numbers, not only prose. The stat block in a hero sheet is drawn with the equipped build applied and marks what moved, and every build lists its stat changes as chips.',
    'The 1v1 grid can no longer be read the wrong way round. The corner names both axes, each cell says in words who beat whom and out of how many duels, and the text explains that anything near 50 is a close matchup rather than a precise number.',
    'Descriptions fixed where they left something out. Trigg now names the Pit Imp and gives its claw and its 40% Burn chance. Kingsley says a second Song refreshes the first rather than adding another. Danielle explains that evading an attack means there is nothing to riposte, so evasion and riposte never both happen. Seraphine says that Severance marks do nothing until Halo Storm detonates them, and that they stop at 5.'
  ] },
  { v: '0.4.2', d: '2026-10-07', items: [
    'Every past update and balance entry has been renamed onto the new numbering, in the same order, with its old number shown beside it. The old numbering had run out of room at 0.93, and it had already used 0.4, 0.41 and 0.42, which clashed with the new ones.',
    'The Guide now says exactly what moves each part of the version number, so it is clear why it moves as slowly as it does.'
  ] },
  { v: '0.4.1', d: '2026-10-07', items: [
    'Four fixes to things that were quietly not working. Hold the Line only redirected attacks that went through the ordinary attack path, so fourteen single-target skills, among them Crush, Phantom Switch, Finger Frame and Sanctum Blade, walked straight past the guard. They all respect it now.',
    'What a summoned creature does now counts for whoever summoned it. The imps Trigg calls up were removed from the field when they died and took their damage dealt and damage soaked with them, so none of it reached the end of battle summary.',
    'Mimicry copies the move that was actually used. It had been guessing a flat 100%, 140% or 180% from which slot the move came out of, and it dropped any Burn, Shock or Poison the original carried. It now copies the real strength and the real effect, still capped so a boss move comes back at a sane level.',
    'Afterimage now shows on the card as well as in the status list. A hero fading out with no explanation read as a glitch; it means the next attack against them misses completely.'
  ] },
  { v: '0.4.0', d: '2026-10-06', items: [
    'Version numbers restart at 0.4. The old 0.9x suggested the game was nearly finished, which it is not.',
    'The battle screen now fits a computer. Portraits were taking their height from the space the arena had left and their width from the card, so on a laptop they stretched out flat, as wide as 168 by 66. They are square again, the enemy row sizes itself so four or five foes are not tall and thin, and on a wide window the action panel moves beside the arena instead of under it.',
    'The title screen no longer cuts off its own bottom on a short window, which used to hide Save backup and the Effects setting.',
    'Dev mode: five taps on the version number under the logo, or add ?dev to the address, unlocks every hero and stage for testing. Stars and records are left alone.',
    'The 1v1 research was being sampled twice per matchup and the two answers disagreed by as much as 29 points. Every pair is now played once with 300 fights instead of 24, so the duel grid is both consistent and far steadier. The Stats screen also reports the real number of fights behind it, which it had been overstating.'
  ] },
  { v: '0.3.9', old: '0.93', d: '2026-10-06', items: ['Battle effects no longer vanish on devices that ask for reduced motion. Windows in particular reports this whenever animation effects are switched off, which left attacks, damage numbers and hits invisible.', 'New Effects setting on the title screen: Full, Reduced or Auto. Reduced now drops only screen shake, lunges and flashes, and keeps the damage numbers and hit effects you need to follow a fight.'] },
  { v: '0.3.8', old: '0.92', d: '2026-10-05', about: true, items: ['Balance pass: Alfred nerfed, 1v1 duels narrowed with Last Stand, healers heal themselves slightly less. Simulated stats refreshed.'] },
  { v: '0.3.7', old: '0.91', d: '2026-10-05', about: true, items: ['New portraits so every hero looks distinct: Ben (spectacles, chain of office, decree scroll), Aamay (hooded scribe with a candle and open book), Trigg (pale, gaunt, long wild hair) and Kingsley (feathered bard\'s cap).'] },
  { v: '0.3.6', old: '0.9', d: '2026-10-05', about: true, items: ['Seven new heroes: Trigg, Alfred, Ethan, Ben, Kingsley, Vasco and Aamay, each filling a role the roster lacked. 24 heroes in total.', 'Five new stages where you fight and unlock them: Trigg\'s Menagerie, The Blurred Duel, The King\'s Trial, The Palace Revels and The Basement Archive. 31 stages in total. Some stages now unlock two heroes.', 'Five new team bonuses: Peguicha\'s Court, The Crown\'s Counsel, Royal Hospitality, Borrowed Magic and The Hollow Vessel.', 'Soham\'s Hex Shields now show in gold, separately from blue Shields, on the HP bar and in the numbers.', 'Hex Breaker has a proper exploding-hexagon effect when a Hex Shield bursts.'] },
  { v: '0.3.5', old: '0.84', d: '2026-10-04', about: true, items: ['Offline version: a single file you can download and play with no internet. Fonts are built in and progress saves on the device.', 'Save backup on the title screen: copy your save as a code (or download it as a file offline) and load it into the other version. Merge keeps the best of both; Replace overwrites.'] },
  { v: '0.3.4', old: '0.83', d: '2026-10-04', about: true, items: ['Balance pass across 13 heroes and 3 builds, guided by campaign, 3v3 and 1v1 results. Composite spread narrowed from 44 to 68 down to 46 to 63.', 'Simulated stats refreshed.'] },
  { v: '0.3.3', old: '0.82', d: '2026-10-04', about: true, items: ['Angus, Flynn and Elphi have more distinct passives.', 'A developer handbook and source bundle now exist so development can continue from anywhere.', 'Simulated stats refreshed.'] },
  { v: '0.3.2', old: '0.81', d: '2026-10-04', about: true, items: ['Vehra lifts off her card while Aloft, and her Rend previews include Bloodlust against wounded enemies.', 'Simulated stats refreshed.'] },
  { v: '0.3.1', old: '0.8', d: '2026-10-04', about: true, items: ['Vehra reworked around Stone Form and self-healing. She now plays nothing like Yunze.', 'Soham reworked: brittle Hex Shields on one ally or the whole team, with gold shield stripes and a hits-left count on the card.', 'Seraphine hides Behind the Scenes (shown as Unseen on her card) and builds Severance for her ultimate.', 'Simulated stats now use three measures: campaign fights, 3v3 hero battles and 1v1 duels, with a 1v1 matchup grid.', 'Fixed a crash when Yousuf fell in the middle of his own attack.'] },
  { v: '0.3.0', old: '0.7', d: '2026-10-04', about: true, items: ['Four new heroes: Peguicha, Vehra and Soham from the First Era, and Seraphine from the Second Era. Each has two builds.', 'Four new boss stages, where you fight and unlock them: Vehra\'s Hunt, The Cinderbead, The Hexagon Wall and The Hidden Hand. Campaign now has 26 stages.', 'Bosses can now be heroes, controlled by the game with intents like any enemy.', 'Soham\'s Hex Wall is drawn across his team\'s row with its remaining strength.', 'Daniel is now Danielle, with a new portrait.', 'Versions renumbered: launch is v0.1, major updates step by 0.1, smaller ones by 0.01.'] },
  { v: '0.2.7', old: '0.63', d: '2026-10-03', about: true, items: ['Yousuf\'s heal previews show when a target is Mended and the heal will be weaker.', 'Simulated stats refreshed.'] },
  { v: '0.2.6', old: '0.62', d: '2026-10-03', about: true, items: ['David stores Vengeance from hits he takes and unleashes it with Spear Thrust.', 'Gemia enters Flow every time she uses Scarred Resolve.', 'The Chosen is now a solo Champion: sturdy, self-sufficient and hard-hitting.', 'Simulated stats refreshed.'] },
  { v: '0.2.5', old: '0.61', d: '2026-10-03', about: true, items: ['Leo\'s Fire Beam is now channelled. A glowing beam stays between Leo and his target while he holds it and thickens as it ramps. His skill button turns into Sustain Beam with the next stage shown.', 'Simulated stats refreshed.'] },
  { v: '0.2.4', old: '0.6', d: '2026-10-03', about: true, items: ['New Stats screen: your record per hero and per build, a history of your last 50 battles, and the simulated results for every hero and build.', 'Hero details show simulated and personal stats, and each build option shows its simulated win rate and your record with it.', 'Your records are saved with your progress, including to your Claude account.'] },
  { v: '0.2.3', old: '0.5', d: '2026-10-03', about: true, items: ['Custom battle: up to 3 of your heroes against up to 5 opponent heroes, with builds and a strength setting. Opponents show intents, use their own SP and get their own team bonuses.', 'The battle summary is now a full table: damage, healing, Shields, damage taken, kills, biggest hit, crits, hit rate, dodges, buffs, debuffs, actions and ultimates. Best is picked by an Impact score built from all of them.'] },
  { v: '0.2.0', old: '0.4', d: '2026-10-03', about: true, items: ['Every battle card has an i button. Tap it, or press and hold the card, to see details at any time, even while choosing a target.', 'Turn order icons and the active hero\'s portrait open details too.', 'Harry has a new ultimate, Unsealed, with its own banner and a lasting green glow.'] },
  { v: '0.1.3', old: '0.31', d: '2026-10-02', about: true, items: ['Balance changes now have their own list with buff, nerf and rework markers.', 'Hero details show the recent balance changes for that hero.', 'Every build now has a real trade-off.'] },
  { v: '0.1.2', old: '0.3', d: '2026-10-02', about: true, items: ['Fights can have 1 to 5 enemies, with a compact card layout for 4 or 5.', 'Progress saves to your Claude account as well as the device.'] },
  { v: '0.1.1', old: '0.2', d: '2026-10-02', about: true, items: ['Campaign grows from 10 to 22 stages: 6 new bosses and 4 post-game Echoes.', 'New enemies: Varro the Bandit King, Bog Witch, Mire Lurker, Stormlings, the Tempest Idol, the Hollow Prophet, Mirror Shards, the Mirror Knight, Sellswords, Crossbowmen, Shieldbearers, the Iron Warden and Yunze\'s afterimages.', 'Heroes unlock through the campaign. Angus, Flynn and Leo are the starters.', 'Two builds for every hero.', 'The Guide: rules, stats and formulas, statuses, team bonuses, builds and every enemy.', 'Battle screen sizes itself to the phone so cards and text no longer overlap.'] },
  { v: '0.1.0', old: '0.1', d: '2026-10-02', about: true, items: ['First release: 13 heroes, 10 campaign stages and the Gauntlet.'] }
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
    passive: { name: 'Behind the Scenes', desc: 'She works from the wings, slipping out of view on every third turn of hers: enemies cannot aim single-target attacks at her until her next turn, though attacks on the whole team still land. After each of her actions both halos keep cutting on their own: 2 strikes of 28% ATK on random enemies. Every cut leaves a Severance mark, which does nothing on its own and only pays off when Halo Storm detonates it. The Chosen secretly obeys her.' },
    basic: { name: 'Halo Cut', icon: '⭕', target: 'enemy', desc: 'Send a halo through one enemy for 100% ATK, leaving a Severance mark. Marks stack up to 5 on the same enemy.' },
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
  { id: 'puppeteer', name: 'Puppeteer', icon: '🎭', desc: 'Halo Storm hands a turn to The Chosen, or to the ally with the highest ATK if she is absent. Halo cuts deal 22% instead of 28%.', tags: { anyPuppet: 1, haloMult: 0.22 } },
  { id: 'twinedge', name: 'Twin Edge', icon: '⭕', desc: 'Halo cuts deal 38% ATK instead of 28%. Max HP -10%.', mods: { hp: -0.1 }, tags: { haloMult: 0.38 } }];

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
/* A hero can carry a second kit that replaces the first while a status is on them. Vasco is the
   one who does: the jester and the thing wearing him have separate moves, not the same three
   buttons behaving differently. Everything that reads an ability off a unit goes through here. */
function abil(u, kind) {
  const h = HEROES[u.heroId || u.id];
  if (!h) return null;
  if (h.alt && h.altWhen && u.statuses && u.statuses.some(s => s.key === h.altWhen)) return h.alt[kind];
  return h[kind];
}
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
  song:      { name: 'Song', icon: '🎵', type: 'buff', color: '#7ad06a', desc: 'Kingsley\'s music: heals 7% max HP and removes a debuff at the start of each of its turns.' },
  withered:  { name: 'Withered', icon: '🥀', type: 'debuff', fixed: true, color: '#8fd6b4', desc: 'Marked by H. Benjamin. It cannot be healed at all while this lasts, no cleanse will take the mark off, and it takes 20% more damage from him and 12% more from the rest of his side. It only runs out.' },
  skulls:    { name: 'Skulls', icon: '💀', type: 'buff', fixed: true, max: 4, color: '#b8e0c8', desc: 'The dead he is carrying, up to 4. One is spent at the start of each of his turns and mends him 14% of his max HP, so the pile runs down on its own. He takes one the first time he Withers each enemy, and one for every unit that falls anywhere, either side. Coming apart costs him all of them.' },
  corpse:    { name: 'Corpse', icon: '🪦', type: 'buff', fixed: true, color: '#8fd6b4', desc: 'He has come apart. He takes 65% less damage but barely hurts anything, and his three moves are about putting himself back together. Mend him to 45% of his max HP, or spend the Skulls, and he gets back up.' },
  riled:     { name: 'Riled', icon: '😤', type: 'buff', fixed: true, mods: { atk: 0.22 }, color: '#e0603a', desc: 'Hurt and getting worse for it: ATK +22%, nothing can Stun him, and he mends 5% of his max HP at the start of each of his turns. It lasts while he is under 65% health.' },
  rabid:     { name: 'Rabid', icon: '🩸', type: 'buff', fixed: true, mods: { atk: 0.42 }, color: '#ff3b3b', desc: 'Past caring: ATK +42%, nothing can Stun him, and he mends 7% of his max HP at the start of each of his turns. It lasts while he is under 30% health.' },
  invisible: { name: 'Invisible', icon: '🫥', type: 'buff', mods: { eva: 0.28 }, color: '#4fd1c5', desc: 'Nobody can see where he is, so attacks aimed at him mostly miss: +28% evasion. His next blow lands unseen, and striking gives him away.' },
  mixture:   { name: 'Mixture', icon: '🧪', type: 'buff', fixed: true, color: '#ffb23d', desc: 'The phial Malakai has mixed next. Venom Poisons, Sedative lowers ATK, Solvent lowers DEF and comes on the house.' },
  vessel:    { name: 'The Vessel', icon: '😈', type: 'buff', fixed: true, mods: { atk: 0.15 }, color: '#d1203a', desc: 'The power of Peguicha wearing the face of Vasco: ATK +15%, its hits heal him for 35% of the damage and deal double damage to Shields, and his basics earn the team no Skill Points while it is out.' },
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
    passive: { name: 'Blurred Sight', desc: 'He sees through blur: 16% evasion, he cannot be Blinded, and he ignores half of every target\'s evasion. His tempo changes every turn, and each one is good for something different: Allegro hits for 80% and brings his next turn 50% sooner, Andante hits for 100% and cannot miss, and Grave hits for 130% and ignores 30% of the target\'s DEF.' },
    basic: { name: 'Odd Cut', icon: '🗡️', target: 'enemy', desc: 'Cut one enemy for 112% ATK, shaped by his current tempo.' },
    skill: { name: 'Finger Frame', icon: '👌', cost: 1, target: 'enemy', desc: 'He frames an enemy through his fingers: 95% ATK, then it is Framed for 2 turns. Every ally\'s hits on it cannot miss and gain +15% crit chance, and his next hit on it is a certain crit.' },
    ult: { name: 'Broken Rhythm', icon: '🎼', target: 'allEnemies', desc: '6 cuts of 75% ATK, cycling his three tempos at their real strengths of 80%, 100% and 130%, favouring Framed enemies. Cuts on Framed enemies always crit.' } },
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
    passive: { name: 'Cold Counsel', desc: 'Deals 55% more damage to enemies whose turn has been delayed, or who are Stunned. He gives the orders a merciful king will not.' },
    basic: { name: 'Sharp Word', icon: '🗯️', target: 'enemy', desc: '135% ATK to one enemy and its next turn comes 20% later.' },
    skill: { name: 'Give the Order', icon: '☝️', cost: 0, target: 'ally', desc: 'Costs no SP, usable once every three turns. Another ally acts immediately with ATK +20% for that turn and gains 20% ultimate charge.' },
    ult: { name: 'The Hard Decision', icon: '⚖️', target: 'allEnemies', desc: 'Every enemy\'s next turn comes 40% later (20% for bosses), and they all lose 20% ATK for 2 turns. The enemy with the highest ATK is also Exposed, taking 50% more damage, for 2 turns.' } },
  kingsley: { id: 'kingsley', name: 'Kingsley', title: 'The Palace Bard', eras: ['current'], role: 'Bard', color: '#7ad06a',
    stats: { hp: 1200, atk: 110, def: 74, spd: 112, crit: 0.1, cdmg: 0.5, eva: 0.08 },
    look: { skin: '#f0d0b4', hair: '#d8642a', hairStyle: 'messy', eye: '#3aa060', body: 'coat', bodyColor: '#2a4a2a', trim: '#f0c040', bg: '#183018', weapon: 'lute', hat: 'bard', smile: true },
    passive: { name: 'Encore', desc: 'Allies with a Song heal 7% of their max HP and lose one debuff at the start of each of their turns. His heals on himself are 10% weaker.' },
    basic: { name: 'Jaunty Tune', icon: '🎵', target: 'enemy', desc: 'Play at one enemy for 95% ATK. The ally with the lowest HP gains a Song for 2 turns. Playing again on an ally who already has one refreshes it back to 2 turns rather than adding a second.' },
    skill: { name: 'Borrowed Trinket', icon: '🎁', cost: 1, target: 'self', desc: 'Pull one of Vasco\'s five magic items at random, and the one he pulls out shows above him: Lantern (heal all allies 14%), Mirror Charm (Shield the lowest ally for 22% of his max HP), Jester\'s Bell (Blind every enemy and a 50% chance to Stun one), Spark Box (75% ATK to every enemy) or Loaded Dice (the team gains 2 Skill Points and every ally gains Crit Up, +12% crit chance, for 2 turns).' },
    ult: { name: 'Grand Finale', icon: '🎶', target: 'allAllies', desc: 'Every ally gains a Song for 3 turns and SPD +15% for 2 turns, and is cleansed.' } },
  vasco: { id: 'vasco', name: 'Vasco', title: 'The Jester', eras: ['current'], role: 'Trickster', color: '#a050d0',
    stats: { hp: 1360, atk: 124, def: 82, spd: 116, crit: 0.12, cdmg: 0.55, eva: 0.1 },
    look: { skin: '#e6c2a2', hair: '#6b4426', hairStyle: 'short', eye: '#141016', glowEye: '#ff2a3a', body: 'coat', bodyColor: '#5a1a6a', trim: '#f0c040', bg: '#24102e', weapon: 'cards', helm: 'jester' },
    passive: { name: 'Two Faces', desc: 'Two kits, and he chooses which one he is holding. The jester works the room: tricks, a card dealt for the whole team, and a Skill Point for the team on every basic. The thing behind him only feeds: ATK +15%, its hits heal him for 35% of the damage and tear through Shields at double rate, and it earns the team no Skill Points at all. Curtain Call is how he changes hands, and it charges quickly, so he is meant to keep moving between the two.' },
    basic: { name: 'Prank', icon: '🃏', target: 'enemy', desc: 'Deal 130% ATK to one enemy and pull two tricks at random from Blind, ATK -25% and SPD -25%, each for 3 turns.' },
    skill: { name: 'Wild Card', icon: '🃏', cost: 2, target: 'allAllies', desc: 'He deals one card for the whole team and nobody knows which until it turns over. It costs two Skill Points, and the jester is the one who earns them, a point at a time on every basic. Hearts heals every ally 13% of their max HP. Spades gives every ally ATK +22% for 2 turns. Clubs gives every ally a Shield worth 14% of his max HP. Diamonds hands both points straight back and charges his own switch by 35%. Roughly one draw in ten is the Joker, which does all four at 45% strength.' },
    ult:   { name: 'Curtain Call', icon: '🎪', target: 'self', desc: 'He takes the mask off. The thing behind him comes out and brings its own three moves, and he acts again at once with the new kit in hand, so changing face costs him nothing but the charge. It charges 80% faster than other ultimates, so he is meant to keep swapping.' },
    /* The second kit. Everything that reads an ability off a unit goes through abil(), which
       swaps to this while the Vessel status is on him. */
    altWhen: 'vessel',
    alt: {
      basic: { name: 'Hellmark', icon: '🔥', target: 'enemy', desc: 'Brand one enemy for 115% ATK and Burn it for 2 turns.' },
      skill: { name: 'Gift of the Pit', icon: '😈', cost: 1, target: 'allEnemies', desc: '82% ATK to every enemy, and every buff any of them holds is torn off. The Vessel tears through Shields at double rate.' },
      ult:   { name: 'Nothing Left to Laugh At', icon: '🩸', target: 'self', desc: 'It has had enough and hands him back the room. The jester returns with his own three moves, and he acts again at once.' }
    } },
  aamay: { id: 'aamay', name: 'Aamay', title: 'The Basement Scribe', eras: ['current'], role: 'Chronicler', color: '#7a8ab0',
    stats: { hp: 1180, atk: 110, def: 80, spd: 110, crit: 0.1, cdmg: 0.5, eva: 0.08 },
    look: { skin: '#d8a882', hair: '#141016', hairStyle: 'short', eye: '#5a3a20', body: 'robe', bodyColor: '#16161c', trim: '#3a3c4a', bg: '#08080c', weapon: 'book', helm: 'cowl', ink: true },
    passive: { name: 'The Chronicle', desc: 'Nobody knows he is down there. While another hero of his still stands, enemies cannot aim single-target attacks at him at all; only attacks on the whole team reach him, and a boss can find him anyway. He writes down what the enemy does: every enemy action adds a Page, up to 20. Nothing his own side does is worth recording, and every hero who falls on either side raises the limit by 2.' },
    basic: { name: 'Ink Flick', icon: '🖋️', target: 'enemy', desc: '85% ATK with a 30% chance to Silence for 1 turn.' },
    skill: { name: 'Seal in Ink', icon: '📕', cost: 1, target: 'enemy', desc: '55% ATK, then the target is Silenced for 2 turns (bosses 1) and loses 30% SPD and 20% ATK for 3 turns. Silenced heroes cannot use skills or ultimates; monsters only use their basic attack.' },
    ult: { name: 'The Last Page', icon: '📖', target: 'allEnemies', desc: 'He reads the Chronicle aloud and spends every Page at once. Each Page is 15% ATK to every enemy, so 10 Pages is 150% ATK and a full Chronicle of 20 is 300%. The badge on his card shows how many he is holding, and the number shown when you aim is what it will deal right now. Then every enemy is Silenced for 1 turn and the Chronicle is empty again. It charges 40% slower than other ultimates, so there is time to fill it.' } }
});
/* ================= v0.5.0: the oldest name, the brawler and the watcher ================= */
Object.assign(HEROES, {
  hbenjamin: { id: 'hbenjamin', name: 'H. Benjamin', title: 'The Oldest Name', eras: ['first'], role: 'Necromancer', color: '#8fd6b4',
    stats: { hp: 1080, atk: 128, def: 64, spd: 94, crit: 0.08, cdmg: 0.5 },
    look: { skin: '#e4decb', hair: '#101410', hairStyle: 'bald', eye: '#6fe0b0', glowEye: '#6fe0b0', body: 'robe', bodyColor: '#101610', trim: '#8fd6b4', bg: '#060e0b', weapon: 'skulls', skull: true, helm: 'cowl' },
    /* What is left once the first death has happened: the same skull, tipped over, in a heap of
       the same robe. Keyed to the status so the card repaints the moment he goes down. */
    altLookWhen: 'corpse',
    altLook: { skin: '#cfc8b2', hair: '#101410', hairStyle: 'bald', eye: '#3f8f72', glowEye: '#3f8f72', body: 'robe', bodyColor: '#0b100c', trim: '#4a7a62', bg: '#050a08', skull: true, collapsed: true },
    passive: { name: 'The Oldest Bargain', desc: 'He carries the dead at his hands, up to 4 Skulls, and the badge says how many. A Skull is spent at the start of each of his turns to mend him 14% of his max HP, so the pile runs down whether he wants it to or not. He takes one the first time he Withers each enemy and never again from that one, and one for every unit that falls anywhere on the field, his own side included, which is what keeps him going in a long fight. He is very frail and dies easily, except once: the first blow that would finish him spends every Skull he is carrying and leaves him at 18% of his max HP as a Corpse, which barely hurts anything, takes 65% less damage, and has its own three moves for putting him back together. Mend him to 45% and he stands up. One bargain a battle.' },
    basic: { name: 'Grave Whisper', icon: '🦴', target: 'enemy', desc: 'Deal 115% ATK to one enemy and Wither it for 2 turns, which hands him a Skull. Nothing can mend a Withered enemy and no cleanse will lift it, it takes 20% more damage from him, and 12% more from everyone else on his side.' },
    skill: { name: 'Marrow Draw', icon: '💀', cost: 1, target: 'enemy', desc: 'Deal 140% ATK and take half the damage back as his own health. Against an enemy that is already Withered he takes all of it. The target is Withered for 2 turns either way.' },
    ult: { name: 'The Long Rot', icon: '🥀', target: 'allEnemies', desc: 'Every enemy is Withered for 3 turns, so nothing on their side can be mended at all, and they each lose 25% ATK and 25% DEF for 3 turns.' },
    /* What is left of him after the bargain. Everything that reads an ability off a unit goes
       through abil(), which swaps to this while the Corpse status is on him. */
    altWhen: 'corpse',
    alt: {
      basic: { name: 'Gnaw', icon: '🦴', target: 'enemy', desc: 'What is left of him bites at one enemy for 25% ATK. It barely hurts, but it still Withers for 2 turns and the Skull still comes to him.' },
      skill: { name: 'Gather the Dead', icon: '💀', cost: 1, target: 'self', desc: 'No attack. He spends every Skull he is carrying and each one pulls 9% of his max HP back into him, so four of them is 36%. This is the route up that does not need a healer: reach 45% and he stands.' },
      ult: { name: 'The Second Breath', icon: '🕯', target: 'self', desc: 'He hauls himself upright without waiting for any of it, and stands at 45% of his max HP.' }
    } },
  ephraim: { id: 'ephraim', name: 'Ephraim', title: 'The Pitbull', eras: ['first'], role: 'Brawler', color: '#e0603a',
    stats: { hp: 1280, atk: 120, def: 94, spd: 104, crit: 0.1, cdmg: 0.55, eva: 0.04 },
    look: { skin: '#c98a52', hair: '#111116', hairStyle: 'short', eye: '#111116', body: 'bare', bodyColor: '#c98a52', trim: '#e8dcc8', bg: '#3a1409', weapon: 'knuckles', scars: true, brow: 'firm', bandana: '#b8322a', big: true },
    passive: { name: 'Pitbull', desc: 'Hurting him makes him worse, and you can see exactly when. Under 65% health he is Riled: ATK +22%, nothing can Stun him, and he mends 5% of his max HP at the start of each of his turns. Under 30% he is Rabid instead: ATK +42% and he mends 7%. Both show as a badge on his card and both come and go with the health bar, so there is nothing else to keep track of.' },
    basic: { name: 'Knuckle Down', icon: '🥊', target: 'enemy', desc: 'He wades in and throws three: 3 hits of 44% ATK on one enemy. He fights too close to miss, so they always land.' },
    skill: { name: 'Seize', icon: '🦷', cost: 1, target: 'enemy', desc: 'He bites down: 100% ATK, the target Bleeds for 3 turns, and he hauls it back so its next turn comes 35% later (18% for bosses).' },
    ult: { name: 'Won\u2019t Let Go', icon: '🩸', target: 'enemy', desc: 'He takes one enemy in his teeth and does not stop: 5 hits of 56% ATK that always land and ignore 40% of its DEF, each mending him 3% of his max HP. If it goes down early the rest land on whoever is next.' } },
  isaac: { id: 'isaac', name: 'Isaac', title: 'The Watcher', eras: ['current'], role: 'Scout', color: '#4fd1c5',
    stats: { hp: 1180, atk: 124, def: 76, spd: 132, crit: 0.16, cdmg: 0.55, eva: 0.14, acc: 0.06 },
    look: { skin: '#dfb189', hair: '#0c0c10', hairStyle: 'wild', eye: '#4fd1c5', body: 'coat', bodyColor: '#122020', trim: '#4fd1c5', bg: '#061212', weapon: 'glass', scarf: '#1d3a38', cloak: '#0e1c1b', young: true },
    passive: { name: 'Never Seen Coming', desc: 'He starts the battle Invisible: his card fades out and attacks aimed at him mostly miss, +28% evasion, whether there are three of them left or only him. Striking gives him away and the card comes back. Every blow he lands while Invisible deals 18% more damage and is always a critical.' },
    basic: { name: 'Quick Word', icon: '🗡', target: 'enemy', desc: '100% ATK to one enemy. While he is Invisible it cannot fail to crit, and landing it gives him away.' },
    skill: { name: 'Slipping Away', icon: '🫥', cost: 1, target: 'self', desc: 'No attack. He goes Invisible again and gains SPD +30% for 2 turns, and he passes on what he has seen: the enemy with the highest ATK is Exposed, taking 50% more damage, for 2 turns. He can only do this every other turn.' },
    ult: { name: 'Everything He Saw', icon: '📜', target: 'allEnemies', desc: 'He delivers the lot. Every enemy is Exposed for 2 turns, every ally gains Crit Up +20% for 2 turns, and he puts 200% ATK into the enemy with the highest ATK without being seen to do it. Then he is Invisible again.' } }
});
BUILDS.hbenjamin = [BALANCED,
  { id: 'gravekeeper', name: 'Gravekeeper', icon: '🪦', desc: 'He carries 6 Skulls instead of 4 and the Corpse stands up at 36% of his max HP instead of 45%, but a spent Skull only mends him 10% instead of 14%.', tags: { skullCap: 6, riseAt: 0.36, skullMend: 0.1 } },
  { id: 'plaguebearer', name: 'Plaguebearer', icon: '🧫', desc: 'Grave Whisper Withers every enemy instead of one, but it deals 86% ATK.', tags: { witherAll: 1, whisperMult: 0.86 } }];
BUILDS.ephraim = [BALANCED,
  { id: 'mongrel', name: 'Mongrel', icon: '🐕', desc: 'Riled starts at 80% health and Rabid at 45%, so he is worked up almost from the first hit. DEF -18%.', mods: { def: -0.18 }, tags: { riledAt: 0.8, rabidAt: 0.45 } },
  { id: 'ironjaw', name: 'Iron Jaw', icon: '🦴', desc: 'Riled and Rabid mend him half again as much, but Knuckle Down drops to 3 hits of 40%.', tags: { rageMend: 1.5, knuckle: 0.4 } }];
BUILDS.isaac = [BALANCED,
  { id: 'courier', name: 'Courier', icon: '✉️', desc: 'Slipping Away also gives every other ally SPD +10%, but Invisible he only hits 9% harder instead of 18%.', tags: { courier: 1, ambush: 0.09 } },
  { id: 'ghostwalk', name: 'Ghostwalk', icon: '🫥', desc: 'Invisible he hits 32% harder instead of 18%, but Slipping Away no longer Exposes anyone: he keeps what he sees to himself.', tags: { ambush: 0.32, noMark: 1 } }];
SYNERGIES.push(
  { id: 'oldestdebt', name: 'The Oldest Debt', icon: '💀', color: '#8fd6b4', desc: 'H. Benjamin with Harry or Yunze. His Corpse stands up at 27% of his max HP instead of 35%, and Yunze is lent the same one-time refusal to die that Harry already has.',
    test: t => t.includes('hbenjamin') && (t.includes('harry') || t.includes('yunze')),
    apply: P => P.forEach(p => { if (p.id === 'hbenjamin') p.flags.riseAt = 0.27; if (p.id === 'yunze') p.flags.oldestDebt = true; }) },
  { id: 'report', name: 'The Basement Report', icon: '📖', color: '#4fd1c5', desc: 'Isaac and Aamay. Isaac watches and Aamay writes it down, so every enemy action adds 2 Pages to the Chronicle instead of 1.',
    test: t => t.includes('isaac') && t.includes('aamay'),
    apply: P => P.forEach(p => { if (p.id === 'aamay') p.flags.report = true; }) },
  { id: 'kennel', name: 'Off the Chain', icon: '🥊', color: '#e0603a', desc: 'Ephraim with Peguicha or Trigg. Ephraim gains DEF +20%, and Riled and Rabid mend him a third again as much.',
    test: t => t.includes('ephraim') && (t.includes('peguicha') || t.includes('trigg')),
    apply: P => P.forEach(p => { if (p.id === 'ephraim') { p.mods.def += 0.2; p.flags.kennel = true; } }) }
);
(() => {
  const at = id => STAGES.findIndex(s => s.id === id);
  STAGES.splice(at('hexwall') + 1, 0,
    { id: 'kennels', era: 'first', name: 'The Kennels', atk: 1.8, hp: 1.1, heroAtk: 1.3, heroHp: 2.5, enemies: ['wolf', 'h:ephraim', 'wolf'], boss: true, reward: 'ephraim',
      desc: 'A short man in a bandana who fights with his hands between two of Peguicha\u2019s wolves. The more you hurt him the harder he hits, so finish him or do not start.' });
  STAGES.splice(at('kennels') + 1, 0,
    { id: 'oldestgrave', era: 'first', name: 'The Oldest Grave', atk: 2.1, hp: 0.9, heroAtk: 1.3, heroHp: 3.0, enemies: ['wisp', 'h:hbenjamin', 'golem'], boss: true, reward: 'hbenjamin',
      desc: 'Older than anything else in the record. He cannot be mended once he has marked you, and he will not go down while a skull is still at his hand.' });
  STAGES.splice(at('archive') + 1, 0,
    { id: 'rooftops', era: 'current', name: 'The Rooftops', atk: 2.4, hp: 1.05, heroAtk: 1.5, heroHp: 3.4, enemies: ['h:isaac', 'crossbow'], boss: true, reward: 'isaac',
      desc: 'Someone has been watching the palace and reporting it to the basement. You cannot aim at him until he moves first.' });
  STAGES.forEach(s => { if (s.reward) [].concat(s.reward).forEach(r => { UNLOCK_FROM[r] = s.id; }); });
})();
HERO_ORDER.splice(0, HERO_ORDER.length, 'hbenjamin', 'angus', 'ephraim', 'flynn', 'leo', 'harry', 'peguicha', 'vehra', 'soham', 'trigg', 'chosen', 'elphi', 'daniel', 'yunze', 'malakai', 'seraphine', 'alfred', 'lachlan', 'yousuf', 'gemia', 'david', 'ethan', 'ben', 'kingsley', 'vasco', 'aamay', 'isaac');
Object.assign(BUILDS, {
  trigg: [BALANCED,
    { id: 'packmaster', name: 'Packmaster', icon: '👹', desc: 'Commands up to 3 creatures, but they have 20% less HP.', tags: { creatureCap: 3, creatureHp: 0.8 } },
    { id: 'pyrebinder', name: 'Pyrebinder', icon: '🔥', desc: 'Whenever one of his creatures falls it bursts for 50% of his ATK to all enemies. Imps have 15% less ATK.', tags: { deathBurst: 0.5, impAtk: 0.85 } }],
  alfred: [BALANCED,
    { id: 'steady', name: 'Steady Eye', icon: '👁️', desc: 'His tempo no longer swings to Grave, only Allegro or Andante, so he never pierces armour but never misses every other turn. Finger Frame lasts 3 turns. ATK -8%.', mods: { atk: -0.08 }, tags: { noGrave: 1, frameTurns: 3 } },
    { id: 'chaos', name: 'Wild Rhythm', icon: '🌀', desc: 'Allegro hits for 90% and Grave for 155%, but he never rests in Andante, so he gives up the tempo that cannot miss. Evasion -5%.', mods: { eva: -0.05 }, tags: { wild: 1 } }],
  ethan: [BALANCED,
    { id: 'warking', name: 'War King', icon: '⚔️', desc: 'Royal Decree grants ATK +30% but no SPD. Treasury only fires below 2 SP.', tags: { decreeAtk: 0.3, decreeSpd: 0.001, treasuryBelow: 2 } },
    { id: 'patron', name: 'Patron', icon: '💰', desc: 'Treasury fires below 4 SP. Shelter Shields drop to 10%. ATK -10%.', mods: { atk: -0.1 }, tags: { treasuryBelow: 4, shelter: 0.1 } }],
  ben: [BALANCED,
    { id: 'schemer', name: 'Schemer', icon: '🕸️', desc: 'Sharp Word delays by 30% instead of 20%, but deals 80% ATK.', tags: { wordDelay: 0.3, wordMult: 0.8 } },
    { id: 'zealot', name: 'Zealous Aide', icon: '☝️', desc: 'Give the Order grants ATK +32% instead of 20%. Max HP -10%.', mods: { hp: -0.1 }, tags: { orderAtk: 0.32 } }],
  kingsley: [BALANCED,
    { id: 'virtuoso', name: 'Virtuoso', icon: '🎶', desc: 'Songs heal 9% instead of 7%, but trinkets are 30% weaker.', tags: { songHeal: 0.09, trinket: 0.7 } },
    { id: 'collector', name: 'Collector', icon: '🎁', desc: 'Trinkets are 35% stronger, but Songs heal only 5%.', tags: { songHeal: 0.05, trinket: 1.35 } }],
  vasco: [BALANCED,
    { id: 'harlequin', name: 'Harlequin', icon: '🃏', desc: 'The jester half: Prank pulls all three tricks instead of two, but the Vessel only heals for 22% of its damage.', tags: { doubleTrick: 1, vesselSteal: 0.22 } },
    { id: 'hollow', name: 'Hollow', icon: '😈', desc: 'The other half: the Vessel heals for 48% of its damage, but Prank pulls no trick at all.', tags: { vesselSteal: 0.48, noTrick: 1 } }],
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
  { id: 'hollowvessel', name: 'The Hollow Vessel', icon: '😈', color: '#d1203a', desc: 'Vasco and Peguicha. Vasco starts the battle with the mask already off, holding the Vessel kit.',
    test: t => t.includes('vasco') && t.includes('peguicha'), apply: P => P.forEach(p => { if (p.id === 'vasco') p.flags.startVessel = true; }) }
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
    { id: 'kingtrial', era: 'current', name: 'The King\'s Trial', atk: 1.75, hp: 1.15, heroAtk: 1.15, heroHp: 1.55, enemies: ['sellsword', 'h:ethan', 'h:ben'], boss: true, reward: ['ethan', 'ben'],
      desc: 'Before he grants shelter, King Ethan tests the strength of Yousuf\'s guard. His advisor gives the orders the king will not.' },
    { id: 'revels', era: 'current', name: 'The Palace Revels', atk: 2.0, hp: 1.1, heroAtk: 0.95, heroHp: 2.1, enemies: ['h:kingsley', 'h:vasco'], boss: true, reward: ['kingsley', 'vasco'],
      desc: 'A performance for the guests goes wrong. Push the jester too far and something darker looks out from behind his face.' },
    { id: 'archive', era: 'current', name: 'The Basement Archive', atk: 2.3, hp: 1.1, heroAtk: 0.95, heroHp: 2.7, enemies: ['inkwraith', 'h:aamay', 'inkwraith'], boss: true, reward: 'aamay',
      desc: 'Below the palace a scribe writes down everything that happens. The longer the fight, the longer his Chronicle.' });
  STAGES.forEach(s => { if (s.reward) [].concat(s.reward).forEach(r => { UNLOCK_FROM[r] = s.id; }); });
})();
