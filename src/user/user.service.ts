import { EntityManager, EntityRepository } from '@mikro-orm/core';
import { InjectRepository } from '@mikro-orm/nestjs';
import { Injectable, NotFoundException } from '@nestjs/common';
import { Permission } from '../entities/permission.entity';
import { Role } from '../entities/role.entity';
import { User } from '../entities/user.entity';
import { PasswordService } from '../misc/password.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserTransformer } from './transformer/user.transformer';

interface UserPaginatedList {
  data: Partial<UserResponse>[];
  meta: PaginatedMeta;
}
@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: EntityRepository<User>,
    private readonly em: EntityManager,
    private readonly passwordService: PasswordService,
    private readonly userTransformer: UserTransformer,
  ) {}

  // Create a new user
  async create(createUserDto: CreateUserDto): Promise<Partial<UserResponse>> {
    createUserDto.password = await this.passwordService.hashPassword(
      createUserDto.password,
    );
    const user = this.userRepository.create(createUserDto);
    await this.em.persistAndFlush(user);
    return this.userTransformer.transform(user);
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
      populate: ['roles'],
      limit: perPage,
      offset: (page - 1) * perPage,
    });
    const mappedUsers = this.userTransformer.transformMany(users, {
      loadRelations: true,
    });
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
  async findOne(id: number): Promise<Partial<UserResponse> | null> {
    const user = await this.userRepository.findOne(
      { id },
      { populate: ['roles'] },
    );
    return this.userTransformer.transform(user, {
      loadRelations: true,
    });
  }

  async findByEmail(email: string): Promise<Partial<User> | null> {
    const user = await this.userRepository.findOne({ email });
    return user; // not need to call instanceToPlain as we need password in response
  }

  async findByEmailWithRole(
    email: string,
  ): Promise<Partial<UserResponse> | null> {
    const user = await this.userRepository.findOne(
      { email },
      {
        populate: ['roles'],
      },
    );
    return this.userTransformer.transform(user, {
      loadRelations: true,
      showSensetiveData: true,
    }); // use for authentication
  }

  async findByEmailWithRoleAndPermissions(
    email: string,
  ): Promise<Partial<UserResponse> | null> {
    const user = await this.userRepository.findOne(
      { email },
      {
        populate: ['roles', 'roles.permissions', 'permissions'],
      },
    );
    const userPermissions = user.permissions.getItems();
    const rolePermissions = user.roles
      .getItems()
      .flatMap((role) => role.permissions.getItems());
    const combinedPermissions = [...userPermissions, ...rolePermissions];
    const uniquePermissions = Array.from(
      new Set(combinedPermissions.map((permission) => permission.id)),
    ).map((id) =>
      combinedPermissions.find((permission) => permission.id === id),
    );
    return this.userTransformer.transform(user, {
      loadRelations: true,
      showSensetiveData: true,
      permissions: uniquePermissions,
    }); // use for authentication
  }

  // Update user by ID
  async update(
    id: number,
    updateUserDto: UpdateUserDto,
  ): Promise<Partial<UserResponse>> {
    const user = await this.userRepository.findOne(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    this.userRepository.assign(user, updateUserDto);
    await this.em.flush();
    return this.userTransformer.transform(user);
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

  async assignRoles(userId: number, roleIds: number[]): Promise<User> {
    const user = await this.userRepository.findOne(
      { id: userId },
      {
        populate: ['roles'],
      },
    );
    const roles = await this.em.find(Role, { id: { $in: roleIds } });

    user.roles.set(roles);
    await this.em.flush();
    return user;
  }

  // Bulk assign permissions to a user
  async assignPermissions(
    userId: number,
    permissionIds: number[],
  ): Promise<User> {
    const user = await this.userRepository.findOne(
      { id: userId },
      {
        populate: ['permissions'],
      },
    );
    const permissions = await this.em.find(Permission, {
      id: { $in: permissionIds },
    });

    user.permissions.set(permissions);
    await this.em.flush();
    return user;
  }

  async getUserPermissions(userId: number): Promise<string[]> {
    const user = await this.userRepository.findOne(
      { id: userId },
      {
        populate: ['roles', 'roles.permissions', 'permissions'],
      },
    );

    const userPermissions = user.permissions.getItems();
    const rolePermissions = user.roles
      .getItems()
      .flatMap((role) => role.permissions.getItems());
    const combinedPermissions = [...userPermissions, ...rolePermissions];
    const uniquePermissions = Array.from(
      new Set(combinedPermissions.map((permission) => permission.id)),
    ).map((id) =>
      combinedPermissions.find((permission) => permission.id === id),
    );
    return uniquePermissions.map((permission) => permission.name);
  }

  async hasPermisssionTo(
    userId: number,
    permissionName: string,
  ): Promise<boolean> {
    const user = await this.userRepository.findOne(
      { id: userId },
      {
        populate: ['roles', 'roles.permissions', 'permissions'],
      },
    );
    const userPermissions = user.permissions.getItems();
    const rolePermissions = user.roles
      .getItems()
      .flatMap((role) => role.permissions.getItems());
    const combinedPermissions = [...userPermissions, ...rolePermissions];

    return combinedPermissions.some(
      (permission) => permission.name === permissionName,
    );
  }
}
