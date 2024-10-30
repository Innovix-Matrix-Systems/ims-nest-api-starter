import { BadRequestException, HttpStatus } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { Response } from 'express';
import { EmailService } from '../email/email.service';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: jest.Mocked<AuthService>;
  let emailService: jest.Mocked<EmailService>;

  beforeEach(async () => {
    const mockAuthService = {
      login: jest.fn(),
    };

    const mockEmailService = {
      sendEmail: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
        {
          provide: EmailService,
          useValue: mockEmailService,
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get(AuthService);
    emailService = module.get(EmailService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('login', () => {
    it('should return auth data on successful login', async () => {
      const loginDto: LoginDto = {
        email: 'test@example.com',
        password: 'password123',
      };

      const mockAuthData = {
        id: 1,
        name: 'John Doe',
        email: '1q3U8@example.com',
        isActive: true,
        createdAt: expect.any(Date),
        AccessToken: expect.any(String),
      };

      authService.login.mockResolvedValue(mockAuthData);

      const mockResponse = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      } as unknown as Response;

      await controller.login(loginDto, mockResponse);

      expect(authService.login).toHaveBeenCalledWith(
        loginDto.email,
        loginDto.password,
      );
      expect(emailService.sendEmail).toHaveBeenCalledWith({
        key: expect.any(String),
        to: mockAuthData.email,
        subject: 'Login Alert',
        options: {
          name: mockAuthData.name,
          loginAt: expect.any(Date),
        },
      });
      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.OK);
      expect(mockResponse.json).toHaveBeenCalledWith({
        data: mockAuthData,
        message: 'Logged in successfully',
        statusCode: HttpStatus.OK,
        success: true,
      });
    });

    it('should handle login failure', async () => {
      const loginDto: LoginDto = {
        email: 'test@example.com',
        password: 'wrongpassword',
      };

      authService.login.mockRejectedValue(
        new BadRequestException('Invalid credentials'),
      );

      const mockResponse = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      } as unknown as Response;

      try {
        await controller.login(loginDto, mockResponse);
      } catch (error) {
        expect(error).toBeInstanceOf(BadRequestException);
        expect(mockResponse.status).not.toHaveBeenCalled();
      }
    });
  });
});
