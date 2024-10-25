import { RedisModule } from '@nestjs-modules/ioredis';
import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CacheService } from './cache.service';

@Module({
  imports: [
    RedisModule.forRootAsync({
      useFactory: (configService: ConfigService) => ({
        type: 'single',
        options: {
          host: configService.get('REDIS_HOST'),
          port: Number(configService.get<number>('REDIS_PORT')),
          username: configService.get('REDIS_USERNAME'),
          password: configService.get('REDIS_PASSWORD'),
          db: Number(configService.get<number>('REDIS_DB')),
          maxRetriesPerRequest: Number(
            configService.get<number>('REDIS_MAX_RETRIES'),
          ),
          connectTimeout: Number(
            configService.get<number>('REDIS_CONNECT_TIMEOUT'),
          ),
          retryStrategy: (times) =>
            Math.min(
              times * Number(configService.get<number>('REDIS_RETRY_DELAY')),
              Number(configService.get<number>('REDIS_RETRY_DELAY_MAX')),
            ),
        },
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [CacheService],
  exports: [CacheService],
})
export class CacheModule {}
