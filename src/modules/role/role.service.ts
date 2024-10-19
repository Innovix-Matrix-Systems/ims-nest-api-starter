import { EntityManager, EntityRepository } from '@mikro-orm/core';
import { InjectRepository } from '@mikro-orm/nestjs';
import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { Role } from './entities/role.entity';
import { CreateRoleDto } from './dto/role-create.dto';
import { Permission } from '../permission/entities/permission.entity';

@Injectable()
export class RoleService {
  SYSTEM_ROLE_IDS = [1, 2, 3];
  constructor(
    @InjectRepository(Role)
    private readonly roleRepository: EntityRepository<Role>,
    private readonly em: EntityManager,
  ) {}

  async findAll(): Promise<Role[]> {
    return await this.roleRepository.findAll();
  }

  async create(data: CreateRoleDto): Promise<Role> {
    const { name, description, permissions: permissionIds } = data;
    const role = this.roleRepository.create({ name, description });
    const permissions = await this.em.find(Permission, {
      id: { $in: permissionIds },
    });
    role.permissions.set(permissions);
    await this.em.persistAndFlush(role);
    return role;
  }

  async delete(id: number): Promise<void> {
    if (this.SYSTEM_ROLE_IDS.includes(id)) {
      throw new InternalServerErrorException('System roles cannot be deleted');
    }
    const role = await this.roleRepository.findOne(id);
    if (!role) {
      throw new NotFoundException('Role not found');
    }
    await this.em.removeAndFlush(role);
  }
}
