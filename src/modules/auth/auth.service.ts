import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { OAuth2Client } from 'google-auth-library';
import { PasswordService } from '../misc/password.service';
import { RoleID } from '../role/enums/roleID.enum';
import { UserService } from '../user/user.service';
import { GoogleLoginDto } from './dto/google-login.dto';

@Injectable()
export class AuthService {
  private googleClient: OAuth2Client;
  constructor(
    private readonly userService: UserService,
    private readonly passwordService: PasswordService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {
    this.googleClient = new OAuth2Client(
      this.configService.get<string>('GOOGLE_CLIENT_ID'),
    );
  }

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

  async googleLogin(profile: GoogleSimpleProfile): Promise<LoginResponse> {
    let user = await this.userService.findByEmailWithRoleAndPermissions(
      profile.email,
    );
    if (!user) {
      // Create new user from Google profile
      user = await this.userService.createOauthUser({
        email: profile.email,
        name: profile.displayName,
        isActive: true,
        googleId: profile.googleId,
        roles: [RoleID.USER],
      });
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

  async verifyGoogleUser(googleLoginDto: GoogleLoginDto): Promise<void> {
    const { googleId, accessToken } = googleLoginDto;
    const ticket = await this.googleClient.getTokenInfo(accessToken);

    if (ticket.sub !== googleId) {
      throw new BadRequestException('GoogleId of the user is invalid');
    }

    if (Boolean(ticket.email_verified) !== true) {
      throw new BadRequestException('Email of the user is not verified');
    }

    if (!ticket.email || ticket.email !== googleLoginDto.email) {
      throw new BadRequestException('Email of the user is invalid');
    }
  }

  async googleLoginByToken(
    googleLoginDto: GoogleLoginDto,
  ): Promise<LoginResponse> {
    // Verify the Google token
    await this.verifyGoogleUser(googleLoginDto);

    let user = await this.userService.findByEmailWithRoleAndPermissions(
      googleLoginDto.email,
    );

    if (!user) {
      // Create new user with verified Google data
      user = await this.userService.createOauthUser({
        googleId: googleLoginDto.googleId,
        email: googleLoginDto.email,
        name: googleLoginDto.name,
        isActive: true,
        roles: [RoleID.USER],
      });
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
