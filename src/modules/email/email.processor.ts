import { Processor, WorkerHost } from '@nestjs/bullmq';
import { ConfigService } from '@nestjs/config';
import { Job } from 'bullmq';
import * as nodemailer from 'nodemailer';
import { MailOptions } from 'nodemailer/lib/json-transport';
import { EmailConfig } from './enums/email.enum';

@Processor(EmailConfig.EMAIL_QUEUE)
export class EmailProcessor extends WorkerHost {
  private transporter: nodemailer.Transporter;
  constructor(configService: ConfigService) {
    super();
    this.transporter = nodemailer.createTransport({
      host: configService.get<string>('SMTP_HOST'),
      port: configService.get<number>('SMTP_PORT'),
      auth: {
        user: configService.get<string>('SMTP_USERNAME'),
        pass: configService.get<string>('SMTP_PASSWORD'),
      },
    });
  }
  async process(job: Job) {
    const emailPayload: EmailTransportPacket = job.data;
    const { to, subject, text, html } = emailPayload;
    const mailOptions: MailOptions = {
      to,
      subject,
      text,
      html,
    };
    return this.transporter.sendMail(mailOptions);
  }
}
