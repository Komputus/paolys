"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { LOCALE_COOKIE, estLocale } from "@/lib/i18n/dictionary";

export async function definirLangue(formData: FormData) {
  const langue = String(formData.get("langue") ?? "");
  const retour = String(formData.get("retour") ?? "/");

  if (estLocale(langue)) {
    const store = await cookies();
    store.set(LOCALE_COOKIE, langue, {
      maxAge: 60 * 60 * 24 * 365,
      path: "/",
    });
  }

  redirect(retour);
}
