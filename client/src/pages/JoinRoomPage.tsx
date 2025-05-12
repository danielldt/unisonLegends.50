import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';

export const JoinRoomPage: React.FC = () => {
  const [roomCode, setRoomCode] = useState('');
  const [error, setError] = useState('');
  const [isJoining, setIsJoining] = useState(false);
  const [playerName, setPlayerName] = useState('Adventurer');
  const [playerLevel, setPlayerLevel] = useState(1);
  const navigate = useNavigate();

  useEffect(() => {
    // Get player data from authService
    const player = authService.getCurrentPlayer();
    if (player) {
      setPlayerLevel(player.level || 1);
      setPlayerName(player.username || 'Adventurer');
    }
  }, []);

  const handleJoinRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!roomCode.trim()) {
      setError('Please enter a room code');
      return;
    }

    setIsJoining(true);
    setError('');

    try {
      // Placeholder for room joining logic
      // This will be replaced with the actual Colyseus client code
      
      
      // Here we'd connect to the room using Colyseus
      // const room = await gameClient.joinById(roomCode);
      
      // Navigate to the game page after successfully joining
      // navigate('/game');
      
      // For now, just show a success message
      alert(`Successfully joined room: ${roomCode}`);
      setIsJoining(false);
    } catch (err) {
      console.error('Error joining room:', err);
      setError('Failed to join room. Please check the code and try again.');
      setIsJoining(false);
    }
  };

  const handleGoBack = () => {
    navigate('/map');
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
            onClick={handleGoBack}
            className="bg-brown-dark hover:bg-brown-panel px-3 py-1 rounded-md border-2 border-ui-dark text-gold font-pixel text-xs transition-colors flex items-center"
          >
            <i className="ra ra-arrow-left text-xs mr-1"></i>
            Back to Map
          </button>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 p-4 overflow-y-auto flex items-center justify-center bg-emerald-800" >
        <div className="container mx-auto max-w-md">
          <div className="bg-brown-panel rounded-md border-3 border-ui-dark overflow-hidden">
            <div className="bg-brown-dark p-3 border-b-3 border-ui-dark flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-blue-600 rounded-full border-2 border-ui-dark flex items-center justify-center mr-2">
                  <i className="ra ra-key text-gold text-base"></i>
                </div>
                <h2 className="font-pixel text-gold text-base">Join Room</h2>
              </div>
              <div className="font-pixel text-xs text-gray-300 flex items-center">
                <i className="ra ra-player-teleport text-xs mr-1"></i>
                <span>Quick Join</span>
              </div>
            </div>

            <div className="p-6">
              <div className="mb-6">
                <p className="font-pixel text-gray-500 text-xs leading-relaxed">
                  Enter a room code to join your friends' adventure. Ask your party leader for the 6-digit code.
                </p>
              </div>

              {error && (
                <div className="bg-red-900 text-white p-3 rounded-md mb-4 font-pixel text-xs border-2 border-red-700 flex items-center">
                  <i className="ra ra-cancel text-base mr-2"></i>
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleJoinRoom}>
                <div className="mb-4">
                  <label htmlFor="roomCode" className="block font-pixel text-black mb-2 flex items-center text-xs">
                    <i className="ra ra-unlock-alt text-xs mr-1"></i>
                    Room Code
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <i className="ra ra-key text-gold text-xs"></i>
                    </div>
                    <input
                      type="text"
                      id="roomCode"
                      value={roomCode}
                      onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                      className="w-full bg-brown-light border-2 border-ui-dark rounded-md py-2 pl-10 pr-3 font-pixel text-white uppercase tracking-widest text-xs"
                      placeholder="ENTER CODE"
                      maxLength={6}
                      autoComplete="off"
                    />
                  </div>
                  <p className="mt-1 font-pixel text-xs text-gray-500">
                    Enter the 6-character code provided by your party leader
                  </p>
                </div>

                <div className="flex space-x-3 mt-6">
                  <button
                    type="button"
                    onClick={handleGoBack}
                    className="flex-1 bg-red-700 hover:bg-red-800 text-white font-pixel py-2 px-4 rounded-md border-2 border-ui-dark transition-colors flex items-center justify-center text-xs"
                  >
                    <i className="ra ra-cancel text-xs mr-1"></i>
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isJoining}
                    className={`flex-1 bg-green-700 hover:bg-green-800 text-white font-pixel py-2 px-4 rounded-md border-2 border-ui-dark transition-colors flex items-center justify-center text-xs ${
                      isJoining ? 'opacity-70 cursor-not-allowed' : ''
                    }`}
                  >
                    <i className={`ra ${isJoining ? 'ra-hourglass' : 'ra-portal'} text-xs mr-1`}></i>
                    {isJoining ? 'Joining...' : 'Join Room'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>


    </div>
  );
};

export default JoinRoomPage; 