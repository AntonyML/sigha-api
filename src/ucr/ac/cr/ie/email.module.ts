import { Global, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { EmailService } from './services/email/email.service';
import { MailerService } from './services/email/mailer.service';
import { ResendService } from './services/email/resend.service';
import { EmailController } from './controller/email/email.controller';

@Global()
@Module({
  imports: [ConfigModule],
  controllers: [EmailController],
  providers: [MailerService, ResendService, EmailService],
  exports: [EmailService, MailerService, ResendService],
})
export class EmailModule {}
