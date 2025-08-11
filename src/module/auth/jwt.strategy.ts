import { PassportStrategy } from "@nestjs/passport";
import { AuthService } from "./auth.service";
import { ExtractJwt, Strategy } from "passport-jwt";
import { Injectable } from "@nestjs/common";

import { JwtPayload } from "./interfaces/jwt.interface";
import { UserRoles } from "src/common/enums/user.enum";
import { JwtConfig } from "../config/jwt.config";

// User interface for validated user
interface ValidatedUser {
    id: number;
    username: string;
    role: UserRoles;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(private readonly jwtConfig: JwtConfig) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: jwtConfig.secret,
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