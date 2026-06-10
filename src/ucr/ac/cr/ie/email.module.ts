import { Global, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { EmailService } from './services/email/email.service';
import { ResendService } from './services/email/resend.service';
import { EmailController } from './controller/email/email.controller';

@Global()
@Module({
  imports: [ConfigModule],
  controllers: [EmailController],
  providers: [ResendService, EmailService],
  exports: [EmailService, ResendService],
})
export class EmailModule {}
