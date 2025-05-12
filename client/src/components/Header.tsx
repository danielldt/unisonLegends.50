import React from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';

const Header: React.FC = () => {
  const navigate = useNavigate();
  const player = authService.getCurrentPlayer();
  
  const handleLogout = () => {
    authService.logout();
    navigate('/login');
  };
  
  return (
    <header className="w-full flex items-center justify-between px-3 py-1 bg-brown-header text-gold shadow-md sticky top-0 z-10">
      <div className="font-pixel text-lg">Unison Legends</div>
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1 bg-ui-dark/50 px-2 py-1 rounded-sm">
          <i className="ra ra-gold-bar icon"></i>
          <span className="font-pixel text-xs">{player?.gold || 0}</span>
        </div>
        <div className="flex items-center gap-1 bg-ui-dark/50 px-2 py-1 rounded-sm">
          <i className="ra ra-diamond icon"></i>
          <span className="font-pixel text-xs">{player?.diamond || 0}</span>
        </div>
        <button 
          className="bg-gold text-ui-dark font-pixel px-2 py-1 rounded border-2 border-ui-dark"
          onClick={handleLogout}
          title="Logout"
        >
          <i className="ra ra-cancel icon"></i>
        </button>
      </div>
    </header>
  );
};

export default Header; 