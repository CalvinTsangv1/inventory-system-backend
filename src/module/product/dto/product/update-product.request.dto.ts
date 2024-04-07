import {ApiProperty, ApiPropertyOptional} from "@nestjs/swagger";
import {IsEnum, IsNumber, IsOptional, IsString} from "class-validator";
import {ProductHistoryLogEntity} from "../../entity/product-history-log.entity";
import {OrderProductStatusEnum} from "../../../order/enum/order-product-status.enum";
import {ProductInventoryStatusEnum} from "../../enum/product-inventory-status.enum";

export class UpdateProductRequestDto {

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  productName?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  productDescription?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  photoUrl?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  quantity?: number;
}