import type { EntityManager } from '@mikro-orm/core';
import { Seeder } from '@mikro-orm/seeder';
import { Permission } from '../../entities/permission.entity';
import { getAllPermissions } from '../../utils/permission.helper';

export class PermissionSeeder extends Seeder {
  async run(em: EntityManager): Promise<void> {
    const permissons = getAllPermissions();

    for (const permissionName of permissons) {
      const permission = em.create(Permission, { name: permissionName });
      em.persist(permission);
    }

    await em.flush();
  }
}
