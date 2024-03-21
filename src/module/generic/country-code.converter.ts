import { CountryCode } from "libphonenumber-js";

export async function convertStringToCountryCode (inputCountryCode: string): Promise<CountryCode> {
  let countryCode = "HK";

  if (inputCountryCode === "+852") countryCode = "HK";

  return countryCode as CountryCode;
}