import {
  Body,
  Controller,
  HttpStatus,
  Post,
  Res,
  UseFilters,
} from '@nestjs/common';
import { BaseController } from '../../common/controllers/base.controller';
import { ValidationExceptionFilter } from '../../common/filters/validation-exception.filter';
import { EmailService } from '../email/email.service';
import { EmailConfig } from '../email/enums/email.enum';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';

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
}
