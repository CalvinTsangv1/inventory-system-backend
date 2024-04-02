import {Body, Controller, Get, Post, Query, SetMetadata} from "@nestjs/common";
import {ApiBearerAuth, ApiOperation, ApiTags} from "@nestjs/swagger";
import { NotificationService } from "../service/notification.service";
import { SendMessageRequestDto } from "../dto/request/send-message.request.dto";
import {TwilioIncomingMessageRequestDto} from "../dto/request/twilio-incoming-message.request.dto";

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
    @Post("cronjob/send-message")
    @ApiOperation({summary: "process scheduled notification message"})
    public async processScheduledNotifications() {
        console.log(`processScheduledNotifications`)
        return await this.notificationService.processScheduledNotifications();
    }

    @AllowUnauthorizedRequest()
    @Post("/incoming-message")
    @ApiOperation({summary: "process scheduled notification message"})
    public async processIncomingMessage(@Body() dto: TwilioIncomingMessageRequestDto) {
        return await this.notificationService.processIncomingMessage(dto);
    }
}