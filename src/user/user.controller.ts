import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  Res,
  UseFilters,
} from '@nestjs/common';
import { Response } from 'express';
import { BaseController } from 'src/common/controllers/base.controller';
import { ValidationExceptionFilter } from '../filters/validation-exception.filter';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserService } from './user.service';

@Controller('user')
export class UserController extends BaseController {
  constructor(private readonly userService: UserService) {
    super();
  }

  @Post()
  @UseFilters(ValidationExceptionFilter)
  async create(@Body() createUserDto: CreateUserDto, @Res() res: Response) {
    const user = await this.userService.create(createUserDto);
    return this.sendSuccessResponse(
      user,
      'User created successfully',
      201,
      res,
    );
  }

  @Get()
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
      200,
      res,
    );
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @Res() res: Response) {
    const user = await this.userService.findOne(+id);
    return this.sendSuccessResponse(
      user,
      'User fetched successfully',
      200,
      res,
    );
  }

  @Patch(':id')
  @UseFilters(ValidationExceptionFilter)
  async update(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
    @Res() res: Response,
  ) {
    const user = await this.userService.update(+id, updateUserDto);
    return this.sendSuccessResponse(
      user,
      'User updated successfully',
      200,
      res,
    );
  }

  @Delete(':id')
  async remove(@Param('id') id: string, @Res() res: Response) {
    const isDeleted = await this.userService.remove(+id);
    if (!isDeleted) {
      return this.sendErrorResponse('unable to delete user', [], 500, res);
    }
    return this.sendSuccessResponse(
      null,
      'User deleted successfully',
      204,
      res,
    );
  }
}
