import { describe, expect, it } from 'bun:test';
import { UnauthorizedException } from '@nestjs/common';
import { VitalSignsController } from './vital-signs.controller';

describe('VitalSignsController', () => {
    it('toma recordedBy del usuario autenticado', async () => {
        const calls: unknown[][] = [];
        const saved = { id: 9 } as any;
        const service = { recordVitalSigns: async (...args: unknown[]) => { calls.push(args); return saved; } };
        const controller = new VitalSignsController(service as any);
        const dto = { idOlderAdult: 4, systolicBp: 120 };

        await expect(controller.recordVitalSigns(dto, { user: { userId: 22, id: 99 } })).resolves.toBe(saved);
        expect(calls).toEqual([[dto, 22]]);
    });

    it('rechaza una petición sin usuario autenticado válido', async () => {
        const service = { recordVitalSigns: async () => 'saved' };
        const controller = new VitalSignsController(service as any);
        await expect(controller.recordVitalSigns({ idOlderAdult: 4 } as any, { user: {} }))
            .rejects.toThrow(UnauthorizedException);
    });
});
