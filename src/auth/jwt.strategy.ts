import { PassportStrategy } from "@nestjs/passport";
import { AuthService } from "./auth.service";
import { ExtractJwt, Strategy } from "passport-jwt";
import { Injectable, UnauthorizedException } from "@nestjs/common";
import { UserRoles } from "./enums/role.enum";
import { JwtPayload } from "./interfaces/auth.interface";

// User interface for validated user
interface ValidatedUser {
    id: number;
    username: string;
    role: UserRoles;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor() {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: process.env.JWT_SECRET || 'your-secret-key',
        });
    }

    /**
     * Validate JWT payload and return user data for request context
     * This enables role-based access control in guards and controllers
     * Returns: ValidatedUser object (id, username, role)
     */
    async validate(payload: JwtPayload): Promise<ValidatedUser> {
        const { userId, username, role } = payload;
        // Return ValidatedUser object (id, username, role)
        return {
            id: userId,
            username: username,
            role: role,
        };
    }
}