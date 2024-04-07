import {ApiProperty, ApiPropertyOptional} from "@nestjs/swagger";
import {IsArray, IsDateString, IsEnum, IsOptional, IsString, ValidateNested} from "class-validator";
import {CreateProductRequestDto} from "../../product/dto/product/create-product.request.dto";
import {OrderProductDto} from "./product-order.dto";
import {Type} from "class-transformer";
import {OrderProductStatusEnum} from "../enum/order-product-status.enum";

export class CreateOrderRequestDto {
  @ApiProperty()
  @IsString()
  userId: string;

  @ApiProperty()
  @ValidateNested({each: true})
  @Type(() => OrderProductDto)
  orderProducts: OrderProductDto[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  note?: string;

  @ApiProperty()
  @IsString()
  clientId: string;

  @ApiPropertyOptional()
  @IsDateString()
  expectedDeliveryDate?: Date;

  @ApiPropertyOptional()
  @IsDateString()
  expectedPickupDate?: Date;
}
