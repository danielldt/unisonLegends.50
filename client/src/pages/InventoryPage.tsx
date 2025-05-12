import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const InventoryPage: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Navigate to GamePage with inventory tab active
    navigate('/game', { state: { activeTab: 'inventory' } });
  }, [navigate]);

  return (
    <div className="min-h-screen bg-primary flex items-center justify-center">
      <div className="text-gold font-pixel text-xs">Loading inventory data...</div>
    </div>
  );
};

export default InventoryPage; 