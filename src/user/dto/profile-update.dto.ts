import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { IsUserEmailUnique } from '../../decorators/user-email-unique.decorator';

export class ProfileUpdateDto {
  @IsOptional()
  userId?: number; //need for unique field validation

  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsEmail()
  @IsUserEmailUnique({ message: 'Email already exists.' })
  email: string;
}
