import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { UserModule } from './user/user.module';
import mikroOrmConfig from './config/mikro-orm.config';
import { MiscModule } from './misc/misc.module';

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
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
