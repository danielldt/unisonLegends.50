import { AppDataSource } from "../../config/database";
import { Item, ItemType, ItemCategory, ItemRarity, ItemTarget } from "../../entities/Item";
import { Spell, SpellType, SpellElement, SpellTarget } from "../../entities/Spell";

// Define interfaces for our seed data
interface ItemSeed {
  name: string;
  description: string;
  type: string;
  category: string;
  rarity: string;
  value: number;
  stackable: boolean;
  maxStack: number;
  tradeable: boolean;
  sellable: boolean;
  dmg: number;
  def: number;
  imageUrl: string;
  stats: Record<string, number>;
  target: string;
  isStarterItem?: boolean;
}

interface SpellSeed {
  name: string;
  type: string;
  element: string;
  power: number;
  cooldown: number;
  mpCost: number;
  imageUrl: string;
  target: string;
  effects: Record<string, any>;
  isStarterSpell?: boolean;
}

// Initialize database connection
async function initDatabase() {
  try {
    await AppDataSource.initialize();
    
    return true;
  } catch (error) {
    console.error("Error initializing database connection:", error);
    return false;
  }
}

// Create weapons seed data
async function seedWeapons() {
  
  const weaponRepository = AppDataSource.getRepository(Item);
  
  // Check if weapons already exist
  const existingWeapons = await weaponRepository.count({
    where: { category: ItemCategory.WEAPON }
  });
  
  if (existingWeapons > 0) {
    
    return;
  }

  // List of weapon types from ItemType enum
  const weaponTypes = [
    ItemType.SWORD,
    ItemType.SHIELD,
    ItemType.DAGGER,
    ItemType.BOW,
    ItemType.STAFF,
    ItemType.ORB
  ];

  // List of rarities with weights (lower rarities more common)
  const rarities = [
    { rarity: ItemRarity.F, count: 10 },
    { rarity: ItemRarity.E, count: 10 },
    { rarity: ItemRarity.D, count: 10 },
    { rarity: ItemRarity.C, count: 8 },
    { rarity: ItemRarity.B, count: 5 },
    { rarity: ItemRarity.A, count: 3 },
    { rarity: ItemRarity.S, count: 2 },
    { rarity: ItemRarity.SS, count: 1 },
    { rarity: ItemRarity.SSS, count: 1 }
  ];
  
  // Create starter weapons (one of each type, all F rarity)
  const starterWeapons: ItemSeed[] = weaponTypes.map(type => {
    // Prepare image URL based on type
    const imageUrl = `/images/items/${type}.png`;
    
    // Create an item with appropriate stats for a starter weapon
    return {
      name: `Starter ${type.charAt(0).toUpperCase() + type.slice(1)}`,
      description: `A basic ${type} for beginners.`,
      type,
      category: ItemCategory.WEAPON,
      rarity: ItemRarity.F,
      value: 10,
      stackable: false,
      maxStack: 1,
      tradeable: false,
      sellable: true,
      dmg: 5,
      def: type === ItemType.SHIELD ? 5 : 0,
      imageUrl,
      stats: {
        str: type === ItemType.SWORD || type === ItemType.SHIELD ? 1 : 0,
        int: type === ItemType.STAFF || type === ItemType.ORB ? 1 : 0,
        dex: type === ItemType.BOW || type === ItemType.DAGGER ? 1 : 0,
        agi: 0,
        luk: 0
      },
      target: ItemTarget.SINGLE_ENEMY,
      isStarterItem: true
    };
  });

  // Generate weapon seed data
  const weapons: ItemSeed[] = [];
  
  // Add regular weapons (non-starters) of varying rarities
  rarities.forEach(({ rarity, count }) => {
    weaponTypes.forEach(type => {
      for (let i = 1; i <= count; i++) {
        // Calculate stats based on rarity
        const rarityMultiplier = {
          [ItemRarity.F]: 1,
          [ItemRarity.E]: 1.5,
          [ItemRarity.D]: 2,
          [ItemRarity.C]: 3,
          [ItemRarity.B]: 5,
          [ItemRarity.A]: 8,
          [ItemRarity.S]: 13,
          [ItemRarity.SS]: 21,
          [ItemRarity.SSS]: 34
        }[rarity];
        
        // Base damage and value based on rarity
        const baseDmg = Math.floor(5 * rarityMultiplier);
        const baseValue = Math.floor(10 * Math.pow(rarityMultiplier, 1.5));
        
        // Primary stat boost based on weapon type
        const stats: Record<string, number> = {
          str: 0,
          int: 0,
          agi: 0,
          dex: 0,
          luk: 0
        };
        
        // Add primary stat based on weapon type
        switch (type) {
          case ItemType.SWORD:
            stats.str = Math.floor(2 * rarityMultiplier);
            break;
          case ItemType.SHIELD:
            stats.str = Math.floor(1 * rarityMultiplier);
            break;
          case ItemType.DAGGER:
            stats.dex = Math.floor(1.5 * rarityMultiplier);
            stats.agi = Math.floor(0.5 * rarityMultiplier);
            break;
          case ItemType.BOW:
            stats.dex = Math.floor(2 * rarityMultiplier);
            break;
          case ItemType.STAFF:
            stats.int = Math.floor(2 * rarityMultiplier);
            break;
          case ItemType.ORB:
            stats.int = Math.floor(1.5 * rarityMultiplier);
            stats.luk = Math.floor(0.5 * rarityMultiplier);
            break;
        }
        
        // Add a small random bonus stat
        const secondaryStats = ['str', 'int', 'dex', 'agi', 'luk'];
        const randomStat = secondaryStats[Math.floor(Math.random() * secondaryStats.length)];
        stats[randomStat] += Math.floor(0.5 * rarityMultiplier);
        
        // Create weapon name
        const adjectives = [
          'Sharp', 'Mighty', 'Keen', 'Swift', 'Ancient', 'Mystic', 'Brutal',
          'Arcane', 'Vicious', 'Glorious', 'Thundering', 'Blessed', 'Cursed'
        ];
        
        // Define weapon type specific nouns
        const weaponNouns: Record<string, string[]> = {
          [ItemType.SWORD]: ['Blade', 'Sword', 'Claymore', 'Katana', 'Saber'],
          [ItemType.SHIELD]: ['Shield', 'Aegis', 'Bulwark', 'Barrier', 'Guard'],
          [ItemType.DAGGER]: ['Dagger', 'Kris', 'Dirk', 'Shiv', 'Stiletto'],
          [ItemType.BOW]: ['Bow', 'Longbow', 'Shortbow', 'Recurve', 'Composite'],
          [ItemType.STAFF]: ['Staff', 'Rod', 'Wand', 'Scepter', 'Focus'],
          [ItemType.ORB]: ['Orb', 'Globe', 'Sphere', 'Crystal', 'Eye']
        };
        
        const adjective = adjectives[Math.floor(Math.random() * adjectives.length)];
        // Safely access the noun array for this weapon type
        const nounOptions = weaponNouns[type] || ['Weapon'];
        const noun = nounOptions[Math.floor(Math.random() * nounOptions.length)];
        
        // For higher rarities, add more impressive names
        let name;
        if (rarity === ItemRarity.SS || rarity === ItemRarity.SSS) {
          const epicNames = [
            'Doomslayer', 'Soulreaver', 'Worldender', 'Starcaller', 'Dragonbane',
            'Godseeker', 'Oblivion', 'Eternity', 'Ragnarok', 'Apocalypse'
          ];
          name = `${epicNames[Math.floor(Math.random() * epicNames.length)]} ${noun}`;
        } else {
          name = `${adjective} ${noun} ${rarity}${i}`;
        }
        
        // Prepare image URL based on type
        const imageUrl = `/images/items/${type}.png`;
        
        weapons.push({
          name,
          description: `A ${rarity} rank ${type}.`,
          type,
          category: ItemCategory.WEAPON,
          rarity,
          value: baseValue,
          stackable: false,
          maxStack: 1,
          tradeable: true,
          sellable: true,
          dmg: baseDmg,
          def: type === ItemType.SHIELD ? Math.floor(baseDmg * 0.8) : 0,
          imageUrl,
          stats,
          target: ItemTarget.SINGLE_ENEMY
        });
      }
    });
  });
  
  // Add all weapons to the database
  await weaponRepository.save([...starterWeapons, ...weapons]);
  
}

// Create armor seed data
async function seedArmor() {
  
  const armorRepository = AppDataSource.getRepository(Item);
  
  // Check if armor already exists
  const existingArmor = await armorRepository.count({
    where: [
      { category: ItemCategory.HEAD },
      { category: ItemCategory.BODY },
      { category: ItemCategory.LEGS }
    ]
  });
  
  if (existingArmor > 0) {
    
    return;
  }

  // List of armor categories
  const armorCategories = [
    ItemCategory.HEAD,
    ItemCategory.BODY,
    ItemCategory.LEGS
  ];

  // List of rarities with weights (lower rarities more common)
  const rarities = [
    { rarity: ItemRarity.F, count: 10 },
    { rarity: ItemRarity.E, count: 10 },
    { rarity: ItemRarity.D, count: 10 },
    { rarity: ItemRarity.C, count: 8 },
    { rarity: ItemRarity.B, count: 5 },
    { rarity: ItemRarity.A, count: 3 },
    { rarity: ItemRarity.S, count: 2 },
    { rarity: ItemRarity.SS, count: 1 },
    { rarity: ItemRarity.SSS, count: 1 }
  ];
  
  // Define armor category name mapping
  const armorCategoryNames: Record<string, string> = {
    [ItemCategory.HEAD]: 'Helmet',
    [ItemCategory.BODY]: 'Armor',
    [ItemCategory.LEGS]: 'Boots'
  };
  
  // Create starter armor (one of each category, all F rarity)
  const starterArmor: ItemSeed[] = armorCategories.map(category => {
    // Get category name from our mapping
    const categoryName = armorCategoryNames[category];
    
    // Prepare image URL based on category
    const imageUrl = `/images/items/${category}.png`;
    
    // Create an item with appropriate stats for a starter armor
    return {
      name: `Starter ${categoryName}`,
      description: `A basic ${categoryName.toLowerCase()} for beginners.`,
      type: 'basic',
      category,
      rarity: ItemRarity.F,
      value: 10,
      stackable: false,
      maxStack: 1,
      tradeable: false,
      sellable: true,
      dmg: 0,
      def: 5,
      imageUrl,
      stats: {
        hp: 5,
        str: category === ItemCategory.BODY ? 1 : 0,
        agi: category === ItemCategory.LEGS ? 1 : 0,
        dex: category === ItemCategory.HEAD ? 1 : 0
      },
      target: ItemTarget.SELF,
      isStarterItem: true
    };
  });

  // Generate armor seed data
  const armor: ItemSeed[] = [];
  
  // Add regular armor (non-starters) of varying rarities
  rarities.forEach(({ rarity, count }) => {
    armorCategories.forEach(category => {
      for (let i = 1; i <= count; i++) {
        // Calculate stats based on rarity
        const rarityMultiplier = {
          [ItemRarity.F]: 1,
          [ItemRarity.E]: 1.5,
          [ItemRarity.D]: 2,
          [ItemRarity.C]: 3,
          [ItemRarity.B]: 5,
          [ItemRarity.A]: 8,
          [ItemRarity.S]: 13,
          [ItemRarity.SS]: 21,
          [ItemRarity.SSS]: 34
        }[rarity];
        
        // Base defense and value based on rarity
        const baseDef = Math.floor(5 * rarityMultiplier);
        const baseValue = Math.floor(10 * Math.pow(rarityMultiplier, 1.5));
        
        // HP boost based on category and rarity
        const baseHp = Math.floor(5 * rarityMultiplier);
        
        // Primary stat boost based on armor category
        const stats: Record<string, number> = {
          hp: baseHp,
          str: 0,
          int: 0,
          agi: 0,
          dex: 0,
          luk: 0
        };
        
        // Add primary stat based on armor category
        switch (category) {
          case ItemCategory.HEAD:
            stats.dex = Math.floor(1 * rarityMultiplier);
            stats.int = Math.floor(0.5 * rarityMultiplier);
            break;
          case ItemCategory.BODY:
            stats.str = Math.floor(1 * rarityMultiplier);
            stats.def = Math.floor(0.5 * rarityMultiplier);
            break;
          case ItemCategory.LEGS:
            stats.agi = Math.floor(1 * rarityMultiplier);
            stats.dex = Math.floor(0.5 * rarityMultiplier);
            break;
        }
        
        // Add a small random bonus stat
        const secondaryStats = ['str', 'int', 'dex', 'agi', 'luk'];
        const randomStat = secondaryStats[Math.floor(Math.random() * secondaryStats.length)];
        stats[randomStat] += Math.floor(0.5 * rarityMultiplier);
        
        // Get category name from our mapping
        const categoryName = armorCategoryNames[category];
        
        // Create armor name
        const adjectives = [
          'Sturdy', 'Mighty', 'Reinforced', 'Swift', 'Ancient', 'Mystic', 
          'Heavy', 'Light', 'Arcane', 'Vicious', 'Glorious', 'Blessed', 'Cursed'
        ];
        
        const adjective = adjectives[Math.floor(Math.random() * adjectives.length)];
        
        // For higher rarities, add more impressive names
        let name;
        if (rarity === ItemRarity.SS || rarity === ItemRarity.SSS) {
          const epicPrefixes = [
            'Dragon', 'Titan', 'Deity', 'Void', 'Soul', 
            'Celestial', 'Phoenix', 'Immortal', 'Cosmic', 'Eternity'
          ];
          name = `${epicPrefixes[Math.floor(Math.random() * epicPrefixes.length)]} ${categoryName}`;
        } else {
          name = `${adjective} ${categoryName} ${rarity}${i}`;
        }
        
        // Prepare image URL based on category
        const imageUrl = `/images/items/${category}.png`;
        
        armor.push({
          name,
          description: `A ${rarity} rank ${categoryName.toLowerCase()}.`,
          type: 'standard',
          category,
          rarity,
          value: baseValue,
          stackable: false,
          maxStack: 1,
          tradeable: true,
          sellable: true,
          dmg: 0,
          def: baseDef,
          imageUrl,
          stats,
          target: ItemTarget.SELF
        });
      }
    });
  });
  
  // Add all armor to the database
  await armorRepository.save([...starterArmor, ...armor]);
  
}

// Create spells seed data
async function seedSpells() {
  
  const spellRepository = AppDataSource.getRepository(Spell);
  
  // Check if spells already exist
  const existingSpells = await spellRepository.count();
  
  if (existingSpells > 0) {
    
    return;
  }

  // Arrays for spell generation
  const spellTypes = Object.values(SpellType);
  const spellElements = Object.values(SpellElement);
  const spellTargets: Record<string, string[]> = {
    [SpellType.ATTACK]: [SpellTarget.SINGLE_ENEMY, SpellTarget.ALL_ENEMIES],
    [SpellType.HEAL]: [SpellTarget.SELF, SpellTarget.SINGLE_ALLY, SpellTarget.ALL_ALLIES],
    [SpellType.BUFF]: [SpellTarget.SELF, SpellTarget.SINGLE_ALLY, SpellTarget.ALL_ALLIES],
    [SpellType.DEBUFF]: [SpellTarget.SINGLE_ENEMY, SpellTarget.ALL_ENEMIES],
    [SpellType.UTILITY]: Object.values(SpellTarget)
  };

  // Create starter spells (one of each element, all basic attack spells)
  const starterSpells: SpellSeed[] = spellElements.map(element => {
    // Title case the element name
    const elementName = element.charAt(0).toUpperCase() + element.slice(1);
    
    // Prepare image URL based on element
    const imageUrl = `/images/spells/${element}.png`;
    
    return {
      name: `Basic ${elementName}`,
      type: SpellType.ATTACK,
      element,
      power: 10,
      cooldown: 1,
      mpCost: 5,
      imageUrl,
      target: SpellTarget.SINGLE_ENEMY,
      effects: {
        damage: 10
      },
      isStarterSpell: true
    };
  });

  // Generate a wide variety of spells
  const spells: SpellSeed[] = [];
  let spellCount = 0;

  // Target 100 spells total, including starters
  const targetCount = 100;
  const remainingSpells = targetCount - starterSpells.length;
  
  // Distribute spells across different types and elements
  spellTypes.forEach(type => {
    spellElements.forEach(element => {
      // Determine how many spells to create for this type/element combination
      const spellsPerCombo = Math.floor(remainingSpells / (spellTypes.length * spellElements.length));
      
      for (let i = 1; i <= spellsPerCombo; i++) {
        // Determine the spell's target based on its type
        const availableTargets = spellTargets[type] || [SpellTarget.SINGLE_ENEMY];
        const target = availableTargets[Math.floor(Math.random() * availableTargets.length)];
        
        // Base spell power (1-20)
        const basePower = Math.floor(Math.random() * 20) + 1;
        
        // Cooldown based on power (stronger spells have longer cooldown)
        const cooldown = Math.max(1, Math.floor(basePower / 5));
        
        // MP cost based on power and cooldown
        const mpCost = Math.max(1, Math.floor((basePower * (1 + cooldown)) / 5));
        
        // Prepare effects based on spell type
        const effects: Record<string, any> = {};
        
        switch (type) {
          case SpellType.ATTACK:
            effects.damage = basePower * 5;
            break;
          case SpellType.HEAL:
            effects.healing = basePower * 5;
            break;
          case SpellType.BUFF:
            effects.buffs = {};
            // Add random buffs
            const buffStats = ['str', 'int', 'agi', 'dex', 'luk'];
            // Select 1-3 stats to buff
            const numBuffs = Math.floor(Math.random() * 3) + 1;
            for (let j = 0; j < numBuffs; j++) {
              const stat = buffStats[Math.floor(Math.random() * buffStats.length)];
              effects.buffs[stat] = Math.floor(basePower / 2) + 1;
            }
            effects.buffs.duration = cooldown + 2;
            break;
          case SpellType.DEBUFF:
            effects.debuffs = {};
            // Add random debuffs
            const debuffStats = ['str', 'int', 'agi', 'dex', 'luk'];
            // Select 1-3 stats to debuff
            const numDebuffs = Math.floor(Math.random() * 3) + 1;
            for (let j = 0; j < numDebuffs; j++) {
              const stat = debuffStats[Math.floor(Math.random() * debuffStats.length)];
              effects.debuffs[stat] = -1 * (Math.floor(basePower / 2) + 1);
            }
            effects.debuffs.duration = cooldown + 2;
            break;
          case SpellType.UTILITY:
            // Utilities can have various effects
            if (Math.random() < 0.3) {
              effects.healing = Math.floor(basePower * 2);
            }
            if (Math.random() < 0.3) {
              effects.damage = Math.floor(basePower * 2);
            }
            if (Math.random() < 0.5) {
              effects.buffs = {
                duration: cooldown + 1
              };
              const stat = ['str', 'int', 'agi', 'dex', 'luk'][Math.floor(Math.random() * 5)];
              effects.buffs[stat] = Math.floor(basePower / 3) + 1;
            }
            break;
        }
        
        // Generate spell name
        const elementName = element.charAt(0).toUpperCase() + element.slice(1);
        const typeName = type.charAt(0).toUpperCase() + type.slice(1);
        
        // Create name bases
        const spellNamePrefixes: Record<string, string[]> = {
          [SpellType.ATTACK]: ['Burst', 'Blast', 'Strike', 'Surge', 'Bolt'],
          [SpellType.HEAL]: ['Heal', 'Mend', 'Restore', 'Recovery', 'Rejuvenation'],
          [SpellType.BUFF]: ['Enhance', 'Empower', 'Strengthen', 'Amplify', 'Fortify'],
          [SpellType.DEBUFF]: ['Weaken', 'Slow', 'Impair', 'Hinder', 'Diminish'],
          [SpellType.UTILITY]: ['Veil', 'Shift', 'Transmute', 'Alter', 'Convert']
        };
        
        const prefixOptions = spellNamePrefixes[type] || ['Spell'];
        const prefix = prefixOptions[Math.floor(Math.random() * prefixOptions.length)];
        const name = `${elementName} ${prefix} ${i}`;
        
        // Prepare image URL based on element
        const imageUrl = `/images/spells/${element}.png`;
        
        spells.push({
          name,
          type,
          element,
          power: basePower,
          cooldown,
          mpCost,
          imageUrl,
          target,
          effects
        });
        
        spellCount++;
      }
    });
  });
  
  // If we haven't reached our target, add more random spells
  while (spellCount + starterSpells.length < targetCount) {
    const type = spellTypes[Math.floor(Math.random() * spellTypes.length)];
    const element = spellElements[Math.floor(Math.random() * spellElements.length)];
    const availableTargets = spellTargets[type] || [SpellTarget.SINGLE_ENEMY];
    const target = availableTargets[Math.floor(Math.random() * availableTargets.length)];
    
    // Generate a more unique name for these extra spells
    const uniqueNames = [
      'Cataclysm', 'Armageddon', 'Genesis', 'Apocalypse', 'Singularity',
      'Nebula', 'Supernova', 'Eclipse', 'Vortex', 'Oblivion',
      'Maelstrom', 'Tempest', 'Hurricane', 'Tsunami', 'Earthquake',
      'Blizzard', 'Inferno', 'Tornado', 'Avalanche', 'Eruption'
    ];
    
    const elementName = element.charAt(0).toUpperCase() + element.slice(1);
    const name = `${elementName} ${uniqueNames[Math.floor(Math.random() * uniqueNames.length)]}`;
    
    // Higher power for these special spells
    const basePower = Math.floor(Math.random() * 10) + 15;
    const cooldown = Math.max(3, Math.floor(basePower / 4));
    const mpCost = Math.max(10, Math.floor((basePower * (1 + cooldown)) / 3));
    
    // Prepare effects based on spell type with enhanced power
    const effects: Record<string, any> = {};
    
    switch (type) {
      case SpellType.ATTACK:
        effects.damage = basePower * 8;
        break;
      case SpellType.HEAL:
        effects.healing = basePower * 8;
        break;
      case SpellType.BUFF:
        effects.buffs = {
          str: Math.floor(basePower / 2),
          int: Math.floor(basePower / 2),
          agi: Math.floor(basePower / 2),
          duration: cooldown + 3
        };
        break;
      case SpellType.DEBUFF:
        effects.debuffs = {
          str: -1 * Math.floor(basePower / 2),
          int: -1 * Math.floor(basePower / 2),
          agi: -1 * Math.floor(basePower / 2),
          duration: cooldown + 3
        };
        break;
      case SpellType.UTILITY:
        effects.buffs = {
          str: Math.floor(basePower / 3),
          agi: Math.floor(basePower / 3),
          duration: cooldown + 2
        };
        effects.healing = Math.floor(basePower * 3);
        break;
    }
    
    // Prepare image URL based on element
    const imageUrl = `/images/spells/${element}.png`;
    
    spells.push({
      name,
      type,
      element,
      power: basePower,
      cooldown,
      mpCost,
      imageUrl,
      target,
      effects
    });
    
    spellCount++;
  }
  
  // Save all spells to the database
  await spellRepository.save([...starterSpells, ...spells]);
  
}

// Main function to run all seeders
async function main() {
  // Initialize database connection
  const dbInitialized = await initDatabase();
  if (!dbInitialized) {
    console.error("Failed to initialize database, exiting");
    process.exit(1);
  }

  try {
    // Seed weapons (50 total including starter weapons)
    await seedWeapons();
    
    // Seed armor (50 total including starter armor)
    await seedArmor();
    
    // Seed spells (100 total including starter spells)
    await seedSpells();
    
    
    
    // Close the database connection
    await AppDataSource.destroy();
    
    process.exit(0);
  } catch (error) {
    console.error("Error during seeding:", error);
    process.exit(1);
  }
}

// Run the main function
main(); 