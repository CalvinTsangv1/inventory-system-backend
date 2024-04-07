import {forwardRef, Module} from '@nestjs/common';
import { ProductService } from "./service/product.service";
import { ProductController } from "./controller/product.controller";
import {EventEmitterModule} from "@nestjs/event-emitter";
import {ProductEventListener} from "./listener/product-event.listener";


@Module({
  imports: [EventEmitterModule.forRoot()],
  providers: [ProductService, ProductEventListener],
  controllers: [ProductController],
  exports: [ProductService]
})

export class ProductModule {}
