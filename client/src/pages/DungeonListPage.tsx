import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { dungeonService, Dungeon, DungeonType } from '../services/dungeonService';
import { authService } from '../services/authService';

export const DungeonListPage: React.FC = () => {
  const { type } = useParams<{ type: string }>();
  const navigate = useNavigate();
  
  const [dungeons, setDungeons] = useState<Dungeon[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [playerName, setPlayerName] = useState('Adventurer');
  const [playerLevel, setPlayerLevel] = useState(1);

  useEffect(() => {
    // Get player data from authService
    const player = authService.getCurrentPlayer();
    if (player) {
      setPlayerLevel(player.level || 1);
      setPlayerName(player.username || 'Adventurer');
    }
  }, []);

  useEffect(() => {
    const fetchDungeons = async () => {
      if (!type) {
        setError('Invalid dungeon type');
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        // Validate that the type is a valid dungeon type
        if (!Object.values(DungeonType).includes(type as DungeonType)) {
          setError('Invalid dungeon type');
          setIsLoading(false);
          return;
        }
        
        const fetchedDungeons = await dungeonService.getDungeonsByType(type);
        setDungeons(fetchedDungeons);
        setIsLoading(false);
      } catch (err) {
        console.error('Error fetching dungeons:', err);
        setError('Failed to load dungeons. Please try again later.');
        setIsLoading(false);
      }
    };

    fetchDungeons();
  }, [type]);

  const getDungeonTypeName = (dungeonType: string): string => {
    switch (dungeonType) {
      case DungeonType.NORMAL:
        return 'Normal Quests';
      case DungeonType.ELITE:
        return 'Elite Quests';
      case DungeonType.RAID:
        return 'Raid Dungeons';
      case DungeonType.EVENT:
        return 'Event Challenges';
      default:
        return 'Dungeons';
    }
  };

  const getTypeIcon = (dungeonType: string): string => {
    switch (dungeonType) {
      case DungeonType.NORMAL:
        return 'ra-scroll-unfurled';
      case DungeonType.ELITE:
        return 'ra-fairy';
      case DungeonType.RAID:
        return 'ra-dragon-head';
      case DungeonType.EVENT:
        return 'ra-burning-meteor';
      default:
        return 'ra-dungeon-gate';
    }
  };

  const getDifficultyColor = (difficulty: string): string => {
    switch (difficulty.toLowerCase()) {
      case 'easy':
        return 'text-green-400';
      case 'medium':
        return 'text-yellow-400';
      case 'hard':
        return 'text-orange-400';
      case 'very hard':
        return 'text-red-500';
      default:
        return 'text-gray-400';
    }
  };

  const getDifficultySkullCount = (difficulty: string): number => {
    switch (difficulty.toLowerCase()) {
      case 'easy':
        return 1;
      case 'medium':
        return 2;
      case 'hard':
        return 3;
      case 'very hard':
        return 4;
      default:
        return 1;
    }
  };

  const handleStartDungeon = (dungeon: Dungeon) => {
    // Placeholder for dungeon start functionality
    
    // Navigate to dungeon detail or directly to game
    // navigate(`/game?dungeonId=${dungeon.id}`);
    
    // For now, just show an alert
    alert(`Starting dungeon: ${dungeon.name}\nThis feature is coming soon!`);
  };

  return (
    <div className="min-h-screen bg-primary flex flex-col">
      {/* Header with player info */}
      <div className="bg-brown-header border-b-3 border-ui-dark py-2 px-4">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-brown-light border-2 border-ui-dark rounded-full flex items-center justify-center">
              <i className="ra ra-player text-gold text-base"></i>
            </div>
            <div className="ml-2">
              <h3 className="font-pixel text-gold text-xs">{playerName}</h3>
              <div className="flex items-center">
                <i className="ra ra-sword text-xs text-gold mr-1"></i>
                <span className="font-pixel text-xs text-gray-300">Level {playerLevel}</span>
              </div>
            </div>
          </div>
          
          <button 
            onClick={() => navigate('/map')}
            className="bg-brown-dark hover:bg-brown-panel px-3 py-1 rounded-md border-2 border-ui-dark text-gold font-pixel text-xs transition-colors flex items-center"
          >
            <i className="ra ra-compass text-xs mr-1"></i>
            Back to Map
          </button>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 p-4 overflow-y-auto bg-emerald-800" >
        <div className="container mx-auto">
          {/* Page Header */}
      

          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="bg-brown-panel p-4 rounded-md border-3 border-ui-dark flex items-center">
                <i className="ra ra-hourglass text-base text-gold animate-pulse mr-3"></i>
                <span className="font-pixel text-gold text-xs">Loading dungeons...</span>
              </div>
            </div>
          ) : error ? (
            <div className="bg-red-900 text-white p-4 rounded-md font-pixel border-3 border-ui-dark">
              <div className="flex items-center mb-2">
                <i className="ra ra-broken-skull text-base mr-2"></i>
                <h3 className="text-xs">Error</h3>
              </div>
              <p className="text-xs">{error}</p>
            </div>
          ) : dungeons.length === 0 ? (
            <div className="bg-brown-panel rounded-md border-3 border-ui-dark p-6 text-center">
              <i className="ra ra-closed-doors text-2xl text-gold mb-3"></i>
              <h2 className="font-pixel text-gold text-base mb-2">No Dungeons Available</h2>
              <p className="font-pixel text-gray-200 text-xs">There are no dungeons of this type currently available.</p>
              <button
                onClick={() => navigate('/map')}
                className="mt-4 bg-brown-dark hover:bg-brown-light px-4 py-2 rounded-md border-2 border-ui-dark text-gold font-pixel transition-colors flex items-center mx-auto text-xs"
              >
                <i className="ra ra-compass text-xs mr-1"></i>
                Return to Map
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {dungeons.map((dungeon) => (
                <div 
                  key={dungeon.id}
                  className="bg-brown-panel rounded-md border-3 border-ui-dark overflow-hidden transform transition-all duration-200 hover:shadow-lg hover:-translate-y-1"
                >
                  <div className="bg-brown-dark p-3 border-b-3 border-ui-dark flex items-center justify-between">
                    <h2 className="font-pixel text-gold text-xs">{dungeon.name}</h2>
                    <div className={`flex ${getDifficultyColor(dungeon.difficulty)}`}>
                      {[...Array(getDifficultySkullCount(dungeon.difficulty))].map((_, i) => (
                        <i key={i} className="ra ra-skull text-xs"></i>
                      ))}
                    </div>
                  </div>
                  
                  <div className="p-4">
                    <p className="font-pixel text-xs text-gray-300 mb-4 h-12 overflow-hidden">{dungeon.description}</p>
                    
                    <div className="grid grid-cols-2 gap-3 mb-4">
                      <div className="bg-brown-dark rounded p-2 text-center">
                        <p className="font-pixel text-xs text-gray-400">Level</p>
                        <p className="font-pixel text-white text-xs flex items-center justify-center">
                          <i className="ra ra-broadsword text-xs text-gold mr-1"></i>
                          {dungeon.minLevel} - {dungeon.maxLevel}
                        </p>
                      </div>
                      <div className="bg-brown-dark rounded p-2 text-center">
                        <p className="font-pixel text-xs text-gray-400">Party</p>
                        <p className="font-pixel text-white text-xs flex items-center justify-center">
                          <i className="ra ra-knight-helmet text-xs text-gold mr-1"></i>
                          {dungeon.minPlayers} - {dungeon.maxPlayers}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="font-pixel text-xs text-gray-400 flex items-center">
                        <i className="ra ra-hourglass text-xs mr-1"></i>
                        <span>{Math.floor(dungeon.timeLimit / 60)} min</span>
                      </div>
                      <button
                        onClick={() => handleStartDungeon(dungeon)}
                        className="bg-green-700 hover:bg-green-800 px-4 py-1 rounded-md font-pixel text-white border-2 border-ui-dark transition-colors flex items-center text-xs"
                      >
                        <i className="ra ra-sword text-xs mr-1"></i>
                        Start
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="bg-brown-header border-t-3 border-ui-dark py-2 px-4">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <i className="ra ra-trophy text-gold text-xs"></i>
            <span className="font-pixel text-gray-300 text-xs">Unison Legends v0.1</span>
          </div>
          <div className="flex items-center space-x-2">
            <i className="ra ra-gem text-gold text-xs"></i>
            <span className="font-pixel text-gray-300 text-xs">Gold: 0</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DungeonListPage; 