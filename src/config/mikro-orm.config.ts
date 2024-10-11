import { EntityGenerator } from '@mikro-orm/entity-generator';
import { Migrator } from '@mikro-orm/migrations';
import { Options } from '@mikro-orm/core';
import { PostgreSqlDriver } from '@mikro-orm/postgresql';
import { SeedManager } from '@mikro-orm/seeder';
import { ConfigService } from '@nestjs/config';
import { config } from 'dotenv';

const configService = new ConfigService();

// Load environment variables from .env file
config();

const getConfig = (): Options => ({
  driver: PostgreSqlDriver,
  dbName: process.env.DB_NAME || configService.get<string>('DB_NAME'),
  host: process.env.DB_HOST || configService.get<string>('DB_HOST'),
  port: process.env.DB_PORT
    ? parseInt(process.env.DB_PORT, 10)
    : configService.get<number>('DB_PORT'),
  user: process.env.DB_USERNAME || configService.get<string>('DB_USERNAME'),
  password: process.env.DB_PASSWORD || configService.get<string>('DB_PASSWORD'),
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
  debug:
    (process.env.APP_ENV || configService.get<string>('APP_ENV')) !==
    'production',
});

export default getConfig;
