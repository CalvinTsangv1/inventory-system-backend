import {IsBoolean, IsEnum, IsNumber, IsOptional, IsString} from "class-validator";
import {ApiProperty, ApiPropertyOptional} from "@nestjs/swagger";
import {CategoryTypeEnum} from "../../enum/category-type.enum";
import { CurrencyEnum } from "src/enum/currency.enum";

export class CreateProductRequestDto {

  @ApiProperty()
  @IsString()
  productName: string;

  @ApiProperty()
  @IsString()
  description: string;

  @ApiProperty()
  @IsEnum(CategoryTypeEnum)
  categoryType: CategoryTypeEnum;

  @ApiProperty()
  @IsString()
  unit: string;

  @ApiProperty()
  @IsNumber()
  price: number;

  @ApiProperty()
  @IsNumber()
  quantity: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsEnum(CurrencyEnum)
  currency?: CurrencyEnum;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  photoUrl?: string;

  @ApiPropertyOptional()
  @IsOptional()
  productAdditionalInfoId?: string;

}