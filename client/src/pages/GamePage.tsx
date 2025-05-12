import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import CharacterPanel from '../components/character/CharacterPanel';
import InventoryPanel from '../components/inventory/InventoryPanel';
import SpellsPanel from '../components/spells/SpellsPanel';
import HomePanel from '../components/home/HomePanel';
import { useGameState, gameActions } from '../utils/store';
import { authService } from '../services/authService';
import { Equipment as InventoryEquipment } from '../components/inventory/InventoryPanel';
import { normalizeEquipment, normalizeActiveSpells } from '../utils/adapters/dataAdapters';

// Helper functions moved to the adapters module

const GamePage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState('home');
  const { state, dispatch } = useGameState();
  const [loadingTime, setLoadingTime] = useState(0);
  
  // Function to switch tabs that can be passed to Footer
  const switchTab = (tab: string) => {
    // If changing to character tab, request latest player details
    if (tab === 'character' && activeTab !== 'character') {
      gameActions.getPlayerInfo(dispatch);
    }
    
    // When switching to inventory or spells, log the data for debugging
    if (tab === 'inventory' && activeTab !== 'inventory') {
      
      
    }
    
    if (tab === 'spells' && activeTab !== 'spells') {
      
      
    }
    
    setActiveTab(tab);
  };

  // Track loading time
  useEffect(() => {
    let timer: NodeJS.Timeout;
    
    if (state.loading) {
      setLoadingTime(0);
      timer = setInterval(() => {
        setLoadingTime(prev => prev + 1);
      }, 1000);
    }
    
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [state.loading]);

  // Force stop loading after 20 seconds
  useEffect(() => {
    if (loadingTime >= 20 && state.loading) {
      
      dispatch({ type: 'SET_LOADING', payload: false });
      
      if (!state.player) {
        dispatch({ 
          type: 'SET_CONNECTION_STATUS', 
          payload: { 
            connected: false, 
            error: 'Loading timed out. Please refresh the page and try again.' 
          } 
        });
      }
    }
  }, [loadingTime, state.loading, state.player, dispatch]);

  useEffect(() => {
    // Check if we have an activeTab from location state (from redirects)
    if (location.state && location.state.activeTab) {
      setActiveTab(location.state.activeTab);
    }
  }, [location]);

  useEffect(() => {
    // Redirect to login if not authenticated
    if (!authService.isAuthenticated()) {
      navigate('/login');
      return;
    }
  }, [navigate]);

  // When the component mounts, request player data once
  useEffect(() => {
    if (state.connected && !state.player && !state.loading) {
      
      gameActions.getPlayerInfo(dispatch);
    }
  }, [state.connected, state.player, state.loading, dispatch]);

  // Look at inventory and skills data when rendering with player data
  useEffect(() => {
    if (state.player) {
      
      
      
      
    }
  }, [state.player, state.inventory, state.equipment, state.knownSpells, state.activeSpells]);

  // If there's a connection error, show it
  if (state.connectionError) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <div className="flex-1 flex items-center justify-center p-4 pb-16">
          <div className="panel text-center">
            <div className="text-ui-hp font-pixel mb-4">{state.connectionError}</div>
            <button 
              className="rpg-button"
              disabled={state.loading}
              onClick={() => gameActions.reconnect(dispatch)}
            >
              {state.loading ? "Connecting..." : "Try Again"}
            </button>
          </div>
        </div>
        <Footer activeTab={activeTab} onTabChange={switchTab} />
      </div>
    );
  }

  // If player data is not loaded yet, show loading
  if (!state.player || state.loading) {
    console.log("GamePage loading state:", { 
      connected: state.connected,
      connectionError: state.connectionError,
      loading: state.loading,
      hasPlayer: !!state.player,
      authStatus: authService.isAuthenticated(),
      inventory: Object.keys(state.inventory).length,
      equipment: Object.keys(state.equipment).length,
      knownSpells: Object.keys(state.knownSpells).length,
      loadingTime: loadingTime
    });
    
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <div className="flex-1 flex items-center justify-center p-4 pb-16">
          <div className="panel text-center">
            <div className="text-gold font-pixel mb-4">
              Loading game data... {loadingTime > 5 ? `(${loadingTime}s)` : ''}
            </div>
            {state.connected && (!state.player || loadingTime > 8) && (
              <div className="mt-4">
                <p className="text-xs mb-2">
                  {!state.player 
                    ? "Connected but no player data received." 
                    : "Loading is taking longer than expected."}
                </p>
                <button 
                  className="rpg-button text-sm"
                  onClick={() => {
                    
                    gameActions.getPlayerInfo(dispatch);
                  }}
                >
                  Request Data
                </button>
                {loadingTime > 12 && (
                  <button 
                    className="rpg-button text-sm ml-2"
                    onClick={() => {
                      
                      dispatch({ type: 'SET_LOADING', payload: false });
                    }}
                  >
                    Continue Anyway
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
        <Footer activeTab={activeTab} onTabChange={switchTab} />
      </div>
    );
  }

  
  

  // Create player stats object for character panel
  const playerStats = {
    username: state.player.username,
    level: state.player.level,
    hp: state.player.stats.hp,
    maxHp: state.player.stats.maxHp,
    mp: state.player.stats.mp,
    maxMp: state.player.stats.maxMp,
    exp: state.player.exp,
    maxExp: state.player.stats.maxExp,
    str: state.player.stats.str,
    agi: state.player.stats.agi,
    int: state.player.stats.int,
    dex: state.player.stats.dex,
    luk: state.player.stats.luk,
    attack: state.player.stats.attack,
    defense: state.player.stats.defense,
    critRate: state.player.stats.critRate,
    dodge: state.player.stats.dodge,
    hit: state.player.stats.hit,
    cooldownReduction: state.player.stats.cooldownReduction,
    statPoints: state.player.stats.statPoints
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 overflow-y-auto pb-16 p-4">
        <div className="max-w-lg mx-auto">
          {/* Render active panel based on tab */}
          {activeTab === 'home' && <HomePanel />}
          {activeTab === 'character' && <CharacterPanel player={playerStats} />}
          {activeTab === 'inventory' && (() => {
            const normalizedEquipment = normalizeEquipment(state.equipment);
            console.log('Sending inventory props:', { 
              inventory: state.inventory, 
              equipment: normalizedEquipment 
            });
            return (
              <InventoryPanel 
                inventory={state.inventory} 
                equipment={normalizedEquipment}
              />
            );
          })()}
          {activeTab === 'spells' && (() => {
            const normalizedActiveSpells = normalizeActiveSpells(state.activeSpells);
            console.log('Sending spells props:', { 
              knownSpells: state.knownSpells, 
              activeSpells: normalizedActiveSpells 
            });
            return (
              <SpellsPanel 
                knownSpells={state.knownSpells} 
                activeSpells={normalizedActiveSpells} 
                skillPoints={0}
              />
            );
          })()}
        </div>
      </main>
      <Footer activeTab={activeTab} onTabChange={switchTab} />
    </div>
  );
};

export default GamePage; 