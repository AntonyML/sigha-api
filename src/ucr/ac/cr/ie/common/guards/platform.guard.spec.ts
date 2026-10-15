import { describe, it, expect, mock } from 'bun:test';
import { ForbiddenException, UnauthorizedException } from '@nestjs/common';
import type { ExecutionContext } from '@nestjs/common';
import { PlatformGuard } from './platform.guard';
import { PlatformStepUpGuard } from './platform-step-up.guard';

function contextWith(request: any): ExecutionContext {
    return {
        switchToHttp: () => ({ getRequest: () => request }),
    } as unknown as ExecutionContext;
}

describe('PlatformGuard', () => {
    const guard = new PlatformGuard();

    it('permite a PLATFORM_OWNER', () => {
        expect(guard.canActivate(contextWith({ user: { platformRole: 'PLATFORM_OWNER' } }))).toBe(true);
    });

    it('permite a PLATFORM_SUPPORT', () => {
        expect(guard.canActivate(contextWith({ user: { platformRole: 'PLATFORM_SUPPORT' } }))).toBe(true);
    });

    it('rechaza a un usuario sin rol de plataforma', () => {
        expect(() => guard.canActivate(contextWith({ user: { platformRole: null } }))).toThrow(ForbiddenException);
    });

    it('rechaza cuando no hay usuario autenticado', () => {
        expect(() => guard.canActivate(contextWith({}))).toThrow(ForbiddenException);
    });
});

describe('PlatformStepUpGuard', () => {
    it('exige el header de step-up', async () => {
        const guard = new PlatformStepUpGuard({ validatePlatformStepUpToken: mock(async () => true) } as any);
        await expect(
            guard.canActivate(contextWith({ user: { userId: 1 }, headers: {} })),
        ).rejects.toThrow(UnauthorizedException);
    });

    it('valida el token de plataforma del usuario autenticado', async () => {
        const validate = mock(async () => true);
        const guard = new PlatformStepUpGuard({ validatePlatformStepUpToken: validate } as any);
        const ok = await guard.canActivate(
            contextWith({ user: { userId: 7 }, headers: { 'x-platform-step-up-token': 'token-abc' } }),
        );
        expect(ok).toBe(true);
        expect(validate).toHaveBeenCalledWith(7, 'token-abc');
    });

    it('rechaza un token inválido o expirado', async () => {
        const guard = new PlatformStepUpGuard({ validatePlatformStepUpToken: mock(async () => false) } as any);
        await expect(
            guard.canActivate(contextWith({ user: { userId: 7 }, headers: { 'x-platform-step-up-token': 'bad' } })),
        ).rejects.toThrow(UnauthorizedException);
    });
});
