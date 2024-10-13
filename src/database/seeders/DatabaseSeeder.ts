import type { EntityManager } from '@mikro-orm/postgresql';
import { Seeder } from '@mikro-orm/seeder';
import { UserFactory } from '../factories/user.factory';
import { PermissionSeeder } from './PermissionSeeder';
import { RoleSeeder } from './RoleSeeder';
import { UserSeeder } from './UserSeeder';

export class DatabaseSeeder extends Seeder {
  async run(em: EntityManager): Promise<void> {
    // Seed your database here
    console.log('Seeding database...');
    //seed permission
    const permissionSeeder = new PermissionSeeder();
    await permissionSeeder.run(em);
    //seed Role
    const roleSeeder = new RoleSeeder();
    await roleSeeder.run(em);
    //seed user
    const userSeeder = new UserSeeder();
    await userSeeder.run(em);
    //dev data seeder
    if (process.env.APP_ENV !== 'production') {
      new UserFactory(em).make(10);
    }
    console.log('Database seeded!');
  }
}
