import {Global, Module} from "@nestjs/common";
import {OrderService} from "./service/order.service";
import {OrderController} from "./controller/order.controller";
import {ProductModule} from "../product/product.module";
import {EventEmitterModule} from "@nestjs/event-emitter";

@Global()
@Module({
  imports: [ProductModule],
  providers: [OrderService],
  controllers: [OrderController],
  exports: [OrderService]
})

export class OrderModule {}
