import { SetMetadata } from "@nestjs/common";
import { UserRoles } from "../../common/enums/user.enum";

// Roles decorator
export const ROLES_KEY = 'roles';
export const Roles = (...roles: UserRoles[]) => SetMetadata(ROLES_KEY, roles);