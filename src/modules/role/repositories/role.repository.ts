import { EntityRepository } from '@mikro-orm/core'; // or any other driver package
import { Role } from '../entities/role.entity';

export class RoleRepository extends EntityRepository<Role> {
  // custom methods...
}
