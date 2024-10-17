import { Permission } from '../../entities/permission.entity';
import { User } from '../../entities/user.entity';

interface Options {
  loadRelations?: boolean;
  showSensitiveData?: boolean;
  permissions?: Permission[];
}
export class UserTransformer
  implements DataTransformer<User, Partial<UserResponse>>
{
  transform(
    user: User,
    options: Options = {
      loadRelations: false,
      showSensitiveData: false,
      permissions: [],
    },
  ): Partial<UserResponse> {
    const { loadRelations, showSensitiveData, permissions } = options;
    const transformedUser: Partial<UserResponse> = {
      id: user.id,
      name: user.name,
      email: user.email,
      isActive: user.isActive,
      lastLoginAt: user?.lastLoginAt,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };

    if (showSensitiveData) {
      transformedUser.password = user.password;
    }

    if (loadRelations && user?.roles) {
      transformedUser.roles = (user.roles?.getItems() || []).map(
        (role) => role?.name,
      );
    }

    if (loadRelations && permissions?.length > 0) {
      transformedUser.permissions = permissions.map(
        (permission) => permission?.name,
      );
    }
    return transformedUser;
  }

  transformMany(
    users: User[],
    options: Options = {
      loadRelations: false,
      showSensitiveData: false,
      permissions: [],
    },
  ): Partial<UserResponse>[] {
    return users.map((user) => this.transform(user, options));
  }
}
