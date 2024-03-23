import {ApiProperty, ApiPropertyOptional} from "@nestjs/swagger";
import {IsArray, IsDateString, IsOptional, IsString} from "class-validator";
import {CreateProductRequestDto} from "../../product/dto/product/create-product.request.dto";
import {OrderProductDto} from "./product-order.dto";

export class CreateOrderRequestDto {

  @ApiProperty()
  @IsArray()
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
