import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const SpellsPage: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Navigate to GamePage with spells tab active
    navigate('/game', { state: { activeTab: 'spells' } });
  }, [navigate]);

  return (
    <div className="min-h-screen bg-primary flex items-center justify-center">
      <div className="text-gold font-pixel text-xs">Loading skills data...</div>
    </div>
  );
};

export default SpellsPage; 