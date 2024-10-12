import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Module } from '@nestjs/common';
import { UserEmailUniqueValidator } from '../decoretors/user-email-unique.decorator';
import { User } from '../entities/user.entity';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { PasswordService } from '../misc/password.service';

@Module({
  imports: [MikroOrmModule.forFeature([User])],
  controllers: [UserController],
  providers: [UserService, UserEmailUniqueValidator, PasswordService],
})
export class UserModule {}
