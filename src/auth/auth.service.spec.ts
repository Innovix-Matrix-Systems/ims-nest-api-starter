import { EntityManager, EntityRepository } from '@mikro-orm/core';
import { getRepositoryToken } from '@mikro-orm/nestjs';
import { ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { User } from '../entities/user.entity';
import { PasswordService } from '../misc/password.service';
import { UserService } from '../user/user.service';
import { AuthService } from './auth.service';
import { JwtStrategy } from './strategies/jwt.strategy';
import { LocalStrategy } from './strategies/local.strategy';

describe('AuthService', () => {
  let service: AuthService;
  let mockUserRepository: Partial<EntityRepository<User>>;
  let mockEntityManager: Partial<EntityManager>;
  let mockConfigService: Partial<ConfigService>;

  beforeEach(async () => {
    mockUserRepository = {
      findOne: jest.fn().mockReturnValue({
        id: 1,
        name: 'John Doe',
        email: '1q3U8@example.com',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      }),
      create: jest.fn().mockImplementation((dto) => ({
        ...dto,
        id: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      })),
      assign: jest.fn().mockImplementation((user, dto) => {
        Object.assign(user, dto);
      }),
    };

    mockEntityManager = {
      persistAndFlush: jest.fn(),
      flush: jest.fn(),
      removeAndFlush: jest.fn(),
    };

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
      ],
      providers: [
        AuthService,
        UserService,
        PasswordService,
        LocalStrategy,
        {
          provide: JwtStrategy,
          useFactory: (configService: ConfigService) =>
            new JwtStrategy(configService),
          inject: [ConfigService],
        },
        { provide: ConfigService, useValue: mockConfigService },
        { provide: getRepositoryToken(User), useValue: mockUserRepository },
        { provide: EntityManager, useValue: mockEntityManager },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should login user', async () => {
    const requestUser = {
      id: 1,
      name: 'John Doe',
      email: '1q3U8@example.com',
      password: 'password123',
      isActive: true,
      device: 'test-device',
      lastActiveDevice: null,
      lastLoginAt: null,
      createdAt: expect.any(Date),
      updatedAt: expect.any(Date),
    };
    const user = await service.login(requestUser);
    expect(user).toEqual({
      id: 1,
      name: 'John Doe',
      email: '1q3U8@example.com',
      isActive: true,
      createdAt: expect.any(Date),
      AccessToken: expect.any(String),
    });
  });
});
