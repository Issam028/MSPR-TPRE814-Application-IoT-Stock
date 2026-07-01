import { CanActivate, ExecutionContext, Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from './roles.decorator';

const normalizeRole = (role: string | string[] | undefined): string => {
  if (Array.isArray(role)) return role[0] ?? '';
  return role ?? '';
};

@Injectable()
export class ApiKeyRoleGuard implements CanActivate {
  private readonly logger = new Logger(ApiKeyRoleGuard.name);

  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    const expectedApiKey = process.env.ERP_API_KEY || 'futurekawa-demo-key';
    const apiKey = request.headers['x-api-key'];
    const role = normalizeRole(request.headers['x-user-role']);

    if (apiKey !== expectedApiKey) {
      this.logger.warn(`ERP access denied from ${request.ip}: invalid API key`);
      throw new UnauthorizedException('Invalid API key');
    }

    if (requiredRoles?.length && !requiredRoles.includes(role)) {
      this.logger.warn(`ERP access denied from ${request.ip}: invalid role ${role || '(empty)'}`);
      throw new UnauthorizedException('Invalid role');
    }

    this.logger.log(`ERP access granted: ${request.method} ${request.url} role=${role}`);
    return true;
  }
}
