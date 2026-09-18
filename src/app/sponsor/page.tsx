import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { calculerAge } from "@/lib/age";
import { SponsorClient, type ProfilSponsor } from "@/components/SponsorClient";
import { getLocale } from "@/lib/i18n/locale";
import { getDictionary } from "@/lib/i18n/dictionary";
import { BoutonAccueil } from "@/components/BoutonAccueil";
import { EnTeteLogo } from "@/components/EnTeteLogo";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";

type ProfilBrut = {
  id: string;
  display_name: string;
  birth_date: string;
  bio: string | null;
  city: string | null;
};

type Autorisation = {
  beneficiaire_id: string;
  voir_profil: boolean;
  voir_photo: boolean;
  voir_contact: boolean;
};

export default async function SponsorPage() {
  const locale = await getLocale();
  const d = getDictionary(locale);

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/connexion");
  }

  if (user.app_metadata?.role !== "sponsor") {
    redirect("/profil");
  }

  const { data: profilsData, error: erreurProfils } = await supabase.rpc(
    "profils_pour_sponsor",
    { limite: 30 },
  );

  if (erreurProfils) {
    throw new Error(erreurProfils.message);
  }

  const { data: autorisationsData, error: erreurAutorisations } =
    await supabase.rpc("mes_autorisations_sponsor", {});

  if (erreurAutorisations) {
    throw new Error(erreurAutorisations.message);
  }

  const autorisationsParId = new Map(
    ((autorisationsData ?? []) as Autorisation[]).map((a) => [
      a.beneficiaire_id,
      a,
    ]),
  );

  const profils: ProfilSponsor[] = ((profilsData ?? []) as ProfilBrut[]).map(
    (p) => {
      const a = autorisationsParId.get(p.id);
      return {
        id: p.id,
        display_name: p.display_name,
        age: calculerAge(p.birth_date),
        bio: p.bio,
        city: p.city,
        voirProfil: a?.voir_profil ?? false,
        voirPhoto: a?.voir_photo ?? false,
        voirContact: a?.voir_contact ?? false,
      };
    },
  );

  const { data: contact } = await supabase
    .from("profile_contacts")
    .select("phone")
    .eq("profile_id", user.id)
    .maybeSingle();

  return (
    <div className="page-bg flex flex-1 flex-col">
      <div className="relative flex h-7 box-content items-center justify-end gap-2 px-6 pt-6">
        <EnTeteLogo />
        <BoutonAccueil />
        <LanguageSwitcher locale={locale} />
      </div>
      <div className="flex flex-1 flex-col px-6 pb-12">
      <div className="mx-auto flex w-full max-w-2xl flex-col">
        <Link href="/profil" className="link-warm text-sm">
          {d.nav.monProfil}
        </Link>
        <h1 className="mt-4 text-2xl font-semibold text-brand">{d.sponsor.titre}</h1>
        <p className="mt-2 text-foreground/70">{d.sponsor.texte}</p>

        <div className="mt-6">
          <SponsorClient
            profils={profils}
            telephoneActuel={contact?.phone ?? ""}
            locale={locale}
          />
        </div>
      </div>
      </div>
    </div>
  );
}
