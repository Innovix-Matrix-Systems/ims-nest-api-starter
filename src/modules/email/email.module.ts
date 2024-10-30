import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { EmailProcessor } from './email.processor';
import { EmailService } from './email.service';
import { EmailConfig } from './enums/email.enum';
import { BullModule } from '@nestjs/bullmq';

@Module({
  imports: [
    ConfigModule,
    BullModule.registerQueue({
      name: EmailConfig.EMAIL_QUEUE,
    }),
  ],
  controllers: [],
  providers: [EmailService, EmailProcessor],
  exports: [EmailService],
})
export class EmailModule {}
