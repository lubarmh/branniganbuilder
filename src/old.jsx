import React, { useState } from "react";

// ===================== DATA =====================

const STARTING_GOLD = 100;
const DEFAULT_MAX = 6;
const HOUSING_MAX = 8;

const RACES = [
  { id:"human",    name:"Human",    cost:10, speed:4, hp:10, special:'Parry grants an extra +1 to armor.' },
  { id:"dwarf",    name:"Dwarf",    cost:10, speed:3, hp:12, special:'Ignores the Heavy keyword.' },
  { id:"elf",      name:"Elf",      cost:10, speed:4, hp:10, special:'+2" range and ignores cover when shooting a bow.' },
  { id:"goblin",   name:"Goblin",   cost:5,  speed:4, hp:6,  special:"Can't use heavy armor. Can't use black powder weapons.", noHeavyArmor:true, noBlackPowder:true },
  { id:"ork",      name:"Ork",      cost:10, speed:4, hp:10, special:'+1 on hit rolls in melee when below starting health.' },
  { id:"undead",   name:"Undead",   cost:5,  speed:3, hp:5,  special:'Rise Again. Can only level up in the Undead tree (except the leader).' },
  { id:"halfling", name:"Halfling", cost:10, speed:4, hp:7,  special:'May perform 1 free movement action before the game starts.' },
  { id:"vampire",  name:"Vampire",  cost:30, speed:5, hp:15, special:"Movement not affected vertically. Regains half of slain target's max HP on knockout. Can't be Nimble or Bulky. Max 2 per company.", noBulky:true, noNimble:true, maxPercompany:2 },
];

const WEAPONS = [
  { id:"bow",             name:"Bow",                  range:'10"',      dmg:"3",   cost:3,  hands:2, wtype:"ranged",  keywords:[], note:"" },
  { id:"crossbow",        name:"Crossbow",             range:'2–16"',    dmg:"5",   cost:6,  hands:2, wtype:"ranged",  keywords:["Reload"], note:"+1 to hit rolls" },
  { id:"hand_crossbow",   name:"Hand-Crossbow",        range:'6"',       dmg:"3",   cost:5,  hands:1, wtype:"ranged",  keywords:["Reload"], note:"1h" },
  { id:"falcon",          name:"Falcon",               range:'8"',       dmg:"2",   cost:10, hands:1, wtype:"ranged",  keywords:["Reload"], note:"Always hits" },
  { id:"sword",           name:"Sword",                range:"Melee",    dmg:"3",   cost:5,  hands:1, wtype:"melee",   keywords:["Parry"], note:"1h · Parry: activation, +1 armor until end of round" },
  { id:"mace",            name:"Mace",                 range:"Melee",    dmg:"3",   cost:5,  hands:1, wtype:"melee",   keywords:[], note:"1h · Treat heavy armor as medium" },
  { id:"axe",             name:"Axe",                  range:"Melee",    dmg:"3",   cost:5,  hands:1, wtype:"melee",   keywords:[], note:"1h · Ignore medium armor" },
  { id:"dagger",          name:"Dagger",               range:"Melee",    dmg:"2",   cost:2,  hands:1, wtype:"melee",   keywords:["Ambush"], note:"1h · -1 to hit · Dual wield: attack twice, both at -1" },
  { id:"staff",           name:"Staff",                range:'Melee 2"', dmg:"1",   cost:3,  hands:2, wtype:"melee",   keywords:["Poke","Casting"], note:"-1 to hit · On 6: target knocked prone" },
  { id:"spear",           name:"Spear",                range:'Melee 2"', dmg:"3/4", cost:5,  hands:1, wtype:"melee",   keywords:["Poke"], note:"1h/2h" },
  { id:"flail",           name:"Flail",                range:"Melee",    dmg:"3",   cost:5,  hands:1, wtype:"melee",   keywords:[], note:"1h · On miss: roll to hit another melee target" },
  { id:"lance",           name:"Lance",                range:'Melee 1–2"',dmg:"6",  cost:10, hands:1, wtype:"melee",   keywords:[], note:"+1 to hit · Attack as you move past target" },
  { id:"two_handed",      name:"Two-Handed Weapon",    range:"Melee",    dmg:"5",   cost:10, hands:2, wtype:"melee",   keywords:[], note:"Mace/Axe/Sword — same bonuses as 1h variants" },
  { id:"pistol",          name:"Pistol",               range:'6"',       dmg:"4",   cost:6,  hands:1, wtype:"ranged",  keywords:["Fire Once"], note:"1h · +2 to hit", blackPowder:true },
  { id:"blunderbuss",     name:"Blunderbuss",          range:'8"',       dmg:"8",   cost:12, hands:2, wtype:"ranged",  keywords:["Slow Reload"], note:"+2 to hit", blackPowder:true },
  { id:"blowpipe",        name:"Blowpipe",             range:'4"',       dmg:"2",   cost:2,  hands:2, wtype:"ranged",  keywords:["Poison"], note:"" },
  { id:"throwing_daggers",name:"Throwing Daggers",     range:'5"',       dmg:"2",   cost:3,  hands:1, wtype:"ranged",  keywords:["Ambush"], note:"-1 to hit" },
  { id:"sling",           name:"Sling",                range:'4"',       dmg:"2",   cost:1,  hands:1, wtype:"ranged",  keywords:[], note:"+1 to hit" },
];

const ARMOR_LIST = [
  { id:"light_armor",  name:"Light Armor",  cost:8,  armor:1, armorType:"light",  heavy:false, movePenalty:0,  slot:"armor", note:"Light — no movement penalty" },
  { id:"medium_armor", name:"Medium Armor", cost:10, armor:2, armorType:"medium", heavy:false, movePenalty:-1, slot:"armor", note:"Medium — −1\" movement", keywords:["Medium"] },
  { id:"heavy_armor",  name:"Heavy Armor",  cost:15, armor:3, armorType:"heavy",  heavy:true,  movePenalty:-2, slot:"armor", note:"Heavy — −2\" movement", keywords:["Heavy"] },
  { id:"shield",       name:"Shield",       cost:5,  armor:1, armorType:null,     heavy:false, movePenalty:0,  slot:"melee", hands:1, wtype:"melee", note:"1h · Equips as melee weapon, grants +1 armor" },
  { id:"barding",      name:"Barding",      cost:15, armor:1, armorType:null,     heavy:false, movePenalty:0,  slot:"item",  note:"Requires mount equipped. +1 armor for mounted character.", requiresMount:true },
];

const ITEMS = [
  { id:"gem",           name:"Gem",           cost:6,  effect:"Sell to a vendor for 1d6 gold." },
  { id:"spellbook",     name:"Spellbook",     cost:5,  effect:"Can be used for spellcasting.", keywords:["Casting"] },
  { id:"rallying_horn", name:"Rallying Horn", cost:10, effect:"Once per game: all friendlies within 4\" may perform an extra action this turn.", maxPercompany:1 },
  { id:"map",           name:"Map",           cost:5,  effect:"Modify the scenario roll by +1 or −1." },
  { id:"mount",         name:"Mount",         cost:10, effect:"Movement becomes 8\". Can't climb or pick up items. Action to mount/dismount." },
  { id:"poison_vial",   name:"Poison",        cost:5,  effect:"Coat a weapon with Poison (not blunt or black powder weapons)." },
  { id:"healing_potion",name:"Healing Potion",cost:3,  effect:"Restore 1d6 health.", keywords:["Use"] },
  { id:"net",           name:"Net",           cost:4,  effect:"4+ to hit. Target can't move until beginning of their next turn." },
  { id:"rope",          name:"Rope",          cost:2,  effect:"Ignore movement penalty when climbing for one activation per scenario." },
  { id:"coffee_pot",    name:"Coffee Pot",    cost:5,  effect:"All friendly characters may move 2\" before the game starts." },
  { id:"instrument",    name:"Instrument",    cost:10, effect:"Friendlies within 6\" get +1\" movement and +1 to melee attack rolls. Can't attack or cast while playing. Undead unaffected." },
  { id:"waterskin",     name:"Waterskin",     cost:5,  effect:"When performing 2 consecutive movement actions, move an extra 2\"." },
  { id:"housing",       name:"Housing",       cost:60, effect:"Increases maximum company size from 6 to 8.", special:"housing" },
  { id:"backpack",      name:"Backpack",      cost:5,  effect:"Carry one additional item. May still use attack actions if only carrying one item." },
  { id:"first_aid_kit", name:"First Aid Kit", cost:5,  effect:"Use on a knocked-out character within 1\". They receive +2 to their injury roll." },
  { id:"monocular",     name:"Monocular",     cost:3,  effect:"Spot: Give a character within 1\" +1 to ranged attack rolls until end of turn." },
];

// Market items — purchased via rarity roll (2d6 must beat rarity)
const MARKET_ITEMS = [
  // ── Weapons ──
  { id:"carp_hammer",     name:"Carp Hammer",           category:"weapon", range:'Melee',    dmg:"4", cost:10, rarity:6,  hands:1, wtype:"melee",  keywords:["Casting"],  note:"1h", info:"A weapon of peculiar origin. Its heft carries a faint enchantment." },
  { id:"brannigan_arquebus",name:"Brannigan Arquebus",  category:"weapon", range:'2–20"',    dmg:"6", cost:25, rarity:7,  hands:2, wtype:"ranged", keywords:["Reload"],   note:"+2 to hit rolls", info:"Long-barrelled masterwork. Prized by marksmen.", blackPowder:true },
  { id:"composite_bow",   name:"Composite Bow",         category:"weapon", range:'12"',      dmg:"4", cost:10, rarity:5,  hands:2, wtype:"ranged", keywords:[],           note:"", info:"Layered wood and sinew give remarkable range." },
  { id:"repeater_flintlock",name:"Repeater Flintlock",  category:"weapon", range:'6"',       dmg:"4", cost:15, rarity:10, hands:1, wtype:"ranged", keywords:[],           note:"1h", info:"Fires twice before reloading.", blackPowder:true },
  { id:"piercing_spear",  name:"Piercing Spear",        category:"weapon", range:'Melee 2"', dmg:"5", cost:15, rarity:8,  hands:2, wtype:"melee",  keywords:["Poke"],     note:"2h · Double damage vs. mounted", info:"A lance-like spear honed to penetrate barding." },
  { id:"brannigan_rapier", name:"Brannigan Rapier",     category:"weapon", range:'Melee',    dmg:"4", cost:5,  rarity:10, hands:1, wtype:"melee",  keywords:["Parry"],    note:"1h · +2 armor when using Parry", info:"A duelist's blade of uncanny balance." },
  { id:"cinquedea",        name:"Cinquedea",            category:"weapon", range:'Melee',    dmg:"3", cost:15, rarity:8,  hands:1, wtype:"melee",  keywords:["Parry","Ambush"], note:"1h · Parry and Ambush on a single blade", info:"A wide blade favoured by merchants and nobles. Patient in defence, brutal in the shadows." },
  // ── Armor ──
  { id:"mithril_armor",   name:"Mithril Armor",         category:"armor",  armor:2, cost:25, rarity:7,  armorType:"light",  movePenalty:0,  heavy:false, slot:"armor", keywords:[],         note:"Light — no movement penalty · +2 armor", info:"Feather-light yet stronger than steel." },
  { id:"obsidian_armor",  name:"Obsidian Armor",        category:"armor",  armor:3, cost:30, rarity:7,  armorType:"heavy",  movePenalty:-2, heavy:true,  slot:"armor", keywords:["Heavy"],  note:"Heavy — −2\" movement · −2 to all damage taken", info:"Dark volcanic plates. Heavy but near impenetrable." },
  { id:"assassin_mocasines",name:"Assassin's Moccasins",category:"armor",  armor:0, cost:5,  rarity:7,  slot:"item",  keywords:[],         note:"+1 to Ambush rolls", info:"Soft-soled shoes that muffle every footstep." },
  { id:"mirror_shield",   name:"Mirror Shield",         category:"armor",  armor:1, cost:25, rarity:8,  slot:"melee", hands:1, wtype:"melee", keywords:[],  note:"1h · On roll of 4+: reflect spells back to caster", info:"A polished buckler that turns magic aside." },
  { id:"arcane_weave",    name:"Arcane Weave",          category:"armor",  armor:1, cost:15, rarity:6,  armorType:"light",  movePenalty:0,  heavy:false, slot:"armor", keywords:[],         note:"Light — no movement penalty · Spells targeting wearer have difficulty +2", info:"Threads of nullifying magic woven into supple leather." },
  { id:"spellward_mail",  name:"Spellward Mail",        category:"armor",  armor:2, cost:20, rarity:7,  armorType:"medium", movePenalty:-1, heavy:false, slot:"armor", keywords:["Medium"],  note:"Medium — −1\" movement · Magic damage taken reduced by 2", info:"Runes etched into every ring absorb arcane energy." },
  { id:"ironback",        name:"Ironback",              category:"armor",  armor:2, cost:15, rarity:6,  armorType:"medium", movePenalty:-1, heavy:false, slot:"armor", keywords:["Medium"],  note:"Medium — −1\" movement · Ambush attacks grant no bonus against this character", info:"Reinforced backplate. Stabbing this one in the back is a fool's errand." },
  { id:"spiked_armor",    name:"Spiked Armor",          category:"armor",  armor:3, cost:25, rarity:7,  armorType:"heavy",  movePenalty:-2, heavy:true,  slot:"armor", keywords:["Heavy"],   note:"Heavy — −2\" movement · Melee attackers take 1 damage on hit", info:"A brutal suit of outward-facing spikes. Dangerous to touch." },
  { id:"eyepatch",        name:"Eyepatch",              category:"armor",  armor:0, cost:5,  rarity:5,  slot:"item",  keywords:[],         note:"+1 ranged attack · Enemies get +1 to melee attacks vs this character", info:"A curious tradeoff. Sharpens the aim, opens the flank." },
  { id:"witch_hat",       name:"Witch Hat",             category:"armor",  armor:0, cost:30, rarity:8,  slot:"item",  keywords:[],         note:"Life Drain heals 1d6 instead of 1d3", info:"Pointed and wide-brimmed. Hums with coven magic." },
  // ── Items ──
  { id:"black_widow_venom",name:"Black Widow's Venom",  category:"item",   cost:15, rarity:8,  keywords:["Poison","Gruesome"], note:"", info:"A rare toxin. Even a nick proves fatal." },
  { id:"palio_horseshoes", name:"Brannigan Palio Horseshoes",category:"item",cost:5, rarity:5,  keywords:[],         note:"+1\" mount movement", info:"Specially fitted shoes for competition-bred mounts." },
  { id:"silver_bullets",  name:"Silver Bullets",        category:"item",   cost:10, rarity:6,  keywords:["Gruesome"], note:"Undead knocked out can't Rise Again and must roll injury. Gruesome vs Vampires. Black powder only.", info:"Cast from blessed silver. Anathema to the undead." },
  { id:"thurible",        name:"Thurible",              category:"item",   cost:25, rarity:7,  keywords:[],         note:"1h · Increases all enemies within 6\" spell difficulty by 2", info:"A smoking censer that disrupts arcane concentration.", requiresTitle:"priest" },
  { id:"jagged_arrows",   name:"Jagged Arrows",         category:"item",   cost:5,  rarity:5,  keywords:["Gruesome"], note:"", info:"Barbed shafts that tear rather than pierce." },
  { id:"eagle_eye_lense", name:"Eagle Eye Lense",       category:"item",   cost:10, rarity:8,  keywords:[],         note:"+2\" range", info:"A ground glass lens of remarkable clarity." },
  { id:"timeglass_haste",  name:"Timeglass of Haste",   category:"item",   cost:25, rarity:10, keywords:[],         note:"Once per scenario: character performs an extra action", info:"Sand flows upward. Time bends to the bearer's will." },
];

const TITLES = [
  { id:"bishop",          name:"Bishop of Brannigan",  influence:2, effect:"If the Bishop dies, immediately re-start event: A Terrible Tragedy." },
  { id:"joust_champion",  name:"Joust Champion",        influence:1, effect:"If the Joust Champion dies, shuffle the Joust! event into the quest deck." },
  { id:"minister",        name:"Brannigan Minister",    influence:2, effect:"If the Minister dies, shuffle the Audience With the Companies event card into the quest deck." },
  { id:"priest",          name:"Priest",                influence:0, effect:"All healing effects performed by the Priest restore 1 additional health." },
  { id:"lobbyist",        name:"Lobbyist",              influence:2, effect:"Granted through the Lobbyist talent." },
];

const REWARD_ITEMS = [
  // ── Weapons ──
  { id:"amaris_stiletto", name:"Amaris Stiletto",    category:"weapon", range:"Melee",    dmg:"2", value:20,  hands:1, wtype:"melee",  keywords:["Ambush"], note:"1h · Deals +2 damage when performing an ambush", info:"A blade of exceptional craft, light as a whisper." },
  { id:"durendal",        name:"Durendal",            category:"weapon", range:"Melee",    dmg:"4", value:25,  hands:1, wtype:"melee",  keywords:["Parry"],  note:"1h · +1 armor", info:"A legendary sword. Those who bear it stand firm." },
  { id:"joyeuse",         name:"Joyeuse",             category:"weapon", range:"Melee",    dmg:"3", value:3,   hands:1, wtype:"melee",  keywords:[],         note:"1h · Infuse one spell into the sword. Each hit casts it free.", info:"The blade shimmers with bound magic." },
  { id:"ole_betsy",       name:"'Ole Betsy",          category:"weapon", range:'2–16"',   dmg:"5", value:40,  hands:2, wtype:"ranged", keywords:["Reload"], note:"+1 to hit", info:"A veteran crossbow with a reputation for reliability." },
  { id:"pg_sledge",       name:"P.G.'s Sledge",       category:"weapon", range:"Melee",    dmg:"9", value:30,  hands:2, wtype:"melee",  keywords:[],         note:"2h · −1 to hit · Treat heavy armor as medium", info:"A monstrous two-handed mace. Few can wield it well." },
  { id:"sapience",        name:"Sapience",            category:"weapon", range:'Melee 2"', dmg:"2", value:50,  hands:2, wtype:"melee",  keywords:["Casting","Poke"], note:"Healing Word may target 2 characters with 1 action.", info:"A staff of ancient healing lore." },
  { id:"spire_cataclysm", name:"Spire of Cataclysm",  category:"weapon", range:"—",        dmg:"—", value:0,   hands:2, wtype:"melee",  keywords:[],         note:"Ability: Cataclysmic Geyser — Range 6\". Place a 4\" circle, roll scatter die + 1d6. Geyser moves that many inches in scatter direction dealing 2d6 damage to all in it. Repeats each turn. Max 1 cast per turn.", info:"A crackling spire that tears the ground open." },
  { id:"faladareth",      name:"Faladareth",          category:"weapon", range:'16"',      dmg:"6", value:50,  hands:2, wtype:"ranged", keywords:[],         note:"+1 to hit", info:"A bow of elven make, strung with a thread of starlight." },
  // ── Items ──
  { id:"key_to_city",     name:"The Key to the City", category:"item",   value:0,   keywords:[], note:"+2 influence while carrying · +2 XP from all sources · Can be picked up if bearer is knocked out", info:"A symbol of civic honour. Others covet it greatly." },
  { id:"luteivarius",     name:"Luteivarius",         category:"item",   value:100, keywords:[], note:"While playing: friendlies within 8\" get +1 move, +1 melee attack, +1 HP. No attack/spell actions while playing. Undead unaffected. Playing requires no action.", info:"A magnificent instrument whose music stirs the soul." },
  { id:"heart_mountain",  name:"Heart of the Mountain",category:"item",  value:100, keywords:[], note:"+1 influence while carrying", info:"A warm stone that pulses like a second heart." },
  { id:"dunder_honey",    name:"Gambrinus Stout",     category:"item",   value:0,   keywords:[], note:"Feed to one character: 8 damage unarmed, gains Bulky augment, +7 HP", info:"A potent brew of legendary strength. Those who drink it are never quite the same." },
  { id:"brannigan_culverin",name:"Brannigan Culverin",category:"item",   value:75,  keywords:[], note:"See Cannon rules.", info:"A compact cannon of the Brannigan arsenal." },
];

const AUGMENTS = [
  { id:"bulky",    name:"Bulky",    cost:5,  spellcaster:null, effect:"+3 HP · +1 to melee attack rolls · Ranged attacks against this character get +1 to hit." },
  { id:"nimble",   name:"Nimble",   cost:0,  spellcaster:null, effect:"Half HP (rounded up) · +1\" movement · −1 to ranged attack rolls against this character · +1 to Ambush rolls." },
  { id:"sorcerer", name:"Sorcerer", cost:10, spellcaster:"sorcerer", effect:"No casting item needed. Imbue 1 spell for +1 on cast rolls for that spell. Access to Quicken." },
  { id:"witch",    name:"Witch",    cost:10, spellcaster:"witch",    effect:"No casting item needed. Imbue 1 spell for +1 on cast rolls for that spell. Access to Life Drain." },
];

const SPELLS = [
  // ── STANDARD SPELLS ──
  { id:"ice_bolt",           name:"Ice Bolt",           diff:"4+", range:'6"',      dmg:3,    cost:5,  for:"all",      effect:"Slows target's movement by 2\" until caster's next turn." },
  { id:"fire_bolt",          name:"Fire Bolt",           diff:"4+", range:'8"',      dmg:3,    cost:5,  for:"all",      effect:"Deals an additional 1 damage over d3 turns." },
  { id:"healing_word",       name:"Healing Word",        diff:"—",  range:'6"',      dmg:null, cost:5,  for:"all",      effect:"Heals the target for 1d3." },
  { id:"silence",            name:"Silence",             diff:"4+", range:'6"',      dmg:null, cost:5,  for:"all",      effect:"Target can't cast spells until next turn. On fail: +1 to target's next cast difficulty." },
  { id:"barkskin",           name:"Barkskin",            diff:"—",  range:'4"',      dmg:null, cost:5,  for:"all",      effect:"Target gains +2 armor until end of turn." },
  { id:"grasping_roots",     name:"Grasping Roots",      diff:"4+", range:'4"',      dmg:null, cost:5,  for:"all",      effect:"Target can't use move actions until next turn." },
  { id:"curse",              name:"Curse",               diff:"—",  range:'6"',      dmg:1,    cost:5,  for:"all",      effect:"Target takes 1 damage at start of each round for 1d6 rounds." },
  { id:"force_lance",        name:"Force Lance",         diff:"3+", range:'6"',      dmg:2,    cost:10, for:"all",      effect:"Push target 2\" in any direction. Damage reduced by 1 per point of target's armor." },
  { id:"penance",            name:"Penance",             diff:"—",  range:'6"',      dmg:null, cost:5,  for:"all",      effect:"Remove all negative effects from target. +1 to attack rolls until next turn. Requires title 'Priest'." },
  { id:"blind",              name:"Blind",               diff:"—",  range:'8"',      dmg:null, cost:5,  for:"all",      effect:"Target receives −2 to all attack rolls until caster's next turn." },
  { id:"life_drain",         name:"Life Drain",          diff:"2+", range:'4"',      dmg:null, cost:5,  for:"witch",    effect:"Drain 1d3 health from the target." },
  { id:"manifest",           name:"Manifest",            diff:"—",  range:"Self",    dmg:null, cost:5,  for:"sorcerer", effect:"The next spell cast this activation automatically succeeds and gains +2\" range." },
  { id:"necrotic_bolt",      name:"Necrotic Bolt",       diff:"4+", range:'6"',      dmg:3,    cost:5,  for:"undead",   effect:"Gruesome — a knocked-out target receives −2 to their injury roll." },
  // ── LIBRARY TOMES ──
  { id:"sleep",              name:"Sleep",               diff:"5+", range:'4"',      dmg:null, cost:10, for:"all",      tome:true, rarity:6,  effect:"Target sleeps until caster's next turn or until damaged." },
  { id:"blight",             name:"Blight",              diff:"—",  range:'6"',      dmg:1,    cost:5,  for:"all",      tome:true, rarity:6,  effect:"Target takes 1 damage and cannot be healed for d3 turns." },
  { id:"protective_barrier", name:"Protective Barrier",  diff:"—",  range:'6"',      dmg:null, cost:10, for:"all",      tome:true, rarity:7,  effect:"Place a 4\" marker — characters inside take −2 damage from ranged attacks. Requires Staff." },
  { id:"blink",              name:"Blink",               diff:"—",  range:'6"',      dmg:null, cost:10, for:"all",      tome:true, rarity:7,  effect:"Teleport to any visible location within 6\". Once per activation." },
  { id:"chain_lightning",    name:"Chain Lightning",     diff:"4+", range:'6"',      dmg:2,    cost:10, for:"all",      tome:true, rarity:7,  effect:"Deals 2 damage to target, then jumps to every character within 2\" for 1 damage." },
  { id:"dread",              name:"Dread",               diff:"—",  range:'4" AoE',  dmg:null, cost:10, for:"all",      tome:true, rarity:7,  effect:"All enemies within 4\" of the target must use their next movement action to move away." },
  { id:"gust",               name:"Gust",                diff:"—",  range:'3" AoE',  dmg:null, cost:5,  for:"all",      tome:true, rarity:7,  effect:"Push or pull all characters within 3\" of the caster by 3\". See keyword Fall." },
  { id:"haste",              name:"Haste",               diff:"—",  range:"Self",    dmg:null, cost:10, for:"all",      tome:true, rarity:8,  effect:"Target gets an extra action and +1d3\" movement until end of turn. Once per activation." },
  { id:"entomb",             name:"Entomb",              diff:"—",  range:'6"',      dmg:null, cost:10, for:"all",      tome:true, rarity:10, effect:"Target takes 2 damage for each point of armor they have." },
  { id:"paranoia",           name:"Paranoia",            diff:"—",  range:'6"',      dmg:null, cost:10, for:"all",      tome:true, rarity:11, effect:"Target must spend their next activation attacking the nearest character, friend or foe." },
];

const KEYWORDS = {
  Armor:"Increases required attack by X equal to the target's armor.",
  Ambush:"First attack against a target facing away can be declared an Ambush — double damage and +2 to attack rolls.",
  Reload:"Must spend an action to reload before using again.",
  "Slow Reload":"Must spend two actions to reload before using again.",
  "Fire Once":"Can only be used once per battle.",
  Parry:"Use as an activation — receive +1 armor until end of the round. Humans gain +2 armor instead.",
  Heavy:"-1\" movement. Fall damage uses d6 instead of d3.",
  Casting:"Can be used for spellcasting.",
  Poke:"If a character enters this weapon's range, the carrier may spend one action to attack.",
  Poison:"Character takes 1 additional damage at the end of each of their activations for d3 turns.",
  Fall:"If pushed over an edge and falling more than 2\", take 1d3 damage per 2\" fallen.",
  Cover:"Ranged attack rolls against a target in cover receive −1. Shields also grant cover.",
  "Rise Again":"At the start of each turn, roll d6 for each dead Undead — on 6+ they revive at full HP.",
  Use:"Item is consumed after use.",
  Gruesome:"A knocked-out target affected by Gruesome receives −2 to their injury roll.",
  "Dual Wield":"Equipping two 1-handed melee weapons lets you attack twice per activation, but both attacks suffer −1 to the attack roll.",
};

// ===================== FACTION BONUSES =====================
// Activated when ALL members of the company share the same race.
// Undead + Vampire counts as a combined faction.

const FACTION_BONUSES = {
  human:    { label:"Human Brotherhood",      icon:"🛡",  bonus:"All fighters gain +2 bonus XP from quests." },
  dwarf:    { label:"Dwarven Clan",            icon:"⛏",  bonus:"Company can't route. Gain +2 gold when selling gems." },
  elf:      { label:"Elven Conclave",          icon:"🌿",  bonus:'Once per battle: declare "Harmonious Fire" — all Elves get +1 to ranged attack rolls for 1 turn.' },
  goblin:   { label:"Goblin Rabble",           icon:"🐀",  bonus:"May purchase 1 Troll minion at half price." },
  ork:      { label:"Ork Warband",             icon:"💢",  bonus:"Orks may move into melee range if they are within 1\" of an enemy." },
  undead:   { label:"Undead Horde",            icon:"💀",  bonus:"Undead skip injury rolls entirely. Vampires still roll as normal." },
  halfling: { label:"Halfling Shire-Company",  icon:"🌾",  bonus:"Maximum company size increased by 2. +1 to all injury roll results." },
};

// Vampire-only company gets the undead bonus
const UNDEAD_RACES = ["undead", "vampire"];



// ===================== TALENTS =====================

const TALENTS = {
  attributes: {
    name:"Attributes", icon:"💪", tiers:[
      [
        { id:"sturdy",          name:"Sturdy",           desc:"+5 health" },
        { id:"giddy_up",        name:"Giddy Up",         desc:"+1\" movement when mounted" },
        { id:"u_sure",          name:"U Sure?",           desc:"First melee attack roll made against this character each turn has −1" },
        { id:"full_pull",       name:"Full Pull",         desc:"Increase damage dealt with bows by 1" },
        { id:"second_opinion",  name:"Second Opinion",    desc:"May re-roll one injury roll once" },
      ],[
        { id:"runner_up",       name:"Runner Up",         desc:"+1\" movement" },
        { id:"cheat_death",     name:"Cheat Death",       desc:"The first time knocked out, stand back up with 1 HP" },
        { id:"climber",         name:"Climber",           desc:"This character can move vertically without reduced movement unless mounted." },
        { id:"bouncy",          name:"Bouncy",            desc:"Immune to fall damage" },
        { id:"touche",          name:"Touché",            desc:"After making a melee attack, this character may perform a free Disengage action." },
      ],[
        { id:"grapple",         name:"Grapple",           desc:"Use an action to grab an enemy in base contact. The grabbed character cannot use the Disengage action until this character moves away or is knocked out." },
        { id:"precise_a",       name:"Precise",           desc:"+1 damage with all melee weapons" },
        { id:"lucky",           name:"Lucky",             desc:"Once per round you may reroll one dice." },
        { id:"absorb",          name:"Absorb",            desc:"Spells that fail against this character heal them for 1d6" },
        { id:"eagle_eye",       name:"Eagle Eye",         desc:"Ignore cover when shooting ranged weapons" },
      ],[
        { id:"berserker",       name:"Berserker",         desc:"Each time this character takes damage, they gain +1 damage and +1 to melee attack rolls. If wielding a 2-handed weapon, gain +2 damage instead." },
        { id:"swift",           name:"Swift",             desc:"Gain an extra action" },
        { id:"panzer",          name:"Panzer",            desc:"All damage taken is halved (rounded up)" },
        { id:"iron_lung",       name:"Iron Lung",         desc:"Blowpipe shoots 3 times per action" },
        { id:"tutor",           name:"Tutor",             desc:"Grant one other member of the company 1 additional talent point. Choose the recipient below." },
      ],
    ],
  },
  combat: {
    name:"Combat", icon:"⚔️", tiers:[
      [
        { id:"brutal_strike",   name:"Brutal Strike",    desc:"Hit rolls of 6 increase damage by 1" },
        { id:"true_strike",     name:"True Strike",      desc:"Hit rolls of 6 are a guaranteed hit" },
        { id:"far_shot",        name:"Far Shot",         desc:"Increase range of ranged weapons by 2\"" },
        { id:"quick_draw",      name:"Quick Draw",       desc:"Switch between ranged and melee weapons without using an action" },
        { id:"high_ground",     name:"High Ground",      desc:"+1 to ranged attack rolls when 2\" or more above the target" },
      ],[
        { id:"cavalry_charge",  name:"Cavalry Charge",   desc:"+1 to melee attack rolls and +1 damage while mounted." },
        { id:"iron_skin",       name:"Iron Skin",        desc:"All damage dealt to this character in melee is reduced by 1" },
        { id:"swashbuckler",    name:"Swashbuckler",     desc:"Equipped with only one 1-handed weapon and nothing else: +1 to attack roll and +2 damage." },
        { id:"axe_master",      name:"Axe Master",       desc:"1-handed axes +1 damage, 2-handed axes +2 damage" },
        { id:"spear_master",    name:"Spear Master",     desc:"Spears deal double damage against mounted characters" },
      ],[
        { id:"street_fighter",  name:"Street Fighter",   desc:"+1 to attack rolls in melee" },
        { id:"marksman",        name:"Marksman",         desc:"+1 to ranged attack rolls" },
        { id:"shield_master",   name:"Shield Master",    desc:"Shields give an additional +1 armor" },
        { id:"ambidextrous",    name:"Ambidextrous",     desc:"Removes the dual wield attack roll penalty." },
        { id:"ride_by",         name:"Ride-By Attack",   desc:"Perform a free attack if you perform two movement actions while mounted" },
      ],[
        { id:"fast_reload",     name:"Fast Reload",      desc:"Reload doesn't require an action; Slow Reload only requires 1 action" },
        { id:"devastating",     name:"Devastating Blow", desc:"Hit rolls of 6 deal double damage" },
        { id:"hunter",          name:"Hunter",           desc:"May perform Ambush with a bow" },
        { id:"retaliate",       name:"Retaliate",        desc:"Equipped with a sword: on missed melee attack, perform a free melee attack" },
        { id:"assassin",        name:"Assassin",         desc:"Dagger Ambush attacks deal triple damage instead of double" },
      ],
    ],
  },
  magic: {
    name:"Magic", icon:"✨", tiers:[
      [
        { id:"far_reach",       name:"Far Reach",        desc:"Increase range of all spells by 1\"" },
        { id:"empowered",       name:"Empowered",        desc:"Increase damage of all spells by 1" },
        { id:"reject_magic",    name:"Reject Magic",     desc:"Can't cast spells. Magic damage taken is reduced by 1" },
        { id:"spellsword",      name:"Spellsword",       desc:"If you cast a spell this turn, gain +1 to melee attack rolls until end of turn" },
        { id:"spellstorm",      name:"Spellstorm",       desc:"After casting a spell successfully, deal 1 damage to all enemies within 2\"" },
      ],[
        { id:"focused_mind",    name:"Focused Mind",     desc:"Reduce difficulty of a spell by 1" },
        { id:"force_push",      name:"Force Push",       desc:"Force Lance deals no damage but push distance is increased by 1\"" },
        { id:"spell_echo",      name:"Spell Echo",       desc:"Cast two spells in a row: the second gains +1 damage or effect" },
        { id:"charged_bullets", name:"Charged Bullets",  desc:"Black powder weapons ignore armor" },
        { id:"preparation",     name:"Preparation",      desc:"At the beginning of each scenario, the first spell this character casts automatically succeeds." },
      ],[
        { id:"inferno",         name:"Inferno",          desc:"Fire Bolt damage and range increased by 2" },
        { id:"mending_word",    name:"Mending Word",     desc:"Healing Word heals 1d6" },
        { id:"arcane_warrior",  name:"Arcane Warrior",   desc:"If you cast one or more spells this turn, perform one additional free melee attack" },
        { id:"archmage",        name:"Archmage's Gift",  desc:"Once per scenario, automatically succeed a single spell" },
        { id:"distant_sorcery", name:"Distant Sorcery",  desc:"Double the range of all spells" },
      ],[
        { id:"savant",          name:"Savant",           desc:"Automatically succeed spellcasts — but can only use 1 spell." },
        { id:"wild_surge",      name:"Wild Surge",       desc:"Rolls of 6 double the effect and damage of a spell" },
        { id:"enchanter",       name:"Enchanter",        desc:"Use 2 gems to enchant a melee weapon (+1d3 for 1h / +1d6 for 2h)" },
        { id:"healing_aura",    name:"Healing Aura",     desc:"First activation each round heals all characters within 6\" for 1d3" },
        { id:"sage",            name:"Sage",             desc:"Witch & Sorcerer may have all their spells automatically succeed" },
      ],
    ],
  },
  diplomacy: {
    name:"Diplomacy", icon:"🤝", tiers:[
      [
        { id:"ordination",      name:"Ordination",       desc:"Grants the Priest title.", grantsTitle:"Priest" },
        { id:"haggler",         name:"Haggler",          desc:"1d6 discount on items that cost 20 or more" },
        { id:"spy_network",     name:"Spy Network",      desc:"You may look at other players' personal quests" },
        { id:"broker",          name:"Broker",           desc:"Whenever another player performs a rarity roll you may add 1 to the result" },
        { id:"jewellers_eye",   name:"Jeweller's Eye",   desc:"+1 value to gem rolls (max is still 6)" },
      ],[
        { id:"salvager",        name:"Salvager",         desc:"Receive 1 additional gem from scenarios." },
        { id:"composure",       name:"Composure",        desc:"You may reroll 1 die in the interwar phase (not injury rolls)." },
        { id:"inside_track",    name:"Inside Track",     desc:"Look at an additional card at the quest board" },
        { id:"second_chance",   name:"Second Chance",    desc:"Reroll any 1 die between scenarios (not injury rolls)" },
        { id:"silver_tongue",   name:"Silver Tongue",    desc:"When spreading a rumour, either add 2 to the target's rumour counter or remove 1 from any company's rumour counter." },
      ],[
        { id:"opportunist",     name:"Opportunist",      desc:"Discard any personal quest and draw a new one after each scenario" },
        { id:"decisive",        name:"Decisive",         desc:"You win all tiebreakers (not combat)" },
        { id:"diplomat",        name:"Diplomat",         desc:"You and one other company receive 1 influence" },
        { id:"reward_seeker",   name:"Reward Seeker",    desc:"Receive an additional 1d6 gold for quests you complete" },
        { id:"frequent_buyer",  name:"Frequent Buyer",   desc:"No rarity roll needed for items you have found before" },
      ],[
        { id:"tradesmen",       name:"Tradesmen",        desc:"Sell items at full value" },
        { id:"lobbyist",        name:"Lobbyist",         desc:"Title: Lobbyist — 2 influence", grantsTitle:"Lobbyist" },
        { id:"tariff",          name:"Tariff",           desc:"When someone else sells or trades, you receive 1d3 gold" },
        { id:"smuggler",        name:"Smuggler",         desc:"Automatically succeed all rarity rolls" },
        { id:"family_ties",     name:"Family Ties",      desc:"Choose a company. If allies in the endgame, both receive 1 influence each" },
      ],
    ],
  },
  leadership: {
    name:"Leadership", icon:"👑", leaderOnly:true, tiers:[
      [
        { id:"determined",      name:"Determined",       desc:"Don't have to visit the tavern when winning a scenario" },
        { id:"spellbreaker",    name:"Spellbreaker",     desc:"Magic effects against this character are halved. No spellcasters allowed in the company" },
        { id:"praise",          name:"Praise",           desc:"After each scenario, grant one other character 5 XP" },
        { id:"inspiring",       name:"Inspiring Presence",desc:"Characters starting their action within 5\" of the leader get +2\" movement this round" },
        { id:"command_presence",name:"Command Presence", desc:"Once per scenario, immediately after the leader's activation, the leader may activate a friendly character within 6\" out of turn order." },
      ],[
        { id:"battle_cry",      name:"Battle Cry",       desc:"Ability: All friendly characters within 6\" get +1 to all attack rolls until end of turn" },
        { id:"ranged_focus",    name:"Ranged Focus",     desc:"All characters in the company receive +1 to ranged attack rolls. The leader may not equip melee weapons." },
        { id:"guide",           name:"Guide",            desc:"Call out to a character within 6\" to perform a free movement or attack action (doesn't use an action)" },
        { id:"look_to_skies",   name:"Look to the Skies",desc:"If no friendlies use ranged weapons, enemy ranged rolls against the company have −1 while the leader is alive" },
        { id:"phalanx",         name:"Phalanx",          desc:"Ability: All characters within 4\" receive +2 armor until end of turn" },
      ],[
        { id:"squire",          name:"Squire",           desc:"Recruit a squire for free of the same race. Doesn't count towards maximum company size" },
        { id:"bandwagon",       name:"Bandwagon",        desc:"Company receives 1 influence per leader knockout. All lost if the leader is knocked out" },
        { id:"for_glory",       name:"On My Mark",       desc:"Once per scenario, choose an ally to immediately perform a full additional turn." },
        { id:"mentor",          name:"Mentor",           desc:"Friendly knockouts within 6\" of the leader grant 5 XP to that character" },
        { id:"charismatic",     name:"Charismatic",      desc:"Recruiting characters costs half price" },
      ],
    ],
  },
  undead: {
    name:"Undead", icon:"💀", undeadOnly:true, tiers:[
      [
        { id:"reise",           name:"Reise",            desc:"+1 to Rise Again rolls (4+ instead of 5+)" },
        { id:"big_boned",       name:"Big Boned",        desc:"+5 health" },
        { id:"swift_boned",     name:"Swift Boned",      desc:"+1\" movement" },
        { id:"hollow",          name:"Hollow",           desc:"Ranged attacks against this character get −1 to attack rolls" },
        { id:"precise_boned",   name:"Precise Boned",    desc:"Reroll hit rolls of 1" },
      ],[
        { id:"infected",        name:"Infected",         desc:"All attacks have Poison" },
        { id:"close_up",        name:"Close Up",         desc:"+1 to melee attack rolls" },
        { id:"far_away",        name:"Far Away",         desc:"+1 to ranged attack rolls" },
        { id:"cast_away",       name:"Cast Away",        desc:"+1 to spell difficulty rolls" },
        { id:"slash",           name:"Slash",            desc:"Attacks have Gruesome" },
      ],[
        { id:"bonebreaker",     name:"Bonebreaker",      desc:"Rolls of 6 deal an additional 3 damage" },
        { id:"explode",         name:"Explode",          desc:"When knocked out, deal 1d6 damage to all creatures within 3\"" },
        { id:"vendetta",        name:"Vendetta",         desc:"When dealt damage, 2 damage is reflected to the attacker" },
        { id:"huge_boned",      name:"Huge Boned",       desc:"+10 health" },
        { id:"warlock",         name:"Warlock",          desc:"Increase range and damage of Necrotic Bolt by 2" },
      ],[
        { id:"glory",           name:"Glory",            desc:"Sacrifice this character — company gains 1 influence", sacrifice:true },
        { id:"greed",           name:"Greed",            desc:"Sacrifice this character for 6 gems", sacrifice:true },
        { id:"enthrall",        name:"Enthrall",         desc:"Sacrifice this character — leader gains 1 additional talent point", sacrifice:true },
        { id:"rage_sac",        name:"Rage",             desc:"Sacrifice this character — leader gets +2 to all attack rolls until end of scenario", sacrifice:true },
        { id:"mercy",           name:"Mercy",            desc:"Spare this character — they get +1 to Rise Again rolls (4+ instead of 5+)", sacrifice:false },
      ],
    ],
  },
};

// ===================== CSS =====================
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700&family=Cinzel+Decorative:wght@700&family=Crimson+Text:ital,wght@0,400;0,600;1,400&display=swap');

*,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}

:root{
  --ink:#0b0906;
  --surface:#16110c;
  --s2:#1e1610;
  --s3:#261d14;
  --s4:#2e2318;
  --gold:#c8952a;
  --gold-l:#e4b84a;
  --gold-d:#7a5515;
  --rust:#9b3b1a;
  --rust-l:#c44c22;
  --parch:#d9c49a;
  --parch-d:#a08860;
  --parch-dd:#6a5a3a;
  --txt:#e0cca0;
  --txt-d:#8a7254;
  --border:#362a1c;
  --border-l:#4a3825;
  --shadow:rgba(0,0,0,.65);
  --green:#2a6b3a;
  --green-l:#3e9e55;
}

body{
  background:var(--ink);
  color:var(--txt);
  font-family:'Crimson Text',Georgia,serif;
  font-size:16px;
  min-height:100vh;
}

.app{
  max-width:1180px;
  margin:0 auto;
  padding:0 1.25rem 5rem;
  position:relative;
}

/* Vellum grain overlay */
.app::before{
  content:'';
  position:fixed;
  inset:0;
  background:
    radial-gradient(ellipse 90% 50% at 50% -10%, rgba(160,80,20,.1) 0%, transparent 65%),
    radial-gradient(ellipse 40% 60% at 5%  90%, rgba(100,30,10,.07) 0%, transparent 60%);
  pointer-events:none;
  z-index:0;
}

/* ─── HEADER ─── */
.hdr{
  text-align:center;
  padding:2.5rem 1rem 2rem;
  border-bottom:1px solid var(--border-l);
  margin-bottom:2rem;
  position:relative;
  z-index:1;
}
.hdr h1{
  font-family:'Cinzel Decorative',serif;
  font-size:clamp(1.5rem,4.5vw,2.8rem);
  color:var(--gold-l);
  text-shadow:0 0 40px rgba(200,150,42,.35),0 2px 6px rgba(0,0,0,.9);
  letter-spacing:.04em;
  line-height:1.15;
}
.hdr-sub{
  font-style:italic;
  color:var(--parch-d);
  margin-top:.4rem;
  font-size:1rem;
}
.hdr-rule{
  color:var(--gold-d);
  letter-spacing:.6em;
  font-size:.75rem;
  margin-top:.75rem;
}

/* ─── TOPBAR ─── */
.topbar{
  background:linear-gradient(135deg,var(--s2),var(--s3));
  border:1px solid var(--border-l);
  border-radius:8px;
  padding:.85rem 1.25rem;
  margin-bottom:.6rem;
  box-shadow:0 4px 20px var(--shadow),inset 0 1px 0 rgba(200,149,42,.08);
  position:relative;
  z-index:1;
  display:flex;
  flex-direction:column;
  gap:.75rem;
}
.tb-row1{
  display:flex;
  align-items:center;
  gap:.65rem;
}
.tb-row2{
  display:flex;
  align-items:center;
  gap:.6rem;
  flex-wrap:wrap;
}
.tb-name-input{
  display:flex;
  align-items:center;
  gap:.5rem;
  flex:1;
  min-width:0;
}
.tb-sigil{
  display:flex;
  align-items:center;
  gap:.5rem;
  flex-shrink:0;
}
.tb-sigil-img{
  width:38px;height:38px;object-fit:cover;border-radius:5px;
  border:1px solid var(--border-l);cursor:pointer;transition:border-color .2s;
}
.tb-sigil-img:hover{border-color:var(--gold-d);}
.tb-sigil-placeholder{
  width:38px;height:38px;border-radius:5px;
  border:1px dashed var(--border-l);display:flex;align-items:center;
  justify-content:center;font-size:1.1rem;cursor:pointer;
  background:var(--surface);transition:border-color .2s;flex-shrink:0;
}
.tb-sigil-placeholder:hover{border-color:var(--gold-d);}
.tb-sigil-remove{
  background:none;border:none;color:var(--txt-d);cursor:pointer;
  font-size:.65rem;padding:.1rem;transition:color .15s;line-height:1;
}
.tb-sigil-remove:hover{color:var(--rust-l);}
.tb-lbl{
  font-family:'Cinzel',serif;
  font-size:.65rem;
  text-transform:uppercase;
  letter-spacing:.14em;
  color:var(--gold-d);
  white-space:nowrap;
}
.tb-input{
  background:var(--surface);
  border:1px solid var(--border);
  border-radius:4px;
  color:var(--parch);
  font-family:'Cinzel',serif;
  font-size:1.05rem;
  padding:.35rem .7rem;
  flex:1;
  min-width:0;
  transition:border-color .2s;
}
.tb-input:focus{outline:none;border-color:var(--gold-d);box-shadow:0 0 0 2px rgba(200,149,42,.1);}

.tb-stats{
  display:flex;
  align-items:center;
  gap:.6rem;
  flex-wrap:wrap;
}
.tb-stat{text-align:center;}
.tb-val{
  display:block;
  font-family:'Cinzel',serif;
  font-size:1.3rem;
  font-weight:700;
  color:var(--gold-l);
  text-shadow:0 0 12px rgba(228,184,74,.25);
  line-height:1;
}
.tb-val.danger{color:#d84040;text-shadow:0 0 12px rgba(216,64,64,.3);}
.tb-lbl2{
  display:block;
  font-family:'Cinzel',serif;
  font-size:.58rem;
  text-transform:uppercase;
  letter-spacing:.1em;
  color:var(--txt-d);
  margin-top:.15rem;
}
.tb-div{width:1px;height:36px;background:var(--border-l);}
.influence-tracker{
  display:flex;flex-direction:column;align-items:center;gap:.15rem;
}
.inf-lbl{
  font-family:'Cinzel',serif;font-size:.58rem;text-transform:uppercase;
  letter-spacing:.1em;color:var(--txt-d);line-height:1;
}
.inf-controls{display:flex;align-items:center;gap:.25rem;}
.inf-val{
  font-family:'Cinzel',serif;font-size:1.3rem;font-weight:700;
  color:var(--gold-l);text-shadow:0 0 12px rgba(228,184,74,.25);line-height:1;
  min-width:1.5ch;text-align:center;
}
.inf-btn{
  background:rgba(200,149,42,.1);border:1px solid var(--border-l);
  border-radius:4px;color:var(--txt-d);font-size:.75rem;width:20px;height:20px;
  cursor:pointer;display:flex;align-items:center;justify-content:center;
  transition:all .15s;font-family:monospace;flex-shrink:0;padding:0;line-height:1;
}
.inf-btn:hover{background:rgba(200,149,42,.2);border-color:var(--gold-d);color:var(--gold);}
.inf-btn:active{transform:scale(.9);}
.inf-tracker-wrap{position:relative;}

/* ─── TITLES & REWARDS ─── */
.title-badge{
  font-family:'Cinzel',serif;font-size:.58rem;text-transform:uppercase;letter-spacing:.09em;
  background:linear-gradient(135deg,rgba(200,149,42,.18),rgba(200,149,42,.06));
  border:1px solid var(--gold-d);border-radius:3px;
  color:var(--gold);padding:.1rem .4rem;white-space:nowrap;
}
.reward-card{
  background:var(--s2);border:1px solid var(--border);border-radius:8px;
  padding:.65rem .85rem;display:flex;align-items:flex-start;gap:.75rem;
  cursor:pointer;transition:all .15s;
}
.reward-card:hover:not(.rc-owned){border-color:var(--border-l);background:var(--s3);}
.reward-card.rc-owned{border-color:var(--gold-d);background:linear-gradient(135deg,rgba(200,149,42,.1),rgba(200,149,42,.03));}
.rc-val{
  display:flex;flex-direction:column;align-items:center;gap:.1rem;flex-shrink:0;
  background:var(--surface);border:1px solid var(--border-l);border-radius:6px;
  padding:.3rem .4rem;min-width:38px;
}
.rc-val-num{font-family:'Cinzel',serif;font-size:.8rem;font-weight:700;color:var(--parch);}
.rc-val-lbl{font-family:'Cinzel',serif;font-size:.44rem;text-transform:uppercase;letter-spacing:.1em;color:var(--txt-d);}
.reward-card.rc-owned .rc-val{border-color:var(--gold-d);}
.reward-card.rc-owned .rc-val-num{color:var(--gold);}
.rewards-section-head{font-family:'Cinzel',serif;font-size:.65rem;text-transform:uppercase;letter-spacing:.12em;color:var(--gold-d);margin:.85rem 0 .4rem;padding-bottom:.25rem;border-bottom:1px solid var(--border);}
.rewards-section-head:first-child{margin-top:0;}
.title-card{
  background:var(--s2);border:1px solid rgba(200,149,42,.25);border-radius:8px;
  padding:.65rem .85rem;display:flex;align-items:flex-start;gap:.75rem;
  cursor:pointer;transition:all .15s;
}
.title-card:hover:not(.tc-owned){border-color:var(--gold-d);background:var(--s3);}
.title-card.tc-owned{border-color:var(--gold);background:linear-gradient(135deg,rgba(200,149,42,.15),rgba(200,149,42,.04));}
.tc-inf{
  display:flex;flex-direction:column;align-items:center;gap:.1rem;flex-shrink:0;
  background:var(--surface);border:1px solid rgba(200,149,42,.3);border-radius:6px;
  padding:.3rem .4rem;min-width:34px;
}
.tc-inf-num{font-family:'Cinzel',serif;font-size:.9rem;font-weight:700;color:var(--gold-d);}
.tc-inf-lbl{font-family:'Cinzel',serif;font-size:.44rem;text-transform:uppercase;letter-spacing:.1em;color:var(--txt-d);}
.title-card.tc-owned .tc-inf-num{color:var(--gold);}
.tc-body{flex:1;min-width:0;}
.tc-name{font-family:'Cinzel',serif;font-size:.82rem;color:var(--parch);}
.title-card.tc-owned .tc-name{color:var(--gold);}
.tc-effect{font-size:.76rem;color:var(--txt-d);margin-top:.2rem;line-height:1.4;font-style:italic;}
.tc-from-talent{font-size:.68rem;color:var(--txt-d);margin-top:.2rem;opacity:.7;}
.tc-locked{cursor:default;}

/* ─── PROGRESS ─── */
.prog-wrap{
  height:5px;
  background:var(--surface);
  border-radius:3px;
  overflow:hidden;
  margin-bottom:1.75rem;
  border:1px solid var(--border);
  position:relative;
  z-index:1;
}
.prog-fill{
  height:100%;
  background:linear-gradient(90deg,var(--gold-d),var(--gold-l));
  border-radius:3px;
  transition:width .4s ease;
}
.prog-fill.warn{background:linear-gradient(90deg,#7a3010,#c04818);}
.prog-fill.danger{background:linear-gradient(90deg,#6a1010,#b02020);}

.budget-warn{
  background:rgba(155,59,26,.18);
  border:1px solid var(--rust);
  border-radius:6px;
  padding:.6rem 1rem;
  font-style:italic;
  color:var(--rust-l);
  font-size:.9rem;
  text-align:center;
  margin-bottom:1.25rem;
  position:relative;
  z-index:1;
}

/* ─── LAYOUT ─── */
.layout{
  display:block;
  position:relative;
  z-index:1;
}

/* ─── ADD BUTTON ─── */
.add-btn{
  width:100%;
  background:linear-gradient(135deg,var(--s3),var(--s4));
  border:1px dashed var(--border-l);
  border-radius:8px;
  font-family:'Cinzel',serif;
  font-size:.78rem;
  text-transform:uppercase;
  letter-spacing:.15em;
  padding:.85rem;
  cursor:pointer;
  transition:all .2s;
  margin-bottom:1.25rem;
}
.add-btn:disabled{opacity:.35;cursor:not-allowed;}
.add-btn-members{
  color:#4a8fc4;
  border-color:#2a5a80;
}
.add-btn-members:hover:not(:disabled){
  border-color:#5aafee;
  color:#7acfff;
  background:linear-gradient(135deg,rgba(42,90,128,.15),rgba(42,90,128,.05));
}
.add-btn-equip{
  color:#4a9a5a;
  border-color:#2a6a3a;
}
.add-btn-equip:hover:not(:disabled){
  border-color:#5aca7a;
  color:#7aee9a;
  background:linear-gradient(135deg,rgba(42,106,58,.15),rgba(42,106,58,.05));
}

/* ─── EMPTY STATE ─── */
.empty{
  border:1px dashed var(--border);
  border-radius:8px;
  padding:3rem 1.5rem;
  text-align:center;
  color:var(--txt-d);
  font-style:italic;
}

/* ─── MEMBER CARD ─── */
.roster{display:flex;flex-direction:column;gap:.85rem;}
.bottom-panel{margin-top:.85rem;}
.inv-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(160px,1fr));gap:.4rem .6rem;}
.roster-details-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:.6rem;}

@keyframes slideIn{
  from{opacity:0;transform:translateY(-6px);}
  to{opacity:1;transform:translateY(0);}
}
.member-card{
  background:linear-gradient(150deg,var(--s2),var(--s3));
  border:1px solid var(--border-l);
  border-radius:10px;
  overflow:hidden;
  box-shadow:0 4px 18px rgba(0,0,0,.4);
  transition:border-color .2s;
  animation:slideIn .22s ease;
}
.member-card.open{border-color:var(--gold-d);}

.mem-head{
  display:flex;
  align-items:flex-start;
  gap:.75rem;
  padding:.9rem 1.1rem;
  cursor:pointer;
  user-select:none;
}
.mh-left{flex:1;min-width:0;}
.mh-name{
  background:transparent;
  border:none;
  border-bottom:1px dashed var(--border-l);
  color:var(--parch);
  font-family:'Cinzel',serif;
  font-size:.95rem;
  padding:.1rem 0;
  width:100%;
  transition:border-color .2s;
}
.mh-name:focus{outline:none;border-bottom-color:var(--gold-d);}
.mh-badges{
  display:flex;
  gap:.4rem;
  margin-top:.25rem;
  flex-wrap:wrap;
}
.badge{
  font-family:'Cinzel',serif;
  font-size:.58rem;
  text-transform:uppercase;
  letter-spacing:.1em;
  padding:.15rem .4rem;
  border-radius:3px;
  border:1px solid;
}
.badge-race{color:var(--parch-d);border-color:var(--border-l);}
.badge-aug{color:var(--gold);border-color:var(--gold-d);background:rgba(200,149,42,.08);}
.badge-leader{color:#e0d060;border-color:#8a7a20;background:rgba(200,180,40,.08);}

.mh-right{display:flex;align-items:center;gap:.5rem;flex-shrink:0;}
.stat-row{display:flex;gap:.4rem;flex-wrap:wrap;align-items:center;}
.mem-stat{
  font-family:'Cinzel',serif;
  font-size:.95rem;
  color:var(--parch-d);
  background:var(--surface);
  border:1px solid var(--border);
  border-radius:5px;
  padding:.35rem .65rem;
  white-space:nowrap;
}
.mem-hit{color:var(--txt-d);font-size:.9rem;}
.mem-hit.hit-good{color:#6a9a4a;border-color:rgba(106,154,74,.4);}
.mem-hit.hit-bad{color:#c44c22;border-color:rgba(196,76,34,.4);}
.mem-bulky-warn{color:#c44c22;font-size:.85rem;border-color:rgba(196,76,34,.4);}
.sac-btn{background:rgba(100,30,30,.4);border:1px solid rgba(160,50,50,.5);color:#c06060;border-radius:4px;width:22px;height:22px;font-size:.8rem;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:all .15s;flex-shrink:0;}
.sac-btn:hover{background:rgba(160,50,50,.5);color:#e08080;border-color:#c06060;}
.mem-cost{
  font-family:'Cinzel',serif;
  font-size:.8rem;
  color:var(--gold);
  font-weight:600;
  white-space:nowrap;
}
.del-btn{
  background:none;
  border:none;
  color:var(--rust);
  cursor:pointer;
  font-size:.85rem;
  padding:.2rem .4rem;
  border-radius:4px;
  transition:background .15s,color .15s;
  line-height:1;
}
.del-btn:hover{background:rgba(155,59,26,.2);color:var(--rust-l);}
.chevron{
  color:var(--txt-d);
  font-size:.75rem;
  transition:transform .2s,color .2s;
}
.chevron.open{transform:rotate(180deg);color:var(--gold);}

/* ─── MEMBER BODY ─── */
.mem-body{border-top:1px solid var(--border);}

.race-bar{
  background:rgba(0,0,0,.2);
  border-bottom:1px solid var(--border);
  padding:.55rem 1.1rem;
  font-size:.82rem;
  color:var(--txt-d);
  font-style:italic;
  display:flex;
  gap:.5rem;
}
.race-bar-lbl{
  font-family:'Cinzel',serif;
  font-style:normal;
  font-size:.65rem;
  text-transform:uppercase;
  letter-spacing:.1em;
  color:var(--gold-d);
  white-space:nowrap;
  align-self:center;
}

/* ─── TABS ─── */
.tabs{
  display:flex;
  border-bottom:1px solid var(--border);
  background:rgba(0,0,0,.15);
  overflow-x:auto;
}
.tab-btn{
  background:none;
  border:none;
  border-bottom:2px solid transparent;
  color:var(--txt-d);
  font-family:'Cinzel',serif;
  font-size:.65rem;
  text-transform:uppercase;
  letter-spacing:.12em;
  padding:.65rem 1rem;
  cursor:pointer;
  transition:color .15s,border-color .15s;
  white-space:nowrap;
}
.tab-btn:hover{color:var(--txt);}
.tab-btn.active{color:var(--gold);border-bottom-color:var(--gold);}

.tab-content{padding:1.1rem 1.1rem;}
.sec-note{
  font-style:italic;
  color:var(--txt-d);
  font-size:.85rem;
  margin-bottom:.9rem;
  padding-bottom:.7rem;
  border-bottom:1px solid var(--border);
}

/* ─── ITEM ROWS ─── */
.item-list{display:flex;flex-direction:column;gap:.4rem;}

.item-row{
  display:flex;
  align-items:flex-start;
  gap:.65rem;
  background:var(--surface);
  border:1px solid var(--border);
  border-radius:6px;
  padding:.55rem .8rem;
  cursor:pointer;
  transition:all .15s;
}
.item-row:hover:not(.disabled){border-color:var(--border-l);background:var(--s2);}
.item-row.owned{
  background:linear-gradient(135deg,rgba(200,149,42,.12),rgba(200,149,42,.05));
  border-color:var(--gold-d);
}
.item-row.disabled{opacity:.38;cursor:not-allowed;}
.item-row.owned.disabled{opacity:.6;}

.ir-check{
  font-size:.8rem;
  color:var(--txt-d);
  margin-top:.1rem;
  width:14px;
  flex-shrink:0;
}
.item-row.owned .ir-check{color:var(--gold);}

.ir-info{flex:1;min-width:0;}
.ir-name{
  font-family:'Crimson Text',serif;
  font-weight:600;
  font-size:.95rem;
  color:var(--parch);
  display:block;
}
.item-row.owned .ir-name{color:var(--parch);}
.ir-meta{
  font-size:.78rem;
  color:var(--txt-d);
  display:block;
  margin-top:.1rem;
  line-height:1.4;
}
.ir-cost{
  font-family:'Cinzel',serif;
  font-size:.72rem;
  color:var(--gold-d);
  white-space:nowrap;
  margin-top:.1rem;
  flex-shrink:0;
}
.item-row.owned .ir-cost{color:var(--gold);}
.ir-block{
  font-family:'Cinzel',serif;
  font-size:.58rem;
  color:var(--rust-l);
  background:rgba(155,59,26,.15);
  border:1px solid var(--rust);
  border-radius:3px;
  padding:.15rem .4rem;
  white-space:nowrap;
  flex-shrink:0;
}

.kw{
  display:inline-block;
  background:rgba(120,80,20,.2);
  border:1px solid var(--gold-d);
  border-radius:3px;
  padding:.05rem .35rem;
  font-size:.65rem;
  font-family:'Cinzel',serif;
  color:var(--gold-d);
  margin-left:.25rem;
  font-style:normal;
}

/* ─── AUGMENT GRID ─── */
.aug-grid{
  display:grid;
  grid-template-columns:repeat(auto-fill,minmax(210px,1fr));
  gap:.65rem;
  margin-bottom:1rem;
}
.aug-card{
  background:var(--surface);
  border:1px solid var(--border);
  border-radius:7px;
  padding:.8rem .9rem;
  cursor:pointer;
  transition:all .15s;
}
.aug-card:hover:not(.disabled){border-color:var(--border-l);}
.aug-card.active{
  border-color:var(--gold-d);
  background:linear-gradient(135deg,rgba(200,149,42,.12),rgba(200,149,42,.04));
}
.aug-card.disabled{opacity:.38;cursor:not-allowed;}
.aug-name{
  font-family:'Cinzel',serif;
  font-size:.82rem;
  color:var(--parch);
  margin-bottom:.35rem;
  display:flex;
  justify-content:space-between;
  align-items:baseline;
}
.aug-card.active .aug-name{color:var(--gold);}
.aug-cost{font-size:.7rem;color:var(--gold-d);}
.aug-eff{font-size:.8rem;color:var(--txt-d);line-height:1.45;}
.aug-blocked{
  font-size:.7rem;
  color:var(--rust-l);
  margin-top:.4rem;
  font-style:italic;
}

.mh-controls{display:flex;align-items:center;gap:.5rem .75rem;margin-top:.4rem;flex-wrap:wrap;}
.level-wrap{display:flex;align-items:center;gap:.35rem;flex-wrap:wrap;}
.level-lbl{font-family:'Cinzel',serif;font-size:.6rem;text-transform:uppercase;letter-spacing:.1em;color:var(--gold-d);white-space:nowrap;}
.xp-level-badge{font-family:'Cinzel',serif;font-size:.72rem;font-weight:700;color:var(--gold-l);background:rgba(200,149,42,.12);border:1px solid var(--gold-d);border-radius:4px;padding:.1rem .4rem;white-space:nowrap;}
.xp-boxes{display:grid;grid-template-columns:repeat(10,12px);gap:2px;}
.xp-box{width:12px;height:12px;border-radius:2px;border:1px solid var(--border-l);background:var(--surface);cursor:pointer;transition:background .12s,border-color .12s;flex-shrink:0;}
.xp-box.filled{background:var(--gold-d);border-color:var(--gold);}
.xp-box.threshold{border-color:#6a9040;}
.xp-box.filled.threshold{background:#4a7a28;border-color:#8ac040;}
.xp-box:hover{border-color:var(--gold);}
.xp-total{font-family:'Cinzel',serif;font-size:.6rem;color:var(--txt-d);white-space:nowrap;}
.xp-cap-note{font-family:'Cinzel',serif;font-size:.58rem;color:var(--rust-l);font-style:italic;white-space:nowrap;}

.leader-badge-btn{
  background:none;border:1px solid var(--border-l);
  color:var(--txt-d);cursor:pointer;
  font-family:'Cinzel',serif;font-size:.58rem;
  text-transform:uppercase;letter-spacing:.1em;
  padding:.15rem .4rem;border-radius:3px;
  opacity:.4;transition:all .2s;
  line-height:inherit;
}
.leader-badge-btn:hover{opacity:.7;border-color:var(--gold-d);color:var(--parch);}
.leader-badge-btn.is-leader{
  opacity:1;color:#e0d060;border-color:#8a7a20;
  background:rgba(200,180,40,.08);
  text-shadow:0 0 8px rgba(220,180,40,.7);
  box-shadow:0 0 6px rgba(220,180,40,.25);
}
.leader-crown:hover{opacity:.55;filter:grayscale(.4);}
.leader-crown.active{
  opacity:1;filter:grayscale(0);
  text-shadow:0 0 8px rgba(220,180,40,.9), 0 0 18px rgba(220,180,40,.45);
}


/* Restriction notice */
.restrict-notice{
  background:rgba(155,59,26,.12);
  border:1px solid var(--rust);
  border-radius:6px;
  padding:.8rem 1rem;
  color:var(--rust-l);
  font-style:italic;
  font-size:.88rem;
}

/* ─── MODAL ─── */
.backdrop{
  position:fixed;
  inset:0;
  background:rgba(0,0,0,.78);
  z-index:100;
  display:flex;
  align-items:center;
  justify-content:center;
  padding:1.5rem;
  backdrop-filter:blur(3px);
}
.modal{
  background:var(--s2);
  border:1px solid var(--border-l);
  border-radius:12px;
  max-width:720px;
  width:100%;
  max-height:85vh;
  overflow-y:auto;
  box-shadow:0 20px 60px rgba(0,0,0,.8);
}
.modal-hdr{
  display:flex;
  justify-content:space-between;
  align-items:center;
  padding:1.25rem 1.5rem 0;
}
.modal-hdr h2{
  font-family:'Cinzel',serif;
  font-size:1.05rem;
  color:var(--gold);
  text-transform:uppercase;
  letter-spacing:.12em;
}
.close-btn{
  background:none;
  border:none;
  color:var(--txt-d);
  font-size:1.1rem;
  cursor:pointer;
  padding:.2rem .5rem;
  border-radius:4px;
  transition:color .15s,background .15s;
}
.close-btn:hover{color:var(--txt);background:rgba(255,255,255,.05);}
.modal-sub{
  padding:.4rem 1.5rem .9rem;
  font-size:.82rem;
  font-style:italic;
  color:var(--parch-d);
  border-bottom:1px solid var(--border);
}

.race-grid{
  display:grid;
  grid-template-columns:repeat(4,1fr);
  gap:.7rem;
  padding:1.1rem 1.5rem 1.5rem;
}
.race-card{
  background:var(--surface);
  border:1px solid var(--border);
  border-radius:8px;
  padding:.9rem 1rem;
  cursor:pointer;
  transition:all .15s;
  position:relative;
  overflow:hidden;
}
.race-card:hover:not(.disabled){
  border-color:var(--gold-d);
}
.race-card.disabled{opacity:.38;cursor:not-allowed;}
.rc-hover{
  position:absolute;
  inset:0;
  display:flex;
  flex-direction:column;
  opacity:0;
  transition:opacity .15s;
  pointer-events:none;
  border-radius:7px;
  overflow:hidden;
}
.race-card:hover:not(.disabled) .rc-hover{
  opacity:1;
  pointer-events:all;
}
@keyframes flash-green{0%{background:rgba(42,160,80,.7)}100%{background:rgba(20,20,20,.6)}}
@keyframes flash-red{0%{background:rgba(160,42,42,.7)}100%{background:rgba(20,20,20,.6)}}
.rc-add{
  flex:1;
  display:flex;
  align-items:center;
  justify-content:center;
  font-size:1.6rem;
  font-weight:bold;
  color:var(--parch);
  background:rgba(20,20,20,.6);
  cursor:pointer;
  transition:background .1s;
}
.rc-add:hover{ background:rgba(40,40,40,.75); }
.rc-add.flash{ animation:flash-green .4s ease-out forwards; }
.rc-remove{
  flex:1;
  display:flex;
  align-items:center;
  justify-content:center;
  font-size:1.6rem;
  font-weight:bold;
  color:var(--parch);
  background:rgba(20,20,20,.6);
  cursor:pointer;
  transition:background .1s;
}
.rc-remove:hover{ background:rgba(40,40,40,.75); }
.rc-remove.flash{ animation:flash-red .4s ease-out forwards; }
.rc-divider{
  height:1px;
  background:rgba(255,255,255,.15);
  flex-shrink:0;
}
.rc-name{
  font-family:'Cinzel',serif;
  font-size:.9rem;
  color:var(--parch);
  margin-bottom:.4rem;
}
.rc-stats{
  display:flex;
  gap:.6rem;
  margin-bottom:.45rem;
}
.rc-stat{
  font-family:'Cinzel',serif;
  font-size:.68rem;
  color:var(--gold-d);
  background:var(--s3);
  border:1px solid var(--border);
  border-radius:3px;
  padding:.1rem .35rem;
}
.rc-special{
  font-size:.78rem;
  color:var(--txt-d);
  font-style:italic;
  line-height:1.4;
}
.rc-limit{
  margin-top:.4rem;
  font-family:'Cinzel',serif;
  font-size:.62rem;
  text-transform:uppercase;
  letter-spacing:.1em;
  color:var(--rust-l);
}

/* ─── KEYWORDS PANEL ─── */
.kw-panel{
  background:var(--surface);
  border:1px solid var(--border);
  border-radius:8px;
  overflow:hidden;
}
.kw-title{
  font-family:'Cinzel',serif;
  font-size:.65rem;
  text-transform:uppercase;
  letter-spacing:.14em;
  color:var(--gold-d);
  padding:.6rem .9rem;
  border-bottom:1px solid var(--border);
  background:var(--s2);
}
.kw-list{padding:.6rem .9rem;display:flex;flex-direction:column;gap:.45rem;}
.kw-entry{}
.kw-word{
  font-family:'Cinzel',serif;
  font-size:.7rem;
  color:var(--gold-d);
  font-style:normal;
}
.kw-def{
  font-size:.75rem;
  color:var(--txt-d);
  line-height:1.45;
}

/* ─── SIDEBAR ─── */
/*.sidebar-removed*/
.sidebar_unused{
  position:sticky;
  top:1.5rem;
  display:flex;
  flex-direction:column;
  gap:1.1rem;
}
.sc{
  background:linear-gradient(150deg,var(--s2),var(--surface));
  border:1px solid var(--border-l);
  border-radius:10px;
  padding:1.1rem 1.25rem;
  box-shadow:0 6px 24px var(--shadow);
}
.sc-title{
  font-family:'Cinzel',serif;
  font-size:.68rem;
  text-transform:uppercase;
  letter-spacing:.15em;
  color:var(--gold-d);
  padding-bottom:.65rem;
  margin-bottom:.65rem;
  border-bottom:1px solid var(--border);
}
.sc-empty{font-style:italic;color:var(--txt-d);font-size:.85rem;text-align:center;padding:.5rem 0;}
.sc-row{
  display:flex;
  justify-content:space-between;
  align-items:baseline;
  padding:.35rem 0;
  border-bottom:1px solid rgba(54,42,28,.5);
  font-size:.85rem;
}
.sc-row:last-of-type{border-bottom:none;}
.sc-rname{color:var(--parch-d);}
.sc-race{font-size:.72rem;color:var(--txt-d);margin-left:.3rem;}
.sc-cost{font-family:'Cinzel',serif;font-size:.75rem;color:var(--gold-d);}

.sc-total{
  display:flex;
  justify-content:space-between;
  align-items:baseline;
  margin-top:.7rem;
  padding-top:.7rem;
  border-top:1px solid var(--gold-d);
  font-family:'Cinzel',serif;
}
.sc-total-lbl{font-size:.65rem;text-transform:uppercase;letter-spacing:.12em;color:var(--gold-d);}
.sc-total-val{font-size:1.25rem;font-weight:700;color:var(--gold-l);}
.sc-total-val.danger{color:#d84040;}

.detail-block{
  padding:.6rem 0;
  border-bottom:1px solid var(--border);
  font-size:.8rem;
}
.detail-block:last-child{border-bottom:none;padding-bottom:0;}
.db-name{font-family:'Cinzel',serif;font-size:.78rem;color:var(--parch-d);margin-bottom:.2rem;}
.db-line{color:var(--txt-d);line-height:1.6;}

.disband-btn{
  background:linear-gradient(135deg,rgba(100,15,15,.8),rgba(120,20,20,.8));
  border:1px solid var(--rust);
  border-radius:6px;
  color:#d06060;
  font-family:'Cinzel',serif;
  font-size:.68rem;
  text-transform:uppercase;
  letter-spacing:.12em;
  padding:.6rem;
  width:100%;
  cursor:pointer;
  transition:all .18s;
}
.disband-btn:hover{background:linear-gradient(135deg,rgba(130,20,20,.9),rgba(155,30,30,.9));color:#e08080;}

.sec-head{
  font-family:'Cinzel',serif;
  font-size:.65rem;
  text-transform:uppercase;
  letter-spacing:.14em;
  color:var(--gold-d);
  display:flex;
  align-items:center;
  gap:.6rem;
  margin-bottom:.85rem;
}
.sec-head::after{content:'';flex:1;height:1px;background:var(--border);}

/* ─── FACTION BANNER ─── */
.faction-banner{
  position:relative;
  border-radius:8px;
  padding:.85rem 1.1rem;
  margin-bottom:1.25rem;
  border:1px solid;
  display:flex;
  align-items:flex-start;
  gap:.85rem;
  overflow:hidden;
  animation:slideIn .3s ease;
}
.faction-banner.active{
  background:linear-gradient(135deg,rgba(200,149,42,.1),rgba(200,149,42,.04));
  border-color:var(--gold-d);
}
.faction-banner.inactive{
  background:rgba(0,0,0,.15);
  border-color:var(--border);
  opacity:.55;
}
.faction-banner::before{
  content:'';
  position:absolute;
  inset:0;
  background:linear-gradient(90deg,rgba(200,149,42,.06) 0%,transparent 60%);
  pointer-events:none;
}
.fb-icon{
  font-size:1.6rem;
  flex-shrink:0;
  filter:drop-shadow(0 0 6px rgba(200,149,42,.3));
}
.faction-banner.inactive .fb-icon{filter:none;opacity:.4;}
.fb-body{flex:1;min-width:0;}
.fb-top{
  display:flex;
  align-items:center;
  gap:.6rem;
  margin-bottom:.3rem;
  flex-wrap:wrap;
}
.fb-label{
  font-family:'Cinzel',serif;
  font-size:.78rem;
  font-weight:700;
  color:var(--gold-l);
  letter-spacing:.06em;
}
.faction-banner.inactive .fb-label{color:var(--txt-d);}
.fb-tag{
  font-family:'Cinzel',serif;
  font-size:.58rem;
  text-transform:uppercase;
  letter-spacing:.12em;
  padding:.12rem .45rem;
  border-radius:3px;
  border:1px solid;
}
.fb-tag.unlocked{color:#8ac060;border-color:#4a7a28;background:rgba(74,122,40,.15);}
.fb-tag.locked{color:var(--txt-d);border-color:var(--border);background:transparent;}
.fb-bonus{
  font-size:.85rem;
  color:var(--parch-d);
  font-style:italic;
  line-height:1.45;
}
.faction-banner.inactive .fb-bonus{color:var(--txt-d);}
.fb-hint{
  font-family:'Cinzel',serif;
  font-size:.62rem;
  color:var(--txt-d);
  margin-top:.3rem;
}

/* ─── TALENT TREE ─── */
.talent-wrap{display:flex;flex-direction:column;gap:1rem;}
.talent-points-bar{
  display:flex;align-items:center;gap:.75rem;
  background:rgba(0,0,0,.2);border:1px solid var(--border-l);
  border-radius:6px;padding:.55rem .9rem;flex-wrap:wrap;
}
.tp-label{font-family:'Cinzel',serif;font-size:.62rem;text-transform:uppercase;letter-spacing:.12em;color:var(--gold-d);}
.tp-dots{display:flex;gap:4px;}
.tp-dot{width:11px;height:11px;border-radius:50%;border:1px solid var(--border-l);background:var(--surface);transition:background .15s,border-color .15s;}
.tp-dot.used{background:var(--gold-d);border-color:var(--gold);}
.tp-dot.available{border-color:var(--gold-d);}
.tp-text{font-family:'Cinzel',serif;font-size:.65rem;color:var(--txt-d);margin-left:.25rem;}
.tutor-picker{display:flex;align-items:center;gap:.75rem;flex-wrap:wrap;background:rgba(255,200,50,.06);border:1px solid var(--gold-d);border-radius:6px;padding:.55rem .9rem;}
.tutor-label{font-family:'Cinzel',serif;font-size:.65rem;color:var(--gold);white-space:nowrap;}
.tutor-select{background:var(--s2);border:1px solid var(--border-l);border-radius:4px;color:var(--txt);font-size:.8rem;padding:.3rem .5rem;flex:1;min-width:140px;}
.tutor-select:focus{outline:none;border-color:var(--gold-d);}
.cat-tabs{display:flex;gap:.4rem;flex-wrap:wrap;}
.cat-tab{
  display:flex;align-items:center;gap:.35rem;
  background:var(--surface);border:1px solid var(--border);
  border-radius:6px;padding:.4rem .65rem;cursor:pointer;
  transition:all .15s;font-family:'Cinzel',serif;font-size:.6rem;
  text-transform:uppercase;letter-spacing:.1em;color:var(--txt-d);
}
.cat-tab:hover{border-color:var(--border-l);color:var(--txt);}
.cat-tab.active{border-color:var(--gold-d);background:rgba(200,149,42,.1);color:var(--gold);}
.cat-tab-icon{font-size:.9rem;}
.cat-has-pick{width:6px;height:6px;border-radius:50%;background:var(--gold-d);flex-shrink:0;}
.tier-section{display:flex;flex-direction:column;gap:.5rem;}
.tier-header{
  display:flex;align-items:center;gap:.5rem;
  font-family:'Cinzel',serif;font-size:.58rem;
  text-transform:uppercase;letter-spacing:.13em;
}
.tier-label{color:var(--gold-d);}
.tier-locked-badge{
  font-size:.55rem;color:var(--rust-l);
  border:1px solid var(--rust);border-radius:3px;
  padding:.05rem .3rem;background:rgba(155,59,26,.1);
}
.tier-cards{display:flex;gap:.4rem;flex-wrap:wrap;}
.talent-card{
  background:var(--surface);border:1px solid var(--border);
  border-radius:7px;padding:.6rem .75rem;cursor:pointer;
  transition:all .15s;flex:1;min-width:140px;max-width:200px;
  position:relative;
}
.talent-card:hover:not(.t-locked):not(.t-no-points){border-color:var(--border-l);background:var(--s2);}
.talent-card.t-selected{
  border-color:var(--gold-d);
  background:linear-gradient(135deg,rgba(200,149,42,.14),rgba(200,149,42,.04));
}
.talent-card.t-locked{opacity:.3;cursor:not-allowed;}
.talent-card.t-no-points{opacity:.5;cursor:not-allowed;}
.tc-name{
  font-family:'Cinzel',serif;font-size:.75rem;
  color:var(--parch);margin-bottom:.3rem;
  display:flex;justify-content:space-between;align-items:center;gap:.3rem;
}
.talent-card.t-selected .tc-name{color:var(--gold);}
.tc-check{font-size:.7rem;color:var(--gold);flex-shrink:0;}
.tc-desc{font-size:.76rem;color:var(--txt-d);line-height:1.45;}
.tier-connector{display:flex;align-items:center;padding:.1rem 0;}
.tier-connector::before{content:'';flex:1;height:1px;background:var(--border);opacity:.5;}
.tier-arrow{font-size:.65rem;color:var(--border-l);margin:0 .4rem;}
.tier-connector::after{content:'';flex:1;height:1px;background:var(--border);opacity:.5;}

/* ─── MINIONS ─── */
.minion-roster{display:flex;flex-direction:column;gap:.6rem;margin-bottom:.75rem;}
.minion-card{background:linear-gradient(150deg,#141018,#1a1520);border:1px solid #3a2d4a;border-radius:10px;overflow:hidden;box-shadow:0 4px 18px rgba(0,0,0,.4);animation:slideIn .22s ease;}
.minion-head{display:flex;align-items:center;gap:.75rem;padding:.75rem 1.1rem;}
.minion-icon{font-size:1.3rem;flex-shrink:0;}
.minion-info{flex:1;min-width:0;}
.minion-name-input{background:transparent;border:none;border-bottom:1px dashed #3a2d4a;color:#c8a8e8;font-family:'Cinzel',serif;font-size:.9rem;padding:.1rem 0;width:100%;transition:border-color .2s;}
.minion-name-input:focus{outline:none;border-bottom-color:#7a4a9a;}
.minion-type-lbl{font-family:'Cinzel',serif;font-size:.6rem;text-transform:uppercase;letter-spacing:.1em;color:#7a5a9a;margin-top:.15rem;}
.minion-stats{display:flex;gap:.4rem;align-items:center;flex-shrink:0;}
.minion-stat{font-family:'Cinzel',serif;font-size:.68rem;color:#a888c8;background:#120f18;border:1px solid #3a2d4a;border-radius:4px;padding:.2rem .4rem;white-space:nowrap;}
.minion-cost{font-family:'Cinzel',serif;font-size:.8rem;color:#a060d0;font-weight:600;white-space:nowrap;}
.minion-special{padding:.5rem 1.1rem .7rem;font-size:.78rem;color:#7a5a9a;font-style:italic;border-top:1px solid #2a1f3a;}
.owner-select{display:flex;align-items:center;gap:.5rem;padding:.5rem 1.1rem .7rem;border-top:1px solid #2a1f3a;}
.owner-lbl{font-family:'Cinzel',serif;font-size:.6rem;text-transform:uppercase;letter-spacing:.1em;color:#7a5a9a;white-space:nowrap;}
.owner-dropdown{background:#120f18;border:1px solid #3a2d4a;border-radius:4px;color:#c8a8e8;font-family:'Cinzel',serif;font-size:.75rem;padding:.25rem .5rem;flex:1;cursor:pointer;}
.owner-dropdown:focus{outline:none;border-color:#7a4a9a;}
.minion-modal-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:.7rem;padding:1.1rem 1.5rem 1.5rem;}
.minion-modal-card{background:linear-gradient(150deg,#141018,#1a1520);border:1px solid #3a2d4a;border-radius:8px;padding:.9rem 1rem;cursor:pointer;transition:all .15s;}
.minion-modal-card:hover:not(.disabled){border-color:#7a4a9a;transform:translateY(-2px);}
.minion-modal-card.disabled{opacity:.38;cursor:not-allowed;}
.mm-icon{font-size:1.5rem;display:block;margin-bottom:.4rem;}
.mm-name{font-family:'Cinzel',serif;font-size:.88rem;color:#c8a8e8;margin-bottom:.4rem;}
.mm-stats{display:flex;gap:.5rem;margin-bottom:.45rem;flex-wrap:wrap;}
.mm-stat{font-family:'Cinzel',serif;font-size:.65rem;color:#7a5a9a;background:#120f18;border:1px solid #3a2d4a;border-radius:3px;padding:.1rem .35rem;}
.mm-special{font-size:.75rem;color:#5a4a7a;font-style:italic;line-height:1.4;}
.mm-limit{margin-top:.4rem;font-family:'Cinzel',serif;font-size:.62rem;text-transform:uppercase;letter-spacing:.1em;color:var(--rust-l);}
.add-minion-btn{width:100%;background:linear-gradient(135deg,#141018,#1a1520);border:1px dashed #3a2d4a;border-radius:8px;color:#5a4a7a;font-family:'Cinzel',serif;font-size:.78rem;text-transform:uppercase;letter-spacing:.15em;padding:.75rem;cursor:pointer;transition:all .2s;}
.add-minion-btn:hover{border-color:#7a4a9a;color:#a060d0;}
.sc-minion{font-size:.72rem;color:#7a5a9a;font-style:italic;}

/* ─── EXPORT BUTTONS ─── */
.export-btns{display:flex;gap:.6rem;flex-wrap:wrap;}
.export-btn{
  flex:1;min-width:100px;
  background:linear-gradient(135deg,var(--s2),var(--surface));
  border:1px solid var(--border-l);border-radius:6px;
  color:var(--parch-d);font-family:'Cinzel',serif;font-size:.65rem;
  text-transform:uppercase;letter-spacing:.12em;padding:.6rem .5rem;
  cursor:pointer;transition:all .18s;text-align:center;
}
.export-btn:hover{border-color:var(--gold-d);color:var(--gold);}
.export-btn.copied{border-color:#4a7a28;color:#8ac060;}

/* ─── IMPORT MODAL ─── */
.import-modal{
  background:#1a1410;border:1px solid var(--border-l);border-radius:12px;
  width:min(560px,96vw);padding:1.75rem 2rem;
  box-shadow:0 20px 60px rgba(0,0,0,.8);
}
.import-title{font-family:'Cinzel',serif;font-size:1rem;color:var(--gold-l);margin-bottom:.3rem;}
.import-sub{font-size:.8rem;color:var(--txt-d);font-style:italic;margin-bottom:1rem;}
.import-textarea{
  width:100%;height:200px;background:var(--surface);border:1px solid var(--border-l);
  border-radius:6px;color:var(--parch);font-family:'Crimson Text',serif;font-size:.85rem;
  padding:.75rem;resize:vertical;transition:border-color .15s;line-height:1.5;
}
.import-textarea:focus{outline:none;border-color:var(--gold-d);}
.import-actions{display:flex;gap:.6rem;margin-top:.85rem;}
.import-confirm{
  flex:1;background:linear-gradient(135deg,rgba(200,149,42,.2),rgba(200,149,42,.08));
  border:1px solid var(--gold-d);border-radius:6px;color:var(--gold);
  font-family:'Cinzel',serif;font-size:.68rem;text-transform:uppercase;
  letter-spacing:.12em;padding:.6rem;cursor:pointer;transition:all .18s;
}
.import-confirm:hover{background:linear-gradient(135deg,rgba(200,149,42,.3),rgba(200,149,42,.14));}
.import-cancel{
  background:transparent;border:1px solid var(--border-l);border-radius:6px;
  color:var(--txt-d);font-family:'Cinzel',serif;font-size:.68rem;
  text-transform:uppercase;letter-spacing:.12em;padding:.6rem 1rem;cursor:pointer;
  transition:all .18s;
}
.import-cancel:hover{border-color:var(--rust);color:var(--rust-l);}
.import-error{margin-top:.6rem;font-size:.78rem;color:#d06060;font-style:italic;}

/* ─── PRINT MODAL ─── */
.print-modal{
  background:#1a1410;
  border:1px solid var(--border-l);
  border-radius:12px;
  width:min(820px,96vw);
  max-height:90vh;
  overflow-y:auto;
  padding:2rem 2.5rem;
  box-shadow:0 20px 60px rgba(0,0,0,.8);
}
.pm-header{text-align:center;margin-bottom:1.5rem;padding-bottom:1.2rem;border-bottom:2px solid var(--gold-d);}
.pm-title{font-family:'Cinzel Decorative',serif;font-size:1.6rem;color:var(--gold-l);margin-bottom:.3rem;}
.pm-sub{font-family:'Cinzel',serif;font-size:.7rem;text-transform:uppercase;letter-spacing:.2em;color:var(--gold-d);}
.pm-faction{margin-top:.5rem;font-size:.85rem;color:var(--parch-d);font-style:italic;}
.pm-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(320px,1fr));gap:1rem;margin-bottom:1.5rem;}
.pm-card{background:var(--s2);border:1px solid var(--border-l);border-radius:8px;padding:1rem 1.2rem;}
.pm-card-name{font-family:'Cinzel',serif;font-size:.95rem;color:var(--gold);margin-bottom:.5rem;display:flex;justify-content:space-between;align-items:baseline;}
.pm-card-level{font-family:'Cinzel',serif;font-size:.7rem;color:var(--gold-d);}
.pm-row{display:flex;gap:.4rem;margin-bottom:.3rem;font-size:.8rem;flex-wrap:wrap;}
.pm-lbl{font-family:'Cinzel',serif;font-size:.62rem;text-transform:uppercase;letter-spacing:.1em;color:var(--gold-d);white-space:nowrap;}
.pm-val{color:var(--parch-d);line-height:1.4;}
.pm-tag{font-size:.72rem;color:var(--txt-d);background:var(--surface);border:1px solid var(--border);border-radius:3px;padding:.1rem .35rem;}
.pm-talent-list{margin-top:.4rem;}
.pm-talent{font-size:.75rem;color:var(--txt-d);padding:.15rem 0;border-bottom:1px solid var(--border);display:flex;gap:.4rem;align-items:baseline;}
.pm-talent:last-child{border-bottom:none;}
.pm-talent-name{font-family:'Cinzel',serif;font-size:.68rem;color:var(--parch-d);white-space:nowrap;}
.pm-minions{margin-bottom:1.5rem;}
.pm-minion-row{display:flex;justify-content:space-between;align-items:center;padding:.4rem 0;border-bottom:1px solid var(--border);font-size:.82rem;}
.pm-minion-row:last-child{border-bottom:none;}
.pm-footer{text-align:center;font-family:'Cinzel',serif;font-size:.6rem;text-transform:uppercase;letter-spacing:.2em;color:var(--txt-d);padding-top:1rem;border-top:1px solid var(--border);}
.pm-print-btn{
  display:block;width:100%;margin-top:1rem;
  background:linear-gradient(135deg,rgba(200,149,42,.2),rgba(200,149,42,.08));
  border:1px solid var(--gold-d);border-radius:6px;
  color:var(--gold);font-family:'Cinzel',serif;font-size:.75rem;
  text-transform:uppercase;letter-spacing:.15em;padding:.75rem;
  cursor:pointer;transition:all .18s;
}
.pm-print-btn:hover{background:linear-gradient(135deg,rgba(200,149,42,.3),rgba(200,149,42,.12));}

/* ─── PRINT MEDIA ─── */
@media print {
  body > * { display:none !important; }
  .print-backdrop { display:block !important; position:static !important; background:none !important; overflow:visible !important; }
  .print-modal {
    display:block !important;
    position:static !important;
    width:100% !important;
    max-height:none !important;
    height:auto !important;
    overflow:visible !important;
    border:none !important;
    padding:1cm !important;
    background:white !important;
    box-shadow:none !important;
    color:#222 !important;
  }
  .pm-grid { display:grid !important; grid-template-columns:repeat(2,1fr) !important; }
  .pm-header { border-bottom:2px solid #333 !important; }
  .pm-title { color:#222 !important; }
  .pm-sub, .pm-card-level, .pm-lbl { color:#555 !important; }
  .pm-val, .pm-faction, .pm-talent-name { color:#333 !important; }
  .pm-card {
    background:#f8f6f2 !important;
    border:1px solid #ccc !important;
    break-inside:avoid;
    page-break-inside:avoid;
  }
  .pm-tag { background:#eee !important; border-color:#ccc !important; color:#555 !important; }
  .pm-footer, .pm-print-btn { display:none !important; }
  * { -webkit-print-color-adjust:exact; print-color-adjust:exact; }
  @page { margin:1cm; }
}

/* ─── MARKET ─── */
.market-wrap{display:flex;flex-direction:column;gap:.75rem;}
.market-filter{display:flex;gap:.35rem;flex-wrap:wrap;margin-bottom:.25rem;}
.mf-btn{
  background:var(--surface);border:1px solid var(--border);border-radius:5px;
  color:var(--txt-d);font-family:'Cinzel',serif;font-size:.58rem;
  text-transform:uppercase;letter-spacing:.1em;padding:.3rem .6rem;cursor:pointer;transition:all .15s;
}
.mf-btn:hover{border-color:var(--border-l);color:var(--txt);}
.mf-btn.active{border-color:var(--gold-d);background:rgba(200,149,42,.1);color:var(--gold);}
.market-grid{display:flex;flex-direction:column;gap:.45rem;}
.market-card{
  background:var(--s2);border:1px solid var(--border);border-radius:8px;
  padding:.65rem .85rem;display:flex;align-items:flex-start;gap:.75rem;
  cursor:pointer;transition:all .15s;position:relative;
}
.market-card:hover:not(.mc-owned):not(.mc-cant-afford){border-color:var(--border-l);background:var(--s3);}
.market-card.mc-owned{border-color:var(--gold-d);background:linear-gradient(135deg,rgba(200,149,42,.1),rgba(200,149,42,.03));}
.market-card.mc-cant-afford{opacity:.45;cursor:not-allowed;}
.mc-rarity{
  display:flex;flex-direction:column;align-items:center;gap:.1rem;flex-shrink:0;
  background:var(--surface);border:1px solid var(--border-l);border-radius:6px;
  padding:.3rem .4rem;min-width:34px;
}
.mc-rarity-num{font-family:'Cinzel',serif;font-size:.9rem;font-weight:700;color:var(--parch);}
.mc-rarity-lbl{font-family:'Cinzel',serif;font-size:.44rem;text-transform:uppercase;letter-spacing:.1em;color:var(--txt-d);}
.market-card.mc-owned .mc-rarity{border-color:var(--gold-d);}
.market-card.mc-owned .mc-rarity-num{color:var(--gold);}
.mc-body{flex:1;min-width:0;}
.mc-top{display:flex;align-items:baseline;gap:.5rem;flex-wrap:wrap;margin-bottom:.2rem;}
.mc-name{font-family:'Cinzel',serif;font-size:.82rem;color:var(--parch);}
.market-card.mc-owned .mc-name{color:var(--gold);}
.mc-owned-badge{font-size:.6rem;color:var(--gold);background:rgba(200,149,42,.15);border:1px solid var(--gold-d);border-radius:3px;padding:.05rem .3rem;font-family:'Cinzel',serif;text-transform:uppercase;letter-spacing:.08em;}
.mc-cost{font-family:'Cinzel',serif;font-size:.7rem;color:var(--gold-d);margin-left:auto;white-space:nowrap;flex-shrink:0;}
.mc-stats{display:flex;gap:.35rem;flex-wrap:wrap;margin-bottom:.25rem;}
.mc-stat{font-family:'Cinzel',serif;font-size:.62rem;color:var(--txt-d);background:var(--surface);border:1px solid var(--border);border-radius:3px;padding:.1rem .3rem;}
.mc-note{font-size:.76rem;color:var(--txt-d);margin-bottom:.2rem;line-height:1.4;}
.mc-info{font-size:.72rem;color:var(--parch-dd);font-style:italic;line-height:1.4;}
.mc-keywords{display:flex;gap:.3rem;flex-wrap:wrap;margin-top:.25rem;}
.mc-kw{font-size:.62rem;color:var(--rust-l);border:1px solid rgba(155,59,26,.4);border-radius:3px;padding:.05rem .3rem;background:rgba(155,59,26,.08);}
.market-roll-hint{
  background:rgba(0,0,0,.2);border:1px solid var(--border);border-radius:6px;
  padding:.5rem .75rem;font-size:.75rem;color:var(--txt-d);font-style:italic;text-align:center;
}

/* ─── IMAGES ─── */
.file-input{display:none;}
.pm-banner{width:80px;height:80px;object-fit:cover;border-radius:8px;border:1px solid var(--border-l);margin:0 auto .8rem;display:block;}

/* ─── ARMORY ─── */
.recruit-row{display:flex;gap:.6rem;margin-bottom:.75rem;flex-wrap:wrap;}
.armory-btn{font-family:'Cinzel',serif;font-size:.72rem;text-transform:uppercase;letter-spacing:.1em;padding:.55rem .9rem;border:1px solid var(--gold-d);background:rgba(200,149,42,.08);color:var(--gold);border-radius:6px;cursor:pointer;transition:all .15s;}
.armory-btn:hover{background:rgba(200,149,42,.18);border-color:var(--gold);}
.armory-modal{background:var(--s2);border:1px solid var(--border-l);border-radius:12px;padding:1.4rem;max-width:700px;width:92vw;max-height:85vh;overflow-y:auto;display:flex;flex-direction:column;gap:.75rem;}
.armory-modal-sub{font-size:.78rem;color:var(--txt-d);}
.armory-housing-badge{font-family:'Cinzel',serif;font-size:.72rem;color:var(--gold);background:rgba(200,149,42,.1);border:1px solid var(--gold-d);border-radius:4px;padding:.25rem .6rem;display:inline-block;}
.armory-section-tabs{display:flex;gap:.4rem;margin-bottom:.5rem;flex-wrap:wrap;}
.ast-btn{font-family:'Cinzel',serif;font-size:.7rem;text-transform:uppercase;letter-spacing:.08em;padding:.35rem .75rem;border:1px solid var(--border-l);background:var(--surface);color:var(--txt-d);border-radius:5px;cursor:pointer;transition:all .15s;}
.ast-btn:hover:not(.active){border-color:var(--gold-d);color:var(--gold);background:rgba(200,149,42,.08);box-shadow:0 0 8px rgba(200,149,42,.2);}
.ast-btn.active{background:rgba(200,149,42,.12);border-color:var(--gold-d);color:var(--gold);box-shadow:0 0 10px rgba(200,149,42,.25);}
.inline-armory{margin-top:1.25rem;padding-top:1rem;border-top:1px solid var(--border);}
.armory-list{display:flex;flex-direction:column;gap:.4rem;}
.armory-item{display:flex;align-items:flex-start;gap:.6rem;padding:.5rem .65rem;background:var(--surface);border:1px solid var(--border);border-radius:7px;transition:all .15s;}
.armory-item.ai-owned{border-color:var(--gold-d);background:rgba(200,149,42,.06);}
.armory-item.ai-blocked{opacity:.45;}
.ai-info{flex:1;min-width:0;}
.ai-name{font-family:'Cinzel',serif;font-size:.78rem;color:var(--parch);display:block;}
.armory-item.ai-owned .ai-name{color:var(--gold);}
.ai-meta{font-size:.72rem;color:var(--txt-d);display:block;margin-top:.1rem;line-height:1.4;}
.ai-owned-row{display:flex;gap:.4rem;margin-top:.2rem;font-size:.7rem;}
.ai-count{color:var(--gold);font-family:'Cinzel',serif;}
.ai-eq-count{color:var(--txt-d);}
.ai-uneq-count{color:var(--green-l);}
.ai-actions{display:flex;align-items:center;gap:.4rem;flex-shrink:0;}
.ai-cost{font-family:'Cinzel',serif;font-size:.75rem;color:var(--gold-d);}
.ai-buy-btn,.ai-sell-btn{width:26px;height:26px;border-radius:5px;border:1px solid var(--border-l);background:var(--s3);color:var(--parch);cursor:pointer;font-size:.9rem;display:flex;align-items:center;justify-content:center;padding:0;transition:all .15s;}
.ai-buy-btn:hover:not(:disabled){background:rgba(200,149,42,.2);border-color:var(--gold-d);color:var(--gold);}
.ai-sell-btn:hover{background:rgba(155,59,26,.2);border-color:var(--rust-l);color:var(--rust-l);}
.ai-buy-btn:disabled{opacity:.3;cursor:not-allowed;}
.ai-reward-btn{width:26px;height:26px;border-radius:5px;border:1px solid rgba(80,160,80,.4);background:rgba(40,100,40,.2);color:#8dc88d;cursor:pointer;font-size:.9rem;display:flex;align-items:center;justify-content:center;padding:0;transition:all .15s;}
.ai-reward-btn:hover{background:rgba(40,100,40,.4);border-color:#8dc88d;}
.ai-free-badge{font-family:'Cinzel',serif;font-size:.6rem;text-transform:uppercase;letter-spacing:.08em;color:#8dc88d;border:1px solid rgba(80,160,80,.4);border-radius:3px;padding:.1rem .35rem;white-space:nowrap;}
.ai-owned-badge{font-family:'Cinzel',serif;font-size:.6rem;text-transform:uppercase;letter-spacing:.08em;color:var(--gold);border:1px solid var(--gold-d);border-radius:3px;padding:.1rem .35rem;}
.ai-title-req{font-size:.68rem;color:var(--gold-d);font-style:italic;margin-top:.2rem;}
.ai-rwd-value{font-size:.68rem;color:var(--txt-d);margin-top:.2rem;}

/* ─── EQUIP TAB ─── */
.equip-wrap{display:flex;flex-direction:column;gap:1rem;}
.eq-loadout{background:var(--surface);border:1px solid var(--border);border-radius:8px;padding:.75rem .9rem;display:flex;flex-direction:column;gap:.6rem;}
.eq-loadout-head{font-family:'Cinzel',serif;font-size:.72rem;text-transform:uppercase;letter-spacing:.12em;color:var(--gold-d);margin-bottom:.1rem;}
.eq-slot-group{display:flex;flex-direction:column;gap:.3rem;}
.eq-slot-head{display:flex;justify-content:space-between;align-items:center;}
.eq-slot-lbl{font-family:'Cinzel',serif;font-size:.73rem;color:var(--parch-d);}
.eq-slot-hint{font-size:.68rem;color:var(--txt-d);}
.eq-equipped-row{display:flex;flex-wrap:wrap;gap:.35rem;min-height:28px;align-items:center;}
.eq-empty-slot{font-size:.75rem;color:var(--txt-d);opacity:.5;font-style:italic;}
.eq-chip{display:inline-flex;align-items:center;gap:.3rem;padding:.25rem .5rem;border-radius:5px;border:1px solid var(--border-l);background:var(--s3);cursor:pointer;font-size:.76rem;color:var(--txt);transition:all .15s;}
.eq-chip.equipped{border-color:var(--gold-d);background:rgba(200,149,42,.12);color:var(--parch);}
.eq-chip:hover:not(.eq-blocked){border-color:var(--gold-d);background:rgba(200,149,42,.18);}
.eq-chip.eq-blocked{opacity:.35;cursor:not-allowed;}
.eq-chip-name{font-family:'Cinzel',serif;font-size:.72rem;}
.eq-chip-stat{font-size:.66rem;color:var(--gold-d);background:rgba(200,149,42,.1);border-radius:3px;padding:.05rem .25rem;}
.eq-chip.equipped .eq-chip-stat{color:var(--gold);}
.eq-chip-remove{font-size:.65rem;color:var(--txt-d);margin-left:.1rem;opacity:.6;}
.eq-chip:hover:not(.eq-blocked) .eq-chip-remove{opacity:1;color:var(--rust-l);}
.eq-chip-lock{font-size:.65rem;margin-left:.1rem;}
.eq-available{display:flex;flex-direction:column;gap:.5rem;}
.eq-avail-title{font-family:'Cinzel',serif;font-size:.72rem;text-transform:uppercase;letter-spacing:.12em;color:var(--gold-d);padding-bottom:.3rem;border-bottom:1px solid var(--border);}
.eq-stash-hint{font-weight:normal;text-transform:none;letter-spacing:0;font-family:'Crimson Text',serif;font-style:italic;color:var(--txt-d);}
.eq-avail-section{}
.eq-avail-head{font-size:.7rem;color:var(--txt-d);text-transform:uppercase;letter-spacing:.08em;margin-bottom:.3rem;margin-top:.2rem;}
.eq-avail-list{display:flex;flex-wrap:wrap;gap:.35rem;}
.eq-all-equipped{font-size:.78rem;color:var(--txt-d);font-style:italic;padding:.5rem 0;}

/* ─── INVENTORY SIDEBAR ─── */
.inv-row{display:flex;align-items:center;justify-content:space-between;gap:.5rem;padding:.35rem 0;border-bottom:1px solid var(--border);font-size:.8rem;}
.inv-row:last-of-type{border-bottom:none;}
.inv-main{display:flex;align-items:center;gap:.35rem;min-width:0;}
.inv-icon{font-size:.75rem;flex-shrink:0;opacity:.7;}
.inv-info{display:flex;align-items:baseline;gap:.3rem;min-width:0;}
.inv-name{font-family:'Cinzel',serif;font-size:.74rem;color:var(--parch);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
.inv-qty{font-size:.65rem;color:var(--gold-d);font-family:'Cinzel',serif;background:rgba(200,149,42,.1);border-radius:3px;padding:.05rem .25rem;}
.inv-company-tag{font-size:.62rem;color:var(--gold-d);background:rgba(200,149,42,.08);border:1px solid var(--gold-d);border-radius:3px;padding:.05rem .3rem;font-family:'Cinzel',serif;text-transform:uppercase;letter-spacing:.05em;flex-shrink:0;}

/* ─── TITLES & REWARDS (keep from before) ─── */
.title-badge{font-family:'Cinzel',serif;font-size:.58rem;text-transform:uppercase;letter-spacing:.09em;background:linear-gradient(135deg,rgba(200,149,42,.18),rgba(200,149,42,.06));border:1px solid var(--gold-d);border-radius:3px;color:var(--gold);padding:.1rem .4rem;white-space:nowrap;}
.reward-card{background:var(--s2);border:1px solid var(--border);border-radius:8px;padding:.65rem .85rem;display:flex;align-items:flex-start;gap:.75rem;cursor:pointer;transition:all .15s;}
.reward-card:hover:not(.rc-owned){border-color:var(--border-l);background:var(--s3);}
.reward-card.rc-owned{border-color:var(--gold-d);background:linear-gradient(135deg,rgba(200,149,42,.1),rgba(200,149,42,.03));}
.rc-val{display:flex;flex-direction:column;align-items:center;gap:.1rem;flex-shrink:0;background:var(--surface);border:1px solid var(--border-l);border-radius:6px;padding:.3rem .4rem;min-width:38px;}
.rc-val-num{font-family:'Cinzel',serif;font-size:.8rem;font-weight:700;color:var(--parch);}
.rc-val-lbl{font-family:'Cinzel',serif;font-size:.44rem;text-transform:uppercase;letter-spacing:.1em;color:var(--txt-d);}
.reward-card.rc-owned .rc-val{border-color:var(--gold-d);}
.reward-card.rc-owned .rc-val-num{color:var(--gold);}
.rewards-section-head{font-family:'Cinzel',serif;font-size:.65rem;text-transform:uppercase;letter-spacing:.12em;color:var(--gold-d);margin:.85rem 0 .4rem;padding-bottom:.25rem;border-bottom:1px solid var(--border);}
.rewards-section-head:first-child{margin-top:0;}
.title-card{background:var(--s2);border:1px solid rgba(200,149,42,.25);border-radius:8px;padding:.65rem .85rem;display:flex;align-items:flex-start;gap:.75rem;cursor:pointer;transition:all .15s;}
.title-card:hover:not(.tc-owned):not(.tc-locked){border-color:var(--gold-d);background:var(--s3);}
.title-card.tc-removable:hover{border-color:#c44c22;background:rgba(196,76,34,.08);}
.title-card.tc-owned{border-color:var(--gold);background:linear-gradient(135deg,rgba(200,149,42,.15),rgba(200,149,42,.04));}
.title-card.tc-locked{cursor:default;opacity:.85;}
.tc-remove-badge{font-size:.62rem;color:#c44c22;background:rgba(196,76,34,.1);border:1px solid rgba(196,76,34,.3);border-radius:3px;padding:.05rem .3rem;margin-left:auto;font-family:'Cinzel',serif;text-transform:uppercase;letter-spacing:.05em;}
.tc-inf{display:flex;flex-direction:column;align-items:center;gap:.1rem;flex-shrink:0;background:var(--surface);border:1px solid rgba(200,149,42,.3);border-radius:6px;padding:.3rem .4rem;min-width:34px;}
.tc-inf-num{font-family:'Cinzel',serif;font-size:.9rem;font-weight:700;color:var(--gold-d);}
.tc-inf-lbl{font-family:'Cinzel',serif;font-size:.44rem;text-transform:uppercase;letter-spacing:.1em;color:var(--txt-d);}
.title-card.tc-owned .tc-inf-num{color:var(--gold);}
.tc-body{flex:1;min-width:0;}
.tc-name{font-family:'Cinzel',serif;font-size:.82rem;color:var(--parch);}
.title-card.tc-owned .tc-name{color:var(--gold);}
.tc-effect{font-size:.76rem;color:var(--txt-d);margin-top:.2rem;line-height:1.4;font-style:italic;}
`;
// ===================== HELPERS =====================

let _uid = 1;
const newId = () => _uid++;
const raceOf = id => RACES.find(r => r.id === id);
const augOf  = id => AUGMENTS.find(a => a.id === id);

function newMember(race) {
  return {
    id: newId(),
    name: race.name,
    raceId: race.id,
    augmentId: null,
    isLeader: false,
    xp: 0,
    spells: [],
    talents: {},
    titles: [],
    equipped: { melee: [], ranged: [], armor: null, items: [] },
  };
}

// ── Item / stash helpers ──
function lookupDef(itemId) {
  return WEAPONS.find(w => w.id === itemId) ||
    ARMOR_LIST.find(a => a.id === itemId) ||
    ITEMS.find(i => i.id === itemId) ||
    MARKET_ITEMS.find(i => i.id === itemId) ||
    REWARD_ITEMS.find(i => i.id === itemId) || null;
}

// Takes the def object (not id)
function itemSlot(def) {
  if (!def) return "item";
  if (def.wtype === "melee")  return "melee";
  if (def.wtype === "ranged") return "ranged";
  if (def.slot === "armor")   return "armor";
  return "item";
}

function itemHands(def) { return def?.hands ?? 1; }

function armorVal(def) {
  if (!def) return 0;
  return def.armor ?? 0;
}

function armorMovePenalty(def) {
  if (!def) return 0;
  return def.movePenalty ?? 0;
}

// All stash uids currently equipped by a member
function allEquipped(m) {
  const eq = m.equipped ?? {};
  return [
    ...(eq.melee  ?? []),
    ...(eq.ranged ?? []),
    ...(eq.armor  ? [eq.armor] : []),
    ...(eq.items  ?? []),
  ];
}

// Which member (if any) has this stash uid equipped
function equippedBy(uid, members) {
  return members.find(m => allEquipped(m).includes(uid)) ?? null;
}

// Hands used in melee or ranged slot
function handsInSlot(m, stash, slot) {
  return (m.equipped?.[slot] ?? []).reduce((h, uid) => {
    const entry = (stash ?? []).find(s => s.uid === uid);
    return h + (entry ? itemHands(lookupDef(entry.itemId)) : 0);
  }, 0);
}

// Member cost = race + augment + spells only (items are in stash)
function getMemberCost(m) {
  return (raceOf(m.raceId)?.cost ?? 0) +
    (augOf(m.augmentId)?.cost ?? 0) +
    (m.spells ?? []).reduce((s, id) => s + (SPELLS.find(sp => sp.id === id)?.cost ?? 0), 0);
}

// Stash cost = all purchased items (not reward source)
function getStashCost(stash) {
  return stash.reduce((s, e) => {
    if (e.source === "reward") return s;
    return s + (lookupDef(e.itemId)?.cost ?? 0);
  }, 0);
}

function getHP(m) {
  const base = raceOf(m.raceId)?.hp ?? 0;
  const talentList = Object.values(m.talents ?? {}).filter(Boolean);
  const isBulky = m.augmentId === "bulky" || talentList.includes("bulk");
  const isNimble = m.augmentId === "nimble" || talentList.includes("nimble");
  if (isBulky)  return base + 3;
  if (isNimble) return Math.ceil(base / 2);
  return base;
}

function getSpeed(m, stash) {
  const talentList = Object.values(m.talents ?? {}).filter(Boolean);
  const hasMount = (m.equipped?.items ?? []).some(uid => {
    const e = (stash ?? []).find(s => s.uid === uid);
    return e?.itemId === "mount";
  });

  if (hasMount) {
    let speed = 8;
    if (talentList.includes("giddy_up")) speed += 1;
    // Armor slows mount for everyone including dwarves
    const armorUidM = m.equipped?.armor;
    if (armorUidM) {
      const armorEntry = (stash ?? []).find(s => s.uid === armorUidM);
      if (armorEntry) speed += armorMovePenalty(lookupDef(armorEntry.itemId));
    }
    return Math.max(1, speed) + '"';
  }

  const baseSpeed = raceOf(m.raceId)?.speed ?? 0;
  const isNimble = m.augmentId === "nimble" || talentList.includes("nimble");
  let speed = isNimble ? Math.ceil(baseSpeed) + 1 : baseSpeed;
  if (talentList.includes("runner_up")) speed += 1;

  // Armor movement penalty
  const isDwarf = m.raceId === "dwarf";
  if (!isDwarf) {
    const armorUid = m.equipped?.armor;
    if (armorUid) {
      const armorEntry = (stash ?? []).find(s => s.uid === armorUid);
      if (armorEntry) {
        const armorDef = lookupDef(armorEntry.itemId);
        speed += armorMovePenalty(armorDef);
      }
    }
  }
  return Math.max(1, speed) + '"';
}

function getArmor(m, stash) {
  const hasShieldMaster = Object.values(m.talents ?? {}).includes("shield_master");
  return allEquipped(m).reduce((total, uid) => {
    const entry = (stash ?? []).find(s => s.uid === uid);
    if (!entry) return total;
    const def = lookupDef(entry.itemId);
    let val = armorVal(def);
    // Shield Master: shields give +1 extra armor
    if (hasShieldMaster && (def?.id === "shield" || def?.id === "mirror_shield")) val += 1;
    return total + val;
  }, 0);
}

// Per-item hit modifiers (positive = better, i.e. lowers the to-hit number)
const WEAPON_HIT = {
  // melee
  dagger: { melee: -1 },
  staff:  { melee: -1 },
  lance:  { melee: +1 },
  pg_sledge: { melee: -1 },
  // ranged
  crossbow:          { ranged: +1 },
  pistol:            { ranged: +2 },
  blunderbuss:       { ranged: +2 },
  throwing_daggers:  { ranged: -1 },
  sling:             { ranged: +1 },
  brannigan_arquebus:{ ranged: +2 },
  ole_betsy:         { ranged: +1 },
  faladareth:        { ranged: +1 },
  eyepatch:          { ranged: +1 },
};

// Per-talent hit modifiers — only unconditional passives
const TALENT_HIT = {
  street_fighter: { melee: +1 },
  close_up:       { melee: +1 },
  marksman:       { ranged: +1 },
  far_away:       { ranged: +1 },
};

function getHitBonus(m, stash, type, allMembers) {
  let bonus = 0;
  const talentList = Object.values(m.talents ?? {}).filter(Boolean);

  // Bulky augment: +1 melee attack rolls
  if (type === "melee" && m.augmentId === "bulky") bonus += 1;

  // Rage sacrifice: leader gets +2 to all attack rolls (flagged via m.rageSacBonus)
  if (m.isLeader && m.rageSacBonus) bonus += 2;

  // From equipped items — dagger penalty does not stack
  let daggers = 0;
  allEquipped(m).forEach(uid => {
    const entry = (stash ?? []).find(s => s.uid === uid);
    if (!entry) return;
    if (entry.itemId === "dagger") { daggers++; return; } // handle after loop
    const mod = WEAPON_HIT[entry.itemId];
    if (mod?.[type]) bonus += mod[type];
  });
  if (type === "melee" && daggers > 0) bonus -= 1; // dagger penalty, never stacks

  // Dual wielding two 1-handed melee weapons: -1 to melee attack rolls (unless Ambidextrous)
  if (type === "melee" && !talentList.includes("ambidextrous")) {
    const meleeUids = m.equipped?.melee ?? [];
    if (meleeUids.length === 2) {
      const hands = meleeUids.map(uid => {
        const e = (stash ?? []).find(s => s.uid === uid);
        return e ? itemHands(lookupDef(e.itemId)) : 0;
      });
      if (hands[0] === 1 && hands[1] === 1) bonus -= 1;
    }
  }

  // From reward items owned by this member
  (m.rewardItems ?? []).forEach(itemId => {
    const mod = WEAPON_HIT[itemId];
    if (mod?.[type]) bonus += mod[type];
  });

  // Ranged Focus (leader talent): all company members get +1 ranged
  if (type === "ranged" && allMembers) {
    const leaderHasRangedFocus = allMembers.some(lm =>
      lm.isLeader && Object.values(lm.talents ?? {}).includes("ranged_focus")
    );
    if (leaderHasRangedFocus) bonus += 1;
  }

  // From talents
  talentList.forEach(talentId => {
    // Unconditional passives
    const mod = TALENT_HIT[talentId];
    if (mod?.[type]) bonus += mod[type];

    // Swashbuckler: single 1-handed melee weapon and nothing else → +1 melee
    if (type === "melee" && talentId === "swashbuckler") {
      const meleeUids = m.equipped?.melee ?? [];
      const rangedUids = m.equipped?.ranged ?? [];
      if (meleeUids.length === 1 && rangedUids.length === 0) {
        const entry = (stash ?? []).find(s => s.uid === meleeUids[0]);
        const def = entry ? lookupDef(entry.itemId) : null;
        if (def && itemHands(def) === 1) bonus += 1;
      }
    }

    // Cavalry Charge: +1 melee when mounted
    if (type === "melee" && talentId === "cavalry_charge") {
      const hasMountEquipped = (m.equipped?.items ?? []).some(uid => {
        const e = (stash ?? []).find(s => s.uid === uid);
        return e?.itemId === "mount";
      });
      if (hasMountEquipped) bonus += 1;
    }
  });

  return bonus;
}

// Returns "X+" string for the to-hit roll (base 4+, lower is better)
function getHitStr(m, stash, type, allMembers) {
  const bonus = getHitBonus(m, stash, type, allMembers);
  const target = Math.max(2, Math.min(6, 4 - bonus));
  return target + "+";
}

// Rise Again roll: base 5+, reise gives +1 (→4+), mercy gives +1 (→4+), both together →3+
function getRiseAgainStr(m) {
  if (m.raceId !== "undead") return null;
  const talentList = Object.values(m.talents ?? {}).filter(Boolean);
  let bonus = 0;
  if (talentList.includes("reise")) bonus += 1;
  if (talentList.includes("mercy")) bonus += 1;
  const target = Math.max(2, Math.min(6, 5 - bonus));
  return target + "+";
}

function canCast(m, stash) {
  if (augOf(m.augmentId)?.spellcaster) return true;
  return allEquipped(m).some(uid => {
    const entry = (stash ?? []).find(s => s.uid === uid);
    return entry && !!lookupDef(entry.itemId)?.keywords?.includes("Casting");
  });
}

function getSpellsFor(m, stash) {
  const aug = augOf(m.augmentId);
  if (!canCast(m, stash)) return [];
  return SPELLS.filter(s => s.for === "all" || s.for === aug?.spellcaster || (s.for === "undead" && m.raceId === "undead"));
}

function getTitles(m) {
  const fromTalents = Object.entries(m.talents ?? {}).map(([key, tid]) => {
    if (!tid) return null;
    const [catKey, tierStr] = key.split("_");
    const talent = TALENTS[catKey]?.tiers[parseInt(tierStr)]?.find(t => t.id === tid);
    if (!talent?.grantsTitle) return null;
    return TITLES.find(t => t.name === talent.grantsTitle);
  }).filter(Boolean);
  const explicit = (m.titles ?? []).map(id => TITLES.find(t => t.id === id)).filter(Boolean);
  const seen = new Set(fromTalents.map(t => t.id));
  return [...fromTalents, ...explicit.filter(t => !seen.has(t.id))];
}

function getLevel(xp) {
  if (xp >= 100) return 7;
  if (xp >= 70)  return 6;
  if (xp >= 50)  return 5;
  if (xp >= 30)  return 4;
  if (xp >= 15)  return 3;
  if (xp >= 5)   return 2;
  return 1;
}
const LEVEL_THRESHOLDS = [5, 15, 30, 50, 70, 100];
const UNDEAD_MAX_XP = 50;

const MINION_TYPES = [
  { id:"hound",  name:"Hound",        cost:10, speed:'6"', hp:3,  dmg:2,    hit:"5+", maxPerCompany:3, needsOwner:false, special:"Fetch. Max 3 per company.", icon:"🐕" },
  { id:"troll",  name:"Troll / Giant", cost:50, speed:'6"', hp:20, dmg:6,    hit:"2+", maxPerCompany:1, needsOwner:true,  special:"Easy to hit (+1 to attack rolls against). Must stay within 4\" of designated owner. Max 1 per company.", icon:"👹" },
  { id:"monkey", name:"Monkey",        cost:10, speed:'5"', hp:5,  dmg:null, hit:null, maxPerCompany:1, needsOwner:false, special:"Fetch. Movement not affected vertically. Ranged attack rolls against a monkey are reduced by 1. Max 1 per company.", icon:"🐒" },
];

function newMinion(type) {
  return { id: newId(), name: type.name, typeId: type.id, ownerId: null };
}

function getMinionCost(type, activeFaction) {
  if (type.id === "troll" && activeFaction === "goblin") return Math.floor(type.cost / 2);
  return type.cost;
}

function getTalentPoints(member, allMembers) {
  const tutorBonus = allMembers ? allMembers.filter(m => m.id !== member.id && m.tutorTarget === member.id && Object.values(m.talents ?? {}).includes("tutor")).length : 0;
  const available = Math.max(0, getLevel(member.xp ?? 0) - 1) + (member.isLeader ? 1 : 0) + (member.bonusTalentPoints ?? 0) + tutorBonus;
  const spent = Object.values(member.talents ?? {}).filter(Boolean).length;
  return { available, spent, remaining: available - spent };
}

function getAvailableCategories(member) {
  const isUndeadRace = member.raceId === "undead";
  if (isUndeadRace && !member.isLeader) return ["undead"];
  const cats = ["attributes", "combat", "magic", "diplomacy"];
  if (member.isLeader) cats.push("leadership");
  if (isUndeadRace) cats.push("undead");
  return cats;
}

// ===================== COMPONENTS =====================

function FactionBanner({ members }) {
  if (members.length === 0) return null;
  const races = members.map(m => m.raceId);
  const uniqueRaces = [...new Set(races)];
  const isUndeadMix = uniqueRaces.every(r => UNDEAD_RACES.includes(r));
  const isSingleRace = uniqueRaces.length === 1;
  const isActive = isSingleRace || isUndeadMix;
  let factionKey = null;
  if (isSingleRace) factionKey = uniqueRaces[0];
  else if (isUndeadMix) factionKey = "undead";
  if (!factionKey && uniqueRaces.length > 2) return null;
  const faction = factionKey ? FACTION_BONUSES[factionKey] : null;
  if (!faction) return null;
  return (
    <div className={`faction-banner ${isActive ? "active" : "inactive"}`}>
      <span className="fb-icon">{faction.icon}</span>
      <div className="fb-body">
        <div className="fb-top">
          <span className="fb-label">{faction.label}</span>
          <span className={`fb-tag ${isActive ? "unlocked" : "locked"}`}>{isActive ? "✦ Bonus Active" : "Locked"}</span>
        </div>
        <div className="fb-bonus">{faction.bonus}</div>
        {!isActive && <div className="fb-hint">Dismiss non-{factionKey} fighters to unlock this bonus.</div>}
      </div>
    </div>
  );
}

// ─── ARMORY PANEL ─── (Company-level inventory: buy, market, receive rewards)
function ArmoryPanel({ stash, setStash, remaining, members, update }) {
  const [filter, setFilter] = useState("all");
  const [mktFilter, setMktFilter] = useState("all");
  const [rwdFilter, setRwdFilter] = useState("all");
  const [section, setSection] = useState("standard"); // "standard" | "spells" | "library" | "market" | "rewards"
  const [spellTarget, setSpellTarget] = useState(null); // member id for spell assignment

  const rarityColor = (r) => {
    if (r <= 5) return "#6a9a4a";
    if (r <= 7) return "#c8952a";
    if (r <= 9) return "#c44c22";
    return "#a02020";
  };

  const stashCountOf = (itemId, src) => stash.filter(e => e.itemId === itemId && (!src || e.source === src)).length;
  const equippedCountOf = (itemId) => {
    const uids = stash.filter(e => e.itemId === itemId).map(e => e.uid);
    return uids.filter(uid => equippedBy(uid, members) !== null).length;
  };

  const buyItem = (itemId) => {
    const def = lookupDef(itemId);
    if (!def || (def.cost ?? 0) > remaining) return;
    setStash(prev => [...prev, { uid: newId(), itemId, source: "shop" }]);
  };

  const receiveReward = (itemId) => {
    setStash(prev => [...prev, { uid: newId(), itemId, source: "reward" }]);
  };

  const removeFromStash = (itemId, src) => {
    const uid = stash.find(e => e.itemId === itemId && (!src || e.source === src) && equippedBy(e.uid, members) === null)?.uid;
    if (uid !== undefined) setStash(prev => prev.filter(e => e.uid !== uid));
  };

  const StashOwnershipRow = ({ itemId, src }) => {
    const count = stashCountOf(itemId, src);
    if (count === 0) return null;
    const equipped = equippedCountOf(itemId);
    const unequipped = count - equipped;
    return (
      <div className="ai-owned-row">
        <span className="ai-count">{count} in stash</span>
        {equipped > 0 && <span className="ai-eq-count">· {equipped} equipped</span>}
        {unequipped > 0 && <span className="ai-uneq-count">· {unequipped} available</span>}
      </div>
    );
  };

  const ItemActions = ({ item, src, canBuy, isFree }) => {
    const count = stashCountOf(item.id, src);
    const equipped = equippedCountOf(item.id);
    const unequipped = count - equipped;
    const isHousing = item.id === "housing";
    const housingOwned = isHousing && stash.some(e => e.itemId === "housing");
    if (housingOwned && src !== "reward") {
      return <div className="ai-actions"><span className="ai-cost">🪙 {item.cost ?? 0}</span><span className="ai-owned-badge">✓ Company</span></div>;
    }
    return (
      <div className="ai-actions">
        {!isFree && <span className="ai-cost">🪙 {item.cost ?? 0}</span>}
        {!housingOwned && (
          <button
            className={isFree ? "ai-reward-btn" : "ai-buy-btn"}
            disabled={!isFree && !canBuy}
            onClick={() => isFree ? receiveReward(item.id) : (!canBuy ? null : buyItem(item.id))}
            title={isFree ? "Add to company stash" : "Buy for company"}
          >+</button>
        )}
        {unequipped > 0 && (
          <button className="ai-sell-btn" onClick={() => removeFromStash(item.id, src)} title="Remove from stash">−</button>
        )}
      </div>
    );
  };

  // ── Spell section helpers ──
  const casterMembers = members.filter(m => canCast(m, stash));
  const activeMember = spellTarget ? members.find(m => m.id === spellTarget) : casterMembers[0];

  const SpellSection = ({ tomeOnly }) => {
    const spells = tomeOnly
      ? SPELLS.filter(sp => sp.tome)
      : SPELLS.filter(sp => !sp.tome);

    if (casterMembers.length === 0) {
      return <p className="sec-note" style={{marginTop:".5rem"}}>No characters in your company can cast spells. Assign a Sorcerer or Witch augment, or equip a Spellbook or Staff.</p>;
    }

    const target = activeMember ?? casterMembers[0];

    const canLearnSpell = (sp) => {
      if (!target) return false;
      const aug = augOf(target.augmentId);
      if (sp.for === "witch" && aug?.spellcaster !== "witch") return false;
      if (sp.for === "sorcerer" && aug?.spellcaster !== "sorcerer") return false;
      if (sp.for === "undead" && target.raceId !== "undead") return false;
      return true;
    };

    const memberSpells = target?.spells ?? [];
    const memberGold = remaining; // uses company gold

    return (
      <>
        {tomeOnly && <div className="market-roll-hint">📚 Roll 2d6 at the Library — meet or beat the rarity number to find this tome</div>}
        <div style={{display:"flex",alignItems:"center",gap:".5rem",margin:".4rem 0"}}>
          <span style={{fontFamily:"'Cinzel',serif",fontSize:".72rem",color:"var(--txt-d)",flexShrink:0}}>Assign to:</span>
          <div style={{display:"flex",gap:".3rem",flexWrap:"wrap"}}>
            {casterMembers.map(m => (
              <button key={m.id}
                className={"mf-btn" + ((target?.id === m.id) ? " active" : "")}
                onClick={() => setSpellTarget(m.id)}>
                {m.isLeader ? "👑 " : ""}{m.name || raceOf(m.raceId)?.name}
              </button>
            ))}
          </div>
        </div>
        <div className="armory-list">
          {spells.map(sp => {
            if (!target) return null;
            const owned = memberSpells.includes(sp.id);
            const canAfford = owned || sp.cost <= memberGold;
            const eligible = canLearnSpell(sp);
            const isExclusive = sp.for !== "all";
            return (
              <div key={sp.id}
                className={"armory-item" + (owned ? " ai-owned" : "") + ((!canAfford || !eligible) && !owned ? " ai-blocked" : "")}
                style={{cursor: eligible ? "pointer" : "default"}}
                onClick={() => {
                  if (!eligible || (!canAfford && !owned)) return;
                  const next = owned
                    ? memberSpells.filter(id => id !== sp.id)
                    : [...memberSpells, sp.id];
                  update(target.id, { spells: next });
                }}>
                <div className="ai-info">
                  <span className="ai-name">
                    {sp.name}
                    {isExclusive && <span className="kw" style={{marginLeft:".35rem"}}>
                      {sp.for === "witch" ? "Witch" : sp.for === "sorcerer" ? "Sorcerer" : "Undead"}
                    </span>}
                    {sp.tome && <span className="kw" style={{marginLeft:".35rem",background:"rgba(100,60,160,.25)",borderColor:"rgba(150,100,220,.4)",color:"#b090e0"}}>Tome</span>}
                    {sp.tome && <span style={{marginLeft:".35rem",fontSize:".65rem",color:rarityColor(sp.rarity)}}>Rarity {sp.rarity}</span>}
                    {!eligible && <span style={{marginLeft:".35rem",fontSize:".65rem",color:"var(--txt-d)"}}>— not eligible</span>}
                    {owned && <span style={{marginLeft:".35rem",fontSize:".65rem",color:"var(--gold)"}}>✓ Learned</span>}
                  </span>
                  <span className="ai-meta">
                    Diff: {sp.diff} · Range: {sp.range}
                    {sp.dmg !== null ? ` · DMG: ${sp.dmg}` : ""}
                    {" · "}{sp.effect}
                  </span>
                </div>
                <div className="ai-actions">
                  <span className="ai-cost">🪙 {sp.cost}</span>
                  {eligible && (
                    <button
                      className={owned ? "ai-sell-btn" : "ai-buy-btn"}
                      disabled={!owned && !canAfford}
                      onClick={e => {
                        e.stopPropagation();
                        if (!canAfford && !owned) return;
                        const next = owned
                          ? memberSpells.filter(id => id !== sp.id)
                          : [...memberSpells, sp.id];
                        update(target.id, { spells: next });
                      }}
                    >{owned ? "−" : "+"}</button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </>
    );
  };

  const stdCategories = [
    { id:"all", label:"All" },
    { id:"weapon", label:"Weapons" },
    { id:"armor", label:"Armor" },
    { id:"item", label:"Items" },
  ];
  const allStandardItems = [
    ...WEAPONS.map(w => ({ ...w, _cat: "weapon" })),
    ...ARMOR_LIST.map(a => ({ ...a, _cat: "armor" })),
    ...ITEMS.map(i => ({ ...i, _cat: "item" })),
  ];
  const visibleStd = allStandardItems.filter(i => filter === "all" || i._cat === filter);

  const mktCategories = [{ id:"all", label:"All" },{ id:"weapon", label:"Weapons" },{ id:"armor", label:"Armor" },{ id:"item", label:"Items" }];
  const visibleMkt = MARKET_ITEMS.filter(i => mktFilter === "all" || i.category === mktFilter);

  const rwdCategories = [{ id:"all", label:"All" },{ id:"weapon", label:"Weapons" },{ id:"item", label:"Items" }];
  const visibleRwd = REWARD_ITEMS.filter(i => rwdFilter === "all" || i.category === rwdFilter);

  return (
    <div className="armory-panel">
      <div className="armory-section-tabs">
        <button className={"ast-btn" + (section === "standard" ? " active" : "")} onClick={() => setSection("standard")}>Equipment</button>
        <button className={"ast-btn" + (section === "spells" ? " active" : "")} onClick={() => setSection("spells")}>✨ Spells</button>
        <button className={"ast-btn" + (section === "library" ? " active" : "")} onClick={() => setSection("library")}>📚 Library</button>
        <button className={"ast-btn" + (section === "market" ? " active" : "")} onClick={() => setSection("market")}>🎲 Market</button>
        <button className={"ast-btn" + (section === "rewards" ? " active" : "")} onClick={() => setSection("rewards")}>🏆 Rewards</button>
      </div>

      {section === "standard" && (
        <>
          <div className="market-filter">
            {stdCategories.map(c => (
              <button key={c.id} className={"mf-btn" + (filter === c.id ? " active" : "")} onClick={() => setFilter(c.id)}>{c.label}</button>
            ))}
          </div>
          <div className="armory-list">
            {visibleStd.map(item => {
              const count = stashCountOf(item.id, "shop");
              const cantAfford = (item.cost ?? 0) > remaining;
              return (
                <div key={item.id} className={"armory-item" + (count > 0 ? " ai-owned" : "") + (cantAfford && count === 0 ? " ai-blocked" : "")}>
                  <div className="ai-info">
                    <span className="ai-name">{item.name}</span>
                    <span className="ai-meta">
                      {item.range && `${item.range} · `}
                      {item.dmg && `DMG ${item.dmg} · `}
                      {item.bonus && `${item.bonus} · `}
                      {item.armor > 0 && `+${item.armor} Armor · `}
                      {item.movePenalty && item.movePenalty < 0 ? `${item.movePenalty}" movement · ` : ""}
                      {(item.effect ?? item.note ?? "").slice(0, 70) + ((item.effect ?? item.note ?? "").length > 70 ? "…" : "")}
                      {item.raceRestrict && <span className="kw" style={{marginLeft:".3rem",color:"#a0c070"}}>{item.raceRestrict.charAt(0).toUpperCase()+item.raceRestrict.slice(1)} only</span>}
                      {item.keywords?.map(k => <span key={k} className="kw" style={{marginLeft:".3rem"}}>{k}</span>)}
                    </span>
                    <StashOwnershipRow itemId={item.id} src="shop" />
                  </div>
                  <ItemActions item={item} src="shop" canBuy={!cantAfford} isFree={false} />
                </div>
              );
            })}
          </div>
        </>
      )}

      {section === "spells" && <SpellSection tomeOnly={false} />}
      {section === "library" && <SpellSection tomeOnly={true} />}

      {section === "market" && (
        <>
          <div className="market-roll-hint">🎲 Roll 2d6 — beat the rarity number to unlock the item for purchase</div>
          <div className="market-filter">
            {mktCategories.map(c => (
              <button key={c.id} className={"mf-btn" + (mktFilter === c.id ? " active" : "")} onClick={() => setMktFilter(c.id)}>{c.label}</button>
            ))}
          </div>
          <div className="armory-list">
            {visibleMkt.map(item => {
              const count = stashCountOf(item.id, "shop");
              const cantAfford = item.cost > remaining;
              const titleRequired = item.requiresTitle ? TITLES.find(t => t.id === item.requiresTitle) : null;
              return (
                <div key={item.id} className={"armory-item" + (count > 0 ? " ai-owned" : "") + (cantAfford && count === 0 ? " ai-blocked" : "")}>
                  <div className="mc-rarity" style={{flexShrink:0,marginRight:".5rem"}}>
                    <span className="mc-rarity-num" style={{color: rarityColor(item.rarity)}}>{item.rarity}</span>
                    <span className="mc-rarity-lbl">Rarity</span>
                  </div>
                  <div className="ai-info">
                    <span className="ai-name">{item.name}</span>
                    <span className="ai-meta">
                      {item.range && `${item.range} · `}
                      {item.dmg && `DMG ${item.dmg} · `}
                      {item.armor > 0 && `+${item.armor} Armor · `}
                      {(item.note ?? "").slice(0, 70) + ((item.note ?? "").length > 70 ? "…" : "")}
                    </span>
                    {titleRequired?.name && <div className="ai-title-req">Requires title: {titleRequired.name}</div>}
                    <StashOwnershipRow itemId={item.id} src="shop" />
                  </div>
                  <ItemActions item={item} src="shop" canBuy={!cantAfford} isFree={false} />
                </div>
              );
            })}
          </div>
        </>
      )}

      {section === "rewards" && (
        <>
          <div className="market-roll-hint">🏆 Reward items are received during play — free to add to your company stash</div>
          <div className="market-filter">
            {rwdCategories.map(c => (
              <button key={c.id} className={"mf-btn" + (rwdFilter === c.id ? " active" : "")} onClick={() => setRwdFilter(c.id)}>{c.label}</button>
            ))}
          </div>
          <div className="armory-list">
            {visibleRwd.map(item => {
              const count = stashCountOf(item.id, "reward");
              return (
                <div key={item.id} className={"armory-item" + (count > 0 ? " ai-owned" : "")}>
                  <div className="ai-info">
                    <span className="ai-name">{item.name}</span>
                    <span className="ai-meta">
                      {item.range && item.range !== "—" && `${item.range} · `}
                      {item.dmg && item.dmg !== "—" && `DMG ${item.dmg} · `}
                      {(item.note ?? "").slice(0, 70) + ((item.note ?? "").length > 70 ? "…" : "")}
                      {item.keywords?.map(k => <span key={k} className="kw" style={{marginLeft:".3rem"}}>{k}</span>)}
                    </span>
                    <StashOwnershipRow itemId={item.id} src="reward" />
                  </div>
                  <ItemActions item={item} src="reward" canBuy={true} isFree={true} />
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

function EquipTab({ member, stash, members, update }) {
  const race = raceOf(member.raceId) ?? {};
  const eq = member.equipped ?? { melee: [], ranged: [], armor: null, items: [] };

  // Get def for a stash uid
  const defOf = (uid) => {
    const entry = stash.find(s => s.uid === uid);
    return entry ? lookupDef(entry.itemId) : null;
  };

  const nameOf = (uid) => defOf(uid)?.name ?? "?";

  // Attempt to equip/unequip an item from stash
  const toggleEquip = (uid) => {
    const entry = stash.find(s => s.uid === uid);
    if (!entry) return;
    const def = lookupDef(entry.itemId);
    if (!def) return;

    // If already equipped by this member → unequip
    if (allEquipped(member).includes(uid)) {
      const newEq = {
        melee:  eq.melee.filter(u => u !== uid),
        ranged: eq.ranged.filter(u => u !== uid),
        armor:  eq.armor === uid ? null : eq.armor,
        items:  eq.items.filter(u => u !== uid),
      };
      update(member.id, { equipped: newEq });
      return;
    }

    // Check equipped by someone else
    const other = equippedBy(uid, members);
    if (other && other.id !== member.id) return; // locked to other character

    const slot = itemSlot(def);

    // Housing is company-wide, not equippable
    if (def.id === "housing") return;

    // Race restrictions
    if (slot === "armor" && race?.noArmor) return;
    if (slot === "armor" && def.heavy && race?.noHeavyArmor) return;
    if (slot === "armor" && def.armorType === "heavy" && race?.noHeavyArmor) return;
    if (def.blackPowder && race?.noBlackPowder) return;

    let newEq = { ...eq };

    if (slot === "armor") {
      if (eq.armor !== null) return; // already have armor
      newEq = { ...newEq, armor: uid };
    } else if (slot === "melee") {
      const hands = itemHands(def);
      const used = handsInSlot(member, stash, "melee");
      if (hands === 2 && used > 0) return;
      if (used + hands > 2) return;
      newEq = { ...newEq, melee: [...eq.melee, uid] };
    } else if (slot === "ranged") {
      const hands = itemHands(def);
      const used = handsInSlot(member, stash, "ranged");
      if (hands === 2 && used > 0) return;
      if (used + hands > 2) return;
      newEq = { ...newEq, ranged: [...eq.ranged, uid] };
    } else {
      newEq = { ...newEq, items: [...eq.items, uid] };
    }

    update(member.id, { equipped: newEq });
  };

  // Build loadout display
  const meleeUsed = handsInSlot(member, stash, "melee");
  const rangedUsed = handsInSlot(member, stash, "ranged");
  const meleeFull = meleeUsed >= 2 || (eq.melee.length === 1 && itemHands(defOf(eq.melee[0])) === 2);
  const rangedFull = rangedUsed >= 2 || (eq.ranged.length === 1 && itemHands(defOf(eq.ranged[0])) === 2);
  const armorFull = eq.armor !== null;

  // Items in stash not equipped to any other character
  const availableStash = stash.filter(entry => {
    const def = lookupDef(entry.itemId);
    if (!def) return false;
    if (def.id === "housing") return false; // company-wide, not equippable
    const owner = equippedBy(entry.uid, members);
    return owner === null || owner.id === member.id;
  });

  // Split available stash by slot
  const availMelee  = availableStash.filter(e => itemSlot(lookupDef(e.itemId)) === "melee");
  const availRanged = availableStash.filter(e => itemSlot(lookupDef(e.itemId)) === "ranged");
  const availArmor  = availableStash.filter(e => itemSlot(lookupDef(e.itemId)) === "armor");
  const availItems  = availableStash.filter(e => {
    const s = itemSlot(lookupDef(e.itemId));
    return s === "item";
  });

  const LoadoutSlot = ({ label, uids, slot, full, hideWhenFull }) => {
    const equipped = uids.map(uid => ({ uid, def: defOf(uid) }));
    return (
      <div className="eq-slot-group">
        <div className="eq-slot-head">
          <span className="eq-slot-lbl">{label}</span>
          <span className="eq-slot-hint">
            {slot === "melee"  ? `${meleeUsed}/2 hands` : ""}
            {slot === "ranged" ? `${rangedUsed}/2 hands` : ""}
            {slot === "armor"  ? (armorFull ? "Equipped" : "Empty") : ""}
            {slot === "items"  ? `${uids.length} equipped` : ""}
          </span>
        </div>
        <div className="eq-equipped-row">
          {equipped.length === 0 ? (
            <span className="eq-empty-slot">— empty —</span>
          ) : (
            equipped.map(({ uid, def }) => (
              <div key={uid} className="eq-chip equipped" onClick={() => toggleEquip(uid)} title="Click to unequip">
                <span className="eq-chip-name">{def?.name ?? "?"}</span>
                {armorVal(def) > 0 && <span className="eq-chip-stat">🛡{armorVal(def)}</span>}
                {def?.dmg && <span className="eq-chip-stat">⚔{def.dmg}</span>}
                <span className="eq-chip-remove">✕</span>
              </div>
            ))
          )}
        </div>
      </div>
    );
  };

  const AvailSection = ({ label, entries, slot }) => {
    if (entries.length === 0) return null;
    return (
      <div className="eq-avail-section">
        <div className="eq-avail-head">{label}</div>
        <div className="eq-avail-list">
          {entries.map(entry => {
            const def = lookupDef(entry.itemId);
            if (!def) return null;
            const isEquipped = allEquipped(member).includes(entry.uid);
            const equippedElsewhere = !isEquipped && equippedBy(entry.uid, members) !== null;

            // Check if this item can be equipped (slot capacity)
            let canEquipNow = true;
            if (!isEquipped) {
              if (slot === "armor" && armorFull) canEquipNow = false;
              if (slot === "melee") {
                const h = itemHands(def);
                if (h === 2 && meleeUsed > 0) canEquipNow = false;
                if (meleeUsed + h > 2) canEquipNow = false;
              }
              if (slot === "ranged") {
                const h = itemHands(def);
                if (h === 2 && rangedUsed > 0) canEquipNow = false;
                if (rangedUsed + h > 2) canEquipNow = false;
              }
              if (def.blackPowder && race?.noBlackPowder) canEquipNow = false;
              if (def.raceRestrict && member.raceId !== def.raceRestrict) canEquipNow = false;
              if (def.requiresMount && !(member.equipped?.items ?? []).some(uid => { const e = (stash ?? []).find(s => s.uid === uid); return e?.itemId === "mount"; })) canEquipNow = false;
              if (slot === "melee" && def.id !== "shield" && def.id !== "mirror_shield") {
                const leaderHasRF = (members ?? []).some(lm => lm.isLeader && Object.values(lm.talents ?? {}).includes("ranged_focus"));
                if (leaderHasRF) canEquipNow = false;
              }
              if (slot === "armor" && def.heavy && race?.noHeavyArmor) canEquipNow = false;
              if (slot === "armor" && def.armorType === "heavy" && race?.noHeavyArmor) canEquipNow = false;
              if (slot === "armor" && race?.noArmor) canEquipNow = false;
            }

            return (
              <div
                key={entry.uid}
                className={"eq-chip" + (isEquipped ? " equipped" : "") + (!canEquipNow || equippedElsewhere ? " eq-blocked" : "")}
                onClick={() => canEquipNow && !equippedElsewhere && toggleEquip(entry.uid)}
                title={equippedElsewhere ? "Equipped to another fighter" : !canEquipNow ? "Cannot equip — slot full or restricted" : isEquipped ? "Click to unequip" : "Click to equip"}
              >
                <span className="eq-chip-name">{def.name}</span>
                {armorVal(def) > 0 && <span className="eq-chip-stat">🛡{armorVal(def)}</span>}
                {def.dmg && <span className="eq-chip-stat">⚔{def.dmg}</span>}
                {def.range && def.range !== "Melee" && <span className="eq-chip-stat">📏{def.range}</span>}
                {isEquipped && <span className="eq-chip-remove">✕</span>}
                {equippedElsewhere && <span className="eq-chip-lock">🔒</span>}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const hasAnything = stash.filter(e => e.itemId !== "housing").length > 0;

  return (
    <div className="equip-wrap">
      {/* Current loadout */}
      <div className="eq-loadout">
        <div className="eq-loadout-head">Equipped Loadout</div>
        <LoadoutSlot label="⚔ Melee"  uids={eq.melee}            slot="melee"  full={meleeFull} />
        <LoadoutSlot label="🏹 Ranged" uids={eq.ranged}           slot="ranged" full={rangedFull} />
        <LoadoutSlot label="🛡 Armor"  uids={eq.armor ? [eq.armor] : []} slot="armor"  full={armorFull} />
        <LoadoutSlot label="🎒 Items"  uids={eq.items}            slot="items"  full={false} />
      </div>

      {/* Available from stash */}
      <div className="eq-available">
        <div className="eq-avail-title">
          Company Stash
          {!hasAnything && <span className="eq-stash-hint"> — purchase items in the Armory</span>}
        </div>
        <AvailSection label="Melee Weapons"  entries={availMelee}  slot="melee" />
        <AvailSection label="Ranged Weapons" entries={availRanged} slot="ranged" />
        <AvailSection label="Armor"          entries={availArmor}  slot="armor" />
        <AvailSection label="Items & Gear"   entries={availItems}  slot="item" />
        {hasAnything && availMelee.length === 0 && availRanged.length === 0 && availArmor.length === 0 && availItems.length === 0 && (
          <div className="eq-all-equipped">All stash items are equipped to other fighters.</div>
        )}
      </div>
    </div>
  );
}

function AugmentTab({ member, remaining, update }) {
  const race = raceOf(member.raceId) ?? {};
  return (
    <div>
      <p className="sec-note">A fighter may have at most one augment. Augments modify base stats and unlock abilities.</p>
      <div className="aug-grid">
        {AUGMENTS.map(a => {
          const active = member.augmentId === a.id;
          const blocked = (a.id === "bulky" && race?.noBulky) || (a.id === "nimble" && race?.noNimble);
          const canAfford = active || a.cost <= remaining;
          const disabled = blocked || !canAfford;
          return (
            <div key={a.id}
              className={`aug-card ${active ? "active" : ""} ${disabled ? "disabled" : ""}`}
              onClick={() => {
                if (blocked || (!active && !canAfford)) return;
                update(member.id, { augmentId: active ? null : a.id, spells: [] });
              }}>
              <div className="aug-name">{a.name} <span className="aug-cost">🪙 {a.cost}</span></div>
              <div className="aug-eff">{a.effect}</div>
              {blocked && <div className="aug-blocked">Not available for this race.</div>}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function SpellsTab({ member, stash, remaining, update }) {
  const available = getSpellsFor(member, stash);
  const aug = augOf(member.augmentId);
  const st = aug?.spellcaster;
  const standardSpells = available.filter(sp => !sp.tome);
  const tomeSpells = available.filter(sp => sp.tome);

  const SpellRow = ({ sp, showRarity }) => {
    const owned = (member.spells ?? []).includes(sp.id);
    const canAfford = owned || sp.cost <= remaining;
    const isExclusive = sp.for !== "all";
    return (
      <div
        className={"item-row " + (owned ? "owned " : "") + (!canAfford && !owned ? "disabled" : "")}
        onClick={() => {
          if (!canAfford && !owned) return;
          const next = owned ? member.spells.filter(id => id !== sp.id) : [...(member.spells ?? []), sp.id];
          update(member.id, { spells: next });
        }}>
        <div className="ir-check">{owned ? "\u2713" : "+"}</div>
        <div className="ir-info">
          <span className="ir-name">
            {sp.name}
            {isExclusive && <span className="kw" style={{marginLeft:".4rem"}}>
              {sp.for === "witch" ? "Witch" : sp.for === "sorcerer" ? "Sorcerer" : "Undead"}
            </span>}
            {sp.tome && <span className="kw" style={{marginLeft:".4rem",background:"rgba(100,60,160,.25)",borderColor:"rgba(150,100,220,.4)",color:"#b090e0"}}>Tome</span>}
            {showRarity && <span style={{marginLeft:".4rem",fontSize:".65rem",color:"var(--txt-d)"}}>Rarity {sp.rarity}</span>}
          </span>
          <span className="ir-meta">
            Diff: {sp.diff} · Range: {sp.range}
            {sp.dmg !== null ? " · DMG: " + sp.dmg : ""}
            {" · "}{sp.effect}
          </span>
        </div>
        <span className="ir-cost">\uD83E\uDE99 {sp.cost}</span>
      </div>
    );
  };

  return (
    <div>
      <p className="sec-note">
        Standard spells are purchased at the Market. Tomes must be found at the Library — roll 2d6 and meet or beat the rarity number to find a vendor.
        {st === "witch" ? " Life Drain is Witch-exclusive." : st === "sorcerer" ? " Manifest is Sorcerer-exclusive." : ""}
        {member.raceId === "undead" ? " Necrotic Bolt is available to Undead casters." : ""}
      </p>
      <div className="item-list">
        {standardSpells.map(sp => <SpellRow key={sp.id} sp={sp} showRarity={false} />)}
      </div>
      {tomeSpells.length > 0 && <>
        <div style={{margin:"1rem 0 .5rem",display:"flex",alignItems:"center",gap:".5rem"}}>
          <span style={{fontFamily:"'Cinzel',serif",fontSize:".75rem",color:"var(--gold)",textTransform:"uppercase",letterSpacing:".1em"}}>\uD83D\uDCDA Library Tomes</span>
          <div style={{flex:1,height:"1px",background:"rgba(200,149,42,.3)"}}></div>
        </div>
        <p className="sec-note" style={{marginBottom:".5rem"}}>Roll 2d6 at the Library — meet or beat the rarity number to find a vendor.</p>
        <div className="item-list">
          {tomeSpells.map(sp => <SpellRow key={sp.id} sp={sp} showRarity={true} />)}
        </div>
      </>}
    </div>
  );
}

function KeywordsPanel() {
  return (
    <div className="kw-panel">
      <div className="kw-title">Keyword Reference</div>
      <div className="kw-list">
        {Object.entries(KEYWORDS).map(([word, def]) => (
          <div key={word} className="kw-entry">
            <span className="kw-word">{word}</span>
            <div className="kw-def">{def}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function TalentsTab({ member, update, members }) {
  const availableCats = getAvailableCategories(member);
  const [selectedCat, setSelectedCat] = useState(availableCats[0] || "attributes");
  const { available, spent, remaining: pointsLeft } = getTalentPoints(member, members);
  const cat = TALENTS[selectedCat];
  const talents = member.talents ?? {};
  const hasTutor = Object.values(talents).includes("tutor");

  const getSelected = (catKey, tierIdx) => talents[`${catKey}_${tierIdx}`] ?? null;
  const hasPrevTier = (catKey, tierIdx) => tierIdx === 0 || !!getSelected(catKey, tierIdx - 1);

  const pickTalent = (catKey, tierIdx, talentId) => {
    const key = `${catKey}_${tierIdx}`;
    const current = talents[key];
    const newVal = current === talentId ? null : talentId;
    if (newVal && !current && pointsLeft <= 0) return;
    if (!newVal) {
      const laterFilled = Object.keys(talents).some(k => {
        const [kCat, kTier] = k.split("_");
        return kCat === catKey && parseInt(kTier) > tierIdx && talents[k];
      });
      if (laterFilled) return;
    }
    const extra = {};
    if (talentId === "tutor" && newVal === null) extra.tutorTarget = null;
    update(member.id, { talents: { ...talents, [key]: newVal }, ...extra });
  };

  return (
    <div className="talent-wrap">
      <div className="talent-points-bar">
        <span className="tp-label">Talent Points</span>
        <div className="tp-dots">
          {Array.from({ length: Math.max(available, 1) }, (_, i) => (
            <div key={i} className={`tp-dot ${i < spent ? "used" : i < available ? "available" : ""}`} />
          ))}
        </div>
        <span className="tp-text">{pointsLeft} remaining · {spent}/{available} used</span>
      </div>
      {hasTutor && (
        <div className="tutor-picker">
          <span className="tutor-label">🎓 Tutor — grant 1 talent point to:</span>
          <select
            value={member.tutorTarget ?? ""}
            onChange={e => update(member.id, { tutorTarget: e.target.value ? Number(e.target.value) : null })}
            className="tutor-select">
            <option value="">— choose member —</option>
            {(members ?? []).filter(m => m.id !== member.id).map(m => (
              <option key={m.id} value={m.id}>{m.name || m.raceId}</option>
            ))}
          </select>
        </div>
      )}
      <div className="cat-tabs">
        {availableCats.map(catKey => {
          const c = TALENTS[catKey];
          const hasPick = c.tiers.some((_, ti) => getSelected(catKey, ti));
          return (
            <div key={catKey} className={`cat-tab ${selectedCat === catKey ? "active" : ""}`} onClick={() => setSelectedCat(catKey)}>
              <span className="cat-tab-icon">{c.icon}</span>
              {c.name}
              {hasPick && <span className="cat-has-pick" />}
            </div>
          );
        })}
      </div>
      {cat && (
        <div className="tier-section">
          {cat.tiers.map((tierTalents, tierIdx) => {
            const isLocked = !hasPrevTier(selectedCat, tierIdx);
            const selected = getSelected(selectedCat, tierIdx);
            return (
              <div key={tierIdx}>
                {tierIdx > 0 && <div className="tier-connector"><span className="tier-arrow">▼</span></div>}
                <div className="tier-header">
                  <span className="tier-label">Tier {tierIdx + 1}</span>
                  {isLocked && <span className="tier-locked-badge">🔒 Locked — choose Tier {tierIdx} first</span>}
                </div>
                <div className="tier-cards">
                  {tierTalents.map(talent => {
                    const isSelected = selected === talent.id;
                    const noPoints = !isSelected && pointsLeft <= 0;
                    return (
                      <div key={talent.id}
                        className={`talent-card ${isSelected ? "t-selected" : ""} ${isLocked ? "t-locked" : ""} ${!isLocked && noPoints ? "t-no-points" : ""}`}
                        onClick={() => !isLocked && pickTalent(selectedCat, tierIdx, talent.id)}
                        title={noPoints && !isSelected ? "No talent points remaining" : ""}>
                        <div className="tc-name">{talent.name}{isSelected && <span className="tc-check">✓</span>}</div>
                        <div className="tc-desc">{talent.desc}</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── TITLES TAB ─── (Per-character: manage titles from rewards/talents)
function TitlesTab({ member, update }) {
  const ownedTitles = member.titles ?? [];
  // Only talent-granted title ids (not manually added ones)
  const talentTitles = Object.entries(member.talents ?? {}).map(([key, tid]) => {
    if (!tid) return null;
    const [catKey, tierStr] = key.split("_");
    const talent = TALENTS[catKey]?.tiers[parseInt(tierStr)]?.find(t => t.id === tid);
    if (!talent?.grantsTitle) return null;
    const title = TITLES.find(t => t.name === talent.grantsTitle);
    return title?.id ?? null;
  }).filter(Boolean);

  const toggleTitle = (id) => {
    if (talentTitles.includes(id)) return; // talent-granted, can't manually remove
    const has = ownedTitles.includes(id);
    update(member.id, { titles: has ? ownedTitles.filter(x => x !== id) : [...ownedTitles, id] });
  };

  return (
    <div className="market-wrap">
      <p className="sec-note">Click an unowned title to grant it. Click a held title to remove it. Titles granted by talents are locked — remove the talent to lose the title.</p>
      <div className="market-grid">
        {TITLES.map(title => {
          const fromTalent = talentTitles.includes(title.id);
          const isOwned = getTitles(member).some(t => t.id === title.id);
          const isManuallyOwned = isOwned && !fromTalent;
          return (
            <div key={title.id}
              className={"title-card" + (isOwned ? " tc-owned" : "") + (fromTalent ? " tc-locked" : "") + (isManuallyOwned ? " tc-removable" : "")}
              onClick={() => toggleTitle(title.id)}>
              <div className="tc-inf">
                <span className="tc-inf-num">{title.influence > 0 ? "+" + title.influence : "—"}</span>
                <span className="tc-inf-lbl">Inf</span>
              </div>
              <div className="tc-body">
                <div className="mc-top">
                  <span className="tc-name">{title.name}</span>
                  {fromTalent && <span className="mc-owned-badge">🔒 Talent</span>}
                  {isManuallyOwned && <span className="tc-remove-badge">✕ Remove</span>}
                  {!isOwned && <span style={{fontSize:'.68rem',color:'var(--txt-d)',marginLeft:'auto'}}>Click to grant</span>}
                </div>
                {title.effect && <div className="tc-effect">{title.effect}</div>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function PrintModal({ members, stash, minions, companyName, companyBanner, activeFaction, onClose }) {
  const faction = activeFaction ? FACTION_BONUSES[activeFaction] : null;

  const equippedNames = (m, slot) => {
    const uids = slot === "armor" ? (m.equipped?.armor ? [m.equipped.armor] : []) : (m.equipped?.[slot] ?? []);
    return uids.map(uid => {
      const e = stash.find(s => s.uid === uid);
      return e ? lookupDef(e.itemId)?.name : null;
    }).filter(Boolean);
  };

  return (
    <div className="backdrop print-backdrop" onClick={onClose}>
      <div className="print-modal" onClick={e => e.stopPropagation()}>
        <div className="pm-header">
          {companyBanner && <img src={companyBanner} className="pm-banner" alt="Sigil" />}
          <div className="pm-title">{companyName}</div>
          <div className="pm-sub">Brannigan · Company Roster</div>
          {faction && <div className="pm-faction">{faction.icon} {faction.label} — {faction.bonus}</div>}
        </div>
        <div className="pm-grid">
          {members.map(m => {
            const race = raceOf(m.raceId) ?? { name:"Unknown" };
            const aug = augOf(m.augmentId);
            const melee  = equippedNames(m, "melee");
            const ranged = equippedNames(m, "ranged");
            const armor  = equippedNames(m, "armor");
            const items  = equippedNames(m, "items");
            const spells = (m.spells ?? []).map(id => SPELLS.find(s => s.id === id)?.name).filter(Boolean);
            const pickedTalents = Object.entries(m.talents ?? {}).map(([key, talentId]) => {
              if (!talentId) return null;
              const [catKey, tierStr] = key.split("_");
              const cat = TALENTS[catKey];
              const talent = cat?.tiers[parseInt(tierStr)]?.find(t => t.id === talentId);
              return (talent && cat) ? { cat: cat.name, tier: parseInt(tierStr) + 1, ...talent } : null;
            }).filter(Boolean);
            return (
              <div key={m.id} className="pm-card">
                <div className="pm-card-name">
<span>{m.isLeader ? "👑 " : ""}{m.name}</span>
                  <span className="pm-card-level">Lv {getLevel(m.xp)} · {m.xp} XP</span>
                </div>
                <div className="pm-row">
                  <span className="pm-lbl">Race</span>
                  <span className="pm-val">{race?.name ?? "Unknown"}</span>
                  {aug && <><span className="pm-lbl" style={{marginLeft:'.5rem'}}>Augment</span><span className="pm-val">{aug.name}</span></>}
                </div>
                <div className="pm-row">
                  <span className="pm-lbl">Stats</span>
                  <span className="pm-tag">♥ {getHP(m)} HP</span>
                  <span className="pm-tag">⚡ {getSpeed(m, stash)}</span>
                  <span className="pm-tag">🛡 {getArmor(m, stash)}</span>
                  <span className="pm-tag">🪙 {getMemberCost(m)}</span>
                </div>
                {melee.length > 0 && <div className="pm-row"><span className="pm-lbl">Melee</span><span className="pm-val">{melee.join(", ")}</span></div>}
                {ranged.length > 0 && <div className="pm-row"><span className="pm-lbl">Ranged</span><span className="pm-val">{ranged.join(", ")}</span></div>}
                {armor.length > 0 && <div className="pm-row"><span className="pm-lbl">Armor</span><span className="pm-val">{armor.join(", ")}</span></div>}
                {items.length > 0 && <div className="pm-row"><span className="pm-lbl">Items</span><span className="pm-val">{items.join(", ")}</span></div>}
                {spells.length > 0 && <div className="pm-row"><span className="pm-lbl">Spells</span><span className="pm-val">{spells.join(", ")}</span></div>}
                {pickedTalents.length > 0 && (
                  <div className="pm-talent-list">
                    <div className="pm-row"><span className="pm-lbl">Talents</span></div>
                    {pickedTalents.map((t, i) => (
                      <div key={i} className="pm-talent">
                        <span className="pm-talent-name">{t.name}</span>
                        <span className="pm-val">{t.desc}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
        {minions.length > 0 && (
          <div className="pm-minions">
            <div className="pm-sub" style={{textAlign:'left',marginBottom:'.75rem'}}>Minions</div>
            {minions.map(mn => {
              const type = MINION_TYPES.find(t => t.id === mn.typeId);
              if (!type) return null;
              return (
                <div key={mn.id} className="pm-minion-row">
                  <span>{type.icon} {type.name}</span>
                  <span style={{display:'flex',gap:'.5rem'}}>
                    <span className="pm-tag">♥ {type.hp}</span>
                    <span className="pm-tag">⚡ {type.speed}</span>
                    {type.dmg && <span className="pm-tag">DMG {type.dmg}</span>}
                  </span>
                </div>
              );
            })}
          </div>
        )}
        <div className="pm-footer">⚔ {companyName} · Mustered with Brannigan ⚔</div>
        <button className="pm-print-btn" onClick={() => window.print()}>🖨 Print / Save as PDF</button>
      </div>
    </div>
  );
}

// ===================== MAIN APP =====================
// ===================== MAIN APP =====================

class ErrorBoundary extends React.Component {
  constructor(props) { super(props); this.state = { error: null }; }
  static getDerivedStateFromError(e) { return { error: e }; }
  render() {
    if (this.state.error) {
      return (
        <div style={{padding:"2rem",color:"#f88",fontFamily:"monospace",background:"#1a0808",border:"1px solid #f44",borderRadius:"8px",margin:"1rem"}}>
          <b>Error:</b> {this.state.error.message}<br/><br/>
          <pre style={{fontSize:".75rem",whiteSpace:"pre-wrap",opacity:.8}}>{this.state.error.stack}</pre>
        </div>
      );
    }
    return this.props.children;
  }
}

function RaceCard({ race, disabled, atMax, tooExpensive, full, onAdd, onRemove }) {
  const [flash, setFlash] = useState(null);
  const trigger = (type, fn) => {
    fn();
    setFlash(type);
    setTimeout(() => setFlash(null), 400);
  };
  return (
    <div className={`race-card ${disabled ? "disabled" : ""}`}>
      <div className="rc-name">{race.name}</div>
      <div className="rc-stats">
        <span className="rc-stat">🪙 {race.cost}</span>
        <span className="rc-stat">♥ {race.hp}</span>
        <span className="rc-stat">⚡ {race.speed}"</span>
      </div>
      <div className="rc-special">{race.special}</div>
      {atMax && <div className="rc-limit">⚠ Max {race.maxPercompany} per company</div>}
      {!atMax && tooExpensive && <div className="rc-limit">⚠ Insufficient gold</div>}
      {!atMax && !tooExpensive && full && <div className="rc-limit">⚠ Company is full</div>}
      {!disabled && (
        <div className="rc-hover">
          <div className={"rc-add" + (flash === "add" ? " flash" : "")} onClick={() => trigger("add", onAdd)}>+</div>
          <div className="rc-divider" />
          <div className={"rc-remove" + (flash === "rem" ? " flash" : "")} onClick={() => trigger("rem", onRemove)}>−</div>
        </div>
      )}
    </div>
  );
}

function App() {
  const [members, setMembers] = useState([]);
  const [stash, setStash] = useState([]); // Company inventory: { uid, itemId }[]
  const [minions, setMinions] = useState([]);
  const [companyName, setcompanyName] = useState("The Iron Company");
  const [companyBanner, setCompanyBanner] = useState(null);
  const [goldPool, setGoldPool] = useState(STARTING_GOLD);
  const [influence, setInfluence] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [recentlyAdded, setRecentlyAdded] = useState(0);
  const [showEquip, setShowEquip] = useState(false);
  const [showMinionModal, setShowMinionModal] = useState(false);
  const [showPrint, setShowPrint] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [importText, setImportText] = useState("");
  const [importError, setImportError] = useState("");
  const [copied, setCopied] = useState(false);
  const [codeCopied, setCodeCopied] = useState(false);
  const [expandedId, setExpandedId] = useState(null);
  const [tabs, setTabs] = useState({});

  // Faction detection
  const raceIds = members.map(m => m.raceId);
  const uniqueRaces = [...new Set(raceIds)];
  const isUndeadMix = uniqueRaces.length > 0 && uniqueRaces.every(r => UNDEAD_RACES.includes(r));
  const isSingleRace = uniqueRaces.length === 1;
  const activeFaction = (isSingleRace || isUndeadMix) ? (isSingleRace ? uniqueRaces[0] : "undead") : null;
  const halflingBonus = activeFaction === "halfling" && members.length > 0;

  const hasHousing = stash.some(e => e.itemId === "housing");
  const maxSize = (hasHousing ? HOUSING_MAX : DEFAULT_MAX) + (halflingBonus ? 2 : 0);

  const minionSpend  = minions.reduce((s, mn) => s + getMinionCost(MINION_TYPES.find(t => t.id === mn.typeId), activeFaction), 0);
  const memberSpend  = members.reduce((s, m) => s + getMemberCost(m), 0);
  const stashSpend   = getStashCost(stash);
  const totalSpent   = memberSpend + stashSpend + minionSpend;
  const remaining    = goldPool - totalSpent;
  const overBudget   = remaining < 0;
  const pct          = Math.min((totalSpent / goldPool) * 100, 100);

  const addMember = (race) => {
    if (members.length >= maxSize) return;
    if (race.maxPercompany && members.filter(m => m.raceId === race.id).length >= race.maxPercompany) return;
    if (race.cost > remaining) return;
    const m = newMember(race);
    setMembers(prev => [...prev, m]);
    setExpandedId(m.id);
    setTabs(prev => ({ ...prev, [m.id]: "augment" }));
    setRecentlyAdded(prev => prev + 1);
  };

  const addMinion = (type) => {
    if (getMinionCost(type, activeFaction) > remaining) return;
    if (type.maxPerCompany && minions.filter(mn => mn.typeId === type.id).length >= type.maxPerCompany) return;
    setMinions(prev => [...prev, newMinion(type)]);
    setShowMinionModal(false);
  };

  const deleteMinion = (id) => setMinions(prev => prev.filter(mn => mn.id !== id));
  const updateMinion = (id, patch) => setMinions(prev => prev.map(mn => mn.id === id ? { ...mn, ...patch } : mn));

  const readImg = (file, onDone) => {
    const reader = new FileReader();
    reader.onload = e => onDone(e.target.result);
    reader.readAsDataURL(file);
  };

  // ── Export / Import ──
  const encodeRoster = () => {
    const data = {
      n: companyName,
      g: goldPool,
      inf: influence,
      st: stash.map(e => ({ i: e.itemId, s: e.source ?? "shop" })),
      m: members.map(m => ({
        n: m.name,
        r: m.raceId,
        a: m.augmentId,
        l: m.isLeader ? 1 : 0,
        x: m.xp,
        s: m.spells,
        t: m.talents,
        ti: m.titles ?? [],
        // equipped: store as itemId arrays (uids reset on import anyway)
        eq: {
          me: (m.equipped?.melee  ?? []).map(uid => stash.find(e => e.uid === uid)?.itemId).filter(Boolean),
          ra: (m.equipped?.ranged ?? []).map(uid => stash.find(e => e.uid === uid)?.itemId).filter(Boolean),
          ar: m.equipped?.armor ? stash.find(e => e.uid === m.equipped.armor)?.itemId ?? null : null,
          it: (m.equipped?.items  ?? []).map(uid => stash.find(e => e.uid === uid)?.itemId).filter(Boolean),
        },
      })),
      mn: minions.map(mn => ({ t: mn.typeId, o: mn.ownerId })),
    };
    return btoa(unescape(encodeURIComponent(JSON.stringify(data))));
  };

  const decodeRoster = (code) => {
    const data = JSON.parse(decodeURIComponent(escape(atob(code.trim()))));

    // Rebuild stash with fresh uids (supports both old format [itemId] and new [{i,s}])
    const rawStash = (data.st ?? []).map(entry => {
      if (typeof entry === "string") return { uid: newId(), itemId: entry, source: "shop" };
      return { uid: newId(), itemId: entry.i, source: entry.s ?? "shop" };
    });

    // Build members - need to map itemId → uid in new stash
    // For equipped: each itemId takes the first available uid from stash
    const usedUids = new Set();
    const claimUid = (itemId) => {
      const entry = rawStash.find(e => e.itemId === itemId && !usedUids.has(e.uid));
      if (entry) { usedUids.add(entry.uid); return entry.uid; }
      return null;
    };

    const members = (data.m ?? []).map(m => {
      const melee  = (m.eq?.me ?? []).map(claimUid).filter(Boolean);
      const ranged = (m.eq?.ra ?? []).map(claimUid).filter(Boolean);
      const armor  = m.eq?.ar ? claimUid(m.eq.ar) : null;
      const items  = (m.eq?.it ?? []).map(claimUid).filter(Boolean);
      return {
        id: newId(),
        name: m.n,
        raceId: m.r,
        augmentId: m.a ?? null,
        isLeader: !!m.l,
        xp: m.x ?? 0,
        spells: m.s ?? [],
        talents: m.t ?? {},
        titles: m.ti ?? [],
        equipped: { melee, ranged, armor, items },
          };
    });

    const minions = (data.mn ?? []).map(mn => ({
      id: newId(), name: mn.n, typeId: mn.t, ownerId: mn.o ?? null,
    }));

    const validMembers = members.filter(m => !!raceOf(m.raceId));
    return {
      companyName: data.n ?? "The Iron Company",
      companyBanner: null,
      goldPool: data.g ?? STARTING_GOLD,
      influence: data.inf ?? 0,
      stash: rawStash,
      members: validMembers,
      minions,
    };
  };

  const copyCode = () => {
    try {
      navigator.clipboard.writeText(encodeRoster()).then(() => {
        setCodeCopied(true);
        setTimeout(() => setCodeCopied(false), 2000);
      });
    } catch (e) {}
  };

  const copyAsText = () => {
    const lines = ["⚔ " + companyName + " ⚔"];
    if (activeFaction) {
      const f = FACTION_BONUSES[activeFaction];
      lines.push("Faction: " + f.label + " — " + f.bonus);
    }
    lines.push("─".repeat(40));
    members.forEach(m => {
      const race = raceOf(m.raceId) ?? { name:"Unknown" };
      const aug = augOf(m.augmentId);
      lines.push((m.isLeader ? "👑 " : "") + m.name + " (" + (race?.name ?? "Unknown") + (aug ? " · " + aug.name : "") + ") — Lv" + getLevel(m.xp) + " · " + getHP(m) + " HP · " + getSpeed(m, stash) + " · 🛡" + getArmor(m, stash) + " · 🪙" + getMemberCost(m));
      const meleNames = (m.equipped?.melee ?? []).map(uid => stash.find(e=>e.uid===uid)).filter(Boolean).map(e=>lookupDef(e.itemId)?.name).filter(Boolean);
      if (meleNames.length) lines.push("  Melee: " + meleNames.join(", "));
      const rangNames = (m.equipped?.ranged ?? []).map(uid => stash.find(e=>e.uid===uid)).filter(Boolean).map(e=>lookupDef(e.itemId)?.name).filter(Boolean);
      if (rangNames.length) lines.push("  Ranged: " + rangNames.join(", "));
      if (m.equipped?.armor) {
        const ae = stash.find(e=>e.uid===m.equipped.armor);
        if (ae) lines.push("  Armor: " + (lookupDef(ae.itemId)?.name ?? "?"));
      }
      const itmNames = (m.equipped?.items ?? []).map(uid => stash.find(e=>e.uid===uid)).filter(Boolean).map(e=>lookupDef(e.itemId)?.name).filter(Boolean);
      if (itmNames.length) lines.push("  Items: " + itmNames.join(", "));
      const spells = (m.spells ?? []).map(id => SPELLS.find(s => s.id === id)?.name).filter(Boolean);
      if (spells.length) lines.push("  Spells: " + spells.join(", "));
      const talentNames = Object.entries(m.talents ?? {}).map(([key, tid]) => {
        if (!tid) return null;
        const [catKey, tierStr] = key.split("_");
        return TALENTS[catKey]?.tiers[parseInt(tierStr)]?.find(t => t.id === tid)?.name ?? null;
      }).filter(Boolean);
      if (talentNames.length) lines.push("  Talents: " + talentNames.join(", "));
    });
    if (stash.length > 0) {
      lines.push("─".repeat(40));
      const stashNames = stash.map(e => lookupDef(e.itemId)?.name ?? e.itemId);
      lines.push("Stash: " + stashNames.join(", "));
    }
    if (minions.length) {
      lines.push("─".repeat(40));
      lines.push("Minions:");
      minions.forEach(mn => {
        const type = MINION_TYPES.find(t => t.id === mn.typeId);
        if (type) lines.push("  " + type.icon + " " + type.name + " — ♥" + type.hp + " ⚡" + type.speed);
      });
    }
    lines.push("─".repeat(40));
    lines.push("Total spent: 🪙" + totalSpent + " / " + goldPool);
    navigator.clipboard.writeText(lines.join("\n")).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const importRoster = () => {
    try {
      if (!importText.trim()) { setImportError("Paste your export code here."); return; }
      const parsed = decodeRoster(importText);
      if (parsed.members.length === 0) { setImportError("No fighters found."); return; }
      setMembers(parsed.members);
      setStash(parsed.stash ?? []);
      setMinions(parsed.minions);
      setcompanyName(parsed.companyName);
      setCompanyBanner(null);
      setGoldPool(parsed.goldPool ?? STARTING_GOLD);
      setInfluence(parsed.influence ?? 0);
      setExpandedId(null);
      setTabs({});
      setShowImport(false);
      setImportText("");
      setImportError("");
    } catch (e) {
      setImportError("Couldn't read that code. Make sure you copied the full export code.");
    }
  };

  const deleteMember = (id) => {
    // Unequip all items from this member before deleting
    setMembers(prev => prev.filter(m => m.id !== id));
    setMinions(prev => prev.map(mn => mn.ownerId === id ? { ...mn, ownerId: null } : mn));
    if (expandedId === id) setExpandedId(null);
  };

  const sacrificeMember = (member) => {
    const talentList = Object.values(member.talents ?? {}).filter(Boolean);
    const sacrificeTalent = ["glory", "greed", "enthrall", "rage_sac"].find(t => talentList.includes(t));
    if (!sacrificeTalent) return;

    const talentNames = { glory: "Glory (1 influence)", greed: "Greed (6 gems)", enthrall: "Enthrall (leader +1 talent point)", rage_sac: "Rage (leader +2 attack rolls)" };
    const confirmed = window.confirm(`Sacrifice ${member.name}?\n\nEffect: ${talentNames[sacrificeTalent]}\n\nAll equipped items will be returned to the company stash. This cannot be undone.`);
    if (!confirmed) return;

    // Return all equipped items to stash (unequip by removing from member — stash entries remain)
    setMembers(prev => prev.map(m => {
      if (m.id === member.id) return null; // will be filtered
      // Apply rage_sac to leader
      if (sacrificeTalent === "rage_sac" && m.isLeader) return { ...m, rageSacBonus: true };
      // Apply enthrall to leader — give extra talent point
      if (sacrificeTalent === "enthrall" && m.isLeader) return { ...m, bonusTalentPoints: (m.bonusTalentPoints ?? 0) + 1 };
      return m;
    }).filter(Boolean));

    // Unequip all items (they stay in stash automatically since stash is separate)
    // Nothing needed — items in stash are already there, equipped refs just live on member

    setMinions(prev => prev.map(mn => mn.ownerId === member.id ? { ...mn, ownerId: null } : mn));
    if (expandedId === member.id) setExpandedId(null);
  };

  const update = (id, patch) => setMembers(prev => prev.map(m => m.id === id ? { ...m, ...patch } : m));

  const getTab = (id) => tabs[id] || "augment";
  const setTab = (id, t) => setTabs(prev => ({ ...prev, [id]: t }));

  const TABS_FOR = (m) => ["augment", "equip", "talents", "titles"];

  return (
    <>
      <ErrorBoundary>
      <style>{CSS}</style>

      {/* Race selection modal */}
      {showModal && (
        <div className="backdrop" onClick={() => { setShowModal(false); setRecentlyAdded(0); }}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-hdr">
              <h2>Add Members</h2>
              <button className="close-btn" onClick={() => { setShowModal(false); setRecentlyAdded(0); }}>✕</button>
            </div>
            <div className="modal-sub">{members.length}/{maxSize} slots filled · 🪙 {remaining} gold remaining{recentlyAdded > 0 && <span style={{marginLeft:".75rem",color:"#7aee9a",fontWeight:"bold"}}>✓ {recentlyAdded} added this session</span>}</div>
            <div className="race-grid">
              {RACES.map(race => {
                const atMax = race.maxPercompany && members.filter(m => m.raceId === race.id).length >= race.maxPercompany;
                const tooExpensive = race.cost > remaining;
                const full = members.length >= maxSize;
                const disabled = atMax || tooExpensive || full;
                return (
                  <RaceCard key={race.id} race={race} disabled={disabled} atMax={atMax} tooExpensive={tooExpensive} full={full}
                    onAdd={() => addMember(race)}
                    onRemove={() => {
                      const last = [...members].reverse().find(m => m.raceId === race.id);
                      if (last) { setMembers(prev => prev.filter(m => m.id !== last.id)); setRecentlyAdded(prev => Math.max(0, prev - 1)); }
                    }} />
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Minion modal */}
      {showMinionModal && (
        <div className="backdrop" onClick={() => setShowMinionModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-hdr">
              <h2>Add a Minion</h2>
              <button className="close-btn" onClick={() => setShowMinionModal(false)}>✕</button>
            </div>
            <div className="modal-sub">Minions don't count towards your company size cap · 🪙 {remaining} gold remaining</div>
            <div className="minion-modal-grid">
              {MINION_TYPES.map(type => {
                const atMax = type.maxPerCompany && minions.filter(mn => mn.typeId === type.id).length >= type.maxPerCompany;
                const cost = getMinionCost(type, activeFaction);
                const tooExpensive = cost > remaining;
                const disabled = atMax || tooExpensive;
                const isDiscounted = cost !== type.cost;
                return (
                  <div key={type.id} className={`minion-modal-card ${disabled ? "disabled" : ""}`} onClick={() => !disabled && addMinion(type)}>
                    <span className="mm-icon">{type.icon}</span>
                    <div className="mm-name">{type.name}</div>
                    <div className="mm-stats">
                      <span className="mm-stat">
                        {isDiscounted ? <><s style={{opacity:.5}}>🪙 {type.cost}</s> 🪙 {cost} 🐀</> : <>🪙 {cost}</>}
                      </span>
                      <span className="mm-stat">♥ {type.hp}</span>
                      <span className="mm-stat">⚡ {type.speed}</span>
                      {type.dmg && <span className="mm-stat">DMG {type.dmg}</span>}
                      {type.hit && <span className="mm-stat">HIT {type.hit}</span>}
                    </div>
                    <div className="mm-special">{type.special}</div>
                    {atMax && <div className="mm-limit">⚠ Max {type.maxPerCompany} per company</div>}
                    {!atMax && tooExpensive && <div className="mm-limit">⚠ Insufficient gold</div>}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {showPrint && (
        <PrintModal members={members} stash={stash} minions={minions} companyName={companyName} companyBanner={companyBanner} activeFaction={activeFaction} onClose={() => setShowPrint(false)} />
      )}

      {showImport && (
        <div className="backdrop" onClick={() => { setShowImport(false); setImportError(""); setImportText(""); }}>
          <div className="import-modal" onClick={e => e.stopPropagation()}>
            <div className="import-title">📥 Import Roster</div>
            <div className="import-sub">Paste your export code below.</div>
            <textarea className="import-textarea" placeholder="Paste export code here…" value={importText} onChange={e => { setImportText(e.target.value); setImportError(""); }} autoFocus />
            {importError && <div className="import-error">⚠ {importError}</div>}
            <div className="import-actions">
              <button className="import-confirm" onClick={importRoster}>✓ Import Company</button>
              <button className="import-cancel" onClick={() => { setShowImport(false); setImportText(""); setImportError(""); }}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Armory modal */}
      {showEquip && (
        <div className="backdrop" onClick={() => setShowEquip(false)}>
          <div className="armory-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-hdr">
              <h2>⚒ Equipment</h2>
              <button className="close-btn" onClick={() => setShowEquip(false)}>✕</button>
            </div>
            <div className="armory-modal-sub">🪙 {remaining} gold remaining · Purchase items, spells and tomes for your company.</div>
            {hasHousing && <div className="armory-housing-badge">🏠 Housing · Company size +2</div>}
            <ArmoryPanel stash={stash} setStash={setStash} remaining={remaining} members={members} update={update} />
          </div>
        </div>
      )}

      <div className="app">
        <header className="hdr">
          <h1>Brannigan</h1>
          <p className="hdr-sub">Muster your company. Arm them well. March to glory — or ruin.</p>
          <div className="hdr-rule">⚔ ✦ ⚔</div>
        </header>

        {/* Top bar */}
        <div className="topbar">
          <div className="tb-row1">
            <input type="file" accept="image/*" className="file-input" id="banner-upload"
              onChange={e => { if (e.target.files[0]) readImg(e.target.files[0], setCompanyBanner); e.target.value = ""; }} />
            <div className="tb-sigil">
              <label htmlFor="banner-upload" title="Upload company sigil">
                {companyBanner
                  ? <img src={companyBanner} className="tb-sigil-img" alt="Sigil" />
                  : <div className="tb-sigil-placeholder">🏴</div>}
              </label>
              {companyBanner && (
                <button className="tb-sigil-remove" onClick={() => setCompanyBanner(null)} title="Remove sigil">✕</button>
              )}
            </div>
            <div className="tb-name-input">
              <span className="tb-lbl">⚔</span>
              <input className="tb-input" value={companyName} onChange={e => setcompanyName(e.target.value)} placeholder="Name your company…" />
            </div>
          </div>
          <div className="tb-row2">
            <div className="influence-tracker">
              <div className="inf-controls">
                <button className="inf-btn" onClick={() => setGoldPool(v => Math.max(totalSpent, v - 1))}>−</button>
                <span className={`inf-val ${overBudget ? "danger" : ""}`}>🪙 {remaining}</span>
                <button className="inf-btn" onClick={() => setGoldPool(v => v + 1)}>+</button>
              </div>
              <span className="inf-lbl">Gold</span>
            </div>
            <div className="tb-div" />
            <div className="tb-stat">
              <span className="tb-val">{members.length}/{maxSize}</span>
              <span className="tb-lbl2">Fighters</span>
            </div>
            <div className="tb-div" />
            <div className="influence-tracker">
              <div className="inf-controls">
                <button className="inf-btn" onClick={() => setInfluence(v => v - 1)}>−</button>
                <span className="inf-val">{influence}</span>
                <button className="inf-btn" onClick={() => setInfluence(v => v + 1)}>+</button>
              </div>
              <span className="inf-lbl">Influence</span>
            </div>
          </div>
        </div>

        <div className="prog-wrap">
          <div className={`prog-fill ${pct > 100 ? "danger" : pct > 85 ? "warn" : ""}`} style={{ width: `${Math.min(pct,100)}%` }} />
        </div>
        {overBudget && <div className="budget-warn">⚠ Over budget by 🪙 {Math.abs(remaining)} — sell items from the Equipment panel to resolve.</div>}

        <div className="layout">
          {/* Main column */}
          <div>
            <div className="sec-head">Your Company</div>
            <FactionBanner members={members} />

            <div className="recruit-row">
              <button className="add-btn add-btn-members" onClick={() => setShowModal(true)} disabled={members.length >= maxSize}>
                + Members ({members.length}/{maxSize})
              </button>
              <button className="add-btn add-btn-equip" onClick={() => setShowEquip(true)}>
                ⚒ Equipment {stash.length > 0 ? `(${stash.length})` : ""}
              </button>
            </div>

            {members.length === 0 ? (
              <div className="empty">
                <p>No fighters mustered.</p>
                <p style={{ fontSize: ".85rem", marginTop: ".5rem" }}>Click "+ Members" to begin building your company.</p>
              </div>
            ) : (
              <div className="roster">
                {members.map(member => {
                  const race = raceOf(member.raceId) ?? { name:"?", special:"" };
                  const aug = augOf(member.augmentId);
                  const isOpen = expandedId === member.id;
                  const tab = getTab(member.id);
                  const memberTabs = TABS_FOR(member);
                  const isUndeadCapped = member.raceId === "undead" && !member.isLeader;
                  const boxCount = isUndeadCapped ? 10 : 20;
                  const maxXp = isUndeadCapped ? 50 : 100;

                  return (
                    <div key={member.id} className={`member-card ${isOpen ? "open" : ""}`}>
                      <div className="mem-head" onClick={() => setExpandedId(isOpen ? null : member.id)}>

                        <div className="mh-left">
                          <input className="mh-name" value={member.name} onChange={e => { e.stopPropagation(); update(member.id, { name: e.target.value }); }} onClick={e => e.stopPropagation()} placeholder="Name this fighter…" />
                          <div className="mh-badges">
                            <span className="badge badge-race">{race?.name ?? "?"}</span>
                            {aug && <span className="badge badge-aug">{aug.name}</span>}
                            <button
                              className={`badge leader-badge-btn ${member.isLeader ? "is-leader" : ""}`}
                              title={member.isLeader ? "Remove as leader" : "Set as Company Leader"}
                              onClick={e => { e.stopPropagation(); const b = !member.isLeader; setMembers(prev => prev.map(m => ({ ...m, isLeader: m.id === member.id ? b : b ? false : m.isLeader }))); }}>
                              👑 Leader
                            </button>
                            {getTitles(member).map(t => <span key={t.id} className="title-badge">{t.name}</span>)}
                          </div>
                          <div className="mh-controls" onClick={e => e.stopPropagation()}>
                            <div className="level-wrap">
                              <span className="level-lbl">XP</span>
                              <span className="xp-level-badge">Lv {getLevel(member.xp)}</span>
                              <div className="xp-boxes">
                                {Array.from({length: boxCount}, (_, i) => {
                                  const boxXp = (i + 1) * 5;
                                  const filled = member.xp >= boxXp;
                                  const isThreshold = LEVEL_THRESHOLDS.includes(boxXp);
                                  return (
                                    <div key={i}
                                      className={`xp-box ${filled ? "filled" : ""} ${isThreshold ? "threshold" : ""}`}
                                      title={boxXp + " XP" + (isThreshold ? " · Level " + getLevel(boxXp) : "")}
                                      onClick={() => update(member.id, { xp: filled && member.xp === boxXp ? boxXp - 5 : boxXp })}
                                    />
                                  );
                                })}
                              </div>
                              <span className="xp-total">{member.xp}/{maxXp}</span>
                              {isUndeadCapped && <span className="xp-cap-note">Lv 5 cap</span>}
                            </div>
                          <div className="stat-row" onClick={e => e.stopPropagation()}>
                            <span className="mem-stat">♥ {getHP(member)}</span>
                            <span className="mem-stat">⚡ {getSpeed(member, stash)}</span>
                            <span className="mem-stat">🛡 {getArmor(member, stash)}</span>
                            {(() => {
                              const isBulky = member.augmentId === "bulky" || Object.values(member.talents ?? {}).includes("bulk");
                              const mBonus = getHitBonus(member, stash, "melee", members);
                              const rBonus = getHitBonus(member, stash, "ranged", members);
                              const mStr = getHitStr(member, stash, "melee", members);
                              const rStr = getHitStr(member, stash, "ranged", members);
                              const riseStr = getRiseAgainStr(member);
                              const talentList = Object.values(member.talents ?? {}).filter(Boolean);
                              const riseBonus = (talentList.includes("reise") ? 1 : 0) + (talentList.includes("mercy") ? 1 : 0);
                              return (<>
                                <span className={`mem-stat mem-hit ${mBonus > 0 ? "hit-good" : mBonus < 0 ? "hit-bad" : ""}`} title={`Melee to hit${mBonus !== 0 ? ` (${mBonus > 0 ? "+" : ""}${mBonus} bonus)` : ""}${(member.equipped?.melee ?? []).length === 2 ? " · Dual wield: attacks twice" : ""}`}>⚔ {mStr}</span>
                                <span className={`mem-stat mem-hit ${rBonus > 0 ? "hit-good" : rBonus < 0 ? "hit-bad" : ""}`} title={`Ranged to hit${rBonus !== 0 ? ` (${rBonus > 0 ? "+" : ""}${rBonus} bonus)` : ""}`}>🏹 {rStr}</span>
                                {isBulky && <span className="mem-stat mem-bulky-warn" title="Ranged attacks against this character get +1 to hit">🎯 Easy target</span>}
                                {riseStr && <span className={`mem-stat mem-hit ${riseBonus > 0 ? "hit-good" : ""}`} title={`Rise Again roll${riseBonus > 0 ? ` (+${riseBonus} bonus)` : " (base)"}`}>💀 {riseStr}</span>}
                                {member.rageSacBonus && <span className="mem-stat hit-good" title="Rage sacrifice active: +2 to all attack rolls">⚔ +2 Rage</span>}
                              </>);
                            })()}
                          </div>
                          </div>
                        </div>
                        <div className="mh-right">
                          <button className="del-btn" onClick={e => { e.stopPropagation(); deleteMember(member.id); }} title="Dismiss">✕</button>
                          {member.raceId === "undead" && ["glory","greed","enthrall","rage_sac"].some(t => Object.values(member.talents ?? {}).includes(t)) && (
                            <button className="sac-btn" onClick={e => { e.stopPropagation(); sacrificeMember(member); }} title="Sacrifice this character">☠</button>
                          )}
                          <span className={`chevron ${isOpen ? "open" : ""}`}>▼</span>
                        </div>
                      </div>

                      {isOpen && (
                        <div className="mem-body">
                          {race?.name && <div className="race-bar"><span className="race-bar-lbl">{race.name}:</span>{race.special}</div>}
                          {(member.spells ?? []).length > 0 && (
                            <div className="race-bar" style={{flexWrap:"wrap",gap:".3rem"}}>
                              <span className="race-bar-lbl">Spells:</span>
                              {(member.spells ?? []).map(sid => {
                                const sp = SPELLS.find(s => s.id === sid);
                                return sp ? <span key={sid} className="kw" style={{fontSize:".65rem",background: sp.tome ? "rgba(100,60,160,.2)" : undefined, borderColor: sp.tome ? "rgba(150,100,220,.4)" : undefined, color: sp.tome ? "#b090e0" : undefined}}>{sp.name}</span> : null;
                              })}
                            </div>
                          )}
                          <div className="tabs">
                            {memberTabs.map(t => (
                              <button key={t} className={`tab-btn ${tab === t ? "active" : ""}`} onClick={() => setTab(member.id, t)}>
                                {t === "equip" ? "⚔ Equip" : t === "titles" ? "🏅 Titles" : t.charAt(0).toUpperCase() + t.slice(1)}
                              </button>
                            ))}
                          </div>
                          <div className="tab-content">
                            {tab === "augment" && <AugmentTab member={member} remaining={remaining} update={update} />}
                            {tab === "equip"   && <EquipTab   member={member} stash={stash} members={members} update={update} />}
                            {tab === "talents" && <TalentsTab member={member} update={update} members={members} />}
                            {tab === "titles"  && <TitlesTab  member={member} update={update} />}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {/* Minions */}
            <div className="minion-section">
              <div className="sec-head">Minions</div>
              {minions.length > 0 && (
                <div className="minion-roster">
                  {minions.map(mn => {
                    const type = MINION_TYPES.find(t => t.id === mn.typeId);
                    if (!type) return null;
                    return (
                      <div key={mn.id} className="minion-card">
                        <div className="mc-left">
                          <span className="mc-icon">{type.icon}</span>
                          <div>
                            <div className="mc-type" style={{fontSize:".9rem",color:"#c8a8e8",fontFamily:"'Cinzel',serif"}}>{type.name}</div>
                          </div>
                        </div>
                        <div className="mc-stats-row">
                          <span className="mem-stat">♥ {type.hp}</span>
                          <span className="mem-stat">⚡ {type.speed}</span>
                          {type.dmg && <span className="mem-stat">DMG {type.dmg}</span>}
                          {type.hit && <span className="mem-stat">HIT {type.hit}</span>}
                        </div>
                        {type.needsOwner && (
                          <select className="mc-owner-select" value={mn.ownerId ?? ""} onChange={e => updateMinion(mn.id, { ownerId: e.target.value || null })}>
                            <option value="">No owner</option>
                            {members.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                          </select>
                        )}
                        <button className="del-btn" onClick={() => deleteMinion(mn.id)} title="Remove minion">✕</button>
                      </div>
                    );
                  })}
                </div>
              )}
              <button className="add-minion-btn" onClick={() => setShowMinionModal(true)}>+ Add Minion</button>
            </div>

            {/* Inline Equipment Panel */}

            {/* Company Inventory */}
            {stash.length > 0 && (
              <div className="sc bottom-panel">
                <div className="sc-title">Company Inventory</div>
                {(() => {
                  const grouped = {};
                  stash.forEach(entry => {
                    const isHousing = entry.itemId === "housing";
                    const owner = equippedBy(entry.uid, members);
                    if (!isHousing && owner !== null) return;
                    if (!grouped[entry.itemId]) grouped[entry.itemId] = 0;
                    grouped[entry.itemId]++;
                  });
                  const rows = Object.entries(grouped).map(([itemId, count]) => {
                    const def = lookupDef(itemId);
                    if (!def) return null;
                    const isHousing = itemId === "housing";
                    const slot = itemSlot(def);
                    const slotIcon = isHousing ? "🏠" : slot === "melee" ? "⚔" : slot === "ranged" ? "🏹" : slot === "armor" ? "🛡" : "🎒";
                    return (
                      <div key={itemId} className="inv-row">
                        <div className="inv-main">
                          <span className="inv-icon">{slotIcon}</span>
                          <div className="inv-info">
                            <span className="inv-name">{def.name}</span>
                            {count > 1 && <span className="inv-qty">×{count}</span>}
                          </div>
                        </div>
                        {isHousing && <span className="inv-company-tag">Company</span>}
                      </div>
                    );
                  }).filter(Boolean);
                  return (
                    <>
                      <div className="inv-grid">{rows.length === 0 ? <p className="sc-empty">All items are equipped.</p> : rows}</div>
                      <div className="sc-total">
                        <span className="sc-total-lbl">Items value</span>
                        <span className="sc-total-val" style={{fontSize:'1rem'}}>🪙 {stashSpend}</span>
                      </div>
                    </>
                  );
                })()}
              </div>
            )}

            {/* Roster Details */}
            {members.length > 0 && (
              <div className="sc bottom-panel">
                <div className="sc-title">Roster Details</div>
                <div className="roster-details-grid">
                  {members.map(m => {
                    const melee  = (m.equipped?.melee ?? []).map(uid => stash.find(e=>e.uid===uid)).filter(Boolean).map(e=>lookupDef(e.itemId)?.name).filter(Boolean).join(", ") || "—";
                    const ranged = (m.equipped?.ranged ?? []).map(uid => stash.find(e=>e.uid===uid)).filter(Boolean).map(e=>lookupDef(e.itemId)?.name).filter(Boolean).join(", ");
                    const armorE = m.equipped?.armor ? stash.find(e=>e.uid===m.equipped.armor) : null;
                    const armorName = armorE ? lookupDef(armorE.itemId)?.name : null;
                    return (
                      <div key={m.id} className="detail-block">
                        <div className="db-name">{m.isLeader ? "👑 " : ""}{m.name} <span style={{color:'var(--gold-d)',fontWeight:'normal'}}>Lv{getLevel(m.xp)}</span></div>
                        <div className="db-line">♥ {getHP(m)} HP · ⚡ {getSpeed(m, stash)} · 🛡 {getArmor(m, stash)}</div>
                        <div className="db-line">⚔ {melee}</div>
                        {ranged && <div className="db-line">🏹 {ranged}</div>}
                        {armorName && <div className="db-line">🛡 {armorName}</div>}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            <KeywordsPanel />

            {(members.length > 0 || minions.length > 0) && (
              <div className="export-btns" style={{marginTop:'1rem'}}>
                <button className="export-btn" onClick={() => setShowPrint(true)}>🖨 Print</button>
                <button className={`export-btn ${copied ? "copied" : ""}`} onClick={copyAsText}>{copied ? "✓ Copied!" : "📋 Text"}</button>
                <button className={`export-btn ${codeCopied ? "copied" : ""}`} onClick={copyCode}>{codeCopied ? "✓ Copied!" : "🔑 Export Code"}</button>
              </div>
            )}
            <div className="export-btns" style={{marginTop:'.4rem'}}>
              <button className="export-btn" onClick={() => setShowImport(true)}>📥 Import Code</button>
            </div>
            {(members.length > 0 || minions.length > 0) && (
              <button className="disband-btn" onClick={() => { setMembers([]); setStash([]); setMinions([]); setExpandedId(null); }}>
                ✕ Disband Company
              </button>
            )}
          </div>

        </div>
      </div>
      </ErrorBoundary>
    </>
  );
}
export default App;
