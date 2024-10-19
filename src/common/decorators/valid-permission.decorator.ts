import { EntityRepository } from '@mikro-orm/core';
import { InjectRepository } from '@mikro-orm/nestjs';
import { Injectable } from '@nestjs/common';
import {
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
  registerDecorator,
} from 'class-validator';
import { Permission } from '../../modules/permission/entities/permission.entity';

@Injectable()
@ValidatorConstraint({ name: 'isValidPermissions', async: true })
export class IsValidPermissionsValidator
  implements ValidatorConstraintInterface
{
  constructor(
    @InjectRepository(Permission)
    private readonly permissionRepository: EntityRepository<Permission>,
  ) {}

  async validate(permissions: number[]): Promise<boolean> {
    if (!Array.isArray(permissions) || permissions.length === 0) {
      return false;
    }

    const validPermissions = await this.permissionRepository.find({
      id: { $in: permissions },
    });
    return validPermissions.length === permissions.length;
  }

  defaultMessage(): string {
    return 'Permissions are invalid';
  }
}

export function IsValidPermissions(validationOptions?: ValidationOptions) {
  return function (object: any, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsValidPermissionsValidator,
    });
  };
}
