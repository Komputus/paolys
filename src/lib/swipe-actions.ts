"use server";

import { createClient } from "@/lib/supabase/server";

export async function enregistrerSwipe(cibleId: string, sens: "like" | "pass") {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("enregistrer_swipe", {
    cible: cibleId,
    sens,
  });

  if (error) {
    throw new Error(error.message);
  }

  return { matchId: (data as string | null) ?? null };
}
