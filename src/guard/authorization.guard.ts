import {CanActivate, ExecutionContext, Injectable, Logger} from "@nestjs/common";
import {Reflector} from "@nestjs/core";
import {JwtService} from "@nestjs/jwt";
import {Observable} from "rxjs";
import {PermissionModel} from "../model/permission.model";
import {JwtModel} from "../model/jwt.model";
import {isJWT} from "class-validator";
import * as console from "console";

@Injectable()
export class AuthorizationGuard implements CanActivate {

    constructor(private readonly reflector: Reflector, private readonly jwtService: JwtService) {

    }

    canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
        const isPublicController = this.reflector.get<boolean>('isPublic', context.getClass());
        const isPublicMethod = this.reflector.get<boolean>('isPublic', context.getHandler());
        if (isPublicController || isPublicMethod) {
            return true;
        }

        const request = context.switchToHttp().getRequest();

        //const allowUnauthorizedRequest = this.reflector.get<boolean>('allowUnauthorizedRequest', context.getHandler());

        //if (allowUnauthorizedRequest) {
            return true;
        //}
        if (request && request.headers && request.headers.authorization && request.headers.authorization.startsWith("Bearer ")) {
            const jwt = request.headers.authorization.replace('Bearer ', '')
            if (isJWT(jwt)) {
                request.currentUser = <JwtModel>this.jwtService.decode(jwt);
                //request.currentUser.permissions = <Array<PermissionModel>>this.parsePermissions(request.currentUser.permissions) || [];
                return true;
            }
        }
        return false;
    }

    parsePermissions(permissions: string[]): Array<PermissionModel> {
        if (!permissions) {
            return [];
        } else {
            const parsed = new Array<PermissionModel>();
            Object.keys(permissions).forEach((key) => {
                const p = key.toLowerCase().split("_");
                parsed.push({
                    action: p[0],
                    possession: p[1],
                    resource: p[2],
                    attributes: permissions[key]
                })
            });
            return parsed;
        }
    }

}
