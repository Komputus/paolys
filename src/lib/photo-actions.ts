"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { validerImage } from "@/lib/validate-image";
import { compresserImage } from "@/lib/compress-image";
import { MAX_PHOTOS_PAR_PROFIL } from "@/lib/photo-url";

export async function ajouterPhoto(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/connexion");
  }

  const photo = formData.get("photo") as File | null;
  if (!photo || photo.size === 0) {
    redirect("/profil/photos");
  }

  const validation = validerImage(photo);
  if (!validation.ok) {
    redirect(`/profil/photos?erreur=${encodeURIComponent(validation.raison)}`);
  }

  const { count } = await supabase
    .from("profile_photos")
    .select("id", { count: "exact", head: true })
    .eq("profile_id", user.id);

  if ((count ?? 0) >= MAX_PHOTOS_PAR_PROFIL) {
    redirect(
      `/profil/photos?erreur=${encodeURIComponent(`Maximum ${MAX_PHOTOS_PAR_PROFIL} photos — supprime-en une pour en ajouter une autre.`)}`,
    );
  }

  const imageCompressee = await compresserImage(photo);
  const path = `${user.id}/${Date.now()}.jpg`;

  const { error: uploadError } = await supabase.storage
    .from("profile-photos")
    .upload(path, imageCompressee, { contentType: "image/jpeg" });

  if (uploadError) {
    redirect(`/profil/photos?erreur=${encodeURIComponent(uploadError.message)}`);
  }

  const { error: insertError } = await supabase.from("profile_photos").insert({
    profile_id: user.id,
    storage_path: path,
    position: count ?? 0,
  });

  if (insertError) {
    redirect(`/profil/photos?erreur=${encodeURIComponent(insertError.message)}`);
  }

  revalidatePath("/profil/photos");
  revalidatePath("/profil");
}

export async function supprimerPhoto(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/connexion");
  }

  const photoId = String(formData.get("photoId") ?? "");

  const { data: photo } = await supabase
    .from("profile_photos")
    .select("id, storage_path, profile_id, position")
    .eq("id", photoId)
    .eq("profile_id", user.id)
    .maybeSingle();

  if (!photo) {
    redirect("/profil/photos");
  }

  // La photo principale d'un profil verifie est figee : c'est celle qu'un
  // admin a comparee au selfie. La laisser supprimable ouvrirait la porte a
  // se faire verifier puis substituer une autre photo tout en gardant le
  // badge de confiance.
  if (photo.position === 0) {
    const { data: profil } = await supabase
      .from("profiles")
      .select("photo_verified")
      .eq("id", user.id)
      .maybeSingle();

    if (profil?.photo_verified) {
      redirect(
        `/profil/photos?erreur=${encodeURIComponent("Ta photo principale est verifiee et ne peut pas etre supprimee.")}`,
      );
    }
  }

  await supabase.storage.from("profile-photos").remove([photo.storage_path]);
  await supabase.from("profile_photos").delete().eq("id", photo.id);

  // Rebouche le trou dans les positions (0..n-1 sans lacune) pour que la
  // prochaine photo ajoutee prenne bien la derniere place, pas une position
  // deja utilisee.
  const { data: restantes } = await supabase
    .from("profile_photos")
    .select("id")
    .eq("profile_id", user.id)
    .order("position", { ascending: true });

  if (restantes) {
    await Promise.all(
      restantes.map((p, i) =>
        supabase.from("profile_photos").update({ position: i }).eq("id", p.id),
      ),
    );
  }

  revalidatePath("/profil/photos");
  revalidatePath("/profil");
}

export async function definirPhotoPrincipale(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/connexion");
  }

  const photoId = String(formData.get("photoId") ?? "");

  const { data: profil } = await supabase
    .from("profiles")
    .select("photo_verified")
    .eq("id", user.id)
    .maybeSingle();

  if (profil?.photo_verified) {
    redirect(
      `/profil/photos?erreur=${encodeURIComponent("Ta photo principale est verifiee et ne peut pas etre changee.")}`,
    );
  }

  const { data: photos } = await supabase
    .from("profile_photos")
    .select("id")
    .eq("profile_id", user.id)
    .order("position", { ascending: true });

  if (!photos) {
    redirect("/profil/photos");
  }

  const reste = photos.filter((p) => p.id !== photoId);
  const nouvelOrdre = [photoId, ...reste.map((p) => p.id)];

  await Promise.all(
    nouvelOrdre.map((id, i) =>
      supabase
        .from("profile_photos")
        .update({ position: i })
        .eq("id", id)
        .eq("profile_id", user.id),
    ),
  );

  revalidatePath("/profil/photos");
  revalidatePath("/profil");
}
