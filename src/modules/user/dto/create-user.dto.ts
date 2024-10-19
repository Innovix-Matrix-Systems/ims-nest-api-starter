import {
  IsBoolean,
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import { IsUserEmailUnique } from '../../../common/decorators/user-email-unique.decorator';
import { IsValidRoles } from '../../../common/decorators/valid-roles.decorator';

export class CreateUserDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsEmail()
  @IsUserEmailUnique({ message: 'Email already exists.' })
  email: string;

  @IsNotEmpty()
  @IsString()
  password: string;

  @IsOptional()
  @IsString()
  device?: string;

  @IsNotEmpty()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  lastActiveDevice?: string;

  @IsNotEmpty()
  @IsValidRoles()
  roles: number[];
}
