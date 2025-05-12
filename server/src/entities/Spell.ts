import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from "typeorm";

export enum SpellType {
    HEAL = "heal",
    BUFF = "buff",
    DEBUFF = "debuff",
    ATTACK = "attack",
    UTILITY = "utility"
}

export enum SpellElement {
    FLAME = "flame",
    AQUA = "aqua",
    GALE = "gale",
    TERRA = "terra",
    ETHER = "ether"
}
export enum SpellTarget {
    SELF = "self",
    SINGLE_ENEMY = "single_enemy",
    ALL_ENEMIES = "all_enemies",
    SINGLE_ALLY = "single_ally",
    ALL_ALLIES = "all_allies",

}

@Entity()
export class Spell {
    @PrimaryGeneratedColumn("uuid")
    id!: string;

    @Column()
    name!: string;

    @Column()
    type!: string;

    @Column()
    element!: string;

    @Column()
    power!: number;

    @Column()
    cooldown!: number;

    @Column()
    mpCost!: number;

    @Column({ nullable: true })
    imageUrl!: string;

    @Column()
    target!: string;

    @Column("simple-json")
    effects!: {
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

    @CreateDateColumn()
    createdAt!: Date;

    @UpdateDateColumn()
    updatedAt!: Date;
} 