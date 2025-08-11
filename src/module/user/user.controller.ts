import { Controller, Get, Post, Body, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { UserService } from './user.service';
import { JwtGuard } from '../../common/guards/jwt.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRoles } from '../../common/enums/user.enum';
import { CreateUserRequest } from './dto/create-user-request.dto';
import { ApiGetUserAllSwagger, ApiCreateUserSwagger } from './decorators/swagger.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';
import { CreateUserResponse } from './dto/create-user-response.dto';
import { GetAllUserResponse } from './dto/get-all-user-response.dto';

@ApiTags('Users')
@Controller('users')
@ApiBearerAuth()
export class UserController {
    constructor(private readonly userService: UserService) { }

    @Get()
    @UseGuards(JwtGuard, RolesGuard)
    @Roles(UserRoles.admin)
    @ApiGetUserAllSwagger() // Swagger documentation for getting all users
    @HttpCode(HttpStatus.OK)
    async getAllUsers(): Promise<GetAllUserResponse[]> {
        const users = await this.userService.getAllUsers();
        return users;
    }

    @Post()
    @UseGuards(JwtGuard, RolesGuard)
    @Roles(UserRoles.admin)
    @ApiCreateUserSwagger() // Swagger documentation for creating a user
    @HttpCode(HttpStatus.CREATED)
    async createUser(@Body() createUserDto: CreateUserRequest): Promise<CreateUserResponse> {
        const result = await this.userService.createUser(createUserDto);
        return result;
    }

}
