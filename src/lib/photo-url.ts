import type { createClient } from "@/lib/supabase/server";

type SupabaseServerClient = Awaited<ReturnType<typeof createClient>>;

export const MAX_PHOTOS_PAR_PROFIL = 3;

// Source de verite : la table profile_photos (colonne "position", 0 = photo
// principale), jamais un listing brut du bucket — c'est aussi ce qui permet
// de supprimer une photo precise et de choisir laquelle est mise en avant.
export async function urlsPhotosSignees(
  supabase: SupabaseServerClient,
  profileId: string,
  limite = MAX_PHOTOS_PAR_PROFIL,
  expirationSecondes = 3600,
) {
  const { data: photos } = await supabase
    .from("profile_photos")
    .select("storage_path")
    .eq("profile_id", profileId)
    .order("position", { ascending: true })
    .limit(limite);

  if (!photos?.length) {
    return [];
  }

  const urls = await Promise.all(
    photos.map(async (photo) => {
      const { data } = await supabase.storage
        .from("profile-photos")
        .createSignedUrl(photo.storage_path, expirationSecondes);
      return data?.signedUrl ?? null;
    }),
  );

  return urls.filter((url): url is string => url !== null);
}

export async function urlPhotoSignee(
  supabase: SupabaseServerClient,
  profileId: string,
  expirationSecondes = 3600,
) {
  const urls = await urlsPhotosSignees(supabase, profileId, 1, expirationSecondes);
  return urls[0] ?? null;
}
