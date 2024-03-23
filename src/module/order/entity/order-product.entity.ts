import {Column, Entity, PrimaryGeneratedColumn} from "typeorm";

@Entity('order_product')
export class OrderProductEntity {

  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  productId: string;

  @Column()
  quantity: number;

  @Column()
  price: number;

  @Column()
  total: number;

}