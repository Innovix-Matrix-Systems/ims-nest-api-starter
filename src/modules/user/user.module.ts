import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Module } from '@nestjs/common';
import { UserEmailUniqueValidator } from '../../common/decorators/user-email-unique.decorator';
import { IsValidPermissionsValidator } from '../../common/decorators/valid-permission.decorator';
import { IsValidRolesValidator } from '../../common/decorators/valid-roles.decorator';
import { MiscModule } from '../misc/misc.module';
import { Permission } from '../permission/entities/permission.entity';
import { Role } from '../role/entities/role.entity';
import { User } from './entities/user.entity';
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
