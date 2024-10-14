import { IsNotEmpty } from 'class-validator';
import { IsValidRoles } from '../../decorators/valid-roles.decorator';

export class RoleAssignDto {
  @IsNotEmpty()
  @IsValidRoles()
  roles: number[];
}
