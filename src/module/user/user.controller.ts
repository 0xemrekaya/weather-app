import { Controller, Get, Post, Body, UseGuards, HttpCode, HttpStatus, Logger } from '@nestjs/common';
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
    private readonly logger = new Logger(UserController.name);
    
    constructor(private readonly userService: UserService) {}

    @Get()
    @UseGuards(JwtGuard, RolesGuard)
    @Roles(UserRoles.admin)
    @ApiGetUserAllSwagger()
    @HttpCode(HttpStatus.OK)
    async getAllUsers(): Promise<GetAllUserResponse[]> {
        this.logger.log('Admin request to get all users');
        const users = await this.userService.getAllUsers();
        this.logger.log(`Returned ${users.length} users to admin`);
        return users;
    }

    @Post('create-user')
    @UseGuards(JwtGuard, RolesGuard)
    @Roles(UserRoles.admin)
    @ApiCreateUserSwagger()
    @HttpCode(HttpStatus.CREATED)
    async createUser(@Body() createUserDto: CreateUserRequest): Promise<CreateUserResponse> {
        this.logger.log(`Admin request to create user: ${createUserDto.username}`);
        const result = await this.userService.createUser(createUserDto);
        this.logger.log(`User creation completed: ${createUserDto.username}`);
        return result;
    }

}
