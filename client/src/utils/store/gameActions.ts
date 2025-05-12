import { gameService } from '../../services/gameService';
import { GameAction } from './gameState';

// Game action creators for updating state
export const gameActions = {
  // Character actions
  allocateStatPoint: (statType: string, dispatch: React.Dispatch<GameAction>) => {
    const success = gameService.allocateStatPoint(statType);
    return success;
  },

  decreaseStatPoint: (statType: string, dispatch: React.Dispatch<GameAction>) => {
    const success = gameService.decreaseStatPoint(statType);
    return success;
  },

  resetStats: (dispatch: React.Dispatch<GameAction>) => {
    const success = gameService.resetStats();
    return success;
  },

  // Experience and testing
  gainExperience: (amount: number, dispatch: React.Dispatch<GameAction>) => {
    const success = gameService.gainExperience(amount);
    return success;
  },

  // Player information
  getPlayerInfo: (dispatch: React.Dispatch<GameAction>) => {
    const success = gameService.getPlayerInfo();
    return success;
  },

  // Equipment actions
  equipItem: (itemId: string, slot: number, dispatch: React.Dispatch<GameAction>) => {
    const success = gameService.equipItem(itemId, slot);
    return success;
  },

  unequipItem: (itemId: string, slot: number, dispatch: React.Dispatch<GameAction>) => {
    const success = gameService.unequipItem(itemId, slot);
    return success;
  },

  // Spell actions
  equipSpell: (spellId: string, slot: number, dispatch: React.Dispatch<GameAction>) => {
    const success = gameService.equipSpell(spellId, slot);
    return success;
  },

  unequipSpell: (spellId: string, slot: number, dispatch: React.Dispatch<GameAction>) => {
    const success = gameService.unequipSpell(spellId, slot);
    return success;
  },

  // Movement and game actions
  movePlayer: (direction: string, dispatch: React.Dispatch<GameAction>) => {
    gameService.movePlayer(direction);
  },

  attackTarget: (targetId: string, dispatch: React.Dispatch<GameAction>) => {
    gameService.attackTarget(targetId);
  },

  castSpell: (spellId: string, targetId: string | undefined, dispatch: React.Dispatch<GameAction>) => {
    gameService.castSpell(spellId, targetId);
  },

  useItem: (itemId: string, targetId: string | undefined, dispatch: React.Dispatch<GameAction>) => {
    gameService.useItem(itemId, targetId);
  },

  // Chat and social
  sendChat: (message: string, dispatch: React.Dispatch<GameAction>) => {
    gameService.sendChat(message);
  },

  // Reconnection
  reconnect: async (dispatch: React.Dispatch<GameAction>) => {
    // Reset error state to allow a new connection attempt
    dispatch({ 
      type: 'SET_CONNECTION_STATUS', 
      payload: { connected: false, error: '' } 
    });
    
    // Set loading state (this will prevent automatic reconnection 
    // until we clear it intentionally)
    dispatch({ type: 'SET_LOADING', payload: true });
    
    try {
      await gameService.connect();
      dispatch({ type: 'SET_CONNECTION_STATUS', payload: { connected: true } });
      
      // Request player data
      
      gameService.getPlayerInfo();
      
      // Wait briefly to see if we get player data
      await new Promise(resolve => setTimeout(resolve, 500));
      
      dispatch({ type: 'SET_LOADING', payload: false });
      return true;
    } catch (error) {
      dispatch({ 
        type: 'SET_CONNECTION_STATUS', 
        payload: { connected: false, error: 'Could not reconnect to game server' } 
      });
      dispatch({ type: 'SET_LOADING', payload: false });
      return false;
    }
  }
}; 