import {ApiProperty, ApiPropertyOptional} from "@nestjs/swagger";
import {IsArray, IsDateString, IsOptional, IsString} from "class-validator";
import {OrderProductDto} from "./product-order.dto";

export class UpdateOrderRequestDto {

  @ApiPropertyOptional()
  @IsOptional()
  @IsArray()
  orderProducts: OrderProductDto[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  expectedDeliveryDate?: Date;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  expectedPickupDate?: Date;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  note?: string;

}