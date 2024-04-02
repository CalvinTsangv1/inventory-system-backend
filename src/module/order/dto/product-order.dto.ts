import {ApiProperty, ApiPropertyOptional} from "@nestjs/swagger";
import {IsEnum, IsNumber, IsOptional, IsString} from "class-validator";
import {OrderProductStatusEnum} from "../enum/order-product-status.enum";

export class OrderProductDto {

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  id?: string;

  @ApiProperty()
  @IsString()
  productId: string;

  @ApiProperty()
  @IsNumber()
  quantity: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsEnum(OrderProductStatusEnum)
  status?: OrderProductStatusEnum;

  @ApiProperty()
  @IsNumber()
  price: number;

  @ApiProperty()
  @IsNumber()
  total: number;
}