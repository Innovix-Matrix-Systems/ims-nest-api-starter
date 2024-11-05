import { BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { MiscModule } from '../misc/misc.module';
import { RoleID } from '../role/enums/roleID.enum';
import { UserService } from '../user/user.service';
import { AuthService } from './auth.service';
import { JwtStrategy } from './strategies/jwt.strategy';

// Mock OAuth2Client
const mockGetTokenInfo = jest.fn();
jest.mock('google-auth-library', () => ({
  OAuth2Client: jest.fn().mockImplementation(() => ({
    getTokenInfo: mockGetTokenInfo,
  })),
}));

const mockUserService = {
  findByEmailWithRoleAndPermissions: jest.fn(),
  updateLoginDate: jest.fn(),
  createOauthUser: jest.fn(),
};

const mockUser = {
  id: 1,
  name: 'John Doe',
  email: 'john@example.com',
  password: '$2b$10$q81aKunjGaLbPvt5biUjFeSXLKhXVsMtsNxF8.Nwjx8I5l7OcU7sy',
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date(),
  roles: [],
  permissions: [],
};

describe('AuthService', () => {
  let service: AuthService;
  let mockConfigService: Partial<ConfigService>;

  beforeEach(async () => {
    mockConfigService = {
      get: jest.fn((key: string) => {
        if (key === 'JWT_SECRET') return 'test-secret';
        if (key === 'GOOGLE_CLIENT_ID') return 'test-client-id';
        return null;
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      imports: [
        JwtModule.register({
          secret: 'test-secret',
          signOptions: { expiresIn: '1h' },
        }),
        MiscModule,
      ],
      providers: [
        AuthService,
        { provide: UserService, useValue: mockUserService },
        {
          provide: JwtStrategy,
          useFactory: (configService: ConfigService) =>
            new JwtStrategy(configService),
          inject: [ConfigService],
        },
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('googleLogin', () => {
    const googleProfile = {
      email: 'john@example.com',
      displayName: 'John Doe',
      googleId: '123456789',
      picture: 'https://example.com/avatar.jpg',
    };

    it('should login existing user with Google profile', async () => {
      mockUserService.findByEmailWithRoleAndPermissions.mockResolvedValueOnce(
        mockUser,
      );
      mockUserService.updateLoginDate.mockResolvedValueOnce(undefined);

      const result = await service.googleLogin(googleProfile);

      expect(mockUserService.createOauthUser).not.toHaveBeenCalled();
      expect(result.name).toEqual(mockUser.name);
      expect(result.email).toEqual(mockUser.email);
      expect(result.isActive).toEqual(mockUser.isActive);
      expect(result.AccessToken).toEqual(expect.any(String));
      expect(result.roles).toEqual(expect.any(Array));
    });

    it('should create and login new user with Google profile', async () => {
      mockUserService.findByEmailWithRoleAndPermissions.mockResolvedValueOnce(
        null,
      );
      mockUserService.createOauthUser.mockResolvedValueOnce(mockUser);
      mockUserService.updateLoginDate.mockResolvedValueOnce(undefined);

      const result = await service.googleLogin(googleProfile);

      expect(mockUserService.createOauthUser).toHaveBeenCalledWith({
        email: googleProfile.email,
        name: googleProfile.displayName,
        isActive: true,
        googleId: googleProfile.googleId,
        roles: [RoleID.USER],
      });
      expect(result.name).toEqual(mockUser.name);
      expect(result.email).toEqual(mockUser.email);
      expect(result.isActive).toEqual(mockUser.isActive);
      expect(result.AccessToken).toEqual(expect.any(String));
      expect(result.roles).toEqual(expect.any(Array));
    });
  });

  describe('verifyGoogleUser', () => {
    const googleLoginDto = {
      googleId: '123456789',
      accessToken: 'valid-token',
      email: 'john@example.com',
      name: 'John Doe',
    };

    it('should verify valid Google user', async () => {
      mockGetTokenInfo.mockResolvedValueOnce({
        expiry_date: 123456789,
        scopes: ['profile', 'email'],
        aud: 'test-client-id',
        azp: 'test-client-id',
        sub: googleLoginDto.googleId,
        email: googleLoginDto.email,
        email_verified: true,
      });

      await expect(
        service.verifyGoogleUser(googleLoginDto),
      ).resolves.not.toThrow();
    });

    it('should throw error for invalid Google ID', async () => {
      mockGetTokenInfo.mockResolvedValueOnce({
        expiry_date: 123456789,
        scopes: ['profile', 'email'],
        aud: 'test-client-id',
        azp: 'test-client-id',
        sub: 'different-id',
        email: googleLoginDto.email,
        email_verified: true,
      });

      await expect(service.verifyGoogleUser(googleLoginDto)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw error for unverified email', async () => {
      mockGetTokenInfo.mockResolvedValueOnce({
        expiry_date: 123456789,
        scopes: ['profile', 'email'],
        aud: 'test-client-id',
        azp: 'test-client-id',
        sub: googleLoginDto.googleId,
        email: googleLoginDto.email,
        email_verified: false,
      });

      await expect(service.verifyGoogleUser(googleLoginDto)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw error for mismatched email', async () => {
      mockGetTokenInfo.mockResolvedValueOnce({
        expiry_date: 123456789,
        scopes: ['profile', 'email'],
        aud: 'test-client-id',
        azp: 'test-client-id',
        sub: googleLoginDto.googleId,
        email: 'different@example.com',
        email_verified: true,
      });

      await expect(service.verifyGoogleUser(googleLoginDto)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('googleLoginByToken', () => {
    const googleLoginDto = {
      googleId: '123456789',
      accessToken: 'valid-token',
      email: 'john@example.com',
      name: 'John Doe',
    };

    it('should login existing user with Google token', async () => {
      mockGetTokenInfo.mockResolvedValueOnce({
        expiry_date: 123456789,
        scopes: ['profile', 'email'],
        aud: 'test-client-id',
        azp: 'test-client-id',
        sub: googleLoginDto.googleId,
        email: googleLoginDto.email,
        email_verified: true,
      });
      mockUserService.findByEmailWithRoleAndPermissions.mockResolvedValueOnce(
        mockUser,
      );
      mockUserService.updateLoginDate.mockResolvedValueOnce(undefined);

      const result = await service.googleLoginByToken(googleLoginDto);

      expect(mockUserService.createOauthUser).not.toHaveBeenCalled();
      expect(result.name).toEqual(mockUser.name);
      expect(result.email).toEqual(mockUser.email);
      expect(result.isActive).toEqual(mockUser.isActive);
      expect(result.AccessToken).toEqual(expect.any(String));
      expect(result.roles).toEqual(expect.any(Array));
    });

    it('should create and login new user with Google token', async () => {
      mockGetTokenInfo.mockResolvedValueOnce({
        expiry_date: 123456789,
        scopes: ['profile', 'email'],
        aud: 'test-client-id',
        azp: 'test-client-id',
        sub: googleLoginDto.googleId,
        email: googleLoginDto.email,
        email_verified: true,
      });
      mockUserService.findByEmailWithRoleAndPermissions.mockResolvedValueOnce(
        null,
      );
      mockUserService.createOauthUser.mockResolvedValueOnce(mockUser);
      mockUserService.updateLoginDate.mockResolvedValueOnce(undefined);

      const result = await service.googleLoginByToken(googleLoginDto);

      expect(mockUserService.createOauthUser).toHaveBeenCalledWith({
        email: googleLoginDto.email,
        name: googleLoginDto.name,
        isActive: true,
        googleId: googleLoginDto.googleId,
        roles: [RoleID.USER],
      });
      expect(result.name).toEqual(mockUser.name);
      expect(result.email).toEqual(mockUser.email);
      expect(result.isActive).toEqual(mockUser.isActive);
      expect(result.AccessToken).toEqual(expect.any(String));
      expect(result.roles).toEqual(expect.any(Array));
    });

    it('should throw error for invalid Google token', async () => {
      mockGetTokenInfo.mockRejectedValueOnce(new Error('Invalid token'));

      await expect(
        service.googleLoginByToken(googleLoginDto),
      ).rejects.toThrow();
    });
  });

  // Keep your existing tests
  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should login user', async () => {
    mockUserService.findByEmailWithRoleAndPermissions.mockResolvedValueOnce(
      mockUser,
    );

    const user = await service.login('john@example.com', 'password123');

    expect(user.name).toEqual(mockUser.name);
    expect(user.email).toEqual(mockUser.email);
    expect(user.isActive).toEqual(mockUser.isActive);
    expect(user.AccessToken).toEqual(expect.any(String));
    expect(user.roles).toEqual(expect.any(Array));
  });
});
