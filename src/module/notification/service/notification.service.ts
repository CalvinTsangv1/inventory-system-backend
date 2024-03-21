import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { SendMessageRequestDto } from "../dto/request/send-message.request.dto";
import { MessageType } from "../enum/message-type.enum";
import { isValidPhoneNumber, parsePhoneNumber } from "libphonenumber-js";
import { InternalServiceException } from "../../rest/exception/internal-service.exception";
import { Builder } from "builder-pattern";
import { TwilioMessageDto } from "../dto/request/twilio-message.dto";
import * as fs from "fs";
import { TwilioKeysResponseDto } from "../dto/response/twilio-keys.response.dto";
import {dataSource} from "../../../util/data-source";
import {NotificationEntity} from "../entity/notification.entity";
import {getPaginatedResult, PaginatedResult} from "../../../util/pagination/pagination";
import {LanguageEnum} from "../../generic/enum/language.enum";
import {PaginationInterface} from "../../../interface/pagination.interface";
import {SortOrderEnum} from "../../../util/pagination/sort-order.enum";
import moment from "moment-timezone";

@Injectable()
export class NotificationService {

    private logger = new Logger(NotificationService.name);
    private readonly twilioClient: any;
    private readonly twilioNumber: string;

    constructor(
      private configService: ConfigService,
    ) {
        const data: TwilioKeysResponseDto = JSON.parse(this.configService.get<string>("TWILIO_KEY"));

        this.twilioClient = require("twilio")(data.twilio_account_sid, data.twilio_auth_token);
        this.twilioNumber = data.twilio_phone_number;
    }

    public async sendMessage(dto: SendMessageRequestDto) {
        let fromNumber = this.twilioNumber;

        if (dto.type === MessageType.WHATSAPP) {
            fromNumber = `whatsapp:${fromNumber}`;
        }

        if (!isValidPhoneNumber(dto.toNumber, dto.countryCode)) {
            throw new InternalServiceException(`Invalid phone number ${dto.toNumber} with country code ${dto.countryCode}`);
        }

        const toNumber = parsePhoneNumber(dto.toNumber, dto.countryCode)
          .formatInternational()
          .replace(/\s/g, "");

        const messageBody = Builder<TwilioMessageDto>()
          .body(dto.body)
          .from(fromNumber)
          .to(toNumber)
          .build();

        this.logger.log(`Sending message ${JSON.stringify(messageBody)}`);
        // TODO: Need to upgrade account to send messages to unverified numbers
        return await this.twilioClient.messages.create(messageBody);
    }

    public async processScheduledNotifications() {
        let hasNextPage = true;
        let page = 1;
        {
            const result = await this.findAvailableMessageContent(MessageType.SMS, page, 10);

            if (result.docs.length === 0) {
                hasNextPage = false;
            } else {
                for(let i=0; i < result.docs.length; i++) {
                    this.logger.log(`send message: (from: ${result.docs[i].createdFrom}, body: ${result.docs[i].messageBody}`);


                    await this.sendMessage(Builder<SendMessageRequestDto>()
                      .toNumber(result.docs[i].phoneNumber)
                      .body(result.docs[i].messageBody)
                      .countryCode(result.docs[i].countryCode)
                      .type(result.docs[i].type).build());

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

        const [result, totalDocs] = await dataSource.manager.getRepository(NotificationEntity).createQueryBuilder()
          .where(`startAt <= :currentDate AND 
          endAt >= :currentDate AND 
          type = :messageType AND 
          (YEAR(sendAt) =:year AND MONTH(sendAt) =:month AND DAY(sendAt) =:day) OR sendAt IS NULL `, {currentDate: new Date(), messageType: type, year: moment().year(), month: moment().month(), day: moment().day()})
          .orderBy(paginationOptions.sortBy, paginationOptions.sortOrder)
          .getManyAndCount()

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