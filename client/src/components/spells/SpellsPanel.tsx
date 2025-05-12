import React, { useState, useEffect } from 'react';
import { gameService } from '../../services/gameService';
import { useNotifications, Spell as StateSpell, KnownSpells, ActiveSpells } from '../../utils/store';
import NotificationDisplay from '../common/NotificationDisplay';

// Component's internal spell type with all the needed properties
interface ComponentSpell extends StateSpell {
  type: string;
  element: string;
  power: number;
  mpCost: number;
  effects: {
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
  imageUrl?: string;
  isEquipped?: boolean;
}

interface SpellsPanelProps {
  knownSpells: KnownSpells;
  activeSpells: ActiveSpells;
  skillPoints: number;
}

// Helper function to normalize spell data
const normalizeSpellData = (rawSpells: any): ComponentSpell[] => {
  
  
  if (!rawSpells || typeof rawSpells !== 'object') {
    console.warn('Invalid spell data:', rawSpells);
    return [];
  }
  
  // Log the keys and types of values in rawSpells
  
  console.log('Spells data values sample:', 
    Object.values(rawSpells).slice(0, 2).map(val => 
      typeof val === 'object' ? { type: typeof val, hasId: val && 'id' in val } : typeof val
    )
  );
  
  return Object.entries(rawSpells).map(([id, rawSpell]) => {
    // Skip if spell is null or undefined
    if (!rawSpell) {
      console.warn('Null/undefined spell with ID:', id);
      return null;
    }
    
    // Cast to any to avoid property access errors
    const spell = rawSpell as any;
    
    // Log the spell's ID and name to help debug
    
    
    // Ensure all required fields have values
    const normalizedSpell: ComponentSpell = {
      id: spell.id || id,
      name: spell.name || 'Unknown Spell',
      description: spell.description || 'No description available',
      manaCost: spell.manaCost || spell.mpCost || 0,
      level: spell.level || 1,
      cooldown: spell.cooldown || 0,
      type: spell.type || 'attack',
      element: spell.element || 'flame',
      power: spell.power || 0,
      mpCost: spell.mpCost || spell.manaCost || 0,
      effects: spell.effects || {
        damage: 0,
        healing: 0
      },
      isEquipped: false
    };
    
    // Add optional fields if they exist
    if (spell.imageUrl) normalizedSpell.imageUrl = spell.imageUrl;
    
    return normalizedSpell;
  }).filter(Boolean) as ComponentSpell[]; // Filter out null values
};

// Helper function to convert active spells object to array format
const normalizeActiveSpells = (activeSpells: ActiveSpells): ComponentSpell[] => {
  
  if (!activeSpells || typeof activeSpells !== 'object') {
    return [];
  }
  
  // Log the keys and types of values in activeSpells
  
  console.log('Active spells values sample:',
    Object.entries(activeSpells).slice(0, 2).map(([slot, val]) => ({
      slot,
      type: typeof val,
      value: typeof val === 'string' ? val : val && 'id' in val ? (val as any).id : 'unknown'
    }))
  );
  
  return Object.entries(activeSpells)
    .map(([slot, spellData]) => {
      if (!spellData) return null;
      
      // Log the slot and spell ID
      console.log(`Processing active spell in slot ${slot}:`, 
        typeof spellData === 'string' ? spellData : 
        spellData && typeof spellData === 'object' && 'id' in spellData ? 
        (spellData as any).id : 'unknown format'
      );
      
      // Handle string ID format
      if (typeof spellData === 'string') {
        // Just create a minimal spell with the ID, to be filled in later
        return {
          id: spellData,
          name: 'Loading...',
          description: 'Loading spell details...',
          manaCost: 0,
          level: 1,
          cooldown: 0,
          type: 'attack',
          element: 'flame',
          power: 0,
          mpCost: 0,
          effects: {
            damage: 0,
            healing: 0
          },
          isEquipped: true,
          slotIndex: parseInt(slot, 10)
        } as ComponentSpell;
      }
      
      // Handle object format
      // Ensure we have a valid object
      const spell = spellData as any;
      
      const normalizedSpell: ComponentSpell = {
        id: spell.id || '',
        name: spell.name || 'Unknown Spell',
        description: spell.description || 'No description available',
        manaCost: spell.manaCost || spell.mpCost || 0,
        level: spell.level || 1,
        cooldown: spell.cooldown || 0,
        type: spell.type || 'attack',
        element: spell.element || 'flame',
        power: spell.power || 0,
        mpCost: spell.mpCost || spell.manaCost || 0,
        effects: spell.effects || {
          damage: 0,
          healing: 0
        },
        isEquipped: true,
        slotIndex: parseInt(slot, 10)
      };
      
      return normalizedSpell;
    })
    .filter(Boolean) as ComponentSpell[];
};

const SpellsPanel: React.FC<SpellsPanelProps> = ({ knownSpells, activeSpells, skillPoints }) => {
  const [selectedSpell, setSelectedSpell] = useState<ComponentSpell | null>(null);
  const [showSlotSelection, setShowSlotSelection] = useState(false);
  const { notifications, addNotification } = useNotifications();
  const [allSpells, setAllSpells] = useState<ComponentSpell[]>([]);
  const [equippedSpells, setEquippedSpells] = useState<(ComponentSpell | null)[]>([null, null, null, null, null]);
  
  // Debug logging
  useEffect(() => {
    
    
  }, [knownSpells, activeSpells]);

  // Update spells when props change
  useEffect(() => {
    
    
    // Normalize and save all known spells
    const normalizedSpells = normalizeSpellData(knownSpells);
    
    
    // Get active spells
    const activeSpellsArray = normalizeActiveSpells(activeSpells);
    
    
    // Extract just the IDs from the active spells
    const activeSpellIds = activeSpellsArray.map(spell => spell.id).filter(Boolean);
    
    
    // Mark which spells are equipped
    const processedSpells = normalizedSpells.map(spell => {
      const isActive = activeSpellIds.includes(spell.id);
      const updatedSpell = {
        ...spell,
        isEquipped: isActive
      };
      
      if (isActive) {
        
      }
      
      return updatedSpell;
    });
    
    setAllSpells(processedSpells);
    
    // Set up the equipped spells array
    const equippedSpellsArray: (ComponentSpell | null)[] = [null, null, null, null, null];
    
    // Process each active spell by slot
    if (typeof activeSpells === 'object') {
      Object.entries(activeSpells).forEach(([slotKey, spellValue]) => {
        // Skip empty slots
        if (!spellValue) return;
        
        // Handle different slot key formats (number or named slot)
        let slotIndex = -1;
        
        // Named slots like 'spell1'
        if (slotKey.startsWith('spell') && slotKey.length === 6) {
          const slotNum = parseInt(slotKey.substring(5), 10) - 1;
          if (slotNum >= 0 && slotNum < 5) {
            slotIndex = slotNum;
          }
        } else {
          // Numeric slots
          slotIndex = parseInt(slotKey, 10);
        }
        
        // Skip invalid slot indices
        if (slotIndex < 0 || slotIndex >= 5) {
          console.warn(`Invalid spell slot index: ${slotIndex} from key ${slotKey}`);
          return;
        }
        
        
        
        // Different handling based on the value type
        let spellId: string;
        
        // If it's a string, use it directly as the ID
        if (typeof spellValue === 'string') {
          spellId = spellValue;
        } 
        // If it's an object with an id property, use that
        else if (spellValue && typeof spellValue === 'object' && 'id' in spellValue) {
          spellId = (spellValue as any).id;
        }
        // Otherwise we can't process this slot
        else {
          console.warn(`Cannot process spell value for slot ${slotIndex}:`, spellValue);
          return;
        }
        
        // Find the full spell data from our normalized spells
        const fullSpellData = normalizedSpells.find(s => s.id === spellId);
        
        if (fullSpellData) {
          
          equippedSpellsArray[slotIndex] = {
            ...fullSpellData,
            isEquipped: true
          };
        } else {
          // If we couldn't find it in known spells, use a minimal spell object
          
          equippedSpellsArray[slotIndex] = {
            id: spellId,
            name: typeof spellValue === 'object' && 'name' in spellValue ? (spellValue as any).name : `Spell ${slotIndex + 1}`,
            description: 'Limited spell data available',
            manaCost: 0,
            level: 1,
            cooldown: 0,
            type: 'attack',
            element: 'flame',
            power: 0,
            mpCost: 0,
            effects: {
              damage: 0,
              healing: 0
            },
            isEquipped: true
          };
        }
      });
    }
    
    
    setEquippedSpells(equippedSpellsArray);
    
  }, [knownSpells, activeSpells]);

  // Get available spells (not equipped)
  const getLearnedSpells = () => {
    return allSpells.filter(spell => !spell.isEquipped);
  };

  // Handler for equipping spells
  const handleEquip = (spell: ComponentSpell) => {
    setSelectedSpell(spell);
    setShowSlotSelection(true);
  };

  // Handler for unequipping spells
  const handleUnequip = (spell: ComponentSpell, slot: number) => {
    if (!spell) return;
    
    const result = gameService.unequipSpell(spell.id, slot);
    if (result) {
      // We'll update the state when we receive the spells_updated event
      addNotification(`Unequipping ${spell.name}...`, 'info');
    } else {
      addNotification(`Failed to unequip spell. Not connected to game server.`, 'error');
    }
  };

  // Handler for equipping spells to specific slots
  const handleEquipToSlot = (slot: number) => {
    if (!selectedSpell) return;
    
    const result = gameService.equipSpell(selectedSpell.id, slot);
    if (result) {
      // We'll update the state when we receive the spells_updated event
      addNotification(`Equipping ${selectedSpell.name} to slot ${slot + 1}...`, 'info');
      setSelectedSpell(null);
      setShowSlotSelection(false);
    } else {
      addNotification(`Failed to equip spell. Not connected to game server.`, 'error');
      setSelectedSpell(null);
      setShowSlotSelection(false);
    }
  };

  // Listen for spell updates
  useEffect(() => {
    const handleSpellsUpdated = (data: any) => {
      
      
      // Check if we received slot and spellId info
      if (data.slot !== undefined && data.spellId !== undefined) {
        // Create new equipped spells array based on current state
        const newEquippedSpells = [...equippedSpells];
        
        // Find matching spell in allSpells
        let spell = null;
        if (data.spellId) { // Only look for spell if not unequipping
          spell = allSpells.find(s => s.id === data.spellId);
          
        }
        
        // Update the appropriate slot
        if (data.slot >= 0 && data.slot < 5) {
          if (spell) {
            newEquippedSpells[data.slot] = {
              ...spell,
              isEquipped: true
            };
          } else {
            newEquippedSpells[data.slot] = null;
          }
        }
        
        
        
        // Update equipped spells
        setEquippedSpells(newEquippedSpells);
        
        // Update all spells to reflect equipped status
        const updatedAllSpells = allSpells.map(s => {
          // If this is the spell being equipped, mark it as equipped
          if (data.spellId && s.id === data.spellId) {
            return { ...s, isEquipped: true };
          }
          
          // If a spell was previously in this slot, mark it as unequipped
          const wasInSlot = equippedSpells[data.slot]?.id === s.id;
          if (wasInSlot && s.id !== data.spellId) {
            return { ...s, isEquipped: false };
          }
          
          // Otherwise keep current state
          return s;
        });
        
        setAllSpells(updatedAllSpells);
        
        if (data.spellId) {
          const spellName = allSpells.find(s => s.id === data.spellId)?.name || 'Spell';
          addNotification(`Equipped ${spellName} to slot ${data.slot + 1}`, 'success');
        } else {
          addNotification(`Unequipped spell from slot ${data.slot + 1}`, 'success');
        }
      }
      
      // If we have full activeSpells data, update our state
      if (data.activeSpells) {
        
        // Process the active spells
        const activeSpellsArray = normalizeActiveSpells(data.activeSpells);
        
        // Create a fresh equipped spells array
        const newEquippedSpells = [null, null, null, null, null] as (ComponentSpell | null)[];
        
        // Fill the equipped spells array based on slotIndex
        activeSpellsArray.forEach(spell => {
          if (spell.slotIndex !== undefined && spell.slotIndex >= 0 && spell.slotIndex < 5) {
            newEquippedSpells[spell.slotIndex] = {
              ...spell,
              isEquipped: true
            };
          }
        });
        
        
        setEquippedSpells(newEquippedSpells);
        
        // Update all spells isEquipped status
        const activeSpellIds = activeSpellsArray.map(s => s.id);
        setAllSpells(prev => prev.map(s => ({
          ...s,
          isEquipped: activeSpellIds.includes(s.id)
        })));
      }
      
      // If we have knownSpells data, update that too
      if (data.knownSpells) {
        
        const normalizedSpells = normalizeSpellData(data.knownSpells);
        setAllSpells(normalizedSpells);
      }
    };

    gameService.on('spells_updated', handleSpellsUpdated);

    return () => {
      gameService.off('spells_updated', handleSpellsUpdated);
    };
  }, [equippedSpells, allSpells, addNotification]);

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
  const formatSpellEffects = (effects?: ComponentSpell['effects']): string => {
    if (!effects) return "No effects";
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
    
    return parts.length > 0 ? parts.join('\n') : "No effects";
  };

  return (
    <>
      
      {/* Skills header */}
      <div className="bg-primary rounded-t-md p-2 border-3 border-ui-dark">
        <div className="flex justify-between items-center">
          <div className="text-gold font-pixel text-base">Skills</div>
          <div className="bg-brown-light text-center font-pixel py-0.5 px-2 rounded border-ui-dark border-2 text-xs">
            Skill Points: {skillPoints}
          </div>
        </div>
      </div>

      {/* Equipped Skills */}
      <div className="bg-brown-panel border-x-3 border-ui-dark p-2">
        <div className="bg-brown text-center font-pixel py-1 mb-2 rounded border-ui-dark border-2 text-xs">
          Equipped Skills
        </div>
        <div className="grid grid-cols-5 gap-2">
          {equippedSpells.map((spell, index) => (
            <div 
              key={index} 
              className="h-14 p-1 w-14 overflow-hidden flex items-center justify-center bg-brown-light border-2 border-ui-dark rounded-sm aspect-square m-auto"
              onClick={() => selectedSpell && handleEquipToSlot(index)}
            >
              {spell ? (
                <div 
                  className="relative w-full h-full flex flex-col items-center cursor-pointer" 
                  onClick={(e) => {
                    e.stopPropagation();
                    handleUnequip(spell, index);
                  }}
                >
                  {spell.imageUrl ? (
                    <img 
                      src={spell.imageUrl} 
                      alt={spell.name}
                      className="w-full h-full object-contain mb-1"
                    />
                  ) : (
                    <i className={`ra ra-${getSpellIcon(spell.element)} text-sm mb-1 text-gold`}></i>
                  )}
            
                </div>
              ) : (
                <span className="text-xl opacity-50">+</span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Learned Skills */}
      <div className="bg-brown-panel border-x-3 border-b-3 border-ui-dark p-2 rounded-b-md">
        <div className="bg-brown text-center font-pixel py-1 mb-2 rounded border-ui-dark border-2 text-xs">
          Learned Skills
        </div>
        <div className="grid grid-cols-5 gap-2 max-h-64 overflow-y-auto">
          {getLearnedSpells().map((spell, index) => (
            <div 
              key={index} 
              className="h-14 w-14 p-1 flex flex-col overflow-hidden items-center justify-center bg-brown-light border-2 border-ui-dark rounded-sm cursor-pointer aspect-square m-auto"
              onClick={() => setSelectedSpell(spell)}
            >
              {spell.imageUrl ? (
                <img 
                  src={spell.imageUrl} 
                  alt={spell.name}
                  className=" object-contain w-full h-full"
                />
              ) : (
                <i className={`ra ra-${getSpellIcon(spell.element)} text-sm mb-1 text-gold`}></i>
              )}
       
            </div>
          ))}
          {Array(Math.max(0, 15 - getLearnedSpells().length)).fill(null).map((_, index) => (
            <div 
              key={`empty-${index}`} 
              className="h-14 flex items-center justify-center bg-brown-light border-2 border-ui-dark rounded-sm opacity-50 aspect-square m-auto"
            >
              <span className="text-xl">+</span>
            </div>
          ))}
        </div>
      </div>

      {/* Spell detail modal */}
      {selectedSpell && !showSlotSelection && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-md p-4 max-w-md w-full border-2 border-ui-dark">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-gold font-pixel text-xl">{selectedSpell.name}</h3>
              <button 
                onClick={() => setSelectedSpell(null)}
                className="text-white font-bold text-xl"
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
              <div className="p-2 rounded bg-gray-700">
                <div className="font-pixel text-gold">Power:</div>
                <div className="font-pixel text-white text-xl">{selectedSpell.power}</div>
              </div>
              <div className="p-2 rounded bg-brown">
                <div className="font-pixel text-gold">MP Cost:</div>
                <div className="font-pixel text-white text-xl">{selectedSpell.mpCost}</div>
              </div>
              <div className="p-2 rounded bg-brown col-span-2">
                <div className="font-pixel text-gold">Element:</div>
                <div className="font-pixel text-white">{selectedSpell.element}</div>
              </div>
              <div className="p-2 rounded bg-brown col-span-2">
                <div className="font-pixel text-gold">Cooldown:</div>
                <div className="font-pixel text-white">{selectedSpell.cooldown}s</div>
              </div>
              <div className="p-2 rounded bg-brown col-span-2">
                <div className="font-pixel text-gold">Effects:</div>
                <div className="font-pixel text-white whitespace-pre-line">
                  {formatSpellEffects(selectedSpell.effects)}
                </div>
              </div>
            </div>
            
            <div className="flex justify-between">
              <button 
                onClick={() => setSelectedSpell(null)}
                className="bg-brown font-pixel py-2 px-4 rounded border-ui-dark border"
              >
                Cancel
              </button>
              
              <button 
                onClick={() => setShowSlotSelection(true)}
                className="bg-brown-light text-gold font-pixel py-2 px-4 rounded border-ui-dark border"
              >
                Equip
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Slot selection modal */}
      {showSlotSelection && selectedSpell && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-md p-4 max-w-md w-full border-2 border-ui-dark">
            <div className="text-gold font-pixel text-center mb-4">Select Spell Slot</div>
            
            <div className="grid grid-cols-5 gap-2 mb-4">
              {Array(5).fill(null).map((_, index) => (
                <div 
                  key={index}
                  onClick={() => handleEquipToSlot(index)}
                  className="h-16 flex items-center justify-center bg-brown-light border-2 border-ui-dark rounded-sm cursor-pointer"
                >
                  <span className="font-pixel">{index + 1}</span>
                </div>
              ))}
            </div>
            
            <div className="flex justify-center">
              <button 
                onClick={() => setShowSlotSelection(false)}
                className="bg-brown font-pixel py-2 px-4 rounded border-ui-dark border"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default SpellsPanel; 