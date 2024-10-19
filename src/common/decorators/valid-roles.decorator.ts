import { EntityRepository } from '@mikro-orm/core';
import { InjectRepository } from '@mikro-orm/nestjs';
import { Injectable } from '@nestjs/common';
import {
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
  registerDecorator,
} from 'class-validator';
import { Role } from '../../modules/role/entities/role.entity';

@Injectable()
@ValidatorConstraint({ name: 'isValidRoles', async: true })
export class IsValidRolesValidator implements ValidatorConstraintInterface {
  constructor(
    @InjectRepository(Role)
    private readonly roleRepository: EntityRepository<Role>,
  ) {}

  async validate(roles: number[]): Promise<boolean> {
    if (!Array.isArray(roles) || roles.length === 0) {
      return false;
    }

    const validRoles = await this.roleRepository.find({
      id: { $in: roles },
    });
    return validRoles.length === roles.length;
  }

  defaultMessage(): string {
    return 'Roles are invalid';
  }
}

export function IsValidRoles(validationOptions?: ValidationOptions) {
  return function (object: any, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsValidRolesValidator,
    });
  };
}
