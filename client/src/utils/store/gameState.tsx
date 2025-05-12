import React, { createContext, useContext, useReducer, ReactNode, useEffect, useRef } from 'react';
import { gameService } from '../../services/gameService';

// Define state types
export interface PlayerStats {
  hp: number;
  maxHp: number;
  mp: number;
  maxMp: number;
  str: number;
  agi: number;
  int: number;
  dex: number;
  luk: number;
  attack: number;
  defense: number;
  critRate: number;
  dodge: number;
  hit: number;
  cooldownReduction: number;
  statPoints: number;
  maxExp: number;
}

export interface Player {
  username: string;
  level: number;
  exp: number;
  stats: PlayerStats;
}

export interface Equipment {
  weapon1?: string;
  weapon2?: string;
  weapon3?: string;
  weapon4?: string;
  weapon5?: string;
  head?: string;
  body?: string;
  legs?: string;
  [slot: string]: string | undefined;
  equipment?: any; // For server response format
}

export interface Inventory {
  [id: string]: { id: string; name: string; type: string; [key: string]: any };
}

export interface Spell {
  id: string;
  name: string;
  description: string;
  manaCost: number;
  level: number;
  cooldown: number;
  [key: string]: any;
}

export interface ActiveSpells {
  spell1?: string;
  spell2?: string;
  spell3?: string;
  spell4?: string;
  spell5?: string;
  [slot: string]: string | undefined;
  activeSpells?: any; // For server response format
}

export interface KnownSpells {
  [id: string]: Spell;
}

export interface GameState {
  connected: boolean;
  connectionError: string;
  player: Player | null;
  inventory: Inventory;
  equipment: Equipment;
  knownSpells: KnownSpells;
  activeSpells: ActiveSpells;
  loading: boolean;
}

// Action types
export type GameAction =
  | { type: 'SET_CONNECTION_STATUS', payload: { connected: boolean, error?: string } }
  | { type: 'SET_PLAYER_DATA', payload: any }
  | { type: 'UPDATE_PLAYER', payload: any }
  | { type: 'UPDATE_EXPERIENCE', payload: any }
  | { type: 'LEVEL_UP', payload: any }
  | { type: 'EQUIPMENT_UPDATED', payload: Equipment }
  | { type: 'SPELLS_UPDATED', payload: ActiveSpells }
  | { type: 'INVENTORY_UPDATED', payload: Inventory }
  | { type: 'SET_LOADING', payload: boolean };

// Initial state
const initialState: GameState = {
  connected: false,
  connectionError: '',
  player: null,
  inventory: {},
  equipment: {},
  knownSpells: {},
  activeSpells: {},
  loading: true
};

// Reducer function
function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'SET_CONNECTION_STATUS':
      return {
        ...state,
        connected: action.payload.connected,
        connectionError: action.payload.error || '',
      };
    case 'SET_PLAYER_DATA':
      return {
        ...state,
        player: {
          username: action.payload.username,
          level: action.payload.level,
          exp: action.payload.exp,
          stats: {
            hp: action.payload.stats.hp,
            maxHp: action.payload.stats.maxHp,
            mp: action.payload.stats.mp,
            maxMp: action.payload.stats.maxMp,
            str: action.payload.stats.str,
            agi: action.payload.stats.agi,
            int: action.payload.stats.int,
            dex: action.payload.stats.dex,
            luk: action.payload.stats.luk,
            attack: action.payload.stats.attack,
            defense: action.payload.stats.defense,
            critRate: action.payload.stats.critRate,
            dodge: action.payload.stats.dodge,
            hit: action.payload.stats.hit,
            cooldownReduction: action.payload.stats.cooldownReduction,
            statPoints: action.payload.stats.statPoints || 0,
            maxExp: action.payload.stats.maxExp,
          }
        },
        inventory: action.payload.inventory || {},
        equipment: action.payload.equipment || {},
        knownSpells: action.payload.knownSpells || {},
        activeSpells: action.payload.activeSpells || {},
        loading: false,
      };
    case 'UPDATE_PLAYER':
      if (!state.player) return state;
      return {
        ...state,
        player: {
          ...state.player,
          stats: {
            ...state.player.stats,
            ...(action.payload.stats || {})
          }
        },
        ...(action.payload.equipment ? { equipment: { ...state.equipment, ...action.payload.equipment } } : {}),
        ...(action.payload.spells ? { activeSpells: { ...state.activeSpells, ...action.payload.spells } } : {})
      };
    case 'UPDATE_EXPERIENCE':
      if (!state.player) return state;
      return {
        ...state,
        player: {
          ...state.player,
          exp: action.payload.totalExp,
          stats: {
            ...state.player.stats,
            hp: action.payload.hp || state.player.stats.hp,
            maxHp: action.payload.maxHp || state.player.stats.maxHp,
            mp: action.payload.mp || state.player.stats.mp,
            maxMp: action.payload.maxMp || state.player.stats.maxMp,
            maxExp: action.payload.expForNextLevel || state.player.stats.maxExp
          }
        }
      };
    case 'LEVEL_UP':
      if (!state.player) return state;
      return {
        ...state,
        player: {
          ...state.player,
          level: action.payload.newLevel,
          stats: {
            ...state.player.stats,
            ...action.payload.stats,
            statPoints: action.payload.statPoints
          }
        }
      };
    case 'EQUIPMENT_UPDATED':
      // If the payload includes a complete equipment object, use it directly
      if (action.payload && typeof action.payload === 'object') {
        // Check if this is a complete replacement (full equipment object)
        if ('weapon1' in action.payload || 'head' in action.payload) {
          
          return {
            ...state,
            equipment: action.payload
          };
        }
        
        // If it's a server event with equipment data inside
        if (action.payload.equipment && typeof action.payload.equipment === 'object') {
          
          return {
            ...state,
            equipment: action.payload.equipment
          };
        }
        
        // If it contains only slot and itemId, update just that slot
        if ('slot' in action.payload && 'itemId' in action.payload) {
          
          const slotNumber = Number(action.payload.slot);
          const updatedEquipment = { ...state.equipment };
          
          // Map numeric slots to named slots
          if (slotNumber === 0) updatedEquipment.weapon1 = action.payload.itemId;
          else if (slotNumber === 1) updatedEquipment.weapon2 = action.payload.itemId;
          else if (slotNumber === 2) updatedEquipment.weapon3 = action.payload.itemId;
          else if (slotNumber === 3) updatedEquipment.weapon4 = action.payload.itemId;
          else if (slotNumber === 4) updatedEquipment.weapon5 = action.payload.itemId;
          else if (slotNumber === 5) updatedEquipment.head = action.payload.itemId;
          else if (slotNumber === 6) updatedEquipment.body = action.payload.itemId;
          else if (slotNumber === 7) updatedEquipment.legs = action.payload.itemId;
          
          return {
            ...state,
            equipment: updatedEquipment
          };
        }
      }
      
      // Fallback to direct replacement (legacy)
      return {
        ...state,
        equipment: action.payload
      };
      
    case 'SPELLS_UPDATED':
      // If the payload includes a complete activeSpells object, use it directly
      if (action.payload && typeof action.payload === 'object') {
        // Check if this is a complete replacement (full spells object)
        if ('spell1' in action.payload || 'spell2' in action.payload) {
          
          return {
            ...state,
            activeSpells: action.payload
          };
        }
        
        // If it's a server event with activeSpells data inside
        if (action.payload.activeSpells && typeof action.payload.activeSpells === 'object') {
          
          return {
            ...state,
            activeSpells: action.payload.activeSpells
          };
        }
        
        // If it contains only slot and spellId, update just that slot
        if ('slot' in action.payload && 'spellId' in action.payload) {
          
          const slotNumber = Number(action.payload.slot);
          const updatedSpells = { ...state.activeSpells };
          
          // Map numeric slots to named slots
          if (slotNumber === 0) updatedSpells.spell1 = action.payload.spellId;
          else if (slotNumber === 1) updatedSpells.spell2 = action.payload.spellId;
          else if (slotNumber === 2) updatedSpells.spell3 = action.payload.spellId;
          else if (slotNumber === 3) updatedSpells.spell4 = action.payload.spellId;
          else if (slotNumber === 4) updatedSpells.spell5 = action.payload.spellId;
          
          return {
            ...state,
            activeSpells: updatedSpells
          };
        }
      }
      
      // Fallback to direct replacement (legacy)
      return {
        ...state,
        activeSpells: action.payload
      };
    case 'INVENTORY_UPDATED':
      return {
        ...state,
        inventory: action.payload
      };
    case 'SET_LOADING':
      return {
        ...state,
        loading: action.payload
      };
    default:
      return state;
  }
}

// Create context
type GameContextType = {
  state: GameState;
  dispatch: React.Dispatch<GameAction>;
};

const GameContext = createContext<GameContextType | undefined>(undefined);

// Provider component
export function GameProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(gameReducer, initialState);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const connectionAttemptsRef = useRef(0);
  const maxConnectionAttempts = 3;
  const playerDataReceived = useRef(false);

  // Setup game service connection and listeners
  useEffect(() => {
    // Only attempt to connect if:
    // 1. We're not already connected
    // 2. We're not currently trying to connect
    // 3. We don't have a connection error (to prevent infinite reconnection attempts)
    if (state.connected || state.loading || (state.connectionError && connectionAttemptsRef.current >= maxConnectionAttempts)) return;

    // Set loading to prevent multiple connection attempts
    dispatch({ type: 'SET_LOADING', payload: true });
    
    const connectToGame = async () => {
      try {
        
        connectionAttemptsRef.current += 1;
        
        const roomInstance = await gameService.connect();
        
        if (!roomInstance) {
          throw new Error("Failed to connect to game room");
        }
        
        
        dispatch({ type: 'SET_CONNECTION_STATUS', payload: { connected: true } });
        
        // Give a moment for connection to stabilize
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Request initial player data
        
        const success = gameService.getPlayerInfo();
        
        
        // Set up a longer timeout for first load
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
        
        // Listen for player details
        const handlePlayerDetails = (data: any) => {
          
          if (!data || !data.username) {
            console.error('Invalid player data received:', data);
            return;
          }
          
          dispatch({ type: 'SET_PLAYER_DATA', payload: data });
          dispatch({ type: 'SET_LOADING', payload: false });
          playerDataReceived.current = true;
          
          // Clear the timeout since we got the data
          if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
            timeoutRef.current = null;
          }
        };
        
        gameService.off('player_details', () => {});
        gameService.on('player_details', handlePlayerDetails);
        
        // Set a timeout to stop loading if we never get player data
        timeoutRef.current = setTimeout(() => {
          if (state.loading) {
            
            
            if (!playerDataReceived.current) {
              
              gameService.getPlayerInfo();
              
              // Set a shorter timeout for the retry
              timeoutRef.current = setTimeout(() => {
                
                dispatch({ type: 'SET_LOADING', payload: false });
                
                if (!playerDataReceived.current) {
                  dispatch({ 
                    type: 'SET_CONNECTION_STATUS', 
                    payload: { 
                      connected: false, 
                      error: 'Could not retrieve player data. Please try refreshing the page.' 
                    } 
                  });
                }
              }, 3000);
            } else {
              dispatch({ type: 'SET_LOADING', payload: false });
            }
          }
        }, 5000); // 5 second timeout for initial load
        
        // Listen for player updates
        gameService.on('player_updated', (data: any) => {
          dispatch({ type: 'UPDATE_PLAYER', payload: data });
        });
        
        // Listen for experience updates
        gameService.on('experience_gained', (data: any) => {
          dispatch({ type: 'UPDATE_EXPERIENCE', payload: data });
        });
        
        // Listen for level up
        gameService.on('level_up', (data: any) => {
          dispatch({ type: 'LEVEL_UP', payload: data });
        });
        
        // Listen for equipment updates
        gameService.on('equipment_updated', (data: any) => {
          
          dispatch({ type: 'EQUIPMENT_UPDATED', payload: data });
        });
        
        // Listen for spell updates
        gameService.on('spells_updated', (data: any) => {
          
          dispatch({ type: 'SPELLS_UPDATED', payload: data });
        });
        
        // Listen for inventory updates
        gameService.on('inventory_updated', (data: any) => {
          
          dispatch({ type: 'INVENTORY_UPDATED', payload: data });
        });
        
        // Listen for connection errors
        gameService.on('error', (error: any) => {
          console.error('Game service error:', error);
          dispatch({ 
            type: 'SET_CONNECTION_STATUS', 
            payload: { connected: false, error: 'Connection error' } 
          });
        });
        
        // Listen for disconnections
        gameService.on('disconnected', () => {
          
          dispatch({ 
            type: 'SET_CONNECTION_STATUS', 
            payload: { connected: false, error: 'Disconnected from game server' } 
          });
        });
        
      } catch (error) {
        console.error('Connection error:', error);
        dispatch({ 
          type: 'SET_CONNECTION_STATUS', 
          payload: { connected: false, error: 'Could not connect to game server' } 
        });
        
        // Stop loading state after connection error
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    };

    connectToGame();

    // Cleanup on unmount
    return () => {
      // Clear timeout to prevent memory leaks
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      
      // Remove all event listeners
      gameService.off('player_details', () => {});
      gameService.off('player_updated', () => {});
      gameService.off('experience_gained', () => {});
      gameService.off('level_up', () => {});
      gameService.off('equipment_updated', () => {});
      gameService.off('spells_updated', () => {});
      gameService.off('inventory_updated', () => {});
      gameService.off('error', () => {});
      gameService.off('disconnected', () => {});
      
      // Disconnect from game room
      gameService.disconnect();
    };
  }, [state.connected, state.loading, state.connectionError]);

  return (
    <GameContext.Provider value={{ state, dispatch }}>
      {children}
    </GameContext.Provider>
  );
}

// Custom hook to use the game state
export function useGameState() {
  const context = useContext(GameContext);
  if (context === undefined) {
    throw new Error('useGameState must be used within a GameProvider');
  }
  return context;
} 