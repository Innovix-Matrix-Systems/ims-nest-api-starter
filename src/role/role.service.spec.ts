import { Collection, EntityManager, EntityRepository } from '@mikro-orm/core';
import { getRepositoryToken } from '@mikro-orm/nestjs';
import { Test, TestingModule } from '@nestjs/testing';
import { Permission } from '../entities/permission.entity';
import { Role } from '../entities/role.entity';
import { User } from '../entities/user.entity';
import { RoleService } from './role.service';

// jest.mock('@mikro-orm/core', () => {
//   const actual = jest.requireActual('@mikro-orm/core');
//   return {
//     ...actual,
//     Collection: jest.fn().mockImplementation(() => ({
//       set: jest.fn(),
//       getItems: jest.fn().mockReturnValue([]),
//     })),
//   };
// });
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
        // Add any other methods you need to mock
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

    // Create a mock Role that includes all properties
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

    // Now this should pass
    expect(role.permissions.getItems()).toEqual(mockPermissions);

    expect(mockEntityManager.persistAndFlush).toHaveBeenCalledWith(role);

    expect(role.name).toEqual(createRoleDto.name);
    expect(role.description).toEqual(createRoleDto.description);
  });

  it('should find all roles', async () => {
    const roles = await service.findAll();
    expect(roles).toEqual(mockRoles);
  });

  // Add more tests as needed...
});
