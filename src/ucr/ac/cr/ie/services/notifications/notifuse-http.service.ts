import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

@Injectable()
export class NotifuseHttpService {
  private client: any;

  constructor(private readonly configService: ConfigService) {
    const baseUrl = this.configService.get<string>('NOTIFUSE_BASE_URL') || 'http://localhost:8081';
    const apiKey = this.configService.get<string>('NOTIFUSE_API_KEY') || '';

    this.client = axios.create({
      baseURL: baseUrl.replace(/\/$/, ''),
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
        ...(apiKey ? { Authorization: `Bearer ${apiKey}` } : {}),
      },
    });
  }

  async sendTransactional(payload: any): Promise<any> {
    try {
      const res = await this.client.post('/api/transactional.send', payload);
      return res.data;
    } catch (err) {
      const message = err?.response?.data || err?.message || 'Notifuse request failed';
      throw new InternalServerErrorException({ message });
    }
  }
}
