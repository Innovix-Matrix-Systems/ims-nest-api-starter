import { EntityManager, EntityRepository } from '@mikro-orm/core';
import { getRepositoryToken } from '@mikro-orm/nestjs';
import { Test, TestingModule } from '@nestjs/testing';
import { Role } from '../entities/role.entity';
import { RoleService } from './role.service';

describe('RoleService', () => {
  let service: RoleService;
  let mockRoleRepository: Partial<EntityRepository<Role>>;
  let mockEntityManager: Partial<EntityManager>;

  beforeEach(async () => {
    mockRoleRepository = {
      findOne: jest.fn().mockReturnValue({
        id: 1,
        name: 'Test Role',
        description: 'This is a test role',
      }),
      create: jest.fn().mockImplementation((dto) => ({
        ...dto,
        id: 4, // Assign an ID for the mock role
      })),
    };
    mockEntityManager = {
      persistAndFlush: jest.fn(),
      flush: jest.fn(),
      removeAndFlush: jest.fn(),
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
});
