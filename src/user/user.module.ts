import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Module } from '@nestjs/common';
import { UserEmailUniqueValidator } from '../decoretors/user-email-unique.decorator';
import { User } from '../entities/user.entity';
import { PasswordService } from '../misc/password.service';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { UserTransformer } from './transformer/user.transformer';

@Module({
  imports: [MikroOrmModule.forFeature([User])],
  controllers: [UserController],
  providers: [
    UserService,
    UserEmailUniqueValidator,
    PasswordService,
    UserTransformer,
  ],
})
export class UserModule {}
