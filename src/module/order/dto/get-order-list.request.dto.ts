import {ApiProperty, ApiPropertyOptional} from "@nestjs/swagger";
import {IsArray, IsBoolean, IsDateString, IsEnum, IsNumber, IsOptional, IsString} from "class-validator";
import {OrderStatusEnum} from "../enum/order-status.enum";
import {Transform} from "class-transformer";
import {SortOrderEnum} from "../../../util/pagination/sort-order.enum";

export class GetOrderListRequestDto {

  @ApiProperty()
  @IsString()
  userId: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsArray()
  clientIds?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  productIds?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsEnum(OrderStatusEnum)
  status?: OrderStatusEnum;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  startPeriodPickupDate?: Date;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  endPeriodPickupDate?: Date;

  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  @Transform(({value}) => parseInt(value))
  offset?: number;

  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  @Transform(({value}) => parseInt(value))
  page?: number;

  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  @Transform(({value}) => parseInt(value))
  limit?: number;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  sortBy?: string;

  @ApiPropertyOptional()
  @IsEnum(SortOrderEnum)
  @IsOptional()
  sortOrder?: SortOrderEnum;

  @ApiPropertyOptional({default: true})
  @IsBoolean()
  @IsOptional()
  @Transform(({value}) => value === 'true')
  pagination?: boolean;

}