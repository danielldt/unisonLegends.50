import { Entity, PrimaryGeneratedColumn, Column, OneToMany, CreateDateColumn, UpdateDateColumn, Index, Check } from "typeorm";
import { DungeonWave } from "./DungeonWave";
import { DungeonReward } from "./DungeonReward";

export enum DungeonType {
    NORMAL = "normal",
    ELITE = "elite",
    RAID = "raid",
    EVENT = "event"
}

export enum DungeonDifficulty {
    EASY = "easy",
    NORMAL = "normal",
    HARD = "hard",
    EXPERT = "expert",
    MASTER = "master"
}

export enum DungeonStatus {
    ACTIVE = "active",
    INACTIVE = "inactive",
    MAINTENANCE = "maintenance"
}

@Entity()
export class Dungeon {
    @PrimaryGeneratedColumn("uuid")
    id!: string;

    @Column()
    name!: string;

    @Column()
    description!: string;

    @Index()
    @Column({ default: DungeonType.NORMAL })
    type!: string;

    @Index()
    @Column({ default: DungeonDifficulty.NORMAL })
    difficulty!: string;

    @Index()
    @Column({ default: DungeonStatus.ACTIVE })
    status!: string;

    @Column()
    @Check("minLevel > 0")
    minLevel!: number;

    @Column()
    @Check("maxLevel >= minLevel")
    maxLevel!: number;

    @Column()
    @Check("minPlayers > 0")
    minPlayers!: number;

    @Column()
    @Check("maxPlayers >= minPlayers")
    maxPlayers!: number;

    @Column({ nullable: true })
    requiredTicketId?: string;

    @Column({ default: 180 })
    @Check("timeLimit > 0")
    timeLimit!: number;

    @OneToMany(() => DungeonWave, wave => wave.dungeon, { 
        cascade: true,
        onDelete: "CASCADE"
    })
    waves!: DungeonWave[];

    @OneToMany(() => DungeonReward, reward => reward.dungeon, {
        cascade: true,
        onDelete: "CASCADE"
    })
    rewards!: DungeonReward[];

    @CreateDateColumn()
    createdAt!: Date;

    @UpdateDateColumn()
    updatedAt!: Date;
} 