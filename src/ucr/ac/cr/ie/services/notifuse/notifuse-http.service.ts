import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

@Injectable()
export class NotifuseHttpService {
  private client: any;
  // Enable verbose logs with VERBOSE_NOTIFUSE_LOGS=true
  private verboseLogs = (process.env.VERBOSE_NOTIFUSE_LOGS === 'true');

  constructor(private readonly configService: ConfigService) {
    // Read env vars defensively; ConfigModule.forRoot({ isGlobal: true }) should be enabled in AppModule
    const baseUrl = this.configService.get<string>('NOTIFUSE_BASE_URL') || 'http://localhost:8081';
    const rawKey = (this.configService.get<string>('NOTIFUSE_API_KEY') || '').trim();
    const authHeader = rawKey || '';

    if ((process.env.NODE_ENV !== 'production' || this.verboseLogs) && authHeader) {
      const visibleStart = authHeader.slice(0, 12);
      const visibleEnd = authHeader.slice(-8);
      console.debug(`[NotifuseHttpService] Authorization header present: ${visibleStart}...${visibleEnd}`);
    }

    this.client = axios.create({
      baseURL: baseUrl.replace(/\/$/, ''),
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
        ...(authHeader ? { Authorization: authHeader } : {}),
      },
    });
  }

  async sendTransactional(payload: any): Promise<any> {
    const endpoint = '/api/transactional.send';
    const now = new Date().toISOString();

    // Prepare masked information for logs
    const maskedAuth = this.maskAuthHeader(this.client.defaults.headers?.Authorization || this.client.defaults?.headers?.common?.Authorization);
    const maskedPayload = this.maskPayload(payload);

    if (process.env.NODE_ENV !== 'production' || this.verboseLogs) {
      // eslint-disable-next-line no-console
      console.debug(`[NotifuseHttpService] [${now}] POST ${endpoint} Authorization: ${maskedAuth}`);
      if (this.verboseLogs || process.env.NODE_ENV !== 'production') {
        // eslint-disable-next-line no-console
        console.debug(`[NotifuseHttpService] [${now}] Payload (masked): ${JSON.stringify(maskedPayload)}`);
      }
    }

    try {
      const res = await this.client.post(endpoint, payload);

      if (process.env.NODE_ENV !== 'production' || this.verboseLogs) {
        // eslint-disable-next-line no-console
        console.debug(`[NotifuseHttpService] [${now}] Response status: ${res.status}`);
        const body = typeof res.data === 'string' ? res.data : JSON.stringify(res.data);
        // eslint-disable-next-line no-console
        console.debug(`[NotifuseHttpService] [${now}] Response body (truncated): ${body.slice(0, 200)}`);
      }

      return res.data;
    } catch (err) {
      const status = err?.response?.status;
      const data = err?.response?.data;

      // Log error details (but never print full Authorization header)
      // eslint-disable-next-line no-console
      console.error(`[NotifuseHttpService] [${now}] Request failed. status=${status} Authorization=${maskedAuth}`);
      // eslint-disable-next-line no-console
      console.error(`[NotifuseHttpService] [${now}] Response data: ${JSON.stringify(data).slice(0, 1000)}`);
      // eslint-disable-next-line no-console
      console.error(err?.stack || err?.message || 'No stack available');

      const safeMessage = typeof data === 'string'
        ? data
        : (data && data.message) ? data.message : (err?.message || 'Notifuse request failed');

      throw new InternalServerErrorException({ message: safeMessage, status });
    }
  }

  private maskAuthHeader(header?: string): string {
    if (!header) return '<none>';
    try {
      const h = header.toString();
      if (h.length <= 12) return '***masked***';
      return `${h.slice(0, 8)}...${h.slice(-6)}`;
    } catch {
      return '***masked***';
    }
  }

  private maskPayload(payload: any): any {
    if (!payload) return payload;
    try {
      const copy = JSON.parse(JSON.stringify(payload));

      const walkAndMask = (obj: any) => {
        if (!obj || typeof obj !== 'object') return;
        for (const key of Object.keys(obj)) {
          const val = obj[key];
          if (/code|codes|password|token|otp/i.test(key)) {
            if (Array.isArray(val)) {
              obj[key] = val.map(() => '***masked***');
            } else if (typeof val === 'string') {
              obj[key] = '***masked***';
            } else {
              obj[key] = '***masked***';
            }
          } else if (typeof val === 'object') {
            walkAndMask(val);
          }
        }
      };

      walkAndMask(copy);
      return copy;
    } catch {
      return '<<unserializable-payload>>';
    }
  }
}
