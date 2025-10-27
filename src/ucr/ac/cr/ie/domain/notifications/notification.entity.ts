import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { User } from '../auth/core/user.entity';
import { NotificationAttachment } from './index';

@Entity('notifications')
export class Notification {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ name: 'n_title', length: 150 })
    nTitle: string;

    @Column({ name: 'n_message', type: 'text' })
    nMessage: string;

    @Column({ name: 'n_send_date', type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
    nSendDate: Date;

    @Column({ name: 'n_sent', default: false })
    nSent: boolean;

    @CreateDateColumn({ name: 'create_at' })
    createAt: Date;

    @Column({ name: 'id_sender' })
    idSender: number;

    @ManyToOne(() => User)
    @JoinColumn({ name: 'id_sender' })
    sender: User;

    @OneToMany(() => NotificationAttachment, attachment => attachment.notification)
    attachments: NotificationAttachment[];
}