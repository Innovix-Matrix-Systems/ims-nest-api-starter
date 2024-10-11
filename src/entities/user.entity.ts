import {
  Entity,
  EntityRepositoryType,
  PrimaryKey,
  Property,
  Unique,
} from '@mikro-orm/core';
import { Exclude } from 'class-transformer';
import { UserRepository } from '../repositories/user.repository';

@Entity({ repository: () => UserRepository })
export class User {
  // to allow inference in `em.getRepository()`
  [EntityRepositoryType]?: UserRepository;

  @PrimaryKey()
  id: number;

  @Property()
  name: string;

  @Property()
  @Unique()
  email: string;

  @Property()
  @Exclude()
  password: string;

  @Property({ nullable: true })
  device: string;

  @Property({ nullable: true })
  lastActiveDevice: string;

  @Property({ default: true })
  isActive: boolean = true;

  @Property({ nullable: true })
  lastLoginAt: Date;

  @Property({ onCreate: () => new Date() })
  createdAt: Date = new Date();

  @Property({ onUpdate: () => new Date(), nullable: true })
  updatedAt: Date = new Date();
}
