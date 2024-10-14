import { SetMetadata } from '@nestjs/common';
import { PermissionName } from '../enum/permission.enum';

export const Permissions = (...permissions: string[]) =>
  SetMetadata(PermissionName.PERMISSIONS_KEY, permissions);
