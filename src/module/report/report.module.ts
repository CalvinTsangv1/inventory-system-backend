import {Module} from '@nestjs/common';
import {ReportService} from "./service/report.service";
import {ProductModule} from "../product/product.module";
import {OrderModule} from "../order/order.module";
import {ReportController} from "./controller/report.controller";

@Module({
  imports: [ProductModule, OrderModule],
  providers: [ReportService],
  controllers: [ReportController],
  exports: [ReportService]
})

export class ReportModule {}
