import { Module } from '@nestjs/common';
import { EmailModule } from './email.module';
import { ContactInquiryController } from './controller/contact-inquiry';
import { ContactInquiryService } from './services/contact-inquiry';

@Module({
  imports: [EmailModule],
  controllers: [ContactInquiryController],
  providers: [ContactInquiryService],
  exports: [ContactInquiryService],
})
export class ContactInquiryModule {}
