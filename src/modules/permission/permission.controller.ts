import { Controller, Get, HttpStatus, Res, UseGuards } from '@nestjs/common';
import { Response } from 'express';
import { BaseController } from '../../common/controllers/base.controller';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { PermissionService } from './permission.service';

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
      HttpStatus.OK,
      res,
    );
  }
}
