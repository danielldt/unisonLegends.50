import { gameService } from '../../services/gameService';
import { GameAction } from './gameState';

/**
 * Create selector functions for specific state slices
 */

// Selector for player state
export const selectPlayer = (state: any) => state.player;

// Selector for player stats
export const selectPlayerStats = (state: any) => state.player?.stats || null;

// Selector for inventory
export const selectInventory = (state: any) => state.inventory || {};

// Selector for equipment
export const selectEquipment = (state: any) => state.equipment || {};

// Selector for spells
export const selectSpells = (state: any) => ({
  knownSpells: state.knownSpells || {},
  activeSpells: state.activeSpells || {}
});

// Selector for connection status
export const selectConnectionStatus = (state: any) => ({
  connected: state.connected,
  connectionError: state.connectionError,
  loading: state.loading
});

/**
 * Utility for creating a listener that dispatches to the store
 */
export const createStoreListener = (eventName: string, actionType: string, dispatch: React.Dispatch<GameAction>) => {
  const listener = (data: any) => {
    dispatch({ type: actionType as any, payload: data });
  };
  
  gameService.on(eventName, listener);
  
  // Return unsubscribe function
  return () => {
    gameService.off(eventName, listener);
  };
};

/**
 * Create a middleware-style function for handling actions
 */
export const withLogging = (action: Function) => {
  return (...args: any[]) => {
    
    return action(...args);
  };
}; 