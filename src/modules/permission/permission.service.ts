import { InjectRepository } from '@mikro-orm/nestjs';
import { Injectable } from '@nestjs/common';
import { Permission } from './entities/permission.entity';
import { EntityManager, EntityRepository } from '@mikro-orm/core';

@Injectable()
export class PermissionService {
  constructor(
    @InjectRepository(Permission)
    private readonly permissionRepository: EntityRepository<Permission>,
    private readonly em: EntityManager,
  ) {}

  async findAll(): Promise<Permission[]> {
    return await this.permissionRepository.findAll();
  }
}
