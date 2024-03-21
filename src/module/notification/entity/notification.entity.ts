import {Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn} from "typeorm";
import {NotificationInterface} from "../interface/notification.interface";
import {TimestampInterface} from "../../../interface/timestamp.interface";
import {MessageType} from "../enum/message-type.enum";
import {LanguageEnum} from "../../generic/enum/language.enum";

@Entity("notification")
export class NotificationEntity implements NotificationInterface, TimestampInterface {

  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  type: MessageType;

  @Column({ type: 'datetime' })
  startAt: Date;

  @Column({ type: 'datetime' })
  endAt: Date;

  @Column({ type: 'datetime', nullable: true})
  sendAt?: Date;

  @Column()
  durationDays: number;

  @Column()
  messageBody: string;

  @Column({default: LanguageEnum.ZH})
  preferredLanguage?: LanguageEnum;

  @Column({default: "HK"})
  countryCode?: string;

  @Column()
  phoneNumber?: string;

  @Column({nullable: true})
  referenceId?: string;

  @Column({nullable: true})
  createdFrom?: string;

  @CreateDateColumn({ type: 'datetime' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'datetime' })
  updatedAt: Date;
}