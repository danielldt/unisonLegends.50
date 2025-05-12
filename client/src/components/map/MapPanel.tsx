import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DungeonType } from '../../services/dungeonService';

interface MapPanelProps {
  playerLevel: number;
}

const MapPanel: React.FC<MapPanelProps> = ({ playerLevel }) => {
  const navigate = useNavigate();
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);

  const handleDungeonTypeClick = (type: string) => {
    navigate(`/dungeons/${type.toLowerCase()}`);
  };

  const handleJoinRoomClick = () => {
    navigate('/join-room');
  };

  const getLocationDescription = (type: string): string => {
    switch (type) {
      case DungeonType.NORMAL:
        return "Standard adventures suitable for all heroes. Explore forests, caves, and ancient ruins.";
      case DungeonType.ELITE:
        return "These dangerous locations harbor powerful foes and valuable treasures.";
      case DungeonType.RAID:
        return "Gather your strongest allies to face these legendary challenges.";
      case DungeonType.EVENT:
        return "Limited-time special events with unique rewards and challenges.";
      case 'JOIN_ROOM':
        return "Enter a room code to join your friends on their adventures.";
      default:
        return "Explore this location to discover what awaits.";
    }
  };

  return (
    <div className="bg-brown-panel rounded-md border-3 border-ui-dark overflow-hidden">
      {/* Map Header */}
      <div className="bg-brown-dark p-3 border-b-3 border-ui-dark flex items-center justify-between">
        <div className="flex items-center">
          <div className="w-8 h-8 bg-brown-light rounded-full border-2 border-ui-dark flex items-center justify-center mr-2">
            <i className="ra ra-compass text-base text-gold"></i>
          </div>
          <h2 className="font-pixel text-gold text-base">World Map</h2>
        </div>
        <div className="font-pixel text-xs text-gray-300 flex items-center">
          <i className="ra ra-footprint text-xs mr-1"></i>
          <span>Navigation</span>
        </div>
      </div>

      {/* Map Content */}
      <div className="relative">
        {/* Description overlay */}
        {hoveredItem && (
          <div className="absolute bottom-0 left-0 right-0 bg-brown-dark bg-opacity-90 p-3 border-t-3 border-ui-dark z-10">
            <p className="font-pixel text-gray-200 text-xs leading-relaxed">
              {getLocationDescription(hoveredItem)}
            </p>
          </div>
        )}

        <div className="p-4 bg-cover bg-center bg-brown-panel">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2 md:col-span-1 flex flex-col space-y-4">
              {/* Normal Dungeons */}
              <div 
                className={`bg-brown-dark border-3 border-ui-dark rounded-md p-3 flex items-center cursor-pointer transition-all duration-200 ${
                  hoveredItem === DungeonType.NORMAL 
                    ? 'bg-brown-dark border-gold shadow-glow' 
                    : 'hover:bg-brown-dark hover:shadow'
                }`}
                onClick={() => handleDungeonTypeClick(DungeonType.NORMAL)}
                onMouseEnter={() => setHoveredItem(DungeonType.NORMAL)}
                onMouseLeave={() => setHoveredItem(null)}
              >
                <div className="w-14 h-14 bg-brown-light rounded-full border-2 border-ui-dark flex items-center justify-center relative aspect-square">
                  <i className="ra ra-scroll-unfurled text-xl text-gold"></i>
                </div>
                <div className="ml-3">
                  <h3 className="font-pixel text-gold text-xs flex items-center">
                    <span>Normal Quests</span>
                    <i className="ra ra-compass-rose text-xs ml-1"></i>
                  </h3>
                  <p className="font-pixel text-xs text-gray-300">Senarios suitable for all heroes.</p>
                  <div className="mt-1 flex items-center">
                    <span className="font-pixel text-xs text-green-400">Recommended</span>
                  </div>
                </div>
              </div>

              {/* Event Dungeons */}
              <div 
                className={`bg-brown-dark border-3 border-ui-dark rounded-md p-3 flex items-center cursor-pointer transition-all duration-200 ${
                  hoveredItem === DungeonType.EVENT 
                    ? 'bg-brown-dark border-gold shadow-glow' 
                    : 'hover:bg-brown-dark hover:shadow'
                }`}
                onClick={() => handleDungeonTypeClick(DungeonType.EVENT)}
                onMouseEnter={() => setHoveredItem(DungeonType.EVENT)}
                onMouseLeave={() => setHoveredItem(null)}
              >
                <div className="w-14 h-14 bg-red-800 rounded-full border-2 border-ui-dark flex items-center justify-center relative aspect-square">
                  <i className="ra ra-fairy text-xl text-gold pulse-animation"></i>
                  <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-600 rounded-full border border-ui-dark flex items-center justify-center animate-pulse">
                    <span className="font-pixel text-white text-xs">!</span>
                  </div>
                </div>
                <div className="ml-3">
                  <h3 className="font-pixel text-gold text-xs flex items-center">
                    <span>Event Quests</span>
                    <i className="ra ra-burning-meteor text-xs ml-1"></i>
                  </h3>
                  <p className="font-pixel text-xs text-gray-300">Special limited-time challenges</p>
                  <div className="flex items-center mt-1">
                    <i className="ra ra-hourglass text-xs text-red-400 mr-1"></i>
                    <span className="font-pixel text-xs text-red-400">Limited Time</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-span-2 md:col-span-1 flex flex-col space-y-4">
              {/* Elite Quests */}
              <div 
                className={`bg-brown-dark border-3 border-ui-dark rounded-md p-3 flex items-center cursor-pointer transition-all duration-200 ${
                  hoveredItem === DungeonType.ELITE 
                    ? 'bg-brown-dark border-gold shadow-glow' 
                    : 'hover:bg-brown-dark hover:shadow'
                }`}
                onClick={() => handleDungeonTypeClick(DungeonType.ELITE)}
                onMouseEnter={() => setHoveredItem(DungeonType.ELITE)}
                onMouseLeave={() => setHoveredItem(null)}
              >
                <div className="w-14 h-14 bg-green-800 rounded-full border-2 border-ui-dark flex items-center justify-center aspect-square">
                  <i className="ra ra-skull text-xl text-gold"></i>
                </div>
                <div className="ml-3">
                  <h3 className="font-pixel text-gold text-xs flex items-center">
                    <span>Elite Quests</span>
                    <i className="ra ra-shield text-xs ml-1"></i>
                  </h3>
                  <p className="font-pixel text-xs text-gray-300">Challenging dungeons for the skilled</p>
                  <div className="flex items-center mt-1">
                    <div className="flex">
                      <i className="ra ra-skull text-xs text-yellow-400"></i>
                      <i className="ra ra-skull text-xs text-yellow-400"></i>
                      <i className="ra ra-skull text-xs text-gray-600"></i>
                    </div>
                    <span className="font-pixel text-xs text-yellow-400 ml-1">Difficulty</span>
                  </div>
                </div>
              </div>

              {/* Raid Dungeons */}
              <div 
                className={`bg-brown-dark border-3 border-ui-dark rounded-md p-3 flex items-center cursor-pointer transition-all duration-200 ${
                  hoveredItem === DungeonType.RAID 
                    ? 'bg-brown-dark border-gold shadow-glow' 
                    : 'hover:bg-brown-dark hover:shadow'
                }`}
                onClick={() => handleDungeonTypeClick(DungeonType.RAID)}
                onMouseEnter={() => setHoveredItem(DungeonType.RAID)}
                onMouseLeave={() => setHoveredItem(null)}
              >
                <div className="w-14 h-14 bg-blue-800 rounded-full border-2 border-ui-dark flex items-center justify-center aspect-square">
                  <i className="ra ra-dragon text-xl text-gold"></i>
                </div>
                <div className="ml-3">
                  <h3 className="font-pixel text-gold text-xs flex items-center">
                    <span>Raid Dungeons</span>
                    <i className="ra ra-helmet text-xs ml-1"></i>
                  </h3>
                  <p className="font-pixel text-xs text-gray-300">Group challenges for powerful rewards</p>
                  <div className="flex items-center mt-1">
                    <div className="flex">
                      <i className="ra ra-skull text-xs text-red-500"></i>
                      <i className="ra ra-skull text-xs text-red-500"></i>
                      <i className="ra ra-skull text-xs text-red-500"></i>
                    </div>
                    <span className="font-pixel text-xs text-red-500 ml-1">Extreme</span>
                  </div>
                </div>
              </div>

              {/* Join Friends */}
              <div 
                className={`bg-brown-dark border-3 border-ui-dark rounded-md p-3 flex items-center cursor-pointer transition-all duration-200 ${
                  hoveredItem === 'JOIN_ROOM' 
                    ? 'bg-brown-dark border-gold shadow-glow' 
                    : 'hover:bg-brown-dark hover:shadow'
                }`}
                onClick={handleJoinRoomClick}
                onMouseEnter={() => setHoveredItem('JOIN_ROOM')}
                onMouseLeave={() => setHoveredItem(null)}
              >
                <div className="w-14 h-14 bg-blue-600 rounded-full border-2 border-ui-dark flex items-center justify-center aspect-square">
                  <i className="ra ra-key text-xl text-gold"></i>
                </div>
                <div className="ml-3">
                  <h3 className="font-pixel text-gold text-xs flex items-center">
                    <span>Join Room</span>
                    <i className="ra ra-door text-xs ml-1"></i>
                  </h3>
                  <p className="font-pixel text-xs text-gray-300">Enter a room code to join friends</p>
                  <div className="flex items-center mt-1">
                    <i className="ra ra-player-teleport text-xs text-blue-400 mr-1"></i>
                    <span className="font-pixel text-xs text-blue-400">Quick Join</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MapPanel; 