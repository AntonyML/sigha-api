import { describe, it, expect, beforeEach, mock } from 'bun:test';
import '../../domain/auth/core/user-role.entity';
import '../../domain/permissions/role-permission.entity';
import { AuthService } from './auth.service';
import { UnauthorizedException } from '@nestjs/common';
import { User } from '../../domain/auth/core/user.entity';
import { PasswordUtil, TwoFactorUtil } from '../../common/utils';
import { AuditAction } from '../../domain/audit';

describe('AuthService - Optimización de login y verify-2fa', () => {
    let authService: AuthService;
    let mockJwtService: any;
    let mockConfigService: any;
    let mockLogger: any;
    let mockUserRepo: any;
    let mockSessionRepo: any;
    let mockTwoFactorRepo: any;
    let mockPasswordResetTokenRepo: any;
    let mockOrganizationRepo: any;
    let mockOrgMemberRepo: any;
    let mockEmailService: any;
    let mockAuditService: any;
    let mockUserRoleService: any;
    let mockCacheManager: any;

    beforeEach(() => {
        mockJwtService = {
            sign: mock((payload: any) => `token-sub-${payload.sub}`),
            verify: mock((token: string) => {
                if (token === 'valid-temp-token') {
                    return { sub: 1, email: 'test@example.com', require2FA: true };
                }
                throw new Error('invalid token');
            }),
        };
        mockConfigService = {
            get: mock((key: string, def?: any) => def),
        };
        mockLogger = {
            error: mock(),
            log: mock(),
            warn: mock(),
            debug: mock(),
        };
        mockUserRepo = {
            findOne: mock(async () => null),
        };
        mockSessionRepo = {
            save: mock(async (session: any) => session),
        };
        mockTwoFactorRepo = {
            findOne: mock(async () => null),
            save: mock(async (tfa: any) => tfa),
        };
        mockPasswordResetTokenRepo = {
            create: mock((dto: any) => dto),
            save: mock(async (t: any) => t),
        };
        mockOrganizationRepo = {
            findOne: mock(async () => null),
        };
        mockOrgMemberRepo = {
            find: mock(async () => []),
        };
        mockEmailService = {
            sendBackupCodes: mock(async () => ({ success: true })),
        };
        mockAuditService = {
            createDigitalRecord: mock(async () => ({})),
            computeSessionDuration: mock(async () => 0),
            logAuditDbFunction: mock(async () => {}),
        };
        mockUserRoleService = {
            findRolesByUserId: mock(async () => [{ id: 1, rName: 'admin' }]),
        };
        mockCacheManager = {
            get: mock(async () => null),
            set: mock(async () => {}),
            del: mock(async () => {}),
        };

        authService = new AuthService(
            mockJwtService,
            mockConfigService,
            mockLogger,
            mockUserRepo,
            mockSessionRepo,
            mockTwoFactorRepo,
            mockPasswordResetTokenRepo,
            mockOrganizationRepo,
            mockOrgMemberRepo,
            mockEmailService,
            mockAuditService,
            mockUserRoleService,
            mockCacheManager,
        );
    });

    describe('login', () => {
        it('debería autenticar exitosamente y generar tokens sin bloquear por auditoría', async () => {
            const hashedPassword = await PasswordUtil.hash('Password123!');
            const user = new User(1, '123456789', 'Juan', 'Perez', 'juan@example.com', hashedPassword);
            mockUserRepo.findOne = mock(async () => user);
            mockOrgMemberRepo.find = mock(async () => [
                {
                    userId: 1,
                    organizationId: 10,
                    isPrimary: true,
                    organization: { id: 10, name: 'Sigha Central', slug: 'sigha-central', isActive: true, logoUrl: null },
                },
            ]);

            const response = await authService.login(
                { uEmail: 'juan@example.com', uPassword: 'Password123!' },
                '192.168.1.50',
                'Mozilla/5.0',
            );

            expect(response.accessToken).toBe('token-sub-1');
            expect(response.refreshToken).toBe('token-sub-1');
            expect(response.user.id).toBe(1);
            expect(response.user.roles).toEqual(['admin']);
            expect(response.organizations).toHaveLength(1);
            expect(response.organizations[0].name).toBe('Sigha Central');

            // Verifica que se guardó la sesión
            expect(mockSessionRepo.save).toHaveBeenCalledTimes(1);

            // Verifica que se invocó la auditoría
            expect(mockAuditService.createDigitalRecord).toHaveBeenCalledWith(
                1,
                expect.objectContaining({
                    action: AuditAction.LOGIN,
                    tableName: 'users',
                    recordId: 1,
                    description: expect.stringContaining('192.168.1.50'),
                }),
            );
        });

        it('debería solicitar 2FA si está habilitado y no se envió código', async () => {
            const hashedPassword = await PasswordUtil.hash('Password123!');
            const user = new User(1, '123456789', 'Juan', 'Perez', 'juan@example.com', hashedPassword);
            mockUserRepo.findOne = mock(async () => user);
            mockTwoFactorRepo.findOne = mock(async () => ({
                id: 1,
                userId: 1,
                tfaEnabled: true,
                tfaSecret: 'JBSWY3DPEHPK3PXP',
            }));

            const response = await authService.login({
                uEmail: 'juan@example.com',
                uPassword: 'Password123!',
            });

            expect(response.requiresTwoFactor).toBe(true);
            expect(response.tempToken).toBeDefined();
            expect(response.accessToken).toBe('');
            expect(mockSessionRepo.save).not.toHaveBeenCalled();
        });

        it('debería rechazar login con credenciales inválidas', async () => {
            mockUserRepo.findOne = mock(async () => null);

            expect(authService.login({
                uEmail: 'inexistente@example.com',
                uPassword: 'wrong',
            })).rejects.toThrow(UnauthorizedException);
        });
    });

    describe('completeTwoFactorLogin', () => {
        it('debería validar el código 2FA y generar sesión y tokens', async () => {
            const user = new User(1, '123456789', 'Juan', 'Perez', 'juan@example.com', 'hash');
            mockUserRepo.findOne = mock(async () => user);

            const origVerifyToken = TwoFactorUtil.verifyToken;
            TwoFactorUtil.verifyToken = mock(() => true);

            mockTwoFactorRepo.findOne = mock(async () => ({
                id: 1,
                userId: 1,
                tfaEnabled: true,
                tfaSecret: 'JBSWY3DPEHPK3PXP',
                tfaBackupCodes: '[]',
                tfaLastUsed: null,
            }));

            try {
                const response = await authService.completeTwoFactorLogin(
                    'valid-temp-token',
                    '123456',
                    '127.0.0.1',
                    'TestAgent',
                );

                expect(response.accessToken).toBe('token-sub-1');
                expect(response.user.id).toBe(1);
                expect(mockTwoFactorRepo.save).toHaveBeenCalledTimes(1);
                expect(mockSessionRepo.save).toHaveBeenCalledTimes(1);
                expect(mockAuditService.createDigitalRecord).toHaveBeenCalledTimes(1);
            } finally {
                TwoFactorUtil.verifyToken = origVerifyToken;
            }
        });

        it('debería rechazar con código 2FA inválido', async () => {
            const user = new User(1, '123456789', 'Juan', 'Perez', 'juan@example.com', 'hash');
            mockUserRepo.findOne = mock(async () => user);
            mockTwoFactorRepo.findOne = mock(async () => ({
                id: 1,
                userId: 1,
                tfaEnabled: true,
                tfaSecret: 'JBSWY3DPEHPK3PXP',
                tfaBackupCodes: '[]',
            }));

            const origVerifyToken = TwoFactorUtil.verifyToken;
            TwoFactorUtil.verifyToken = mock(() => false);

            try {
                expect(authService.completeTwoFactorLogin(
                    'valid-temp-token',
                    '000000',
                )).rejects.toThrow(UnauthorizedException);
            } finally {
                TwoFactorUtil.verifyToken = origVerifyToken;
            }
        });

        it('debería rechazar si el tempToken es inválido o expirado', async () => {
            expect(authService.completeTwoFactorLogin(
                'invalid-token',
                '123456',
            )).rejects.toThrow(UnauthorizedException);
        });
    });
});
