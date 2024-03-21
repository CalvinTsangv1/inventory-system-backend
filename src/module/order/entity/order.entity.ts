import {
  Column,
  CreateDateColumn,
  Entity,
  JoinTable,
  ManyToMany,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn
} from "typeorm";
import {ProductEntity} from "../../product/entity/product.entity";
import {ClientEntity} from "../../client/entity/client.entity";
import {OrderStatusEnum} from "../enum/order-status.enum";
import {TimestampInterface} from "../../../interface/timestamp.interface";

@Entity("orders")
export class OrderEntity implements TimestampInterface {

  @PrimaryGeneratedColumn()
  id: string;

  @ManyToMany(() => ProductEntity, product => product.orders)
  @JoinTable()
  products: ProductEntity[];

  @ManyToOne(() => ClientEntity, client => client.orders)
  client: ClientEntity;

  @Column({type: "enum", enum: OrderStatusEnum, default: OrderStatusEnum.DRAFT})
  status: OrderStatusEnum;

  @Column({ type: 'datetime', nullable: true })
  inactiveAt: Date;

  @CreateDateColumn({ type: 'datetime' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'datetime' })
  updatedAt: Date;
}