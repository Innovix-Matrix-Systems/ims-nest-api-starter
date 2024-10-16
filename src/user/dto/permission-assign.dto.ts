import { IsNotEmpty } from 'class-validator';
import { IsValidPermissions } from '../../decorators/valid-permission.decorator';

export class PermissionAssignDto {
  @IsNotEmpty()
  @IsValidPermissions()
  permissions: number[];
}
