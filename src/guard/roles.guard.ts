import {CanActivate, ExecutionContext, Injectable, Logger} from '@nestjs/common';
import {Observable} from 'rxjs';
import {Reflector} from "@nestjs/core";

/**
 * A guard will check for the user roles
 */
@Injectable()
export class RolesGuard implements CanActivate {
    private readonly logger = new Logger(RolesGuard.name);

    constructor(private readonly reflector: Reflector) {

    }

    canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
        const roles = this.reflector.getAllAndMerge<string[]>('Roles', [
            context.getHandler(),
            context.getClass(),
        ]);

        if (!roles || roles.length == 0) {
            return true;
        }

        const request = context.switchToHttp().getRequest();
        const userRole: string = request?.currentUser?.role ?? null;
        return (userRole && roles.includes(userRole))
    }
}
