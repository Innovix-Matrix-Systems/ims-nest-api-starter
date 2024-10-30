import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { Job } from 'bullmq';
import * as nodemailer from 'nodemailer';
import { EmailProcessor } from './email.processor';

// Mock nodemailer
jest.mock('nodemailer', () => ({
  createTransport: jest.fn().mockReturnValue({
    sendMail: jest.fn(),
  }),
}));

describe('EmailProcessor', () => {
  let processor: EmailProcessor;
  let mockConfigService: Partial<ConfigService>;
  let mockTransporter: any;

  const mockSmtpConfig = {
    SMTP_HOST: 'smtp.example.com',
    SMTP_PORT: 587,
    SMTP_USERNAME: 'test@example.com',
    SMTP_PASSWORD: 'password123',
  };

  beforeEach(async () => {
    (nodemailer.createTransport as jest.Mock).mockClear();
    // Create mock ConfigService
    mockConfigService = {
      get: jest.fn((key: string) => mockSmtpConfig[key]),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EmailProcessor,
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    processor = module.get<EmailProcessor>(EmailProcessor);
    mockTransporter = (nodemailer.createTransport as jest.Mock)();

    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(processor).toBeDefined();
  });

  describe('constructor', () => {
    it('should create nodemailer transport with correct config', () => {
      new EmailProcessor(mockConfigService as ConfigService);
      expect(nodemailer.createTransport).toHaveBeenCalledTimes(1);
      expect(nodemailer.createTransport).toHaveBeenCalledWith({
        host: mockSmtpConfig.SMTP_HOST,
        port: mockSmtpConfig.SMTP_PORT,
        auth: {
          user: mockSmtpConfig.SMTP_USERNAME,
          pass: mockSmtpConfig.SMTP_PASSWORD,
        },
      });
    });
  });

  describe('handleSendLoginAlertEmail', () => {
    const mockEmailPayload = {
      to: 'recipient@example.com',
      subject: 'Login Alert',
      text: 'Login alert text',
      html: '<p>Login alert html</p>',
    };

    const mockJob: Partial<Job> = {
      data: mockEmailPayload,
    };

    it('should send email with correct options', async () => {
      mockTransporter.sendMail.mockResolvedValueOnce({ messageId: 'test-id' });

      await processor.process(mockJob as Job);

      expect(mockTransporter.sendMail).toHaveBeenCalledWith({
        to: mockEmailPayload.to,
        subject: mockEmailPayload.subject,
        text: mockEmailPayload.text,
        html: mockEmailPayload.html,
      });
    });

    it('should handle successful email sending', async () => {
      const mockResponse = { messageId: 'test-id' };
      mockTransporter.sendMail.mockResolvedValueOnce(mockResponse);

      const result = await processor.process(mockJob as Job);

      expect(result).toEqual(mockResponse);
    });

    it('should handle email sending failure', async () => {
      const mockError = new Error('Failed to send email');
      mockTransporter.sendMail.mockRejectedValueOnce(mockError);

      await expect(processor.process(mockJob as Job)).rejects.toThrow(
        mockError,
      );
    });

    it('should handle invalid email payload', async () => {
      const invalidJob: Partial<Job> = {
        data: {
          to: '', // Invalid email
          subject: '',
        },
      };

      mockTransporter.sendMail.mockRejectedValueOnce(
        new Error('Invalid email address'),
      );

      await expect(processor.process(invalidJob as Job)).rejects.toThrow();
    });
  });

  describe('error handling', () => {
    it('should handle transport creation failure', () => {
      (nodemailer.createTransport as jest.Mock).mockImplementationOnce(() => {
        throw new Error('Transport creation failed');
      });

      expect(() => {
        new EmailProcessor(mockConfigService as ConfigService);
      }).toThrow('Transport creation failed');
    });

    it('should handle missing job data', async () => {
      const invalidJob: Partial<Job> = {
        data: undefined,
      };

      await expect(processor.process(invalidJob as Job)).rejects.toThrow();
    });

    it('should handle null values in email payload', async () => {
      const jobWithNullValues: Partial<Job> = {
        data: {
          to: 'test@example.com',
          subject: null,
          text: null,
          html: null,
        },
      };

      await processor.process(jobWithNullValues as Job);

      expect(mockTransporter.sendMail).toHaveBeenCalledWith({
        to: 'test@example.com',
        subject: null,
        text: null,
        html: null,
      });
    });
  });

  // Testing different email configurations
  describe('email configurations', () => {
    it('should handle multiple recipients', async () => {
      const multipleRecipientsJob: Partial<Job> = {
        data: {
          to: ['recipient1@example.com', 'recipient2@example.com'],
          subject: 'Test',
          html: '<p>Test</p>',
        },
      };

      await processor.process(multipleRecipientsJob as Job);

      expect(mockTransporter.sendMail).toHaveBeenCalledWith(
        expect.objectContaining({
          to: ['recipient1@example.com', 'recipient2@example.com'],
        }),
      );
    });

    it('should handle HTML-only emails', async () => {
      const htmlOnlyJob: Partial<Job> = {
        data: {
          to: 'test@example.com',
          subject: 'Test',
          html: '<p>Test</p>',
        },
      };

      await processor.process(htmlOnlyJob as Job);

      expect(mockTransporter.sendMail).toHaveBeenCalledWith({
        to: 'test@example.com',
        subject: 'Test',
        html: '<p>Test</p>',
      });
    });

    it('should handle text-only emails', async () => {
      const textOnlyJob: Partial<Job> = {
        data: {
          to: 'test@example.com',
          subject: 'Test',
          text: 'Test message',
        },
      };

      await processor.process(textOnlyJob as Job);

      expect(mockTransporter.sendMail).toHaveBeenCalledWith({
        to: 'test@example.com',
        subject: 'Test',
        text: 'Test message',
      });
    });
  });
});
