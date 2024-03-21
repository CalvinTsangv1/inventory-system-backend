export interface NotificationInterface {
  type: string;
  startAt: Date;
  endAt: Date;
  sendAt?: Date;
  durationDays: number;
  messageBody: string;
  preferredLanguage?: string;
  countryCode?: string;
  phoneNumber?: string;
  referenceId?: string;
  createdFrom?: string;
}