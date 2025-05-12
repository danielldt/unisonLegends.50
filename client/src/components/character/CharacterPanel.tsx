import React, { useState, useEffect } from 'react';
import { useGameState, gameActions } from '../../utils/store';
import { useNotifications } from '../../utils/store';
import NotificationDisplay from '../common/NotificationDisplay';
import { gameService } from '../../services/gameService';

interface PlayerStats {
  username: string;
  level: number;
  hp: number;
  maxHp: number;
  mp: number;
  maxMp: number;
  exp: number;
  maxExp: number;
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
}

interface CharacterPanelProps {
  player: PlayerStats;
}

// Minimum value for each stat
const MIN_STAT_VALUE = 5;

const CharacterPanel: React.FC<CharacterPanelProps> = ({ player }) => {
  const [statPoints, setStatPoints] = useState(player.statPoints || 0);
  const [statValues, setStatValues] = useState({
    str: player.str,
    agi: player.agi,
    int: player.int,
    dex: player.dex,
    luk: player.luk
  });
  const [isLoading, setIsLoading] = useState({
    str: false,
    agi: false,
    int: false,
    dex: false,
    luk: false,
    reset: false
  });
  const { notifications, addNotification } = useNotifications();
  const { dispatch } = useGameState();
  
  // For demo, would normally be calculated from player stats
  const statDescriptions = {
    str: "Increases HP and physical attack power",
    agi: "Increases dodge and evasion chance",
    int: "Increases MP and cooldown reduction",
    dex: "Increases hit chance and accuracy",
    luk: "Affects critical rate, dodge, and hit chance"
  };

  const statIcons = {
    str: "ra-muscle-up",
    agi: "ra-player-dodge",
    int: "ra-aware",
    dex: "ra-targeted",
    luk: "ra-clover"
  };

  useEffect(() => {
    // Update local state when player prop changes
    setStatPoints(player.statPoints || 0);
    setStatValues({
      str: player.str,
      agi: player.agi,
      int: player.int,
      dex: player.dex,
      luk: player.luk
    });
  }, [player]);

  // Listen for server responses
  useEffect(() => {
    // Listen for stat allocation success
    const handleStatAllocated = (data: any) => {
      if (data && data.statType && data.newValue !== undefined) {
        // Update the specific stat with the new value from server
        setStatValues(prev => ({
          ...prev,
          [data.statType]: data.newValue
        }));
        
        // Update remaining stat points
        if (data.remainingPoints !== undefined) {
          setStatPoints(data.remainingPoints);
        }
        
        // Clear loading state for this stat
        setIsLoading(prev => ({
          ...prev,
          [data.statType]: false
        }));
        
        addNotification(`${data.statType.toUpperCase()} increased to ${data.newValue}`, "success");
      }
    };
    
    // Listen for stat decrease success
    const handleStatDecreased = (data: any) => {
      if (data && data.statType && data.newValue !== undefined) {
        // Update the specific stat with the new value from server
        setStatValues(prev => ({
          ...prev,
          [data.statType]: data.newValue
        }));
        
        // Update remaining stat points
        if (data.remainingPoints !== undefined) {
          setStatPoints(data.remainingPoints);
        }
        
        // Clear loading state for this stat
        setIsLoading(prev => ({
          ...prev,
          [data.statType]: false
        }));
        
        addNotification(`${data.statType.toUpperCase()} decreased to ${data.newValue}`, "success");
      }
    };
    
    // Listen for stats reset
    const handleStatsReset = (data: any) => {
      // Clear reset loading state
      setIsLoading(prev => ({
        ...prev,
        reset: false
      }));
      
      if (data && data.stats && data.remainingPoints !== undefined) {
        // Update all stats with values from server
        setStatValues({
          str: data.stats.str,
          agi: data.stats.agi,
          int: data.stats.int,
          dex: data.stats.dex,
          luk: data.stats.luk
        });
        
        // Update remaining stat points
        setStatPoints(data.remainingPoints);
        
        addNotification("Stats reset successfully", "success");
      }
    };
    
    // Listen for operation failures
    const handleStatAllocationFailed = (data: any) => {
      // Clear all loading states
      setIsLoading({
        str: false,
        agi: false,
        int: false,
        dex: false,
        luk: false,
        reset: false
      });
      
      addNotification(data.reason || "Failed to allocate stat point", "error");
    };
    
    // Register event listeners
    gameService.on('stat_point_allocated', handleStatAllocated);
    gameService.on('stat_point_decreased', handleStatDecreased);
    gameService.on('stats_reset', handleStatsReset);
    gameService.on('stat_point_allocation_failed', handleStatAllocationFailed);
    gameService.on('stat_point_decrease_failed', handleStatAllocationFailed);
    
    // Clean up event listeners on unmount
    return () => {
      gameService.off('stat_point_allocated', handleStatAllocated);
      gameService.off('stat_point_decreased', handleStatDecreased);
      gameService.off('stats_reset', handleStatsReset);
      gameService.off('stat_point_allocation_failed', handleStatAllocationFailed);
      gameService.off('stat_point_decrease_failed', handleStatAllocationFailed);
    };
  }, [addNotification]);

  // Add stat point to specified attribute
  const addStat = (statType: string) => {
    if (statPoints <= 0) {
      addNotification("No stat points available", "error");
      return;
    }
    
    // Set loading state for this stat
    setIsLoading(prev => ({
      ...prev,
      [statType]: true
    }));
    
    // Send stat allocation request to server
    const success = gameActions.allocateStatPoint(statType, dispatch);
    
    if (!success) {
      // Clear loading state if request failed to send
      setIsLoading(prev => ({
        ...prev,
        [statType]: false
      }));
      addNotification("Failed to allocate stat point. Server connection issue.", "error");
    }
  };

  // Decrease stat point from specified attribute
  const decreaseStat = (statType: string) => {
    // Check if stat is already at minimum
    if (statValues[statType as keyof typeof statValues] <= MIN_STAT_VALUE) {
      addNotification("Stat is already at minimum value", "error");
      return;
    }
    
    // Set loading state for this stat
    setIsLoading(prev => ({
      ...prev,
      [statType]: true
    }));
    
    // Send decrease stat request to server
    const success = gameActions.decreaseStatPoint(statType, dispatch);
    
    if (!success) {
      // Clear loading state if request failed to send
      setIsLoading(prev => ({
        ...prev,
        [statType]: false
      }));
      addNotification("Failed to decrease stat point. Server connection issue.", "error");
    }
  };

  // Reset all stats to default values (5)
  const resetStats = () => {
    // Set reset loading state
    setIsLoading(prev => ({
      ...prev,
      reset: true
    }));
    
    // Send reset stats request to server
    const success = gameActions.resetStats(dispatch);
    
    if (!success) {
      // Clear loading state if request failed to send
      setIsLoading(prev => ({
        ...prev,
        reset: false
      }));
      addNotification("Failed to reset stats. Server connection issue.", "error");
    }
  };

  // Add a method to request experience gain (for testing)
  const gainExperience = () => {
    // Request 500 exp (for testing)
    gameActions.gainExperience(500, dispatch);
  };

  return (
    <>
  

      {/* Character header */}
      <div className="bg-primary rounded-t-md p-2 border-3 border-ui-dark">
        <div className="flex justify-between items-center">
          <div>
            <div className="text-gold font-pixel text-xs mb-1">
              {player.username}
            </div>
            <div className="flex items-center gap-2">
              <div className="bg-brown-panel px-2 py-0.5 border-2 border-ui-dark rounded-sm">
                <span className="font-pixel text-xs">LV {player.level}</span>
              </div>
              <div className="bg-primary-light px-2 py-0.5 border-2 border-ui-dark rounded-sm">
                <span className="font-pixel text-xs">Player</span>
              </div>
            </div>
          </div>
          {/* Add test button for gaining experience */}
          <button 
            onClick={gainExperience}
            className="bg-brown-light text-center font-pixel py-0.5 px-2 rounded border-ui-dark border-2 text-xs"
          >
            Gain XP (Test)
          </button>
        </div>
      </div>

      {/* HP, MP, EXP bars */}
      <div className="bg-brown-panel border-x-3 border-ui-dark p-2 space-y-2">
        <div>
          <div className="flex justify-between text-xs mb-1">
            <span className="font-pixel">HP</span>
            <span className="font-pixel">{player.hp}/{player.maxHp}</span>
          </div>
          <div className="stat-bar">
            <div 
              className="stat-progress bg-ui-hp" 
              style={{ width: `${(player.hp / player.maxHp) * 100}%` }}
            ></div>
          </div>
        </div>
        
        <div>
          <div className="flex justify-between text-xs mb-1">
            <span className="font-pixel">MP</span>
            <span className="font-pixel">{player.mp}/{player.maxMp}</span>
          </div>
          <div className="stat-bar">
            <div 
              className="stat-progress bg-ui-mp" 
              style={{ width: `${(player.mp / player.maxMp) * 100}%` }}
            ></div>
          </div>
        </div>
        
        <div>
          <div className="flex justify-between text-xs mb-1">
            <span className="font-pixel text-gold">EXP</span>
            <span className="font-pixel">{player.exp}/{player.maxExp}</span>
          </div>
          <div className="stat-bar">
            <div 
              className="stat-progress bg-ui-exp" 
              style={{ width: `${(player.exp / player.maxExp) * 100}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Battle Stats */}
      <div className="bg-brown-panel border-x-3 border-ui-dark p-2">
        <div className="bg-brown text-center font-pixel py-1 mb-2 rounded border-ui-dark border-2 text-xs">
          Battle Stats
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div className="flex items-center border-2 border-ui-dark rounded-sm p-1">
            <div className="bg-brown-dark w-7 h-7 flex items-center justify-center rounded-sm border border-ui-dark">
              <i className="ra ra-crossed-swords"></i>
            </div>
            <div className="ml-2">
              <div className="font-pixel text-xs">Attack</div>
              <div className="font-pixel text-base">{player.attack}</div>
            </div>
          </div>
          
          <div className="flex items-center border-2 border-ui-dark rounded-sm p-1">
            <div className="bg-brown-dark w-7 h-7 flex items-center justify-center rounded-sm border border-ui-dark">
              <i className="ra ra-shield"></i>
            </div>
            <div className="ml-2">
              <div className="font-pixel text-xs">Defense</div>
              <div className="font-pixel text-base">{player.defense}</div>
            </div>
          </div>
          
          <div className="flex items-center border-2 border-ui-dark rounded-sm p-1">
            <div className="bg-brown-dark w-7 h-7 flex items-center justify-center rounded-sm border border-ui-dark">
              <i className="ra ra-lightning-bolt"></i>
            </div>
            <div className="ml-2">
              <div className="font-pixel text-xs">Crit Rate</div>
              <div className="font-pixel text-base">{player.critRate}%</div>
            </div>
          </div>
          
          <div className="flex items-center border-2 border-ui-dark rounded-sm p-1">
            <div className="bg-brown-dark w-7 h-7 flex items-center justify-center rounded-sm border border-ui-dark">
              <i className="ra ra-player-dodge"></i>
            </div>
            <div className="ml-2">
              <div className="font-pixel text-xs">Dodge</div>
              <div className="font-pixel text-base">{player.dodge}</div>
            </div>
          </div>

          <div className="flex items-center border-2 border-ui-dark rounded-sm p-1">
            <div className="bg-brown-dark w-7 h-7 flex items-center justify-center rounded-sm border border-ui-dark">
              <i className="ra ra-eye"></i>
            </div>
            <div className="ml-2">
              <div className="font-pixel text-xs">Hit</div>
              <div className="font-pixel text-base">{player.hit}</div>
            </div>
          </div>
          
          <div className="flex items-center border-2 border-ui-dark rounded-sm p-1">
            <div className="bg-brown-dark w-7 h-7 flex items-center justify-center rounded-sm border border-ui-dark">
              <i className="ra ra-clockwork"></i>
            </div>
            <div className="ml-2">
              <div className="font-pixel text-xs">CDR</div>
              <div className="font-pixel text-base">{player.cooldownReduction}%</div>
            </div>
          </div>
        </div>
      </div>

      {/* Attributes */}
      <div className="bg-brown-panel border-x-3 border-b-3 border-ui-dark p-2 rounded-b-md">
        <div className="flex justify-between items-center mb-2">
          <div className="bg-brown text-center font-pixel py-1 px-2 rounded border-ui-dark border-2 text-xs">
            Attributes
          </div>
          <div className="flex gap-2">
            <button 
              className={`bg-brown-light text-center font-pixel py-0.5 px-2 rounded border-ui-dark border-2 text-xs ${isLoading.reset ? 'opacity-50' : ''}`}
              onClick={resetStats}
              disabled={isLoading.reset}
            >
              {isLoading.reset ? 'Resetting...' : 'Reset'}
            </button>
            <div className="bg-brown-light text-center font-pixel py-0.5 px-2 rounded border-ui-dark border-2 text-xs">
              Points: {statPoints}
            </div>
          </div>
        </div>

        {/* Attribute list */}
        <div className="space-y-2">
          {['str', 'agi', 'int', 'dex', 'luk'].map((stat) => (
            <div key={stat} className="bg-brown-light border-2 border-ui-dark rounded-sm p-2">
              <div className="flex items-start justify-between">
                <div className="flex items-center">
                  <div className="bg-brown-dark w-7 h-7 flex items-center justify-center rounded-sm border border-ui-dark mr-2">
                    <i className={`ra ${statIcons[stat as keyof typeof statIcons]}`}></i>
                  </div>
                  <div className="font-pixel uppercase text-xs">{stat}</div>
                </div>
                <div className="font-pixel text-base">
                  {isLoading[stat as keyof typeof isLoading] ? 
                    <span className="text-gold animate-pulse">...</span> : 
                    statValues[stat as keyof typeof statValues]
                  }
                </div>
                <div className="flex">
                  <button 
                    className="w-5 h-5 bg-ui-dark text-gold font-bold rounded-sm mx-0.5 disabled:opacity-50"
                    onClick={() => decreaseStat(stat)}
                    disabled={statValues[stat as keyof typeof statValues] <= MIN_STAT_VALUE || isLoading[stat as keyof typeof isLoading]}
                  >
                    -
                  </button>
                  <button 
                    className="w-5 h-5 bg-ui-dark text-gold font-bold rounded-sm mx-0.5 disabled:opacity-50"
                    onClick={() => addStat(stat)}
                    disabled={statPoints <= 0 || isLoading[stat as keyof typeof isLoading]}
                  >
                    +
                  </button>
                </div>
              </div>
              <div className="text-xs mt-1">
                {statDescriptions[stat as keyof typeof statDescriptions]}
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default CharacterPanel; 