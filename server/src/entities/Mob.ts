import { Entity, PrimaryGeneratedColumn, Column, OneToMany, CreateDateColumn, UpdateDateColumn, Index } from "typeorm";
import { MobSkillMapping } from "./MobSkillMapping";

export enum MobType {
    NORMAL = "normal",
    ELITE = "elite",
    BOSS = "boss",
    MINI_BOSS = "mini_boss"
}

export enum MobElement {
    NONE = "none",
    FLAME = "flame",
    AQUA = "aqua",
    GALE = "gale",
    TERRA = "terra",
    LIGHT = "light",
    DARK = "dark"
}
export enum MobRace {
    GOBLIN = "goblin",
    ORC = "orc",
    TROLL = "troll",
    DEMON = "demon",
    UNDEAD = "undead",
    MACHINE = "machine",
    FAIRY = "fairy",
    DRAGON = "dragon",
    HUMAN = "human",
    ANIMAL = "animal",
    SLIME = "slime",
    BEAST = "beast",
    ELEMENTAL = "elemental",
    REPTILE = "reptile",
    INSECT = "insect",
    FISH = "fish",
    AMORPH = "amorph",
    NAGA = "naga",
    DEMON_HUMAN = "demon_human",
    DEMON_ANIMAL = "demon_animal",
    DEMON_ELEME = "demon_elemental",
    DEMON_REPTILE = "demon_reptile",
    DEMON_INSECT = "demon_insect",
    DEMON_FISH = "demon_fish",
    DEMON_AMORPH = "demon_amorph",
    DEMON_NAGA = "demon_naga",
}

@Entity()
export class Mob {
    @PrimaryGeneratedColumn("uuid")
    id!: string;

    @Column()
    name!: string;

    @Column()
    description!: string;

    @Index()
    @Column({ default: MobType.NORMAL })
    type!: string;

    @Column({ default: MobElement.NONE })
    element!: string;

    @Column({ default: MobRace.GOBLIN })
    race!: string;

    @Column()
    level!: number;

    // Base Stats
    @Column()
    hp!: number;

    @Column()
    mp!: number;

    @Column()
    str!: number;

    @Column()
    int!: number;

    @Column()
    agi!: number;

    @Column()
    dex!: number;

    @Column()
    luk!: number;

    @Column()
    def!: number;

    // Combat Stats
    @Column({ default: 0 })
    expValue!: number;

    @Column({ default: 0 })
    goldValue!: number;

    // Behavior
    @Column({ default: 100 })
    aggroRange!: number;

    @Column({ default: 200 })
    chaseRange!: number;

    @Column({ default: 50 })
    attackRange!: number;

    @Column({ default: 1.5 })
    attackSpeed!: number;

    // Skills
    @OneToMany(() => MobSkillMapping, mapping => mapping.mob, {
        cascade: true
    })
    skillMappings!: MobSkillMapping[];

    @CreateDateColumn()
    createdAt!: Date;

    @UpdateDateColumn()
    updatedAt!: Date;
} 