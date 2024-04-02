import {Injectable, Logger} from "@nestjs/common";
import {ConfigService} from "@nestjs/config";
import {SendMessageRequestDto} from "../dto/request/send-message.request.dto";
import {MessageType} from "../enum/message-type.enum";
import {Builder} from "builder-pattern";
import {TwilioMessageDto} from "../dto/request/twilio-message.dto";
import {TwilioKeysResponseDto} from "../dto/response/twilio-keys.response.dto";
import {dataSource} from "../../../util/data-source";
import {NotificationEntity} from "../entity/notification.entity";
import {PaginatedResult} from "../../../util/pagination/pagination";
import {PaginationInterface} from "../../../interface/pagination.interface";
import {SortOrderEnum} from "../../../util/pagination/sort-order.enum";
import moment from "moment-timezone";
import {TwilioIncomingMessageRequestDto} from "../dto/request/twilio-incoming-message.request.dto";
import {MessageCommandEnum} from "../enum/message-command.enum";
import {ReportService} from "../../report/service/report.service";
import {CategoryTypeEnum} from "../../product/enum/category-type.enum";

@Injectable()
export class NotificationService {

    private logger = new Logger(NotificationService.name);
    private readonly twilioClient: any;
    private readonly twilioNumber: string;

    constructor(
      private configService: ConfigService,
      private reportService: ReportService
    ) {
        const data: TwilioKeysResponseDto = JSON.parse(this.configService.get<string>("TWILIO_KEY"));
        this.twilioClient = require("twilio")(data.twilio_account_sid, data.twilio_auth_token);
        this.twilioNumber = data.twilio_phone_number;
    }

    public async sendMessage(dto: SendMessageRequestDto) {
        let fromNumber = '+14155238886'//this.twilioNumber;
        let messageBody;
        if(dto?.mediaUrl) {
            messageBody = Builder<TwilioMessageDto>()
              .body(dto.body)
              .from(`whatsapp:${fromNumber}`)
              .to(dto.toNumber)
              .mediaUrl(dto?.mediaUrl)
              .build();
        } else {
            messageBody = Builder<TwilioMessageDto>()
              .body(dto.body)
              .from(`whatsapp:${fromNumber}`)
              .to(dto.toNumber)
              .build();
        }

        this.logger.log(`Sending message ${JSON.stringify(messageBody)}`);
        // TODO: Need to upgrade account to send messages to unverified numbers
        return await this.twilioClient.messages.create(messageBody);
    }

    public async processIncomingMessage(dto: TwilioIncomingMessageRequestDto) {
        this.logger.log(`incoming message: ${dto.Body} from: ${dto.From} to: ${dto.To}`);

        const splitCommand = dto.Body.replace(/\s+/g, '').split(":");

        this.logger.log(`commandType: ${splitCommand}`)
        if(!Object.values(MessageCommandEnum).includes(Number(splitCommand[0]))) {
            this.logger.log(`command is wrong: ${dto.Body}, from: ${dto.From} to: ${dto.To}`);
            await this.sendMessage(Builder<SendMessageRequestDto>()
              .toNumber(dto.From)
              .body("🙇 Invalid command 🙇\nOops! It seems like you entered an invalid command. Let me guide you through the available options:\n\nPlease try again by selecting one of the following commands along with the corresponding value:\n\n👉 0. Category Inventory\n   (Example: 0:FISH)\n   Values: FISH, MOLLUSK, SEAWEED, CRUSTACEAN\n\n👉 1. Product Inventory\n   (Example: 1:PRODUCT_CODE)\n   Value: Enter the product code\n\n👉 2. Daily Inventory\n   (Example: 2)\n\n👉 3. Order\n   (Example: 3:ORDER_CODE)\n   Value: Enter the order code\n\n👉 4. Shipment\n   (Example: 4)\n\n👉 5. Daily Report\n   (Example: 5)\n\n👉 6. Weekly Report\n   (Example: 6)\n\n👉 7. Monthly Report\n   (Example: 7)\n\n👉 8. Yearly Report\n   (Example: 8)\n\n👉 9. Help\n\nPlease enter the command and value in the format shown above to proceed. If you need further assistance, type '9' for help.\n")
              .type(MessageType.WHATSAPP)
              .build());
            return;
        }

        const result = await this.handleIncomingCommand(Number(splitCommand[0]), splitCommand[1] ?? null);

        await this.sendMessage(Builder<SendMessageRequestDto>()
          .toNumber(dto.From)
          .body(result.body)
          .mediaUrl(result?.mediaUrl?[result.mediaUrl]: null)
          .type(MessageType.WHATSAPP)
          .build());
    }

    public async handleIncomingCommand(command: number, value: string) {
        if(command === MessageCommandEnum.CATEGORY_INVENTORY) {
            return {body: await this.reportService.getAvailableCategoryTextReport(value as CategoryTypeEnum), mediaUrl: null}
        } else if(command === MessageCommandEnum.PRODUCT_INVENTORY) {
            return {body: await this.reportService.getAvailableProductTextReport(value)}
        } else if(command === MessageCommandEnum.DAILY_INVENTORY) {
            return {body: await this.reportService.getAvailableDailyTextReport()}
        } else if(command === MessageCommandEnum.ORDER) {
            return {body: await this.reportService.getOrderTextReport(value)}
        } else if(command === MessageCommandEnum.DAILY_REPORT) {
            const result = await this.reportService.getAvailableDailyReport()
            return {body: result.body, mediaUrl: result.mediaUrl}
        } else if(command === MessageCommandEnum.DAILY_CATEGORY_REPORT) {
            const result = await this.reportService.getAvailableCategoryDailyReport(value as CategoryTypeEnum)
            return {body: result.body, mediaUrl: result.mediaUrl}
        } else if(command === MessageCommandEnum.DAILY_PRODUCT_REPORT) {
            const result = await this.reportService.getAvailableProductDailyReport(value)
            return {body: result.body, mediaUrl: result.mediaUrl}
        } else {
            return {body: "唔好再打錯👻👻 再亂打block左你👀", mediaUrl: null}
        }
    }

    public async processScheduledNotifications() {
        let hasNextPage = true;
        let page = 1;
        {
            const result = await this.findAvailableMessageContent(MessageType.WHATSAPP, page, 10);

            if (result.docs.length === 0) {
                hasNextPage = false;
            } else {
                for(let i=0; i < result.docs.length; i++) {
                    this.logger.log(`send message: (from: ${result.docs[i].createdFrom}, body: ${result.docs[i].messageBody}`);

                    await this.sendMessage(Builder<SendMessageRequestDto>()
                      .toNumber(result.docs[i].phoneNumber)
                      .body(result.docs[i].messageBody)
                      .countryCode(result.docs[i].countryCode)
                      .type(result.docs[i].type)
                      .mediaUrl(["https://foodie-order-product.s3.us-west-1.amazonaws.com/bbq_pork_buns.png"]).build());

                    //update send message time
                    await dataSource.manager.getRepository(NotificationEntity).update(result.docs[i].id, {sendAt: new Date()});
                }
                hasNextPage = result.hasNextPage;
                page = result.nextPage;
            }
            page++;
        } while(hasNextPage);

    }


    private async findAvailableMessageContent(type: MessageType, page, limit) {

        const paginationOptions: PaginationInterface = Builder<PaginationInterface>()
          .pagination(true)
          .page(page ?? 1)
          .limit(limit ?? 10)
          .sortBy("id")
          .sortOrder(SortOrderEnum.ASC)
          .build();

        const offset = (paginationOptions.page - 1) * paginationOptions.limit;

        this.logger.log(`startAt <= :currentDate AND 
          endAt >= :currentDate AND 
          type = :messageType AND 
          (YEAR(sendAt) =:year AND MONTH(sendAt) =:month AND DAY(sendAt) =:day) OR sendAt IS NULL `, {currentDate: new Date(), messageType: type, year: moment().year(), month: moment().month(), day: moment().day()})

        const [result, totalDocs] = await dataSource.manager.getRepository(NotificationEntity).createQueryBuilder()
          .where(`startAt <= :currentDate AND 
          endAt >= :currentDate AND 
          type = :messageType AND 
          (YEAR(sendAt) =:year AND MONTH(sendAt) =:month AND DAY(sendAt) =:day) OR sendAt IS NULL `, {currentDate: new Date(), messageType: type, year: moment().year(), month: moment().month(), day: moment().day()})
          .orderBy(paginationOptions.sortBy, paginationOptions.sortOrder)
          .getManyAndCount()

        this.logger.log(`findAvailableMessageContent: ${JSON.stringify(result)}`);

        const totalPages = Math.ceil(totalDocs / paginationOptions.limit);
        const hasPrevPage = offset > 0;
        const hasNextPage = offset + result.length < totalDocs;
        const prevPage = hasPrevPage ? paginationOptions.page - 1 : null;
        const nextPage = hasNextPage ? paginationOptions.page + 1 : null;

        return Builder<PaginatedResult<any>>()
          .docs(result)
          .page(paginationOptions.page)
          .hasNext(hasNextPage)
          .hasPrevious(hasPrevPage)
          .totalDocs(totalDocs)
          .limit(paginationOptions.limit)
          .totalPages(totalPages)
          .nextPage(nextPage)
          .prevPage(prevPage)
          .hasPrevPage(hasPrevPage)
          .hasNextPage(hasNextPage)
          .build();
    }
}