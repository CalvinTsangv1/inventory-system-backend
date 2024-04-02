export class TwilioMessageDto {
  body: string;
  from: string;
  to: string;
  mediaUrl: string[];
  templateName: string;
}