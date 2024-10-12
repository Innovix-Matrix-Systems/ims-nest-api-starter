import {
  Controller,
  Post,
  Request,
  Res,
  UseFilters,
  UseGuards,
} from '@nestjs/common';
import { BaseController } from '../common/controllers/base.controller';
import { ValidationExceptionFilter } from '../filters/validation-exception.filter';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './guards/local-auth.guard';

@Controller('auth')
export class AuthController extends BaseController {
  constructor(private readonly authService: AuthService) {
    super();
  }

  @UseGuards(LocalAuthGuard)
  @UseFilters(ValidationExceptionFilter)
  @Post('login')
  async login(@Request() req, @Res() res) {
    const authData: LoginResponse = await this.authService.login(req.user);
    return this.sendSuccessResponse(
      authData,
      'Logged in successfully',
      200,
      res,
    );
  }
}
