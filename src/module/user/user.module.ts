import {createParamDecorator, forwardRef, Global, Module} from '@nestjs/common';
import { UserService } from "./service/user.service";
import { UserController } from "./controller/user.controller";

@Global()
@Module({
  imports: [],
  providers: [UserService],
  controllers: [UserController],
  exports: [UserService]
})

export class UserModule {}
