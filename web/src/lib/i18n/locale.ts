import { cookies } from "next/headers";
import { type Locale, locales } from "./dictionaries";
import { LOCALE_COOKIE } from "./constants";

export { LOCALE_COOKIE };

export async function getServerLocale(): Promise<Locale> {
  const cookieStore = await cookies();
  const value = cookieStore.get(LOCALE_COOKIE)?.value;
  return locales.includes(value as Locale) ? (value as Locale) : "en";
}
