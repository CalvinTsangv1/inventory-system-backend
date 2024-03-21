import {Global, Module} from "@nestjs/common";
import {OrderService} from "./service/order.service";
import {OrderController} from "./controller/order.controller";

@Global()
@Module({
  imports: [],
  providers: [OrderService],
  controllers: [OrderController],
  exports: [OrderService]
})

export class OrderModule {}
