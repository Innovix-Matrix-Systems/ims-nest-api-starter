import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Param,
  Post,
  Res,
  UseGuards,
} from '@nestjs/common';
import { Response } from 'express';
import { BaseController } from '../../common/controllers/base.controller';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { PermissionGuard } from '../../common/guards/permission.guard';
import { Permissions } from '../../common/decorators/permissions.decorator';
import { CreateRoleDto } from './dto/role-create.dto';
import { RoleService } from './role.service';
import { PermissionName } from '../../enums/permission.enum';

@Controller('role')
export class RoleController extends BaseController {
  constructor(private readonly roleService: RoleService) {
    super();
  }

  @Get()
  @UseGuards(JwtAuthGuard, PermissionGuard)
  @Permissions(PermissionName.ROLE_VIEW_ALL)
  async findAll(@Res() res: Response) {
    const roles = await this.roleService.findAll();
    return this.sendSuccessResponse(
      roles,
      'Roles fetched successfully',
      HttpStatus.OK,
      res,
    );
  }

  @Post()
  @UseGuards(JwtAuthGuard, PermissionGuard)
  @Permissions(PermissionName.ROLE_CREATE)
  async createRole(@Body() createRoleDto: CreateRoleDto, @Res() res: Response) {
    const role = await this.roleService.create(createRoleDto);
    return this.sendSuccessResponse(
      role,
      'Role created successfully',
      HttpStatus.CREATED,
      res,
    );
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, PermissionGuard)
  @Permissions(PermissionName.ROLE_DELETE)
  async deleteRole(@Param('id') id: string, @Res() res: Response) {
    await this.roleService.delete(+id);
    return this.sendSuccessResponse(
      null,
      'Role deleted successfully',
      HttpStatus.NO_CONTENT,
      res,
    );
  }
}
