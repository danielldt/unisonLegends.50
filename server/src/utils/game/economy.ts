// Economy Constants
export const ECONOMY_CONSTANTS = {
    BASE_GOLD_MULTIPLIER: 10,
    RANDOM_RANGE_MULTIPLIER: 0.5,
    BOSS_GOLD_MULTIPLIER: 3.5,
    RARE_ITEM_MULTIPLIER: 0.1,
    BOSS_DROP_MULTIPLIER: 2.5,
    MAX_GOLD: 999999999
};

// Gold Calculations
export const calculateBaseGold = (level: number): number => {
    return level * ECONOMY_CONSTANTS.BASE_GOLD_MULTIPLIER;
};

export const calculateRandomGold = (baseGold: number): number => {
    const randomRange = baseGold * ECONOMY_CONSTANTS.RANDOM_RANGE_MULTIPLIER;
    return Math.floor(baseGold + (Math.random() * randomRange));
};

export const calculateBossGold = (baseGold: number): number => {
    return Math.floor(baseGold * ECONOMY_CONSTANTS.BOSS_GOLD_MULTIPLIER);
};

export const calculatePartyGold = (gold: number, partySize: number): number => {
    return Math.floor(gold / partySize);
};

// Drop Rate Calculations
export const calculateBaseDropRate = (luk: number): number => {
    return 1 + (luk * 0.1);
};

export const calculateRareDropRate = (baseRate: number): number => {
    return baseRate * ECONOMY_CONSTANTS.RARE_ITEM_MULTIPLIER;
};

export const calculateBossDropRate = (baseRate: number): number => {
    return baseRate * ECONOMY_CONSTANTS.BOSS_DROP_MULTIPLIER;
};

// Item Drop Check
export const checkItemDrop = (dropRate: number): boolean => {
    return Math.random() < dropRate;
};

// Gold Distribution
export const distributeGold = (
    totalGold: number,
    partySize: number,
    isBoss: boolean = false
): number[] => {
    const baseGold = isBoss 
        ? calculateBossGold(totalGold)
        : calculateRandomGold(totalGold);
    
    const goldPerMember = calculatePartyGold(baseGold, partySize);
    return Array(partySize).fill(goldPerMember);
};

// Economy Validation
export const validateGold = (gold: number): boolean => {
    return gold >= 0 && gold <= ECONOMY_CONSTANTS.MAX_GOLD;
};

// Item Value Calculation
export const calculateItemValue = (
    baseValue: number,
    rarity: number,
    level: number
): number => {
    const rarityMultiplier = 1 + (rarity * 0.5);
    const levelMultiplier = 1 + (level * 0.1);
    return Math.floor(baseValue * rarityMultiplier * levelMultiplier);
}; 