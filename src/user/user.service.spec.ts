import { EntityManager, EntityRepository } from '@mikro-orm/core';
import { getRepositoryToken } from '@mikro-orm/nestjs';
import { Test, TestingModule } from '@nestjs/testing';
import { User } from '../entities/user.entity';
import { PasswordService } from '../misc/password.service';
import { UserTransformer } from './transformer/user.transformer';
import { UserService } from './user.service';

describe('UserService', () => {
  let service: UserService;
  let mockUserRepository: Partial<EntityRepository<User>>;
  let mockEntityManager: Partial<EntityManager>;

  beforeEach(async () => {
    // Create a mock for UserRepository
    mockUserRepository = {
      findOne: jest.fn().mockReturnValue({
        id: 1,
        name: 'John Doe',
        email: '1q3U8@example.com',
        isActive: true,
        lastLoginAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
        roles: ['Admin'],
      }),
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

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        PasswordService,
        UserTransformer,
        { provide: getRepositoryToken(User), useValue: mockUserRepository }, // Provide the mock
        { provide: EntityManager, useValue: mockEntityManager },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
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

  it('should update a user', async () => {
    const userId = 1;
    const updateUserDto = {
      isActive: false,
    };
    const user = await service.update(userId, updateUserDto);
    expect(mockUserRepository.findOne).toHaveBeenCalledWith(userId);
    expect(mockEntityManager.flush).toHaveBeenCalled();
    expect(user.email).toEqual('1q3U8@example.com');
    expect(user.isActive).toEqual(updateUserDto.isActive);
  });

  it('should delete a user', async () => {
    const userId = 1;
    await service.remove(userId);
    expect(mockUserRepository.findOne).toHaveBeenCalledWith(userId);
    expect(mockEntityManager.removeAndFlush).toHaveBeenCalled();
  });
});
