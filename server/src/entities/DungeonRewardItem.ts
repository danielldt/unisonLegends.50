import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn, Index, Check } from "typeorm";
import { DungeonReward } from "./DungeonReward";
import { Item } from "./Item";

@Entity()
export class DungeonRewardItem {
    @PrimaryGeneratedColumn("uuid")
    id!: string;

    @ManyToOne(() => DungeonReward, { onDelete: "CASCADE" })
    @JoinColumn({ name: "dungeon_reward_id" })
    dungeonReward!: DungeonReward;

    @ManyToOne(() => Item, { onDelete: "CASCADE" })
    @JoinColumn({ name: "item_id" })
    item!: Item;

    @Column("decimal", { precision: 5, scale: 2 })
    @Check("chance >= 0 AND chance <= 100")
    chance!: number; // 0.00 to 100.00

    @Column()
    @Check("minQuantity > 0")
    minQuantity!: number;

    @Column()
    @Check("maxQuantity >= minQuantity")
    maxQuantity!: number;

    @Index()
    @Column({ default: false })
    isGuaranteed!: boolean;

    @Column({ nullable: true })
    @Check("requiredLevel > 0")
    requiredLevel?: number;

    @Column({ nullable: true })
    @Check("requiredClearCount > 0")
    requiredClearCount?: number;

    @CreateDateColumn()
    createdAt!: Date;

    @UpdateDateColumn()
    updatedAt!: Date;
} 