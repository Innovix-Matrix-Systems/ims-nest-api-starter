import type { EntityManager, EntityRepository } from '@mikro-orm/core';
import { Seeder } from '@mikro-orm/seeder';
import { RoleName } from '../../enums/role.enum';
import { Permission } from '../../modules/permission/entities/permission.entity';
import { Role } from '../../modules/role/entities/role.entity';

export class RoleSeeder extends Seeder {
  async run(em: EntityManager): Promise<void> {
    //get all permissions
    const permissionRepository: EntityRepository<Permission> =
      em.getRepository(Permission);
    const permissions = await permissionRepository.findAll();

    const roleRepository: EntityRepository<Role> = em.getRepository(Role);
    //role SuperAdmin
    const role = roleRepository.create({
      name: RoleName.SUPER_ADMIN,
    });
    role.permissions.add(permissions);
    em.persist(role);
    //role Admin
    const userPermissions = permissions.filter((permission) => {
      return permission.name.includes('user');
    });
    const role2 = roleRepository.create({
      name: RoleName.ADMIN,
    });
    role2.permissions.add(userPermissions);
    em.persist(role2);
    //role User
    const role3 = roleRepository.create({
      name: RoleName.USER,
    });
    em.persist(role3);

    await em.flush();
  }
}
