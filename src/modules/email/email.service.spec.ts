import { getQueueToken } from '@nestjs/bullmq';
import { Test, TestingModule } from '@nestjs/testing';
import { Queue } from 'bullmq';
import * as fs from 'fs';
import { EmailService } from './email.service';
import { EmailConfig } from './enums/email.enum';

// Mock fs.promises
jest.mock('fs', () => ({
  promises: {
    readFile: jest.fn(),
  },
  existsSync: jest.fn(),
}));

describe('EmailService', () => {
  let service: EmailService;
  let mockQueue: Partial<Queue>;

  const mockTemplate = `<h1>Hello {{name}}!</h1>
    <p>Welcome to {{company}}</p>`;

  beforeEach(async () => {
    // Create mock Queue
    mockQueue = {
      add: jest.fn().mockResolvedValue(undefined),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EmailService,
        {
          provide: getQueueToken(EmailConfig.EMAIL_QUEUE),
          useValue: mockQueue,
        },
      ],
    }).compile();

    service = module.get<EmailService>(EmailService);

    // Reset all mocks before each test
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('sendEmail', () => {
    const mockEmailPayload = {
      key: EmailConfig.SEND_LOGIN_ALERT_EMAIL.toString(),
      to: 'test@example.com',
      subject: 'Welcome Email',
      options: {
        name: 'John',
        company: 'ACME',
      },
    };

    beforeEach(() => {
      // Mock filesystem operations
      (fs.existsSync as jest.Mock).mockReturnValue(true);
      (fs.promises.readFile as jest.Mock).mockResolvedValue(mockTemplate);
    });

    it('should successfully send an email', async () => {
      await service.sendEmail(mockEmailPayload);

      // Check if queue.add was called with correct parameters
      expect(mockQueue.add).toHaveBeenCalledWith(
        mockEmailPayload.key,
        expect.objectContaining({
          to: mockEmailPayload.to,
          subject: mockEmailPayload.subject,
          html: expect.any(String),
        }),
      );
    });

    it('should compile template with provided options', async () => {
      await service.sendEmail(mockEmailPayload);

      const expectedHtml = `<h1>Hello John!</h1>
    <p>Welcome to ACME</p>`;

      expect(mockQueue.add).toHaveBeenCalledWith(
        mockEmailPayload.key,
        expect.objectContaining({
          html: expectedHtml,
        }),
      );
    });

    it('should throw error when template is not found', async () => {
      (fs.existsSync as jest.Mock).mockReturnValue(false);

      await expect(service.sendEmail(mockEmailPayload)).rejects.toThrow(
        'Template not found',
      );
    });

    it('should throw error when template compilation fails', async () => {
      (fs.promises.readFile as jest.Mock).mockRejectedValue(
        new Error('Read file error'),
      );

      await expect(service.sendEmail(mockEmailPayload)).rejects.toThrow(
        'Failed to compile email template',
      );
    });
  });

  // Test error cases
  describe('error handling', () => {
    it('should throw error when queue add fails', async () => {
      const mockError = new Error('Queue error');
      (mockQueue.add as jest.Mock).mockRejectedValue(mockError);

      const mockEmailPayload = {
        key: EmailConfig.SEND_LOGIN_ALERT_EMAIL.toString(),
        to: 'test@example.com',
        subject: 'Test',
        options: {},
      };

      await expect(service.sendEmail(mockEmailPayload)).rejects.toThrow();
    });

    it('should handle invalid template format', async () => {
      (fs.promises.readFile as jest.Mock).mockResolvedValue('{{invalid');

      const mockEmailPayload = {
        key: EmailConfig.SEND_LOGIN_ALERT_EMAIL.toString(),
        to: 'test@example.com',
        subject: 'Test',
        options: {},
      };

      await expect(service.sendEmail(mockEmailPayload)).rejects.toThrow();
    });
  });
});
