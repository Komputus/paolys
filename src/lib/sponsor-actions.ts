"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function definirAutorisationSponsor(
  cibleId: string,
  autorisations: { voirProfil: boolean; voirPhoto: boolean; voirContact: boolean },
) {
  const supabase = await createClient();
  const { error } = await supabase.rpc("definir_autorisation_sponsor", {
    cible: cibleId,
    p_voir_profil: autorisations.voirProfil,
    p_voir_photo: autorisations.voirPhoto,
    p_voir_contact: autorisations.voirContact,
  });

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/sponsor");
}

export async function definirTelephoneSponsor(formData: FormData) {
  const phone = String(formData.get("phone") ?? "").trim();

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Non connecté");
  }

  const { error } = await supabase
    .from("profile_contacts")
    .upsert({ profile_id: user.id, phone, updated_at: new Date().toISOString() });

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/sponsor");
}
