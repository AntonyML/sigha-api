import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { UserService } from 'src/ucr/ac/cr/ie/services/users/user.service';
import { User } from 'src/ucr/ac/cr/ie/domain/auth/core/user.entity';
import { Role } from 'src/ucr/ac/cr/ie/domain/auth/core/role.entity';
import { RoleChangesService } from 'src/ucr/ac/cr/ie/services/role-changes/role-changes.service';
import { AuditService } from 'src/ucr/ac/cr/ie/services/audit/audit.service';
import { PasswordUtil } from 'src/ucr/ac/cr/ie/common/utils';

describe('UserService - Unit Tests', () => {
    let service: UserService;
    let userRepository: jest.Mocked<Repository<User>>;
    let roleRepository: jest.Mocked<Repository<Role>>;
    let roleChangesService: jest.Mocked<RoleChangesService>;
    let auditService: jest.Mocked<AuditService>;

    beforeEach(async () => {
        // Crear mocks de los repositorios y servicios
        const mockUserRepository = {
            findOne: jest.fn(),
            find: jest.fn(),
            save: jest.fn(),
            update: jest.fn(),
            createQueryBuilder: jest.fn(),
        };

        const mockRoleRepository = {
            findOne: jest.fn(),
        };

        const mockRoleChangesService = {
            createRoleChange: jest.fn(),
        };

        const mockAuditService = {
            createDigitalRecord: jest.fn(),
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                UserService,
                { provide: 'UserRepository', useValue: mockUserRepository },
                { provide: 'RoleRepository', useValue: mockRoleRepository },
                { provide: RoleChangesService, useValue: mockRoleChangesService },
                { provide: AuditService, useValue: mockAuditService },
            ],
        }).compile();

        service = module.get<UserService>(UserService);
        userRepository = module.get('UserRepository');
        roleRepository = module.get('RoleRepository');
        roleChangesService = module.get(RoleChangesService);
        auditService = module.get(AuditService);
    });

    describe('TC_UNIT_USERS_001: createUser - Crear usuario exitosamente', () => {
        it('Debe crear usuario con datos válidos', async () => {
            const createUserDto = {
                uIdentification: '123456789',
                uEmail: 'juan@example.com',
                uPassword: 'SecurePass123!',
                roleId: 1,
                uName: 'Juan',
                uFLastName: 'Pérez',
                uSLastName: 'García',
            };

            const mockRole: Role = { id: 1, rName: 'Admin' } as Role;
            const mockUser: User = {
                id: 1,
                uIdentification: createUserDto.uIdentification,
                uName: createUserDto.uName,
                uFLastName: createUserDto.uFLastName,
                uSLastName: createUserDto.uSLastName,
                uEmail: createUserDto.uEmail,
                uPassword: 'hashedpassword',
                uIsActive: true,
                roleId: 1,
                createAt: new Date(),
            } as User;

            jest.spyOn(userRepository, 'findOne').mockResolvedValue(null);
            jest.spyOn(roleRepository, 'findOne').mockResolvedValue(mockRole);
            jest.spyOn(PasswordUtil, 'validatePasswordStrength').mockReturnValue({ isValid: true, errors: [] });
            jest.spyOn(PasswordUtil, 'hash').mockResolvedValue('hashedpassword');
            jest.spyOn(userRepository, 'save').mockResolvedValue(mockUser);
            jest.spyOn(auditService, 'createDigitalRecord').mockResolvedValue(undefined);

            const result = await service.createUser(createUserDto);

            expect(result).toEqual(mockUser);
            expect(userRepository.findOne).toHaveBeenCalledWith({
                where: [{ uEmail: createUserDto.uEmail }, { uIdentification: createUserDto.uIdentification }]
            });
            expect(roleRepository.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
            expect(auditService.createDigitalRecord).toHaveBeenCalled();
        });
    });

    describe('TC_UNIT_USERS_002: createUser - Email ya en uso', () => {
        it('Debe lanzar error si email ya existe', async () => {
            const createUserDto = {
                uIdentification: '123456789',
                uEmail: 'juan@example.com',
                uPassword: 'SecurePass123!',
                roleId: 1,
                uName: 'Juan',
                uFLastName: 'Pérez',
                uSLastName: 'García',
            };

            const existingUser: User = {
                id: 2,
                uEmail: 'juan@example.com',
                uIdentification: '987654321',
            } as User;

            jest.spyOn(userRepository, 'findOne').mockResolvedValue(existingUser);

            await expect(service.createUser(createUserDto))
                .rejects
                .toThrow(new BadRequestException('El email ya está en uso'));
        });
    });

    describe('TC_UNIT_USERS_003: createUser - Identificación ya en uso', () => {
        it('Debe lanzar error si identificación ya existe', async () => {
            const createUserDto = {
                uIdentification: '123456789',
                uEmail: 'juan@example.com',
                uPassword: 'SecurePass123!',
                roleId: 1,
                uName: 'Juan',
                uFLastName: 'Pérez',
                uSLastName: 'García',
            };

            const existingUser: User = {
                id: 2,
                uEmail: 'otro@example.com',
                uIdentification: '123456789',
            } as User;

            jest.spyOn(userRepository, 'findOne').mockResolvedValue(existingUser);

            await expect(service.createUser(createUserDto))
                .rejects
                .toThrow(new BadRequestException('La identificación ya está en uso'));
        });
    });

    describe('TC_UNIT_USERS_004: createUser - Rol no existe', () => {
        it('Debe lanzar error si rol no existe', async () => {
            const createUserDto = {
                uIdentification: '123456789',
                uEmail: 'juan@example.com',
                uPassword: 'SecurePass123!',
                roleId: 99,
                uName: 'Juan',
                uFLastName: 'Pérez',
                uSLastName: 'García',
            };

            jest.spyOn(userRepository, 'findOne').mockResolvedValue(null);
            jest.spyOn(roleRepository, 'findOne').mockResolvedValue(null);

            await expect(service.createUser(createUserDto))
                .rejects
                .toThrow(new BadRequestException('Rol no encontrado'));
        });
    });

    describe('TC_UNIT_USERS_005: createUser - Contraseña débil', () => {
        it('Debe lanzar error si contraseña no es válida', async () => {
            const createUserDto = {
                uIdentification: '123456789',
                uEmail: 'juan@example.com',
                uPassword: '123',
                roleId: 1,
                uName: 'Juan',
                uFLastName: 'Pérez',
                uSLastName: 'García',
            };

            const mockRole: Role = { id: 1, rName: 'Admin' } as Role;

            jest.spyOn(userRepository, 'findOne').mockResolvedValue(null);
            jest.spyOn(roleRepository, 'findOne').mockResolvedValue(mockRole);
            jest.spyOn(PasswordUtil, 'validatePasswordStrength').mockReturnValue({
                isValid: false,
                errors: ['Contraseña muy corta', 'Debe contener mayúsculas']
            });

            await expect(service.createUser(createUserDto))
                .rejects
                .toThrow(BadRequestException);
        });
    });

    describe('TC_UNIT_USERS_006: findAll - Obtener todos los usuarios', () => {
        it('Debe retornar lista de usuarios', async () => {
            const mockUsers: User[] = [
                { id: 1, uName: 'Juan', uEmail: 'juan@example.com', uIsActive: true } as User,
                { id: 2, uName: 'María', uEmail: 'maria@example.com', uIsActive: true } as User,
            ];

            jest.spyOn(userRepository, 'find').mockResolvedValue(mockUsers);

            const result = await service.findAll();

            expect(result).toEqual(mockUsers);
            expect(userRepository.find).toHaveBeenCalledWith({
                relations: ['role'],
                select: expect.any(Object),
            });
        });
    });

    describe('TC_UNIT_USERS_007: findById - Obtener usuario por ID', () => {
        it('Debe retornar usuario si existe', async () => {
            const mockUser: User = {
                id: 1,
                uName: 'Juan',
                uEmail: 'juan@example.com',
                uIsActive: true,
            } as User;

            jest.spyOn(userRepository, 'findOne').mockResolvedValue(mockUser);

            const result = await service.findById(1);

            expect(result).toEqual(mockUser);
            expect(userRepository.findOne).toHaveBeenCalledWith({
                where: { id: 1 },
                relations: ['role'],
                select: expect.any(Object),
            });
        });
    });

    describe('TC_UNIT_USERS_008: findById - Usuario no encontrado', () => {
        it('Debe lanzar error si usuario no existe', async () => {
            jest.spyOn(userRepository, 'findOne').mockResolvedValue(null);

            await expect(service.findById(999))
                .rejects
                .toThrow(new NotFoundException('Usuario no encontrado'));
        });
    });

    describe('TC_UNIT_USERS_009: findByEmail - Obtener usuario por email', () => {
        it('Debe retornar usuario si email existe', async () => {
            const mockUser: User = {
                id: 1,
                uName: 'Juan',
                uEmail: 'juan@example.com',
                uIsActive: true,
            } as User;

            jest.spyOn(userRepository, 'findOne').mockResolvedValue(mockUser);

            const result = await service.findByEmail('juan@example.com');

            expect(result).toEqual(mockUser);
            expect(userRepository.findOne).toHaveBeenCalledWith({
                where: { uEmail: 'juan@example.com' },
                relations: ['role'],
            });
        });
    });

    describe('TC_UNIT_USERS_010: findByEmail - Email no existe', () => {
        it('Debe lanzar error si email no existe', async () => {
            jest.spyOn(userRepository, 'findOne').mockResolvedValue(null);

            await expect(service.findByEmail('noexiste@example.com'))
                .rejects
                .toThrow(new NotFoundException('Usuario no encontrado'));
        });
    });

    describe('TC_UNIT_USERS_011: updateUser - Actualizar usuario', () => {
        it('Debe actualizar usuario exitosamente', async () => {
            const mockUser: User = {
                id: 1,
                uName: 'Juan',
                uEmail: 'juan@example.com',
                roleId: 1,
                uIsActive: true,
            } as User;

            const updatedUser: User = {
                ...mockUser,
                uName: 'Juan Actualizado',
            };

            const updateUserDto = { uName: 'Juan Actualizado' };

            jest.spyOn(userRepository, 'findOne').mockResolvedValue(mockUser);
            jest.spyOn(userRepository, 'save').mockResolvedValue(updatedUser);
            jest.spyOn(auditService, 'createDigitalRecord').mockResolvedValue(undefined);

            const result = await service.updateUser(1, updateUserDto, 1);

            expect(result.uName).toEqual('Juan Actualizado');
            expect(auditService.createDigitalRecord).toHaveBeenCalled();
        });
    });

    describe('TC_UNIT_USERS_012: updateUser - Cambio de rol', () => {
        it('Debe registrar cambio de rol', async () => {
            const mockUser: User = {
                id: 1,
                uName: 'Juan',
                roleId: 1,
            } as User;

            const oldRole: Role = { id: 1, rName: 'User' } as Role;
            const newRole: Role = { id: 2, rName: 'Admin' } as Role;

            const updateUserDto = { roleId: 2 };

            jest.spyOn(userRepository, 'findOne').mockResolvedValue(mockUser);
            jest.spyOn(roleRepository, 'findOne')
                .mockResolvedValueOnce(oldRole)
                .mockResolvedValueOnce(newRole)
                .mockResolvedValueOnce(newRole); // Para la tercera validación
            jest.spyOn(roleChangesService, 'createRoleChange').mockResolvedValue(undefined);
            jest.spyOn(userRepository, 'save').mockResolvedValue({ ...mockUser, roleId: 2 });
            jest.spyOn(auditService, 'createDigitalRecord').mockResolvedValue(undefined);

            await service.updateUser(1, updateUserDto, 1);

            expect(roleChangesService.createRoleChange).toHaveBeenCalledWith({
                rcOldRole: 'User',
                rcNewRole: 'Admin',
                idUser: 1,
                changedBy: 1,
            });
        });
    });

    describe('TC_UNIT_USERS_013: updateUser - Email duplicado', () => {
        it('Debe lanzar error si nuevo email ya existe', async () => {
            const mockUser: User = {
                id: 1,
                uEmail: 'juan@example.com',
            } as User;

            const existingUser: User = {
                id: 2,
                uEmail: 'nuevo@example.com',
            } as User;

            const updateUserDto = { uEmail: 'nuevo@example.com' };

            jest.spyOn(userRepository, 'findOne')
                .mockResolvedValueOnce(mockUser)
                .mockResolvedValueOnce(existingUser);

            await expect(service.updateUser(1, updateUserDto, 1))
                .rejects
                .toThrow(new BadRequestException('El email ya está en uso'));
        });
    });

    describe('TC_UNIT_USERS_014: changePassword - Cambiar contraseña', () => {
        it('Debe cambiar contraseña exitosamente', async () => {
            const mockUser: User = {
                id: 1,
                uPassword: 'hashedOldPassword',
            } as User;

            const changePasswordDto = {
                currentPassword: 'OldPass123!',
                newPassword: 'NewPass123!',
            };

            jest.spyOn(userRepository, 'findOne').mockResolvedValue(mockUser);
            jest.spyOn(PasswordUtil, 'verify').mockResolvedValue(true);
            jest.spyOn(PasswordUtil, 'validatePasswordStrength').mockReturnValue({ isValid: true, errors: [] });
            jest.spyOn(PasswordUtil, 'hash').mockResolvedValue('hashedNewPassword');
            jest.spyOn(userRepository, 'update').mockResolvedValue(undefined);
            jest.spyOn(auditService, 'createDigitalRecord').mockResolvedValue(undefined);

            const result = await service.changePassword(1, changePasswordDto);

            expect(result.success).toBe(true);
            expect(userRepository.update).toHaveBeenCalledWith(1, { uPassword: 'hashedNewPassword' });
        });
    });

    describe('TC_UNIT_USERS_015: changePassword - Contraseña actual incorrecta', () => {
        it('Debe lanzar error si contraseña actual es incorrecta', async () => {
            const mockUser: User = {
                id: 1,
                uPassword: 'hashedOldPassword',
            } as User;

            const changePasswordDto = {
                currentPassword: 'WrongPass123!',
                newPassword: 'NewPass123!',
            };

            jest.spyOn(userRepository, 'findOne').mockResolvedValue(mockUser);
            jest.spyOn(PasswordUtil, 'verify').mockResolvedValue(false);

            await expect(service.changePassword(1, changePasswordDto))
                .rejects
                .toThrow(new BadRequestException('Contraseña actual incorrecta'));
        });
    });

    describe('TC_UNIT_USERS_016: toggleUserStatus - Alternar estado', () => {
        it('Debe desactivar usuario si está activo', async () => {
            const mockUser: User = {
                id: 1,
                uIsActive: true,
                uName: 'Juan',
            } as User;

            const deactivatedUser: User = {
                ...mockUser,
                uIsActive: false,
            };

            jest.spyOn(userRepository, 'findOne').mockResolvedValue(mockUser);
            jest.spyOn(userRepository, 'save').mockResolvedValue(deactivatedUser);
            jest.spyOn(auditService, 'createDigitalRecord').mockResolvedValue(undefined);

            const result = await service.toggleUserStatus(1, 1);

            expect(result.uIsActive).toBe(false);
            expect(auditService.createDigitalRecord).toHaveBeenCalled();
        });
    });

    describe('TC_UNIT_USERS_017: deleteUser - Eliminar usuario (soft delete)', () => {
        it('Debe desactivar usuario al eliminar', async () => {
            const mockUser: User = {
                id: 1,
                uIsActive: true,
                uName: 'Juan',
            } as User;

            jest.spyOn(userRepository, 'findOne').mockResolvedValue(mockUser);
            jest.spyOn(userRepository, 'save').mockResolvedValue(mockUser);
            jest.spyOn(auditService, 'createDigitalRecord').mockResolvedValue(undefined);

            const result = await service.deleteUser(1, 1);

            expect(result.success).toBe(true);
            expect(userRepository.save).toHaveBeenCalled();
        });
    });

    describe('TC_UNIT_USERS_018: findByRole - Obtener usuarios por rol', () => {
        it('Debe retornar usuarios del rol especificado', async () => {
            const mockUsers: User[] = [
                { id: 1, uName: 'Juan', roleId: 1, uIsActive: true } as User,
                { id: 2, uName: 'Pedro', roleId: 1, uIsActive: true } as User,
            ];

            jest.spyOn(userRepository, 'find').mockResolvedValue(mockUsers);

            const result = await service.findByRole(1);

            expect(result).toEqual(mockUsers);
            expect(userRepository.find).toHaveBeenCalledWith({
                where: { roleId: 1, uIsActive: true },
                relations: ['role'],
                select: expect.any(Object),
            });
        });
    });

    describe('TC_UNIT_USERS_019: searchUsers - Buscar usuarios', () => {
        it('Debe retornar usuarios que coinciden con búsqueda', async () => {
            const mockUsers: User[] = [
                { id: 1, uName: 'Juan Pérez', uEmail: 'juan@example.com' } as User,
            ];

            const queryBuilder = {
                leftJoinAndSelect: jest.fn().mockReturnThis(),
                where: jest.fn().mockReturnThis(),
                select: jest.fn().mockReturnThis(),
                getMany: jest.fn().mockResolvedValue(mockUsers),
            };

            jest.spyOn(userRepository, 'createQueryBuilder').mockReturnValue(queryBuilder as any);

            const result = await service.searchUsers('Juan');

            expect(result).toEqual(mockUsers);
            expect(userRepository.createQueryBuilder).toHaveBeenCalledWith('user');
        });
    });
});