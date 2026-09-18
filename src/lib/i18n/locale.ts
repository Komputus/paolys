import { cookies } from "next/headers";
import { DEFAULT_LOCALE, LOCALE_COOKIE, estLocale, type Locale } from "@/lib/i18n/dictionary";

export async function getLocale(): Promise<Locale> {
  const store = await cookies();
  const valeur = store.get(LOCALE_COOKIE)?.value;
  return estLocale(valeur) ? valeur : DEFAULT_LOCALE;
}
