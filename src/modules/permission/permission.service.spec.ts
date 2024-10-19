import { EntityManager, EntityRepository } from '@mikro-orm/core';
import { Test, TestingModule } from '@nestjs/testing';
import { Permission } from './entities/permission.entity';
import { PermissionService } from './permission.service';
import { getRepositoryToken } from '@mikro-orm/nestjs';

describe('PermissionService', () => {
  let service: PermissionService;
  let mockPermissionRepository: Partial<EntityRepository<Permission>>;
  let mockEntityManager: Partial<EntityManager>;
  let mockPermissions: Permission[] = [];

  beforeEach(async () => {
    mockPermissions = [
      {
        id: 1,
        name: 'Test Permission',
        description: 'This is a test permission',
      } as Permission,
    ];
    mockPermissionRepository = {
      findAll: jest.fn().mockResolvedValue(mockPermissions),
    };
    mockEntityManager = {
      persistAndFlush: jest.fn(),
      flush: jest.fn(),
      removeAndFlush: jest.fn(),
      find: jest.fn().mockResolvedValue(mockPermissions),
    };
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PermissionService,
        {
          provide: getRepositoryToken(Permission),
          useValue: mockPermissionRepository,
        },
        { provide: EntityManager, useValue: mockEntityManager },
      ],
    }).compile();

    service = module.get<PermissionService>(PermissionService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should return all permissions', async () => {
    const permissions = await service.findAll();
    expect(mockPermissionRepository.findAll).toHaveBeenCalled();
    expect(permissions).toEqual(mockPermissions);
  });
});
