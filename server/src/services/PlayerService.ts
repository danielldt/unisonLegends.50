import { Client } from "colyseus";
import { AppDataSource } from "../config/database";
import { Player } from "../entities/Player";
import { Item } from "../entities/Item";
import { Spell } from "../entities/Spell";
import { PlayerItem } from "../entities/PlayerItem";
import { PlayerSpell } from "../entities/PlayerSpell";
import { PlayerState } from "../schemas/PlayerState";
import { calculateRequiredExp } from "../utils/game/experience";

export class PlayerService {
  /**
   * Fetch player data from the database
   */
  async fetchPlayerData(playerId: string): Promise<Player | null> {
    try {
      const playerRepo = AppDataSource.getRepository(Player);
      const player = await playerRepo.findOne({
        where: { id: playerId },
        relations: [
          'weapon1', 'weapon2', 'weapon3', 'weapon4', 'weapon5',
          'head', 'body', 'legs',
          'spell1', 'spell2', 'spell3', 'spell4', 'spell5',
          'inventory', 'knownSpells',
          'inventory.item', 'knownSpells.spell'
        ]
      });

      if (!player) {
        console.error(`Player not found with ID: ${playerId}`);
        return null;
      }

      
      
      
      
      
      
      
      
      
      

      return player;
    } catch (error) {
      console.error("Error fetching player data:", error);
      return null;
    }
  }

  /**
   * Create player state from database player
   */
  createPlayerState(player: Player): PlayerState {
    const playerState = new PlayerState();
    playerState.id = player.id;
    playerState.name = player.username;
    playerState.level = player.level;
    playerState.exp = player.exp;
    playerState.gold = player.gold;
    playerState.hp = player.hp;
    playerState.maxHp = player.maxHp;
    playerState.mp = player.mp;
    playerState.maxMp = player.maxMp;
    playerState.str = player.str;
    playerState.int = player.int;
    playerState.agi = player.agi;
    playerState.dex = player.dex;
    playerState.luk = player.luk;
    playerState.statPoints = player.statPoints;

    // Log equipment data from the database record
    
    
    
    
    
    
    
    
    
    

    // Set equipment
    playerState.weapon1 = player.weapon1?.id || "";
    playerState.weapon2 = player.weapon2?.id || "";
    playerState.weapon3 = player.weapon3?.id || "";
    playerState.weapon4 = player.weapon4?.id || "";
    playerState.weapon5 = player.weapon5?.id || "";
    playerState.head = player.head?.id || "";
    playerState.body = player.body?.id || "";
    playerState.legs = player.legs?.id || "";

    // Log equipment data in player state
    
    
    
    
    
    
    
    
    

    // Set spells
    playerState.spell1 = player.spell1?.id || "";
    playerState.spell2 = player.spell2?.id || "";
    playerState.spell3 = player.spell3?.id || "";
    playerState.spell4 = player.spell4?.id || "";
    playerState.spell5 = player.spell5?.id || "";

    return playerState;
  }

  /**
   * Save player state to database
   */
  async savePlayerState(playerState: PlayerState): Promise<void> {
    try {
      await AppDataSource.getRepository(Player).update(
        { id: playerState.id },
        {
          level: playerState.level,
          exp: playerState.exp,
          gold: playerState.gold,
          hp: playerState.hp,
          maxHp: playerState.maxHp,
          mp: playerState.mp,
          maxMp: playerState.maxMp,
          str: playerState.str,
          int: playerState.int,
          agi: playerState.agi,
          dex: playerState.dex,
          luk: playerState.luk,
          statPoints: playerState.statPoints
        }
      );
    } catch (error) {
      console.error("Error saving player state:", error);
    }
  }

  /**
   * Get all items owned by a player
   */
  async getPlayerInventory(playerId: string): Promise<any[]> {
    try {
      const playerItems = await AppDataSource.getRepository(PlayerItem)
        .createQueryBuilder("playerItem")
        .leftJoinAndSelect("playerItem.item", "item")
        .where("playerItem.player.id = :playerId", { playerId })
        .getMany();

      return playerItems.map(pi => ({
        id: pi.item.id,
        name: pi.item.name,
        type: pi.item.type,
        category: pi.item.category,
        rarity: pi.item.rarity,
        quantity: pi.quantity,
        isEquipped: pi.isEquipped,
        imageUrl: pi.item.imageUrl || null,
        dmg: pi.item.dmg,
        def: pi.item.def,
        stats: pi.item.stats,
        target: pi.item.target
        
      }));
    } catch (error) {
      console.error("Error fetching player items:", error);
      return [];
    }
  }

  /**
   * Get all spells known by a player
   */
  async getPlayerSpells(playerId: string): Promise<any[]> {
    try {
      const playerSpells = await AppDataSource.getRepository(PlayerSpell)
        .createQueryBuilder("playerSpell")
        .leftJoinAndSelect("playerSpell.spell", "spell")
        .where("playerSpell.player.id = :playerId", { playerId })
        .getMany();

      return playerSpells.map(ps => ({
        id: ps.spell.id,
        name: ps.spell.name,
        type: ps.spell.type,
        element: ps.spell.element,
        power: ps.spell.power,
        cooldown: ps.spell.cooldown,
        mpCost: ps.spell.mpCost,
        effects: ps.spell.effects,
        imageUrl: ps.spell.imageUrl || null
      }));
    } catch (error) {
      console.error("Error fetching player spells:", error);
      return [];
    }
  }

  /**
   * Send player details to a specific client
   */
  async sendPlayerDetails(client: Client, sendFunction: (type: string, data: any) => void): Promise<void> {
    try {
      // Get player ID from client auth
      const playerId = client.auth?.playerId;
      if (!playerId) {
        console.error("No player ID in client auth data");
        return;
      }

      // Load player data from database
      const playerRepo = AppDataSource.getRepository(Player);
      const player = await playerRepo.findOne({
        where: { id: playerId },
        relations: [
          'weapon1', 'weapon2', 'weapon3', 'weapon4', 'weapon5',
          'head', 'body', 'legs',
          'spell1', 'spell2', 'spell3', 'spell4', 'spell5'
        ]
      });

      if (!player) {
        console.error(`Player not found with ID: ${playerId}`);
        return;
      }

      // Get player inventory
      const items = await this.getPlayerInventory(playerId);
      const spells = await this.getPlayerSpells(playerId);

      // Calculate derived stats
      const derivedStats = this.calculateDerivedStats(player);

      // Calculate experience required for next level
      const maxExp = calculateRequiredExp(player.level);

      // Log equipment data for debugging
      
      
      
      
      
      
      
      
      

      // Prepare equipment object
      const equipmentData = {
        weapon1: player.weapon1?.id || "",
        weapon2: player.weapon2?.id || "",
        weapon3: player.weapon3?.id || "",
        weapon4: player.weapon4?.id || "",
        weapon5: player.weapon5?.id || "",
        head: player.head?.id || "",
        body: player.body?.id || "",
        legs: player.legs?.id || ""
      };

      

      // Send complete player data to client
      sendFunction("player_details", {
        id: player.id,
        username: player.username,
        level: player.level,
        exp: player.exp,
        gold: player.gold,
        diamond: player.diamond,
        stats: {
          hp: player.hp,
          maxHp: player.maxHp,
          mp: player.mp,
          maxMp: player.maxMp,
          str: player.str,
          int: player.int,
          agi: player.agi,
          dex: player.dex,
          luk: player.luk,
          statPoints: player.statPoints,
          maxExp: maxExp,
          // Derived stats
          attack: derivedStats.attack,
          defense: derivedStats.defense,
          critRate: derivedStats.critRate,
          dodge: derivedStats.dodge,
          hit: derivedStats.hit,
          cooldownReduction: derivedStats.cooldownReduction
        },
        equipment: equipmentData,
        activeSpells: {
          spell1: player.spell1?.id || "",
          spell2: player.spell2?.id || "",
          spell3: player.spell3?.id || "",
          spell4: player.spell4?.id || "",
          spell5: player.spell5?.id || ""
        },
        inventory: items,
        knownSpells: spells
      });

    } catch (error) {
      console.error("Error sending player details:", error);
    }
  }

  /**
   * Calculate derived stats based on player attributes and equipment
   */
  private calculateDerivedStats(player: Player): { 
    attack: number, 
    defense: number, 
    critRate: number, 
    dodge: number, 
    hit: number, 
    cooldownReduction: number 
  } {
    // Calculate attack based on equipped weapons and relevant stats
    let attack = 0;
    let totalWeapons = 0;
    
    // Process all equipped weapons
    if (player.weapon1) {
      const weaponType = player.weapon1.type as string;
      const baseDmg = player.weapon1.dmg || 0;
      const statBonus = this.getStatBonusForWeapon(player, weaponType);
      attack += baseDmg + (statBonus * 0.5);
      totalWeapons++;
    }
    
    if (player.weapon2) {
      const weaponType = player.weapon2.type as string;
      const baseDmg = player.weapon2.dmg || 0;
      const statBonus = this.getStatBonusForWeapon(player, weaponType);
      attack += baseDmg + (statBonus * 0.5);
      totalWeapons++;
    }
    
    if (player.weapon3) {
      const weaponType = player.weapon3.type as string;
      const baseDmg = player.weapon3.dmg || 0;
      const statBonus = this.getStatBonusForWeapon(player, weaponType);
      attack += baseDmg + (statBonus * 0.5);
      totalWeapons++;
    }
    
    if (player.weapon4) {
      const weaponType = player.weapon4.type as string;
      const baseDmg = player.weapon4.dmg || 0;
      const statBonus = this.getStatBonusForWeapon(player, weaponType);
      attack += baseDmg + (statBonus * 0.5);
      totalWeapons++;
    }
    
    if (player.weapon5) {
      const weaponType = player.weapon5.type as string;
      const baseDmg = player.weapon5.dmg || 0;
      const statBonus = this.getStatBonusForWeapon(player, weaponType);
      attack += baseDmg + (statBonus * 0.5);
      totalWeapons++;
    }
    
    // Calculate average attack if any weapons are equipped
    if (totalWeapons > 0) {
      attack = attack / totalWeapons;
    }
    
    // Calculate defense as sum of all equipped armor's def values
    let defense = 0;
    if (player.head) defense += player.head.def || 0;
    if (player.body) defense += player.body.def || 0;
    if (player.legs) defense += player.legs.def || 0;
    
    // Calculate critical rate: 5% base + (luk + equipment luk bonus) * 0.1
    let totalLuk = player.luk || 0;
    let totalAgi = player.agi || 0;
    let totalDex = player.dex || 0;
    let totalInt = player.int || 0;
    // Add stat bonuses from all equipped items
    for (const equipSlot of ['weapon1', 'weapon2', 'weapon3', 'weapon4', 'weapon5', 'head', 'body', 'legs']) {
      const equip = player[equipSlot as keyof Player] as any;
      if (equip && equip.stats) {
        if (equip.stats.luk) totalLuk += equip.stats.luk;
        if (equip.stats.agi) totalAgi += equip.stats.agi;
        if (equip.stats.dex) totalDex += equip.stats.dex;
        if (equip.stats.int) totalInt += equip.stats.int;
      }
    }
    
    const critRate = 5 + (totalLuk * 0.1);
    
    // Calculate dodge: (agi + equipment agi) * 2 + luk + equipment luk
    const dodge = (totalAgi * 2) + totalLuk;
    
    // Calculate hit: (dex + equipment dex) * 2 + luk + equipment luk
    const hit = (totalDex * 2) + totalLuk;
    
    // Calculate cooldown reduction: int * 0.5
    const cooldownReduction = (totalInt || 0) * 0.5;

    return {
      attack: Math.round(attack),
      defense: Math.round(defense),
      critRate: Math.round(critRate),
      dodge: Math.round(dodge),
      hit: Math.round(hit),
      cooldownReduction: Math.round(cooldownReduction)
    };
  }
  
  /**
   * Get the relevant stat bonus for a weapon type
   */
  private getStatBonusForWeapon(player: Player, weaponType: string): number {
    switch (weaponType) {
      case 'sword':
      case 'shield':
        return player.str || 0;
      case 'dagger':
      case 'bow':
        return player.agi || 0;
      case 'staff':
      case 'orb':
        return player.int || 0;
      default:
        return 0;
    }
  }

  /**
   * Save equipment state when player equips or unequips an item
   */
  async saveEquipmentState(playerId: string, itemId: string, slot: number, equipped: boolean): Promise<void> {
    try {
      const playerItemRepo = AppDataSource.getRepository(PlayerItem);
      const playerRepo = AppDataSource.getRepository(Player);
      
      // First, get the player
      const player = await playerRepo.findOne({
        where: { id: playerId },
        relations: [
          'weapon1', 'weapon2', 'weapon3', 'weapon4', 'weapon5',
          'head', 'body', 'legs'
        ]
      });
      
      if (!player) {
        console.error(`Player not found with ID: ${playerId}`);
        return;
      }
      
      // Find the player's item
      const playerItem = await playerItemRepo.findOne({
        where: { 
          player: { id: playerId },
          item: { id: itemId }
        },
        relations: ['item']
      });
      
      if (!playerItem) {
        console.error(`Player item not found: Player ID ${playerId}, Item ID ${itemId}`);
        return;
      }
      
      // If equipping, update the player's equipment slot
      if (equipped) {
        // If something is already in this slot, unequip it first
        let currentEquippedItem: Item | undefined | null = null;
        
        switch (slot) {
          case 0: currentEquippedItem = player.weapon1; break;
          case 1: currentEquippedItem = player.weapon2; break;
          case 2: currentEquippedItem = player.weapon3; break;
          case 3: currentEquippedItem = player.weapon4; break;
          case 4: currentEquippedItem = player.weapon5; break;
          case 5: currentEquippedItem = player.head; break;
          case 6: currentEquippedItem = player.body; break;
          case 7: currentEquippedItem = player.legs; break;
        }
        
        // If there's an item already equipped in this slot, unequip it
        if (currentEquippedItem) {
          const currentPlayerItem = await playerItemRepo.findOne({
            where: { 
              player: { id: playerId },
              item: { id: currentEquippedItem.id }
            }
          });
          
          if (currentPlayerItem) {
            currentPlayerItem.isEquipped = false;
            await playerItemRepo.save(currentPlayerItem);
          }
        }
        
        // Now equip the new item in the player entity
        const item = playerItem.item;
        
        switch (slot) {
          case 0: player.weapon1 = item; break;
          case 1: player.weapon2 = item; break;
          case 2: player.weapon3 = item; break;
          case 3: player.weapon4 = item; break;
          case 4: player.weapon5 = item; break;
          case 5: player.head = item; break;
          case 6: player.body = item; break;
          case 7: player.legs = item; break;
        }
        
        // Save the player
        await playerRepo.save(player);
      } 
      // If unequipping, clear the slot
      else {
        let shouldClearSlot = false;
        
        // Check if this item is equipped in the specified slot
        switch (slot) {
          case 0: shouldClearSlot = player.weapon1?.id === itemId; break;
          case 1: shouldClearSlot = player.weapon2?.id === itemId; break;
          case 2: shouldClearSlot = player.weapon3?.id === itemId; break;
          case 3: shouldClearSlot = player.weapon4?.id === itemId; break;
          case 4: shouldClearSlot = player.weapon5?.id === itemId; break;
          case 5: shouldClearSlot = player.head?.id === itemId; break;
          case 6: shouldClearSlot = player.body?.id === itemId; break;
          case 7: shouldClearSlot = player.legs?.id === itemId; break;
        }
        
        if (shouldClearSlot) {
          switch (slot) {
            case 0: player.weapon1 = null; break;
            case 1: player.weapon2 = null; break;
            case 2: player.weapon3 = null; break;
            case 3: player.weapon4 = null; break;
            case 4: player.weapon5 = null; break;
            case 5: player.head = null; break;
            case 6: player.body = null; break;
            case 7: player.legs = null; break;
          }
          
          await playerRepo.save(player);
        }
      }
      
      // Update the player item isEquipped status
      playerItem.isEquipped = equipped;
      await playerItemRepo.save(playerItem);
      
      
    } catch (error) {
      console.error("Error saving equipment state:", error);
    }
  }

  /**
   * Save spell state when player equips or unequips a spell
   */
  async saveSpellState(playerId: string, spellId: string, slot: number, equipped: boolean): Promise<void> {
    try {
      const playerSpellRepo = AppDataSource.getRepository(PlayerSpell);
      const playerRepo = AppDataSource.getRepository(Player);
      
      // First, get the player
      const player = await playerRepo.findOne({
        where: { id: playerId },
        relations: ['spell1', 'spell2', 'spell3', 'spell4', 'spell5']
      });
      
      if (!player) {
        console.error(`Player not found with ID: ${playerId}`);
        return;
      }
      
      // Find the player's spell
      const playerSpell = await playerSpellRepo.findOne({
        where: { 
          player: { id: playerId },
          spell: { id: spellId }
        },
        relations: ['spell']
      });
      
      if (!playerSpell) {
        console.error(`Player spell not found: Player ID ${playerId}, Spell ID ${spellId}`);
        return;
      }
      
      // If equipping, update the player's spell slot
      if (equipped) {
        // If something is already in this slot, unequip it first
        let currentEquippedSpell: Spell | undefined | null = null;
        
        switch (slot) {
          case 0: currentEquippedSpell = player.spell1; break;
          case 1: currentEquippedSpell = player.spell2; break;
          case 2: currentEquippedSpell = player.spell3; break;
          case 3: currentEquippedSpell = player.spell4; break;
          case 4: currentEquippedSpell = player.spell5; break;
        }
        
        // If there's a spell already equipped in this slot, unequip it
        if (currentEquippedSpell) {
          const currentPlayerSpell = await playerSpellRepo.findOne({
            where: { 
              player: { id: playerId },
              spell: { id: currentEquippedSpell.id }
            }
          });
          
          if (currentPlayerSpell) {
            currentPlayerSpell.isEquipped = false;
            await playerSpellRepo.save(currentPlayerSpell);
          }
        }
        
        // Now equip the new spell in the player entity
        const spell = playerSpell.spell;
        
        switch (slot) {
          case 0: player.spell1 = spell; break;
          case 1: player.spell2 = spell; break;
          case 2: player.spell3 = spell; break;
          case 3: player.spell4 = spell; break;
          case 4: player.spell5 = spell; break;
        }
        
        // Save the player
        await playerRepo.save(player);
      } 
      // If unequipping, clear the slot
      else {
        let shouldClearSlot = false;
        
        // Check if this spell is equipped in the specified slot
        switch (slot) {
          case 0: shouldClearSlot = player.spell1?.id === spellId; break;
          case 1: shouldClearSlot = player.spell2?.id === spellId; break;
          case 2: shouldClearSlot = player.spell3?.id === spellId; break;
          case 3: shouldClearSlot = player.spell4?.id === spellId; break;
          case 4: shouldClearSlot = player.spell5?.id === spellId; break;
        }
        
        if (shouldClearSlot) {
          switch (slot) {
            case 0: player.spell1 = null; break;
            case 1: player.spell2 = null; break;
            case 2: player.spell3 = null; break;
            case 3: player.spell4 = null; break;
            case 4: player.spell5 = null; break;
          }
          await playerRepo.save(player);
        }
      }
      
      // Update the player spell isEquipped status
      playerSpell.isEquipped = equipped;
      await playerSpellRepo.save(playerSpell);
      
      
    } catch (error) {
      console.error("Error saving spell state:", error);
    }
  }
} 