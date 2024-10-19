import type { EntityManager } from '@mikro-orm/core';
import { Seeder } from '@mikro-orm/seeder';
import { Permission } from '../../modules/permission/entities/permission.entity';
import { getAllPermissions } from '../../utils/permission.helper';

export class PermissionSeeder extends Seeder {
  async run(em: EntityManager): Promise<void> {
    const permissions = getAllPermissions();

    for (const permissionName of permissions) {
      const permission = em.create(Permission, { name: permissionName });
      em.persist(permission);
    }

    await em.flush();
  }
}
