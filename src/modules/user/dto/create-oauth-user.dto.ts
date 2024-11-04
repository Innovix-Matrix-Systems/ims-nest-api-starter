import {
  IsBoolean,
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import { IsValidRoles } from '../../../common/decorators/valid-roles.decorator';

export class CreateOauthUserDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsOptional()
  @IsString()
  device?: string;

  @IsNotEmpty()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  lastActiveDevice?: string;

  @IsOptional()
  googleId?: string;

  @IsNotEmpty()
  @IsValidRoles()
  roles: number[];
}
