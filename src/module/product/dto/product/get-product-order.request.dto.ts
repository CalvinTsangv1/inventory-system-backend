import {ApiProperty, ApiPropertyOptional} from "@nestjs/swagger";
import {IsBoolean, IsEnum, IsNumber, IsOptional, IsString} from "class-validator";
import {Transform} from "class-transformer";
import {SortOrderEnum} from "../../../../util/pagination/sort-order.enum";

export class GetProductOrderRequestDto {

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