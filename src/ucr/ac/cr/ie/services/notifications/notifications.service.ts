import { Injectable } from '@nestjs/common';
import { AuditService } from '../audit/audit.service';
import { AuditAction } from '../../domain/audit';
import { NotifuseHttpService } from './notifuse-http.service';

@Injectable()
export class NotificationsService {
  constructor(
    private readonly notifuseHttp: NotifuseHttpService,
    private readonly auditService: AuditService,
  ) {}

  /**
   * Facade method used by controllers to send the 6-codes 2FA template
   */
  async send6Codes2FA(userId: number | null, payload: any): Promise<any> {
    const res = await this.notifuseHttp.sendTransactional(payload);

    // best-effort audit
    try {
      await this.auditService.createDigitalRecord(userId || 0, {
        action: AuditAction.CREATE,
        tableName: 'notifications',
        description: `Send 6_codes_2fa id=${payload?.notification?.id || 'unknown'}`,
      });
    } catch (e) {
      // swallow
      // eslint-disable-next-line no-console
      console.error('Audit error (notifications):', e);
    }

    return res;
  }

  /**
   * Facade method used by controllers to send the code verify template
   */
  async sendCodeVerifyEmail(userId: number | null, payload: any): Promise<any> {
    const res = await this.notifuseHttp.sendTransactional(payload);

    try {
      await this.auditService.createDigitalRecord(userId || 0, {
        action: AuditAction.CREATE,
        tableName: 'notifications',
        description: `Send code_verify id=${payload?.notification?.id || 'unknown'}`,
      });
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error('Audit error (notifications):', e);
    }

    return res;
  }
}
