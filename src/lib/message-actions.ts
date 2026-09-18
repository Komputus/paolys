"use server";

import { createClient } from "@/lib/supabase/server";
import { getLocale } from "@/lib/i18n/locale";
import { getDictionary } from "@/lib/i18n/dictionary";

// Detection volontairement simple (pas anti-contournement parfait) : couvre
// les cas evidents (email, numero avec ou sans espaces/tirets/indicatif).
const EMAIL_REGEX = /[\w.+-]+@[\w-]+\.[a-zA-Z]{2,}/;
const PHONE_REGEX = /(?:\+?\d[\d .-]{6,14}\d)/;

export async function envoyerMessage(matchId: string, content: string) {
  const trimmed = content.trim();
  if (!trimmed) return;

  const d = getDictionary(await getLocale());

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error(d.conversation.erreurNonConnecte);
  }

  if (EMAIL_REGEX.test(trimmed) || PHONE_REGEX.test(trimmed)) {
    const [{ data: estPremium }, { data: estSponsor }] = await Promise.all([
      supabase.rpc("est_premium"),
      supabase.rpc("est_sponsor"),
    ]);

    if (!estPremium && !estSponsor) {
      throw new Error(d.conversation.erreurContact);
    }
  }

  const { error } = await supabase.from("messages").insert({
    match_id: matchId,
    sender_id: user.id,
    content: trimmed,
  });

  if (error) {
    throw new Error(error.message);
  }
}
