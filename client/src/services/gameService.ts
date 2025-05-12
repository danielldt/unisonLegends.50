import { Client, Room } from 'colyseus.js';
import { authService } from './authService';

const COLYSEUS_URL = process.env.REACT_APP_COLYSEUS_URL || 'ws://localhost:3001';

class GameService {
  private client: Client;
  private room: Room | null = null;
  private playerState: any = {};
  private listeners: Map<string, Function[]> = new Map();

  constructor() {
    this.client = new Client(COLYSEUS_URL);
  }

  async connect(): Promise<Room | null> {
    try {
      const token = authService.getCurrentToken();
      if (!token) {
        throw new Error('Not authenticated');
      }

      // Verify token first
      const verifyResult = await authService.verifyToken(token);
      if (!verifyResult.success) {
        console.error('Token verification failed:', verifyResult.error?.message);
        // If token is invalid, clear it and throw error
        if (verifyResult.error?.code === 'TOKEN_VERIFICATION_FAILED') {
          authService.logout();
        }
        throw new Error(verifyResult.error?.message || 'Authentication failed');
      }

      
      
      // Disconnect any existing connection before creating a new one
      if (this.room) {
        
        this.room.leave();
        this.room = null;
      }
      
      try {
        this.room = await this.client.joinOrCreate('game_room', {
          token
        });
      } catch (error) {
        console.error('Failed to connect to game room:', error);
        // Retry once with a clean connection
        
        this.client = new Client(COLYSEUS_URL);
        this.room = await this.client.joinOrCreate('game_room', {
          token
        });
      }

      
      
      // Set up room event listeners
      this.setupRoomListeners();

      // Ensure we have a valid room connection before returning
      if (!this.room || !this.room.id) {
        throw new Error("Failed to establish proper room connection");
      }

      // Add a small delay to ensure listeners are set up
      await new Promise(resolve => setTimeout(resolve, 300));

      return this.room;
    } catch (error) {
      console.error('Failed to connect to game room:', error);
      this.room = null;
      throw error;
    }
  }

  disconnect() {
    if (this.room) {
      this.room.leave();
      this.room = null;
    }
  }

  private setupRoomListeners() {
    if (!this.room) return;

    // Listen for state changes
    this.room.onStateChange((state) => {
      this.playerState = state;
      this.notifyListeners('state-change', state);
    });

    // Listen for messages
    this.room.onMessage('playerJoined', (message) => {
      this.notifyListeners('player-joined', message);
    });

    this.room.onMessage('playerLeft', (message) => {
      this.notifyListeners('player-left', message);
    });

    this.room.onMessage('chat', (message) => {
      this.notifyListeners('chat', message);
    });

    // Add explicit handler for player_details
    this.room.onMessage('player_details', (message) => {
      
      this.notifyListeners('player_details', message);
    });

    // Experience and level up messages
    this.room.onMessage('experience_gained', (message) => {
      this.notifyListeners('experience_gained', message);
    });

    this.room.onMessage('level_up', (message) => {
      this.notifyListeners('level_up', message);
    });

    this.room.onMessage('player_leveled_up', (message) => {
      this.notifyListeners('player_leveled_up', message);
    });

    // Other message types
    this.room.onMessage('*', (type, message) => {
      this.notifyListeners(type.toString(), message);
    });

    // Error and connection events
    this.room.onError((error) => {
      console.error('Room error:', error);
      this.notifyListeners('error', error);
    });

    this.room.onLeave((code) => {
      this.room = null;
      this.notifyListeners('disconnected', code);
    });

    // Also request the room state which might contain player data
    this.room.onStateChange.once((state) => {
      
      // Manually notify listeners with the player state
      if (state?.players && this.room?.sessionId) {
        const sessionId = this.room.sessionId;
        const playerData = state.players[sessionId];
        if (playerData) {
          
          this.notifyListeners('player_details', playerData);
        }
      }
    });
  }

  // Movement and actions
  movePlayer(direction: string) {
    if (this.room) {
      this.room.send('move', { direction });
    }
  }

  attackTarget(targetId: string) {
    if (this.room) {
      this.room.send('attack', { targetId });
    }
  }

  castSpell(spellId: string, targetId?: string) {
    if (this.room) {
      this.room.send('cast', { spellId, targetId });
    }
  }

  useItem(itemId: string, targetId?: string) {
    if (this.room) {
      this.room.send('useItem', { itemId, targetId });
    }
  }

  allocateStatPoint(statType: string) {
    if (this.room) {
      this.room.send('allocate_stat_point', { statType });
      return true;
    }
    return false;
  }

  decreaseStatPoint(statType: string) {
    if (this.room) {
      this.room.send('decrease_stat_point', { statType });
      return true;
    }
    return false;
  }

  resetStats() {
    if (this.room) {
      this.room.send('reset_stats');
      return true;
    }
    return false;
  }

  // Equipment management
  equipItem(itemId: string, slot: number) {
    if (this.room) {
      this.room.send('equip_item', { itemId, slot });
      return true;
    }
    return false;
  }

  unequipItem(itemId: string, slot: number) {
    if (this.room) {
      this.room.send('unequip_item', { itemId, slot });
      return true;
    }
    return false;
  }

  // Spell management
  equipSpell(spellId: string, slot: number) {
    if (this.room) {
      this.room.send('update_spells', { spellId, slot });
      return true;
    }
    return false;
  }

  unequipSpell(spellId: string, slot: number) {
    if (this.room) {
      this.room.send('unequip_spell', { spellId, slot });
      return true;
    }
    return false;
  }

  // Method to request player information update
  getPlayerInfo() {
    if (!this.room) {
      console.warn('Cannot request player info - not connected to game room');
      return false;
    }
    
    try {
      
      
      // First, clear any cached player data to ensure fresh state
      this.playerState = {};
      
      // Send request to server
      this.room.send('get_player_info');
      
      // Try to get data from current state
      const foundInState = this.getPlayerDataFromState();
      
      // If not found, register for state change
      if (!foundInState) {
        
        
        this.room.onStateChange.once((state) => {
          
          if (!this.getPlayerDataFromState()) {
            
          }
        });
        
        // Add a timeout to ensure we get a response
        setTimeout(() => {
          
          this.getPlayerDataFromState();
        }, 2000); // 2 second timeout
      }
      
      return true;
    } catch (error) {
      console.error('Error requesting player info:', error);
      return false;
    }
  }
  
  // Helper method to get player data from room state
  private getPlayerDataFromState(): boolean {
    if (this.room?.state?.players && this.room?.sessionId) {
      const sessionId = this.room.sessionId;
      const playerData = this.room.state.players[sessionId];
      
      if (playerData) {
        
        // Convert to the expected format if needed
        const processedData = this.processPlayerData(playerData);
        
        // Log equipment data specifically
        if (processedData.equipment) {
          
          const hasEquippedItems = Object.values(processedData.equipment).some(id => id !== '');
          if (hasEquippedItems) {
            
          } else {
            
          }
        }
        
        this.notifyListeners('player_details', processedData);
        return true;
      } else {
        
      }
    }
    return false;
  }
  
  // Helper to process player data from state format to the expected format
  private processPlayerData(playerData: any) {
    
    
    // If already in the correct format, return as is
    if (playerData.username && playerData.stats) {
      return playerData;
    }
    
    // Create a normalized format
    const processedData: any = {
      username: playerData.username || playerData.name || 'Unknown',
      level: playerData.level || 1,
      exp: playerData.exp || 0,
      stats: {
        hp: playerData.hp || 100,
        maxHp: playerData.maxHp || playerData.max_hp || 100,
        mp: playerData.mp || 50,
        maxMp: playerData.maxMp || playerData.max_mp || 50,
        str: playerData.str || 10,
        agi: playerData.agi || 10,
        int: playerData.int || 10,
        dex: playerData.dex || 10,
        luk: playerData.luk || 10,
        attack: playerData.attack || 10,
        defense: playerData.defense || 10,
        critRate: playerData.critRate || playerData.crit_rate || 5,
        speed: playerData.speed || 10,
        statPoints: playerData.statPoints || playerData.stat_points || 0,
        maxExp: playerData.maxExp || playerData.max_exp || 1000,
      }
    };
    
    // Handle inventory, equipment, spells if available
    if (playerData.inventory) {
      processedData.inventory = playerData.inventory;
    }
    
    // Process equipment - ensure we have all the expected equipment slots
    const equipment: { [key: string]: string } = {
      weapon1: '',
      weapon2: '',
      weapon3: '',
      weapon4: '',
      weapon5: '',
      head: '',
      body: '',
      legs: ''
    };
    
    
    
    // Direct equipment properties
    if (playerData.weapon1 !== undefined) equipment.weapon1 = playerData.weapon1;
    if (playerData.weapon2 !== undefined) equipment.weapon2 = playerData.weapon2;
    if (playerData.weapon3 !== undefined) equipment.weapon3 = playerData.weapon3;
    if (playerData.weapon4 !== undefined) equipment.weapon4 = playerData.weapon4;
    if (playerData.weapon5 !== undefined) equipment.weapon5 = playerData.weapon5;
    if (playerData.head !== undefined) equipment.head = playerData.head;
    if (playerData.body !== undefined) equipment.body = playerData.body;
    if (playerData.legs !== undefined) equipment.legs = playerData.legs;
    
    // If there's an equipment object, use that data as well
    if (playerData.equipment) {
      
      // Equipment data might be in numbered format or named format
      Object.entries(playerData.equipment).forEach(([key, value]) => {
        // Check if it's a numbered slot
        const slotNum = parseInt(key, 10);
        if (!isNaN(slotNum)) {
          // Convert numbered slot to named slot
          if (slotNum === 0) equipment.weapon1 = value as string;
          else if (slotNum === 1) equipment.weapon2 = value as string;
          else if (slotNum === 2) equipment.weapon3 = value as string;
          else if (slotNum === 3) equipment.weapon4 = value as string;
          else if (slotNum === 4) equipment.weapon5 = value as string;
          else if (slotNum === 5) equipment.head = value as string;
          else if (slotNum === 6) equipment.body = value as string;
          else if (slotNum === 7) equipment.legs = value as string;
        } else {
          // Named slot (weapon1, head, etc.)
          if (key in equipment) {
            equipment[key] = value as string;
          }
        }
      });
    }
    
    
    processedData.equipment = equipment;
    
    if (playerData.knownSpells || playerData.known_spells) {
      processedData.knownSpells = playerData.knownSpells || playerData.known_spells;
    }
    
    // Process active spells - ensure we have all the expected spell slots
    const activeSpells: { [key: string]: string } = {
      spell1: '',
      spell2: '',
      spell3: '',
      spell4: '',
      spell5: ''
    };
    
    // Direct spell properties
    if (playerData.spell1 !== undefined) activeSpells.spell1 = playerData.spell1;
    if (playerData.spell2 !== undefined) activeSpells.spell2 = playerData.spell2;
    if (playerData.spell3 !== undefined) activeSpells.spell3 = playerData.spell3;
    if (playerData.spell4 !== undefined) activeSpells.spell4 = playerData.spell4;
    if (playerData.spell5 !== undefined) activeSpells.spell5 = playerData.spell5;
    
    // If there's an activeSpells object, use that data as well
    if (playerData.activeSpells || playerData.active_spells) {
      const spells = playerData.activeSpells || playerData.active_spells;
      Object.entries(spells).forEach(([key, value]) => {
        if (key in activeSpells) {
          activeSpells[key] = value as string;
        }
      });
    }
    
    processedData.activeSpells = activeSpells;
    
    return processedData;
  }

  // Method to request experience gain (for testing purposes)
  gainExperience(amount: number) {
    if (this.room) {
      this.room.send('gain_experience', { amount });
      return true;
    }
    return false;
  }

  sendChat(message: string) {
    if (this.room) {
      this.room.send('chat', { message });
    }
  }

  // Event system
  on(event: string, callback: Function) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)?.push(callback);
  }

  off(event: string, callback: Function) {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      const index = callbacks.indexOf(callback);
      if (index !== -1) {
        callbacks.splice(index, 1);
      }
    }
  }

  private notifyListeners(event: string, data: any) {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      callbacks.forEach(callback => callback(data));
    }
  }

  // Getters
  getRoom() {
    return this.room;
  }

  getPlayerState() {
    return this.playerState;
  }

  isConnected() {
    return !!this.room;
  }
}

export const gameService = new GameService(); 