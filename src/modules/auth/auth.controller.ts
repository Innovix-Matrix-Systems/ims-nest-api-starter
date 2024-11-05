import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Post,
  Req,
  Res,
  UseFilters,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { BaseController } from '../../common/controllers/base.controller';
import { ValidationExceptionFilter } from '../../common/filters/validation-exception.filter';
import { EmailService } from '../email/email.service';
import { EmailConfig } from '../email/enums/email.enum';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { GoogleLoginDto } from './dto/google-login.dto';

@Controller('auth')
export class AuthController extends BaseController {
  constructor(
    private readonly authService: AuthService,
    private readonly emailService: EmailService,
  ) {
    super();
  }

  @Post('login')
  @UseFilters(ValidationExceptionFilter)
  async login(@Body() loginDto: LoginDto, @Res() res) {
    const authData: LoginResponse = await this.authService.login(
      loginDto.email,
      loginDto.password,
    );
    //send login alert email
    await this.emailService.sendEmail({
      key: EmailConfig.SEND_LOGIN_ALERT_EMAIL.toString(),
      to: authData.email,
      subject: 'Login Alert',
      options: {
        name: authData.name,
        loginAt: new Date(),
      },
    });
    return this.sendSuccessResponse(
      authData,
      'Logged in successfully',
      HttpStatus.OK,
      res,
    );
  }

  @Get('google')
  @UseGuards(AuthGuard('google'))
  async googleAuth() {
    // This will redirect to Google login page
  }

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  async googleAuthCallback(@Req() req, @Res() res) {
    const authData: LoginResponse = await this.authService.googleLogin(
      req.user,
    );

    // Send login alert email
    await this.emailService.sendEmail({
      key: EmailConfig.SEND_LOGIN_ALERT_EMAIL.toString(),
      to: authData.email,
      subject: 'Login Alert',
      options: {
        name: authData.name,
        loginAt: new Date(),
      },
    });

    return this.sendSuccessResponse(
      authData,
      'Logged in successfully with Google',
      HttpStatus.OK,
      res,
    );
  }

  @Post('google/login')
  async googleFrontendLogin(
    @Body() googleLoginDto: GoogleLoginDto,
    @Res() res,
  ) {
    const authData: LoginResponse =
      await this.authService.googleLoginByToken(googleLoginDto);

    // Send login alert email
    await this.emailService.sendEmail({
      key: EmailConfig.SEND_LOGIN_ALERT_EMAIL.toString(),
      to: authData.email,
      subject: 'Login Alert',
      options: {
        name: authData.name,
        loginAt: new Date(),
      },
    });

    return this.sendSuccessResponse(
      authData,
      'Logged in successfully with Google',
      HttpStatus.OK,
      res,
    );
  }
}
