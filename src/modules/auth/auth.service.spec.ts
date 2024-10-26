import { ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { MiscModule } from '../misc/misc.module';
import { UserService } from '../user/user.service';
import { AuthService } from './auth.service';
import { JwtStrategy } from './strategies/jwt.strategy';

const mockUserService = {
  findByEmailWithRoleAndPermissions: jest.fn().mockResolvedValue({
    id: 1,
    name: 'John Doe',
    email: '1q3U8@example.com',
    password: '$2b$10$q81aKunjGaLbPvt5biUjFeSXLKhXVsMtsNxF8.Nwjx8I5l7OcU7sy',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    roles: [],
    permissions: [],
  }),
  updateLoginDate: jest.fn(),
};

describe('AuthService', () => {
  let service: AuthService;
  let mockConfigService: Partial<ConfigService>;

  beforeEach(async () => {
    mockConfigService = {
      get: jest.fn((key: string) => {
        if (key === 'JWT_SECRET') {
          return 'test-secret';
        }
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
        {
          provide: UserService,
          useValue: mockUserService,
        },
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

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should login user', async () => {
    const user = await service.login('1q3U8@example.com', 'password123');
    expect(user).toEqual({
      id: 1,
      name: 'John Doe',
      email: '1q3U8@example.com',
      isActive: true,
      createdAt: expect.any(Date),
      AccessToken: expect.any(String),
      roles: [],
      permissions: [],
    });
  });
});
