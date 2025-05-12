import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, OneToMany, CreateDateColumn, UpdateDateColumn } from "typeorm";
import { Item } from "./Item";
import { Spell } from "./Spell";
import { PlayerItem } from "./PlayerItem";
import { PlayerSpell } from "./PlayerSpell";

export enum UserType {
    PLAYER = "player",
    MODERATOR = "moderator",
    ADMIN = "admin"
}

export enum AccountStatus {
    ACTIVE = "active",
    PENDING = "pending",
    BANNED = "banned",
    SUSPENDED = "suspended"
}

@Entity()
export class Player {
    @PrimaryGeneratedColumn("uuid")
    id!: string;

    @Column({ unique: true })
    username!: string;

    @Column({ unique: true })
    email!: string;

    @Column()
    passwordHash!: string;

    @Column({ default: UserType.PLAYER })
    userType!: string;

    @Column({ default: AccountStatus.PENDING })
    status!: string;

    @Column({ nullable: true })
    lastLoginAt?: Date;

    @Column({ nullable: true })
    banReason?: string;

    @Column({ nullable: true })
    banExpiresAt?: Date;

    @Column({ default: 0 })
    loginAttempts!: number;

    @Column({ nullable: true })
    lastLoginAttemptAt?: Date;

    @Column({ default: true })//set for now
    isEmailVerified!: boolean;

    @Column({ nullable: true })
    emailVerificationToken?: string;

    @Column({ nullable: true })
    passwordResetToken?: string;

    @Column({ nullable: true })
    passwordResetExpiresAt?: Date;

    // Game Stats
    @Column({ default: 1 })
    level!: number;

    @Column({ default: 0 })
    exp!: number;

    @Column({ default: 500 })
    gold!: number;

    @Column({ default: 0 })
    diamond!: number;

    @Column({ default: 100 })
    hp!: number;

    @Column({ default: 100 })
    maxHp!: number;

    @Column({ default: 50 })
    mp!: number;

    @Column({ default: 50 })
    maxMp!: number;
    @Column({ default: 10 })
    statPoints!: number;
    // Character Stats
    @Column({ default: 5 })
    str!: number;

    @Column({ default: 5 })
    int!: number;

    @Column({ default: 5 })
    agi!: number;

    @Column({ default: 5 })
    dex!: number;

    @Column({ default: 5 })
    luk!: number;

    // Game Progress
    @Column({ default: 0 })
    totalPlayTime!: number;

    @Column({ default: 0 })
    totalKills!: number;

    @Column({ default: 0 })
    totalDeaths!: number;

    @Column({ default: 0 })
    totalDungeonsCleared!: number;

    @Column({ default: 0 })
    totalQuestsCompleted!: number;

    // Equipment slots
    @ManyToOne(() => Item)
    @JoinColumn({ name: "weapon1_id" })
    weapon1?: Item | null;

    @ManyToOne(() => Item)
    @JoinColumn({ name: "weapon2_id" })
    weapon2?: Item | null;

    @ManyToOne(() => Item)
    @JoinColumn({ name: "weapon3_id" })
    weapon3?: Item | null;

    @ManyToOne(() => Item)
    @JoinColumn({ name: "weapon4_id" })
    weapon4?: Item | null;

    @ManyToOne(() => Item)
    @JoinColumn({ name: "weapon5_id" })
    weapon5?: Item | null;

    @ManyToOne(() => Item)
    @JoinColumn({ name: "head_id" })
    head?: Item | null;

    @ManyToOne(() => Item)
    @JoinColumn({ name: "body_id" })
    body?: Item | null;

    @ManyToOne(() => Item)
    @JoinColumn({ name: "legs_id" })
    legs?: Item | null;

    // Spell slots
    @ManyToOne(() => Spell)
    @JoinColumn({ name: "spell1_id" })
    spell1?: Spell | null;

    @ManyToOne(() => Spell)
    @JoinColumn({ name: "spell2_id" })
    spell2?: Spell | null;

    @ManyToOne(() => Spell)
    @JoinColumn({ name: "spell3_id" })
    spell3?: Spell | null;

    @ManyToOne(() => Spell)
    @JoinColumn({ name: "spell4_id" })
    spell4?: Spell | null;

    @ManyToOne(() => Spell)
    @JoinColumn({ name: "spell5_id" })
    spell5?: Spell | null;

    // Inventory and known spells
    @OneToMany(() => PlayerItem, playerItem => playerItem.player)
    inventory!: PlayerItem[];

    @OneToMany(() => PlayerSpell, playerSpell => playerSpell.player)
    knownSpells!: PlayerSpell[];

    @CreateDateColumn()
    createdAt!: Date;

    @UpdateDateColumn()
    updatedAt!: Date;
} 