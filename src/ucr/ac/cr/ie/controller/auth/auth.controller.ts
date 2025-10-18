import { Controller, Post, Body, UseGuards, Request, Get, Param, HttpCode } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AuthService, LoginDto } from '../../services/auth/auth.service';
import { JwtAuthGuard, TwoFactorGuard } from '../../common/guards';
import { Public, Require2FA } from '../../common/decorators';

@ApiTags('Autenticación')
@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) { }

    @Public()
    @Post('login')
    @HttpCode(200)
    @ApiOperation({ 
        summary: 'Iniciar sesión',
        description: 'Inicia sesión con email y contraseña. Si el usuario tiene 2FA habilitado, devuelve requiresTwoFactor=true y un tempToken para completar el login con /auth/verify-2fa. Si no tiene 2FA o proporciona el código 2FA correcto, devuelve el token de acceso directamente.'
    })
    @ApiResponse({ 
        status: 200, 
        description: 'Login exitoso o requiere 2FA',
        schema: {
            oneOf: [
                {
                    type: 'object',
                    properties: {
                        accessToken: { type: 'string' },
                        refreshToken: { type: 'string' },
                        user: {
                            type: 'object',
                            properties: {
                                id: { type: 'number' },
                                uEmail: { type: 'string' },
                                uName: { type: 'string' },
                                role: { type: 'string' }
                            }
                        }
                    }
                },
                {
                    type: 'object',
                    properties: {
                        accessToken: { type: 'string', enum: [''] },
                        requiresTwoFactor: { type: 'boolean', enum: [true] },
                        tempToken: { type: 'string' },
                        user: {
                            type: 'object',
                            properties: {
                                id: { type: 'number' },
                                uEmail: { type: 'string' },
                                uName: { type: 'string' },
                                role: { type: 'string' }
                            }
                        }
                    }
                }
            ]
        }
    })
    @ApiResponse({ status: 401, description: 'Credenciales inválidas o código 2FA incorrecto' })
    async login(@Body() loginDto: LoginDto, @Request() req) {
        const ipAddress = req.ip;
        const userAgent = req.get('User-Agent');
        return await this.authService.login(loginDto, ipAddress, userAgent);
    }

    @Public()
    @Post('verify-2fa')
    @HttpCode(200)
    @ApiOperation({ summary: 'Completar login con 2FA' })
    @ApiResponse({ status: 200, description: '2FA verificado exitosamente' })
    @ApiResponse({ status: 401, description: 'Código 2FA inválido' })
    async completeTwoFactorLogin(
        @Body() body: { tempToken: string; twoFactorCode: string },
        @Request() req
    ) {
        const { tempToken, twoFactorCode } = body;
        const ipAddress = req.ip;
        const userAgent = req.get('User-Agent');
        return await this.authService.completeTwoFactorLogin(tempToken, twoFactorCode, ipAddress, userAgent);
    }

    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth('jwt')
    @Get('profile')
    @ApiOperation({ summary: 'Obtener perfil del usuario logueado' })
    @ApiResponse({ status: 200, description: 'Perfil obtenido exitosamente' })
    async getProfile(@Request() req) {
        return {
            user: req.user
        };
    }

    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth('jwt')
    @Post('logout')
    @HttpCode(200)
    @ApiOperation({ summary: 'Cerrar sesión' })
    @ApiResponse({ status: 200, description: 'Sesión cerrada exitosamente' })
    async logout(@Request() req) {
        const token = req.headers.authorization?.replace('Bearer ', '');
        return await this.authService.logout(token);
    }

    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth('jwt')
    @Post('setup-2fa')
    @ApiOperation({ summary: 'Configurar autenticación de dos factores' })
    @ApiResponse({ status: 200, description: '2FA configurado exitosamente' })
    async setup2FA(@Request() req) {
        return await this.authService.setup2FA(req.user.userId);
    }

    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth('jwt')
    @Post('enable-2fa')
    @ApiOperation({
        summary: 'Habilitar 2FA después de verificar código',
        description: 'Requiere token JWT válido. Habilita 2FA por primera vez.'
    })
    @ApiResponse({ status: 200, description: '2FA habilitado exitosamente' })
    async enable2FA(@Body() body: { verificationCode: string }, @Request() req) {
        const { verificationCode } = body;
        return await this.authService.enable2FA(req.user.userId, verificationCode);
    }

    @UseGuards(JwtAuthGuard, TwoFactorGuard)
    @ApiBearerAuth('jwt')
    @Require2FA()
    @Post('disable-2fa')
    @ApiOperation({
        summary: 'Deshabilitar autenticación de dos factores',
        description: 'Requiere token JWT válido y verificación 2FA'
    })
    @ApiResponse({ status: 200, description: '2FA deshabilitado exitosamente' })
    async disable2FA(@Request() req) {
        return await this.authService.disable2FA(req.user.userId);
    }
}