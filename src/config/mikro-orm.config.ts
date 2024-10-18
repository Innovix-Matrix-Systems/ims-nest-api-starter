import { Options } from '@mikro-orm/core';
import { EntityGenerator } from '@mikro-orm/entity-generator';
import { Migrator } from '@mikro-orm/migrations';
import { PostgreSqlDriver } from '@mikro-orm/postgresql';
import { SeedManager } from '@mikro-orm/seeder';
import { ConfigService } from '@nestjs/config';
import { config } from 'dotenv';
import { getConfigValue } from '../utils/helper';

// Load environment variables for CLI usage
config();

export class MikroOrmConfig {
  constructor(private readonly configService?: ConfigService) {}

  configureOptions(): Options {
    return {
      driver: PostgreSqlDriver,
      dbName: getConfigValue<string>('DB_NAME', 'postgres', this.configService),
      host: getConfigValue<string>('DB_HOST', 'localhost', this.configService),
      port: Number(
        getConfigValue<string>('DB_PORT', '5432', this.configService),
      ),
      user: getConfigValue<string>(
        'DB_USERNAME',
        'postgres',
        this.configService,
      ),
      password: getConfigValue<string>('DB_PASSWORD', '', this.configService),
      entities: ['dist/**/*.entity.js'],
      entitiesTs: ['src/**/*.entity.ts'],
      extensions: [Migrator, EntityGenerator, SeedManager],
      migrations: {
        path: 'src/database/migrations',
        pathTs: 'src/database/migrations',
      },
      seeder: {
        path: 'src/database/seeders',
        pathTs: 'src/database/seeders',
        defaultSeeder: 'DatabaseSeeder',
      },
      debug: getConfigValue<string>('APP_ENV') !== 'production',
      pool: {
        min: Number(
          getConfigValue<string>('DB_POOL_MIN', '2', this.configService),
        ),
        max: Number(
          getConfigValue<string>('DB_POOL_MAX', '10', this.configService),
        ),
      },
    };
  }
}

export default (configService?: ConfigService): Options =>
  new MikroOrmConfig(configService).configureOptions();
