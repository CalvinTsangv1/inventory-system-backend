import {ApiProperty, ApiPropertyOptional} from "@nestjs/swagger";
import {IsOptional, IsString} from "class-validator";

export class CreateClientRequestDto {

  @ApiProperty()
  @IsString()
  clientName: string;

  @ApiProperty()
  @IsString()
  phoneNumber: string;

  @ApiProperty()
  @IsString()
  address: string;

  @ApiProperty()
  @IsString()
  userId: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

}