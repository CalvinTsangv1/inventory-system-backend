import {Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn} from "typeorm";
import {TimestampInterface} from "../../../interface/timestamp.interface";
import {MessageBodyTypeEnum} from "../enum/message-body-type.enum";
import {LanguageEnum} from "../../generic/enum/language.enum";

@Entity("notification_message")
export class NotificationMessageEntity implements TimestampInterface {

  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  type: MessageBodyTypeEnum;

  @Column()
  content: string;

  @Column()
  language: LanguageEnum;

  @Column({ type: 'datetime', nullable: true})
  inactiveAt: Date;

  @CreateDateColumn({ type: 'datetime' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'datetime' })
  updatedAt: Date;
}