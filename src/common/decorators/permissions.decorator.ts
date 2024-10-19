import { SetMetadata } from '@nestjs/common';
import { PermissionName } from '../../enums/permission.enum';

export const Permissions = (...permissions: string[]) =>
  SetMetadata(PermissionName.PERMISSIONS_KEY, permissions);
