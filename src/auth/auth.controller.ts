import {
  Controller,
  Post,
  Request,
  UseFilters,
  UseGuards,
} from '@nestjs/common';
import { ValidationExceptionFilter } from '../filters/validation-exception.filter';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './guards/local-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @UseGuards(LocalAuthGuard)
  @UseFilters(ValidationExceptionFilter)
  @Post('login')
  async login(@Request() req) {
    console.log('request', req.user);
    return this.authService.login(req.user);
  }
}
