import { PartialType } from '@nestjs/mapped-types';
import { IsNotEmpty, IsString, MinLength } from 'class-validator';
import { ChangePasswordDto } from './change-password.dto';

export class ChangeSelfPasswordDto extends PartialType(ChangePasswordDto) {
  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  currentPassword: string;
}
