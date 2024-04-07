import {ApiProperty, ApiPropertyOptional} from "@nestjs/swagger";
import {IsBoolean, IsEnum, IsNumber, IsOptional, IsString} from "class-validator";
import {PaginationInterface} from "../../../interface/pagination.interface";
import {Transform} from "class-transformer";
import {SortOrderEnum} from "../../../util/pagination/sort-order.enum";

export class GetClientsRequestDto implements PaginationInterface {

  @ApiProperty()
  @IsString()
  userId: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  clientId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  phoneNumber?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  contactName?: string;

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