import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { calculerAge } from "@/lib/age";
import { urlPhotoSignee } from "@/lib/photo-url";
import { ProtectedImage } from "@/components/ProtectedImage";
import { getLocale } from "@/lib/i18n/locale";
import { getDictionary } from "@/lib/i18n/dictionary";
import { BottomNav } from "@/components/BottomNav";
import { BoutonAccueil } from "@/components/BoutonAccueil";
import { EnTeteLogo } from "@/components/EnTeteLogo";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";

type ProfilAime = {
  id: string;
  display_name: string;
  birth_date: string;
  bio: string | null;
  city: string | null;
};

export default async function AimesParPage() {
  const locale = await getLocale();
  const d = getDictionary(locale);

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/connexion");
  }

  const { data: profil } = await supabase
    .from("profiles")
    .select("premium_until")
    .eq("id", user.id)
    .maybeSingle();

  const estPremium = Boolean(
    profil?.premium_until && new Date(profil.premium_until) > new Date(),
  );

  const { data: compteData } = await supabase.rpc("combien_m_ont_aime");
  const compte = (compteData as number | null) ?? 0;

  if (!estPremium) {
    return (
      <div className="page-bg flex h-dvh flex-col overflow-hidden">
        <div className="relative flex h-7 box-content shrink-0 items-center justify-end gap-2 px-6 pt-4">
          <EnTeteLogo />
        <BoutonAccueil />
          <LanguageSwitcher locale={locale} />
        </div>
        <div className="flex min-h-0 flex-1 flex-col items-center overflow-y-auto px-6 pb-12 pt-4 text-center">
          <Link href="/profil" className="link-warm self-start text-sm">
            {d.nav.monProfil}
          </Link>
          <h1 className="font-display mt-8 text-3xl text-mangue">
            {compte > 0 ? d.aimesPar.titreAvecCompte(compte) : d.aimesPar.titreSansCompte}
          </h1>
          <p className="mt-4 max-w-sm text-foreground/70">{d.aimesPar.texteIncitation}</p>
          <Link href="/premium" className="btn-primary-warm mt-8">
            {d.aimesPar.decouvrirPremium}
          </Link>
        </div>
        <BottomNav locale={locale} compteLikes={compte} />
      </div>
    );
  }

  const { data, error } = await supabase.rpc("qui_m_a_aime", {});

  if (error) {
    throw new Error(error.message);
  }

  const profils = (data ?? []) as ProfilAime[];

  const avecPhoto = await Promise.all(
    profils.map(async (p) => {
      const photoUrl = await urlPhotoSignee(supabase, p.id);
      return { ...p, photoUrl };
    }),
  );

  return (
    <div className="page-bg flex h-dvh flex-col overflow-hidden">
      <div className="relative flex h-7 box-content shrink-0 items-center justify-end gap-2 px-6 pt-4">
        <EnTeteLogo />
        <BoutonAccueil />
        <LanguageSwitcher locale={locale} />
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto px-6 pb-12 pt-4">
      <Link href="/profil" className="link-warm text-sm">
        {d.nav.monProfil}
      </Link>
      <h1 className="font-display mt-4 text-3xl text-brand">
        {d.aimesPar.titre}
      </h1>

      {avecPhoto.length === 0 ? (
        <p className="mt-6 text-foreground/70">{d.aimesPar.rien}</p>
      ) : (
        <ul className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3">
          {avecPhoto.map((p) => (
            <li
              key={p.id}
              className="card-warm flex flex-col items-center gap-2 p-3 text-center"
            >
              <div className="h-24 w-24 overflow-hidden rounded-full bg-black/5">
                {p.photoUrl && (
                  <ProtectedImage
                    src={p.photoUrl}
                    alt={p.display_name}
                    width={96}
                    height={96}
                    className="h-full w-full object-cover"
                  />
                )}
              </div>
              <p className="font-medium">
                {p.display_name}, {calculerAge(p.birth_date)}
              </p>
              {p.city && <p className="text-sm text-foreground/60">{p.city}</p>}
            </li>
          ))}
        </ul>
      )}

      <Link href="/decouverte" className="btn-primary-warm mt-8 self-center">
        {d.aimesPar.allerDecouverte}
      </Link>
      </div>
      <BottomNav locale={locale} compteLikes={compte} />
    </div>
  );
}
