import { RedisModuleOptions } from '@nestjs-modules/ioredis';
import { ConfigService } from '@nestjs/config';
import { config } from 'dotenv';
import { getConfigValue } from '../utils/helper';

// Load environment variables for CLI usage
config();

export class RedisConfig {
  constructor(private readonly configService?: ConfigService) {}

  configureOptions(): RedisModuleOptions {
    return {
      type: 'single',
      options: {
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
        maxRetriesPerRequest: Number(
          getConfigValue<string>('REDIS_MAX_RETRIES', '3', this.configService),
        ),
        connectTimeout: Number(
          getConfigValue<string>(
            'REDIS_CONNECT_TIMEOUT',
            '10000',
            this.configService,
          ),
        ),
        retryStrategy: (times: number) =>
          Math.min(
            times *
              Number(
                getConfigValue<string>(
                  'REDIS_RETRY_DELAY',
                  '50',
                  this.configService,
                ),
              ),
            Number(
              getConfigValue<string>(
                'REDIS_RETRY_DELAY_MAX',
                '2000',
                this.configService,
              ),
            ),
          ),
      },
    };
  }
}

export default (configService?: ConfigService) =>
  new RedisConfig(configService).configureOptions();
