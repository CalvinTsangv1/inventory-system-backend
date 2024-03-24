import {Column, Entity, OneToMany, OneToOne, PrimaryGeneratedColumn} from "typeorm";
import {RoleEnum} from "../../../enum/role.enum";
import {ClientEntity} from "../../client/entity/client.entity";

@Entity('users')
export class UserEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({type: 'text'})
  phoneNumber: string;

  @Column({type: 'varchar', length: 255, nullable: true})
  nickname: string;

  @Column({type: 'varchar', length: 255, nullable: true})
  email: string;

  @Column({type: "enum", enum: RoleEnum, default: "CUSTOMER"})
  role: RoleEnum;

}