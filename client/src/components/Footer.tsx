import React from 'react';
import { useNavigate } from 'react-router-dom';

type Tab = 'home' | 'character' | 'inventory' | 'spells' | 'social';

interface FooterProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const Footer: React.FC<FooterProps> = ({ activeTab, onTabChange }) => {
  const navigate = useNavigate();
  
  const tabs = [
    { id: 'home', label: 'Home', icon: 'ra-capitol' },
    { id: 'character', label: 'Character', icon: 'ra-player' },
    { id: 'inventory', label: 'Inventory', icon: 'ra-croc-sword' },
    { id: 'spells', label: 'Skills', icon: 'ra-fairy-wand' },
    { id: 'social', label: 'Social', icon: 'ra-gem' }
  ];

  const handleTabClick = (tabId: string) => {
    // Use the normal tab change for all tabs
    onTabChange(tabId);
  };

  return (
    <footer className="w-full flex justify-evenly items-center px-1 py-1 bg-brown-header border-t-3 border-ui-dark fixed bottom-0 left-0">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          className={`flex flex-col items-center justify-center py-1 px-3 w-1/5 ${
            activeTab === tab.id 
              ? 'bg-gold text-ui-dark rounded border-2 border-ui-dark' 
              : 'text-gold'
          }`}
          onClick={() => handleTabClick(tab.id)}
        >
          <i className={`ra ${tab.icon} text-base mb-1`}></i>
          <span className="font-pixel text-xs" style={{ fontSize: '7px' }}>
            {tab.label}
          </span>
        </button>
      ))}
    </footer>
  );
};

export default Footer; 