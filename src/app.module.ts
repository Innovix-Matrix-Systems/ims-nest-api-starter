import { MikroOrmModule } from '@mikro-orm/nestjs';
import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { CommandModule } from 'nestjs-command';
import { AppController } from './app.controller';
import { AuthModule } from './auth/auth.module';
import { XSecureInstallCommand } from './commands/xsecurity.command';
import mikroOrmConfig from './config/mikro-orm.config';
import { HealthModule } from './health/health.module';
import { XSecurityMiddleware } from './middlewares/xsecurity.middleware';
import { MiscModule } from './misc/misc.module';
import { PermissionModule } from './permission/permission.module';
import { RoleModule } from './role/role.module';
import { UserModule } from './user/user.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
      cache: true,
    }),
    MikroOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) =>
        mikroOrmConfig(configService),
      inject: [ConfigService],
    }),
    CommandModule,
    HealthModule,
    MiscModule,
    PermissionModule,
    RoleModule,
    UserModule,
    AuthModule,
  ],
  controllers: [AppController],
  providers: [XSecureInstallCommand],
})
// export class AppModule {}
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(XSecurityMiddleware).forRoutes('*');
  }
}
