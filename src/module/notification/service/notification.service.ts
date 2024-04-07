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
import {ProductService} from "../../product/service/product.service";
import {ClientService} from "../../client/service/client.service";

@Injectable()
export class NotificationService {

    private logger = new Logger(NotificationService.name);
    private readonly twilioClient: any;
    private readonly twilioNumber: string;

    constructor(
      private configService: ConfigService,
      private reportService: ReportService,
      private productService: ProductService,
      private clientService: ClientService
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

        const splitCommand = dto.Body.split(":");

        this.logger.log(`commandType: ${splitCommand}`)
        if(!Object.values(MessageCommandEnum).includes(Number(splitCommand[0]))) {
            this.logger.log(`command is wrong: ${dto.Body}, from: ${dto.From} to: ${dto.To}`);
            await this.sendMessage(Builder<SendMessageRequestDto>()
              .toNumber(dto.From)
              .body("🙇 無效指令 🙇\n糟糕！看起來您輸入了一個無效指令：\n\n👉 1. 種類庫存\n (輸入 👉 1:FISH)\n 類別值：FISH、MOLLUSK、SEAWEED、CRUSTACEAN\n\n👉 2. 產品庫存\n (輸入 👉2:產品代碼)\n 值：輸入產品代碼\n\n👉 3. 訂單\n (輸入：3:訂單代碼)\n 值：輸入訂單代碼\n\n👉 4. 尋找產品編號\n (輸入：4:產品編號)\n\n👉 5. 尋找種類編號\n\n👉 6. 每日報告\n (輸入：6)\n\n👉 7. 每日種類報告\n (輸入：7:種類編號)\n\n👉 8. 每日產品報告\n (輸入：8:產品編號)\n\n👉 9. 每週報告\n (範例：9)\n\n👉 10. 每月報告\n\n👉 11. 每年報告\n\n👉 12. 客戶資料\n\n👉 13. 幫助\n\n請按照上述格式輸入指令和值以進行操作。如果需要進一步協助，請輸入 '13' 以獲取幫助。\n")
              .type(MessageType.WHATSAPP)
              .build());
            return;
        }

        const result = await this.handleIncomingCommand(Number(splitCommand[0].replace(/\s+/g, ''))-1, splitCommand[1] ?? null);
        this.logger.log(`mediaUrl: ${result.mediaUrl}`)
        await this.sendMessage(Builder<SendMessageRequestDto>()
          .toNumber(dto.From)
          .body(result.body)
          .mediaUrl(result?.mediaUrl? result.mediaUrl: null)
          .type(MessageType.WHATSAPP)
          .build());
    }

    public async handleIncomingCommand(command: number, value: string) {
        if(command === MessageCommandEnum.CATEGORY_INVENTORY) {
            return {body: await this.reportService.getAvailableCategoryTextReport(value as CategoryTypeEnum)}
        } else if(command === MessageCommandEnum.PRODUCT_INVENTORY) {
            if(!value || value === "") {
                return {body: "🔍 搜尋產品代碼：\n\n請輸入產品名稱以獲取產品代碼和詳細資訊。📦"}
            }
            return {body: await this.reportService.getAvailableProductTextReport(value)}
        } else if(command === MessageCommandEnum.ORDER) {
            if(!value || value === "") {
                return {body: "🔍 搜尋訂單：\n\n請輸入訂單代碼以獲取訂單詳細資訊。📦"}
            }
            return {body: await this.reportService.getOrderTextReport(value)}
        } else if(command === MessageCommandEnum.SEARCH_PRODUCT_CODE) {
            if(!value || value === "") {
                return {body: "🔍 搜尋產品代碼：\n\n請輸入產品名稱以獲取產品代碼和詳細資訊。📦"}
            }
            const result = await this.productService.searchProductByName(value)
            if(result && result.length > 0) {
                this.logger.log(`searchProductByName: ${JSON.stringify(result)}`)
                return {body: `🔍 搜尋產品代碼：\n${result.map(product => `\n產品名稱：${product.name}\n產品代碼：${product.id}\n產品價格：${product.price}\n產品類別：${product.category}\n產品描述：${product.description}\n`)}`, mediaUrl: result.map(product=> product.photoUrl)}
            } else {
                return {body: "🔍 搜尋產品代碼：\n\n找不到產品。請再試一次。 📦"}
            }
        } else if(command === MessageCommandEnum.SEARCH_CATEGORY_CODE) {
            return {body: "🔍 搜尋種類代碼：\n1. FISH\n2. MOLLUSK\n3. SEAWEED\n4. CRUSTACEAN"}
        } else if(command === MessageCommandEnum.DAILY_REPORT) {
            const result = await this.reportService.getAvailableDailyReport()
            return {body: result.body, mediaUrl: [result.mediaUrl]}
        } else if(command === MessageCommandEnum.DAILY_CATEGORY_REPORT) {
            if(value === null || value === undefined || value === "") {
                return {body: "🔍 每日種類報告：\n\n請輸入種類編號以獲取每日種類報告。📦"}
            }
            if(!Object.values(CategoryTypeEnum).includes(value?.toUpperCase() as CategoryTypeEnum)) {
                return {body: "🔍 每日種類報告：\n\n找不到種類。請再試一次。 📦"}
            }
            const result = await this.reportService.getAvailableCategoryDailyReport(value.toUpperCase() as CategoryTypeEnum)
            return {body: result.body, mediaUrl: [result.mediaUrl]}
        } else if(command === MessageCommandEnum.DAILY_PRODUCT_REPORT) {
            const result = await this.reportService.getAvailableProductDailyReport(value)
            return {body: result.body, mediaUrl: [result.mediaUrl]}
        } else if(command === MessageCommandEnum.CLIENT_DETAILS) {
            //const result = await this.clientService.getClients("1", {limit: 10, page: 1})
            //return {body: `🔍 客戶資料：\n\n${result.docs.map(client => `客戶名稱：${client.name}\n客戶電話：${client.phoneNumber}\n客戶地址：${client.address}\n`).join("\n")}`}
        } else {
            return {body: "打錯了👻👻 唔識就按'11'救助👀"}
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