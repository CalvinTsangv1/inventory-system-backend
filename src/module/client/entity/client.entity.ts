import {Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn} from "typeorm";
import {TimestampInterface} from "../../../interface/timestamp.interface";
import {OrderEntity} from "../../order/entity/order.entity";

@Entity("clients")
export class ClientEntity implements TimestampInterface {

  @PrimaryGeneratedColumn()
  id: string;

  @Column({type: "varchar", length: 255})
  contactName: string;

  @Column({type: "varchar", length: 255})
  address: string;

  @Column({type: "varchar", length: 255})
  phoneNumber: string;

  @Column({type: "text"})
  description: string;

  @OneToMany(() => OrderEntity, order => order.client)
  orders: OrderEntity[];

  @Column({ type: 'datetime', nullable: true })
  inactiveAt: Date;

  @CreateDateColumn({ type: 'datetime' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'datetime' })
  updatedAt: Date;


}