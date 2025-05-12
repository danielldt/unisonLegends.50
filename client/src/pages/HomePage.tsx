import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const HomePage: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Navigate to GamePage with home tab active
    navigate('/game', { state: { activeTab: 'home' } });
  }, [navigate]);

  return (
    <div className="min-h-screen bg-primary flex items-center justify-center">
      <div className="text-gold font-pixel text-xs">Loading home page...</div>
    </div>
  );
};

export default HomePage;