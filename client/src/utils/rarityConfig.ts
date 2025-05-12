/**
 * Rarity Configuration
 * 
 * This file contains shared configuration for item rarity styling.
 * Update colors in this file to change them throughout the application.
 */

// Color values for each rarity level
interface RarityColors {
  main: string;    // Main color (for text)
  border: string;  // Border color
  shadow: string;  // Shadow color (for image tinting)
  background: string; // Background color for containers
}

// Rarity levels in order from lowest to highest
export const RARITY_LEVELS = ['F', 'E', 'D', 'C', 'B', 'A', 'S', 'SS', 'SSS'] as const;
export type RarityLevel = typeof RARITY_LEVELS[number];

// Rarity color configuration
export const RARITY_COLORS: Record<RarityLevel, RarityColors> = {
  'F': {
    main: 'text-gray-500',
    border: 'border-gray-500',
    shadow: 'rgba(180, 180, 180, 1)',
    background: ''
  },
  'E': {
    main: 'text-gray-600',
    border: 'border-gray-600',
    shadow: 'rgba(220, 220, 220, 1)',
    background: ''
  },
  'D': {
    main: 'text-green-400',
    border: 'border-green-400',
    shadow: 'rgba(74, 222, 128, 1)',
    background: 'bg-gradient-to-br from-brown-light to-green-900/10'
  },
  'C': {
    main: 'text-teal-400',
    border: 'border-teal-400',
    shadow: 'rgba(45, 212, 191, 1)',
    background: 'bg-gradient-to-br from-brown-light to-teal-900/15'
  },
  'B': {
    main: 'text-blue-400',
    border: 'border-blue-400',
    shadow: 'rgba(96, 165, 250, 1)',
    background: 'bg-gradient-to-br from-brown-light to-blue-900/20'
  },
  'A': {
    main: 'text-purple-400',
    border: 'border-purple-400',
    shadow: 'rgba(192, 132, 252, 1)',
    background: 'bg-gradient-to-br from-brown-light to-purple-900/25'
  },
  'S': {
    main: 'text-yellow-400',
    border: 'border-yellow-400',
    shadow: 'rgba(250, 204, 21, 1)',
    background: 'bg-gradient-to-br from-brown-light to-yellow-900/30'
  },
  'SS': {
    main: 'text-yellow-300',
    border: 'border-yellow-300 border-3',
    shadow: 'rgba(251, 191, 36, 1)',
    background: 'bg-gradient-to-br from-brown-light to-yellow-800/40'
  },
  'SSS': {
    main: 'text-yellow-200',
    border: 'border-yellow-200 border-3',
    shadow: 'rgba(234, 179, 8, 1)',
    background: 'bg-gradient-to-br from-brown-light to-yellow-700/50'
  }
};

// Helper functions to get specific rarity style properties
export const getRarityColor = (rarity?: string): string => {
  if (!rarity || !(rarity as RarityLevel in RARITY_COLORS)) {
    return 'text-white';
  }
  return RARITY_COLORS[rarity as RarityLevel].main;
};

export const getRarityBorder = (rarity?: string): string => {
  if (!rarity || !(rarity as RarityLevel in RARITY_COLORS)) {
    return 'border-ui-dark';
  }
  return RARITY_COLORS[rarity as RarityLevel].border;
};

export const getRarityShadowColor = (rarity?: string): string => {
  if (!rarity || !(rarity as RarityLevel in RARITY_COLORS)) {
    return 'rgba(0, 0, 0, 0)';
  }
  return RARITY_COLORS[rarity as RarityLevel].shadow;
};

export const getRarityBackground = (rarity?: string): string => {
  if (!rarity || !(rarity as RarityLevel in RARITY_COLORS)) {
    return '';
  }
  return RARITY_COLORS[rarity as RarityLevel].background;
}; 