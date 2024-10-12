import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PasswordService } from 'src/misc/password.service';
import { User } from '../entities/user.entity';
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
    const user = await this.userService.findByEmail(email);
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

  async login(user: User): Promise<LoginResponse> {
    const payload: JwtEncodeData = { email: user.email, sub: user.id };
    await this.userService.update(user.id, { lastLoginAt: new Date() });
    const token = this.jwtService.sign(payload);
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      isActive: user.isActive,
      createdAt: user.createdAt,
      AccessToken: token,
    };
  }
}
