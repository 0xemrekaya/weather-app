import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserRoles } from '../../common/enums/user.enum';
import { ROLES_KEY } from '../decorators/roles.decorator';

// Roles Guard
// Protects routes by user roles
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) { }

  canActivate(context: ExecutionContext): boolean {
    // Get required roles from @Roles decorator
    const requiredRoles = this.reflector.getAllAndOverride<UserRoles[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    // If no roles specified, allow access
    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    // User should be attached by JwtGuard
    if (!user) {
      throw new ForbiddenException('Authentication required.');
    }

    // Check if user's role matches any of the required roles
    const hasValidRole = requiredRoles.includes(user.role);

    // Check if user has a valid role
    if (!hasValidRole) {
      // User does not have permission
      throw new ForbiddenException(
        `Access denied.`
      );
    }
    // If user has a valid role, grant access
    return true;
  }
}
