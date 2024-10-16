import { Collection } from '@mikro-orm/core';
import { Reflector } from '@nestjs/core';
import { Test, TestingModule } from '@nestjs/testing';
import { Response } from 'express';
import { PermissionGuard } from '../common/guards/permission.guard';
import { Role } from '../entities/role.entity';
import { UserService } from '../user/user.service';
import { CreateRoleDto } from './dto/role-create.dto';
import { RoleController } from './role.controller';
import { RoleService } from './role.service';

describe('RoleController', () => {
  let controller: RoleController;
  let roleService: jest.Mocked<RoleService>;

  beforeEach(async () => {
    const mockRoleService = {
      findAll: jest.fn(),
      create: jest.fn(),
      delete: jest.fn(),
    };

    const mockUserService = {
      hasPermissionTo: jest.fn(),
    };

    const mockReflector = {
      get: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [RoleController],
      providers: [
        {
          provide: RoleService,
          useValue: mockRoleService,
        },
        {
          provide: UserService,
          useValue: mockUserService,
        },
        {
          provide: Reflector,
          useValue: mockReflector,
        },
        PermissionGuard,
      ],
    })
      .overrideGuard(PermissionGuard)
      .useValue({ canActivate: jest.fn().mockReturnValue(true) })
      .compile();

    controller = module.get<RoleController>(RoleController);
    roleService = module.get(RoleService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should return all roles', async () => {
    const mockRoles: Partial<Role>[] = [
      { id: 1, name: 'Admin', description: 'Administrator role' },
      { id: 2, name: 'User', description: 'Regular user role' },
    ];
    roleService.findAll.mockResolvedValue(mockRoles as Role[]);

    const mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    } as unknown as Response;

    await controller.findAll(mockResponse);

    expect(roleService.findAll).toHaveBeenCalled();
    expect(mockResponse.status).toHaveBeenCalledWith(200);
    expect(mockResponse.json).toHaveBeenCalledWith({
      data: mockRoles,
      message: 'Roles fetched successfully',
      statusCode: 200,
      success: true,
    });
  });

  it('should create a new role', async () => {
    const createRoleDto: CreateRoleDto = {
      name: 'New Role',
      description: 'A new role for testing',
      permissions: [1, 2, 3],
    };
    const createdRole: Partial<Role> = {
      id: 3,
      name: 'New Role',
      description: 'A new role for testing',
      permissions: new Collection(this, []), // Mocking the Collection
    };
    roleService.create.mockResolvedValue(createdRole as Role);

    const mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    } as unknown as Response;

    await controller.createRole(createRoleDto, mockResponse);

    expect(roleService.create).toHaveBeenCalledWith(createRoleDto);
    expect(mockResponse.status).toHaveBeenCalledWith(201);
    expect(mockResponse.json).toHaveBeenCalledWith({
      data: createdRole,
      message: 'Role created successfully',
      statusCode: 201,
      success: true,
    });
  });

  it('should delete a role', async () => {
    const roleId = '1';
    roleService.delete.mockResolvedValue(undefined);

    const mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    } as unknown as Response;

    await controller.deleteRole(roleId, mockResponse);

    expect(roleService.delete).toHaveBeenCalledWith(1);
    expect(mockResponse.status).toHaveBeenCalledWith(204);
  });
});
