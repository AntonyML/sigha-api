import { beforeEach, describe, expect, it } from 'bun:test';
import { ConflictException } from '@nestjs/common';
import { runWithTenantContext } from '../../common/tenant/tenant-context';
import { NursingRoundsService } from './nursing-rounds.service';

describe('NursingRoundsService', () => {
    let service: NursingRoundsService;
    let manager: { query: (sql: string, parameters?: unknown[]) => Promise<unknown[]> };
    let roundRepository: any;
    let olderAdultRepository: any;
    let saveCalls: number;

    beforeEach(() => {
        saveCalls = 0;
        manager = { query: async () => [] };
        roundRepository = {
            manager,
            create: (value: any) => ({ ...value }),
            save: async (value: any) => { saveCalls += 1; return { ...value, id: 8 }; },
        };
        olderAdultRepository = { findOne: async () => ({ id: 4 }) };
        service = new NursingRoundsService(roundRepository, olderAdultRepository);
    });

    const withTenant = <T>(callback: () => T): T => runWithTenantContext({
        tenantId: 7,
        userId: 22,
        manager: {} as any,
        queryRunner: {} as any,
    }, callback);

    const dto = {
        idOlderAdult: 4,
        shift: 'morning' as const,
        generalCondition: 'Estable',
    };

    it('registra al profesional autenticado en la ronda', async () => {
        const saved = await withTenant(() => service.recordRound(dto, 22));
        expect(saved.id).toBe(8);
        expect(saved.idStaff).toBe(22);
    });

    it('suspende las rondas de planta durante una ausencia temporal', async () => {
        manager.query = async () => [{ '?column?': 1 }];
        await expect(withTenant(() => service.recordRound(dto, 22))).rejects.toThrow(ConflictException);
        expect(saveCalls).toBe(0);
    });
});
