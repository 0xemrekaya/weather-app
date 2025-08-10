import { Controller, Get, Post, Body, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { UserService } from './user.service';
import { JwtGuard } from '../../common/guards/jwt.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRoles } from 'src/common/enums/user.enum';
import { CreateUserRequest } from './dto/create-user-request.dto';
import { ApiGetUserAllSwagger, ApiCreateUserSwagger } from './decorators/swagger.decorator';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { CreateUserResponse } from './dto/create-user-response.dto';
import { GetAllUserResponse } from './dto/get-all-user-response.dto';

@ApiTags('Users')
@Controller('users')
@ApiBearerAuth()
export class UserController {
    constructor(private readonly userService: UserService) {}

    @Get()
    @UseGuards(JwtGuard, RolesGuard)
    @Roles(UserRoles.admin)
    @ApiGetUserAllSwagger()
    @HttpCode(HttpStatus.OK)
    async getAllUsers(): Promise<GetAllUserResponse[]> {
        return await this.userService.getAllUsers();
    }

    @Post('create-user')
    @UseGuards(JwtGuard, RolesGuard)
    @Roles(UserRoles.admin)
    @ApiCreateUserSwagger()
    @HttpCode(HttpStatus.CREATED)
    async createUser(@Body() createUserDto: CreateUserRequest): Promise<CreateUserResponse> {
        return await this.userService.createUser(createUserDto);
    }

}
