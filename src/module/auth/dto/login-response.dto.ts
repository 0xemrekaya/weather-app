import { ApiProperty } from "@nestjs/swagger";
import { UserResponseData } from "../../../common/dto/user-response.dto";

// Login response DTO
/*
* @example
* {
*   "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
*   "user": {
*     "id": 1,
*     "username": "johndoe",
*     "email": "johndoe@example.com",
*     "role": "user",
*     "createdAt": "2025-01-01T00:00:00.000Z",
*     "updatedAt": "2025-01-01T00:00:00.000Z"
*   }
* }
*/
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