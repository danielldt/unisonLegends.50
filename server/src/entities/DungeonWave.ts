import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn, Index, Check, Unique } from "typeorm";
import { Dungeon } from "./Dungeon";

// Keep enum as reference for valid values, but use string in the entity
export enum WaveType {
    NORMAL = "normal",
    BOSS = "boss"
}

@Entity()
@Unique(["dungeon", "waveNumber"])
export class DungeonWave {
    @PrimaryGeneratedColumn("uuid")
    id!: string;

    @ManyToOne(() => Dungeon, { onDelete: "CASCADE" })
    @JoinColumn({ name: "dungeon_id" })
    dungeon!: Dungeon;

    @Index()
    @Column()
    @Check("waveNumber > 0")
    waveNumber!: number;

    @Index()
    @Column({
        default: WaveType.NORMAL
    })
    type!: string;

    @Column("simple-array")
    @Check("length(mobIds) > 0")
    mobIds!: string[];

    @Column({ default: 180 })
    @Check("timeLimit >= 0")
    timeLimit!: number; // in seconds, 0 means no time limit

    @Column({ default: false })
    isOptional!: boolean;

    @CreateDateColumn()
    createdAt!: Date;

    @UpdateDateColumn()
    updatedAt!: Date;
} 