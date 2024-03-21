import { Module } from '@nestjs/common';
import { NotificationController } from "./controller/notification.controller";
import { NotificationService } from "./service/notification.service";

@Module({
  imports: [],
  providers: [NotificationService],
  controllers: [NotificationController],
  exports: [NotificationService]
})

export class NotificationModule {}