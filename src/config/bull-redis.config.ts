import { ConfigService } from '@nestjs/config';
import { config } from 'dotenv';
import { RedisOptions } from 'ioredis';
import { getConfigValue } from '../utils/helper';

// Load environment variables for CLI usage
config();

export class RedisConfig {
  constructor(private readonly configService?: ConfigService) {}

  configureOptions(): RedisOptions {
    return {
      host: getConfigValue<string>(
        'REDIS_HOST',
        'localhost',
        this.configService,
      ),
      port: Number(
        getConfigValue<string>('REDIS_PORT', '6379', this.configService),
      ),
      username: getConfigValue<string>(
        'REDIS_USERNAME',
        '',
        this.configService,
      ),
      password: getConfigValue<string>(
        'REDIS_PASSWORD',
        '',
        this.configService,
      ),
      db: Number(getConfigValue<string>('REDIS_DB', '0', this.configService)),
    };
  }
}

export default (configService?: ConfigService) =>
  new RedisConfig(configService).configureOptions();
