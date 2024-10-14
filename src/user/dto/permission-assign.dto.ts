import { IsNotEmpty } from 'class-validator';
import { IsValidPermissions } from 'src/decorators/valid-permission.decorator';

export class PermissionAssignDto {
  @IsNotEmpty()
  @IsValidPermissions()
  permissions: number[];
}
