import { BadRequestException, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PasswordService } from '../misc/password.service';
import { UserService } from '../user/user.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly passwordService: PasswordService,
    private readonly jwtService: JwtService,
  ) {}

  async validateUser(
    email: string,
    password: string,
  ): Promise<ValidateUserResponse> {
    const errors: string[] = [];
    const user =
      await this.userService.findByEmailWithRoleAndPermissions(email);
    if (!user) {
      errors.push("Email incorrect, User doesn't exist!");
      return {
        user: null,
        errors,
      };
    }
    const isMatch = await this.passwordService.comparePassword(
      password,
      user.password,
    );
    if (!isMatch) {
      errors.push('Password is Wrong!');
      return {
        user: null,
        errors,
      };
    }

    if (!user.isActive) {
      errors.push('User is not active!');
      return {
        user: null,
        errors,
      };
    }
    if (user && isMatch) {
      return {
        user,
        errors,
      };
    }
    return {
      user: null,
      errors,
    };
  }

  async login(email: string, password: string): Promise<LoginResponse> {
    const validateUserData: ValidateUserResponse = await this.validateUser(
      email,
      password,
    );
    const { user, errors } = validateUserData;
    if (!user) {
      throw new BadRequestException(errors);
    }
    await this.userService.updateLoginDate(user.id);
    const payload: JwtEncodeData = { email: user.email, sub: user.id };
    const token = this.jwtService.sign(payload);
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      isActive: user.isActive,
      createdAt: user.createdAt,
      roles: user.roles,
      permissions: user.permissions,
      AccessToken: token,
    };
  }
}
