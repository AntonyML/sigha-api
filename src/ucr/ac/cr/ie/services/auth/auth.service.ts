import { Injectable, UnauthorizedException, BadRequestException, Inject } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Repository } from 'typeorm';
import { User } from '../../domain/auth/core/user.entity';
import { UserSession } from '../../domain/auth/sessions/user-session.entity';
import { UserTwoFactor } from '../../domain/auth/security/user-two-factor.entity';
import { PasswordUtil, DateUtil, TwoFactorUtil } from '../../common/utils';
import { LoginDto } from '../../dto/auth';
import { LoginResponse, Setup2FAResponse, Enable2FAResponse } from '../../interfaces/auth';
import { SuccessResponse } from '../../interfaces';
import * as crypto from 'crypto';

@Injectable()
export class AuthService {
    constructor(
        private jwtService: JwtService,
        private configService: ConfigService,
        @Inject('UserRepository')
        private userRepository: Repository<User>,
        @Inject('UserSessionRepository')
        private sessionRepository: Repository<UserSession>,
        @Inject('UserTwoFactorRepository')
        private twoFactorRepository: Repository<UserTwoFactor>,
    ) { }

    /**
     * Inicia sesión de usuario
     */
    async login(loginDto: LoginDto, ipAddress?: string, userAgent?: string): Promise<LoginResponse> {
        const { uEmail, uPassword, twoFactorCode } = loginDto;

        // Buscar usuario por email
        const user = await this.userRepository.findOne({
            where: { uEmail, uIsActive: true },
            relations: ['role'],
        });

        if (!user) {
            throw new UnauthorizedException('Credenciales inválidas');
        }

        // Verificar contraseña
        const isPasswordValid = await PasswordUtil.verify(uPassword, user.uPassword);
        if (!isPasswordValid) {
            throw new UnauthorizedException('Credenciales inválidas');
        }

        // Verificar si tiene 2FA habilitado
        const twoFactor = await this.twoFactorRepository.findOne({
            where: { userId: user.id, tfaEnabled: true },
        });

        // Si tiene 2FA habilitado pero no proporcionó código
        if (twoFactor && !twoFactorCode) {
            // Generar token temporal para 2FA
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
                    role: user.role.rName,
                },
                requiresTwoFactor: true,
                tempToken,
            };
        }

        // Si tiene 2FA habilitado y proporcionó código, verificarlo
        if (twoFactor && twoFactorCode) {
            const isValidCode = TwoFactorUtil.verifyToken(twoFactorCode, twoFactor.tfaSecret);

            if (!isValidCode) {
                // Verificar si es un código de respaldo
                const backupCodes = JSON.parse(twoFactor.tfaBackupCodes || '[]');
                const isValidBackupCode = TwoFactorUtil.verifyBackupCode(twoFactorCode, backupCodes);

                if (!isValidBackupCode) {
                    throw new UnauthorizedException('Código de autenticación inválido');
                }

                // Remover el código de respaldo usado
                const updatedBackupCodes = TwoFactorUtil.removeUsedBackupCode(twoFactorCode, backupCodes);
                twoFactor.tfaBackupCodes = JSON.stringify(updatedBackupCodes);
                await this.twoFactorRepository.save(twoFactor);
            }

            // Actualizar última vez usado 2FA
            twoFactor.tfaLastUsed = new Date();
            await this.twoFactorRepository.save(twoFactor);
        }

        // Generar tokens de acceso
        return this.generateTokens(user, ipAddress, userAgent);
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
                relations: ['role'],
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

            // Verificar código 2FA
            const isValidCode = TwoFactorUtil.verifyToken(twoFactorCode, twoFactor.tfaSecret);

            if (!isValidCode) {
                // Verificar códigos de respaldo
                const backupCodes = JSON.parse(twoFactor.tfaBackupCodes || '[]');
                const isValidBackupCode = TwoFactorUtil.verifyBackupCode(twoFactorCode, backupCodes);

                if (!isValidBackupCode) {
                    throw new UnauthorizedException('Código de autenticación inválido');
                }

                // Remover código de respaldo usado
                const updatedBackupCodes = TwoFactorUtil.removeUsedBackupCode(twoFactorCode, backupCodes);
                twoFactor.tfaBackupCodes = JSON.stringify(updatedBackupCodes);
                await this.twoFactorRepository.save(twoFactor);
            }

            // Actualizar última vez usado
            twoFactor.tfaLastUsed = new Date();
            await this.twoFactorRepository.save(twoFactor);

            return this.generateTokens(user, ipAddress, userAgent);
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

        // Verificar si ya tiene 2FA configurado
        let twoFactor = await this.twoFactorRepository.findOne({
            where: { userId },
        });

        if (twoFactor && twoFactor.tfaEnabled) {
            throw new BadRequestException('2FA ya está habilitado para este usuario');
        }

        // Generar configuración 2FA
        const setup = await TwoFactorUtil.setupTwoFactor(user.uEmail);

        // Guardar o actualizar configuración
        if (!twoFactor) {
            twoFactor = new UserTwoFactor(
                0, // ID se auto-genera
                userId,
                setup.secret,
                false, // No habilitado hasta confirmar
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
        console.log('\n=== ENABLE 2FA DEBUG ===');
        console.log('User ID:', userId);
        console.log('Verification Code:', verificationCode);
        
        const twoFactor = await this.twoFactorRepository.findOne({
            where: { userId, tfaEnabled: false },
        });

        console.log('2FA record found:', !!twoFactor);
        if (twoFactor) {
            console.log('2FA record ID:', twoFactor.id);
            console.log('Secret exists:', !!twoFactor.tfaSecret);
            console.log('Backup codes exist:', !!twoFactor.tfaBackupCodes);
            
            const backupCodes = JSON.parse(twoFactor.tfaBackupCodes || '[]');
            console.log('Backup codes count:', backupCodes.length);
            console.log('Backup codes:', backupCodes);
        }

        if (!twoFactor) {
            console.log('ERROR: 2FA no configurado o ya habilitado');
            throw new BadRequestException('2FA no configurado o ya habilitado');
        }

        // Verificar código TOTP o backup code
        console.log('\n--- STARTING VERIFICATION ---');
        let isValid = TwoFactorUtil.verifyToken(verificationCode, twoFactor.tfaSecret);
        console.log('TOTP verification result:', isValid);
        
        let usedBackupCode = false;
        
        if (!isValid) {
            console.log('TOTP failed, checking backup codes');
            // Si el código TOTP no es válido, verificar si es un backup code
            const backupCodes = JSON.parse(twoFactor.tfaBackupCodes || '[]');
            console.log('Available backup codes:', backupCodes);
            console.log('Checking if code matches any backup code:', verificationCode);
            
            isValid = TwoFactorUtil.verifyBackupCode(verificationCode, backupCodes);
            console.log('Backup code verification result:', isValid);
            
            if (isValid) {
                console.log('SUCCESS: Backup code matched');
                // Remover el backup code usado
                const updatedBackupCodes = TwoFactorUtil.removeUsedBackupCode(verificationCode, backupCodes);
                twoFactor.tfaBackupCodes = JSON.stringify(updatedBackupCodes);
                usedBackupCode = true;
                console.log('Backup code used for 2FA enable:', verificationCode);
                console.log('Remaining backup codes:', updatedBackupCodes);
            } else {
                console.log('FAILED: Backup code not found');
            }
        } else {
            console.log('SUCCESS: TOTP code verified');
        }
        
        if (!isValid) {
            throw new BadRequestException('Código de verificación inválido');
        }

        // Habilitar 2FA
        twoFactor.tfaEnabled = true;
        await this.twoFactorRepository.save(twoFactor);

        const backupCodes = JSON.parse(twoFactor.tfaBackupCodes || '[]');

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

        return { success: true };
    }

    /**
     * Cierra sesión
     */
    async logout(token: string): Promise<SuccessResponse> {
        const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

        const session = await this.sessionRepository.findOne({
            where: { sessionToken: tokenHash, isActive: true },
        });

        if (session) {
            session.isActive = false;
            await this.sessionRepository.save(session);
        }

        return { success: true };
    }

    /**
     * Genera tokens de acceso y actualiza sesión
     */
    private async generateTokens(user: User, ipAddress?: string, userAgent?: string): Promise<LoginResponse> {
        const payload = {
            sub: user.id,
            email: user.uEmail,
            roleId: user.roleId,
            role: user.role.rName
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

        return {
            accessToken,
            refreshToken,
            user: {
                id: user.id,
                uEmail: user.uEmail,
                uName: user.uName,
                role: user.role.rName,
            },
        };
    }
}

export { LoginDto };
