import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn, Index } from "typeorm";
import { Mob } from "./Mob";
import { MobSkill } from "./MobSkill";

@Entity()
export class MobSkillMapping {
    @PrimaryGeneratedColumn("uuid")
    id!: string;

    @ManyToOne(() => Mob, { onDelete: "CASCADE" })
    @JoinColumn({ name: "mob_id" })
    mob!: Mob;

    @ManyToOne(() => MobSkill, { onDelete: "CASCADE" })
    @JoinColumn({ name: "skill_id" })
    skill!: MobSkill;

    @Column({ default: 0 })
    cooldownModifier!: number; // Can be negative to reduce cooldown

    @Column({ default: 1 })
    powerModifier!: number; // Multiplier for skill power

    @Column({ default: 0 })
    mpCostModifier!: number; // Can be negative to reduce MP cost

    @Column({ default: 0 })
    castTimeModifier!: number; // Can be negative to reduce cast time

    @Column("simple-json", { nullable: true })
    customEffects?: {
        type: string;
        value: number;
        duration?: number;
        chance?: number;
    }[];

    @Column({ default: 0 })
    priority!: number; // Higher priority skills are used first


    @Column({ nullable: true })
    @Index()
    requiredHpThreshold?: number; // HP percentage to use skill

    @Column({ nullable: true })
    @Index()
    requiredMpThreshold?: number; // MP percentage to use skill

    @Column({ default: true })
    isEnabled!: boolean;

    @CreateDateColumn()
    createdAt!: Date;

    @UpdateDateColumn()
    updatedAt!: Date;
} 