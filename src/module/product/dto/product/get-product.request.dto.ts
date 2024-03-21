import {ApiProperty, ApiPropertyOptional} from "@nestjs/swagger";
import {IsArray, IsBoolean, IsEnum, IsNumber, IsOptional, IsString} from "class-validator";
import {CategoryTypeEnum} from "../../enum/category-type.enum";
import {PaginationInterface} from "../../../../interface/pagination.interface";
import {Transform} from "class-transformer";
import {SortOrderEnum} from "../../../../util/pagination/sort-order.enum";

export class GetProductRequestDto implements PaginationInterface {

  @ApiPropertyOptional()
  @IsOptional()
  @Transform(({value}) => value.split(','))
  ids?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsEnum(CategoryTypeEnum)
  categoryType: CategoryTypeEnum;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  productName?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  priceFrom?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  priceTo?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isLowQuantity?: boolean;

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