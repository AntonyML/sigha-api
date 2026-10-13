import { describe, it, expect, beforeEach, mock } from 'bun:test';
import { NotificationDispatchService } from './notification-dispatch.service';
import { NotificationStatus } from '../../domain/notifications/notification-status.enum';

function buildService(overrides: {
    pending?: any[];
    findOneImpl?: (id: number) => any;
    saveImpl?: (entity: any) => any;
    withDataSource?: boolean;
    env?: Record<string, string | undefined>;
} = {}) {
    const auditRecords: any[] = [];
    const deletedKeys: string[] = [];
    const saved: any[] = [];
    const store = new Map<number, any>();
    for (const item of overrides.pending ?? []) {
        store.set(item.id, { ...item });
    }

    const pending = overrides.pending ?? [];
    const mockNotificationRepo: any = {
        find: mock(async () => pending.map((p) => ({ ...p }))),
        findOne: mock(async ({ where: { id } }: any) => {
            if (overrides.findOneImpl) {
                return overrides.findOneImpl(id);
            }
            const current = store.get(id);
            return current ? { ...current } : null;
        }),
        save: mock(async (entity: any) => {
            if (overrides.saveImpl) {
                return overrides.saveImpl(entity);
            }
            const updated = { ...entity };
            store.set(entity.id, updated);
            saved.push(updated);
            return updated;
        }),
        manager: undefined,
    };

    const mockManager: any = {
        findOne: mock(async (_entity: any, { where: { id } }: any) => {
            if (overrides.findOneImpl) {
                return overrides.findOneImpl(id);
            }
            const current = store.get(id);
            return current ? { ...current } : null;
        }),
        save: mock(async (entity: any) => {
            if (overrides.saveImpl) {
                return overrides.saveImpl(entity);
            }
            const updated = { ...entity };
            store.set(entity.id, updated);
            saved.push(updated);
            return updated;
        }),
    };

    const mockDataSource: any = overrides.withDataSource
        ? { transaction: mock(async (cb: any) => cb(mockManager)) }
        : undefined;
    const mockLogger: any = {
        log: mock(() => {}),
        error: mock(() => {}),
        warn: mock(() => {}),
        info: mock(() => {}),
        debug: mock(() => {}),
    };
    const mockAudit: any = {
        createDigitalRecord: mock(async (userId: number, record: any) => {
            auditRecords.push({ userId, ...record });
            return {};
        }),
    };
    const mockCache: any = {
        del: mock(async (key: string) => {
            deletedKeys.push(key);
        }),
    };

    const previousEnv = { ...process.env };
    for (const [key, value] of Object.entries(overrides.env ?? {})) {
        if (value === undefined) {
            delete process.env[key];
        } else {
            process.env[key] = value;
        }
    }

    const service = new NotificationDispatchService(
        mockLogger,
        mockNotificationRepo,
        mockAudit,
        mockCache,
        undefined,
        mockDataSource,
    );

    return {
        service,
        mocks: { mockNotificationRepo, mockManager, mockDataSource, mockLogger, mockAudit, mockCache },
        auditRecords,
        deletedKeys,
        saved,
        restoreEnv: () => {
            process.env = previousEnv;
        },
    };
}

describe('NotificationDispatchService - job de envio programado', () => {
    it('marca pendientes vencidas como enviadas, audita e invalida cache', async () => {
        const now = new Date('2026-10-13T12:00:00Z');
        const ctx = buildService({
            pending: [
                { id: 1, nTitle: 'Aviso 1', nSent: false, nStatus: NotificationStatus.PENDING, idSender: 7 },
                { id: 2, nTitle: 'Aviso 2', nSent: false, nStatus: NotificationStatus.FAILED, idSender: 8 },
            ],
            withDataSource: true,
        });

        try {
            const result = await ctx.service.dispatchPendingNotifications(now);
            expect(result).toEqual({ processed: 2, sent: 2, failed: 0, skipped: 0 });
            expect(ctx.saved).toHaveLength(2);
            expect(ctx.saved.every((n) => n.nSent && n.nStatus === NotificationStatus.SENT)).toBe(true);
            expect(ctx.mocks.mockManager.findOne).toHaveBeenCalledWith(
                expect.anything(),
                expect.objectContaining({ where: { id: 1 }, lock: { mode: 'pessimistic_write' } }),
            );
            expect(ctx.auditRecords).toHaveLength(2);
            expect(ctx.deletedKeys).toContain('notifications-unread:7');
            expect(ctx.deletedKeys).toContain('notifications-unread:8');
            expect(ctx.mocks.mockNotificationRepo.find).toHaveBeenCalledWith(
                expect.objectContaining({ order: { nSendDate: 'ASC' }, take: 100 }),
            );
        } finally {
            ctx.restoreEnv();
            ctx.service.onModuleDestroy();
        }
    });

    it('es idempotente: ya enviadas cuentan como skipped sin mutar ni auditar', async () => {
        const ctx = buildService({
            pending: [{ id: 5, nTitle: 'Ya enviada', nSent: false, nStatus: NotificationStatus.PENDING, idSender: 9 }],
            findOneImpl: () => ({ id: 5, nSent: true, nStatus: NotificationStatus.SENT, idSender: 9 }),
            withDataSource: true,
        });

        try {
            const result = await ctx.service.dispatchPendingNotifications();
            expect(result).toEqual({ processed: 1, sent: 0, failed: 0, skipped: 1 });
            expect(ctx.mocks.mockManager.save).not.toHaveBeenCalled();
            expect(ctx.auditRecords).toHaveLength(0);
            expect(ctx.deletedKeys).toHaveLength(0);
        } finally {
            ctx.restoreEnv();
            ctx.service.onModuleDestroy();
        }
    });

    it('un fallo en un item no bloquea el resto y queda pendiente para reintento', async () => {
        const ctx = buildService({
            pending: [
                { id: 11, nTitle: 'Falla', nSent: false, nStatus: NotificationStatus.PENDING, idSender: 3 },
                { id: 12, nTitle: 'OK', nSent: false, nStatus: NotificationStatus.PENDING, idSender: 4 },
            ],
            saveImpl: (entity: any) => {
                if (entity.id === 11) {
                    throw new Error('DB caida');
                }
                return { ...entity };
            },
        });

        try {
            const result = await ctx.service.dispatchPendingNotifications();
            expect(result).toEqual({ processed: 2, sent: 1, failed: 1, skipped: 0 });
            expect(ctx.auditRecords.map((r) => r.recordId)).toEqual([12]);
            expect(ctx.deletedKeys).toEqual(['notifications-unread:4']);
        } finally {
            ctx.restoreEnv();
            ctx.service.onModuleDestroy();
        }
    });

    it('respeta batch size configurado por entorno', async () => {
        const pending = Array.from({ length: 5 }, (_, i) => ({
            id: 100 + i,
            nTitle: `Aviso ${i}`,
            nSent: false,
            nStatus: NotificationStatus.PENDING,
            idSender: 1,
        }));
        const ctx = buildService({
            pending,
            env: { NOTIFICATION_DISPATCH_BATCH_SIZE: '2', NOTIFICATION_DISPATCH_INTERVAL_MS: '1000' },
        });

        try {
            const result = await ctx.service.dispatchPendingNotifications();
            expect(result.processed).toBe(5);
            expect(ctx.mocks.mockNotificationRepo.find).toHaveBeenCalledWith(
                expect.objectContaining({ take: 2 }),
            );
        } finally {
            ctx.restoreEnv();
            ctx.service.onModuleDestroy();
        }
    });

    it('no programa timer deshabilitado y limpia al destruir', async () => {
        const disabled = buildService({ env: { NOTIFICATION_DISPATCH_ENABLED: 'false' } });
        try {
            disabled.service.onModuleInit();
            expect(disabled.mocks.mockLogger.log).toHaveBeenCalled();
        } finally {
            disabled.restoreEnv();
            disabled.service.onModuleDestroy();
        }

        const enabled = buildService({ env: { NOTIFICATION_DISPATCH_ENABLED: 'true' } });
        try {
            enabled.service.onModuleInit();
            enabled.service.onModuleDestroy();
        } finally {
            enabled.restoreEnv();
        }
    });
});
