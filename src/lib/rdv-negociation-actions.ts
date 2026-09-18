"use server";

import { createClient } from "@/lib/supabase/server";

export async function demanderRdv(matchId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("demander_rdv", {
    p_match_id: matchId,
  });

  if (error) {
    throw new Error(error.message);
  }

  return data as string;
}

export async function repondreDemandeRdv(id: string, accepte: boolean) {
  const supabase = await createClient();
  const { error } = await supabase.rpc("repondre_demande_rdv", {
    p_id: id,
    p_accepte: accepte,
  });

  if (error) {
    throw new Error(error.message);
  }
}
