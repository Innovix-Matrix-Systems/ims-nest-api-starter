import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Module } from '@nestjs/common';
import { UserEmailUniqueValidator } from '../decorators/user-email-unique.decorator';
import { User } from '../entities/user.entity';
import { PasswordService } from '../misc/password.service';
import { UserTransformer } from './transformer/user.transformer';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { IsValidRolesValidator } from '../decorators/valid-roles.decorator';
import { Role } from '../entities/role.entity';
import { Permission } from '../entities/permission.entity';
import { IsValidPermissionsValidator } from '../decorators/valid-permission.decorator';

@Module({
  imports: [MikroOrmModule.forFeature([User, Role, Permission])],
  controllers: [UserController],
  providers: [
    UserService,
    PasswordService,
    UserTransformer,
    UserEmailUniqueValidator,
    IsValidRolesValidator,
    IsValidPermissionsValidator,
  ],
})
export class UserModule {}
