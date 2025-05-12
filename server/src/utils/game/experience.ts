// Experience Constants
export const EXP_CONSTANTS = {
    MAX_LEVEL: 100,
    BASE_EXP_MULTIPLIER: 100,
    LEVEL_MULTIPLIER: 1.5,
    PARTY_BONUS_PER_MEMBER: 0.1,
    MAX_PARTY_BONUS: 0.3,
    EXP_PENALTY_LEVEL_DIFF: 10
};

// Experience Calculations
export const calculateBaseExp = (level: number): number => {
    return level * EXP_CONSTANTS.BASE_EXP_MULTIPLIER;
};

export const calculateLevelMultiplier = (level: number): number => {
    return Math.pow(EXP_CONSTANTS.LEVEL_MULTIPLIER, level - 1);
};

export const calculatePartyBonus = (partySize: number): number => {
    const bonus = 1 + (partySize * EXP_CONSTANTS.PARTY_BONUS_PER_MEMBER);
    return Math.min(1 + EXP_CONSTANTS.MAX_PARTY_BONUS, bonus);
};

export const calculateRequiredExp = (level: number): number => {
    const baseExp = calculateBaseExp(level);
    const multiplier = calculateLevelMultiplier(level);
    return Math.floor(baseExp * multiplier);
};

export const calculateExpGain = (
    mobLevel: number,
    playerLevel: number,
    partySize: number = 1
): number => {
    // Calculate base experience
    const baseExp = calculateBaseExp(mobLevel);
    
    // Apply level multiplier
    const multiplier = calculateLevelMultiplier(mobLevel);
    
    // Apply party bonus
    const partyBonus = calculatePartyBonus(partySize);
    
    // Calculate level difference penalty
    const levelDiff = Math.abs(mobLevel - playerLevel);
    const levelPenalty = levelDiff > EXP_CONSTANTS.EXP_PENALTY_LEVEL_DIFF
        ? Math.max(0.1, 1 - (levelDiff - EXP_CONSTANTS.EXP_PENALTY_LEVEL_DIFF) * 0.1)
        : 1;
    
    return Math.floor(baseExp * multiplier * partyBonus * levelPenalty);
};

// Level Up Check
export const checkLevelUp = (currentExp: number, currentLevel: number): boolean => {
    if (currentLevel >= EXP_CONSTANTS.MAX_LEVEL) return false;
    const requiredExp = calculateRequiredExp(currentLevel);
    return currentExp >= requiredExp;
};

// Level Progress
export const calculateLevelProgress = (currentExp: number, currentLevel: number): number => {
    const currentLevelExp = calculateRequiredExp(currentLevel);
    const nextLevelExp = calculateRequiredExp(currentLevel + 1);
    const expForNextLevel = nextLevelExp - currentLevelExp;
    const currentLevelProgress = currentExp - currentLevelExp;
    
    return (currentLevelProgress / expForNextLevel) * 100;
}; 