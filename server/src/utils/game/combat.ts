// Combat Constants
export const COMBAT_CONSTANTS = {
    MAX_LEVEL: 100,
    MAX_PARTY_SIZE: 4,
    MAX_HIT_RATE: 0.95,
    MAX_DODGE_RATE: 0.75,
    MAX_CRITICAL_RATE: 0.50,
    MAX_CRITICAL_DAMAGE: 3.0,
    BASE_DEFENSE_MULTIPLIER: 0.8
};


// Combat Mechanics
export const calculateHitRate = (
    attacker: { dex: number; luk: number },
    defender: { agi: number }
): number => {
    const hitRate = (attacker.dex * 2 + attacker.luk) / (defender.agi * 1.5);
    return Math.min(COMBAT_CONSTANTS.MAX_HIT_RATE, Math.max(0.05, hitRate));
};

export const calculateDodgeRate = (
    defender: { agi: number; luk: number },
    attacker: { dex: number }
): number => {
    const dodgeRate = (defender.agi * 2 + defender.luk) / (attacker.dex * 1.5);
    return Math.min(COMBAT_CONSTANTS.MAX_DODGE_RATE, Math.max(0, dodgeRate));
};

// Combat Status
export const isHit = (hitRate: number): boolean => {
    return Math.random() < hitRate;
};

export const isDodged = (dodgeRate: number): boolean => {
    return Math.random() < dodgeRate;
};

// Calculate critical hit rate based on LUK stat
export function calculateCriticalRate(entity: { luk: number }): number {
    // Base crit rate is 5% + 0.1% per LUK point
    return Math.min(COMBAT_CONSTANTS.MAX_CRITICAL_RATE, 5 + (entity.luk * 0.1));
}

// Check if an attack is a critical hit
export function isCriticalHit(critRate: number): boolean {
    return Math.random() * 100 < critRate;
} 