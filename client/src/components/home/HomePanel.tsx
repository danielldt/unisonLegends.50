import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../../services/authService';
import { gameService } from '../../services/gameService';
import TintedItemImage from '../../components/common/TintedItemImage';
import { getRarityColor, getRarityBorder } from '../../utils/rarityConfig';

interface Announcement {
  id: string;
  title: string;
  content: string;
  date: string;
  isImportant: boolean;
}

interface ItemData {
  id: string;
  name: string;
  imageUrl?: string;
  rarity?: string;
  type?: string;
  category?: string;
  dmg?: number;
  def?: number;
  enhancementLevel?: number;
  stats?: {
    str?: number;
    int?: number;
    agi?: number;
    dex?: number;
    luk?: number;
    hp?: number;
    mp?: number;
    crit?: number;
    eva?: number;
    acc?: number;
    [key: string]: number | undefined;
  };
}

interface SpellData {
  id: string;
  name: string;
  imageUrl?: string;
  level?: number;
  type?: string;
  element?: string;
  power?: number;
  cooldown?: number;
  mpCost?: number;
  effects?: {
    damage?: number;
    healing?: number;
    buffs?: {
      str?: number;
      int?: number;
      agi?: number;
      dex?: number;
      luk?: number;
      duration?: number;
    };
    debuffs?: {
      str?: number;
      int?: number;
      agi?: number;
      dex?: number;
      luk?: number;
      duration?: number;
    };
  };
}

interface Equipment {
  weapon1: string;
  weapon2: string;
  weapon3: string;
  weapon4: string;
  weapon5: string;
  head: string;
  body: string;
  legs: string;
}

interface ActiveSpells {
  spell1: string;
  spell2: string;
  spell3: string;
  spell4: string;
  spell5: string;
}

const DEFAULT_EXP = 0;
const DEFAULT_MAX_EXP = 1000;

const HomePanel: React.FC = () => {
  const navigate = useNavigate();
  const [playerData, setPlayerData] = useState<any>(null);
  const [equipment, setEquipment] = useState<Equipment>({
    weapon1: '', weapon2: '', weapon3: '', weapon4: '', weapon5: '',
    head: '', body: '', legs: ''
  });
  const [activeSpells, setActiveSpells] = useState<ActiveSpells>({
    spell1: '', spell2: '', spell3: '', spell4: '', spell5: ''
  });
  const [inventory, setInventory] = useState<ItemData[]>([]);
  const [knownSpells, setKnownSpells] = useState<SpellData[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // State for detail dialogs
  const [selectedItem, setSelectedItem] = useState<ItemData | null>(null);
  const [selectedSpell, setSelectedSpell] = useState<SpellData | null>(null);

  useEffect(() => {
    // Get player data from localStorage as a fallback
    const player = authService.getCurrentPlayer();
    if (player) {
      // Initialize with basic player data
      setPlayerData({
        ...player,
        exp: player.exp || DEFAULT_EXP,
        stats: {
          maxExp: DEFAULT_MAX_EXP,
          hp: 100,
          maxHp: 100,
          mp: 50,
          maxMp: 50,
          ...player.stats
        }
      });
      
      // Set loading to false after basic data is loaded
      setTimeout(() => {
        setIsLoading(false);
      }, 500);
    }

    // Request detailed player info from game service
    try {
      gameService.getPlayerInfo();
    } catch (err) {
      console.error("Failed to request player info from game service:", err);
    }

    // Listen for player details from game service
    const handlePlayerDetails = (data: any) => {
      
      
      // Update player data
      setPlayerData((prevData: any) => ({
        ...prevData,
        ...data,
        stats: {
          ...(prevData?.stats || {}),
          ...(data.stats || {})
        }
      }));

      // Update equipment if available
      if (data.equipment) {
        
        // Check if any equipment slots are non-empty
        const hasEquipment = Object.values(data.equipment).some(val => val !== "");
        if (hasEquipment) {
          
          Object.entries(data.equipment).forEach(([slot, itemId]) => {
            if (itemId) {
              
            }
          });
        } else {
          
        }
        
        // Create a new equipment object to ensure reactivity
        const equipmentObj = { ...data.equipment };
        
        setEquipment(equipmentObj);
      } else {
        // Extract equipment from legacy player object structure
        
        const equipmentObj: Equipment = {
          weapon1: data.weapon1 || '',
          weapon2: data.weapon2 || '',
          weapon3: data.weapon3 || '',
          weapon4: data.weapon4 || '',
          weapon5: data.weapon5 || '',
          head: data.head || '',
          body: data.body || '',
          legs: data.legs || ''
        };
        
        setEquipment(equipmentObj);
      }

      // Update active spells if available
      if (data.activeSpells) {
        setActiveSpells(data.activeSpells);
      } else {
        // Extract spells from legacy player object structure
        const spellsObj: ActiveSpells = {
          spell1: data.spell1 || '',
          spell2: data.spell2 || '',
          spell3: data.spell3 || '',
          spell4: data.spell4 || '',
          spell5: data.spell5 || ''
        };
        setActiveSpells(spellsObj);
      }

      // Set inventory and known spells if available
      if (data.inventory) {
        
        
        // Check if the inventory contains the items referenced in equipment
        if (data.equipment) {
          // Get list of all equipped item IDs
          const equippedIds = Object.values(data.equipment).filter(Boolean);
          if (equippedIds.length > 0) {
            
            
            // Verify each equipped ID exists in inventory
            const missingIds = equippedIds.filter(id => 
              !Object.values(data.inventory).some((item: any) => item.id === id)
            );
            
            if (missingIds.length > 0) {
              console.warn('Missing equipped items in inventory:', missingIds);
            } else {
              
            }
          }
        }
        
        setInventory(data.inventory);
      }
      if (data.knownSpells) setKnownSpells(data.knownSpells);

      setIsLoading(false);
    };

    // Listen for equipment updates
    const handleEquipmentUpdated = (data: any) => {
      
      
      // If we have full equipment data, use that
      if (data.equipment) {
        
        setEquipment(data.equipment);
        return;
      }
      
      // If we have slot and itemId, update just that slot
      if (data.slot !== undefined && data.itemId !== undefined) {
        
        setEquipment(prev => {
          const updated = { ...prev };
          
          // Update the appropriate slot
          switch (data.slot) {
            case 0: updated.weapon1 = data.itemId; break;
            case 1: updated.weapon2 = data.itemId; break;
            case 2: updated.weapon3 = data.itemId; break;
            case 3: updated.weapon4 = data.itemId; break;
            case 4: updated.weapon5 = data.itemId; break;
            case 5: updated.head = data.itemId; break;
            case 6: updated.body = data.itemId; break;
            case 7: updated.legs = data.itemId; break;
          }
          
          return updated;
        });
      }
    };

    gameService.on('player_details', handlePlayerDetails);
    gameService.on('equipment_updated', handleEquipmentUpdated);

    // Add a timeout to ensure we don't get stuck on loading
    const loadingTimeout = setTimeout(() => {
      if (isLoading) {
        setIsLoading(false);
      }
    }, 3000);

    // Cleanup
    return () => {
      gameService.off('player_details', handlePlayerDetails);
      gameService.off('equipment_updated', handleEquipmentUpdated);
      clearTimeout(loadingTimeout);
    };
  }, []);

  if (isLoading && !playerData) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-gold font-pixel text-xs">Loading game data...</div>
      </div>
    );
  }

  // Default player data if still not available
  if (!playerData) {
    const defaultPlayer = {
      username: "Adventurer",
      level: 1,
      exp: 0,
      stats: { maxExp: 1000 }
    };
    setPlayerData(defaultPlayer);
  }

  // Calculate the percentage of experience
  const expPercentage = Math.min(
    100,
    Math.floor(((playerData?.exp || 0) / (playerData?.stats?.maxExp || DEFAULT_MAX_EXP)) * 100)
  );

  // Navigation handlers
  const navigateToMap = () => navigate('/map');
  const navigateToBlacksmith = () => navigate('/blacksmith'); // Will need to be implemented
  const navigateToShop = () => navigate('/shop'); // Will need to be implemented
  const navigateToAnnouncements = () => navigate('/announcements'); // Will need to be implemented

  // Get equipped weapons from the equipment object
  const equipmentSlots: (ItemData | null)[] = Array(5).fill(null);
  
  // Find weapons in inventory based on equipment IDs
  if (inventory.length > 0) {
    if (equipment.weapon1) equipmentSlots[0] = inventory.find(item => item.id === equipment.weapon1) || null;
    if (equipment.weapon2) equipmentSlots[1] = inventory.find(item => item.id === equipment.weapon2) || null;
    if (equipment.weapon3) equipmentSlots[2] = inventory.find(item => item.id === equipment.weapon3) || null;
    if (equipment.weapon4) equipmentSlots[3] = inventory.find(item => item.id === equipment.weapon4) || null;
    if (equipment.weapon5) equipmentSlots[4] = inventory.find(item => item.id === equipment.weapon5) || null;
  }

  // Get spell slots from the activeSpells object
  const spellSlots: (SpellData | null)[] = Array(5).fill(null);
  
  // Find spells based on activeSpells IDs
  if (knownSpells.length > 0) {
    if (activeSpells.spell1) spellSlots[0] = knownSpells.find(spell => spell.id === activeSpells.spell1) || null;
    if (activeSpells.spell2) spellSlots[1] = knownSpells.find(spell => spell.id === activeSpells.spell2) || null;
    if (activeSpells.spell3) spellSlots[2] = knownSpells.find(spell => spell.id === activeSpells.spell3) || null;
    if (activeSpells.spell4) spellSlots[3] = knownSpells.find(spell => spell.id === activeSpells.spell4) || null;
    if (activeSpells.spell5) spellSlots[4] = knownSpells.find(spell => spell.id === activeSpells.spell5) || null;
  }
  
  // Helper function to get appropriate icon based on spell element
  const getSpellIcon = (element?: string): string => {
    if (!element) return 'fire-symbol';
    
    switch (element.toLowerCase()) {
      case 'flame': return 'fire-symbol';
      case 'aqua': return 'water-drop';
      case 'gale': return 'wind-symbol';
      case 'terra': return 'rock';
      case 'ether': return 'fairy-wand';
      default: return 'fire-symbol';
    }
  };
  
  // Helper function to format spell effects for display
  const formatSpellEffects = (effects: any): string => {
    if (!effects) return 'No effects';
    
    const parts: string[] = [];
    
    if (effects.damage) {
      parts.push(`Damage: ${effects.damage}`);
    }
    
    if (effects.healing) {
      parts.push(`Healing: ${effects.healing}`);
    }
    
    if (effects.buffs) {
      const buffParts: string[] = [];
      for (const [stat, value] of Object.entries(effects.buffs)) {
        if (stat !== 'duration' && value) {
          buffParts.push(`${stat.toUpperCase()}: +${value}`);
        }
      }
      if (buffParts.length > 0) {
        const duration = effects.buffs.duration ? ` (${effects.buffs.duration}s)` : '';
        parts.push(`Buffs${duration}: ${buffParts.join(', ')}`);
      }
    }
    
    if (effects.debuffs) {
      const debuffParts: string[] = [];
      for (const [stat, value] of Object.entries(effects.debuffs)) {
        if (stat !== 'duration' && value) {
          debuffParts.push(`${stat.toUpperCase()}: ${value}`);
        }
      }
      if (debuffParts.length > 0) {
        const duration = effects.debuffs.duration ? ` (${effects.debuffs.duration}s)` : '';
        parts.push(`Debuffs${duration}: ${debuffParts.join(', ')}`);
      }
    }
    
    return parts.join('\n');
  };

  // Close modals handler
  const closeModals = () => {
    setSelectedItem(null);
    setSelectedSpell(null);
  };

  return (
    <div className="flex-1 p-4 overflow-y-auto">
      <div className="container mx-auto max-w-lg space-y-4">
        {/* Player Stats Card */}
        <div className="bg-brown-panel rounded-md border-3 border-ui-dark overflow-hidden">
          <div className="bg-brown-dark p-2 border-b-3 border-ui-dark">
            <h2 className="font-pixel text-gold text-xs text-center">{playerData?.username || "Adventurer"}'s Status</h2>
          </div>
          <div className="p-3">
            <div className="flex items-center justify-between mb-2">
              <div className="font-pixel text-xs text-gray-500">Level {playerData?.level || 1}</div>
              <div className="font-pixel text-xs text-gray-500">{playerData?.exp || 0} / {playerData?.stats?.maxExp || DEFAULT_MAX_EXP} EXP</div>
            </div>
            
            {/* EXP Bar */}
            <div className="w-full bg-brown-light rounded-full h-2 mb-3 border border-ui-dark">
              <div 
                className="bg-ui-exp h-full rounded-full" 
                style={{ width: `${expPercentage}%` }}
              ></div>
            </div>
            
            {/* Equipment Slots - single row of 5 */}
            <div className="mb-3">
              <h3 className="font-pixel text-xs text-gray-500 mb-1">Weapons</h3>
              <div className="grid grid-cols-5 gap-1">
                {equipmentSlots.map((item, index) => (
                  <div 
                    key={`equipment-${index}`}
                    className={`bg-brown-dark rounded p-1 flex items-center justify-center border-2 ${item ? getRarityBorder(item.rarity) : 'border-ui-dark'} h-14 aspect-square m-auto cursor-pointer`}
                    onClick={() => item && setSelectedItem(item)}
                  >
                    {item ? (
                      <TintedItemImage 
                        src={item.imageUrl || '/images/items/default_weapon.svg'} 
                        alt={item.name}
                        rarity={item.rarity}
                      />
                    ) : (
                      <i className="ra ra-slash-ring text-xs text-gray-600"></i>
                    )}
                  </div>
                ))}
              </div>
            </div>
            
            {/* Spell Slots - single row of 5 */}
            <div>
              <h3 className="font-pixel text-xs text-gray-500 mb-1">Spells</h3>
              <div className="grid grid-cols-5 gap-1">
                {spellSlots.map((spell, index) => (
                  <div 
                    key={`spell-${index}`}
                    className="bg-brown-dark rounded p-1 flex items-center justify-center border-2 border-ui-dark h-14 aspect-square m-auto cursor-pointer"
                    onClick={() => spell && setSelectedSpell(spell)}
                  >
                    {spell ? (
                      <img 
                        src={spell.imageUrl || '/images/spells/default_spell.svg'} 
                        alt={spell.name}
                        className="max-w-full max-h-full object-contain"
                      />
                    ) : (
                      <i className="ra ra-fire-symbol text-xs text-gray-600"></i>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
        
        {/* Announcements Card - No mock data */}
        <div className="bg-brown-panel rounded-md border-3 border-ui-dark overflow-hidden">
          <div className="bg-brown-dark p-2 border-b-3 border-ui-dark flex items-center justify-between">
            <h2 className="font-pixel text-gold text-xs">Announcements</h2>
            <i className="ra ra-scroll-unfurled text-gold text-xs"></i>
          </div>
          <div className="p-3">
            {announcements.length > 0 ? (
              <div className="space-y-2">
                {announcements.slice(0, 3).map((announcement) => (
                  <div key={announcement.id} className="bg-brown-dark rounded p-2 border-2 border-ui-dark">
                    <div className="flex items-center justify-between text-xs font-pixel mb-1">
                      <div className="flex items-center">
                        {announcement.isImportant && (
                          <i className="ra ra-burning-meteor text-red-500 text-xs mr-1"></i>
                        )}
                        <span className={announcement.isImportant ? 'text-red-400' : 'text-gold'}>
                          {announcement.title}
                        </span>
                      </div>
                      <span className="text-gray-400">{announcement.date}</span>
                    </div>
                    <p className="font-pixel text-xs text-gray-300 line-clamp-1">
                      {announcement.content}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-4">
                <i className="ra ra-scroll text-gold text-lg mb-2"></i>
                <p className="font-pixel text-xs text-gray-300">No announcements yet</p>
              </div>
            )}
            
            <button
              onClick={navigateToAnnouncements}
              className="mt-3 w-full bg-brown-dark hover:bg-brown-light px-2 py-1 rounded-md border-2 border-ui-dark text-gold font-pixel text-xs transition-colors flex items-center justify-center"
            >
              <i className="ra ra-scroll text-xs mr-1"></i>
              View All Announcements
            </button>
          </div>
        </div>
        
        {/* Navigation Buttons */}
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={navigateToMap}
            className="bg-green-700 hover:bg-green-800 h-16 rounded-md border-3 border-ui-dark font-pixel text-white text-xs transition-colors flex flex-col items-center justify-center"
          >
            <i className="ra ra-compass text-lg mb-1"></i>
            <span className="text-xs">Map</span>
          </button>
          
          <button
            onClick={navigateToShop}
            className="bg-blue-700 hover:bg-blue-800 h-16 rounded-md border-3 border-ui-dark font-pixel text-white text-xs transition-colors flex flex-col items-center justify-center"
          >
            <i className="ra ra-gem text-lg mb-1"></i>
            <span className="text-xs">Shop</span>
          </button>
          
          <button
            onClick={navigateToBlacksmith}
            className="bg-amber-700 hover:bg-amber-800 h-16 rounded-md border-3 border-ui-dark font-pixel text-white text-xs transition-colors flex flex-col items-center justify-center"
          >
            <i className="ra ra-anvil text-lg mb-1"></i>
            <span className="text-xs">Workbench</span>
          </button>
          
          <button
            onClick={navigateToBlacksmith}
            className="bg-yellow-700 hover:bg-yellow-800 h-16 rounded-md border-3 border-ui-dark font-pixel text-white text-xs transition-colors flex flex-col items-center justify-center"
          >
            <i className="ra ra-book text-lg mb-1"></i>
            <span className="text-xs">Enchantment</span>
          </button>
        </div>
      </div>
      
      {/* Item detail modal */}
      {selectedItem && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={closeModals}
        >
          <div 
            className="bg-gray-800 rounded-md p-4 max-w-md w-full border-2 border-ui-dark"
            onClick={(e) => e.stopPropagation()} 
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className={`font-pixel text-xl ${getRarityColor(selectedItem.rarity)}`}>
                {selectedItem.name}
              </h3>
              <button 
                type="button"
                onClick={closeModals}
                className="text-white font-bold text-xl focus:outline-none"
              >
                ×
              </button>
            </div>
            
            <div className="mb-4 flex justify-center">
              <div className={`w-16 h-16 bg-brown-dark flex items-center justify-center rounded border ${getRarityBorder(selectedItem.rarity)}`}>
                {selectedItem.imageUrl ? (
                  <TintedItemImage 
                    src={selectedItem.imageUrl} 
                    alt={selectedItem.name}
                    rarity={selectedItem.rarity}
                  />
                ) : (
                  <i className={`ra ra-${selectedItem.category === 'weapon' ? 'sword' : 
                    selectedItem.category === 'head' ? 'helmet' : 
                    selectedItem.category === 'body' ? 'vest' : 
                    selectedItem.category === 'legs' ? 'boot-stomp' : 'scroll-unfurled'} text-3xl ${getRarityColor(selectedItem.rarity)}`}></i>
                )}
              </div>
            </div>
            
            <div className="text-center mb-2 font-pixel text-sm">
              <span className="text-gray-300">{selectedItem.type} • {selectedItem.category} • </span>
              <span className={getRarityColor(selectedItem.rarity)}>{selectedItem.rarity}</span>
            </div>
            
            {/* Display item stats */}
            <div className="grid grid-cols-2 gap-2 mb-4">
              {/* Show damage if available */}
              {selectedItem.dmg !== undefined && selectedItem.dmg > 0 && (
                <div className="p-2 rounded bg-red-900 flex items-center">
                  <i className="ra ra-sword text-gold mr-2"></i>
                  <div className="flex-grow">
                    <div className="font-pixel text-gold text-xs">Damage:</div>
                    <div className="font-pixel text-white text-lg">+{selectedItem.dmg}</div>
                  </div>
                </div>
              )}
              
              {/* Show defense if available */}
              {selectedItem.def !== undefined && selectedItem.def > 0 && (
                <div className="p-2 rounded bg-blue-900 flex items-center">
                  <i className="ra ra-shield text-gold mr-2"></i>
                  <div className="flex-grow">
                    <div className="font-pixel text-gold text-xs">Defense:</div>
                    <div className="font-pixel text-white text-lg">+{selectedItem.def}</div>
                  </div>
                </div>
              )}
              
              {/* Show stats from the stats object */}
              {selectedItem.stats && Object.entries(selectedItem.stats).map(([key, value]) => {
                // Skip if the value is undefined or 0
                if (value === undefined || value === 0) return null;
                
                // Determine appropriate background and icon for each stat type
                let bgColor = "";
                let icon = "";
                let statLabel = key.charAt(0).toUpperCase() + key.slice(1);
                
                switch(key.toLowerCase()) {
                  case 'damage':
                  case 'dmg':
                  case 'attack':
                    bgColor = "bg-red-900";
                    icon = "ra-sword";
                    statLabel = "Damage";
                    break;
                  case 'defense':
                  case 'def':
                    bgColor = "bg-blue-900";
                    icon = "ra-shield";
                    statLabel = "Defense";
                    break;
                  case 'hp':
                  case 'health':
                    bgColor = "bg-green-900";
                    icon = "ra-health";
                    statLabel = "Health";
                    break;
                  case 'mp':
                  case 'mana':
                    bgColor = "bg-indigo-900";
                    icon = "ra-crystals";
                    statLabel = "Mana";
                    break;
                  case 'str':
                  case 'strength':
                    bgColor = "bg-red-800";
                    icon = "ra-muscle-up";
                    statLabel = "Strength";
                    break;
                  case 'dex':
                  case 'dexterity':
                    bgColor = "bg-yellow-800";
                    icon = "ra-feather-wing";
                    statLabel = "Dexterity";
                    break;
                  case 'int':
                  case 'intelligence':
                    bgColor = "bg-blue-800";
                    icon = "ra-brain";
                    statLabel = "Intelligence";
                    break;
                  case 'agi':
                  case 'agility':
                    bgColor = "bg-green-800";
                    icon = "ra-running-ninja";
                    statLabel = "Agility";
                    break;
                  case 'luk':
                  case 'luck':
                    bgColor = "bg-purple-800";
                    icon = "ra-diamond";
                    statLabel = "Luck";
                    break;
                  case 'crit':
                  case 'critical':
                    bgColor = "bg-red-700";
                    icon = "ra-crossed-swords";
                    statLabel = "Critical";
                    break;
                  case 'eva':
                  case 'evasion':
                    bgColor = "bg-green-700";
                    icon = "ra-player-dodge";
                    statLabel = "Evasion";
                    break;
                  case 'acc':
                  case 'accuracy':
                    bgColor = "bg-yellow-700";
                    icon = "ra-eye";
                    statLabel = "Accuracy";
                    break;
                  default:
                    bgColor = "bg-gray-700";
                    icon = "ra-crossed-swords";
                }
                
                return (
                  <div key={key} className={`p-2 rounded ${bgColor} flex items-center`}>
                    <i className={`ra ${icon} text-gold mr-2`}></i>
                    <div className="flex-grow">
                      <div className="font-pixel text-gold text-xs">{statLabel}:</div>
                      <div className="font-pixel text-white text-lg">+{value}</div>
                    </div>
                  </div>
                );
              })}
              
              {/* Show "No stats" message if there are no stats */}
              {(!selectedItem.stats || Object.keys(selectedItem.stats).filter(key => {
                  const value = selectedItem.stats![key];
                  return value !== undefined && value !== 0;
                }).length === 0) && 
               selectedItem.dmg === undefined && selectedItem.def === undefined && (
                <div className="col-span-2 text-center py-2 text-gray-400 font-pixel">
                  No stats available
                </div>
              )}
            </div>
            
            <div className="flex justify-center">
              <button 
                type="button"
                onClick={closeModals}
                className="bg-brown font-pixel py-2 px-4 rounded border-ui-dark border hover:bg-brown-dark focus:outline-none"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Spell detail modal */}
      {selectedSpell && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={closeModals}
        >
          <div 
            className="bg-gray-800 rounded-md p-4 max-w-md w-full border-2 border-ui-dark"
            onClick={(e) => e.stopPropagation()} 
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-gold font-pixel text-xl">{selectedSpell.name}</h3>
              <button 
                type="button"
                onClick={closeModals}
                className="text-white font-bold text-xl focus:outline-none"
              >
                ×
              </button>
            </div>
            
            <div className="mb-4 flex justify-center">
              <div className="w-16 h-16 bg-brown-dark flex items-center justify-center rounded border border-ui-dark">
                {selectedSpell.imageUrl ? (
                  <img 
                    src={selectedSpell.imageUrl} 
                    alt={selectedSpell.name}
                    className="max-w-full max-h-full object-contain"
                  />
                ) : (
                  <i className={`ra ra-${getSpellIcon(selectedSpell.element)} text-3xl text-gold`}></i>
                )}
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-2 mb-4">
              {selectedSpell.power !== undefined && (
                <div className="p-2 rounded bg-gray-700">
                  <div className="font-pixel text-gold">Power:</div>
                  <div className="font-pixel text-white text-xl">{selectedSpell.power}</div>
                </div>
              )}
              
              {selectedSpell.mpCost !== undefined && (
                <div className="p-2 rounded bg-brown">
                  <div className="font-pixel text-gold">MP Cost:</div>
                  <div className="font-pixel text-white text-xl">{selectedSpell.mpCost}</div>
                </div>
              )}
              
              {selectedSpell.element && (
                <div className="p-2 rounded bg-brown col-span-2">
                  <div className="font-pixel text-gold">Element:</div>
                  <div className="font-pixel text-white">{selectedSpell.element}</div>
                </div>
              )}
              
              {selectedSpell.cooldown !== undefined && (
                <div className="p-2 rounded bg-brown col-span-2">
                  <div className="font-pixel text-gold">Cooldown:</div>
                  <div className="font-pixel text-white">{selectedSpell.cooldown}s</div>
                </div>
              )}
              
              {selectedSpell.effects && (
                <div className="p-2 rounded bg-brown col-span-2">
                  <div className="font-pixel text-gold">Effects:</div>
                  <div className="font-pixel text-white whitespace-pre-line">
                    {formatSpellEffects(selectedSpell.effects)}
                  </div>
                </div>
              )}
            </div>
            
            <div className="flex justify-center">
              <button 
                type="button"
                onClick={closeModals}
                className="bg-brown font-pixel py-2 px-4 rounded border-ui-dark border hover:bg-brown-dark focus:outline-none"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HomePanel; 