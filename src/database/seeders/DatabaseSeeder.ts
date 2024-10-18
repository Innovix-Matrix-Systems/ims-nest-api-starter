import type { EntityManager } from '@mikro-orm/postgresql';
import { Seeder } from '@mikro-orm/seeder';
import { ConfigService } from '@nestjs/config';
import { config } from 'dotenv';
import { getConfigValue } from '../../utils/helper';
import { UserFactory } from '../factories/user.factory';
import { PermissionSeeder } from './PermissionSeeder';
import { RoleSeeder } from './RoleSeeder';
import { UserSeeder } from './UserSeeder';

// Load environment variables for CLI usage
config();
export class DatabaseSeeder extends Seeder {
  constructor(private readonly configService: ConfigService) {
    super();
  }
  async run(em: EntityManager): Promise<void> {
    const appEnv = getConfigValue<string>(
      'APP_ENV',
      'development',
      this.configService,
    );
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
    if (appEnv !== 'production') {
      new UserFactory(em).make(10);
    }
    console.log('Database seeded!');
  }
}
