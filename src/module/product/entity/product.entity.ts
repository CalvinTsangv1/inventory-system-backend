import { TimestampInterface } from "src/interface/timestamp.interface";
import {
  Column,
  CreateDateColumn,
  Entity, ManyToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn
} from "typeorm";
import {CategoryTypeEnum} from "../enum/category-type.enum";
import { CurrencyEnum } from "src/enum/currency.enum";
import {OrderEntity} from "../../order/entity/order.entity";

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

  @ManyToMany(() => OrderEntity, order => order.products)
  orders: OrderEntity[];

  @Column({ type: 'datetime', nullable: true })
  inactiveAt: Date;

  @CreateDateColumn({ type: 'datetime' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'datetime' })
  updatedAt: Date;
}