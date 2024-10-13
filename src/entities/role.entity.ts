import {
  Collection,
  Entity,
  EntityRepositoryType,
  ManyToMany,
  PrimaryKey,
  Property,
} from '@mikro-orm/core';
import { Exclude } from 'class-transformer';
import { RoleRepository } from '../repositories/role.repository';
import { Permission } from './permission.entity';
import { User } from './user.entity';

@Entity({ repository: () => RoleRepository })
export class Role {
  // to allow inference in `em.getRepository()`
  [EntityRepositoryType]?: RoleRepository;

  @PrimaryKey()
  id: number;

  @Property()
  name: string;

  @Property({ nullable: true })
  description?: string;

  @ManyToMany(() => Permission, 'roles', {
    owner: true,
  })
  permissions = new Collection<Permission>(this);

  @ManyToMany(() => User, (user) => user.roles, { hidden: true })
  @Exclude()
  users = new Collection<User>(this);
}
