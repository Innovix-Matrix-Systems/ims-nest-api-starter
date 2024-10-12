import { EntityManager, EntityRepository } from '@mikro-orm/core';
import { InjectRepository } from '@mikro-orm/nestjs';
import { Injectable, NotFoundException } from '@nestjs/common';
import { instanceToPlain } from 'class-transformer';
import { User } from 'src/entities/user.entity';
import { PasswordService } from 'src/misc/password.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

interface UserPaginatedList {
  data: Partial<User>[];
  meta: PaginatedMeta;
}
@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: EntityRepository<User>,
    private readonly em: EntityManager,
    private readonly passwordService: PasswordService,
  ) {}

  // Create a new user
  async create(createUserDto: CreateUserDto): Promise<Partial<User>> {
    createUserDto.password = await this.passwordService.hashPassword(
      createUserDto.password,
    );
    const user = this.userRepository.create(createUserDto);
    await this.em.persistAndFlush(user);
    return instanceToPlain(user);
  }

  // Find all users
  async findAll(params: PaginatedParams): Promise<UserPaginatedList> {
    const { page, perPage, search, searchFields, selectFields } = params;
    const where: any = {};
    //map search fields
    if (search && searchFields && searchFields.length > 0) {
      where.$or = searchFields.map((field) => ({
        [field]: { $ilike: `%${search}%` }, //case-insensitive partial match
      }));
    }
    // map filters
    if (selectFields && selectFields.length > 0) {
      selectFields.forEach((field) => {
        Object.assign(where, field);
      });
    }
    const [users, totalCount] = await this.userRepository.findAndCount(where, {
      limit: perPage,
      offset: (page - 1) * perPage,
    });
    const mappedUsers = users.map((user) => instanceToPlain(user));
    const totalPages = Math.ceil(totalCount / perPage);
    const from = (page - 1) * perPage + 1;
    const to = Math.min(page * perPage, totalCount);

    const pageData = {
      currentPage: page,
      from: from,
      lastPage: totalPages,
      perPage: perPage,
      to: to,
      total: totalCount,
    };

    return {
      data: mappedUsers,
      meta: pageData,
    };
  }

  // Find one user by ID
  async findOne(id: number): Promise<Partial<User> | null> {
    const user = await this.userRepository.findOne({ id });
    return instanceToPlain(user);
  }

  async findByEmail(email: string): Promise<Partial<User> | null> {
    const user = await this.userRepository.findOne({ email });
    return user;
  }

  // Update user by ID
  async update(
    id: number,
    updateUserDto: UpdateUserDto,
  ): Promise<Partial<User>> {
    const user = await this.userRepository.findOne(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    this.userRepository.assign(user, updateUserDto);
    await this.em.flush();
    return instanceToPlain(user);
  }

  // Remove user by ID
  async remove(id: number): Promise<boolean> {
    const user = await this.userRepository.findOne(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    try {
      await this.em.removeAndFlush(user);
      return true;
    } catch (error) {
      console.log(error);
      return true;
    }
  }
}
