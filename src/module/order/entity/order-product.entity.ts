import {Column, CreateDateColumn, Entity, ManyToOne, OneToOne, PrimaryGeneratedColumn} from "typeorm";
import {OrderEntity} from "./order.entity";
import {ProductEntity} from "../../product/entity/product.entity";
import {OrderProductStatusEnum} from "../enum/order-product-status.enum";

@Entity('order_product')
export class OrderProductEntity {

  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => OrderEntity, order => order.orderProducts)
  order: OrderEntity;

  @ManyToOne(() => ProductEntity, product => product.orderProducts)
  product: ProductEntity;

  @Column()
  productName: string;

  @Column()
  status: OrderProductStatusEnum

  @Column()
  quantity: number;

  @Column()
  price: number;

  @Column()
  total: number;

  @CreateDateColumn({ type: 'datetime' })
  createdAt: Date;

}