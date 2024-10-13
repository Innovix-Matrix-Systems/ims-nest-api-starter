import { Controller, Get, Res, UseGuards } from '@nestjs/common';
import { Response } from 'express';
import { BaseController } from '../common/controllers/base.controller';
import { PermissionService } from './permission.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@Controller('permission')
export class PermissionController extends BaseController {
  constructor(private readonly permissionService: PermissionService) {
    super();
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  async findAll(@Res() res: Response) {
    const permissions = await this.permissionService.findAll();
    return this.sendSuccessResponse(
      permissions,
      'Permissions fetched successfully',
      200,
      res,
    );
  }
}
