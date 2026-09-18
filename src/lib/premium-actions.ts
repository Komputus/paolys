"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function annulerDernierSwipe() {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("annuler_dernier_swipe");

  if (error) {
    throw new Error(error.message);
  }

  return { profilId: (data as string | null) ?? null };
}

export async function activerBoost() {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("activer_boost");

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/profil");
  return { boostedUntil: data as string };
}

export async function definirModeDiscret(formData: FormData) {
  const actif = formData.get("actif") === "true";

  const supabase = await createClient();
  const { error } = await supabase.rpc("definir_mode_discret", { actif });

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/profil");
}
