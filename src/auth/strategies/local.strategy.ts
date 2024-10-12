import { BadRequestException, Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { AuthService } from '../auth.service';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super({ usernameField: 'email' }); // Use 'email' instead of 'username'
  }

  async validate(email: string, password: string): Promise<any> {
    const validateUserData: ValidateUserResponse =
      await this.authService.validateUser(email, password);
    const { user, errors } = validateUserData;
    if (!user) {
      throw new BadRequestException(errors);
    }
    return user;
  }
}
