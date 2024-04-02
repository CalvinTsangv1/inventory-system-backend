import {
  Column,
  CreateDateColumn,
  Entity,
  JoinTable,
  ManyToMany,
  ManyToOne, OneToMany, OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn
} from "typeorm";
import {ClientEntity} from "../../client/entity/client.entity";
import {OrderStatusEnum} from "../enum/order-status.enum";
import {TimestampInterface} from "../../../interface/timestamp.interface";
import {OrderProductEntity} from "./order-product.entity";
import {PaymentTypeEnum} from "../enum/payment-type.enum";

@Entity("orders")
export class OrderEntity implements TimestampInterface {

  @PrimaryGeneratedColumn()
  id: string;

  @OneToMany(() => OrderProductEntity, orderProduct => orderProduct.order)
  orderProducts: OrderProductEntity[];

  @ManyToOne(() => ClientEntity, client => client.orders)
  client: ClientEntity;

  @Column({type: "enum", enum: OrderStatusEnum, default: OrderStatusEnum.DRAFT})
  status: OrderStatusEnum;

  @Column({type: "enum", enum: PaymentTypeEnum, default: PaymentTypeEnum.E_TRANSFER})
  paymentType: PaymentTypeEnum;

  @Column({ type: 'datetime'})
  expectedDeliveryDate: Date;

  @Column({ type: 'datetime'})
  expectedPickupDate: Date;

  @Column({ type: 'text', nullable: true})
  note: string;

  @Column({ type: 'text'})
  userId: string;

  @Column({ type: 'datetime', nullable: true })
  completedAt: Date;

  @Column({ type: 'datetime', nullable: true })
  inactiveAt: Date;

  @CreateDateColumn({ type: 'datetime' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'datetime' })
  updatedAt: Date;
}