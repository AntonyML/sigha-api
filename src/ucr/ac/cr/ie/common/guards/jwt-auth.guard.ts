import { Injectable, ExecutionContext, UnauthorizedException, Inject } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
import { JwtService } from '@nestjs/jwt';
import { Repository } from 'typeorm';
import { UserSession } from '../../domain/auth/sessions/user-session.entity';
import { User } from '../../domain/auth/core/user.entity';
import * as crypto from 'crypto';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
    constructor(
        private reflector: Reflector,
        private jwtService: JwtService,
        @Inject('UserSessionRepository')
        private readonly sessionRepository: Repository<UserSession>,
        @Inject('UserRepository')
        private readonly userRepository: Repository<User>,
    ) {
        super();
    }

    canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
        // Verificar si la ruta es pública
        const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);

        if (isPublic) {
            return true;
        }

        // Validar token
        return this.validateRequest(context);
    }

    private async validateRequest(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();
        const token = this.extractTokenFromHeader(request);

        console.log('\n=== JWT GUARD DEBUG ===');
        console.log('Token exists:', !!token);
        console.log('Token length:', token?.length || 0);
        console.log('Token (first 50 chars):', token?.substring(0, 50) + '...' || 'NO_TOKEN');

        if (!token) {
            console.log('ERROR: Token not provided');
            throw new UnauthorizedException('Token no proporcionado');
        }

        try {
            // Verificar token JWT
            const payload = this.jwtService.verify(token);
            console.log('JWT Payload:', {
                sub: payload.sub,
                email: payload.email,
                iat: payload.iat,
                exp: payload.exp,
                require2FA: payload.require2FA
            });
            console.log('Current timestamp:', Math.floor(Date.now() / 1000));
            console.log('Token expires at:', payload.exp);
            console.log('Time until expiry (seconds):', payload.exp - Math.floor(Date.now() / 1000));

            // Verificar que no sea un token temporal de 2FA
            if (payload.require2FA) {
                console.log('ERROR: Temporal 2FA token used for regular access');
                throw new UnauthorizedException('Token temporal no válido para acceso');
            }

            // Verificar sesión activa
            const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
            console.log('Token hash:', tokenHash.substring(0, 20) + '...');
            
            const session = await this.sessionRepository.findOne({
                where: {
                    sessionToken: tokenHash,
                    userId: payload.sub,
                    isActive: true,
                },
            });

            console.log('Session found:', !!session);
            if (session) {
                console.log('Session details:', {
                    id: session.id,
                    userId: session.userId,
                    isActive: session.isActive,
                    expiresAt: session.expiresAt,
                    currentTime: new Date(),
                    expired: new Date() > session.expiresAt
                });
            }

            if (!session) {
                console.log('ERROR: Session not found in database');
                throw new UnauthorizedException('Sesión no encontrada o inválida');
            }

            // Verificar si la sesión expiró
            if (new Date() > session.expiresAt) {
                console.log('ERROR: Session expired in database');
                session.isActive = false;
                await this.sessionRepository.save(session);
                throw new UnauthorizedException('Sesión expirada');
            }

            // NOTA: No actualizamos lastActivity para evitar problemas con timestamps
            console.log('Session validation successful - skipping activity update');

            // Cargar usuario completo con su rol
            const user = await this.userRepository.findOne({
                where: { id: payload.sub, uIsActive: true },
                relations: ['role'],
            });

            console.log('User found:', !!user);
            if (user) {
                console.log('User details:', {
                    id: user.id,
                    email: user.uEmail,
                    roleId: user.roleId,
                    roleName: user.role?.rName,
                    isActive: user.uIsActive
                });
            }

            if (!user) {
                console.log('ERROR: User not found or inactive');
                throw new UnauthorizedException('Usuario no encontrado');
            }

            // Adjuntar usuario completo al request
            request.user = {
                userId: user.id,
                uEmail: user.uEmail,
                roleId: user.roleId,
                role: user.role,
            };
            
            console.log('SUCCESS: Request user attached:', {
                userId: request.user.userId,
                email: request.user.uEmail
            });
            console.log('=== JWT GUARD DEBUG END ===\n');
            
            return true;
        } catch (error) {
            console.log('JWT GUARD ERROR:', error.message);
            console.log('=== JWT GUARD DEBUG END ===\n');
            if (error instanceof UnauthorizedException) {
                throw error;
            }
            throw new UnauthorizedException('Token inválido');
        }
    }

    private extractTokenFromHeader(request: any): string | undefined {
        const [type, token] = request.headers.authorization?.split(' ') ?? [];
        return type === 'Bearer' ? token : undefined;
    }
}