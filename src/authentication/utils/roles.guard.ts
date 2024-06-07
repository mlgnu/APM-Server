import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

@Injectable()
export class RolesGuards implements CanActivate {
  constructor(private reflector: Reflector) {}
  canActivate(context: ExecutionContext): boolean {
    const roles = this.reflector.get<string[]>('roles', context.getHandler());
    console.log(roles);

    const request = context.switchToHttp().getRequest();
    console.log(request['user'], 'JWTGuard roles');
    const role = request['user']['role'];
    return roles.includes(this.mapRoles(role));
  }

  mapRoles(role: number) {
    const roleMapping = {
      0: 'student',
      1: 'advisor',
      2: 'coordinator',
      3: 'supervisor',
    };

    return roleMapping[role];
  }
}
