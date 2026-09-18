"use server";

import { createClient } from "@/lib/supabase/server";

export async function creerRendezVous(params: {
  matchId: string;
  lieu: string;
  moment: string;
  note: string;
}) {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("creer_rendezvous", {
    p_match_id: params.matchId,
    p_lieu: params.lieu,
    p_moment: params.moment,
    p_note: params.note || null,
  });

  if (error) {
    throw new Error(error.message);
  }

  return { id: data as string };
}
