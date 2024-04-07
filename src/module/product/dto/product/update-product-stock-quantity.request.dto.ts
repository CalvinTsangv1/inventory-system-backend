import {ApiProperty} from "@nestjs/swagger";
import {IsNumber} from "class-validator";

export class UpdateProductStockQuantityRequestDto {

  @ApiProperty()
  @IsNumber()
  quantity: number;
}