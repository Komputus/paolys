"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getLocale } from "@/lib/i18n/locale";
import { getDictionary } from "@/lib/i18n/dictionary";

async function traduireErreurAuth(message: string) {
  const d = getDictionary(await getLocale());
  return d.auth.erreurs[message] ?? message;
}

export async function signUp(formData: FormData) {
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");
  const displayName = String(formData.get("displayName") ?? "");
  const codeParrainage = String(formData.get("ref") ?? "");

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        display_name: displayName,
        referred_by_code: codeParrainage || null,
      },
    },
  });

  if (error) {
    redirect(`/inscription?erreur=${encodeURIComponent(await traduireErreurAuth(error.message))}`);
  }

  // Si la confirmation par email est desactivee (ou deja confirmee), Supabase
  // renvoie directement une session active : pas besoin de faire attendre un
  // email qui ne viendra jamais.
  if (data.session) {
    redirect("/profil/completer");
  }

  redirect("/inscription/verifiez-vos-emails");
}

export async function signIn(formData: FormData) {
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    redirect(`/connexion?erreur=${encodeURIComponent(await traduireErreurAuth(error.message))}`);
  }

  redirect("/profil");
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/connexion");
}
