import { describe, it, expect, beforeEach, mock } from 'bun:test';
import { NotFoundException } from '@nestjs/common';
import { MemosService } from './memos.service';
import { MemoCategory, MemoStatus, MemoUrgency, MemoVisibility } from '../../domain/memos';

describe('MemosService', () => {
    let service: MemosService;
    let mockMemoRepo: any;
    let mockOlderAdultRepo: any;
    let mockUserRepo: any;
    let mockRoleRepo: any;
    let mockAckRepo: any;
    let mockMailerService: any;
    let mockConfigService: any;

    beforeEach(() => {
        mockMemoRepo = {
            create: mock((dto: any) => ({ id: 1, ...dto, createdAt: new Date(), updatedAt: new Date() })),
            save: mock((entity: any) => Promise.resolve({ id: 1, ...entity })),
            findOne: mock(async () => null),
            find: mock(async () => []),
        };

        mockOlderAdultRepo = {
            findOne: mock(async () => ({ id: 10, oaName: 'Juan', oaFLastName: 'Perez' })),
        };

        mockUserRepo = {
            findOne: mock(async ({ where }: any) => {
                if (where.id === 1) return { id: 1, uName: 'Dr. Carlos', uFLastName: 'Mora', uEmail: 'carlos@example.com', uIsActive: true };
                if (where.id === 2) return { id: 2, uName: 'Lic. Ana', uFLastName: 'Solis', uEmail: 'ana@example.com', uIsActive: true };
                return null;
            }),
            createQueryBuilder: mock(() => ({
                innerJoin: mock().mockReturnThis(),
                where: mock().mockReturnThis(),
                andWhere: mock().mockReturnThis(),
                getMany: mock(async () => []),
            })),
        };

        mockRoleRepo = {
            findOne: mock(async () => ({ id: 5, rName: 'Trabajo Social' })),
        };

        mockAckRepo = {
            findOne: mock(async () => null),
            create: mock((dto: any) => ({ id: 100, ...dto })),
            save: mock((entity: any) => Promise.resolve(entity)),
        };

        mockMailerService = {
            isEnabled: mock(() => true),
            sendMail: mock(async () => ({ success: true, messageId: 'msg-123' })),
        };

        mockConfigService = {
            get: mock((key: string) => {
                if (key === 'FRONTEND_URL') return 'https://sigha.app';
                return null;
            }),
        };

        service = new MemosService(
            mockMemoRepo,
            mockOlderAdultRepo,
            mockUserRepo,
            mockRoleRepo,
            mockAckRepo,
            mockMailerService,
            mockConfigService as any,
        );
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    it('throws NotFoundException when older adult does not exist', async () => {
        mockOlderAdultRepo.findOne = mock(async () => null);
        await expect(
            service.createMemo({ olderAdultId: 999, content: 'Nota de prueba' } as any, 1)
        ).rejects.toThrow(NotFoundException);
    });

    it('creates memo and triggers email notification for target user', async () => {
        mockMemoRepo.findOne = mock(async () => ({
            id: 1,
            olderAdultId: 10,
            authorId: 1,
            targetUserId: 2,
            content: 'Derivacion urgente',
            urgency: MemoUrgency.URGENT,
        }));

        const result = await service.createMemo(
            {
                olderAdultId: 10,
                content: 'Derivacion urgente',
                urgency: MemoUrgency.URGENT,
                targetUserId: 2,
            } as any,
            1
        );

        expect(mockMemoRepo.create).toHaveBeenCalled();
        expect(mockMemoRepo.save).toHaveBeenCalled();
        expect(result.id).toBe(1);

        // Verify async notification triggered
        await new Promise((resolve) => setTimeout(resolve, 80));
        expect(mockMailerService.sendMail).toHaveBeenCalled();
    });

    it('filters out confidential memos for unauthorized users', async () => {
        const memos = [
            { id: 1, olderAdultId: 10, authorId: 1, visibility: MemoVisibility.PUBLIC },
            { id: 2, olderAdultId: 10, authorId: 1, visibility: MemoVisibility.CONFIDENTIAL },
            { id: 3, olderAdultId: 10, authorId: 2, visibility: MemoVisibility.CONFIDENTIAL },
        ];
        mockMemoRepo.find = mock(async () => memos);

        // User 2 (not author of memo 2, non-admin role)
        const visibleForUser2 = await service.getByOlderAdult(10, 2, 'nurse');
        expect(visibleForUser2.map((m: any) => m.id)).toEqual([1, 3]);

        // Director sees all
        const visibleForDirector = await service.getByOlderAdult(10, 3, 'director');
        expect(visibleForDirector.map((m: any) => m.id)).toEqual([1, 2, 3]);
    });

    it('updates status and marks resolved details', async () => {
        const memo = { id: 1, status: MemoStatus.OPEN, resolvedAt: null, resolvedBy: null };
        mockMemoRepo.findOne = mock(async () => memo);

        await service.updateStatus(1, { status: MemoStatus.RESOLVED }, 5);
        expect(memo.status).toBe(MemoStatus.RESOLVED);
        expect(memo.resolvedBy).toBe(5);
        expect(memo.resolvedAt).toBeInstanceOf(Date);
        expect(mockMemoRepo.save).toHaveBeenCalledWith(memo);
    });

    it('acknowledges memo and saves record', async () => {
        mockMemoRepo.findOne = mock(async () => ({ id: 1 }));
        const result = await service.acknowledgeMemo(1, 2, 'Recibido');
        expect(mockAckRepo.create).toHaveBeenCalled();
        expect(result.memoId).toBe(1);
    });
});
