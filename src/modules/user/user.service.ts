import { EntityManager, EntityRepository } from '@mikro-orm/core';
import { InjectRepository } from '@mikro-orm/nestjs';
import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CacheService } from '../cache/cache.service';
import { FilterService } from '../misc/filter.service';
import { PasswordService } from '../misc/password.service';
import { Permission } from '../permission/entities/permission.entity';
import { Role } from '../role/entities/role.entity';
import { ChangePasswordDto } from './dto/change-password.dto';
import { CreateOauthUserDto } from './dto/create-oauth-user.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { ProfileUpdateDto } from './dto/profile-update.dto';
import { ChangeSelfPasswordDto } from './dto/reset-self-password.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';
import { UserTransformer } from './transformer/user.transformer';

@Injectable()
export class UserService {
  // List of role ids that can't be assigned (ex: SuperAdmin)
  private UNASSIGNABLE_ROLE_IDS = [1];
  // unchangeable user ids (ex: SuperAdmin)
  private UNCHANGEABLE_USER_IDS = [1];

  // cache keys
  private USER_CACHE_PREFIX = 'user:';
  private USER_CACHE_DEFAULT_TTL = 3600 * 24;
  private USER_PAGINATED_CACHE_PREFIX = 'user-paginated';
  private USER_PAGINATED_CACHE_DEFAULT_TTL = 600;
  private USER_PERMISSIONS_CACHE_PREFIX = 'user-permissions:';
  private USER_PERMISSIONS_CACHE_TTL = 3600;

  constructor(
    @InjectRepository(User)
    private readonly userRepository: EntityRepository<User>,
    private readonly em: EntityManager,
    private readonly passwordService: PasswordService,
    private readonly cacheService: CacheService,
    private readonly filterService: FilterService,
    private readonly userTransformer: UserTransformer,
  ) {}

  // Create a new user
  async create(createUserDto: CreateUserDto): Promise<Partial<UserResponse>> {
    createUserDto.password = await this.passwordService.hashPassword(
      createUserDto.password,
    );
    createUserDto.roles = createUserDto.roles.filter(
      (roleId) => !this.UNASSIGNABLE_ROLE_IDS.includes(roleId),
    );
    const user = this.userRepository.create(createUserDto);
    await this.em.persistAndFlush(user);
    await this.cacheService.delAll(`${this.USER_PAGINATED_CACHE_PREFIX}*`);
    return this.userTransformer.transform(user);
  }

  async createOauthUser(
    createOauthUserDto: CreateOauthUserDto,
  ): Promise<Partial<UserResponse>> {
    createOauthUserDto.roles = createOauthUserDto.roles.filter(
      (roleId) => !this.UNASSIGNABLE_ROLE_IDS.includes(roleId),
    );
    const user = this.userRepository.create(createOauthUserDto);
    await this.em.persistAndFlush(user);
    await this.cacheService.delAll(`${this.USER_PAGINATED_CACHE_PREFIX}*`);
    return this.userTransformer.transform(user);
  }

  // Find all users
  async findAll(
    params: FilterWithPaginationParams,
  ): Promise<UserPaginatedList> {
    const cachedUsers = await this.cacheService.get<UserPaginatedList>(
      `${this.USER_PAGINATED_CACHE_PREFIX}-${JSON.stringify(params)}`,
    );
    if (cachedUsers) return cachedUsers;
    const { data, meta } = await this.filterService.filter(
      this.userRepository,
      params,
      ['id', 'name', 'email', 'createdAt'],
      ['roles'],
    );
    const mappedUsers = this.userTransformer.transformMany(data, {
      loadRelations: true,
    });

    const result = {
      data: mappedUsers,
      meta,
    };

    await this.cacheService.set(
      `${this.USER_PAGINATED_CACHE_PREFIX}-${JSON.stringify(params)}`,
      result,
      this.USER_PAGINATED_CACHE_DEFAULT_TTL,
    );

    return result;
  }

  // Find one user by ID
  async findOne(id: number): Promise<Partial<UserResponse> | null> {
    const cachedUser =
      await this.cacheService.get<Partial<UserResponse> | null>(
        `${this.USER_CACHE_PREFIX}${id}`,
      );
    if (cachedUser) return cachedUser;
    const user = await this.userRepository.findOne(
      { id },
      { populate: ['roles'] },
    );
    const userResponse = this.userTransformer.transform(user, {
      loadRelations: true,
    });

    await this.cacheService.set(
      `${this.USER_CACHE_PREFIX}${id}`,
      userResponse,
      this.USER_CACHE_DEFAULT_TTL,
    );

    return userResponse;
  }

  async findByEmail(email: string): Promise<Partial<User> | null> {
    return await this.userRepository.findOne({ email });
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
      showSensitiveData: true,
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
    if (!user) return null;
    const userPermissions = user?.permissions?.getItems() || [];
    const rolePermissions = (user?.roles?.getItems() || []).flatMap((role) =>
      role.permissions.getItems(),
    );
    const combinedPermissions = [...userPermissions, ...rolePermissions];
    const uniquePermissions = Array.from(
      new Set(combinedPermissions.map((permission) => permission.id)),
    ).map((id) =>
      combinedPermissions.find((permission) => permission.id === id),
    );
    return this.userTransformer.transform(user, {
      loadRelations: true,
      showSensitiveData: true,
      permissions: uniquePermissions,
    }); // use for authentication
  }

  // Update user by ID
  async update(
    id: number,
    updateUserDto: UpdateUserDto,
  ): Promise<Partial<UserResponse>> {
    if (this.UNCHANGEABLE_USER_IDS.includes(id)) {
      throw new ForbiddenException("You can't update this user");
    }
    const user = await this.userRepository.findOne(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    //remove sensitive info like role, password from dto
    delete updateUserDto.password;
    delete updateUserDto.roles;
    this.userRepository.assign(user, updateUserDto);
    await this.em.flush();
    await this.cacheService.del(`${this.USER_CACHE_PREFIX}${id}`);
    return this.userTransformer.transform(user);
  }

  async updateLoginDate(id: number): Promise<Partial<UserResponse>> {
    const user = await this.userRepository.findOne(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    this.userRepository.assign(user, { lastLoginAt: new Date() });
    await this.em.flush();
    await this.cacheService.del(`${this.USER_CACHE_PREFIX}${id}`);
    await this.cacheService.delAll(`${this.USER_PAGINATED_CACHE_PREFIX}*`);
    return this.userTransformer.transform(user);
  }

  async updateProfile(
    id: number,
    data: ProfileUpdateDto,
  ): Promise<Partial<UserResponse>> {
    const user = await this.userRepository.findOne(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { userId: _userId, ...restOfDto } = data;

    this.userRepository.assign(user, restOfDto);
    await this.em.flush();
    await this.cacheService.del(`${this.USER_CACHE_PREFIX}${id}`);
    return this.userTransformer.transform(user);
  }

  async changePassword(id: number, changePasswordDto: ChangePasswordDto) {
    const user = await this.userRepository.findOne(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    user.password = await this.passwordService.hashPassword(
      changePasswordDto.password,
    );
    await this.em.flush();
    return this.userTransformer.transform(user);
  }

  async changeSelfPassword(
    id: number,
    changeSelfPasswordDto: ChangeSelfPasswordDto,
  ) {
    const user = await this.userRepository.findOne(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    const { currentPassword, password } = changeSelfPasswordDto;
    if (
      !(await this.passwordService.comparePassword(
        currentPassword,
        user.password,
      ))
    ) {
      throw new BadRequestException(
        'Password or Current Password is incorrect',
      );
    }
    user.password = await this.passwordService.hashPassword(password);
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
      await this.cacheService.del(`${this.USER_CACHE_PREFIX}${id}`);
      await this.cacheService.delAll(`${this.USER_PAGINATED_CACHE_PREFIX}*`);
      await this.em.removeAndFlush(user);
      return true;
    } catch (error) {
      console.log(error);
      return true;
    }
  }

  //Access control
  async assignRoles(
    userId: number,
    roleIds: number[],
  ): Promise<Partial<UserResponse>> {
    //filter out unassignable roles
    const roleIdsToAssign = roleIds.filter(
      (roleId) => !this.UNASSIGNABLE_ROLE_IDS.includes(roleId),
    );
    const user = await this.userRepository.findOne(
      { id: userId },
      {
        populate: ['roles'],
      },
    );
    if (!user) {
      throw new NotFoundException('User not found');
    }
    const roles = await this.em.find(Role, { id: { $in: roleIdsToAssign } });

    user.roles.set(roles);
    await this.em.flush();
    await this.cacheService.del(`${this.USER_CACHE_PREFIX}${userId}`);
    await this.cacheService.del(
      `${this.USER_PERMISSIONS_CACHE_PREFIX}${userId}`,
    );
    return this.userTransformer.transform(user);
  }

  // Bulk assign permissions to a user
  async assignPermissions(
    userId: number,
    permissionIds: number[],
  ): Promise<Partial<UserResponse>> {
    const user = await this.userRepository.findOne(
      { id: userId },
      {
        populate: ['permissions'],
      },
    );
    if (!user) {
      throw new NotFoundException('User not found');
    }
    const permissions = await this.em.find(Permission, {
      id: { $in: permissionIds },
    });

    user.permissions.set(permissions);
    await this.em.flush();
    await this.cacheService.del(`${this.USER_CACHE_PREFIX}${userId}`);
    await this.cacheService.del(
      `${this.USER_PERMISSIONS_CACHE_PREFIX}${userId}`,
    );
    return this.userTransformer.transform(user);
  }

  async getUserPermissions(userId: number): Promise<string[]> {
    const cachedPermissions = await this.cacheService.get<string[]>(
      `${this.USER_PERMISSIONS_CACHE_PREFIX}${userId}`,
    );
    if (cachedPermissions) return cachedPermissions;
    const user = await this.userRepository.findOne(
      { id: userId },
      {
        populate: ['roles', 'roles.permissions', 'permissions'],
      },
    );

    if (!user) return [];

    const userPermissions = user?.permissions?.getItems() || [];
    const rolePermissions =
      user?.roles?.getItems()?.flatMap((role) => role.permissions.getItems()) ||
      [];

    const permissions = [
      ...new Set(
        [...userPermissions, ...rolePermissions].map(
          (permission) => permission.name,
        ),
      ),
    ];

    this.cacheService.set(
      `${this.USER_PERMISSIONS_CACHE_PREFIX}${userId}`,
      permissions,
      this.USER_PERMISSIONS_CACHE_TTL,
    );

    return permissions;
  }

  async hasPermissionTo(
    userId: number,
    permissionNames: string[],
  ): Promise<boolean> {
    const userPermissions = await this.getUserPermissions(userId);
    return permissionNames.every((permissionName) => {
      return userPermissions.some(
        (permission) => permission === permissionName,
      );
    });
  }
}
