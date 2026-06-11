import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { User } from '../auth/core/user.entity';
import { NotificationAttachment } from './index';

export enum NotificationStatus {
    PENDING = 'pending',
    SENT = 'sent',
    FAILED = 'failed',
    READ = 'read',
}

@Entity('notifications')
export class Notification {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ name: 'n_title', length: 150, nullable: false })
    nTitle: string;

    @Column({ name: 'n_message', type: 'text', nullable: false })
    nMessage: string;

    @Column({ name: 'n_send_date', type: 'timestamptz', nullable: false, default: () => 'CURRENT_TIMESTAMP' })
    nSendDate: Date;

    @Column({ name: 'n_sent', nullable: false, default: false })
    nSent: boolean;

    @Column({
        name: 'n_status',
        type: 'enum',
        enum: NotificationStatus,
        nullable: false,
        default: NotificationStatus.PENDING,
    })
    nStatus: NotificationStatus;

    @CreateDateColumn({ name: 'create_at' })
    createAt: Date;

    @Column({ name: 'id_sender', nullable: false })
    idSender: number;

    @ManyToOne(() => User)
    @JoinColumn({ name: 'id_sender' })
    sender: User;

    @OneToMany(() => NotificationAttachment, attachment => attachment.notification)
    attachments: NotificationAttachment[];

    constructor(
        id?: number,
        nTitle?: string,
        nMessage?: string,
        nSendDate?: Date,
        nSent?: boolean,
        nStatus?: NotificationStatus,
        createAt?: Date,
        idSender?: number,
    ) {
        this.id = id;
        this.nTitle = nTitle;
        this.nMessage = nMessage;
        this.nSendDate = nSendDate || new Date();
        this.nSent = nSent !== undefined ? nSent : false;
        this.nStatus = nStatus || NotificationStatus.PENDING;
        this.createAt = createAt || new Date();
        this.idSender = idSender;
    }
}