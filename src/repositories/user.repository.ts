import { EntityRepository } from '@mikro-orm/postgresql'; // or any other driver package
import { User } from 'src/entities/user.entity';

export class UserRepository extends EntityRepository<User> {
  // custom methods...
}
