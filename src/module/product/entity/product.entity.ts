import { TimestampInterface } from "src/interface/timestamp.interface";
import {
  Column,
  CreateDateColumn,
  Entity, ManyToMany, OneToMany, OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn
} from "typeorm";
import {CategoryTypeEnum} from "../enum/category-type.enum";
import { CurrencyEnum } from "src/enum/currency.enum";
import {OrderEntity} from "../../order/entity/order.entity";
import {OrderProductEntity} from "../../order/entity/order-product.entity";
import {ProductHistoryLogEntity} from "./product-history-log.entity";

@Entity("products")
export class ProductEntity implements TimestampInterface {

  @PrimaryGeneratedColumn()
  id: string;

  @Column({type: "varchar", length: 255})
  name: string;

  @Column({type: "text"})
  description: string;

  @Column({type: "enum", enum: CategoryTypeEnum})
  category?: CategoryTypeEnum;

  @Column({type: "text", nullable: true})
  unit: string;

  @Column({type: "decimal", precision: 10, scale: 2})
  price: number;

  @Column({type: "int"})
  stockQuantity: number;

  @Column({type: "enum", enum: CurrencyEnum, default: CurrencyEnum.CAD})
  currency: CurrencyEnum;

  @Column({type: "text", nullable: true})
  photoUrl: string;

  @OneToMany(() => ProductHistoryLogEntity, productHistoryLog => productHistoryLog.product)
  logs: ProductHistoryLogEntity[];

  @OneToMany(() => OrderProductEntity, orderProduct => orderProduct.product)
  orderProducts: OrderProductEntity[];

  @Column({ type: 'datetime', nullable: true })
  inactiveAt: Date;

  @CreateDateColumn({ type: 'datetime' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'datetime' })
  updatedAt: Date;
}