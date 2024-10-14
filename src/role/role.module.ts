import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Module } from '@nestjs/common';
import { Role } from '../entities/role.entity';
import { User } from '../entities/user.entity';
import { UserModule } from '../user/user.module';
import { RoleController } from './role.controller';
import { RoleService } from './role.service';

@Module({
  imports: [MikroOrmModule.forFeature([User, Role]), UserModule],
  providers: [RoleService],
  controllers: [RoleController],
})
export class RoleModule {}
