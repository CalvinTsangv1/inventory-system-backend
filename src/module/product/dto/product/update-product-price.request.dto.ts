import {IsNotEmpty, IsNumber} from "class-validator";

export class UpdateProductPriceRequestDto {
  @IsNumber()
  @IsNotEmpty()
  price: number;
}