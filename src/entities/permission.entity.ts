import {
  Collection,
  Entity,
  EntityRepositoryType,
  ManyToMany,
  PrimaryKey,
  Property,
} from '@mikro-orm/core';
import { PermissionRepository } from '../repositories/permission.repository';
import { Role } from './role.entity';
import { User } from './user.entity';

@Entity({ repository: () => PermissionRepository })
export class Permission {
  // to allow inference in `em.getRepository()`
  [EntityRepositoryType]?: PermissionRepository;
  @PrimaryKey()
  id: number;

  @Property()
  name: string;

  @Property({ nullable: true })
  description?: string;

  @ManyToMany(() => Role, (role) => role.permissions)
  roles = new Collection<Role>(this);

  @ManyToMany(() => User, (user) => user.permissions)
  users = new Collection<User>(this);
}
