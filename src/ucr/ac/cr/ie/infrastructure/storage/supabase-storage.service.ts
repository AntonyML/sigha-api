import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient } from '@supabase/supabase-js';
import { v4 as uuid } from 'uuid';

@Injectable()
export class SupabaseStorageService {
  private readonly logger = new Logger(SupabaseStorageService.name);
  private readonly supabase;
  private readonly bucketName = 'settings-assets';

  constructor(private readonly config: ConfigService) {
    const url = this.config.get<string>('SUPABASE_URL');
    const key = this.config.get<string>('SUPABASE_SERVICE_ROLE_KEY');
    if (url && key) {
      this.supabase = createClient(url, key);
    } else {
      this.logger.warn('SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY not set — file upload disabled');
    }
  }

  async uploadFile(
    buffer: Buffer,
    originalName: string,
    mimetype: string,
  ): Promise<string> {
    if (!this.supabase) {
      throw new Error('Supabase client not initialized — check SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
    }
    const ext = originalName.split('.').pop() || 'png';
    const filePath = `logos/${uuid()}.${ext}`;

    const { error } = await this.supabase.storage
      .from(this.bucketName)
      .upload(filePath, buffer, { contentType: mimetype, upsert: false });

    if (error) {
      this.logger.error(`Failed to upload to Supabase Storage: ${error.message}`);
      throw new Error(`Error al subir archivo: ${error.message}`);
    }

    const { data: publicUrl } = this.supabase.storage
      .from(this.bucketName)
      .getPublicUrl(filePath);

    return publicUrl.publicUrl;
  }
}
