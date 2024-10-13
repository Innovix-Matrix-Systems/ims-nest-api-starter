import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { User } from '../entities/user.entity';
import { PasswordService } from '../misc/password.service';
import { UserService } from '../user/user.service';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtStrategy } from './strategies/jwt.strategy';
import { LocalStrategy } from './strategies/local.strategy';
import { ConfigService } from '@nestjs/config';
import { UserTransformer } from '../user/transformer/user.transformer';

@Module({
  imports: [
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: process.env.JWT_EXPIRATION || '30d' },
    }),
    MikroOrmModule.forFeature([User]),
  ],
  providers: [
    ConfigService,
    AuthService,
    JwtStrategy,
    LocalStrategy,
    UserService,
    PasswordService,
    UserTransformer,
  ],
  controllers: [AuthController],
})
export class AuthModule {}
