import { describe, expect, it } from 'bun:test';
import { VitalSignsService } from './vital-signs.service';

describe('VitalSignsService', () => {
    it('registra al profesional autenticado y no toma el actor del payload', async () => {
        const repository = {
            create: (value: any) => ({ ...value }),
            save: async (value: any) => value,
        };
        const service = new VitalSignsService(repository as any, { findOne: async () => ({ id: 4 }) } as any);

        const result = await service.recordVitalSigns({
            idOlderAdult: 4,
            systolicBp: 120,
        }, 22);

        expect(result.recordedBy).toBe(22);
        expect(result.systolicBp).toBe(120);
    });
});
