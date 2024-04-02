import {Module} from '@nestjs/common';
import {ReportService} from "./service/report.service";
import {ProductModule} from "../product/product.module";
import {OrderModule} from "../order/order.module";

@Module({
  imports: [ProductModule, OrderModule],
  providers: [ReportService],
  controllers: [],
  exports: [ReportService]
})

export class ReportModule {}
