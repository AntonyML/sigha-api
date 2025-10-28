import { Injectable } from '@nestjs/common';
import { AuditService } from '../audit/audit.service';
import { AuditAction, AuditReportType } from '../../domain/audit';
import { NotifuseHttpService } from './notifuse-http.service';

@Injectable()
export class NotifuseService {
  constructor(
    private readonly notifuseHttp: NotifuseHttpService,
    private readonly auditService: AuditService,
  ) {}

  /**
   * Facade method used by controllers to send the 8-codes 2FA template
   */
  async send8Codes2FA(userId: number | null, payload: any): Promise<any> {
    const normalized = this.normalizePayload(payload);
    const res = await this.notifuseHttp.sendTransactional(normalized);

    // best-effort audit
    try {
      await this.auditService.logActionWithSP(
        userId || 1,
        AuditReportType.NOTIFICATIONS,
        AuditAction.CREATE,
        'notification',
        payload?.notification?.id || 0,
        null,
        `Código 2FA enviado`,
        null,
        null,
        `Envío de código 2FA al usuario`
      );
    } catch (e) {
      // swallow
      // eslint-disable-next-line no-console
      console.error('Audit error (notifuse):', e);
    }

    return res;
  }

  /**
   * Facade method used by controllers to send the code verify template
   */
  async sendCodeVerifyEmail(userId: number | null, payload: any): Promise<any> {
    const normalized = this.normalizePayload(payload);
    const res = await this.notifuseHttp.sendTransactional(normalized);

    try {
      await this.auditService.logActionWithSP(
        userId || 1,
        AuditReportType.NOTIFICATIONS,
        AuditAction.CREATE,
        'notification',
        payload?.notification?.id || 0,
        null,
        `Código de verificación enviado`,
        null,
        null,
        `Envío de código de verificación de email`
      );
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error('Audit error (notifuse):', e);
    }

    return res;
  }

  /**
   * Ensure payload contains required Notifuse fields and sensible defaults
   */
  private normalizePayload(payload: any): any {
    if (!payload || typeof payload !== 'object') return payload;

    // shallow clone to avoid mutating caller data
    const p = JSON.parse(JSON.stringify(payload));

    // workspace_id default
    if (!p.workspace_id) p.workspace_id = process.env.NOTIFUSE_WORKSPACE_ID || 'default';

    // ensure notification object exists
    p.notification = p.notification || {};

    // ensure channels
    if (!p.notification.channels || !Array.isArray(p.notification.channels) || p.notification.channels.length === 0) {
      p.notification.channels = ['email'];
    }

    // ensure contact.external_id
    p.notification.contact = p.notification.contact || {};
    if (!p.notification.contact.external_id) {
      p.notification.contact.external_id = p.external_id || `auto-${Date.now()}`;
    }

    return p;
  }
}
