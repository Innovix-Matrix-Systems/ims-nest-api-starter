import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Module } from '@nestjs/common';
import { UserEmailUniqueValidator } from '../decorators/user-email-unique.decorator';
import { IsValidPermissionsValidator } from '../decorators/valid-permission.decorator';
import { IsValidRolesValidator } from '../decorators/valid-roles.decorator';
import { Permission } from '../entities/permission.entity';
import { Role } from '../entities/role.entity';
import { User } from '../entities/user.entity';
import { MiscModule } from '../misc/misc.module';
import { UserTransformer } from './transformer/user.transformer';
import { UserController } from './user.controller';
import { UserService } from './user.service';

@Module({
  imports: [MikroOrmModule.forFeature([User, Role, Permission]), MiscModule],
  controllers: [UserController],
  providers: [
    UserService,
    UserTransformer,
    UserEmailUniqueValidator,
    IsValidRolesValidator,
    IsValidPermissionsValidator,
  ],
  exports: [UserService, UserTransformer],
})
export class UserModule {}
