import {Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn} from "typeorm";
import {ProductEntity} from "./product.entity";
import {ProductInventoryStatusEnum} from "../enum/product-inventory-status.enum";

@Entity("product_history_logs")
export class ProductHistoryLogEntity {

  @PrimaryGeneratedColumn("uuid")
  id: string;

  @ManyToOne(() => ProductEntity, product => product.logs)
  product: ProductEntity;

  @Column({type: "int"})
  quantity: number;

  @Column({type: "enum", enum: ProductInventoryStatusEnum, default: ProductInventoryStatusEnum.IMPORTED})
  type?: ProductInventoryStatusEnum;

  @CreateDateColumn({ type: 'datetime' })
  createdAt?: Date;

}