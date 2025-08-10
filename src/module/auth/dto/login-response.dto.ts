import { ApiProperty } from "@nestjs/swagger";
import { UserResponseData } from "src/common/dto/user-response.dto";

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