import { Entity, PrimaryGeneratedColumn, ManyToOne, JoinColumn, Column, CreateDateColumn, UpdateDateColumn } from "typeorm";
import { Player } from "./Player";
import { Item } from "./Item";

@Entity()
export class PlayerItem {
    @PrimaryGeneratedColumn("uuid")
    id!: string;

    @ManyToOne(() => Player, player => player.inventory)
    @JoinColumn({ name: "player_id" })
    player!: Player;

    @ManyToOne(() => Item)
    @JoinColumn({ name: "item_id" })
    item!: Item;

    @Column({ default: 1 })
    quantity!: number;

    @Column({ default: 0 })
    enhancementLevel!: number;

    @Column({ default: false })
    isEquipped!: boolean;

    @CreateDateColumn()
    createdAt!: Date;

    @UpdateDateColumn()
    updatedAt!: Date;
} 