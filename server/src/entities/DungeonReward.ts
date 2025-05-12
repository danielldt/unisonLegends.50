import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, OneToMany, CreateDateColumn, UpdateDateColumn, Index, Check, Unique } from "typeorm";
import { Dungeon } from "./Dungeon";
import { DungeonRewardItem } from "./DungeonRewardItem";

// Keep enum as reference for valid values, but use string in the entity
export enum RewardType {
    NORMAL = "normal",
    FIRST_CLEAR = "first_clear",
    BONUS = "bonus"
}

@Entity()
@Unique(["dungeon", "type"])
export class DungeonReward {
    @PrimaryGeneratedColumn("uuid")
    id!: string;

    @ManyToOne(() => Dungeon, { onDelete: "CASCADE" })
    @JoinColumn({ name: "dungeon_id" })
    dungeon!: Dungeon;

    @Index()
    @Column({
        default: RewardType.NORMAL
    })
    type!: string;

    @Column()
    @Check("exp >= 0")
    exp!: number;

    @Column()
    @Check("goldMin >= 0")
    goldMin!: number;

    @Column()
    @Check("goldMax >= goldMin")
    goldMax!: number;

    @OneToMany(() => DungeonRewardItem, rewardItem => rewardItem.dungeonReward, {
        cascade: true,
        onDelete: "CASCADE"
    })
    rewardItems!: DungeonRewardItem[];

    @CreateDateColumn()
    createdAt!: Date;

    @UpdateDateColumn()
    updatedAt!: Date;
} 