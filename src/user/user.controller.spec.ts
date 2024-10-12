import { EntityManager, EntityRepository } from '@mikro-orm/core';
import { getRepositoryToken } from '@mikro-orm/nestjs';
import { Test, TestingModule } from '@nestjs/testing';
import { Response } from 'express';
import { User } from '../entities/user.entity';
import { PasswordService } from '../misc/password.service';
import { UserController } from './user.controller';
import { UserService } from './user.service';

describe('UserController', () => {
  let controller: UserController;
  let mockUserRepository: Partial<EntityRepository<User>>;
  let mockEntityManager: Partial<EntityManager>;

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

    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        UserService,
        PasswordService,
        { provide: getRepositoryToken(User), useValue: mockUserRepository },
        { provide: EntityManager, useValue: mockEntityManager },
      ],
    }).compile();

    controller = module.get<UserController>(UserController);
  });

  const createMockResponse = (): Response => {
    const res: Partial<Response> = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
      send: jest.fn().mockReturnThis(),
    };
    return res as Response;
  };

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should create a new user', async () => {
    const createUserDto = {
      email: '1q3U8@example.com',
      name: 'John Doe',
      password: 'password123',
      isActive: true,
    };
    const resp = createMockResponse();
    await controller.create(createUserDto, resp);
    expect(mockUserRepository.create).toHaveBeenCalledWith(createUserDto);
    expect(resp.status).toHaveBeenCalledWith(201);
    expect(resp.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: true,
        statusCode: 201,
        message: 'User created successfully',
        data: expect.objectContaining({
          id: expect.any(Number),
          email: createUserDto.email,
          name: createUserDto.name,
          isActive: createUserDto.isActive,
          createdAt: expect.any(Date),
          updatedAt: expect.any(Date),
        }),
      }),
    );
  });

  it('should find a user by ID', async () => {
    const userId = 1;
    const resp = createMockResponse();
    await controller.findOne(userId.toString(), resp);
    expect(resp.status).toHaveBeenCalledWith(200);
    expect(resp.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: true,
        statusCode: 200,
        message: 'User fetched successfully',
        data: expect.objectContaining({
          id: userId,
          name: 'John Doe',
          email: '1q3U8@example.com',
          isActive: true,
          createdAt: expect.any(Date),
          updatedAt: expect.any(Date),
        }),
      }),
    );
  });

  it('should update a user', async () => {
    const userId = 1;
    const updateUserDto = {
      name: 'Jane Doe',
      isActive: false,
    };
    const resp = createMockResponse();
    await controller.update(userId.toString(), updateUserDto, resp);
    expect(mockUserRepository.assign).toHaveBeenCalledWith(
      expect.objectContaining({ id: userId }),
      updateUserDto,
    );
    expect(resp.status).toHaveBeenCalledWith(200);
    expect(resp.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: true,
        statusCode: 200,
        message: 'User updated successfully',
        data: expect.objectContaining({
          id: userId,
          name: 'Jane Doe',
          email: '1q3U8@example.com',
          isActive: false,
          createdAt: expect.any(Date),
          updatedAt: expect.any(Date),
        }),
      }),
    );
  });

  it('should delete a user', async () => {
    const userId = 1;
    const resp = createMockResponse();
    await controller.remove(userId.toString(), resp);
    expect(mockEntityManager.removeAndFlush).toHaveBeenCalled();
    expect(resp.status).toHaveBeenCalledWith(204);
    expect(resp.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: true,
        statusCode: 204,
        message: 'User deleted successfully',
      }),
    );
  });
});
