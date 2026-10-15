import { describe, expect, it } from 'bun:test';
import { UnauthorizedException } from '@nestjs/common';
import { NursingRoundsController } from './nursing-rounds.controller';

describe('NursingRoundsController', () => {
    it('toma el profesional de la identidad del JWT', async () => {
        const calls: unknown[][] = [];
        const saved = { id: 8 } as any;
        const service = { recordRound: async (...args: unknown[]) => { calls.push(args); return saved; } };
        const controller = new NursingRoundsController(service as any);
        const dto = { idOlderAdult: 4, shift: 'morning' as const };

        await expect(controller.recordRound(dto, { user: { userId: 22, id: 99 } })).resolves.toBe(saved);
        expect(calls).toEqual([[dto, 22]]);
    });

    it('rechaza una petición sin identificador de usuario válido', async () => {
        const service = { recordRound: async () => 'saved' };
        const controller = new NursingRoundsController(service as any);
        await expect(controller.recordRound({ idOlderAdult: 4, shift: 'morning' } as any, { user: {} }))
            .rejects.toThrow(UnauthorizedException);
    });
});
