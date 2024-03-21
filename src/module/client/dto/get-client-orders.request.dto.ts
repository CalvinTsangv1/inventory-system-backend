import {PaginationInterface} from "../../../interface/pagination.interface";
import {ApiPropertyOptional} from "@nestjs/swagger";
import {IsArray, IsBoolean, IsDateString, IsEnum, IsNumber, IsOptional, IsString} from "class-validator";
import {Transform} from "class-transformer";
import {SortOrderEnum} from "../../../util/pagination/sort-order.enum";
import {OrderStatusEnum} from "../../order/enum/order-status.enum";

export class GetClientOrdersRequestDto implements PaginationInterface {

  @ApiPropertyOptional()
  @IsOptional()
  @IsArray()
  orderIds?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsEnum(OrderStatusEnum, {each: true})
  orderStatus?: OrderStatusEnum[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  orderStartDate?: Date;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  orderEndDate?: Date;

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

  @ApiPropertyOptional()
  @IsBoolean()
  @IsOptional()
  @Transform(({value}) => value === 'true')
  pagination?: boolean;
}