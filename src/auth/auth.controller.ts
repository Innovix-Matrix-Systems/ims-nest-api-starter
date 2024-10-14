import { Body, Controller, Post, Res, UseFilters } from '@nestjs/common';
import { BaseController } from '../common/controllers/base.controller';
import { ValidationExceptionFilter } from '../filters/validation-exception.filter';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';

@Controller('auth')
export class AuthController extends BaseController {
  constructor(private readonly authService: AuthService) {
    super();
  }

  @Post('login')
  @UseFilters(ValidationExceptionFilter)
  async login(@Body() loginDto: LoginDto, @Res() res) {
    const authData: LoginResponse = await this.authService.login(
      loginDto.email,
      loginDto.password,
    );
    return this.sendSuccessResponse(
      authData,
      'Logged in successfully',
      200,
      res,
    );
  }
}
