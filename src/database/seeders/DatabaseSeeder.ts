import type { EntityManager } from '@mikro-orm/postgresql';
import { Seeder } from '@mikro-orm/seeder';
import { UserFactory } from '../factories/user.factory';

export class DatabaseSeeder extends Seeder {
  async run(em: EntityManager): Promise<void> {
    // Seed your database here
    console.log('Seeding database...');
    if (process.env.APP_ENV !== 'production') {
      new UserFactory(em).make(10);
    }
    console.log('Database seeded!');
  }
}
