"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { verifierUnVisageNet } from "@/lib/face-check";
import { validerImage } from "@/lib/validate-image";
import { getLocale } from "@/lib/i18n/locale";
import { getDictionary } from "@/lib/i18n/dictionary";

export async function demanderVerification(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/connexion");
  }

  const d = getDictionary(await getLocale());

  const selfie = formData.get("selfie") as File | null;

  if (!selfie || selfie.size === 0) {
    redirect(
      `/profil/verification?erreur=${encodeURIComponent(d.verification.erreurSansSelfie)}`,
    );
  }

  const validation = validerImage(selfie);
  if (!validation.ok) {
    redirect(`/profil/verification?erreur=${encodeURIComponent(validation.raison)}`);
  }

  // Empeche le spam de demandes (chaque tentative coute un appel AWS
  // Rekognition) : une seule demande en attente a la fois.
  const { data: dejaEnAttente } = await supabase
    .from("photo_verifications")
    .select("id")
    .eq("profile_id", user.id)
    .eq("status", "pending")
    .maybeSingle();

  if (dejaEnAttente) {
    redirect(
      `/profil/verification?erreur=${encodeURIComponent(d.verification.erreurDejaEnAttente)}`,
    );
  }

  const bytes = new Uint8Array(await selfie.arrayBuffer());

  // Premier filtre automatique : un visage net et unique, avant de deranger
  // un administrateur. Rejette immediatement sinon.
  const filtre = await verifierUnVisageNet(bytes);
  if (!filtre.ok) {
    redirect(`/profil/verification?erreur=${encodeURIComponent(filtre.raison)}`);
  }

  const extension = selfie.name.split(".").pop();
  const path = `${user.id}/${Date.now()}.${extension}`;

  const { error: uploadError } = await supabase.storage
    .from("verification-selfies")
    .upload(path, selfie, { contentType: selfie.type });

  if (uploadError) {
    redirect(`/profil/verification?erreur=${encodeURIComponent(uploadError.message)}`);
  }

  const { error: insertError } = await supabase.from("photo_verifications").insert({
    profile_id: user.id,
    selfie_storage_path: path,
  });

  if (insertError) {
    redirect(`/profil/verification?erreur=${encodeURIComponent(insertError.message)}`);
  }

  redirect("/profil");
}

export async function traiterVerification(
  verificationId: string,
  decision: "approved" | "rejected",
) {
  const supabase = await createClient();
  const { error } = await supabase.rpc("traiter_verification", {
    verification_id: verificationId,
    decision,
  });

  if (error) {
    throw new Error(error.message);
  }
}
