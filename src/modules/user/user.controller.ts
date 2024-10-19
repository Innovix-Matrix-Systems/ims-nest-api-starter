import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  Res,
  UseFilters,
  UseGuards,
} from '@nestjs/common';
import { Response } from 'express';
import { BaseController } from '../../common/controllers/base.controller';
import { AuthUser } from '../../common/decorators/auth-user.decorator';
import { Permissions } from '../../common/decorators/permissions.decorator';
import { ValidationExceptionFilter } from '../../common/filters/validation-exception.filter';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { PermissionGuard } from '../../common/guards/permission.guard';
import { PermissionName } from '../../enums/permission.enum';
import { ChangePasswordDto } from './dto/change-password.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { PermissionAssignDto } from './dto/permission-assign.dto';
import { ProfileUpdateDto } from './dto/profile-update.dto';
import { ChangeSelfPasswordDto } from './dto/reset-self-password.dto';
import { RoleAssignDto } from './dto/role-assign.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserService } from './user.service';

@Controller('user')
export class UserController extends BaseController {
  constructor(private readonly userService: UserService) {
    super();
  }

  @Post()
  @UseGuards(JwtAuthGuard, PermissionGuard)
  @Permissions(PermissionName.USER_CREATE)
  @UseFilters(ValidationExceptionFilter)
  async create(@Body() createUserDto: CreateUserDto, @Res() res: Response) {
    const user = await this.userService.create(createUserDto);
    return this.sendSuccessResponse(
      user,
      'User created successfully',
      HttpStatus.CREATED,
      res,
    );
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  async getProfile(@AuthUser() LoggedInUser, @Res() res: Response) {
    const id = LoggedInUser.userId;
    const user = await this.userService.findOne(+id);
    return this.sendSuccessResponse(
      user,
      'Profile fetched successfully',
      HttpStatus.OK,
      res,
    );
  }

  @Patch('profile')
  @UseGuards(JwtAuthGuard)
  @UseFilters(ValidationExceptionFilter)
  @Permissions(PermissionName.USER_UPDATE)
  async updateProfile(
    @AuthUser() LoggedInUser,
    @Body() profileUpdateDto: ProfileUpdateDto,
    @Res() res: Response,
  ) {
    const id = LoggedInUser.userId;
    const user = await this.userService.updateProfile(+id, profileUpdateDto);
    return this.sendSuccessResponse(
      user,
      'profile updated successfully',
      HttpStatus.OK,
      res,
    );
  }

  @Patch('/change-password')
  @UseGuards(JwtAuthGuard)
  @UseFilters(ValidationExceptionFilter)
  async changeSelfPassword(
    @AuthUser() LoggedInUser,
    @Body() changePasswordDto: ChangeSelfPasswordDto,
    @Res() res: Response,
  ) {
    const id = LoggedInUser.userId;
    const user = await this.userService.changeSelfPassword(
      +id,
      changePasswordDto,
    );
    return this.sendSuccessResponse(
      user,
      'Password updated successfully',
      HttpStatus.OK,
      res,
    );
  }

  @Get('/permissions')
  @UseGuards(JwtAuthGuard)
  async getPermissions(@AuthUser() LoggedInUser, @Res() res: Response) {
    const id = LoggedInUser.userId;
    const permissions = await this.userService.getUserPermissions(+id);
    return this.sendSuccessResponse(
      permissions,
      'Permissions fetched successfully',
      HttpStatus.OK,
      res,
    );
  }

  @Get()
  @UseGuards(JwtAuthGuard, PermissionGuard)
  @Permissions(PermissionName.USER_VIEW_ALL)
  async findAll(
    @Query('page', ParseIntPipe) page: number = 1,
    @Query('perPage', ParseIntPipe) perPage: number = 10,
    @Query('search') search: string = '',
    @Query('isActive') isActive: boolean,
    @Res() res: Response,
  ) {
    const searchFields = ['name', 'email'];
    const selectFields = [];
    if (isActive !== undefined) {
      selectFields.push({ isActive: isActive });
    }
    const params: PaginatedParams = {
      page,
      perPage,
      search,
      searchFields,
      selectFields,
    };
    const users = await this.userService.findAll(params);
    return this.sendPaginatedResponse(
      users.data,
      users.meta,
      'Users fetched successfully',
      HttpStatus.OK,
      res,
    );
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, PermissionGuard)
  @Permissions(PermissionName.USER_VIEW)
  async findOne(@Param('id') id: string, @Res() res: Response) {
    const user = await this.userService.findOne(+id);
    if (!user) {
      return this.sendErrorResponse('user not found', [], 404, res);
    }
    return this.sendSuccessResponse(
      user,
      'User fetched successfully',
      HttpStatus.OK,
      res,
    );
  }

  @Patch(':id/change-password')
  @UseGuards(JwtAuthGuard, PermissionGuard)
  @Permissions(PermissionName.USER_UPDATE)
  @UseFilters(ValidationExceptionFilter)
  async changePassword(
    @Param('id', ParseIntPipe) id: number,
    @Body() changePasswordDto: ChangePasswordDto,
    @Res() res: Response,
  ) {
    const user = await this.userService.changePassword(+id, changePasswordDto);
    return this.sendSuccessResponse(
      user,
      'Password updated successfully',
      HttpStatus.OK,
      res,
    );
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, PermissionGuard)
  @UseFilters(ValidationExceptionFilter)
  @Permissions(PermissionName.USER_UPDATE)
  async update(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
    @Res() res: Response,
  ) {
    const user = await this.userService.update(+id, updateUserDto);
    return this.sendSuccessResponse(
      user,
      'User updated successfully',
      HttpStatus.OK,
      res,
    );
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, PermissionGuard)
  @Permissions(PermissionName.USER_DELETE)
  async remove(@Param('id') id: string, @Res() res: Response) {
    const isDeleted = await this.userService.remove(+id);
    if (!isDeleted) {
      return this.sendErrorResponse('unable to delete user', [], 500, res);
    }
    return this.sendSuccessResponse(
      null,
      'User deleted successfully',
      HttpStatus.NO_CONTENT,
      res,
    );
  }

  @Post(':id/roles')
  @UseGuards(JwtAuthGuard, PermissionGuard)
  @Permissions(PermissionName.USER_ACL)
  @UseFilters(ValidationExceptionFilter)
  async assignRoles(
    @Param('id') userId: number,
    @Body() roleAssignDto: RoleAssignDto,
    @Res() res: Response,
  ) {
    const user = await this.userService.assignRoles(
      userId,
      roleAssignDto.roles,
    );
    return this.sendSuccessResponse(
      user,
      'Roles assigned successfully',
      HttpStatus.OK,
      res,
    );
  }

  @Post(':id/permissions')
  @UseGuards(JwtAuthGuard, PermissionGuard)
  @Permissions(PermissionName.USER_ACL)
  @UseFilters(ValidationExceptionFilter)
  async assignPermissions(
    @Param('id') userId: number,
    @Body() permissionAssignDto: PermissionAssignDto,
    @Res() res: Response,
  ) {
    const user = await this.userService.assignPermissions(
      userId,
      permissionAssignDto.permissions,
    );
    return this.sendSuccessResponse(
      user,
      'Permissions assigned successfully',
      HttpStatus.OK,
      res,
    );
  }
}
