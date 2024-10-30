import { MikroOrmModule } from '@mikro-orm/nestjs';
import { RedisModule } from '@nestjs-modules/ioredis';
import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { CommandModule } from 'nestjs-command';
import { AppController } from './app.controller';
import { CreateModuleCommand } from './commands/create-module.command';
import { XSecureInstallCommand } from './commands/xsecurity.command';
import bullRedisConfig from './config/bull-redis.config';
import mikroOrmConfig from './config/mikro-orm.config';
import redisConfig from './config/redis.config';
import { XSecurityMiddleware } from './middlewares/xsecurity.middleware';
import { AuthModule } from './modules/auth/auth.module';
import { CacheModule } from './modules/cache/cache.module';
import { EmailModule } from './modules/email/email.module';
import { HealthModule } from './modules/health/health.module';
import { MiscModule } from './modules/misc/misc.module';
import { PermissionModule } from './modules/permission/permission.module';
import { RoleModule } from './modules/role/role.module';
import { UserModule } from './modules/user/user.module';
import { BullModule } from '@nestjs/bullmq';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
      cache: true,
    }),
    MikroOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) =>
        mikroOrmConfig(configService),
    }),
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => [
        {
          ttl: configService.get<number>('THROTTLE_TTL'),
          limit: configService.get<number>('THROTTLE_LIMIT'),
        },
      ],
    }),
    RedisModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => redisConfig(configService),
      inject: [ConfigService],
    }),
    BullModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        connection: bullRedisConfig(configService),
        defaultJobOptions: { attempts: 3, removeOnComplete: true },
      }),
    }),
    CommandModule,
    HealthModule,
    MiscModule,
    CacheModule,
    EmailModule,
    PermissionModule,
    RoleModule,
    UserModule,
    AuthModule,
  ],
  controllers: [AppController],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    XSecureInstallCommand,
    CreateModuleCommand,
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(XSecurityMiddleware).forRoutes('*');
  }
}
