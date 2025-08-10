import { UserRoles } from 'src/common/enums/user.enum';

// JWT Payload interface for type safety
export interface JwtPayload {
    userId: number;
    username: string;
    role: UserRoles;
    iat?: number;
    exp?: number;
}
