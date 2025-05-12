import { Room, Client } from "colyseus";
import { GameState } from "../schemas/GameState";
import { PlayerService } from "../services/PlayerService";
import { GameService } from "../services/GameService";
import { AuthService } from "../services/AuthService";
import { checkLevelUp, calculateRequiredExp } from "../utils/game/experience";

export class GameRoom extends Room<GameState> {
  private playerService: PlayerService = new PlayerService();
  private gameService: GameService = new GameService();
  private saveInterval: NodeJS.Timeout | null = null;

  onCreate(options: any) {
    // Initialize services
    this.gameService.setRoom(this); // Give the room reference to the game service

    this.setState(new GameState());

    // Set game status
    this.state.gameStatus = "active";
    this.state.lastUpdateTime = Date.now();

    // Handle player messages
    this.onMessage("get_player_info", (client) => this.handleGetPlayerInfo(client));
    this.onMessage("equip_item", (client, data) => this.handleEquipItem(client, data));
    this.onMessage("unequip_item", (client, data) => this.handleUnequipItem(client, data));
    this.onMessage("update_spells", (client, data) => this.handleUpdateSpells(client, data));
    this.onMessage("unequip_spell", (client, data) => this.handleUnequipSpell(client, data));
    this.onMessage("shop_purchase", (client, data) => this.handleShopPurchase(client, data));
    this.onMessage("allocate_stat_point", (client, data) => this.handleAllocateStatPoint(client, data));
    this.onMessage("decrease_stat_point", (client, data) => this.handleDecreaseStatPoint(client, data));
    this.onMessage("reset_stats", (client) => this.handleResetStats(client));
    this.onMessage("gain_experience", (client, data) => {
      if (data && data.amount && typeof data.amount === 'number') {
        this.handleAddExperience(client, data.amount);
      }
    });

    // Set up periodic state updates
    this.setSimulationInterval(() => {
      this.state.lastUpdateTime = Date.now();
    }, 1000 / 20); // 20 updates per second

    // Set up periodic save (every 5 minutes)
    this.setPeriodicalSave(5 * 60 * 1000);
  }

  async onAuth(client: Client, options: any, request: any): Promise<any> {
    // Verify the token and get player ID
    if (!options.token) {
      throw new Error("No token provided");
    }

    try {
      // Use AuthService to verify the token
      const player = await AuthService.verifyToken(options.token);
      
      // Return the player ID to be used in onJoin
      return { playerId: player.id };
    } catch (error) {
      console.error("Authentication failed:", error);
      throw new Error("Authentication failed");
    }
  }

  async onJoin(client: Client, options: any, auth: any) {
    
    
    if (!auth || !auth.playerId) {
      throw new Error("Unauthorized: No player ID");
    }

    // Load player from database
    const player = await this.playerService.fetchPlayerData(auth.playerId);

    if (player) {
      // Create player state and add to game state
      const playerState = this.playerService.createPlayerState(player);
      this.state.players.set(client.sessionId, playerState);
      
      // Send initial player details
      this.handleGetPlayerInfo(client);
      
      // Broadcast player joined
      this.broadcast("player_joined", {
        sessionId: client.sessionId,
        username: player.username,
        level: player.level
      }, { except: client });
    }
  }

  async onLeave(client: Client, consented: boolean) {
    
    const playerState = this.state.players.get(client.sessionId);
    
    if (playerState) {
      // Save player state to database
      await this.playerService.savePlayerState(playerState);
      
      // Remove from game state
      this.state.players.delete(client.sessionId);
      
      // Broadcast player left
      this.broadcast("player_left", {
        sessionId: client.sessionId
      });
    }
  }

  onDispose() {
    // Clear the periodic save interval
    if (this.saveInterval) {
      clearInterval(this.saveInterval);
      this.saveInterval = null;
      
    }
    
    // Save all player data before disposing
    
    const sessionIds = Array.from(this.state.players.keys());
    sessionIds.forEach(sessionId => {
      this.savePlayerState(sessionId).catch(err => {
        console.error(`Error saving player ${sessionId} on room disposal:`, err);
      });
    });
  }

  // Handler methods
  private async handleGetPlayerInfo(client: Client) {
    
    
    const auth = client.auth;
    if (!auth || !auth.playerId) {
      console.error("Client has no auth data:", client.sessionId);
      return;
    }
    
    
    
    try {
      // Use the service to send player details
      await this.playerService.sendPlayerDetails(client, (type, message) => {
        console.log(`Sending ${type} message to client:`, 
                    type === 'player_details' ? 
                      { ...message, equipment: message.equipment } : 
                      'message omitted');
        client.send(type, message);
        
        // For equipment specifically, send a separate equipment_updated message
        // to ensure the client receives the equipment data
        if (type === 'player_details' && message.equipment) {
          
          client.send("equipment_updated", { equipment: message.equipment });
        }
      });
    } catch (error) {
      console.error("Error in handleGetPlayerInfo:", error);
    }
  }

  private handleEquipItem(client: Client, data: { itemId: string, slot: number }) {
    const player = this.state.players.get(client.sessionId);
    if (!player) return;

    // Set the item in the player's equipment slot
    player.setEquipmentSlot(data.slot, data.itemId);
    
    // Prepare the complete equipment data for consistency
    const equipmentData = {
      weapon1: player.weapon1 || "",
      weapon2: player.weapon2 || "",
      weapon3: player.weapon3 || "",
      weapon4: player.weapon4 || "",
      weapon5: player.weapon5 || "",
      head: player.head || "",
      body: player.body || "",
      legs: player.legs || ""
    };
    
    // Notify the player about both the specific change and full equipment state
    client.send("equipment_updated", {
      slot: data.slot,
      itemId: data.itemId,
      equipment: equipmentData // Send complete equipment data
    });
    

    // Get player ID from client auth
    const playerId = client.auth?.playerId;
    if (playerId) {
      // Save equipment state to update isEquipped state in database
      // The third parameter (true) indicates that the item is being equipped
      this.playerService.saveEquipmentState(playerId, data.itemId, data.slot, true);
    }

    // Save player state after equipment change (for basic stats)
    this.savePlayerState(client.sessionId);
  }

  private handleUnequipItem(client: Client, data: { itemId: string, slot: number }) {
    const player = this.state.players.get(client.sessionId);
    if (!player) return;

    // Check if the item is actually equipped in the specified slot
    const currentItemId = player.getEquipmentSlot(data.slot);
    if (currentItemId !== data.itemId) {
      client.send("unequip_item_failed", {
        reason: "Item is not equipped in the specified slot"
      });
      return;
    }

    // Clear the slot
    player.setEquipmentSlot(data.slot, "");
    
    // Prepare the complete equipment data for consistency
    const equipmentData = {
      weapon1: player.weapon1 || "",
      weapon2: player.weapon2 || "",
      weapon3: player.weapon3 || "",
      weapon4: player.weapon4 || "",
      weapon5: player.weapon5 || "",
      head: player.head || "",
      body: player.body || "",
      legs: player.legs || ""
    };
    
    // Notify the player about both the specific change and full equipment state
    client.send("equipment_updated", {
      slot: data.slot,
      itemId: "",  // Empty string means unequipped
      equipment: equipmentData // Send complete equipment data
    });
    

    // Get player ID from client auth
    const playerId = client.auth?.playerId;
    if (playerId) {
      // Save equipment state to update isEquipped state in database
      // The third parameter (false) indicates that the item is being unequipped
      this.playerService.saveEquipmentState(playerId, data.itemId, data.slot, false);
    }

    // Save player state after equipment change (for basic stats)
    this.savePlayerState(client.sessionId);
  }

  private handleUpdateSpells(client: Client, data: { spellId: string, slot: number }) {
    const player = this.state.players.get(client.sessionId);
    if (!player) return;

    // TODO: Validate spell ownership and requirements
    player.setSpellSlot(data.slot, data.spellId);
    
    // Prepare the complete active spells data for consistency
    const activeSpellsData = {
      spell1: player.spell1 || "",
      spell2: player.spell2 || "",
      spell3: player.spell3 || "",
      spell4: player.spell4 || "",
      spell5: player.spell5 || ""
    };
    
    // Notify the player about both the specific change and full spells state
    client.send("spells_updated", {
      slot: data.slot,
      spellId: data.spellId,
      activeSpells: activeSpellsData // Send complete active spells data
    });
    

    // Get player ID from client auth
    const playerId = client.auth?.playerId;
    if (playerId) {
      // Save spell state to update isEquipped state in database
      // The third parameter (true) indicates that the spell is being equipped
      this.playerService.saveSpellState(playerId, data.spellId, data.slot, true);
    }

    // Save player state after spell change (for basic stats)
    this.savePlayerState(client.sessionId);
  }

  private handleUnequipSpell(client: Client, data: { spellId: string, slot: number }) {
    const player = this.state.players.get(client.sessionId);
    if (!player) return;

    // Check if the spell is actually equipped in the specified slot
    const currentSpellId = player.getSpellSlot(data.slot);
    if (currentSpellId !== data.spellId) {
      client.send("unequip_spell_failed", {
        reason: "Spell is not equipped in the specified slot"
      });
      return;
    }

    // Clear the slot
    player.setSpellSlot(data.slot, "");
    
    // Prepare the complete active spells data for consistency
    const activeSpellsData = {
      spell1: player.spell1 || "",
      spell2: player.spell2 || "",
      spell3: player.spell3 || "",
      spell4: player.spell4 || "",
      spell5: player.spell5 || ""
    };
    
    // Notify the player about both the specific change and full spells state
    client.send("spells_updated", {
      slot: data.slot,
      spellId: "",  // Empty string means unequipped
      activeSpells: activeSpellsData // Send complete active spells data
    });
    

    // Get player ID from client auth
    const playerId = client.auth?.playerId;
    if (playerId) {
      // Save spell state to update isEquipped state in database
      // The third parameter (false) indicates that the spell is being unequipped
      this.playerService.saveSpellState(playerId, data.spellId, data.slot, false);
    }

    // Save player state after spell change (for basic stats)
    this.savePlayerState(client.sessionId);
  }

  private handleShopPurchase(client: Client, data: { itemId: string, quantity: number }) {
    const player = this.state.players.get(client.sessionId);
    if (!player) return;

    // TODO: Implement shop purchase logic
    client.send("shop_purchase_complete", {
      itemId: data.itemId,
      quantity: data.quantity
    });

    // Save player state after shop purchase
    this.savePlayerState(client.sessionId);
  }

  private handleAllocateStatPoint(client: Client, data: { statType: string }) {
    const player = this.state.players.get(client.sessionId);
    if (!player) {
      
      return;
    }

    // Check if player has stat points to allocate
    if (player.statPoints <= 0) {
      
      client.send("stat_point_allocation_failed", {
        reason: "No stat points available"
      });
      return;
    }

    

    // Allocate the stat point based on the statType
    switch (data.statType.toLowerCase()) {
      case "str":
        player.str += 1;
        break;
      case "int":
        player.int += 1;
        break;
      case "agi":
        player.agi += 1;
        break;
      case "dex":
        player.dex += 1;
        break;
      case "luk":
        player.luk += 1;
        break;
      default:
        
        client.send("stat_point_allocation_failed", {
          reason: "Invalid stat type"
        });
        return;
    }

    // Decrease available stat points
    player.statPoints -= 1;

    // Update derived stats if needed (hp, mp, etc.)
    this.updatePlayerDerivedStats(player);

    

    // Notify the player about stat change
    client.send("stat_point_allocated", {
      statType: data.statType,
      newValue: this.getStatValue(player, data.statType.toLowerCase()),
      remainingPoints: player.statPoints
    });

    // Broadcast the change to other players if needed
    this.broadcast("player_updated", {
      sessionId: client.sessionId,
      stats: {
        str: player.str,
        int: player.int,
        agi: player.agi,
        dex: player.dex,
        luk: player.luk,
        hp: player.hp,
        maxHp: player.maxHp,
        mp: player.mp,
        maxMp: player.maxMp
      }
    }, { except: client });

    // Save player state to database after stat point allocation
    this.savePlayerState(client.sessionId);
  }

  private handleDecreaseStatPoint(client: Client, data: { statType: string }) {
    const player = this.state.players.get(client.sessionId);
    if (!player) {
      
      return;
    }

    // Minimum value for each stat
    const MIN_STAT_VALUE = 5;

    

    // Get current stat value
    const currentValue = this.getStatValue(player, data.statType.toLowerCase());
    
    // Check if stat can be decreased (must be greater than minimum)
    if (currentValue <= MIN_STAT_VALUE) {
      
      client.send("stat_point_decrease_failed", {
        reason: "Stat is already at minimum value"
      });
      return;
    }

    // Decrease the stat point based on the statType
    switch (data.statType.toLowerCase()) {
      case "str":
        player.str -= 1;
        break;
      case "int":
        player.int -= 1;
        break;
      case "agi":
        player.agi -= 1;
        break;
      case "dex":
        player.dex -= 1;
        break;
      case "luk":
        player.luk -= 1;
        break;
      default:
        
        client.send("stat_point_decrease_failed", {
          reason: "Invalid stat type"
        });
        return;
    }

    // Increase available stat points
    player.statPoints += 1;

    // Update derived stats if needed (hp, mp, etc.)
    this.updatePlayerDerivedStats(player);

    

    // Notify the player about stat change
    client.send("stat_point_decreased", {
      statType: data.statType,
      newValue: this.getStatValue(player, data.statType.toLowerCase()),
      remainingPoints: player.statPoints
    });

    // Broadcast the change to other players if needed
    this.broadcast("player_updated", {
      sessionId: client.sessionId,
      stats: {
        str: player.str,
        int: player.int,
        agi: player.agi,
        dex: player.dex,
        luk: player.luk,
        hp: player.hp,
        maxHp: player.maxHp,
        mp: player.mp,
        maxMp: player.maxMp
      }
    }, { except: client });

    // Save player state to database after stat point decrease
    this.savePlayerState(client.sessionId);
  }

  private handleResetStats(client: Client) {
    const player = this.state.players.get(client.sessionId);
    if (!player) {
      
      return;
    }

    

    // Default value for each stat
    const DEFAULT_STAT_VALUE = 5;
    
    // Calculate total allocated points to refund
    const totalAllocatedPoints = 
      (player.str - DEFAULT_STAT_VALUE) +
      (player.int - DEFAULT_STAT_VALUE) +
      (player.agi - DEFAULT_STAT_VALUE) +
      (player.dex - DEFAULT_STAT_VALUE) +
      (player.luk - DEFAULT_STAT_VALUE);
    
    // Reset stats to default values
    player.str = DEFAULT_STAT_VALUE;
    player.int = DEFAULT_STAT_VALUE;
    player.agi = DEFAULT_STAT_VALUE;
    player.dex = DEFAULT_STAT_VALUE;
    player.luk = DEFAULT_STAT_VALUE;
    
    // Refund stat points
    player.statPoints += totalAllocatedPoints;

    // Update derived stats
    this.updatePlayerDerivedStats(player);

    

    // Notify the player about stat reset
    client.send("stats_reset", {
      stats: {
        str: player.str,
        int: player.int,
        agi: player.agi,
        dex: player.dex,
        luk: player.luk,
        hp: player.hp,
        maxHp: player.maxHp,
        mp: player.mp,
        maxMp: player.maxMp
      },
      remainingPoints: player.statPoints
    });

    // Broadcast the change to other players if needed
    this.broadcast("player_updated", {
      sessionId: client.sessionId,
      stats: {
        str: player.str,
        int: player.int,
        agi: player.agi,
        dex: player.dex,
        luk: player.luk,
        hp: player.hp,
        maxHp: player.maxHp,
        mp: player.mp,
        maxMp: player.maxMp
      }
    }, { except: client });

    // Save player state to database after stat reset
    this.savePlayerState(client.sessionId);
  }

  // New method to handle experience gain and level up
  public handleAddExperience(client: Client, expAmount: number) {
    const player = this.state.players.get(client.sessionId);
    if (!player) return;

    // Add experience
    player.exp += expAmount;
    
    // Check if player leveled up
    let leveledUp = false;
    while (checkLevelUp(player.exp, player.level)) {
      // Level up the player
      player.level += 1;
      
      // Add stat points (typically 5 per level)
      player.statPoints += 5;
      
      // Update derived stats
      this.updatePlayerDerivedStats(player);
      
      leveledUp = true;
    }

    // Calculate experience required for next level
    const expForNextLevel = calculateRequiredExp(player.level);
    
    // Notify player about experience gain
    client.send("experience_gained", {
      amount: expAmount,
      totalExp: player.exp,
      expForNextLevel: expForNextLevel,
      hp: player.hp,
      maxHp: player.maxHp,
      mp: player.mp, 
      maxMp: player.maxMp
    });
    
    // If player leveled up, notify them and save state
    if (leveledUp) {
      client.send("level_up", {
        newLevel: player.level,
        statPoints: player.statPoints,
        stats: {
          str: player.str,
          int: player.int,
          agi: player.agi,
          dex: player.dex,
          luk: player.luk,
          hp: player.hp,
          maxHp: player.maxHp,
          mp: player.mp,
          maxMp: player.maxMp
        }
      });
      
      // Broadcast the level up to other players
      this.broadcast("player_leveled_up", {
        sessionId: client.sessionId,
        username: player.name,
        newLevel: player.level
      }, { except: client });
      
      // Save player state after level up
      this.savePlayerState(client.sessionId);
      
      
    }
  }

  // Helper method to save player state to database
  private async savePlayerState(sessionId: string): Promise<boolean> {
    const playerState = this.state.players.get(sessionId);
    if (!playerState) return false;
    
    try {
      
      await this.playerService.savePlayerState(playerState);
      return true;
    } catch (error) {
      console.error(`Error saving state for player ${sessionId}:`, error);
      return false;
    }
  }

  private updatePlayerDerivedStats(player: any) {
    // Update max HP based on STR and level
    player.maxHp = 100 + (player.str * 5) + (player.level * 10);
    
    // Update max MP based on INT and level
    player.maxMp = 50 + (player.int * 5) + (player.level * 5);
    
    // Ensure current HP/MP don't exceed maximums
    player.hp = Math.min(player.hp, player.maxHp);
    player.mp = Math.min(player.mp, player.maxMp);
  }

  private getStatValue(player: any, statType: string): number {
    switch (statType) {
      case "str": return player.str;
      case "int": return player.int;
      case "agi": return player.agi;
      case "dex": return player.dex;
      case "luk": return player.luk;
      default: return 0;
    }
  }

  // Set up periodic save for all connected players
  private setPeriodicalSave(intervalMs: number) {
    // Clear any existing interval first
    if (this.saveInterval) {
      clearInterval(this.saveInterval);
      this.saveInterval = null;
    }
    
    // Set new interval
    this.saveInterval = setInterval(() => {
      
      
      // Get all player session IDs
      const sessionIds = Array.from(this.state.players.keys());
      
      // If no players are connected, skip this save
      if (sessionIds.length === 0) {
        
        return;
      }
      
      // Save each player's state
      sessionIds.forEach(sessionId => {
        this.savePlayerState(sessionId).then(success => {
          if (success) {
            
          }
        });
      });
    }, intervalMs);
  }
} 