import type { createClient } from "@/lib/supabase/server";

type SupabaseServerClient = Awaited<ReturnType<typeof createClient>>;

// Le bucket "profile-photos" est privé : chaque affichage nécessite un lien
// signé temporaire (pas d'URL publique permanente et partageable).
export async function urlPhotoSignee(
  supabase: SupabaseServerClient,
  profileId: string,
  expirationSecondes = 3600,
) {
  const { data: photos } = await supabase.storage
    .from("profile-photos")
    .list(profileId, { limit: 1, sortBy: { column: "created_at", order: "desc" } });

  if (!photos?.[0]) {
    return null;
  }

  const { data } = await supabase.storage
    .from("profile-photos")
    .createSignedUrl(`${profileId}/${photos[0].name}`, expirationSecondes);

  return data?.signedUrl ?? null;
}

// Variante multi-photos : la table profile_photos et le bucket supportent
// deja plusieurs photos par profil (colonne "position"), meme si l'upload
// actuel (profil/completer) n'en cree qu'une seule pour l'instant — cette
// fonction est prete a en afficher plusieurs des qu'un profil en a.
export async function urlsPhotosSignees(
  supabase: SupabaseServerClient,
  profileId: string,
  limite = 6,
  expirationSecondes = 3600,
) {
  const { data: photos } = await supabase.storage
    .from("profile-photos")
    .list(profileId, { limit: limite, sortBy: { column: "created_at", order: "asc" } });

  if (!photos?.length) {
    return [];
  }

  const urls = await Promise.all(
    photos.map(async (photo) => {
      const { data } = await supabase.storage
        .from("profile-photos")
        .createSignedUrl(`${profileId}/${photo.name}`, expirationSecondes);
      return data?.signedUrl ?? null;
    }),
  );

  return urls.filter((url): url is string => url !== null);
}
