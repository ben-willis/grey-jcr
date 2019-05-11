import { CanActivate, ExecutionContext, UnauthorizedException, ForbiddenException, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

@Injectable()
export class UserGuard implements CanActivate {
    constructor(private readonly reflector: Reflector) {};

    canActivate(context: ExecutionContext): boolean | Promise<boolean> {
        const httpContext = context.switchToHttp();
        const request = httpContext.getRequest();
        const requiredLevel = this.reflector.get<number>('requiredLevel', context.getHandler());

        if (!requiredLevel) {
            return true;
        } else if (!request.user) {
            throw new UnauthorizedException();
        } else if (request.user.level < requiredLevel) {
            throw new ForbiddenException();
        } else {
            return true;
        };
    }
}