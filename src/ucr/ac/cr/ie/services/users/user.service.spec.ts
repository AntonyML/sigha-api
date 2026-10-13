import { describe, it, expect, beforeEach, mock } from 'bun:test';
import { BadRequestException, NotFoundException } from '@nestjs/common';
// Orden de carga: rompe las circularidades role.entity ⇄ user-role.entity y
// permission.entity ⇄ role-permission.entity (los decoradores inversos del último
// módulo cargado en cada ciclo evalúan el binding de la clase del otro ciclo antes
// de que se inicialice). Precargando primero los módulos con los lados inversos
// (user-role, role-permission) cada par queda sin pendientes al evaluarse.
import '../../domain/auth/core/user-role.entity';
import '../../domain/permissions/role-permission.entity';
import { UserService } from './user.service';
import { PasswordUtil } from '../../common/utils';
import { AuditAction } from '../../domain/audit';

const STRONG_PASSWORD = 'Segura1!a';

describe('UserService', () => {
    let service: UserService;
    let mockUserRepo: any;
    let mockRoleRepo: any;
    let userStore: Map<number, any>;

    const mockLogger: any = {
        error: mock(() => {}),
        info: mock(() => {}),
        warn: mock(() => {}),
        debug: mock(() => {}),
    };

    const mockRoleChangesService: any = {
        createRoleChange: mock(() => Promise.resolve({ id: 1 })),
    };

    const mockUserRoleService: any = {
        assignRole: mock(() => Promise.resolve()),
        removeRole: mock(() => Promise.resolve()),
        findPrimaryRole: mock(() => Promise.resolve(null)),
        findRolesByUserId: mock(() => Promise.resolve([
            { id: 2, rName: 'Enfermero' },
        ])),
        findUserPermissions: mock(() => Promise.resolve([
            { id: 1, pModule: 'users', pAction: 'read', pDescription: 'Ver usuarios' },
            { id: 2, pModule: 'users', pAction: 'read', pDescription: 'Ver usuarios' },
        ])),
    };

    const mockAuditService: any = {
        createDigitalRecord: mock(() => Promise.resolve({})),
    };

    const validCreateUserDto = {
        uIdentification: '303030303',
        uEmail: 'nuevo@hogarancianos.com',
        uPassword: STRONG_PASSWORD,
        uName: 'Juan',
        uFLastName: 'Pérez',
        roleId: 2,
    };

    const resetUserStore = async () => {
        const storedHash = await PasswordUtil.hash('Actual1!a');
        userStore = new Map<number, any>();
        userStore.set(1, {
            id: 1,
            uIdentification: '101010101',
            uName: 'Ana',
            uFLastName: 'García',
            uEmail: 'ana@hogarancianos.com',
            uEmailVerified: false,
            uIsActive: true,
            uPassword: storedHash,
        });
        userStore.set(2, {
            id: 2,
            uIdentification: '202020202',
            uName: 'Luis',
            uFLastName: 'López',
            uEmail: 'luis@hogarancianos.com',
            uEmailVerified: false,
            uIsActive: true,
        });
    };

    /** Simula la proyección de columnas que hace TypeORM cuando se pasa `select` (objeto o array). */
    const projectBySelect = (user: any, select?: Record<string, boolean> | string[]) => {
        if (!select) {
            return { ...user };
        }
        const keys = Array.isArray(select) ? select : Object.keys(select).filter(k => select[k]);
        const projected: any = {};
        for (const key of keys) {
            projected[key] = user[key];
        }
        return projected;
    };

    /** Coincidencia exacta de los criterios de `where` contra un usuario. */
    const matchesWhere = (user: any, where: Record<string, unknown>) =>
        Object.entries(where).every(([key, value]) => user[key] === value);

    const clearMocks = () => {
        for (const fn of [
            mockLogger.error, mockLogger.info, mockLogger.warn, mockLogger.debug,
            mockRoleChangesService.createRoleChange,
            mockUserRoleService.assignRole, mockUserRoleService.removeRole,
            mockUserRoleService.findPrimaryRole, mockUserRoleService.findRolesByUserId,
            mockUserRoleService.findUserPermissions,
            mockAuditService.createDigitalRecord,
        ]) {
            (fn as any).mockClear();
            (fn as any).mockImplementation?.(() => Promise.resolve(null));
        }
        (mockRoleChangesService.createRoleChange as any).mockImplementation(() =>
            Promise.resolve({ id: 1 }),
        );
        (mockUserRoleService.findPrimaryRole as any).mockImplementation(() =>
            Promise.resolve(null),
        );
        (mockUserRoleService.findRolesByUserId as any).mockImplementation(() =>
            Promise.resolve([{ id: 2, rName: 'Enfermero' }]),
        );
        (mockUserRoleService.findUserPermissions as any).mockImplementation(() =>
            Promise.resolve([
                { id: 1, pModule: 'users', pAction: 'read', pDescription: 'Ver usuarios' },
                { id: 2, pModule: 'users', pAction: 'read', pDescription: 'Ver usuarios' },
            ]),
        );
    };

    const freshService = () => {
        mockUserRepo = {
            findOne: mock((opts: any) => {
                const where = opts?.where ?? {};
                let found: any;
                // TypeORM: objeto => AND; array de objetos => OR entre elementos.
                if (Array.isArray(where)) {
                    found = Array.from(userStore.values()).find(
                        (u: any) => where.some((w: Record<string, unknown>) => matchesWhere(u, w)),
                    ) ?? null;
                } else {
                    found = Array.from(userStore.values()).find(
                        (u: any) => matchesWhere(u, where as Record<string, unknown>),
                    ) ?? null;
                }
                if (!found) return Promise.resolve(null);
                return Promise.resolve(projectBySelect(found, opts?.select as any));
            }),
            find: mock(() =>
                Promise.resolve(
                    Array.from(userStore.values()).map((u: any) => {
                        const { uPassword: _omit, ...rest } = u;
                        return rest;
                    }),
                ),
            ),
            save: mock((entity: any) => {
                const id = entity.id ?? Math.max(0, ...Array.from(userStore.keys())) + 1;
                const saved = { ...entity, id };
                userStore.set(id, saved);
                return Promise.resolve(saved);
            }),
            update: mock((id: number, patch: any) => {
                const user = userStore.get(id);
                if (user) userStore.set(id, { ...user, ...patch });
                return Promise.resolve({ affected: 1 });
            }),
        };

        mockRoleRepo = {
            findOne: mock(({ where: { id } }: any) => {
                if (id === 2) return Promise.resolve({ id: 2, rName: 'Enfermero' });
                if (id === 3) return Promise.resolve({ id: 3, rName: 'Doctor' });
                return Promise.resolve(null);
            }),
        };

        service = new UserService(
            mockLogger,
            mockUserRepo,
            mockRoleRepo,
            mockRoleChangesService,
            mockUserRoleService,
            mockAuditService,
        );
    };

    beforeEach(async () => {
        clearMocks();
        await resetUserStore();
        freshService();
    });

    describe('createUser', () => {
        it('debe crear usuario, asignar rol y registrar auditoría con la acción CREATE', async () => {
            const saved = await service.createUser(validCreateUserDto as any);

            expect(saved.uEmail).toBe('nuevo@hogarancianos.com');
            expect(saved.uPassword).not.toBe(STRONG_PASSWORD);
            expect(mockUserRoleService.assignRole).toHaveBeenCalledWith(saved.id, 2, undefined, true);
            expect(mockAuditService.createDigitalRecord).toHaveBeenCalledTimes(1);
            const [userId, record] = (mockAuditService.createDigitalRecord as any).mock.calls[0];
            expect(userId).toBe(saved.id);
            expect(record.action).toBe(AuditAction.CREATE);
            expect(record.tableName).toBe('users');
            expect(record.recordId).toBe(saved.id);
        });

        it('debe rechazar cuando el email ya está en uso', async () => {
            await expect(
                service.createUser({ ...validCreateUserDto, uEmail: 'ana@hogarancianos.com' } as any),
            ).rejects.toThrow('El email ya está en uso');
            expect(mockUserRepo.save).toHaveBeenCalledTimes(0);
        });

        it('debe rechazar cuando la identificación ya está en uso', async () => {
            await expect(
                service.createUser({ ...validCreateUserDto, uIdentification: '101010101' } as any),
            ).rejects.toThrow('La identificación ya está en uso');
            expect(mockUserRepo.save).toHaveBeenCalledTimes(0);
        });

        it('debe rechazar cuando el rol no existe', async () => {
            await expect(service.createUser({ ...validCreateUserDto, roleId: 99 } as any))
                .rejects.toThrow('Rol no encontrado');
        });

        it('debe rechazar cuando la contraseña es débil', async () => {
            await expect(
                service.createUser({ ...validCreateUserDto, uPassword: 'corta' } as any),
            ).rejects.toThrow(BadRequestException);
        });
    });

    describe('findById / findAll', () => {
        it('debe devolver el usuario por id sin exponer la contraseña', async () => {
            const user = await service.findById(1);
            expect(user.id).toBe(1);
            expect(user.uPassword).toBeUndefined();
        });

        it('debe lanzar NotFoundException cuando el usuario no existe', async () => {
            await expect(service.findById(999)).rejects.toThrow(NotFoundException);
        });

        it('debe listar usuarios siempre sin el campo de contraseña', async () => {
            const users = await service.findAll();
            expect(users).toHaveLength(2);
            expect(users.every((u: any) => u.uPassword === undefined)).toBe(true);
        });
    });

    describe('updateUser', () => {
        it('debe registrar el cambio de rol y reasignar el rol primario cuando cambia', async () => {
            (mockUserRoleService.findPrimaryRole as any).mockImplementation(() =>
                Promise.resolve({ id: 3, rName: 'Doctor' }),
            );

            const updated = await service.updateUser(2, { roleId: 2 } as any, 1);

            expect(mockRoleChangesService.createRoleChange).toHaveBeenCalledWith({
                rcOldRole: 'Doctor',
                rcNewRole: 'Enfermero',
                oldRoleId: 3,
                newRoleId: 2,
                idUser: 2,
                changedBy: 1,
            });
            expect(mockUserRoleService.removeRole).toHaveBeenCalledWith(2, 3);
            expect(mockUserRoleService.assignRole).toHaveBeenCalledWith(2, 2, 1, true);
            expect(updated.id).toBe(2);
        });

        it('no debe tocar el rol cuando el roleId solicitado ya es el primario', async () => {
            (mockUserRoleService.findPrimaryRole as any).mockImplementation(() =>
                Promise.resolve({ id: 2, rName: 'Enfermero' }),
            );

            await service.updateUser(2, { roleId: 2 } as any, 1);

            expect(mockRoleChangesService.createRoleChange).toHaveBeenCalledTimes(0);
            expect(mockUserRoleService.removeRole).toHaveBeenCalledTimes(0);
            expect(mockUserRoleService.assignRole).toHaveBeenCalledTimes(0);
        });

        it('debe rechazar un nuevo email que pertenece a otro usuario', async () => {
            await expect(service.updateUser(2, { uEmail: 'ana@hogarancianos.com' } as any, 1))
                .rejects.toThrow('El email ya está en uso');
        });

        it('debe auditar con changedBy || 1 cuando no viene changedBy', async () => {
            await service.updateUser(2, { uName: 'Luisito' } as any);

            expect(mockAuditService.createDigitalRecord).toHaveBeenCalledTimes(1);
            const changedBy = (mockAuditService.createDigitalRecord as any).mock.calls[0][0];
            expect(changedBy).toBe(1);
            const record = (mockAuditService.createDigitalRecord as any).mock.calls[0][1];
            expect(record.action).toBe(AuditAction.UPDATE);
            expect(record.tableName).toBe('users');
        });
    });

    describe('changePassword', () => {
        it('debe rechazar la contraseña actual incorrecta sin actualizar ni auditar', async () => {
            await expect(
                service.changePassword(1, { currentPassword: 'Incorrecta1!', newPassword: STRONG_PASSWORD } as any),
            ).rejects.toThrow('Contraseña actual incorrecta');
            expect(mockUserRepo.update).toHaveBeenCalledTimes(0);
            expect(mockAuditService.createDigitalRecord).toHaveBeenCalledTimes(0);
        });

        it('debe rechazar la nueva contraseña débil', async () => {
            await expect(
                service.changePassword(1, { currentPassword: 'Actual1!a', newPassword: 'corta' } as any),
            ).rejects.toThrow(BadRequestException);
        });

        it('debe actualizar el hash y auditar el cambio', async () => {
            const result = await service.changePassword(
                1,
                { currentPassword: 'Actual1!a', newPassword: STRONG_PASSWORD } as any,
            );

            expect(result.success).toBe(true);
            expect(mockUserRepo.update).toHaveBeenCalledTimes(1);
            const [, patch] = (mockUserRepo.update as any).mock.calls[0];
            const stored = userStore.get(1);
            expect(patch.uPassword).toBe(stored.uPassword);
            expect(await PasswordUtil.verify(STRONG_PASSWORD, stored.uPassword)).toBe(true);
            expect(patch.uPassword).not.toBe(STRONG_PASSWORD);

            expect(mockAuditService.createDigitalRecord).toHaveBeenCalledTimes(1);
            const record = (mockAuditService.createDigitalRecord as any).mock.calls[0][1];
            expect(record.action).toBe(AuditAction.UPDATE);
            expect(record.recordId).toBe(1);
        });
    });

    describe('toggleUserStatus / deleteUser', () => {
        it('debe alternar el estado activo del usuario y auditar', async () => {
            const toggled = await service.toggleUserStatus(2, 1);

            expect(toggled.uIsActive).toBe(false);
            expect(mockAuditService.createDigitalRecord).toHaveBeenCalledTimes(1);
            const record = (mockAuditService.createDigitalRecord as any).mock.calls[0][1];
            expect(record.action).toBe(AuditAction.UPDATE);
            expect(record.description).toContain('desactivado');

            (mockAuditService.createDigitalRecord as any).mockClear();
            const toggledAgain = await service.toggleUserStatus(2, 1);
            expect(toggledAgain.uIsActive).toBe(true);
            const record2 = (mockAuditService.createDigitalRecord as any).mock.calls[0][1];
            expect(record2.description).toContain('activado');
        });

        it('debe hacer soft delete dejando el usuario inactivo y auditar DELETE', async () => {
            const result = await service.deleteUser(2, 1);

            expect(result.success).toBe(true);
            expect(userStore.get(2).uIsActive).toBe(false);
            const [changedBy, record] = (mockAuditService.createDigitalRecord as any).mock.calls[0];
            expect(changedBy).toBe(1);
            expect(record.action).toBe(AuditAction.DELETE);
            expect(record.tableName).toBe('users');
            expect(record.recordId).toBe(2);
        });

        it('debe fallar el toggle/delete cuando el usuario no existe', async () => {
            await expect(service.toggleUserStatus(999, 1)).rejects.toThrow(NotFoundException);
            await expect(service.deleteUser(999, 1)).rejects.toThrow(NotFoundException);
            expect(mockAuditService.createDigitalRecord).toHaveBeenCalledTimes(0);
        });
    });

    describe('getUserRoles / getUserPermissions / getUserFullProfile', () => {
        it('debe resolver roles con isPrimary según el rol primario', async () => {
            (mockUserRoleService.findPrimaryRole as any).mockImplementation(() =>
                Promise.resolve({ id: 2, rName: 'Enfermero' }),
            );

            const result = await service.getUserRoles(1);

            expect(result.userId).toBe(1);
            expect(result.roles).toEqual([
                { roleId: 2, roleName: 'Enfermero', isPrimary: true },
            ]);
        });

        it('debe lanzar NotFoundException si el usuario no existe al consultar roles', async () => {
            await expect(service.getUserRoles(999)).rejects.toThrow(NotFoundException);
        });

        it('debe devolver permisos deduplicados por código modulo:accion', async () => {
            const result = await service.getUserPermissions(1);
            expect(result.permissions).toHaveLength(1);
            expect(result.permissions[0].code).toBe('users:read');
        });

        it('debe combinar usuario, roles y permisos en el perfil completo', async () => {
            (mockUserRoleService.findPrimaryRole as any).mockImplementation(() =>
                Promise.resolve({ id: 2, rName: 'Enfermero' }),
            );

            const profile = await service.getUserFullProfile(1);
            expect(profile.user.id).toBe(1);
            expect(profile.roles).toHaveLength(1);
            expect(profile.permissions).toHaveLength(1);
        });
    });
});
