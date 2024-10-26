import { EntityManager, EntityRepository } from '@mikro-orm/core';
import { getRepositoryToken } from '@mikro-orm/nestjs';
import { ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { CacheModule } from '../cache/cache.module';
import { CacheService } from '../cache/cache.service';
import { MiscModule } from '../misc/misc.module';
import { User } from '../user/entities/user.entity';
import { UserTransformer } from '../user/transformer/user.transformer';
import { UserService } from '../user/user.service';
import { AuthService } from './auth.service';
import { JwtStrategy } from './strategies/jwt.strategy';

const mockCacheService = {
  get: jest.fn(),
  set: jest.fn(),
  del: jest.fn(),
  delAll: jest.fn(),
};

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
        password:
          '$2b$10$q81aKunjGaLbPvt5biUjFeSXLKhXVsMtsNxF8.Nwjx8I5l7OcU7sy',
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
        MiscModule,
        CacheModule,
      ],
      providers: [
        AuthService,
        UserService,
        UserTransformer,
        {
          provide: JwtStrategy,
          useFactory: (configService: ConfigService) =>
            new JwtStrategy(configService),
          inject: [ConfigService],
        },
        { provide: ConfigService, useValue: mockConfigService },
        { provide: EntityManager, useValue: mockEntityManager },
        { provide: getRepositoryToken(User), useValue: mockUserRepository },
        {
          provide: CacheService,
          useValue: mockCacheService,
        },
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
      roles: undefined,
      permissions: undefined,
    });
  });
});
