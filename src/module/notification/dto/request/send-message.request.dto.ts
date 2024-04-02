import { MessageType } from "../../enum/message-type.enum";
import { CountryCode } from "libphonenumber-js";
import { ApiProperty } from "@nestjs/swagger";
import {IsArray, IsEnum, IsIn, IsString} from "class-validator";

export class SendMessageRequestDto {
  @ApiProperty({default: "Test message from aircity"})
  @IsString()
  body: string;

  @ApiProperty()
  @IsString()
  toNumber: string;

  @ApiProperty({default: "HK"})
  @IsString()
  @IsIn(["HK", "CA", "US"])
  countryCode: CountryCode;

  @ApiProperty({enum: MessageType, default: MessageType.SMS})
  @IsEnum(MessageType)
  type: MessageType;

  @ApiProperty()
  @IsArray()
  mediaUrl: string[];
}