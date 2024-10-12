import { BadRequestException, Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { Strategy } from 'passport-local';
import { AuthService } from '../auth.service';
import { LoginDto } from '../dto/login.dto';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super({ usernameField: 'email' }); // Use 'email' instead of 'username'
  }

  async validate(email: string, password: string): Promise<any> {
    const loginDto = plainToInstance(LoginDto, { email, password });
    const validationErrors = await validate(loginDto);
    if (validationErrors.length > 0) {
      const errorMessages = validationErrors.flatMap((error) =>
        Object.values(error.constraints || {}),
      );
      throw new BadRequestException(errorMessages);
    }
    const validateUserData: ValidateUserResponse =
      await this.authService.validateUser(email, password);
    const { user, errors } = validateUserData;
    if (!user) {
      throw new BadRequestException(errors);
    }
    return user;
  }
}
