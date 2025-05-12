import React, { useState, useEffect } from 'react';
import { gameService } from '../../services/gameService';
import { useNotifications, Inventory as StateInventory, Equipment as StateEquipment } from '../../utils/store';
import NotificationDisplay from '../common/NotificationDisplay';
import TintedItemImage from '../common/TintedItemImage';
import { getRarityColor, getRarityBorder, getRarityBackground } from '../../utils/rarityConfig';

// Common interface for all inventory items
export interface ItemData {
  id: string;
  name: string;
  type: string;
  category: string;
  description?: string;
  rarity: string;
  dmg?: number;
  def?: number;
  stats?: {
    [key: string]: number;
  };
  imageUrl?: string;
  isEquipped?: boolean;
}

// Equipment slots interface
export interface Equipment {
  [slot: string]: string;
}

interface InventoryProps {
  inventory: {
    [id: string]: any;
  };
  equipment: Equipment;
}

// Helper function to normalize inventory data
const normalizeInventoryData = (rawInventory: {[id: string]: any}): ItemData[] => {
  if (!rawInventory || typeof rawInventory !== 'object') {
    return [];
  }
  
  return Object.entries(rawInventory).map(([id, item]) => {
    // Skip if item is null or undefined
    if (!item) {
      return null;
    }
    
    // Ensure all required fields have values
    const normalizedItem: ItemData = {
      id: item.id || id,
      name: item.name || 'Unknown Item',
      type: item.type || 'misc',
      category: item.category || 'misc',
      rarity: item.rarity || 'common',
      isEquipped: item.isEquipped === true
    };
    
    // Add optional fields if they exist
    if (item.description) normalizedItem.description = item.description;
    if (item.dmg) normalizedItem.dmg = item.dmg;
    if (item.def) normalizedItem.def = item.def;
    if (item.imageUrl) normalizedItem.imageUrl = item.imageUrl;
    
    // Handle stats
    if (item.stats && typeof item.stats === 'object') {
      normalizedItem.stats = { ...item.stats };
    } else {
      // Create stats from flat properties if they exist
      const stats: {[key: string]: number} = {};
      ['str', 'dex', 'int', 'agi', 'luk', 'hp', 'mp', 'attack', 'defense'].forEach(stat => {
        if (item[stat] && typeof item[stat] === 'number') {
          stats[stat] = item[stat];
        }
      });
      
      if (Object.keys(stats).length > 0) {
        normalizedItem.stats = stats;
      }
    }
    
    return normalizedItem;
  }).filter(Boolean) as ItemData[]; // Filter out null values
};

const InventoryPanel: React.FC<InventoryProps> = ({ inventory, equipment }) => {
  const [inventoryItems, setInventoryItems] = useState<ItemData[]>([]);
  const [selectedItem, setSelectedItem] = useState<ItemData | null>(null);
  const [showSlotSelection, setShowSlotSelection] = useState(false);
  const { addNotification } = useNotifications();
  
  // Process inventory items when component mounts or inventory changes
  useEffect(() => {
    const normalizedItems = normalizeInventoryData(inventory);
    setInventoryItems(normalizedItems);
  }, [inventory]);
  
  // React to equipment prop changes
  useEffect(() => {
    // Check if equipment contains any items
    const hasEquippedItems = Object.values(equipment).some(id => id !== '');
    if (hasEquippedItems) {
      // Update isEquipped status on inventory items
      const equippedItemIds = Object.values(equipment).filter(id => id);
      setInventoryItems(prev => {
        // Only update if we need to (performance optimization)
        const needsUpdate = prev.some(item => 
          (equippedItemIds.includes(item.id) && !item.isEquipped) || 
          (!equippedItemIds.includes(item.id) && item.isEquipped)
        );
        
        if (!needsUpdate) {
          return prev;
        }
        
        return prev.map(item => ({
          ...item,
          isEquipped: equippedItemIds.includes(item.id)
        }));
      });
    }
  }, [equipment]);

  // Listen for player_details events to sync equipment
  useEffect(() => {
    const handlePlayerDetails = (data: any) => {
      if (data.equipment) {
        // Update isEquipped status on inventory items based on equipment data
        const equippedItemIds = Object.values(data.equipment).filter(id => id);
        if (equippedItemIds.length > 0) {
          setInventoryItems(prev => prev.map(item => ({
            ...item,
            isEquipped: equippedItemIds.includes(item.id)
          })));
        }
      }
    };
    
    gameService.on('player_details', handlePlayerDetails);
    
    return () => {
      gameService.off('player_details', handlePlayerDetails);
    };
  }, []);

  // Functions to handle item rarity display
  const getRarityBorder = (rarity: string): string => {
    switch (rarity?.toLowerCase()) {
      case 'rare': return 'border-blue-400';
      case 'epic': return 'border-purple-400';
      case 'legendary': return 'border-gold';
      case 'unique': return 'border-red-400';
      default: return 'border-ui-dark';
    }
  };

  const getRarityBackground = (rarity: string): string => {
    switch (rarity?.toLowerCase()) {
      case 'rare': return 'bg-blue-900';
      case 'epic': return 'bg-purple-900';
      case 'legendary': return 'bg-yellow-900';
      case 'unique': return 'bg-red-900';
      default: return 'bg-brown-light';
    }
  };

  const getRarityColor = (rarity: string): string => {
    switch (rarity?.toLowerCase()) {
      case 'rare': return 'text-blue-400';
      case 'epic': return 'text-purple-400';
      case 'legendary': return 'text-gold';
      case 'unique': return 'text-red-400';
      default: return 'text-gray-300';
    }
  };
  
  // Check if inventory is completely empty
  if (inventoryItems.length === 0) {
    // No inventory items to display
  }

  // Convert object-based equipment to traditional format
  function convertEquipment(equip: any): {
    weapon1: string;
    weapon2: string;
    weapon3: string;
    weapon4: string;
    weapon5: string;
    head: string;
    body: string;
    legs: string;
  } {
    const result = {
      weapon1: '',
      weapon2: '',
      weapon3: '',
      weapon4: '',
      weapon5: '',
      head: '',
      body: '',
      legs: ''
    };
    
    // If equip is not an object or is null, return empty result
    if (!equip || typeof equip !== 'object') {
      return result;
    }
    
    // Map slot numbers to names
    for (const [slotNum, item] of Object.entries(equip)) {
      const slot = parseInt(slotNum);
      
      // Handle different item types (string or object with id)
      let itemId = '';
      if (typeof item === 'string') {
        // If item is already a string ID, use it directly
        itemId = item;
      } else if (item && typeof item === 'object' && 'id' in item) {
        // If item is an object with an ID property, extract the ID
        itemId = (item as any).id || '';
      }
      
      // Assign to the appropriate slot
      if (slot === 0) result.weapon1 = itemId;
      if (slot === 1) result.weapon2 = itemId;
      if (slot === 2) result.weapon3 = itemId;
      if (slot === 3) result.weapon4 = itemId;
      if (slot === 4) result.weapon5 = itemId;
      if (slot === 5) result.head = itemId;
      if (slot === 6) result.body = itemId;
      if (slot === 7) result.legs = itemId;
    }
    
    return result;
  }

  // Get equipped items by matching IDs from equipment object
  const getEquippedItems = () => {
    const equippedItems: { [key: string]: ItemData | null } = {
      head: null,
      body: null,
      legs: null
    };

    // Find armor pieces by slot
    if (equipment.head) {
      const foundItem = inventoryItems.find(item => item.id === equipment.head);
      equippedItems.head = foundItem || null;
    }
    if (equipment.body) {
      const foundItem = inventoryItems.find(item => item.id === equipment.body);
      equippedItems.body = foundItem || null;
    }
    if (equipment.legs) {
      const foundItem = inventoryItems.find(item => item.id === equipment.legs);
      equippedItems.legs = foundItem || null;
    }

    return equippedItems;
  };

  // Get equipped weapons
  const getEquippedWeapons = () => {
    const weapons: (ItemData | null)[] = [null, null, null, null, null];
    
    if (equipment.weapon1) {
      const foundItem = inventoryItems.find(item => item.id === equipment.weapon1);
      weapons[0] = foundItem || null;
    }
    if (equipment.weapon2) {
      const foundItem = inventoryItems.find(item => item.id === equipment.weapon2);
      weapons[1] = foundItem || null;
    }
    if (equipment.weapon3) {
      const foundItem = inventoryItems.find(item => item.id === equipment.weapon3);
      weapons[2] = foundItem || null;
    }
    if (equipment.weapon4) {
      const foundItem = inventoryItems.find(item => item.id === equipment.weapon4);
      weapons[3] = foundItem || null;
    }
    if (equipment.weapon5) {
      const foundItem = inventoryItems.find(item => item.id === equipment.weapon5);
      weapons[4] = foundItem || null;
    }
    
    return weapons;
  };

  // Handler for equipping items
  const handleEquip = (item: ItemData) => {
    if (!item) {
      return;
    }
    
    if (!item.type && !item.category) {
      return;
    }
    
    // Check if it's a weapon - weapons can be identified by either type='weapon' or category='weapon'
    if (item.type === 'weapon' || item.category === 'weapon') {
      setSelectedItem(item);
      setShowSlotSelection(true);
    } else {
      // For armor, determine the slot based on category
      let slot = -1;
      switch (item.category) {
        case 'head': slot = 5; break;
        case 'body': slot = 6; break;
        case 'legs': slot = 7; break;
        default: 
          return;
      }
      
      const result = gameService.equipItem(item.id, slot);
      if (result) {
        addNotification(`Equipping ${item.name}...`, 'info');
        
        // Optimistically update local state
        // 1. Update equipment object
        const updatedEquipment = { ...equipment };
        if (slot === 5) updatedEquipment.head = item.id;
        if (slot === 6) updatedEquipment.body = item.id;
        if (slot === 7) updatedEquipment.legs = item.id;
        
        // 2. Update item's equipped state
        setInventoryItems(prev => prev.map(invItem => 
          invItem.id === item.id 
            ? { ...invItem, isEquipped: true }
            : invItem
        ));
        
        // Close the dialog after equipping
        setSelectedItem(null);
      } else {
        addNotification(`Failed to equip item. Not connected to game server.`, 'error');
      }
    }
  };

  // Handler for unequipping items
  const handleUnequip = (item: ItemData, slot: number) => {
    if (!item) {
      return;
    }
    
    const result = gameService.unequipItem(item.id, slot);
    if (result) {
      addNotification(`Unequipping ${item.name}...`, 'info');
      
      // Optimistically update local state
      // 1. Update equipment object
      const updatedEquipment = { ...equipment };
      if (slot === 0) updatedEquipment.weapon1 = '';
      if (slot === 1) updatedEquipment.weapon2 = '';
      if (slot === 2) updatedEquipment.weapon3 = '';
      if (slot === 3) updatedEquipment.weapon4 = '';
      if (slot === 4) updatedEquipment.weapon5 = '';
      if (slot === 5) updatedEquipment.head = '';
      if (slot === 6) updatedEquipment.body = '';
      if (slot === 7) updatedEquipment.legs = '';
      
      // 2. Update item's equipped state
      setInventoryItems(prev => prev.map(invItem => 
        invItem.id === item.id 
          ? { ...invItem, isEquipped: false }
          : invItem
      ));
    } else {
      addNotification(`Failed to unequip item. Not connected to game server.`, 'error');
    }
  };

  // Handler for equipping weapons to specific slots
  const handleEquipToSlot = (slot: number) => {
    if (!selectedItem) {
      return;
    }
    
    // Make sure we're equipping a weapon
    if (selectedItem.category !== 'weapon' && selectedItem.type !== 'weapon' && 
        selectedItem.type !== 'sword' && selectedItem.type !== 'staff' && 
        selectedItem.type !== 'wand' && selectedItem.type !== 'bow') {
      addNotification(`Cannot equip non-weapon item to weapon slot`, 'error');
      setSelectedItem(null);
      setShowSlotSelection(false);
      return;
    }
    
    const result = gameService.equipItem(selectedItem.id, slot);
    if (result) {
      addNotification(`Equipping ${selectedItem.name} to slot ${slot + 1}...`, 'info');
      
      // Optimistically update local state
      // 1. Get old item in this slot (if any)
      let oldItemId: string | undefined;
      if (slot === 0) oldItemId = equipment.weapon1;
      if (slot === 1) oldItemId = equipment.weapon2;
      if (slot === 2) oldItemId = equipment.weapon3;
      if (slot === 3) oldItemId = equipment.weapon4;
      if (slot === 4) oldItemId = equipment.weapon5;
      
      // 2. Update equipment object
      const updatedEquipment = { ...equipment };
      if (slot === 0) updatedEquipment.weapon1 = selectedItem.id;
      if (slot === 1) updatedEquipment.weapon2 = selectedItem.id;
      if (slot === 2) updatedEquipment.weapon3 = selectedItem.id;
      if (slot === 3) updatedEquipment.weapon4 = selectedItem.id;
      if (slot === 4) updatedEquipment.weapon5 = selectedItem.id;
      
      // 3. Update inventory items
      setInventoryItems(prev => prev.map(invItem => {
        // Update the newly equipped item
        if (invItem.id === selectedItem?.id) {
          return { ...invItem, isEquipped: true };
        }
        // Update any item that was previously in this slot
        if (oldItemId && invItem.id === oldItemId) {
          return { ...invItem, isEquipped: false };
        }
        return invItem;
      }));
      
      // Clean up
      setSelectedItem(null);
      setShowSlotSelection(false);
    } else {
      addNotification(`Failed to equip item. Not connected to game server.`, 'error');
      // Clean up
      setSelectedItem(null);
      setShowSlotSelection(false);
    }
  };

  // Listen for equipment updates
  useEffect(() => {
    const handleEquipmentUpdated = (data: any) => {
      // If we have full equipment data, use that
      if (data.equipment) {
        // Check if this is an empty equipment case (all slots are empty strings)
        const isEmpty = Object.values(data.equipment).every(val => val === "");
        
        // Directly use the equipment data as is if it has the right format
        const hasExpectedFormat = 'weapon1' in data.equipment && 
                               'head' in data.equipment && 
                               'body' in data.equipment && 
                               'legs' in data.equipment;
        
        if (hasExpectedFormat) {
          // Mark all equipped items
          const equippedItemIds = Object.values(data.equipment).filter(id => id);
          
          if (equippedItemIds.length > 0) {
            setInventoryItems(prev => prev.map(item => ({
              ...item,
              isEquipped: equippedItemIds.includes(item.id)
            })));
          }
        } else {
          // Convert slot number keys to string-based equipment format
          const equipmentObj: Equipment = {};
          
          Object.entries(data.equipment).forEach(([slot, itemId]) => {
            const slotNum = parseInt(slot, 10);
            
            if (slotNum === 0) equipmentObj.weapon1 = itemId as string;
            else if (slotNum === 1) equipmentObj.weapon2 = itemId as string;
            else if (slotNum === 2) equipmentObj.weapon3 = itemId as string;
            else if (slotNum === 3) equipmentObj.weapon4 = itemId as string;
            else if (slotNum === 4) equipmentObj.weapon5 = itemId as string;
            else if (slotNum === 5) equipmentObj.head = itemId as string;
            else if (slotNum === 6) equipmentObj.body = itemId as string;
            else if (slotNum === 7) equipmentObj.legs = itemId as string;
          });
          
          // Mark all equipped items
          const equippedItemIds = Object.values(equipmentObj).filter(id => id);
          
          if (equippedItemIds.length > 0) {
            setInventoryItems(prev => prev.map(item => ({
              ...item,
              isEquipped: equippedItemIds.includes(item.id)
            })));
          }
        }
      }
      
      // Check if we received slot and itemId info
      if (data.slot !== undefined && data.itemId !== undefined) {
        // Create a copy of our current equipment
        const updatedEquipment = { ...equipment };
        
        // Get the old item ID that was in this slot (if any)
        let oldItemId: string | undefined;
        switch (data.slot) {
          case 0: oldItemId = equipment.weapon1; break;
          case 1: oldItemId = equipment.weapon2; break;
          case 2: oldItemId = equipment.weapon3; break;
          case 3: oldItemId = equipment.weapon4; break;
          case 4: oldItemId = equipment.weapon5; break;
          case 5: oldItemId = equipment.head; break;
          case 6: oldItemId = equipment.body; break;
          case 7: oldItemId = equipment.legs; break;
        }
        
        // Update the appropriate slot
        switch (data.slot) {
          case 0: updatedEquipment.weapon1 = data.itemId; break;
          case 1: updatedEquipment.weapon2 = data.itemId; break;
          case 2: updatedEquipment.weapon3 = data.itemId; break;
          case 3: updatedEquipment.weapon4 = data.itemId; break;
          case 4: updatedEquipment.weapon5 = data.itemId; break;
          case 5: updatedEquipment.head = data.itemId; break;
          case 6: updatedEquipment.body = data.itemId; break;
          case 7: updatedEquipment.legs = data.itemId; break;
        }
        
        // Update items' equipped status
        if (oldItemId && oldItemId !== data.itemId) {
          // If there was an item previously in this slot, mark it as unequipped
          setInventoryItems(prev => prev.map(item => 
            item.id === oldItemId
              ? { ...item, isEquipped: false }
              : item
          ));
        }
        
        if (data.itemId) {
          // Mark the new item as equipped
          setInventoryItems(prev => prev.map(item => 
            item.id === data.itemId 
              ? { ...item, isEquipped: true }
              : item
          ));
          
          const itemName = inventoryItems.find(item => item.id === data.itemId)?.name || 'Item';
          const slotName = data.slot <= 4 
            ? `weapon slot ${data.slot + 1}` 
            : data.slot === 5 
              ? 'head slot' 
              : data.slot === 6 
                ? 'body slot' 
                : 'legs slot';
          
          addNotification(`Equipped ${itemName} to ${slotName}`, 'success');
        } else if (oldItemId) {
          // We're unequipping an item
          const oldItemName = inventoryItems.find(item => item.id === oldItemId)?.name || 'Item';
          const slotName = data.slot <= 4 
            ? `weapon slot ${data.slot + 1}` 
            : data.slot === 5 
              ? 'head slot' 
              : data.slot === 6 
                ? 'body slot' 
                : 'legs slot';
                
          addNotification(`Unequipped ${oldItemName} from ${slotName}`, 'success');
        }
      }
      
      // If we have inventory data, update that too
      if (data.inventory) {
        const normalizedItems = normalizeInventoryData(data.inventory);
        setInventoryItems(normalizedItems);
      }
    };

    gameService.on('equipment_updated', handleEquipmentUpdated);

    return () => {
      gameService.off('equipment_updated', handleEquipmentUpdated);
    };
  }, [inventoryItems, equipment, addNotification]);

  const equippedItems = getEquippedItems();
  const equippedWeapons = getEquippedWeapons();
  
  // Filter out equipped items for the inventory display
  const unequippedItems = inventoryItems.filter(item => {
    // First, check the internal isEquipped flag
    if (item.isEquipped) {
      return false;
    }
    
    // Then check if the item is in any equipped slot
    const weaponSlots = [
      equipment.weapon1,
      equipment.weapon2,
      equipment.weapon3,
      equipment.weapon4,
      equipment.weapon5
    ];
    
    const armorSlots = [
      equipment.head,
      equipment.body,
      equipment.legs
    ];
    
    return !(
      weaponSlots.includes(item.id) || 
      armorSlots.includes(item.id)
    );
  });

  // Handle closing modals
  const closeModals = () => {
    setSelectedItem(null);
    setShowSlotSelection(false);
  };

  return (
    <>


      {/* Inventory header */}
      <div className="bg-primary rounded-t-md p-2 border-3 border-ui-dark">
        <div className="text-gold font-pixel text-base">Inventory</div>
      </div>

      {/* Equipped armor slots */}
      <div className="bg-brown-panel border-x-3 border-ui-dark p-2 space-y-2">
        {['head', 'body', 'legs'].map((slot, index) => {
          const equippedItem = equippedItems[slot as keyof typeof equippedItems];
          return (
          <div key={slot} className="flex items-center border-2 border-ui-dark rounded-sm p-2 bg-brown-light">
            <div className={`w-7 h-7 flex items-center justify-center bg-brown-dark rounded-sm border ${equippedItem ? getRarityBorder(equippedItem.rarity) : 'border-ui-dark'}`}>
              {equippedItem?.imageUrl ? (
                <TintedItemImage 
                  src={equippedItem.imageUrl}
                  alt={equippedItem.name || slot}
                  rarity={equippedItem.rarity}
                />
              ) : (
                <i className={`ra ${slot === 'head' ? 'ra-helmet' : slot === 'body' ? 'ra-vest' : 'ra-boot-stomp'}`}></i>
              )}
            </div>
            <div className={`ml-3 flex-grow font-pixel text-xs ${equippedItem ? getRarityColor(equippedItem.rarity) : ''}`}>
              {equippedItem?.name || 'Unequipped'}
            </div>
            {equippedItem && (
              <button 
                className="bg-brown-dark text-xs font-pixel py-0.5 px-2 rounded border-ui-dark border"
                onClick={() => handleUnequip(
                  equippedItem as ItemData, 
                  slot === 'head' ? 5 : slot === 'body' ? 6 : 7
                )}
              >
                Unequip
              </button>
            )}
          </div>
          );
        })}
      </div>

      {/* Weapon slots */}
      <div className="bg-brown-panel border-x-3 border-ui-dark p-2">
        <div className="bg-brown text-center font-pixel py-1 mb-2 rounded border-ui-dark border-2 text-xs">
          Weapon
        </div>
        <div className="grid grid-cols-5 gap-2">
          {Array(5).fill(null).map((_, index) => {
            const equippedWeapon = equippedWeapons[index];
            return (
            <div 
              key={index} 
              className={`h-14 w-14 p-1 overflow-hidden flex items-center justify-center ${equippedWeapon ? getRarityBackground(equippedWeapon.rarity) || 'bg-brown-light' : 'bg-brown-light'} border-2 ${equippedWeapon ? getRarityBorder(equippedWeapon.rarity) : 'border-ui-dark'} rounded-sm aspect-square m-auto`}
              onClick={() => selectedItem && handleEquipToSlot(index)}
            >
              {equippedWeapon ? (
                <div className="relative w-full h-full flex flex-col items-center cursor-pointer" onClick={(e) => {
                  e.stopPropagation();
                  handleUnequip(equippedWeapon as ItemData, index);
                }}>
                  {equippedWeapon?.imageUrl ? (
                    <TintedItemImage 
                      src={equippedWeapon.imageUrl}
                      alt={equippedWeapon.name}
                      rarity={equippedWeapon.rarity}
                    />
                  ) : (
                    <i className={`ra ra-sword text-xl ${getRarityColor(equippedWeapon.rarity)} mb-1`}></i>
                  )}
                
                </div>
              ) : (
                <span className="text-xl opacity-50">+</span>
              )}
            </div>
            );
          })}
        </div>
      </div>

      {/* Item slots */}
      <div className="bg-brown-panel border-x-3 border-b-3 border-ui-dark p-2 rounded-b-md">
        <div className="flex justify-between items-center mb-2">
          <div className="bg-brown text-center font-pixel py-1 px-2 rounded border-ui-dark border-2 text-xs">
            Items ({unequippedItems.length})
          </div>
        </div>
        <div className="grid grid-cols-5 gap-2 max-h-64 overflow-y-auto">
          {unequippedItems.map((item, index) => (
            <div 
              key={index} 
              className={`h-14 w-14 overflow-hidden flex flex-col items-center justify-center ${getRarityBackground(item.rarity) || 'bg-brown-light'} border-2 ${getRarityBorder(item.rarity)} rounded-sm cursor-pointer aspect-square m-auto p-1`}
              onClick={() => setSelectedItem(item)}
            >
              {item.imageUrl ? (
                <TintedItemImage 
                  src={item.imageUrl}
                  alt={item.name}
                  rarity={item.rarity}
                />
              ) : (
                <i className={`ra ra-${item.category === 'weapon' ? 'sword' : 
                  item.category === 'head' ? 'helmet' : 
                  item.category === 'body' ? 'vest' : 
                  item.category === 'legs' ? 'boot-stomp' : 'scroll-unfurled'} text-sm mb-1 ${getRarityColor(item.rarity)}`}></i>
              )}
            
            </div>
          ))}
          {Array(Math.max(0, 25 - unequippedItems.length)).fill(null).map((_, index) => (
            <div 
              key={`empty-${index}`} 
              className="h-14 flex items-center justify-center bg-brown-light border-2 border-ui-dark rounded-sm opacity-50 aspect-square m-auto"
            >
              <span className="text-xl">+</span>
            </div>
          ))}
        </div>
      </div>

      {/* Item detail modal */}
      {selectedItem && !showSlotSelection && (
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
              {/* Show explicit damage property if available */}
              {selectedItem.dmg !== undefined && selectedItem.dmg > 0 && (
                <div className="p-2 rounded bg-red-900 flex items-center">
                  <i className="ra ra-sword text-gold mr-2"></i>
                  <div className="flex-grow">
                    <div className="font-pixel text-gold text-xs">Damage:</div>
                    <div className="font-pixel text-white text-lg">+{selectedItem.dmg}</div>
                  </div>
                </div>
              )}
              
              {/* Show explicit defense property if available */}
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
              {(!selectedItem.stats || Object.keys(selectedItem.stats).length === 0) && 
               selectedItem.dmg === undefined && selectedItem.def === undefined && (
                <div className="col-span-2 text-center py-2 text-gray-400 font-pixel">
                  No stats available
                </div>
              )}
            </div>
            
            <div className="flex justify-between">
              <button 
                type="button"
                onClick={closeModals}
                className="bg-brown font-pixel py-2 px-4 rounded border-ui-dark border hover:bg-brown-dark focus:outline-none"
              >
                Cancel
              </button>
              
              <button 
                type="button"
                onClick={() => {
                  if (selectedItem.type === 'weapon' || selectedItem.category === 'weapon') {
                    
                    setShowSlotSelection(true);
                  } else {
                    
                    handleEquip(selectedItem);
                  }
                }}
                className="bg-brown-light text-gold font-pixel py-2 px-4 rounded border-ui-dark border hover:bg-brown-dark focus:outline-none"
              >
                Equip
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Slot selection modal - this is a completely separate modal */}
      {showSlotSelection && selectedItem && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={closeModals}
        >
          <div 
            className="bg-gray-800 rounded-md p-4 max-w-md w-full border-2 border-ui-dark"
            onClick={(e) => e.stopPropagation()} 
          >
            <div className="text-gold font-pixel text-center mb-4">Select Weapon Slot for {selectedItem.name}</div>
            
            {/* Weapon preview */}
            <div className="mb-4 flex justify-center">
              <div className="flex flex-col items-center">
                <div className={`w-12 h-12 bg-brown-dark flex items-center justify-center rounded border ${getRarityBorder(selectedItem.rarity)}`}>
                  {selectedItem.imageUrl ? (
                    <TintedItemImage 
                      src={selectedItem.imageUrl}
                      alt={selectedItem.name}
                      rarity={selectedItem.rarity}
                    />
                  ) : (
                    <i className={`ra ra-sword text-2xl ${getRarityColor(selectedItem.rarity)}`}></i>
                  )}
                </div>
                <div className={`text-sm font-pixel ${getRarityColor(selectedItem.rarity)}`}>
                  {selectedItem.name}
                </div>
              </div>
            </div>
            
            {/* Primary weapon stats */}
            <div className="flex justify-center gap-4 mb-3">
              {selectedItem.dmg !== undefined && selectedItem.dmg > 0 && (
                <div className="bg-red-900 rounded-md px-3 py-1 flex items-center">
                  <i className="ra ra-sword text-gold mr-2"></i>
                  <span className="font-pixel text-white text-sm">DMG: {selectedItem.dmg}</span>
                </div>
              )}
              
              {selectedItem.def !== undefined && selectedItem.def > 0 && (
                <div className="bg-blue-900 rounded-md px-3 py-1 flex items-center">
                  <i className="ra ra-shield text-gold mr-2"></i>
                  <span className="font-pixel text-white text-sm">DEF: {selectedItem.def}</span>
                </div>
              )}
            </div>
            
            {/* Weapon stats summary */}
            {selectedItem.stats && Object.keys(selectedItem.stats).some(key => selectedItem.stats![key]) && (
              <div className="bg-brown rounded mb-4 p-2">
                <div className="font-pixel text-xs text-gold mb-1 text-center">Weapon Stats</div>
                <div className="flex flex-wrap justify-center gap-2">
                  {Object.entries(selectedItem.stats).map(([key, value]) => {
                    // Skip if the value is undefined or 0
                    if (value === undefined || value === 0) return null;
                    
                    let icon = "";
                    let statLabel = key.charAt(0).toUpperCase() + key.slice(1);
                    
                    switch(key.toLowerCase()) {
                      case 'damage':
                      case 'dmg':
                      case 'attack':
                        icon = "ra-sword";
                        statLabel = "DMG";
                        break;
                      case 'str':
                      case 'strength':
                        icon = "ra-muscle-up";
                        statLabel = "STR";
                        break;
                      case 'dex':
                      case 'dexterity':
                        icon = "ra-feather-wing";
                        statLabel = "DEX";
                        break;
                      case 'int':
                      case 'intelligence':
                        icon = "ra-brain";
                        statLabel = "INT";
                        break;
                      case 'agi':
                      case 'agility':
                        icon = "ra-running-ninja";
                        statLabel = "AGI";
                        break;
                      case 'luk':
                      case 'luck':
                        icon = "ra-diamond";
                        statLabel = "LUK";
                        break;
                      case 'crit':
                      case 'critical':
                        icon = "ra-crossed-swords";
                        statLabel = "CRIT";
                        break;
                      case 'eva':
                      case 'evasion':
                        icon = "ra-player-dodge";
                        statLabel = "EVA";
                        break;
                      case 'acc':
                      case 'accuracy':
                        icon = "ra-eye";
                        statLabel = "ACC";
                        break;
                      default:
                        icon = "ra-crossed-swords";
                    }
                    
                    return (
                      <div key={key} className="bg-brown-dark rounded px-2 py-1 text-center">
                        <div className="flex items-center">
                          <i className={`ra ${icon} text-gold text-xs mr-1`}></i>
                          <span className="font-pixel text-white text-xs">{statLabel}: +{value}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
            
            <div className="grid grid-cols-5 gap-2 mb-4">
              {Array(5).fill(null).map((_, index) => {
                // Get the current weapon in this slot (if any)
                const currentWeapon = equippedWeapons[index];
                
                return (
                  <button 
                    key={index}
                    type="button"
                    onClick={() => {
                      handleEquipToSlot(index);
                    }}
                    className={`flex flex-col items-center justify-center rounded-sm cursor-pointer focus:outline-none border-2 ${
                      currentWeapon 
                        ? `bg-brown-dark ${getRarityBorder(currentWeapon.rarity)}` 
                        : 'bg-brown-light border-ui-dark'
                    }`}
                  >
                    <div className="h-12 w-12 flex items-center justify-center">
                      {currentWeapon ? (
                        <>
                          {currentWeapon.imageUrl ? (
                            <TintedItemImage 
                              src={currentWeapon.imageUrl}
                              alt={currentWeapon.name}
                              rarity={currentWeapon.rarity}
                            />
                          ) : (
                            <i className={`ra ra-sword text-sm ${getRarityColor(currentWeapon.rarity)} opacity-50`}></i>
                          )}
                        </>
                      ) : (
                        <span className="font-pixel text-gold text-lg">{index + 1}</span>
                      )}
                    </div>
                    
                    {currentWeapon && (
                      <div className={`text-[8px] font-pixel ${getRarityColor(currentWeapon.rarity)} overflow-hidden px-1 text-center`}>
                        {currentWeapon.name}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
            
            <div className="flex justify-center">
              <button 
                type="button"
                onClick={() => {
                  setShowSlotSelection(false);
                }}
                className="bg-brown font-pixel py-2 px-4 rounded border-ui-dark border hover:bg-brown-dark focus:outline-none"
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

export default InventoryPanel; 