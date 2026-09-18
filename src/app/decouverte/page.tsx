import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { calculerAge } from "@/lib/age";
import { urlsPhotosSignees } from "@/lib/photo-url";
import { DecouverteClient, type Candidat } from "@/components/DecouverteClient";
import { getLocale } from "@/lib/i18n/locale";
import { getDictionary } from "@/lib/i18n/dictionary";

type ProfilADecouvrir = {
  id: string;
  display_name: string;
  birth_date: string;
  bio: string | null;
  city: string | null;
  gender: string;
  photo_verified: boolean;
  prompts: { prompt_key: string; reponse: string }[] | null;
};

export default async function DecouvertePage({
  searchParams,
}: PageProps<"/decouverte">) {
  const params = await searchParams;
  const ageMin = typeof params.ageMin === "string" ? params.ageMin : undefined;
  const ageMax = typeof params.ageMax === "string" ? params.ageMax : undefined;
  const verifie = typeof params.verifie === "string" ? params.verifie : undefined;
  const locale = await getLocale();
  const d = getDictionary(locale);

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/connexion");
  }

  const { data: monProfil } = await supabase
    .from("profiles")
    .select("id, premium_until")
    .eq("id", user.id)
    .maybeSingle();

  if (!monProfil) {
    redirect("/profil/completer");
  }

  const estPremium = Boolean(
    monProfil.premium_until && new Date(monProfil.premium_until) > new Date(),
  );

  const { data: mesPhotos } = await supabase.storage
    .from("profile-photos")
    .list(user.id, { limit: 1 });

  const viewerAUnePhoto = (mesPhotos?.length ?? 0) > 0;

  const [{ data: profils, error }, { data: compteLikesData }] = await Promise.all([
    supabase.rpc("profils_a_decouvrir", {
      limite: 10,
      age_min: ageMin ? Number(ageMin) : null,
      age_max: ageMax ? Number(ageMax) : null,
      verifies_uniquement: verifie === "true",
    }),
    supabase.rpc("combien_m_ont_aime"),
  ]);

  if (error) {
    throw new Error(error.message);
  }

  const lignes = (profils ?? []) as ProfilADecouvrir[];
  const compteLikes = (compteLikesData as number | null) ?? 0;

  const candidats: Candidat[] = await Promise.all(
    lignes.map(async (p) => {
      const photoUrls = await urlsPhotosSignees(supabase, p.id);

      return {
        id: p.id,
        display_name: p.display_name,
        age: calculerAge(p.birth_date),
        bio: p.bio,
        city: p.city,
        verifie: p.photo_verified,
        photoUrls,
        prompts: (p.prompts ?? [])
          .filter((pr) => pr.prompt_key in d.prompts.options)
          .map((pr) => ({
            question: d.prompts.options[pr.prompt_key],
            reponse: pr.reponse,
          })),
      };
    }),
  );

  return (
    <DecouverteClient
      candidats={candidats}
      viewerAUnePhoto={viewerAUnePhoto}
      estPremium={estPremium}
      filtres={{ ageMin, ageMax, verifie: verifie === "true" }}
      locale={locale}
      compteLikes={compteLikes}
    />
  );
}
