import { Module } from '@nestjs/common';
import { NotificationController } from "./controller/notification.controller";
import { NotificationService } from "./service/notification.service";
import {ReportModule} from "../report/report.module";
import {ProductModule} from "../product/product.module";

@Module({
  imports: [ReportModule, ProductModule],
  providers: [NotificationService],
  controllers: [NotificationController],
  exports: [NotificationService]
})

export class NotificationModule {}