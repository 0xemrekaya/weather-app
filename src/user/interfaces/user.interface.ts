import { ApiProperty } from "@nestjs/swagger";
import { UserRoles } from "src/common/enums/user.enum";
import { UserResponseData } from "src/common/interfaces/user.interface";


// Create user input interface
export interface CreateUserInput {
    email: string;
    username: string;
    password: string;
    role: UserRoles; // Using UserRoles for input
}

// User select fields for queries
export interface UserSelectFields {
    id: boolean;
    username: boolean;
    email: boolean;
    password?: boolean;
    role: boolean;
    createdAt: boolean;
    updatedAt: boolean;
}

export class RegisterResponse {
    @ApiProperty({
        description: 'User information',
        type: () => UserResponseData
    })
    user: UserResponseData;
}
