import { Module } from '@nestjs/common';
import { RoleController } from './role.controller';
import { RoleService } from './role.service';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Role } from '../entities/role.entity';

@Module({
  imports: [MikroOrmModule.forFeature([Role])],
  providers: [RoleService],
  controllers: [RoleController],
})
export class RoleModule {}
