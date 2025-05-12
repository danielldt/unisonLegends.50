import { Player } from "../../entities/Player";
import { Mob } from "../../entities/Mob";
import { MobSkill } from "../../entities/MobSkill";
import { MobSkillMapping } from "../../entities/MobSkillMapping";
import { calculateCriticalRate, isCriticalHit } from "./combat";

// Weapon types and their primary stats
export enum WeaponType {
    SWORD = "sword",
    SHIELD = "shield",
    DAGGER = "dagger",
    BOW = "bow",
    STAFF = "staff",
    ORB = "orb"
}

// Weapon type to stat mapping
const WEAPON_STAT_MAP = {
    [WeaponType.SWORD]: "str",
    [WeaponType.SHIELD]: "str",
    [WeaponType.DAGGER]: "agi",
    [WeaponType.BOW]: "agi",
    [WeaponType.STAFF]: "int",
    [WeaponType.ORB]: "int"
} as const;

// Calculate total defense from equipment
function calculateTotalDefense(player: Player): number {
    let totalDefense = 0;
    
    // Sum defense from head, body, and leg equipment
    if (player.head) totalDefense += player.head.def;
    if (player.body) totalDefense += player.body.def;
    if (player.legs) totalDefense += player.legs.def;
    
    return totalDefense;
}

// Calculate weapon damage
function calculateWeaponDamage(
    player: Player,
    weaponType: WeaponType,
    baseDamage: number,
    enchantBonus: number = 0,
    spellBuffBonus: number = 0
): number {
    const primaryStat = WEAPON_STAT_MAP[weaponType];
    const statValue = player[primaryStat];
    
    // Base damage + enchant + spell buff + stat scaling
    return baseDamage + enchantBonus + spellBuffBonus + (statValue * 0.5);
}

// Calculate spell damage
function calculateSpellDamage(
    player: Player,
    baseDamage: number,
    spellBuffBonus: number = 0
): number {
    // Spell damage scales with INT
    return baseDamage + spellBuffBonus + (player.int * 0.7);
}

// Calculate mob skill damage
function calculateMobSkillDamage(
    mob: Mob,
    skill: MobSkill,
    skillMapping: MobSkillMapping
): number {
    // Base skill power * power modifier
    return skill.power * skillMapping.powerModifier;
}

// Player attacking player
export function calculatePlayerVsPlayerDamage(
    attacker: Player,
    defender: Player,
    weaponType: WeaponType,
    baseDamage: number,
    enchantBonus: number = 0,
    spellBuffBonus: number = 0
): { damage: number; isCritical: boolean } {
    const attackDamage = calculateWeaponDamage(attacker, weaponType, baseDamage, enchantBonus, spellBuffBonus);
    const defense = calculateTotalDefense(defender);
    
    // Calculate critical hit
    const critRate = calculateCriticalRate(attacker);
    const isCritical = isCriticalHit(critRate);
    const critMultiplier = isCritical ? 2.5 : 1;
    
    // Final damage calculation
    const damage = Math.max(1, Math.floor((attackDamage - defense * 0.5) * critMultiplier));
    
    return { damage, isCritical };
}

// Player attacking mob
export function calculatePlayerVsMobDamage(
    player: Player,
    mob: Mob,
    weaponType: WeaponType,
    baseDamage: number,
    enchantBonus: number = 0,
    spellBuffBonus: number = 0
): { damage: number; isCritical: boolean } {
    const attackDamage = calculateWeaponDamage(player, weaponType, baseDamage, enchantBonus, spellBuffBonus);
    
    // Calculate critical hit
    const critRate = calculateCriticalRate(player);
    const isCritical = isCriticalHit(critRate);
    const critMultiplier = isCritical ? 2.5 : 1;
    
    // Final damage calculation
    const damage = Math.max(1, Math.floor((attackDamage - mob.def * 0.5) * critMultiplier));
    
    return { damage, isCritical };
}

// Mob attacking player
export function calculateMobVsPlayerDamage(
    mob: Mob,
    player: Player,
    skill: MobSkill,
    skillMapping: MobSkillMapping
): { damage: number; isCritical: boolean } {
    const attackDamage = calculateMobSkillDamage(mob, skill, skillMapping);
    const defense = calculateTotalDefense(player);
    
    // Calculate critical hit (mobs have lower crit rate)
    const critRate = calculateCriticalRate(mob);
    const isCritical = isCriticalHit(critRate);
    const critMultiplier = isCritical ? 2.0 : 1;
    
    // Final damage calculation
    const damage = Math.max(1, Math.floor((attackDamage - defense * 0.5) * critMultiplier));
    
    return { damage, isCritical };
}

// Spell damage calculation
export function calculateSpellDamageVsTarget(
    caster: Player,
    target: Player | Mob,
    baseDamage: number,
    spellBuffBonus: number = 0
): { damage: number; isCritical: boolean } {
    const attackDamage = calculateSpellDamage(caster, baseDamage, spellBuffBonus);
    
    // Calculate defense based on target type
    const defense = target instanceof Player ? calculateTotalDefense(target) : target.def;
    
    // Calculate critical hit
    const critRate = calculateCriticalRate(caster);
    const isCritical = isCriticalHit(critRate);
    const critMultiplier = isCritical ? 2.0 : 1;
    
    // Final damage calculation
    const damage = Math.max(1, Math.floor((attackDamage - defense * 0.3) * critMultiplier));
    
    return { damage, isCritical };
} 