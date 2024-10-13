import { EntityRepository } from '@mikro-orm/core'; // or any other driver package
import { Permission } from '../entities/permission.entity';

export class PermissionRepository extends EntityRepository<Permission> {
  // custom methods...
}
