import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import mikroOrmConfig from './config/mikro-orm.config';
import { MiscModule } from './misc/misc.module';
import { PermissionModule } from './permission/permission.module';
import { RoleModule } from './role/role.module';
import { UserModule } from './user/user.module';
import { HealthModule } from './health/health.module';
import { AppController } from './app.controller';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    MikroOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: () => mikroOrmConfig(),
    }),
    UserModule,
    MiscModule,
    AuthModule,
    PermissionModule,
    RoleModule,
    HealthModule,
  ],
  controllers: [AppController],
  providers: [],
})
export class AppModule {}
