import { IsNotEmpty, IsString, MinLength } from 'class-validator';
import { IsPasswordConfirmed } from '../../../common/decorators/confirm-password.decorator';

export class ChangePasswordDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  password: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  @IsPasswordConfirmed({
    message: 'Password and password confirmation does not match!',
  })
  passwordConfirmation: string;
}
