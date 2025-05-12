import { Entity, PrimaryGeneratedColumn, ManyToOne, JoinColumn, Column, CreateDateColumn, UpdateDateColumn } from "typeorm";
import { Player } from "./Player";
import { Spell } from "./Spell";

@Entity()
export class PlayerSpell {
    @PrimaryGeneratedColumn("uuid")
    id!: string;

    @ManyToOne(() => Player, player => player.knownSpells)
    @JoinColumn({ name: "player_id" })
    player!: Player;

    @ManyToOne(() => Spell)
    @JoinColumn({ name: "spell_id" })
    spell!: Spell;

    @Column({ default: 1 })
    level!: number;


    @Column({ default: false })
    isEquipped!: boolean;


    @Column({ default: 0 })
    cooldownRemaining!: number;

    @CreateDateColumn()
    createdAt!: Date;

    @UpdateDateColumn()
    updatedAt!: Date;
} 