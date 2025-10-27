import { DataSource } from 'typeorm';
import { Notification, NotificationAttachment } from '../../domain/notifications';

export const notificationProviders = [
    {
        provide: 'NotificationRepository',
        useFactory: (dataSource: DataSource) => dataSource.getRepository(Notification),
        inject: ['DataSource'],
    },
    {
        provide: 'NotificationAttachmentRepository',
        useFactory: (dataSource: DataSource) => dataSource.getRepository(NotificationAttachment),
        inject: ['DataSource'],
    },
];