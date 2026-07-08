import { Injectable, UnauthorizedException, BadRequestException, Inject, NotFoundException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Repository, MoreThan } from 'typeorm';
import { User } from '../../domain/auth/core/user.entity';
import { UserSession } from '../../domain/auth/sessions/user-session.entity';
import { UserTwoFactor } from '../../domain/auth/security/user-two-factor.entity';
import { PasswordResetToken } from '../../domain/auth/tokens/password-reset-token.entity';
import { PasswordUtil, DateUtil, TwoFactorUtil } from '../../common/utils';
import { LoginDto, ForgotPasswordDto, ResetPasswordDto } from '../../dto/auth';
import { LoginResponse, Setup2FAResponse, Enable2FAResponse, TwoFactorStatusResponse } from '../../interfaces/auth';
import { SuccessResponse, MessageResponse } from '../../interfaces';
import * as crypto from 'crypto';
import { EmailService } from '../email/email.service';
import { AuditService } from '../audit/audit.service';
import { UserRoleService } from './user-role.service';
import { AuditReportType, AuditAction } from '../../domain/audit';
import { LoggerService } from '@common/services/logger.service';
import { sanitizeForLogging } from '@common/utils/logger-sanitizer';

@Injectable()
export class AuthService {
    constructor(
        private jwtService: JwtService,
        private configService: ConfigService,
        private logger: LoggerService,
        @Inject('UserRepository')
        private userRepository: Repository<User>,
        @Inject('UserSessionRepository')
        private sessionRepository: Repository<UserSession>,
        @Inject('UserTwoFactorRepository')
        private twoFactorRepository: Repository<UserTwoFactor>,
        @Inject('PasswordResetTokenRepository')
        private passwordResetTokenRepository: Repository<PasswordResetToken>,
        private readonly emailService: EmailService,
        private readonly auditService: AuditService,
        private readonly userRoleService: UserRoleService,
    ) { }

    /**
     * Resolves the canonical role identity for a user from the user_roles
     * bridge. Returns the user's role names (sorted) and role ids (sorted).
     */
    private async resolveUserRoles(userId: number): Promise<{ roleIds: number[]; roles: string[] }> {
        const userRoles = await this.userRoleService.findRolesByUserId(userId);
        const roleIds = userRoles.map(r => r.id).sort((a, b) => a - b);
        const roles = userRoles.map(r => r.rName).sort();
        return { roleIds, roles };
    }

    /**
     * Inicia sesión de usuario
     */
    async login(loginDto: LoginDto, ipAddress?: string, userAgent?: string): Promise<LoginResponse> {
        if (!loginDto || !loginDto.uEmail || !loginDto.uPassword) {
            throw new UnauthorizedException('Email y contraseña son requeridos');
        }

        const { uEmail, uPassword, twoFactorCode } = loginDto;

        const user = await this.userRepository.findOne({
            where: { uEmail, uIsActive: true },
        });

        if (!user) {
            throw new UnauthorizedException('Credenciales inválidas');
        }

        const isPasswordValid = await PasswordUtil.verify(uPassword, user.uPassword);
        if (!isPasswordValid) {
            throw new UnauthorizedException('Credenciales inválidas');
        }

        const { roles } = await this.resolveUserRoles(user.id);

        const twoFactor = await this.twoFactorRepository.findOne({
            where: { userId: user.id, tfaEnabled: true },
        });

        if (twoFactor && !twoFactorCode) {
            const tempToken = this.jwtService.sign(
                { sub: user.id, email: user.uEmail, require2FA: true },
                { expiresIn: '5m' }
            );

            return {
                accessToken: '',
                user: {
                    id: user.id,
                    uEmail: user.uEmail,
                    uName: user.uName,
                    roles,
                },
                requiresTwoFactor: true,
                tempToken,
            };
        }

        if (twoFactor && twoFactorCode) {
            const isValidCode = TwoFactorUtil.verifyToken(twoFactorCode, twoFactor.tfaSecret);

            if (!isValidCode) {
                const backupCodes = JSON.parse(twoFactor.tfaBackupCodes || '[]');
                const isValidBackupCode = TwoFactorUtil.verifyBackupCode(twoFactorCode, backupCodes);

                if (!isValidBackupCode) {
                    throw new UnauthorizedException('Código de autenticación inválido');
                }

                const updatedBackupCodes = TwoFactorUtil.removeUsedBackupCode(twoFactorCode, backupCodes);
                twoFactor.tfaBackupCodes = JSON.stringify(updatedBackupCodes);
                await this.twoFactorRepository.save(twoFactor);
            }

            twoFactor.tfaLastUsed = new Date();
            await this.twoFactorRepository.save(twoFactor);

            return this.generateTokens(user, ipAddress, userAgent, true);
        }

        return this.generateTokens(user, ipAddress, userAgent, false);
    }

    /**
     * Completa el login con 2FA
     */
    async completeTwoFactorLogin(tempToken: string, twoFactorCode: string, ipAddress?: string, userAgent?: string): Promise<LoginResponse> {
        try {
            const payload = this.jwtService.verify(tempToken);

            if (!payload.require2FA) {
                throw new UnauthorizedException('Token temporal inválido');
            }

            const user = await this.userRepository.findOne({
                where: { id: payload.sub, uIsActive: true },
            });

            if (!user) {
                throw new UnauthorizedException('Usuario no encontrado');
            }

            const twoFactor = await this.twoFactorRepository.findOne({
                where: { userId: user.id, tfaEnabled: true },
            });

            if (!twoFactor) {
                throw new UnauthorizedException('2FA no configurado');
            }

            const isValidCode = TwoFactorUtil.verifyToken(twoFactorCode, twoFactor.tfaSecret);

            if (!isValidCode) {
                const backupCodes = JSON.parse(twoFactor.tfaBackupCodes || '[]');
                const isValidBackupCode = TwoFactorUtil.verifyBackupCode(twoFactorCode, backupCodes);

                if (!isValidBackupCode) {
                    throw new UnauthorizedException('Código de autenticación inválido');
                }

                const updatedBackupCodes = TwoFactorUtil.removeUsedBackupCode(twoFactorCode, backupCodes);
                twoFactor.tfaBackupCodes = JSON.stringify(updatedBackupCodes);
                await this.twoFactorRepository.save(twoFactor);
            }

            twoFactor.tfaLastUsed = new Date();
            await this.twoFactorRepository.save(twoFactor);

            const result = await this.generateTokens(user, ipAddress, userAgent, true);

            // Registrar auditoría de login exitoso con 2FA
            await this.auditService.createDigitalRecord(
                user.id,
                {
                    action: AuditAction.LOGIN,
                    tableName: 'users',
                    recordId: user.id,
                    description: `Login exitoso con 2FA desde IP: ${ipAddress || 'unknown'}`
                }
            );

            return result;
        } catch (error) {
            throw new UnauthorizedException('Token temporal inválido o expirado');
        }
    }

    /**
     * Configura 2FA para un usuario
     */
    async setup2FA(userId: number): Promise<Setup2FAResponse> {
        const user = await this.userRepository.findOne({
            where: { id: userId },
        });

        if (!user) {
            throw new BadRequestException('Usuario no encontrado');
        }

        let twoFactor = await this.twoFactorRepository.findOne({
            where: { userId },
        });

        if (twoFactor && twoFactor.tfaEnabled) {
            throw new BadRequestException('2FA ya está habilitado para este usuario');
        }

        const setup = await TwoFactorUtil.setupTwoFactor(user.uEmail);

        if (!twoFactor) {
            twoFactor = new UserTwoFactor(
                0,
                userId,
                setup.secret,
                false,
                JSON.stringify(setup.backupCodes)
            );
        } else {
            twoFactor.tfaSecret = setup.secret;
            twoFactor.tfaBackupCodes = JSON.stringify(setup.backupCodes);
            twoFactor.tfaEnabled = false;
        }

        await this.twoFactorRepository.save(twoFactor);

        return setup;
    }

    /**
     * Habilita 2FA después de verificar el código
     */
    async enable2FA(userId: number, verificationCode: string): Promise<Enable2FAResponse> {

        const twoFactor = await this.twoFactorRepository.findOne({
            where: { userId, tfaEnabled: false },
        });

        if (!twoFactor) {
            throw new BadRequestException('2FA no configurado o ya habilitado');
        }

        const user = await this.userRepository.findOne({ where: { id: userId } });
        if (!user) {
            throw new BadRequestException('Usuario no encontrado');
        }

        let isValid = TwoFactorUtil.verifyToken(verificationCode, twoFactor.tfaSecret);

        let usedBackupCode = false;

        if (!isValid) {
            const backupCodes = JSON.parse(twoFactor.tfaBackupCodes || '[]');

            isValid = TwoFactorUtil.verifyBackupCode(verificationCode, backupCodes);

            if (isValid) {
                const updatedBackupCodes = TwoFactorUtil.removeUsedBackupCode(verificationCode, backupCodes);
                twoFactor.tfaBackupCodes = JSON.stringify(updatedBackupCodes);
                usedBackupCode = true;
            }
        }

        if (!isValid) {
            throw new BadRequestException('Código de verificación inválido');
        }

        twoFactor.tfaEnabled = true;
        await this.twoFactorRepository.save(twoFactor);

        const backupCodes = JSON.parse(twoFactor.tfaBackupCodes || '[]');

        // Enviar códigos de respaldo por email vía Resend (best-effort, no bloquea la habilitación).
        if (Array.isArray(backupCodes) && backupCodes.length > 0) {
            try {
                const result = await this.emailService.sendBackupCodes({
                    to: {
                        email: user.uEmail,
                        firstName: user.uName,
                        lastName: user.uFLastName,
                    },
                    codes: backupCodes,
                });
                await this.auditService.createDigitalRecord(
                    userId,
                    {
                        action: AuditAction.CREATE,
                        tableName: 'notifications',
                        recordId: userId,
                        description: result.success
                            ? `Envío email Resend: códigos de respaldo 2FA (${backupCodes.length})`
                            : `Fallo envío email Resend: códigos de respaldo 2FA (${result.error ?? 'sin detalle'})`,
                    }
                );
            } catch (err) {
                this.logger.error('Error enviando códigos de respaldo por email:', err);
                await this.auditService.createDigitalRecord(
                    userId,
                    {
                        action: AuditAction.CREATE,
                        tableName: 'notifications',
                        recordId: userId,
                        description: 'Fallo envío email Resend: códigos de respaldo 2FA',
                    }
                );
            }
        }

        // Registrar auditoría de habilitación de 2FA
        await this.auditService.createDigitalRecord(
            userId,
            {
                action: AuditAction.UPDATE,
                tableName: 'user_two_factors',
                recordId: userId,
                description: '2FA habilitado exitosamente'
            }
        );

        return {
            success: true,
            backupCodes,
        };
    }

    /**
     * Deshabilita 2FA
     */
    async disable2FA(userId: number): Promise<SuccessResponse> {
        const twoFactor = await this.twoFactorRepository.findOne({
            where: { userId, tfaEnabled: true },
        });

        if (!twoFactor) {
            throw new BadRequestException('2FA no está habilitado');
        }

        // Eliminar configuración 2FA
        await this.twoFactorRepository.remove(twoFactor);

        // Registrar auditoría de deshabilitación de 2FA
        await this.auditService.createDigitalRecord(
            userId,
            {
                action: AuditAction.DELETE,
                tableName: 'user_two_factors',
                recordId: userId,
                description: '2FA deshabilitado'
            }
        );

        return { success: true };
    }

    /**
     * Obtiene el estado actual de 2FA para un usuario
     */
    async get2FAStatus(userId: number): Promise<TwoFactorStatusResponse> {
        const twoFactor = await this.twoFactorRepository.findOne({
            where: { userId },
        });

        if (!twoFactor) {
            return {
                enabled: false,
                lastUsed: null,
                hasBackupCodes: false,
            };
        }

        const backupCodes = JSON.parse(twoFactor.tfaBackupCodes || '[]');

        return {
            enabled: twoFactor.tfaEnabled,
            lastUsed: twoFactor.tfaLastUsed,
            hasBackupCodes: backupCodes.length > 0,
        };
    }

    /**
     * Cierra sesión
     */
    async logout(token: string, userId?: number, ipAddress?: string, userAgent?: string): Promise<SuccessResponse> {
        const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

        const session = await this.sessionRepository.findOne({
            where: { sessionToken: tokenHash, isActive: true },
        });

        if (session) {
            session.isActive = false;
            await this.sessionRepository.save(session);

            // Registrar auditoría de logout
            await this.auditService.createDigitalRecord(
                session.userId,
                {
                    action: AuditAction.LOGOUT,
                    tableName: 'users',
                    recordId: session.userId,
                    description: `Logout desde IP: ${ipAddress || session.ipAddress || 'unknown'}`
                }
            );

            // Calcular duración de la sesión abierta y registrarla en audit_reports.
            // (compute_audit_session_duration definida en la migración 009.)
            try {
                const duration = await this.auditService.computeSessionDuration(session.userId);
                if (duration > 0) {
                    await this.auditService.logAuditDbFunction({
                        userId: session.userId,
                        drAction: AuditAction.LOGOUT,
                        arType: AuditReportType.LOGIN_ATTEMPTS,
                        arAction: AuditAction.LOGOUT,
                        arEntityName: 'users',
                        arEntityId: session.userId,
                        arObservations: `Sesión cerrada tras ${duration} segundos`,
                        arIpAddress: ipAddress || session.ipAddress,
                        arUserAgent: userAgent,
                    });
                }
            } catch (err) {
                                                                            // Non-fatal: log and continue.
                                                                            this.logger.error('Error stamping session duration on logout', sanitizeForLogging({
                                                                                                            error: err instanceof Error ? err.message : 'Unknown error',
                                                                                                            sessionId: session.id,
                                                                                                            userId: session.userId,
                                                                                                        }));
                                                                        }
        }

        return { success: true };
    }

    /**
     * Genera tokens de acceso y actualiza sesión
     */
    private async generateTokens(user: User, ipAddress?: string, userAgent?: string, twoFactorVerified: boolean = false): Promise<LoginResponse> {
        const { roleIds, roles } = await this.resolveUserRoles(user.id);

        const payload = {
            sub: user.id,
            email: user.uEmail,
            roleIds,
            roles,
            twoFactorVerified
        };

        const accessToken = this.jwtService.sign(payload);
        const refreshToken = this.jwtService.sign(payload, { expiresIn: '7d' });

        // Crear hash del token para almacenar en BD
        const tokenHash = crypto.createHash('sha256').update(accessToken).digest('hex');

        // Crear nueva sesión usando el approach de asignación directa
        const session = new UserSession();
        session.userId = user.id;
        session.sessionToken = tokenHash;
        session.refreshToken = refreshToken;
        session.ipAddress = ipAddress;
        session.userAgent = userAgent;
        session.isActive = true;
        session.expiresAt = DateUtil.addHours(new Date(), 1); // Expira en 1 hora (igual que JWT)

        await this.sessionRepository.save(session);

        // Registrar auditoría de login exitoso
        await this.auditService.createDigitalRecord(
            user.id,
            {
                action: AuditAction.LOGIN,
                tableName: 'users',
                recordId: user.id,
                description: `Login exitoso desde IP: ${ipAddress || 'unknown'}`
            }
        );

        return {
            accessToken,
            refreshToken,
            user: {
                id: user.id,
                uEmail: user.uEmail,
                uName: user.uName,
                roles,
            },
        };
    }

    /**
     * Solicitar recuperación de contraseña
     */
    async forgotPassword(forgotPasswordDto: ForgotPasswordDto): Promise<MessageResponse> {
        const { email } = forgotPasswordDto;

        // Buscar usuario por email
        const user = await this.userRepository.findOne({
            where: { uEmail: email, uIsActive: true },
        });

        if (!user) {
            // No revelar si el email existe o no por seguridad
            return { message: 'Si el email existe, se ha enviado un código de recuperación' };
        }

        // Generar código de 8 dígitos
        const token = Math.floor(10000000 + Math.random() * 90000000).toString();

        // Hashear el token
        const tokenHash = await PasswordUtil.hash(token);

        // Expiración: 15 minutos
        const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

        // Guardar en BD
        const resetToken = this.passwordResetTokenRepository.create({
            userId: user.id,
            token: tokenHash,
            expiresAt,
        });
        await this.passwordResetTokenRepository.save(resetToken);

        // Enviar email con el token usando Resend (best-effort, no bloquea la solicitud).
        try {
            const result = await this.emailService.sendPasswordReset({
                to: {
                    email: user.uEmail,
                    firstName: user.uName,
                    lastName: user.uFLastName,
                },
                code: token,
                expirationLabel: '15 minutos',
            });

            // Registrar auditoría del envío de email.
            await this.auditService.createDigitalRecord(
                user.id,
                {
                    action: AuditAction.CREATE,
                    tableName: 'notifications',
                    recordId: user.id,
                    description: result.success
                        ? 'Envío email Resend: código de recuperación de contraseña'
                        : `Fallo envío email Resend: código de recuperación (${result.error ?? 'sin detalle'})`,
                }
            );
        } catch (error) {
            this.logger.error('Error enviando email de recuperación de contraseña:', error);
            await this.auditService.createDigitalRecord(
                user.id,
                {
                    action: AuditAction.CREATE,
                    tableName: 'notifications',
                    recordId: user.id,
                    description: 'Fallo envío email Resend: código de recuperación de contraseña',
                }
            );
        }

        // Registrar auditoría de solicitud de recuperación de contraseña
        await this.auditService.createDigitalRecord(
            user.id,
            {
                action: AuditAction.CREATE,
                tableName: 'password_reset_tokens',
                recordId: user.id,
                description: 'Token de recuperación de contraseña generado'
            }
        );

        return { message: 'Código de recuperación enviado al email' };
    }

    /**
     * Resetear contraseña con token
     */
    async resetPassword(resetPasswordDto: ResetPasswordDto): Promise<MessageResponse> {
        const { token, newPassword } = resetPasswordDto;

        // Remover espacios del token si los tiene
        const cleanToken = token.replace(/\s/g, '');

        // Buscar tokens válidos (no usados, no expirados)
        const resetTokens = await this.passwordResetTokenRepository.find({
            where: {
                used: false,
                expiresAt: MoreThan(new Date()),
            },
            relations: ['user'],
        });

        let validToken: PasswordResetToken | null = null;
        for (const resetToken of resetTokens) {
            const isValid = await PasswordUtil.verify(cleanToken, resetToken.token);
            if (isValid) {
                validToken = resetToken;
                break;
            }
        }

        if (!validToken) {
            throw new BadRequestException('Token inválido o expirado');
        }

        // Hashear nueva contraseña
        const hashedPassword = await PasswordUtil.hash(newPassword);

        // Actualizar contraseña del usuario
        await this.userRepository.update(validToken.userId, { uPassword: hashedPassword });

        // Marcar token como usado
        validToken.used = true;
        validToken.usedAt = new Date();
        await this.passwordResetTokenRepository.save(validToken);

        // Opcional: Invalidar sesiones activas del usuario
        await this.sessionRepository.update(
            { userId: validToken.userId, isActive: true },
            { isActive: false }
        );

        // Registrar auditoría de cambio de contraseña
        await this.auditService.createDigitalRecord(
            validToken.userId,
            {
                action: AuditAction.UPDATE,
                tableName: 'users',
                recordId: validToken.userId,
                description: 'Contraseña reseteada exitosamente'
            }
        );

        return { message: 'Contraseña actualizada exitosamente' };
    }
}

export { LoginDto };
