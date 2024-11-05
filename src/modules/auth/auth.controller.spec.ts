import { BadRequestException, HttpStatus } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { Response } from 'express';
import { EmailService } from '../email/email.service';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { GoogleLoginDto } from './dto/google-login.dto';
import { LoginDto } from './dto/login.dto';

const mockAuthData = {
  id: 1,
  name: 'John Doe',
  email: 'test@example.com',
  isActive: true,
  createdAt: new Date(),
  AccessToken: 'mock-token',
  roles: [],
  permissions: [],
};

describe('AuthController', () => {
  let controller: AuthController;
  let authService: jest.Mocked<AuthService>;
  let emailService: jest.Mocked<EmailService>;

  beforeEach(async () => {
    const mockAuthService = {
      login: jest.fn(),
      googleLogin: jest.fn(),
      googleLoginByToken: jest.fn(),
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

  afterEach(() => {
    jest.clearAllMocks();
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

  describe('googleAuthCallback', () => {
    it('should handle successful Google OAuth callback', async () => {
      const mockRequest = {
        user: {
          email: 'test@example.com',
          displayName: 'John Doe',
          googleId: '123456789',
        },
      };

      authService.googleLogin.mockResolvedValue(mockAuthData);

      const mockResponse = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      } as unknown as Response;

      await controller.googleAuthCallback(mockRequest, mockResponse);

      expect(authService.googleLogin).toHaveBeenCalledWith(mockRequest.user);
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
        message: 'Logged in successfully with Google',
        statusCode: HttpStatus.OK,
        success: true,
      });
    });

    it('should handle Google OAuth callback failure', async () => {
      const mockRequest = {
        user: {
          email: 'test@example.com',
          displayName: 'John Doe',
          googleId: '123456789',
        },
      };

      authService.googleLogin.mockRejectedValue(
        new BadRequestException('Google authentication failed'),
      );

      const mockResponse = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      } as unknown as Response;

      try {
        await controller.googleAuthCallback(mockRequest, mockResponse);
      } catch (error) {
        expect(error).toBeInstanceOf(BadRequestException);
        expect(mockResponse.status).not.toHaveBeenCalled();
      }
    });
  });

  describe('googleFrontendLogin', () => {
    it('should handle successful Google token login', async () => {
      const googleLoginDto: GoogleLoginDto = {
        googleId: '123456789',
        accessToken: 'valid-token',
        email: 'test@example.com',
        name: 'John Doe',
      };

      authService.googleLoginByToken.mockResolvedValue(mockAuthData);

      const mockResponse = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      } as unknown as Response;

      await controller.googleFrontendLogin(googleLoginDto, mockResponse);

      expect(authService.googleLoginByToken).toHaveBeenCalledWith(
        googleLoginDto,
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
        message: 'Logged in successfully with Google',
        statusCode: HttpStatus.OK,
        success: true,
      });
    });

    it('should handle Google token login failure', async () => {
      const googleLoginDto: GoogleLoginDto = {
        googleId: '123456789',
        accessToken: 'invalid-token',
        email: 'test@example.com',
        name: 'John Doe',
      };

      authService.googleLoginByToken.mockRejectedValue(
        new BadRequestException('Invalid Google token'),
      );

      const mockResponse = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      } as unknown as Response;

      try {
        await controller.googleFrontendLogin(googleLoginDto, mockResponse);
      } catch (error) {
        expect(error).toBeInstanceOf(BadRequestException);
        expect(mockResponse.status).not.toHaveBeenCalled();
      }
    });
  });
});
