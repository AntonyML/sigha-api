import { describe, it, expect, beforeEach, mock } from 'bun:test';
import '../../domain/auth/core/user-role.entity';
import '../../domain/permissions/role-permission.entity';
import { ForbiddenException, NotFoundException, ExecutionContext } from '@nestjs/common';
import { AuthService } from '../../services/auth/auth.service';
import { OrganizationService } from './organization.service';
import { TenantGuard } from '../../common/guards/tenant.guard';
import { Reflector } from '@nestjs/core';
import { NotificationService } from '../../services/notifications/notification.service';
import { Organization } from '../../domain/organizations/organization.entity';
import { OrganizationMember } from '../../domain/organizations/organization-member.entity';
import { User } from '../../domain/auth/core/user.entity';

describe('SaaS Multi-tenant Authority & Organization Scoping', () => {
    describe('AuthService - Organizations and JWT Claims', () => {
        let authService: AuthService;
        let mockUserRepo: any;
        let mockOrgRepo: any;
        let mockOrgMemberRepo: any;
        let mockJwtService: any;
        let mockSessionRepo: any;
        let mockAuditService: any;
        let mockUserRoleService: any;
        let mockConfigService: any;
        let mockLogger: any;
        let mockCacheManager: any;

        beforeEach(() => {
            mockUserRepo = {
                findOne: mock(),
            };
            mockOrgRepo = {
                findOne: mock(),
            };
            mockOrgMemberRepo = {
                find: mock(),
                findOne: mock(),
            };
            mockJwtService = {
                sign: mock((payload: any) => `token-for-${payload.sub}-org-${payload.orgId ?? 'null'}`),
                signAsync: mock(async (payload: any) => `token-for-${payload.sub}-org-${payload.orgId ?? 'null'}`),
            };
            mockSessionRepo = {
                create: mock((dto: any) => dto),
                save: mock(async (dto: any) => dto),
                delete: mock(async () => ({ affected: 1 })),
            };
            mockAuditService = {
                createDigitalRecord: mock(async () => {}),
            };
            mockUserRoleService = {
                findRolesByUserId: mock(async () => [{ id: 1, rName: 'admin' }]),
            };
            mockConfigService = {
                get: mock((key: string, def?: any) => {
                    if (key === 'security.jwtSecret') return 'test-jwt-secret-key-1234567890123456';
                    return def;
                }),
            };
            mockLogger = {
                error: mock(),
                log: mock(),
                warn: mock(),
                debug: mock(),
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
                mock() as any, // twoFactorRepository
                mock() as any, // passwordResetTokenRepository
                mockOrgRepo,
                mockOrgMemberRepo,
                mock() as any, // emailService
                mockAuditService,
                mockUserRoleService,
                mockCacheManager,
            );
        });

        it('Login / getUserOrganizations: devuelve organizaciones del usuario con isPrimary', async () => {
            const org1 = new Organization(1, 'Hogar San Pedro', 'hogar-san-pedro', 'https://example.com/logo1.png');
            const org2 = new Organization(2, 'Fundación Esperanza', 'fundacion-esperanza', undefined);

            mockOrgMemberRepo.find.mockResolvedValue([
                { userId: 10, organizationId: 1, isPrimary: true, organization: org1 },
                { userId: 10, organizationId: 2, isPrimary: false, organization: org2 },
            ]);

            const userOrgs = await authService.getUserOrganizations(10);

            expect(userOrgs).toHaveLength(2);
            expect(userOrgs[0]).toEqual({
                id: 1,
                name: 'Hogar San Pedro',
                slug: 'hogar-san-pedro',
                logoUrl: 'https://example.com/logo1.png',
                isPrimary: true,
            });
            expect(userOrgs[1]).toEqual({
                id: 2,
                name: 'Fundación Esperanza',
                slug: 'fundacion-esperanza',
                logoUrl: null,
                isPrimary: false,
            });
        });

        it('switchActiveOrganization: reemite tokens con nuevo orgId cuando el usuario es miembro', async () => {
            const org = new Organization(2, 'Org 2', 'org-2');
            mockOrgMemberRepo.find.mockResolvedValue([
                { userId: 10, organizationId: 2, isPrimary: false, organization: org },
            ]);

            const user = new User(10, '123456789', 'Juan', 'Perez', 'juan@example.com', 'hash', 'Gomez');
            mockUserRepo.findOne.mockResolvedValue(user);

            const result = await authService.switchActiveOrganization(10, 2);

            expect(result.accessToken).toContain('org-2');
            expect(result.refreshToken).toContain('org-2');
            expect(result.activeOrganization).toEqual({
                id: 2,
                name: 'Org 2',
                slug: 'org-2',
                logoUrl: null,
            });
        });

        it('switchActiveOrganization: lanza 403 Forbidden cuando el usuario NO es miembro de la organización', async () => {
            const user = new User(10, '123456789', 'Juan', 'Perez', 'juan@example.com', 'hash', 'Gomez');
            mockUserRepo.findOne.mockResolvedValue(user);
            mockOrgMemberRepo.find.mockResolvedValue([]);

            expect(authService.switchActiveOrganization(10, 999)).rejects.toThrow(ForbiddenException);
        });
    });

    describe('TenantGuard', () => {
        let guard: TenantGuard;
        let reflector: Reflector;
        let memberRepository: any;
        let tenantManager: any;
        let dataSource: any;

        beforeEach(() => {
            reflector = new Reflector();
            memberRepository = { findOne: mock(async () => ({ userId: 1, organizationId: 42 })) };
            tenantManager = {
                query: mock(async () => []),
                getRepository: () => memberRepository,
            };
            dataSource = {
                transaction: mock(async (callback: (manager: any) => unknown) => callback(tenantManager)),
            };
            guard = new TenantGuard(reflector, dataSource);
        });

        it('permite el acceso si la ruta está decorada con @SkipTenant', async () => {
            const context = {
                getHandler: () => ({}),
                getClass: () => ({}),
                switchToHttp: () => ({
                    getRequest: () => ({ user: { id: 1, orgId: null } }),
                }),
            } as unknown as ExecutionContext;

            reflector.getAllAndOverride = mock(() => true);

            expect(await guard.canActivate(context)).toBe(true);
            expect(dataSource.transaction).not.toHaveBeenCalled();
            expect(memberRepository.findOne).not.toHaveBeenCalled();
        });

        it('permite el acceso solo si el usuario pertenece al orgId activo', async () => {
            const context = {
                getHandler: () => ({}),
                getClass: () => ({}),
                switchToHttp: () => ({
                    getRequest: () => ({ user: { id: 1, orgId: 42 } }),
                }),
            } as unknown as ExecutionContext;

            reflector.getAllAndOverride = mock(() => false);

            expect(await guard.canActivate(context)).toBe(true);
            expect(dataSource.transaction).toHaveBeenCalledTimes(1);
            expect(tenantManager.query).toHaveBeenNthCalledWith(1, 'SET LOCAL ROLE sigha_app', undefined);
            expect(tenantManager.query).toHaveBeenNthCalledWith(
                2,
                "SELECT set_config('app.current_tenant_id', $1, true), set_config('app.current_user_id', $2, true)",
                ['42', '1'],
            );
            expect(memberRepository.findOne).toHaveBeenCalledWith({
                where: { organizationId: 42, userId: 1 },
                select: { organizationId: true, userId: true },
            });
        });

        it('lanza 403 si el orgId es nulo o indefinido en un endpoint con scope tenant', async () => {
            const context = {
                getHandler: () => ({}),
                getClass: () => ({}),
                switchToHttp: () => ({
                    getRequest: () => ({ user: { id: 1, orgId: null } }),
                }),
            } as unknown as ExecutionContext;

            reflector.getAllAndOverride = mock(() => false);

            await expect(guard.canActivate(context)).rejects.toThrow(ForbiddenException);
            expect(dataSource.transaction).not.toHaveBeenCalled();
        });

        it('rechaza una organización activa que no coincide con una membresía del usuario', async () => {
            memberRepository.findOne.mockResolvedValue(null);
            const context = {
                getHandler: () => ({}),
                getClass: () => ({}),
                switchToHttp: () => ({ getRequest: () => ({ user: { id: 1, orgId: 42 } }) }),
            } as unknown as ExecutionContext;
            reflector.getAllAndOverride = mock(() => false);
            await expect(guard.canActivate(context)).rejects.toThrow(ForbiddenException);
            expect(dataSource.transaction).toHaveBeenCalledTimes(1);
        });
    });

    describe('OrganizationService', () => {
        let orgService: OrganizationService;
        let mockOrgRepo: any;
        let mockOrgMemberRepo: any;
        let mockStorageService: any;
        let mockAuditService: any;

        beforeEach(() => {
            mockOrgRepo = {
                findOne: mock(),
                save: mock(async (entity: any) => entity),
            };
            mockOrgMemberRepo = {
                findOne: mock(),
            };
            mockStorageService = {
                uploadFile: mock(async () => 'https://storage.supabase.co/sigha-logos/logo.png'),
            };

            orgService = new OrganizationService(
                mockOrgRepo,
                mockOrgMemberRepo,
                mockStorageService,
            );
        });

        it('getCurrentOrganization: devuelve la organización activa del usuario', async () => {
            mockOrgMemberRepo.findOne.mockResolvedValue({ userId: 10, organizationId: 1 });
            mockOrgRepo.findOne.mockResolvedValue(
                new Organization(1, 'SIGHA Central', 'sigha-central', 'https://example.com/logo.png')
            );

            const current = await orgService.getCurrentOrganization(1);

            expect(current).toEqual({
                id: 1,
                name: 'SIGHA Central',
                slug: 'sigha-central',
                logoUrl: 'https://example.com/logo.png',
            });
        });

        it('uploadLogo: sube archivo al storage y actualiza logo_url en base de datos', async () => {
            mockOrgMemberRepo.findOne.mockResolvedValue({ userId: 10, organizationId: 1 });
            const org = new Organization(1, 'SIGHA Central', 'sigha-central');
            mockOrgRepo.findOne.mockResolvedValue(org);

            const mockFile: Express.Multer.File = {
                buffer: Buffer.from('fake-image-bytes'),
                originalname: 'logo.png',
                mimetype: 'image/png',
                size: 1024,
            } as any;

            const updated = await orgService.uploadLogo(1, mockFile);

            expect(mockStorageService.uploadFile).toHaveBeenCalled();
            expect(updated.logoUrl).toBe('https://storage.supabase.co/sigha-logos/logo.png');
            expect(mockOrgRepo.save).toHaveBeenCalled();
        });
    });

    describe('NotificationService Reference Tenant Scoping', () => {
        let notificationService: NotificationService;
        let mockNotificationRepo: any;
        let mockAttachmentRepo: any;
        let mockOrgMemberRepo: any;
        let mockAuditService: any;
        let mockCacheManager: any;
        let mockLogger: any;
        let mockQueryBuilder: any;

        beforeEach(() => {
            mockQueryBuilder = {
                leftJoinAndSelect: mock().mockReturnThis(),
                where: mock().mockReturnThis(),
                andWhere: mock().mockReturnThis(),
                orderBy: mock().mockReturnThis(),
                skip: mock().mockReturnThis(),
                take: mock().mockReturnThis(),
                getManyAndCount: mock(),
            };

            mockNotificationRepo = {
                createQueryBuilder: mock(() => mockQueryBuilder),
                findOne: mock(),
                find: mock(),
                save: mock(async (n: any) => n),
                remove: mock(async (n: any) => n),
                create: mock((dto: any) => dto),
            };

            mockAttachmentRepo = {
                delete: mock(async () => {}),
                save: mock(async () => {}),
                create: mock((dto: any) => dto),
            };

            mockOrgMemberRepo = {
                findOne: mock(),
            };

            mockAuditService = {
                createDigitalRecord: mock(async () => {}),
            };

            mockCacheManager = {
                get: mock(async () => null),
                set: mock(async () => {}),
                del: mock(async () => {}),
            };

            mockLogger = {
                error: mock(),
                log: mock(),
                warn: mock(),
                debug: mock(),
            };

            notificationService = new NotificationService(
                mockLogger,
                mockNotificationRepo,
                mockAttachmentRepo,
                mockAuditService,
                mockCacheManager,
                undefined, // dataSource
                mockOrgMemberRepo,
            );
        });

        it('findAll: filtra notificaciones mediante membresía del creador en la org activa', async () => {
            mockQueryBuilder.getManyAndCount.mockResolvedValue([
                [{ id: 1, nTitle: 'Org A Notification', idSender: 10 }],
                1,
            ]);

            const result = await notificationService.findAll({}, 10, 1);

            expect(mockNotificationRepo.createQueryBuilder).toHaveBeenCalledWith('n');
            expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
                expect.stringContaining('EXISTS ('),
                { activeOrgId: 1 }
            );
            expect(result.data).toHaveLength(1);
        });

        it('findOne: lanza NotFoundException (404) si la notificación pertenece a otra organización para evitar enumeración', async () => {
            // Notificación creada por usuario 20 en Org 2
            mockNotificationRepo.findOne.mockResolvedValue({
                id: 99,
                nTitle: 'Org 2 Secret Notification',
                idSender: 20,
            });

            // Usuario solicita con activeOrgId = 1, pero remitente 20 NO pertenece a Org 1
            mockOrgMemberRepo.findOne.mockResolvedValue(null);

            expect(notificationService.findOne(99, 1)).rejects.toThrow(NotFoundException);
        });
    });
});
