import { Module } from '@nestjs/common';
import { NotificationController } from "./controller/notification.controller";
import { NotificationService } from "./service/notification.service";
import {ReportModule} from "../report/report.module";

@Module({
  imports: [ReportModule],
  providers: [NotificationService],
  controllers: [NotificationController],
  exports: [NotificationService]
})

export class NotificationModule {}