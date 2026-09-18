"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { PROMPTS_DISPONIBLES, type PromptKey } from "@/lib/prompts";
import { getLocale } from "@/lib/i18n/locale";
import { getDictionary } from "@/lib/i18n/dictionary";

function estPromptKey(valeur: string): valeur is PromptKey {
  return valeur in PROMPTS_DISPONIBLES;
}

export async function enregistrerPrompts(formData: FormData) {
  const d = getDictionary(await getLocale());
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/connexion");
  }

  const lignes: { pos: number; prompt_key: string; reponse: string }[] = [];

  for (let pos = 0; pos < 3; pos++) {
    const promptKey = String(formData.get(`promptKey${pos}`) ?? "");
    const reponse = String(formData.get(`reponse${pos}`) ?? "").trim();

    if (!promptKey || !reponse) continue;

    if (!estPromptKey(promptKey)) {
      redirect(`/profil/prompts?erreur=${encodeURIComponent(d.prompts.erreurQuestionInvalide)}`);
    }

    lignes.push({ pos, prompt_key: promptKey, reponse });
  }

  const { error: deleteError } = await supabase
    .from("profile_prompts")
    .delete()
    .eq("profile_id", user.id);

  if (deleteError) {
    redirect(`/profil/prompts?erreur=${encodeURIComponent(deleteError.message)}`);
  }

  if (lignes.length > 0) {
    const { error: insertError } = await supabase.from("profile_prompts").insert(
      lignes.map((ligne) => ({ ...ligne, profile_id: user.id })),
    );

    if (insertError) {
      redirect(`/profil/prompts?erreur=${encodeURIComponent(insertError.message)}`);
    }
  }

  redirect("/profil");
}
