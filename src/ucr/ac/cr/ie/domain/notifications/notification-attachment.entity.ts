import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Notification } from './index';

@Entity('notification_attachment')
export class NotificationAttachment {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ name: 'na_file_name', length: 150 })
    naFileName: string;

    @Column({ name: 'na_file_path', length: 255 })
    naFilePath: string;

    @Column({ name: 'na_file_mime_type', length: 100 })
    naFileMimeType: string;

    @Column({ name: 'na_file_size_kb' })
    naFileSizeKb: number;

    @Column({ name: 'id_notification' })
    idNotification: number;

    @ManyToOne(() => Notification, notification => notification.attachments)
    @JoinColumn({ name: 'id_notification' })
    notification: Notification;
}