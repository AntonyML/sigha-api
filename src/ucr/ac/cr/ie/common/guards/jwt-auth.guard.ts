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

        if (!token) {
            throw new UnauthorizedException('Token no proporcionado');
        }

        try {
            // Verificar token JWT
            const payload = this.jwtService.verify(token);

            // Verificar que no sea un token temporal de 2FA
            if (payload.require2FA) {
                throw new UnauthorizedException('Token temporal no válido para acceso');
            }

            // Verificar sesión activa
            const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
            const session = await this.sessionRepository.findOne({
                where: {
                    sessionToken: tokenHash,
                    userId: payload.sub,
                    isActive: true,
                },
            });

            if (!session) {
                throw new UnauthorizedException('Sesión no encontrada o inválida');
            }

            // Verificar si la sesión expiró
            if (new Date() > session.expiresAt) {
                session.isActive = false;
                await this.sessionRepository.save(session);
                throw new UnauthorizedException('Sesión expirada');
            }

            // Actualizar última actividad sin afectar otros campos
            await this.sessionRepository.update(session.id, { 
                lastActivity: new Date() 
            });

            // Cargar usuario completo con su rol
            const user = await this.userRepository.findOne({
                where: { id: payload.sub, uIsActive: true },
                relations: ['role'],
            });

            if (!user) {
                throw new UnauthorizedException('Usuario no encontrado');
            }

            // Adjuntar usuario completo al request
            request.user = {
                userId: user.id,
                uEmail: user.uEmail,
                roleId: user.roleId,
                role: user.role,
            };
            
            return true;
        } catch (error) {
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