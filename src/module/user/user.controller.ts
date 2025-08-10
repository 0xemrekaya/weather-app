import { Controller, Get, Post, Body, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { UserService } from './user.service';
import { JwtGuard } from '../../common/guards/jwt.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRoles } from 'src/common/enums/user.enum';
import { CreateUserDto } from './dto/create-user.dto';
import { ApiGetUserAllSwagger, ApiRegisterSwagger } from './decorators/swagger.decorator';
import { UserResponseData } from 'src/common/dto/user-response.dto';
import { RolesGuard } from 'src/common/guards/roles.guard';

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
