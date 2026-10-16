import { describe, it, expect, beforeEach } from 'bun:test';
import { ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RolesGuard } from './roles.guard';
import { PlatformRole } from '../../domain/auth/core/user.entity';
import { RoleType } from '../../domain/auth/core/role.entity';

function buildContext(user: unknown): ExecutionContext {
    return {
        getHandler: () => ({}),
        getClass: () => ({}),
        switchToHttp: () => ({
            getRequest: () => ({ user }),
        }),
    } as unknown as ExecutionContext;
}

describe('RolesGuard', () => {
    let reflector: Reflector;
    let guard: RolesGuard;

    beforeEach(() => {
        reflector = new Reflector();
        guard = new RolesGuard(reflector);
    });

    it('permite acceso cuando la ruta no requiere roles especificos', () => {
        reflector.getAllAndOverride = (() => undefined) as any;
        expect(guard.canActivate(buildContext({ roles: [], orgRoles: [] }))).toBe(true);
    });

    it('autoriza usando orgRoles cuando user.roles (user_roles legacy) esta vacio', () => {
        reflector.getAllAndOverride = (() => [RoleType.SUPER_ADMIN, RoleType.ADMIN, RoleType.DIRECTOR]) as any;
        const ctx = buildContext({
            id: 1,
            roles: [],
            orgRoles: [RoleType.ADMIN],
            platformRole: null,
        });

        expect(guard.canActivate(ctx)).toBe(true);
    });

    it('autoriza endpoints de SUPER_ADMIN cuando el usuario tiene platformRole PLATFORM_OWNER', () => {
        reflector.getAllAndOverride = (() => [RoleType.SUPER_ADMIN]) as any;
        const ctx = buildContext({
            id: 1,
            roles: [],
            orgRoles: [RoleType.ADMIN],
            platformRole: PlatformRole.PLATFORM_OWNER,
        });

        expect(guard.canActivate(ctx)).toBe(true);
    });

    it('rechaza cuando el usuario no tiene ninguno de los roles requeridos', () => {
        reflector.getAllAndOverride = (() => [RoleType.ADMIN, RoleType.DIRECTOR]) as any;
        const ctx = buildContext({
            id: 2,
            roles: [],
            orgRoles: [RoleType.NURSE],
            platformRole: null,
        });

        expect(guard.canActivate(ctx)).toBe(false);
    });
});
