import {Controller, Get, Query, SetMetadata} from "@nestjs/common";
import {ApiBearerAuth, ApiOperation, ApiTags} from "@nestjs/swagger";
import { NotificationService } from "../service/notification.service";
import { SendMessageRequestDto } from "../dto/request/send-message.request.dto";

const AllowUnauthorizedRequest = () => SetMetadata('allowUnauthorizedRequest', true);
const isPublic = () => SetMetadata('isPublic', true);
@Controller("notifications")
@ApiTags("notifications")
export class NotificationController {

    constructor(private notificationService: NotificationService) {
    }

    @AllowUnauthorizedRequest()
    @Get("message/test")
    @ApiOperation({summary: "Test message"})
    public async sendMessage(@Query() dto: SendMessageRequestDto) {
        return await this.notificationService.sendMessage(dto);
    }

    @AllowUnauthorizedRequest()
    @Get("cronjob/send-message")
    @ApiOperation({summary: "process scheduled notification message"})
    public async processScheduledNotifications() {
        return await this.notificationService.processScheduledNotifications();
    }
}