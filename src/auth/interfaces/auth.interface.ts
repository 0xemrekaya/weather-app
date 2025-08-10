import { ApiProperty } from '@nestjs/swagger';
import { UserResponseData } from '../../common/interfaces/user.interface';
import { UserRoles } from 'src/common/enums/user.enum';

export class LoginResponse {
    @ApiProperty({ 
        description: 'JWT access token',
        example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
    })
    token: string;

    @ApiProperty({ 
        description: 'User information',
        type: () => UserResponseData
    })
    user: UserResponseData;
}

// JWT Payload interface for type safety
export interface JwtPayload {
    userId: number;
    username: string;
    role: UserRoles;
    iat?: number;
    exp?: number;
}
