"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getLocale } from "@/lib/i18n/locale";
import { getDictionary } from "@/lib/i18n/dictionary";

export async function bloquerUtilisateur(cibleId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/connexion");
  }

  const { error } = await supabase.rpc("bloquer_utilisateur", { cible: cibleId });

  if (error) {
    throw new Error(error.message);
  }
}

export async function signalerUtilisateur(cibleId: string, raison: string) {
  const trimmed = raison.trim();
  if (!trimmed) {
    const d = getDictionary(await getLocale());
    throw new Error(d.moderation.erreurRaisonVide);
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/connexion");
  }

  const { error } = await supabase.from("reports").insert({
    reporter_id: user.id,
    reported_id: cibleId,
    reason: trimmed,
  });

  if (error) {
    throw new Error(error.message);
  }
}

export async function marquerSignalementTraite(formData: FormData) {
  const reportId = String(formData.get("reportId") ?? "");

  const supabase = await createClient();
  const { error } = await supabase
    .from("reports")
    .update({ status: "reviewed" })
    .eq("id", reportId);

  if (error) {
    throw new Error(error.message);
  }
}
