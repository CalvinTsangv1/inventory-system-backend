import {ApiProperty} from "@nestjs/swagger";
import {IsString} from "class-validator";
import {MessageCommandEnum} from "../../enum/message-command.enum";

export class TwilioIncomingMessageRequestDto {

  @ApiProperty()
  @IsString()
  SmsMessageSid: string;

  @ApiProperty()
  @IsString()
  NumMedia: string;

  @ApiProperty()
  @IsString()
  ProfileName: string;

  @ApiProperty()
  @IsString()
  MessageType: string;

  @ApiProperty()
  @IsString()
  SmsSid: string;

  @ApiProperty()
  @IsString()
  WaId: string;

  @ApiProperty()
  @IsString()
  SmsStatus: string;

  @ApiProperty()
  @IsString()
  Body: string;

  @ApiProperty()
  @IsString()
  To: string;

  @ApiProperty()
  @IsString()
  MessageSid: string;

  @ApiProperty()
  @IsString()
  AccountSid: string;

  @ApiProperty()
  @IsString()
  From: string;

  @ApiProperty()
  @IsString()
  ApiVersion: string;
}