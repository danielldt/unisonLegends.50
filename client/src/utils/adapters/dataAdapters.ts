/**
 * dataAdapters.ts
 * 
 * This file contains adapter functions to standardize data formats
 * between server and client, specifically handling the mismatch where
 * server sends string IDs for equipment/spells and client components
 * might expect different formats.
 */

/**
 * Equipment types and interfaces
 */
export interface StandardEquipment {
  weapon1: string;
  weapon2: string;
  weapon3: string;
  weapon4: string;
  weapon5: string;
  head: string;
  body: string;
  legs: string;
  [slot: string]: string; // Index signature for compatibility with component types
}

/**
 * Spell types and interfaces
 */
export interface StandardActiveSpells {
  spell1: string;
  spell2: string;
  spell3: string;
  spell4: string;
  spell5: string;
  [slot: string]: string; // Index signature for compatibility with component types
}

/**
 * Normalizes equipment data from various formats to a standard format
 * @param equipmentData - Equipment data from server (could be various formats)
 * @returns Standardized equipment data with string IDs
 */
export function normalizeEquipment(equipmentData: any): StandardEquipment {
  
  
  // Initialize with empty string values
  const result: StandardEquipment = {
    weapon1: '',
    weapon2: '',
    weapon3: '',
    weapon4: '',
    weapon5: '',
    head: '',
    body: '',
    legs: ''
  };
  
  if (!equipmentData) {
    console.warn('[Adapter] Equipment data is null or undefined');
    return result;
  }
  
  // Direct assignment format (already in the expected format)
  if ('weapon1' in equipmentData || 'head' in equipmentData) {
    
    
    // Copy values directly if they exist, extracting IDs if objects
    Object.entries(result).forEach(([slot]) => {
      if (slot in equipmentData) {
        const value = equipmentData[slot];
        
        // Handle string ID
        if (typeof value === 'string') {
          result[slot] = value;
        }
        // Handle object with ID property
        else if (value && typeof value === 'object' && 'id' in value) {
          result[slot] = value.id;
        }
      }
    });
    
    
    return result;
  }
  
  // Handle numeric slot format from server (0=weapon1, 5=head, etc.)
  Object.entries(equipmentData).forEach(([slotKey, item]) => {
    // Skip if the item is null or undefined
    if (item === null || item === undefined) return;
    
    // Try parsing as a number first
    const slot = parseInt(slotKey, 10);
    
    // If it's a valid numeric slot
    if (!isNaN(slot)) {
      // Extract the item ID value
      let itemId = '';
      
      // Handle string ID directly
      if (typeof item === 'string') {
        itemId = item;
      } 
      // Handle object with ID property
      else if (item && typeof item === 'object' && 'id' in item) {
        itemId = (item as any).id || '';
      }
      
      // Map numeric slot to named slot
      if (itemId) {
        if (slot === 0) result.weapon1 = itemId;
        else if (slot === 1) result.weapon2 = itemId;
        else if (slot === 2) result.weapon3 = itemId;
        else if (slot === 3) result.weapon4 = itemId;
        else if (slot === 4) result.weapon5 = itemId;
        else if (slot === 5) result.head = itemId;
        else if (slot === 6) result.body = itemId;
        else if (slot === 7) result.legs = itemId;
      }
    }
    // If it's a named slot (direct property like 'weapon1')
    else if (slotKey in result) {
      // Extract the item ID value
      let itemId = '';
      
      // Handle string ID directly
      if (typeof item === 'string') {
        itemId = item;
      } 
      // Handle object with ID property
      else if (item && typeof item === 'object' && 'id' in item) {
        itemId = (item as any).id || '';
      }
      
      if (itemId) {
        result[slotKey] = itemId;
      }
    }
  });
  
  
  return result;
}

/**
 * Normalizes active spells data from various formats to a standard format
 * @param spellsData - Active spells data from server (could be various formats)
 * @returns Standardized active spells data with string IDs
 */
export function normalizeActiveSpells(spellsData: any): StandardActiveSpells {
  
  
  // Initialize with empty string values
  const result: StandardActiveSpells = {
    spell1: '',
    spell2: '',
    spell3: '',
    spell4: '',
    spell5: ''
  };
  
  if (!spellsData) {
    console.warn('[Adapter] Active spells data is null or undefined');
    return result;
  }
  
  // Direct assignment format (already in the expected format)
  if ('spell1' in spellsData || 'spell2' in spellsData) {
    
    
    // Copy values directly if they exist, extracting IDs if objects
    Object.entries(result).forEach(([slot]) => {
      if (slot in spellsData) {
        const value = spellsData[slot];
        
        // Handle string ID
        if (typeof value === 'string') {
          result[slot] = value;
        }
        // Handle object with ID property
        else if (value && typeof value === 'object' && 'id' in value) {
          result[slot] = value.id;
        }
      }
    });
    
    
    return result;
  }
  
  // Handle numeric slot format from server (0=spell1, 1=spell2, etc.)
  Object.entries(spellsData).forEach(([slotKey, spell]) => {
    // Skip if the spell is null or undefined
    if (spell === null || spell === undefined) return;
    
    // Try parsing as a number first
    const slot = parseInt(slotKey, 10);
    
    // If it's a valid numeric slot
    if (!isNaN(slot)) {
      // Extract the spell ID value
      let spellId = '';
      
      // Handle string ID directly
      if (typeof spell === 'string') {
        spellId = spell;
      } 
      // Handle object with ID property
      else if (spell && typeof spell === 'object' && 'id' in spell) {
        spellId = (spell as any).id || '';
      }
      
      // Map numeric slot to named slot
      if (spellId) {
        if (slot === 0) result.spell1 = spellId;
        else if (slot === 1) result.spell2 = spellId;
        else if (slot === 2) result.spell3 = spellId;
        else if (slot === 3) result.spell4 = spellId;
        else if (slot === 4) result.spell5 = spellId;
      }
    }
    // If it's a named slot (direct property like 'spell1')
    else if (slotKey in result) {
      // Extract the spell ID value
      let spellId = '';
      
      // Handle string ID directly
      if (typeof spell === 'string') {
        spellId = spell;
      } 
      // Handle object with ID property
      else if (spell && typeof spell === 'object' && 'id' in spell) {
        spellId = (spell as any).id || '';
      }
      
      if (spellId) {
        result[slotKey] = spellId;
      }
    }
  });
  
  
  return result;
}

/**
 * Utility function to determine if an item is equipped
 * @param itemId - The item ID to check
 * @param equipment - The standardized equipment object
 * @returns True if the item is equipped, false otherwise
 */
export function isItemEquipped(itemId: string, equipment: StandardEquipment): boolean {
  if (!itemId || !equipment) return false;
  
  return Object.values(equipment).includes(itemId);
}

/**
 * Utility function to determine if a spell is equipped
 * @param spellId - The spell ID to check
 * @param activeSpells - The standardized active spells object
 * @returns True if the spell is equipped, false otherwise
 */
export function isSpellEquipped(spellId: string, activeSpells: StandardActiveSpells): boolean {
  if (!spellId || !activeSpells) return false;
  
  return Object.values(activeSpells).includes(spellId);
} 