import { describe, it, expect, beforeEach, mock } from 'bun:test';
import { NotificationService } from './notification.service';
import { NotificationStatus } from '../../domain/notifications/notification-status.enum';

describe('NotificationService - Cache de notificaciones', () => {
    let service: NotificationService;
    let mockLogger: any;
    let mockNotificationRepo: any;
    let mockAttachmentRepo: any;
    let mockAuditService: any;
    let mockCacheManager: any;
    let deletedKeys: string[];
    let cacheStore: Map<string, any>;

    beforeEach(() => {
        deletedKeys = [];
        cacheStore = new Map<string, any>();

        mockLogger = {
            error: mock(() => {}),
            info: mock(() => {}),
            warn: mock(() => {}),
            debug: mock(() => {}),
        };

        mockNotificationRepo = {
            create: mock((data: any) => ({ id: 10, ...data })),
            save: mock((data: any) => Promise.resolve({ id: data.id || 10, ...data })),
            findOne: mock(({ where: { id } }: any) => {
                if (id === 1) {
                    return Promise.resolve({
                        id: 1,
                        nTitle: 'Aviso importante',
                        nMessage: 'Detalle del aviso',
                        idSender: 42,
                        nStatus: NotificationStatus.PENDING,
                    });
                }
                return Promise.resolve(null);
            }),
            find: mock(() => Promise.resolve([
                { id: 1, nTitle: 'Aviso', nStatus: NotificationStatus.PENDING, idSender: 42 },
            ])),
            remove: mock((entity: any) => Promise.resolve(entity)),
            createQueryBuilder: mock(() => ({
                leftJoinAndSelect: mock().mockReturnThis(),
                andWhere: mock().mockReturnThis(),
                orderBy: mock().mockReturnThis(),
                skip: mock().mockReturnThis(),
                take: mock().mockReturnThis(),
                getManyAndCount: mock(() => Promise.resolve([[], 0])),
            })),
        };

        mockAttachmentRepo = {
            create: mock((data: any) => data),
            save: mock((data: any) => Promise.resolve(data)),
            delete: mock(() => Promise.resolve({ affected: 1 })),
        };

        mockAuditService = {
            createDigitalRecord: mock(() => Promise.resolve({})),
        };

        mockCacheManager = {
            get: mock(async (key: string) => cacheStore.get(key)),
            set: mock(async (key: string, value: any, ttl?: number) => {
                cacheStore.set(key, value);
            }),
            del: mock(async (key: string) => {
                deletedKeys.push(key);
                cacheStore.delete(key);
            }),
        };

        service = new NotificationService(
            mockLogger,
            mockNotificationRepo,
            mockAttachmentRepo,
            mockAuditService,
            mockCacheManager,
        );
    });

    describe('getUnreadForUser', () => {
        it('debe obtener notificaciones de la base de datos y guardarlas en caché con clave específica del usuario', async () => {
            const userId = 42;
            const result = await service.getUnreadForUser(userId, 5);

            expect(result).toHaveLength(1);
            expect(mockNotificationRepo.find).toHaveBeenCalledTimes(1);
            expect(cacheStore.has(`notifications-unread:${userId}`)).toBe(true);
            expect(mockCacheManager.set).toHaveBeenCalledTimes(1);
        });

        it('debe servir datos directamente desde la caché si ya existen sin consultar la base de datos', async () => {
            const userId = 42;
            const cachedList = [{ id: 99, nTitle: 'En cache', nStatus: NotificationStatus.PENDING, idSender: 42 }];
            cacheStore.set(`notifications-unread:${userId}`, cachedList);

            const result = await service.getUnreadForUser(userId);

            expect(result).toEqual(cachedList as any);
            expect(mockNotificationRepo.find).toHaveBeenCalledTimes(0);
        });

        it('debe devolver arreglo vacío si el userId es 0 o inválido sin consultar la base de datos', async () => {
            const result = await service.getUnreadForUser(0);
            expect(result).toEqual([]);
            expect(mockNotificationRepo.find).toHaveBeenCalledTimes(0);
        });
    });

    describe('invalidación de caché por usuario en mutaciones', () => {
        it('create debe invalidar la clave del usuario creador y nunca usar comodines (*)', async () => {
            const userId = 42;
            await service.create({
                nTitle: 'Nuevo aviso',
                nMessage: 'Mensaje de prueba',
            } as any, userId);

            expect(deletedKeys).toContain(`notifications-unread:${userId}`);
            expect(deletedKeys.some(k => k.includes('*'))).toBe(false);
        });

        it('update debe invalidar tanto al usuario editor como al remitente de la notificación', async () => {
            const editorUserId = 88;
            await service.update(1, { nTitle: 'Título editado' } as any, editorUserId);

            expect(deletedKeys).toContain(`notifications-unread:${editorUserId}`);
            expect(deletedKeys).toContain(`notifications-unread:42`); // idSender de la notificación 1
            expect(deletedKeys.some(k => k.includes('*'))).toBe(false);
        });

        it('markAsRead debe invalidar la caché del usuario que lee y del remitente', async () => {
            const readerUserId = 77;
            await service.markAsRead(1, readerUserId);

            expect(deletedKeys).toContain(`notifications-unread:${readerUserId}`);
            expect(deletedKeys).toContain(`notifications-unread:42`);
            expect(deletedKeys.some(k => k.includes('*'))).toBe(false);
        });

        it('remove debe invalidar la caché del usuario que elimina y del remitente', async () => {
            const deleterUserId = 99;
            await service.remove(1, deleterUserId);

            expect(deletedKeys).toContain(`notifications-unread:${deleterUserId}`);
            expect(deletedKeys).toContain(`notifications-unread:42`);
            expect(deletedKeys.some(k => k.includes('*'))).toBe(false);
        });
    });
});
