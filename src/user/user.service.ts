import { EntityManager, EntityRepository } from '@mikro-orm/core';
import { InjectRepository } from '@mikro-orm/nestjs';
import { Injectable } from '@nestjs/common';
import { instanceToPlain } from 'class-transformer';
import { User } from 'src/entities/user.entity';
import { PasswordService } from 'src/misc/password.service';
import { getPaginationLinks } from '../utils/helper';
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
  async findAll(
    page: number,
    limit: number,
    reqPath: string,
  ): Promise<UserPaginatedList> {
    const [users, totalCount] = await this.userRepository.findAndCount(
      {},
      {
        limit: limit,
        offset: (page - 1) * limit,
      },
    );
    const mappedUsers = users.map((user) => instanceToPlain(user));
    const totalPages = Math.ceil(totalCount / limit);
    const from = (page - 1) * limit + 1;
    const to = Math.min(page * limit, totalCount);

    const pageData = {
      currentPage: page,
      from: from,
      lastPage: totalPages,
      links: getPaginationLinks(page, totalPages, reqPath),
      path: reqPath,
      perPage: limit,
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
    return instanceToPlain(user);
  }

  // Update user by ID
  async update(
    id: number,
    updateUserDto: UpdateUserDto,
  ): Promise<Partial<User> | null> {
    const user = await this.userRepository.findOne(id);
    if (!user) {
      return null;
    }
    this.userRepository.assign(user, updateUserDto);
    await this.em.flush();
    return instanceToPlain(user);
  }

  // Remove user by ID
  async remove(id: number): Promise<boolean> {
    const user = await this.userRepository.findOne(id);
    if (!user) {
      return false;
    }
    await this.em.removeAndFlush(user);
    return true;
  }
}
