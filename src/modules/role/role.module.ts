import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Module } from '@nestjs/common';
import { UserModule } from '../user/user.module';
import { RoleController } from './role.controller';
import { RoleService } from './role.service';
import { User } from '../user/entities/user.entity';
import { Role } from './entities/role.entity';

@Module({
  imports: [MikroOrmModule.forFeature([User, Role]), UserModule],
  providers: [RoleService],
  controllers: [RoleController],
})
export class RoleModule {}
