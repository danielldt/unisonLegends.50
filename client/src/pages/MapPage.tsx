import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import MapPanel from '../components/map/MapPanel';
import { authService } from '../services/authService';

export const MapPage: React.FC = () => {
  const [playerLevel, setPlayerLevel] = useState(1);
  const [playerName, setPlayerName] = useState('Adventurer');
  const navigate = useNavigate();

  useEffect(() => {
    // Get player data from authService
    const player = authService.getCurrentPlayer();
    if (player) {
      setPlayerLevel(player.level || 1);
      setPlayerName(player.username || 'Adventurer');
    }
  }, []);

  return (
    <div className="min-h-screen bg-primary flex flex-col">
      {/* Header with player info */}
      <div className="bg-brown-header border-b-3 border-ui-dark py-2 px-4">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-brown-light border-2 border-ui-dark rounded-full flex items-center justify-center">
              <i className="ra ra-player text-gold text-xl"></i>
            </div>
            <div className="ml-2">
              <h3 className="font-pixel text-gold text-xs">{playerName}</h3>
 
            </div>
          </div>
          
          <button 
            onClick={() => navigate('/game')}
            className="bg-brown-dark hover:bg-brown-panel px-3 py-1 rounded-md border-2 border-ui-dark text-gold font-pixel text-xs transition-colors flex items-center"
          >
            <i className="ra ra-wooden-door text-xs mr-1"></i>
            Return
          </button>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 p-4 overflow-y-auto bg-emerald-800" >
        <div className="container mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
             
              
              <MapPanel playerLevel={playerLevel} />
            </div>
            
            <div className="space-y-6">
              {/* Player stats card */}
              <div className="bg-brown-panel rounded-md border-3 border-ui-dark overflow-hidden">
                <div className="bg-brown-dark p-2 border-b-3 border-ui-dark">
                  <h2 className="font-pixel text-gold text-xs text-center">Adventure Status</h2>
                </div>
                <div className="p-3">
                  <div className="flex justify-between mb-2">
                    <span className="font-pixel text-xs text-gray-500">Quests Completed:</span>
                    <span className="font-pixel text-xs text-black">0</span>
                  </div>
                  <div className="flex justify-between mb-2">
                    <span className="font-pixel text-xs text-gray-500">Dungeons Cleared:</span>
                    <span className="font-pixel text-xs text-black">0</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-pixel text-xs text-gray-500">Raid Victories:</span>
                    <span className="font-pixel text-xs text-black">0</span>
                  </div>
                </div>
              </div>
              
              {/* Adventure log */}
              <div className="bg-brown-panel rounded-md border-3 border-ui-dark overflow-hidden">
                <div className="bg-brown-dark p-2 border-b-3 border-ui-dark flex items-center justify-between">
                  <h2 className="font-pixel text-gold text-xs">Adventure Log</h2>
                  <i className="ra ra-scroll-unfurled text-gold text-xs"></i>
                </div>
                <div className="p-3 space-y-2">
                  <div className="bg-brown-dark rounded p-2 border-2 border-ui-dark">
                    <div className="flex items-center text-xs font-pixel text-gold mb-1">
                      <i className="ra ra-sun text-xs mr-1"></i>
                      <span>Today</span>
                    </div>
                    <p className="font-pixel text-xs text-gray-200">Explore dungeons to earn rewards and experience!</p>
                  </div>
                  <div className="bg-brown-dark rounded p-2 border-2 border-ui-dark">
                    <div className="flex items-center text-xs font-pixel text-gold mb-1">
                      <i className="ra ra-moon text-xs mr-1"></i>
                      <span>Yesterday</span>
                    </div>
                    <p className="font-pixel text-xs text-gray-200">Join with friends to tackle harder challenges.</p>
                  </div>
                  <div className="bg-brown-dark rounded p-2 border-2 border-ui-dark">
                    <div className="flex items-center text-xs font-pixel text-gold mb-1">
                      <i className="ra ra-perspective-dice-six text-xs mr-1"></i>
                      <span>Tips</span>
                    </div>
                    <p className="font-pixel text-xs text-gray-200">Special events appear periodically with unique rewards.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}

    </div>
  );
};

export default MapPage; 