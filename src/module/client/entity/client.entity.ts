import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn
} from "typeorm";
import {TimestampInterface} from "../../../interface/timestamp.interface";
import {OrderEntity} from "../../order/entity/order.entity";
import {UserEntity} from "../../user/entity/user.entity";

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

  @Column({type: "text", nullable: true})
  description: string;

  @OneToMany(() => OrderEntity, order => order.client)
  orders: OrderEntity[];

  @Column({type: "varchar", length: 255})
  userId: string;

  @Column({ type: 'datetime', nullable: true })
  inactiveAt: Date;

  @CreateDateColumn({ type: 'datetime' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'datetime' })
  updatedAt: Date;


}
