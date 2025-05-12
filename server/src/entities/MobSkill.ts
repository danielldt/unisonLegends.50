import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn, Index, Check } from "typeorm";
import { Mob } from "./Mob";

// Keep enums as reference for valid values, but use strings in the entity
export enum SkillType {
    ATTACK = "attack",
    BUFF = "buff",
    DEBUFF = "debuff",
    HEAL = "heal",
    SUMMON = "summon",
    UTILITY = "utility"
}

export enum SkillTarget {
    SELF = "self",
    SINGLE_ENEMY = "single_enemy",
    ALL_ENEMIES = "all_enemies",
    SINGLE_ALLY = "single_ally",
    ALL_ALLIES = "all_allies",
    RANDOM_ENEMY = "random_enemy",
    RANDOM_ALLY = "random_ally"
}

export enum SkillElement {
    NONE = "none",
    FLAME = "flame",
    AQUA = "aqua",
    GALE = "gale",
    TERRA = "terra",
    LIGHT = "light",
    DARK = "dark"
}

@Entity()
export class MobSkill {
    @PrimaryGeneratedColumn("uuid")
    id!: string;

    @Column()
    name!: string;

    @Column()
    description!: string;

    @Index()
    @Column({

        default: SkillType.ATTACK
    })
    type!: string;

    @Column({

        default: SkillTarget.SINGLE_ENEMY
    })
    target!: string;

    @Column({

        default: SkillElement.NONE
    })
    element!: string;

    @Column()
    @Check("power >= 0")
    power!: number;

    @Column()
    @Check("cooldown >= 0")
    cooldown!: number;

    @Column()
    @Check("castTime >= 0")
    castTime!: number;

    @Column("simple-json")
    effects!: {
        type: string;
        value: number;
        duration?: number;
        chance?: number;
    }[];

    @Column({ default: false })
    isPassive!: boolean;

    @Column({ default: false })
    isUltimate!: boolean;

    @Column({ nullable: true })
    @Check("requiredHpThreshold > 0 AND requiredHpThreshold <= 100")
    requiredHpThreshold?: number;

    @Column({ nullable: true })
    @Check("requiredMpThreshold > 0 AND requiredMpThreshold <= 100")
    requiredMpThreshold?: number;

    @Column({ nullable: true })
    imageUrl?: string;

    @ManyToOne(() => Mob, { onDelete: "CASCADE" })
    @JoinColumn({ name: "mob_id" })
    mob!: Mob;

    @CreateDateColumn()
    createdAt!: Date;

    @UpdateDateColumn()
    updatedAt!: Date;
} 