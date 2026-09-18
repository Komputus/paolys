"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { calculerAge } from "@/lib/age";
import { validerImage } from "@/lib/validate-image";
import { getLocale } from "@/lib/i18n/locale";
import { getDictionary } from "@/lib/i18n/dictionary";

export async function enregistrerProfil(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/connexion");
  }

  const displayName = String(formData.get("displayName") ?? "");
  const birthDate = String(formData.get("birthDate") ?? "");
  const gender = String(formData.get("gender") ?? "");
  const lookingFor = String(formData.get("lookingFor") ?? "");
  const city = String(formData.get("city") ?? "");
  const bio = String(formData.get("bio") ?? "");
  const photo = formData.get("photo") as File | null;
  const lat = formData.get("lat");
  const lng = formData.get("lng");

  if (!birthDate || calculerAge(birthDate) < 18) {
    const d = getDictionary(await getLocale());
    redirect(
      `/profil/completer?erreur=${encodeURIComponent(d.profilCompleter.erreurAge)}`,
    );
  }

  const location =
    lat && lng ? `SRID=4326;POINT(${Number(lng)} ${Number(lat)})` : undefined;

  const { error: profileError } = await supabase.from("profiles").upsert({
    id: user.id,
    display_name: displayName,
    birth_date: birthDate,
    gender,
    looking_for: lookingFor,
    city,
    bio,
    ...(location ? { location } : {}),
  });

  if (profileError) {
    redirect(`/profil/completer?erreur=${encodeURIComponent(profileError.message)}`);
  }

  const codeParrainage = user.user_metadata.referred_by_code as string | undefined;
  if (codeParrainage) {
    // Idempotent cote SQL (ne recompense qu'une fois par filleul) : appeler
    // sans risque a chaque enregistrement de profil, meme en modification.
    await supabase.rpc("appliquer_parrainage", { code: codeParrainage });
  }

  if (photo && photo.size > 0) {
    const validation = validerImage(photo);
    if (!validation.ok) {
      redirect(`/profil/completer?erreur=${encodeURIComponent(validation.raison)}`);
    }

    const extension = photo.name.split(".").pop();
    const path = `${user.id}/${Date.now()}.${extension}`;

    const { error: uploadError } = await supabase.storage
      .from("profile-photos")
      .upload(path, photo, { contentType: photo.type });

    if (uploadError) {
      redirect(`/profil/completer?erreur=${encodeURIComponent(uploadError.message)}`);
    }

    const { error: photoRowError } = await supabase
      .from("profile_photos")
      .insert({ profile_id: user.id, storage_path: path });

    if (photoRowError) {
      redirect(`/profil/completer?erreur=${encodeURIComponent(photoRowError.message)}`);
    }
  }

  redirect("/profil");
}

const CHAMPS_MODIFIABLES = [
  "displayName",
  "birthDate",
  "gender",
  "lookingFor",
  "city",
  "bio",
] as const;
type ChampModifiable = (typeof CHAMPS_MODIFIABLES)[number];

const COLONNE_PAR_CHAMP: Record<ChampModifiable, string> = {
  displayName: "display_name",
  birthDate: "birth_date",
  gender: "gender",
  lookingFor: "looking_for",
  city: "city",
  bio: "bio",
};

export async function mettreAJourChamp(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/connexion");
  }

  const champ = String(formData.get("champ") ?? "");
  const valeur = String(formData.get("valeur") ?? "");

  if (!CHAMPS_MODIFIABLES.includes(champ as ChampModifiable)) {
    redirect("/profil/modifier");
  }

  if (champ === "birthDate" && (!valeur || calculerAge(valeur) < 18)) {
    const d = getDictionary(await getLocale());
    redirect(
      `/profil/modifier/${champ}?erreur=${encodeURIComponent(d.profilModifier.erreurAge)}`,
    );
  }

  if ((champ === "displayName" || champ === "city") && !valeur.trim()) {
    const d = getDictionary(await getLocale());
    redirect(
      `/profil/modifier/${champ}?erreur=${encodeURIComponent(d.profilModifier.erreurRequis)}`,
    );
  }

  const colonne = COLONNE_PAR_CHAMP[champ as ChampModifiable];
  const { error } = await supabase
    .from("profiles")
    .update({ [colonne]: valeur })
    .eq("id", user.id);

  if (error) {
    redirect(`/profil/modifier/${champ}?erreur=${encodeURIComponent(error.message)}`);
  }

  redirect("/profil/modifier");
}
