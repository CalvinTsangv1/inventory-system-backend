import {Column, Entity, ManyToOne, OneToOne, PrimaryGeneratedColumn} from "typeorm";
import {OrderEntity} from "./order.entity";
import {ProductEntity} from "../../product/entity/product.entity";

@Entity('order_product')
export class OrderProductEntity {

  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => OrderEntity, order => order.orderProducts)
  order: OrderEntity;

  @ManyToOne(() => ProductEntity, product => product.orderProducts)
  product: ProductEntity;

  @Column()
  quantity: number;

  @Column()
  price: number;

  @Column()
  total: number;

}