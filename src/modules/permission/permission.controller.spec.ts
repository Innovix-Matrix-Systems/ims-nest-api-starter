import { Test, TestingModule } from '@nestjs/testing';
import { Response } from 'express';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { PermissionController } from './permission.controller';
import { PermissionService } from './permission.service';
import { Permission } from './entities/permission.entity';
import { HttpStatus } from '@nestjs/common';

describe('PermissionController', () => {
  let controller: PermissionController;
  let permissionService: jest.Mocked<PermissionService>;
  let mockPermissions: Permission[] = [];

  beforeEach(async () => {
    const mockPermissionService = {
      findAll: jest.fn(),
    };

    mockPermissions = [
      {
        id: 1,
        name: 'Test Permission',
        description: 'This is a test permission',
      } as Permission,
    ];

    const module: TestingModule = await Test.createTestingModule({
      controllers: [PermissionController],
      providers: [
        {
          provide: PermissionService,
          useValue: mockPermissionService,
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: jest.fn().mockReturnValue(true) })
      .compile();

    controller = module.get<PermissionController>(PermissionController);
    permissionService = module.get(PermissionService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should return all permissions', async () => {
    permissionService.findAll.mockResolvedValue(mockPermissions);

    const mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    } as unknown as Response;

    await controller.findAll(mockResponse);

    expect(permissionService.findAll).toHaveBeenCalled();
    expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.OK);
    expect(mockResponse.json).toHaveBeenCalledWith({
      data: mockPermissions,
      message: 'Permissions fetched successfully',
      statusCode: HttpStatus.OK,
      success: true,
    });
  });
});
