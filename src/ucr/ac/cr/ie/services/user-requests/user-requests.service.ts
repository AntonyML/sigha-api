import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { UserRoleService } from '../auth/user-role.service';
import { EmailService } from '../email/email.service';
import { AuditService } from '../audit/audit.service';
import { AuditAction, AuditReportType } from '../../domain/audit';
import { CreateUserRequestDto } from '../../dto/user-requests';
import { sanitizeForLogging } from '@common/utils/logger-sanitizer';

// Reserved system user ID for anonymous/automated audit actions (created in migration 013_system_user.sql)
const SYSTEM_USER_ID = 999999;

@Injectable()
export class UserRequestsService {
  private readonly logger = new Logger(UserRequestsService.name);

  constructor(
    private readonly userRoleService: UserRoleService,
    private readonly emailService: EmailService,
    private readonly auditService: AuditService,
  ) {}

  async submitRequest(dto: CreateUserRequestDto, ipAddress?: string, userAgent?: string): Promise<{ success: boolean; message: string }> {
    const admins = await this.userRoleService.findUsersByRoleNames(['super admin', 'admin', 'director']);

    if (!admins || admins.length === 0) {
      this.logger.warn('[UserRequestsService] No hay administradores disponibles para recibir la solicitud');
      throw new BadRequestException('No hay administradores disponibles para recibir la solicitud');
    }

    let emailsSent = 0;
    const failedEmails: string[] = [];

    for (const admin of admins) {
      const result = await this.emailService.sendUserRequest({
        to: {
          email: admin.uEmail,
          firstName: admin.uName,
          lastName: admin.uFLastName,
        },
        requesterName: dto.fullName,
        requesterEmail: dto.email,
        requesterPhone: dto.phone,
        reason: dto.reason,
      });

      if (result.success) {
        emailsSent++;
      } else {
        failedEmails.push(admin.uEmail);
        this.logger.error(
          '[UserRequestsService] Falló el envío a administrador',
          sanitizeForLogging({ adminEmail: admin.uEmail, error: result.error }),
        );
      }
    }

    if (emailsSent === 0 && failedEmails.length > 0) {
      throw new BadRequestException(
        'No se pudo notificar a ningún administrador. Por favor intente de nuevo más tarde.',
      );
    }

    try {
      await this.auditService.logAuditDbFunction({
        userId: SYSTEM_USER_ID,
        drAction: 'create_user_request',
        drTableName: 'users',
        drDescription: `Solicitud de creación de cuenta: ${dto.fullName} (${dto.email}, ${dto.phone}). Motivo: ${dto.reason.slice(0, 300)}`,
        arType: AuditReportType.OTHER,
        arAction: 'create_user_request',
        arEntityName: 'users',
        arObservations: `Notificados ${emailsSent}/${admins.length} administradores.`,
        arIpAddress: ipAddress,
        arUserAgent: userAgent,
      });
    } catch (auditErr) {
      this.logger.error(
        '[UserRequestsService] Error de auditoría (no bloqueante)',
        sanitizeForLogging({ error: String(auditErr) }),
      );
    }

    const message =
      emailsSent === admins.length
        ? 'Tu solicitud fue enviada. Un administrador la revisará pronto.'
        : 'Tu solicitud fue enviada, pero hubo problemas al notificar a algunos administradores. Un administrador la revisará pronto.';

    return { success: true, message };
  }
}