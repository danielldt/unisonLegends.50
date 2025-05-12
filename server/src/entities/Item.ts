import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from "typeorm";

export enum ItemType {
    // Weapon
    SWORD = "sword",
    SHIELD = "shield",
    DAGGER = "dagger",
    BOW = "bow",
    STAFF = "staff",
    ORB = "orb",
    
    // Consumables
    POTION = "potion",
    FOOD = "food",
    SCROLL = "scroll",
    
    // Tickets
    DUNGEON_TICKET = "dungeon_ticket",
    EVENT_TICKET = "event_ticket",
    GACHA_TICKET = "gacha_ticket",
    
    // Misc
    QUEST_ITEM = "quest_item",
    CURRENCY = "currency",
    COSMETIC = "cosmetic"
}

export enum ItemCategory {
    // Equipment
    WEAPON = "weapon",
    HEAD = "head",
    BODY = "body",
    LEGS = "legs",
    CONSUMABLE = "consumable",
    TICKET = "ticket",
    MATERIAL = "material",
}
export enum ItemTarget {
    SELF = "self",
    SINGLE_ENEMY = "single_enemy",
    ALL_ENEMIES = "all_enemies",
    SINGLE_ALLY = "single_ally",
    ALL_ALLIES = "all_allies",

}
export enum ItemRarity {
    F = "F",
    E = "E",
    D = "D",
    C = "C",
    B = "B",
    A = "A",
    S = "S",
    SS = "SS",
    SSS = "SSS"
}

@Entity()
export class Item {
    @PrimaryGeneratedColumn("uuid")
    id!: string;

    @Column()
    name!: string;

    @Column()
    description!: string;

    @Column()
    type!: string;

    @Column()
    category!: string;

    @Column({ default: ItemRarity.F })
    rarity!: string;

    @Column({ default: 0 })
    value!: number;

    @Column({ default: true })
    stackable!: boolean;

    @Column({ default: 1 })
    maxStack!: number;

    @Column({ default: false })
    tradeable!: boolean;

    @Column({ default: false })
    sellable!: boolean;

    @Column({ default: 0 })
    dmg!: number;
    
    @Column({ default: 0 })
    def!: number;

    @Column({ nullable: true })
    imageUrl!: string;

    @Column("simple-json")
    stats!: {
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
    };

    @Column()
    target?: string;

    @Column({ nullable: true })
    cooldown?: number;

    @Column("simple-json", { nullable: true })
    consumableEffect?: {
        hp?: number;
        mp?: number;
        duration?: number;
        buffs?: {
            str?: number;
            int?: number;
            agi?: number;
            dex?: number;
            luk?: number;
            duration?: number;
        };
    };

    @Column("simple-json", { nullable: true })
    ticketData?: {
        dungeonId?: string;
        eventId?: string;
        gachaPool?: string;
        expiryDate?: string;
    };

    @Column("simple-json", { nullable: true })
    materialData?: {
        category?: string;
        craftingRecipe?: string[];
        requiredFor?: string[];
    };

    @CreateDateColumn()
    createdAt!: Date;

    @UpdateDateColumn()
    updatedAt!: Date;
} 