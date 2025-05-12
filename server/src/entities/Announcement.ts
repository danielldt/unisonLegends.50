import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from "typeorm";

export enum AnnouncementType {
    SYSTEM = "system",
    EVENT = "event",
    MAINTENANCE = "maintenance",
    UPDATE = "update",
    PROMOTION = "promotion"
}

export enum AnnouncementPriority {
    LOW = "low",
    MEDIUM = "medium",
    HIGH = "high",
    URGENT = "urgent"
}

export enum AnnouncementStatus {
    DRAFT = "draft",
    SCHEDULED = "scheduled",
    ACTIVE = "active",
    EXPIRED = "expired"
}

@Entity()
export class Announcement {
    @PrimaryGeneratedColumn("uuid")
    id!: string;

    @Column()
    title!: string;

    @Column("text")
    content!: string;

    @Index()
    @Column({ default: AnnouncementType.SYSTEM })
    type!: string;

    @Index()
    @Column({ default: AnnouncementPriority.MEDIUM })
    priority!: string;

    @Index()
    @Column({ default: AnnouncementStatus.DRAFT })
    status!: string;

    @Column({ nullable: true })
    startDate?: Date;

    @Column({ nullable: true })
    endDate?: Date;

    @Column({ default: false })
    isSticky!: boolean;

    @Column({ default: false })
    requiresAcknowledgment!: boolean;

    @CreateDateColumn()
    createdAt!: Date;

    @UpdateDateColumn()
    updatedAt!: Date;
} 