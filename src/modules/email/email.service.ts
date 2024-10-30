import { InjectQueue } from '@nestjs/bullmq';
import { Injectable } from '@nestjs/common';
import { Queue } from 'bullmq';
import * as fs from 'fs';
import * as handlebars from 'handlebars';
import * as path from 'path';
import { EmailConfig } from './enums/email.enum';

@Injectable()
export class EmailService {
  constructor(
    @InjectQueue(EmailConfig.EMAIL_QUEUE) private readonly emailQueue: Queue,
  ) {}

  async sendEmail(data: EmailPayload) {
    const { key, to, subject, options } = data;
    const emailBody: EmailTransportPacket = {
      to,
      subject,
      html: await this.compileTemplate(key, options),
    };
    await this.emailQueue.add(key, emailBody);
  }

  private async compileTemplate(
    templateName: string,
    payload: Record<string, any>,
  ): Promise<string> {
    const templatePath = this.getTemplatePath(templateName);

    try {
      const templateSource = await fs.promises.readFile(templatePath, 'utf8');
      const template = handlebars.compile(templateSource);
      return template(payload);
    } catch (error) {
      throw new Error(
        `Failed to compile email template: ${templateName} error ${error}`,
      );
    }
  }

  private getTemplatePath(templateName: string): string {
    const possiblePaths = [
      // For development
      path.join(
        __dirname,
        '../../../src/modules/email/templates',
        `${templateName}.hbs`,
      ),
      // For production (dist folder)
      path.join(__dirname, '../email/templates', `${templateName}.hbs`),
    ];
    for (const templatePath of possiblePaths) {
      if (fs.existsSync(templatePath)) {
        return templatePath;
      }
    }

    throw new Error(
      `Template not found: ${templateName}. Searched in: ${possiblePaths.join(', ')}`,
    );
  }
}
