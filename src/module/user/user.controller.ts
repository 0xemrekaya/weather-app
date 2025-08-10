import { Controller, Get, Post, Body, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { UserService } from './user.service';
import { JwtGuard } from '../auth/guard/jwt.guard';
import { RolesGuard } from '../auth/guard/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRoles } from 'src/common/enums/user.enum';
import { CreateUserDto } from './dto/create-user.dto';
import { ApiGetUserAllSwagger, ApiRegisterSwagger } from './decorators/swagger.decorator';
import { UserResponseData } from 'src/common/dto/user-response.dto';

@ApiTags('Users')
@Controller('users')
@ApiBearerAuth()
export class UserController {
    constructor(private readonly userService: UserService) { }

    @Get()
    @UseGuards(JwtGuard, RolesGuard)
    @Roles(UserRoles.admin)
    @ApiGetUserAllSwagger()
    @HttpCode(HttpStatus.OK)
    async getAllUsers(): Promise<UserResponseData[]> {
        return await this.userService.getAllUsers();
    }

    @Post('create-user')
    @UseGuards(JwtGuard, RolesGuard)
    @Roles(UserRoles.admin)
    @ApiRegisterSwagger()
    @HttpCode(HttpStatus.CREATED)
    async createUser(@Body() createUserDto: CreateUserDto): Promise<UserResponseData> {
        return await this.userService.createUser(createUserDto);
    }

}
