import { Collection, EntityManager, EntityRepository } from '@mikro-orm/core';
import { getRepositoryToken } from '@mikro-orm/nestjs';
import { BadRequestException, ForbiddenException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { createMockCollection } from '../../mocks/collection.mock';
import { CacheService } from '../cache/cache.service';
import { MiscModule } from '../misc/misc.module';
import { Permission } from '../permission/entities/permission.entity';
import { Role } from '../role/entities/role.entity';
import { User } from './entities/user.entity';
import { UserTransformer } from './transformer/user.transformer';
import { UserService } from './user.service';

const mockCacheService = {
  get: jest.fn(),
  set: jest.fn(),
  del: jest.fn(),
  delAll: jest.fn(),
};

jest.mock('@mikro-orm/core', () => {
  const actual = jest.requireActual('@mikro-orm/core');
  return {
    ...actual,
    Collection: jest.fn().mockImplementation(() => {
      let items = []; // Initialize the items array
      return {
        set: jest.fn((newItems) => {
          items = newItems; // Set the items with the new ones provided
        }),
        getItems: jest.fn(() => items), // Return the current items
        add: jest.fn((item) => {
          items.push(item); // Optionally add items individually
        }),
        remove: jest.fn((item) => {
          items = items.filter((i) => i !== item); // Remove items if needed
        }),
        count: jest.fn(() => items.length), // Return the number of items
      };
    }),
  };
});

describe('UserService', () => {
  let service: UserService;
  let mockUserRepository: Partial<EntityRepository<User>>;
  let mockEntityManager: Partial<EntityManager>;
  const currentPassword = '123456';
  const currentHashedPassword =
    '$2b$10$HD/3HgaOEZ6J3RflUWSad.N83mbL4DIKwkbTOEeUxZ2DCpf2q2IC6';
  let mockPermissions: Permission[] = [];
  let mockRoles: Role[] = [];

  beforeEach(async () => {
    mockPermissions = [
      {
        id: 1,
        name: 'view.test.all',
        description: 'This is a test permission',
      } as Permission,
    ];
    mockRoles = [
      {
        id: 2,
        name: 'Admin',
        description: 'Administrator role',
        permissions: new Collection<Permission>(this as any, mockPermissions),
        users: new Collection<User>(this as any),
      },
      {
        id: 3,
        name: 'User',
        description: 'User role',
        permissions: new Collection<Permission>(this as any, mockPermissions),
        users: new Collection<User>(this as any),
      },
    ];

    const roleCollection = new Collection<Role>(this as any);
    roleCollection.set(mockRoles);
    const permissionCollection = new Collection<Permission>(this as any);
    permissionCollection.set(mockPermissions);
    mockUserRepository = {
      findOne: jest.fn().mockReturnValue({
        id: 1,
        name: 'John Doe',
        email: '1q3U8@example.com',
        isActive: true,
        lastLoginAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
        roles: roleCollection,
        permissions: permissionCollection,
      }),
      findAndCount: jest.fn().mockReturnValue([
        [
          {
            id: 1,
            name: 'John Doe',
            email: '1q3U8@example.com',
            isActive: true,
            lastLoginAt: new Date(),
            createdAt: new Date(),
            updatedAt: new Date(),
            roles: roleCollection,
            permissions: permissionCollection,
          },
        ],
        1,
      ]),
      create: jest.fn().mockImplementation((dto) => ({
        ...dto,
        id: 1, // Assign an ID for the mock user
        createdAt: new Date(),
        updatedAt: new Date(),
      })),
      assign: jest.fn().mockImplementation((user, dto) => {
        Object.assign(user, dto);
      }),
    };

    // Create a mock for EntityManager
    mockEntityManager = {
      persistAndFlush: jest.fn(),
      flush: jest.fn(),
      removeAndFlush: jest.fn(),
    };

    mockCacheService.get.mockReset();
    mockCacheService.set.mockReset();
    mockCacheService.del.mockReset();
    mockCacheService.delAll.mockReset();

    const module: TestingModule = await Test.createTestingModule({
      imports: [MiscModule],
      providers: [
        UserService,
        UserTransformer,
        { provide: getRepositoryToken(User), useValue: mockUserRepository }, // Provide the mock
        { provide: EntityManager, useValue: mockEntityManager },
        { provide: CacheService, useValue: mockCacheService }, // Add mock CacheService
      ],
    }).compile();

    service = module.get<UserService>(UserService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('Cache interactions', () => {
    it('should try to get user from cache first when finding by id', async () => {
      const userId = 1;
      mockCacheService.get.mockResolvedValue(null);

      await service.findOne(userId);

      expect(mockCacheService.get).toHaveBeenCalledWith(`user:${userId}`);
      expect(mockCacheService.set).toHaveBeenCalled();
    });

    it('should return cached user if available', async () => {
      const userId = 1;
      const cachedUser = {
        id: userId,
        name: 'Cached User',
        email: 'cached@example.com',
      };
      mockCacheService.get.mockResolvedValue(cachedUser);

      const result = await service.findOne(userId);

      expect(result).toEqual(cachedUser);
      expect(mockUserRepository.findOne).not.toHaveBeenCalled();
    });

    it('should clear user cache when updating', async () => {
      const userId = 10;
      const updateUserDto = { isActive: false };

      await service.update(userId, updateUserDto);

      expect(mockCacheService.del).toHaveBeenCalledWith(`user:${userId}`);
    });

    it('should clear paginated cache when creating new user', async () => {
      const createUserDto = {
        email: 'test@example.com',
        name: 'Test User',
        password: 'password123',
        isActive: true,
        roles: [2],
      };

      await service.create(createUserDto);

      expect(mockCacheService.delAll).toHaveBeenCalledWith('user-paginated*');
    });
  });

  it('should create a new user', async () => {
    const createUserDto = {
      email: '1q3U8@example.com',
      name: 'John Doe',
      password: 'password123',
      isActive: true,
      roles: [2],
    };
    const user = await service.create(createUserDto);
    expect(mockUserRepository.create).toHaveBeenCalledWith(createUserDto);
    expect(user.email).toEqual(createUserDto.email);
    expect(user.name).toEqual(createUserDto.name);
    expect(user.isActive).toEqual(createUserDto.isActive);
  });

  it('should find all users', async () => {
    const params: FilterWithPaginationParams = {
      page: 1,
      perPage: 10,
      orderBy: 'name',
      orderDirection: 'ASC',
    };
    const users = await service.findAll(params);
    expect(mockUserRepository.findAndCount).toHaveBeenCalled();
    expect(users.data.length).toEqual(1);
    expect(users.meta.total).toEqual(1);
    expect(users.meta.lastPage).toEqual(1);
  });

  it('should find a user by ID', async () => {
    const userId = 1;
    const user = await service.findOne(userId);
    expect(mockUserRepository.findOne).toHaveBeenCalledWith(
      { id: userId },
      {
        populate: ['roles'],
      },
    );
    expect(user).toEqual({
      id: userId,
      name: 'John Doe',
      email: '1q3U8@example.com',
      isActive: true,
      lastLoginAt: expect.any(Date),
      createdAt: expect.any(Date),
      updatedAt: expect.any(Date),
      roles: expect.any(Array),
    });
  });

  it('should find a user by email', async () => {
    const email = '1q3U8@example.com';
    const user = await service.findByEmail(email);
    expect(mockUserRepository.findOne).toHaveBeenCalledWith({ email });
    expect(mockUserRepository.findOne).toHaveBeenCalledTimes(1);
    expect(user.email).toEqual(email);
  });

  it('should find a user by email with role', async () => {
    const email = '1q3U8@example.com';
    const result = await service.findByEmailWithRole(email);
    expect(mockUserRepository.findOne).toHaveBeenCalledWith(
      { email },
      { populate: ['roles'] },
    );
    expect(result.email).toEqual(email);
    expect(result).toHaveProperty('roles');
  });

  it('should find a user by email with role and permissions', async () => {
    const email = '1q3U8@example.com';
    const result = await service.findByEmailWithRoleAndPermissions(email);
    expect(mockUserRepository.findOne).toHaveBeenCalledWith(
      { email },
      { populate: ['roles', 'roles.permissions', 'permissions'] },
    );
    expect(result.email).toEqual(email);
    expect(result).toHaveProperty('roles');
    expect(result).toHaveProperty('permissions');
    expect(result).toHaveProperty('permissions', expect.any(Array));
    expect(result).toHaveProperty('roles', expect.any(Array));
  });

  it('should update login date', async () => {
    const userId = 1;
    await service.updateLoginDate(userId);
    expect(mockUserRepository.findOne).toHaveBeenCalledWith(userId);
    expect(mockEntityManager.flush).toHaveBeenCalled();
  });

  it('should update user profile', async () => {
    const userId = 1;
    const profileUpdateDto = {
      userId,
      name: 'Jane Doe 2',
      email: '1q3U8@example.com',
    };
    const user = await service.updateProfile(userId, profileUpdateDto);
    expect(mockUserRepository.findOne).toHaveBeenCalledWith(userId);
    expect(mockEntityManager.flush).toHaveBeenCalled();
    expect(user.email).toEqual(profileUpdateDto.email);
    expect(user.name).toEqual(profileUpdateDto.name);
  });

  it('should change user password', async () => {
    const userId = 1;
    const changePasswordDto = {
      password: 'newPassword123',
      passwordConfirmation: 'newPassword123',
    };
    await service.changePassword(userId, changePasswordDto);
    expect(mockUserRepository.findOne).toHaveBeenCalledWith(userId);
    expect(mockEntityManager.flush).toHaveBeenCalled();
  });

  it('should not update a superadmin', async () => {
    const userId = 1;
    const updateUserDto = {
      isActive: false,
    };
    await expect(service.update(userId, updateUserDto)).rejects.toThrow(
      ForbiddenException,
    );
    expect(mockUserRepository.findOne).not.toHaveBeenCalledWith(userId);
    expect(mockEntityManager.flush).not.toHaveBeenCalled();
  });

  it('should update a user', async () => {
    const userId = 10;
    const updateUserDto = {
      isActive: false,
    };

    mockUserRepository.findOne = jest.fn().mockReturnValue({
      id: userId,
      name: 'John Doe',
      email: '1q3U8@example.com',
      isActive: true,
      lastLoginAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const user = await service.update(userId, updateUserDto);
    expect(mockUserRepository.findOne).toHaveBeenCalledWith(userId);
    expect(mockEntityManager.flush).toHaveBeenCalled();
    expect(user.email).toEqual('1q3U8@example.com');
    expect(user.isActive).toEqual(updateUserDto.isActive);
  });

  it('should change self password', async () => {
    const userId = 1;
    const changeSelfPasswordDto = {
      currentPassword: currentPassword,
      password: 'newPassword123',
      passwordConfirmation: 'newPassword123',
    };
    mockUserRepository.findOne = jest.fn().mockResolvedValue({
      id: userId,
      password: currentHashedPassword,
    });
    await service.changeSelfPassword(userId, changeSelfPasswordDto);
    expect(mockUserRepository.findOne).toHaveBeenCalledWith(userId);
    expect(mockEntityManager.flush).toHaveBeenCalled();
  });

  it('should not change self password is current password is wrong', async () => {
    const userId = 1;
    const changeSelfPasswordDto = {
      currentPassword: 'WrongOldPassword',
      password: 'newPassword123',
      passwordConfirmation: 'newPassword123',
    };
    mockUserRepository.findOne = jest.fn().mockResolvedValue({
      id: userId,
      password: 'hashedOldPassword',
    });
    await expect(
      service.changeSelfPassword(userId, changeSelfPasswordDto),
    ).rejects.toThrow(BadRequestException);

    expect(mockUserRepository.findOne).toHaveBeenCalledWith(userId);
    expect(mockEntityManager.flush).not.toHaveBeenCalled();
  });

  it('should assign roles to a user', async () => {
    const userId = 1;
    const roleIds = [2, 3];
    const mockUser = {
      id: userId,
      roles: new Collection<Role>(this as any, mockRoles),
    };
    mockUserRepository.findOne = jest.fn().mockResolvedValue(mockUser);
    mockEntityManager.find = jest.fn().mockResolvedValue(mockRoles);

    await service.assignRoles(userId, roleIds);

    expect(mockUserRepository.findOne).toHaveBeenCalledWith(
      { id: userId },
      { populate: ['roles'] },
    );
    expect(mockEntityManager.find).toHaveBeenCalledWith(Role, {
      id: { $in: roleIds },
    });
    expect(mockUser.roles.set).toHaveBeenCalledWith(mockRoles);
    expect(mockEntityManager.flush).toHaveBeenCalled();
  });

  it('should assign permissions to a user', async () => {
    const userId = 1;
    const permissionIds = [3];
    const mockUser = {
      id: userId,
      roles: new Collection<Role>(this as any, mockRoles),
      permissions: new Collection<Permission>(this as any, mockPermissions),
    };
    mockUserRepository.findOne = jest.fn().mockResolvedValue(mockUser);
    mockEntityManager.find = jest.fn().mockResolvedValue(mockPermissions);

    await service.assignPermissions(userId, permissionIds);

    expect(mockUserRepository.findOne).toHaveBeenCalledWith(
      { id: userId },
      { populate: ['permissions'] },
    );
    expect(mockEntityManager.find).toHaveBeenCalledWith(Permission, {
      id: { $in: permissionIds },
    });
    expect(mockUser.permissions.set).toHaveBeenCalledWith(mockPermissions);
    expect(mockEntityManager.flush).toHaveBeenCalled();
  });

  it('should get user permissions', async () => {
    const userId = 1;
    const mockUser = {
      id: userId,
      roles: createMockCollection<Role>(),
      permissions: createMockCollection<Permission>(),
    };
    mockUserRepository.findOne = jest.fn().mockResolvedValue(mockUser);
    const permissions = await service.getUserPermissions(userId);
    expect(mockUserRepository.findOne).toHaveBeenCalledWith(
      { id: userId },
      { populate: ['roles', 'roles.permissions', 'permissions'] },
    );
    expect(permissions).toEqual(expect.any(Array));
  });

  it('should check if user has permission', async () => {
    const userId = 1;
    const permissionNames = ['view.test.all'];
    const result = await service.hasPermissionTo(userId, permissionNames);
    expect(mockUserRepository.findOne).toHaveBeenCalledWith(
      { id: userId },
      { populate: ['roles', 'roles.permissions', 'permissions'] },
    );
    expect(result).toEqual(expect.any(Boolean));
  });

  it('should delete a user', async () => {
    const userId = 1;
    await service.remove(userId);
    expect(mockUserRepository.findOne).toHaveBeenCalledWith(userId);
    expect(mockEntityManager.removeAndFlush).toHaveBeenCalled();
  });
});
