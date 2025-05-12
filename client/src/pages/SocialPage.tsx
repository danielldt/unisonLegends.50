import React from 'react';
import { useNavigate } from 'react-router-dom';

const SocialPage: React.FC = () => {
  const navigate = useNavigate();

  // For future social features
  const goBack = () => {
    navigate('/home');
  };

  return (
    <div className="min-h-screen bg-primary flex flex-col">
      {/* Header */}
      <div className="bg-brown-header border-b-3 border-ui-dark py-2 px-4">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="font-pixel text-gold text-xs">Social</h1>
          <button 
            onClick={goBack}
            className="bg-brown-dark hover:bg-brown-panel px-3 py-1 rounded-md border-2 border-ui-dark text-gold font-pixel text-xs transition-colors flex items-center"
          >
            <i className="ra ra-home text-xs mr-1"></i>
            Back to Home
          </button>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 p-4 overflow-y-auto bg-emerald-800 flex items-center justify-center">
        <div className="bg-brown-panel rounded-md border-3 border-ui-dark p-6 max-w-md text-center">
          <i className="ra ra-player-teleport text-gold text-2xl mb-4"></i>
          <h2 className="font-pixel text-gold text-base mb-2">Social Features Coming Soon</h2>
          <p className="font-pixel text-xs text-gray-300 mb-4">
            Connect with friends, form parties, and chat with other players.
          </p>
          <button
            onClick={goBack}
            className="bg-brown-dark hover:bg-brown-light px-4 py-2 rounded-md border-2 border-ui-dark text-gold font-pixel text-xs transition-colors mx-auto"
          >
            Return to Home
          </button>
        </div>
      </div>

      {/* Footer */}
      <div className="w-full flex justify-between items-center px-1 py-0.5 bg-brown-header border-t-3 border-ui-dark fixed bottom-0 left-0">
        <button className="flex flex-col items-center justify-center py-0.5 px-1 text-gold" onClick={() => navigate('/home')}>
          <i className="ra ra-home text-xs mb-0.5"></i>
          <span className="font-pixel text-xs" style={{ fontSize: '6px' }}>Home</span>
        </button>
        
        <button className="flex flex-col items-center justify-center py-0.5 px-1 text-gold" onClick={() => navigate('/character')}>
          <i className="ra ra-player text-xs mb-0.5"></i>
          <span className="font-pixel text-xs" style={{ fontSize: '6px' }}>Character</span>
        </button>
        
        <button className="flex flex-col items-center justify-center py-0.5 px-1 text-gold" onClick={() => navigate('/inventory')}>
          <i className="ra ra-croc-sword text-xs mb-0.5"></i>
          <span className="font-pixel text-xs" style={{ fontSize: '6px' }}>Inventory</span>
        </button>
        
        <button className="flex flex-col items-center justify-center py-0.5 px-1 text-gold" onClick={() => navigate('/spells')}>
          <i className="ra ra-fairy-wand text-xs mb-0.5"></i>
          <span className="font-pixel text-xs" style={{ fontSize: '6px' }}>Skills</span>
        </button>
        
        <button className="flex flex-col items-center justify-center py-0.5 px-1 bg-gold text-ui-dark rounded border-2 border-ui-dark">
          <i className="ra ra-gem text-xs mb-0.5"></i>
          <span className="font-pixel text-xs" style={{ fontSize: '6px' }}>Social</span>
        </button>
      </div>
    </div>
  );
};

export default SocialPage; 