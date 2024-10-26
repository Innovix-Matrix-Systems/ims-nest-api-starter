import { EntityRepository } from '@mikro-orm/core'; // or any other driver package
import { User } from '../entities/user.entity';

export class UserRepository extends EntityRepository<User> {}
