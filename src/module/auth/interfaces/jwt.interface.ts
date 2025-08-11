import { UserRoles } from '../../../common/enums/user.enum';

// JWT Payload interface for type safety
/*
* `userId` - Unique identifier for the user
* `username` - Username of the user
* `role` - Role of the user
* `iat` - Issued at timestamp (optional)
* `exp` - Expiration timestamp (optional)
*/
export interface JwtPayload {
    userId: number;
    username: string;
    role: UserRoles;
    iat?: number;
    exp?: number;
}
