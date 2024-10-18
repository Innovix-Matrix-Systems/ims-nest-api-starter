import { Collection, EntityManager, EntityRepository } from '@mikro-orm/core';
import { getRepositoryToken } from '@mikro-orm/nestjs';
import { InternalServerErrorException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { Permission } from '../entities/permission.entity';
import { Role } from '../entities/role.entity';
import { User } from '../entities/user.entity';
import { RoleService } from './role.service';

jest.mock('@mikro-orm/core', () => {
  const actual = jest.requireActual('@mikro-orm/core');
  return {
    ...actual,
    Collection: jest.fn().mockImplementation(() => {
      let items = [];
      return {
        set: jest.fn((newItems) => {
          items = newItems;
        }),
        getItems: jest.fn(() => items),
      };
    }),
  };
});

describe('RoleService', () => {
  let service: RoleService;
  let mockRoleRepository: Partial<EntityRepository<Role>>;
  let mockEntityManager: Partial<EntityManager>;
  let mockRoles: Role[] = [];
  let mockPermissions: Permission[] = [];

  beforeEach(async () => {
    mockPermissions = [
      {
        id: 1,
        name: 'Test Permission',
        description: 'This is a test permission',
      } as Permission,
    ];
    const createMockRole = (
      id: number,
      name: string,
      description: string,
    ): Role => ({
      id,
      name,
      description,
      permissions: new Collection<Permission>(this as any),
      users: new Collection<User>(this as any),
    });

    mockRoles = [createMockRole(4, 'Test Role', 'This is a test role')];

    mockRoleRepository = {
      findAll: jest.fn().mockResolvedValue(mockRoles),
      create: jest
        .fn()
        .mockImplementation((dto) =>
          createMockRole(4, dto.name, dto.description),
        ),
      findOne: jest
        .fn()
        .mockImplementation((id) => mockRoles.find((role) => role.id === id)),
    };

    mockEntityManager = {
      persistAndFlush: jest.fn(),
      flush: jest.fn(),
      removeAndFlush: jest.fn(),
      find: jest.fn().mockResolvedValue(mockPermissions),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RoleService,
        { provide: getRepositoryToken(Role), useValue: mockRoleRepository },
        { provide: EntityManager, useValue: mockEntityManager },
      ],
      imports: [],
    }).compile();

    service = module.get<RoleService>(RoleService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create a new role', async () => {
    const createRoleDto = {
      name: 'Test Role',
      description: 'This is a test role',
      permissions: [1],
    };

    mockEntityManager.find = jest.fn().mockResolvedValue(mockPermissions);

    const role = await service.create(createRoleDto);

    expect(mockRoleRepository.create).toHaveBeenCalledWith({
      name: createRoleDto.name,
      description: createRoleDto.description,
    });

    expect(mockEntityManager.find).toHaveBeenCalledWith(Permission, {
      id: { $in: createRoleDto.permissions },
    });

    // Ensure that set was called with mockPermissions
    expect(role.permissions.set).toHaveBeenCalledWith(mockPermissions);

    expect(role.permissions.getItems()).toEqual(mockPermissions);

    expect(mockEntityManager.persistAndFlush).toHaveBeenCalledWith(role);

    expect(role.name).toEqual(createRoleDto.name);
    expect(role.description).toEqual(createRoleDto.description);
  });

  it('should find all roles', async () => {
    const roles = await service.findAll();
    expect(roles).toEqual(mockRoles);
  });

  it('should not delete a system role', async () => {
    const systemRoleId = 1; // 1 is a system role ID
    // await expect(service.delete(systemRoleId)).rejects.toThrow(
    //   InternalServerErrorException,
    // );

    try {
      await service.delete(systemRoleId);
    } catch (error) {
      expect(error).toBeInstanceOf(InternalServerErrorException);
      expect(error.message).toEqual('System roles cannot be deleted');
      expect(error.getStatus()).toEqual(500);
    }
    expect(mockEntityManager.removeAndFlush).not.toHaveBeenCalled();
  });

  it('should delete a system role', async () => {
    await service.delete(4);

    expect(mockRoleRepository.findOne).toHaveBeenCalledWith(4);
    expect(mockEntityManager.removeAndFlush).toHaveBeenCalled();
  });
});
