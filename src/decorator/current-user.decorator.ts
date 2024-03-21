import {createParamDecorator, ExecutionContext} from '@nestjs/common';
import {UserService} from "../module/user/service/user.service";

/**
 * A param decorator building @CurrentUser annotation according to request.currentUser
 */
export const CurrentUser = createParamDecorator(
    (data: unknown, context: ExecutionContext) => {
        const request = context.switchToHttp().getRequest();

      try {
        return request.currentUser;
      } catch (e) {
        return {};
      }
    }
);
