import { LanguageEnum } from "./enum/language.enum";
import {MessageBodyTypeEnum} from "../notification/enum/message-body-type.enum";

const messages = {
  parkingContractRenewExpires: {
    EN: "Your parking contract for prepaid parking slot in {{carParkName}} at floor: {{floor}}, position: {{position}} will be expired on {{endAt}}. Please proceed to renew it.\n{{url}}",
    ZH: "你在{{carParkName}}{{floor}}樓{{position}}號的車位合約預缴會在{{endAt}}到期，請儘快更新。\n{{url}}"
  },
  parkingContractRenewExpired: {
    EN: "Your parking contract for prepaid parking slot in {{carParkName}} at floor: {{floor}}, position: {{position}} is expired on {{endAt}}. Your parking slot will be reserved next parker. If any inquiry, please contact 12345678.\n",
    ZH: "你在{{carParkName}}{{floor}}樓{{position}}號的車位合約預缴已經{{endAt}}到期，車位會預留給下一個使用者使用。如果有問題，請致電12345678。\n"
  },
  parkingSlotReserved: {
    EN: "Parking slot will be reserved to you in {{carParkName}} at floor: {{floor}}, position: {{position}}. Please book parking slot, it will be expired on {{endAt}}.\n{{url}}",
    ZH: "你在{{carParkName}}{{floor}}樓{{position}}號的車位預留給你。請在{{endAt}}到期前，預訂車位。\n"
  },
  parkingSlotReservedExpired: {
    EN: "Reserved parking slot period in {{carParkName}} is expired today. If any inquiry, please contact 12345678.\n",
    ZH: "你在{{carParkName}}的車位預訂已經今天到期。如果有問題，請致電12345678。\n"

  },
  parkingSlotAvailable: {
    EN: "A parking slot in {{carParkName}} has been reserved automatically for you. Please view the detail.\n{{url}}",
    ZH: "你在{{carParkName}}的車位已經被預留，請查看詳情。\n{{url}}"
  }
};

function getMessage(key: string, language: LanguageEnum, replacements: any) {
  const message = messages[key];
  if (!message) {
    return '';
  }

  const template = message[language] || message.EN;
  return replacePlaceholders(template, replacements);
}

function replacePlaceholders(template: string, replacements: any) {
  return template.replace(/{{(\w+)}}/g, (match, key) => {
    return replacements[key] || match;
  });
}

export {messages, getMessage};