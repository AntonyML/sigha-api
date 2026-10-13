import { describe, it, expect, beforeEach, mock } from 'bun:test';
import { NotFoundException } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { NotificationStatus } from '../../domain/notifications/notification-status.enum';

describe('NotificationService - Concurrencia y Transacciones en markAsRead', () => {
    let service: NotificationService;
    let mockLogger: any;
    let mockNotificationRepo: any;
    let mockAttachmentRepo: any;
    let mockAuditService: any;
    let mockCacheManager: any;
    let mockDataSource: any;
    let mockManager: any;
    let auditRecords: any[];
    let deletedKeys: string[];

    beforeEach(() => {
        auditRecords = [];
        deletedKeys = [];

        mockLogger = {
            error: mock(() => {}),
            info: mock(() => {}),
            warn: mock(() => {}),
            debug: mock(() => {}),
        };

        mockNotificationRepo = {
            create: mock((data: any) => ({ id: 1, ...data })),
            save: mock((data: any) => Promise.resolve({ id: data.id || 1, ...data })),
            findOne: mock(() => Promise.resolve(null)),
            find: mock(() => Promise.resolve([])),
            remove: mock((entity: any) => Promise.resolve(entity)),
        };

        mockAttachmentRepo = {
            create: mock((data: any) => data),
            save: mock((data: any) => Promise.resolve(data)),
            delete: mock(() => Promise.resolve({ affected: 1 })),
        };

        mockAuditService = {
            createDigitalRecord: mock((userId: number, record: any) => {
                auditRecords.push({ userId, ...record });
                return Promise.resolve({});
            }),
        };

        mockCacheManager = {
            get: mock(async () => null),
            set: mock(async () => {}),
            del: mock(async (key: string) => {
                deletedKeys.push(key);
            }),
        };

        mockManager = {
            findOne: mock(),
            save: mock((entity: any) => Promise.resolve({ ...entity })),
        };

        mockDataSource = {
            transaction: mock(async (callback: (mgr: any) => Promise<any>) => {
                return await callback(mockManager);
            }),
        };

        service = new NotificationService(
            mockLogger,
            mockNotificationRepo,
            mockAttachmentRepo,
            mockAuditService,
            mockCacheManager,
            mockDataSource,
        );
    });

    it('debe ejecutar markAsRead dentro de una transacción con bloqueo pesimista (pessimistic_write)', async () => {
        const initialNotification = {
            id: 10,
            nTitle: 'Aviso urgente',
            nMessage: 'Favor revisar',
            idSender: 5,
            nStatus: NotificationStatus.PENDING,
        };

        mockManager.findOne.mockResolvedValue({ ...initialNotification });

        const result = await service.markAsRead(10, 99);

        expect(mockDataSource.transaction).toHaveBeenCalledTimes(1);
        expect(mockManager.findOne).toHaveBeenCalledWith(
            expect.anything(),
            expect.objectContaining({
                where: { id: 10 },
                lock: { mode: 'pessimistic_write' },
            }),
        );
        expect(mockManager.save).toHaveBeenCalledTimes(1);
        expect(result.nStatus).toBe(NotificationStatus.READ);
        expect(auditRecords).toHaveLength(1);
        expect(auditRecords[0].recordId).toBe(10);
        expect(auditRecords[0].description).toContain('marcada como leída');
        expect(deletedKeys).toContain('notifications-unread:99');
        expect(deletedKeys).toContain('notifications-unread:5');
    });

    it('debe ser idempotente si la notificación ya estaba en estado READ (evita escrituras y auditorías redundantes)', async () => {
        const alreadyReadNotification = {
            id: 20,
            nTitle: 'Aviso ya procesado',
            nMessage: 'Sin cambios',
            idSender: 8,
            nStatus: NotificationStatus.READ,
        };

        mockManager.findOne.mockResolvedValue({ ...alreadyReadNotification });

        const result = await service.markAsRead(20, 99);

        expect(mockDataSource.transaction).toHaveBeenCalledTimes(1);
        expect(mockManager.save).not.toHaveBeenCalled();
        expect(auditRecords).toHaveLength(0);
        expect(deletedKeys).toHaveLength(0);
        expect(result.nStatus).toBe(NotificationStatus.READ);
    });

    it('debe lanzar NotFoundException si la notificación no existe en la transacción', async () => {
        mockManager.findOne.mockResolvedValue(null);

        expect(service.markAsRead(999, 1)).rejects.toThrow(NotFoundException);
        expect(mockManager.save).not.toHaveBeenCalled();
        expect(auditRecords).toHaveLength(0);
    });

    it('debe manejar concurrencia secuencializando llamadas sobre la misma fila sin duplicar efectos', async () => {
        // Simular bloqueo pesimista a nivel de fila (la segunda transacción espera a que la primera termine)
        let currentStatus = NotificationStatus.PENDING;
        let callCount = 0;
        let lockQueue: Promise<any> = Promise.resolve();

        mockDataSource.transaction = mock((callback: (mgr: any) => Promise<any>) => {
            const runInLock = lockQueue.then(async () => {
                callCount++;
                const mgr = {
                    findOne: mock(async () => ({
                        id: 30,
                        nTitle: 'Notificación concurrente',
                        nMessage: 'Test',
                        idSender: 2,
                        nStatus: currentStatus,
                    })),
                    save: mock(async (entity: any) => {
                        currentStatus = entity.nStatus;
                        return { ...entity };
                    }),
                };
                return await callback(mgr);
            });
            lockQueue = runInLock.catch(() => {});
            return runInLock;
        });

        // Dos llamadas concurrentes
        const [res1, res2] = await Promise.all([
            service.markAsRead(30, 100),
            service.markAsRead(30, 101),
        ]);

        expect(res1.nStatus).toBe(NotificationStatus.READ);
        expect(res2.nStatus).toBe(NotificationStatus.READ);
        // Ambos ejecutaron en transacción
        expect(callCount).toBe(2);
        // Pero solo el primero mutó y creó registro de auditoría, el segundo detectó READ y fue idempotente
        expect(auditRecords).toHaveLength(1);
    });

    it('debe funcionar con fallback cuando DataSource no está inyectado', async () => {
        const fallbackService = new NotificationService(
            mockLogger,
            mockNotificationRepo,
            mockAttachmentRepo,
            mockAuditService,
            mockCacheManager,
            undefined, // Sin DataSource
        );

        const pendingNotif = {
            id: 40,
            nTitle: 'Fallback test',
            idSender: 3,
            nStatus: NotificationStatus.PENDING,
        };

        mockNotificationRepo.findOne.mockResolvedValue({ ...pendingNotif });

        const result = await fallbackService.markAsRead(40, 15);

        expect(result.nStatus).toBe(NotificationStatus.READ);
        expect(mockNotificationRepo.save).toHaveBeenCalledTimes(1);
        expect(auditRecords).toHaveLength(1);
    });
});
