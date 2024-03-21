import {forwardRef, Module} from '@nestjs/common';
import { ProductService } from "./service/product.service";
import { ProductController } from "./controller/product.controller";


@Module({
  imports: [],
  providers: [ProductService],
  controllers: [ProductController],
  exports: [ProductService]
})

export class ProductModule {}
