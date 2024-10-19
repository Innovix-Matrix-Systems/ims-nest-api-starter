import { IsNotEmpty } from 'class-validator';
import { IsValidRoles } from '../../../common/decorators/valid-roles.decorator';

export class RoleAssignDto {
  @IsNotEmpty()
  @IsValidRoles()
  roles: number[];
}
