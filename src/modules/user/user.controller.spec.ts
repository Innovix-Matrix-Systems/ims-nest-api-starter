import { Test, TestingModule } from '@nestjs/testing';
import { Response } from 'express';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { PermissionGuard } from '../../common/guards/permission.guard';
import { ChangePasswordDto } from './dto/change-password.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { PermissionAssignDto } from './dto/permission-assign.dto';
import { ProfileUpdateDto } from './dto/profile-update.dto';
import { ChangeSelfPasswordDto } from './dto/reset-self-password.dto';
import { RoleAssignDto } from './dto/role-assign.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { HttpStatus } from '@nestjs/common';

describe('UserController', () => {
  let controller: UserController;
  let userService: jest.Mocked<UserService>;
  const mockResponse = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn(),
  } as unknown as Response;

  beforeEach(async () => {
    const mockUserService = {
      create: jest.fn(),
      findOne: jest.fn(),
      updateProfile: jest.fn(),
      changeSelfPassword: jest.fn(),
      findAll: jest.fn(),
      update: jest.fn(),
      changePassword: jest.fn(),
      remove: jest.fn(),
      assignRoles: jest.fn(),
      assignPermissions: jest.fn(),
      getUserPermissions: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        {
          provide: UserService,
          useValue: mockUserService,
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: jest.fn().mockReturnValue(true) })
      .overrideGuard(PermissionGuard)
      .useValue({ canActivate: jest.fn().mockReturnValue(true) })
      .compile();

    controller = module.get<UserController>(UserController);
    userService = module.get(UserService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should create a new user', async () => {
    const createUserDto: CreateUserDto = {
      name: 'John Doe',
      email: 'john@example.com',
      password: 'password123',
      roles: [1, 2],
    };
    const createdUser = {
      id: 1,
      name: 'John Doe',
      email: 'john@example.com',
      isActive: true,
      createdAt: new Date(),
    };
    userService.create.mockResolvedValue(createdUser);

    await controller.create(createUserDto, mockResponse);

    expect(userService.create).toHaveBeenCalledWith(createUserDto);
    expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.CREATED);
    expect(mockResponse.json).toHaveBeenCalledWith({
      data: createdUser,
      message: 'User created successfully',
      statusCode: HttpStatus.CREATED,
      success: true,
    });
  });

  it('should get user profile', async () => {
    const loggedInUser = { userId: 1 };
    const userProfile = {
      id: 1,
      name: 'John Doe',
      email: 'john@example.com',
    };
    userService.findOne.mockResolvedValue(userProfile);

    await controller.getProfile(loggedInUser, mockResponse);

    expect(userService.findOne).toHaveBeenCalledWith(1);
    expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.OK);
    expect(mockResponse.json).toHaveBeenCalledWith({
      data: userProfile,
      message: 'Profile fetched successfully',
      statusCode: HttpStatus.OK,
      success: true,
    });
  });

  it('should get user permissions', async () => {
    const loggedInUser = { userId: 1 };
    const permissions = ['user.test.view', 'user.test.edit'];
    userService.getUserPermissions.mockResolvedValue(permissions);

    await controller.getPermissions(loggedInUser, mockResponse);

    expect(userService.getUserPermissions).toHaveBeenCalledWith(1);
    expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.OK);
    expect(mockResponse.json).toHaveBeenCalledWith({
      data: permissions,
      message: 'Permissions fetched successfully',
      statusCode: HttpStatus.OK,
      success: true,
    });
  });

  it('should update user profile', async () => {
    const loggedInUser = { userId: 1 };
    const profileUpdateDto: ProfileUpdateDto = {
      name: 'John Updated',
      email: 'john@example.com',
    };
    const updatedProfile = {
      id: 1,
      name: 'John Updated',
      email: 'john@example.com',
    };
    userService.updateProfile.mockResolvedValue(updatedProfile);

    await controller.updateProfile(
      loggedInUser,
      profileUpdateDto,
      mockResponse,
    );

    expect(userService.updateProfile).toHaveBeenCalledWith(1, profileUpdateDto);
    expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.OK);
    expect(mockResponse.json).toHaveBeenCalledWith({
      data: updatedProfile,
      message: 'profile updated successfully',
      statusCode: HttpStatus.OK,
      success: true,
    });
  });

  it('should change user password', async () => {
    const loggedInUser = { userId: 1 };
    const changePasswordDto: ChangeSelfPasswordDto = {
      currentPassword: 'oldPassword',
      password: 'newPassword',
      passwordConfirmation: 'newPassword',
    };
    const updatedUser = { id: 1, name: 'John Doe' };
    userService.changeSelfPassword.mockResolvedValue(updatedUser);

    await controller.changeSelfPassword(
      loggedInUser,
      changePasswordDto,
      mockResponse,
    );

    expect(userService.changeSelfPassword).toHaveBeenCalledWith(
      1,
      changePasswordDto,
    );
    expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.OK);
    expect(mockResponse.json).toHaveBeenCalledWith({
      data: updatedUser,
      message: 'Password updated successfully',
      statusCode: HttpStatus.OK,
      success: true,
    });
  });

  it('should return all users', async () => {
    const mockUsers = [
      { id: 1, name: 'John Doe' },
      { id: 2, name: 'Jane Doe' },
    ];
    const mockPaginatedResponse = {
      data: mockUsers,
      meta: {
        currentPage: 1,
        from: 1,
        to: 2,
        perPage: 10,
        lastPage: 1,
        total: 2,
      },
    };
    userService.findAll.mockResolvedValue(mockPaginatedResponse);

    await controller.findAll(1, 10, '', undefined, mockResponse);

    expect(userService.findAll).toHaveBeenCalled();
    expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.OK);
    expect(mockResponse.json).toHaveBeenCalledWith({
      data: mockPaginatedResponse.data,
      meta: mockPaginatedResponse.meta,
      message: 'Users fetched successfully',
      statusCode: HttpStatus.OK,
      success: true,
    });
  });

  it('should return a single user', async () => {
    const userId = 1;
    const mockUser = { id: userId, name: 'John Doe' };
    userService.findOne.mockResolvedValue(mockUser);
    await controller.findOne('1', mockResponse);
    expect(userService.findOne).toHaveBeenCalledWith(userId);
    expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.OK);
    expect(mockResponse.json).toHaveBeenCalledWith({
      data: mockUser,
      message: 'User fetched successfully',
      statusCode: HttpStatus.OK,
      success: true,
    });
  });

  it('should return 404 if user not found', async () => {
    const userId = '999';
    userService.findOne.mockResolvedValue(null);

    const mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    } as unknown as Response;

    await controller.findOne(userId, mockResponse);

    expect(userService.findOne).toHaveBeenCalledWith(999);
    expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.NOT_FOUND);
    expect(mockResponse.json).toHaveBeenCalledWith({
      message: 'user not found',
      errors: ['user not found'],
      statusCode: HttpStatus.NOT_FOUND,
      success: false,
    });
  });

  it('should change user password', async () => {
    const userId = 1;
    const changePasswordDto: ChangePasswordDto = {
      password: 'newPassword123',
      passwordConfirmation: 'newPassword123',
    };
    const updatedUser = { id: 1, name: 'John Doe' };
    userService.changePassword.mockResolvedValue(updatedUser);

    await controller.changePassword(userId, changePasswordDto, mockResponse);

    expect(userService.changePassword).toHaveBeenCalledWith(
      userId,
      changePasswordDto,
    );
    expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.OK);
    expect(mockResponse.json).toHaveBeenCalledWith({
      data: updatedUser,
      message: 'Password updated successfully',
      statusCode: HttpStatus.OK,
      success: true,
    });
  });

  it('should update a user', async () => {
    const userId = '1';
    const updateUserDto: UpdateUserDto = { name: 'John Updated' };
    const updatedUser = { id: 1, name: 'John Updated' };
    userService.update.mockResolvedValue(updatedUser);

    await controller.update(userId, updateUserDto, mockResponse);

    expect(userService.update).toHaveBeenCalledWith(1, updateUserDto);
    expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.OK);
    expect(mockResponse.json).toHaveBeenCalledWith({
      data: updatedUser,
      message: 'User updated successfully',
      statusCode: HttpStatus.OK,
      success: true,
    });
  });

  it('should remove a user', async () => {
    const userId = '10';
    userService.remove.mockResolvedValue(true);

    await controller.remove(userId, mockResponse);

    expect(userService.remove).toHaveBeenCalledWith(10);
    expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.NO_CONTENT);
  });

  it('should assign roles to a user', async () => {
    const userId = 1;
    const roleAssignDto: RoleAssignDto = { roles: [1, 2, 3] };
    const updatedUser = {
      id: 1,
      name: 'John Doe',
    };
    userService.assignRoles.mockResolvedValue(updatedUser);

    await controller.assignRoles(userId, roleAssignDto, mockResponse);

    expect(userService.assignRoles).toHaveBeenCalledWith(
      userId,
      roleAssignDto.roles,
    );
    expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.OK);
    expect(mockResponse.json).toHaveBeenCalledWith({
      data: updatedUser,
      message: 'Roles assigned successfully',
      statusCode: HttpStatus.OK,
      success: true,
    });
  });

  it('should assign permissions to a user', async () => {
    const userId = 1;
    const permissionAssignDto: PermissionAssignDto = {
      permissions: [1, 2, 3],
    };
    const updatedUser = {
      id: 1,
      name: 'John Doe',
    };
    userService.assignPermissions.mockResolvedValue(updatedUser);

    await controller.assignPermissions(
      userId,
      permissionAssignDto,
      mockResponse,
    );

    expect(userService.assignPermissions).toHaveBeenCalledWith(
      userId,
      permissionAssignDto.permissions,
    );
    expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.OK);
    expect(mockResponse.json).toHaveBeenCalledWith({
      data: updatedUser,
      message: 'Permissions assigned successfully',
      statusCode: HttpStatus.OK,
      success: true,
    });
  });
});
