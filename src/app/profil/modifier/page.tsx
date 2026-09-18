import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getLocale } from "@/lib/i18n/locale";
import { getDictionary } from "@/lib/i18n/dictionary";
import { BottomNav } from "@/components/BottomNav";
import { BoutonAccueil } from "@/components/BoutonAccueil";
import { EnTeteLogo } from "@/components/EnTeteLogo";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";

export default async function ModifierProfilPage() {
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
    .select("display_name, birth_date, gender, looking_for, city, bio, photo_verified")
    .eq("id", user.id)
    .maybeSingle();

  if (!profil) {
    redirect("/profil/completer");
  }

  const { data: derniereDemande } = await supabase
    .from("photo_verifications")
    .select("status")
    .eq("profile_id", user.id)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  const { data: compteLikesData } = await supabase.rpc("combien_m_ont_aime");
  const compteLikes = (compteLikesData as number | null) ?? 0;

  const valeurGenre: Record<string, string> = {
    homme: d.profilCompleter.unHomme,
    femme: d.profilCompleter.uneFemme,
    autre: d.profilCompleter.autre,
  };
  const valeurRecherche: Record<string, string> = {
    homme: d.profilCompleter.desHommes,
    femme: d.profilCompleter.desFemmes,
    tous: d.profilCompleter.toutLeMonde,
  };

  const lignes: { champ: string; label: string; valeur: string; icone: React.ReactNode }[] = [
    {
      champ: "displayName",
      label: d.profilModifier.champs.displayName,
      valeur: profil.display_name || d.profilModifier.nonRenseigne,
      icone: <IconPersonne />,
    },
    {
      champ: "birthDate",
      label: d.profilModifier.champs.birthDate,
      valeur: profil.birth_date
        ? new Date(profil.birth_date).toLocaleDateString(
            locale === "fr" ? "fr-FR" : "en-US",
          )
        : d.profilModifier.nonRenseigne,
      icone: <IconCalendrier />,
    },
    {
      champ: "gender",
      label: d.profilModifier.champs.gender,
      valeur: valeurGenre[profil.gender] ?? d.profilModifier.nonRenseigne,
      icone: <IconCoeur />,
    },
    {
      champ: "lookingFor",
      label: d.profilModifier.champs.lookingFor,
      valeur: valeurRecherche[profil.looking_for] ?? d.profilModifier.nonRenseigne,
      icone: <IconLoupe />,
    },
    {
      champ: "city",
      label: d.profilModifier.champs.city,
      valeur: profil.city || d.profilModifier.nonRenseigne,
      icone: <IconLieu />,
    },
    {
      champ: "bio",
      label: d.profilModifier.champs.bio,
      valeur: profil.bio || d.profilModifier.nonRenseigne,
      icone: <IconTexte />,
    },
  ];

  return (
    <div className="page-bg flex h-dvh flex-col overflow-hidden">
      <div className="relative flex h-7 box-content shrink-0 items-center justify-end gap-2 px-4 pt-4 sm:px-6">
        <EnTeteLogo />
        <BoutonAccueil />
        <LanguageSwitcher locale={locale} />
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-8 sm:px-6">
      <div className="mx-auto flex w-full max-w-lg flex-col gap-6">
        <div>
          <Link href="/profil" className="link-warm text-sm">
            {d.nav.monProfil}
          </Link>
          <h1 className="font-display mt-2 text-3xl text-foreground">
            {d.profilModifier.titre}
          </h1>
        </div>

        {/* Bloc de confiance : la vérification n'est pas un réglage secondaire,
            elle porte la couleur lagune et un CTA plein largeur. */}
        <div
          className="card-warm p-5"
          style={{ border: "1px solid var(--lagune)", background: "var(--lagune-tint)" }}
        >
          <div className="flex items-center gap-3">
            <span
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full"
              style={{ background: "var(--lagune)" }}
            >
              <IconBouclier />
            </span>
            <div>
              <p className="text-heading" style={{ color: "var(--lagune)" }}>
                {d.profilModifier.verificationTitre}
              </p>
              {profil.photo_verified ? (
                <p className="text-body" style={{ color: "var(--lagune)" }}>
                  {d.profilModifier.verificationFait}
                </p>
              ) : derniereDemande?.status === "pending" ? (
                <p className="text-body" style={{ color: "var(--lagune)" }}>
                  {d.profilModifier.verificationEnCours}
                </p>
              ) : (
                <p className="text-body" style={{ color: "var(--ink)" }}>
                  {d.profilModifier.verificationTexteAFaire}
                </p>
              )}
            </div>
          </div>

          {!profil.photo_verified && derniereDemande?.status !== "pending" && (
            <Link
              href="/profil/verification"
              className="mt-4 block w-full rounded-full py-3 text-center text-button text-white"
              style={{ background: "var(--lagune)" }}
            >
              {derniereDemande?.status === "rejected"
                ? d.profilModifier.verificationRefusee
                : d.profilModifier.verificationCta}
            </Link>
          )}
        </div>

        <div className="card-warm divide-y" style={{ borderColor: "var(--line)" }}>
          {lignes.map((ligne) => (
            <Link
              key={ligne.champ}
              href={`/profil/modifier/${ligne.champ}`}
              className="flex items-center gap-3 px-5 py-4 transition-colors hover:bg-black/[0.02]"
              style={{ borderColor: "var(--line)" }}
            >
              <span
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full"
                style={{ background: "var(--mangue-tint)", color: "var(--mangue-dark)" }}
              >
                {ligne.icone}
              </span>
              <span className="min-w-0 flex-1">
                <span className="text-caption block" style={{ color: "var(--ink-muted)" }}>
                  {ligne.label}
                </span>
                <span className="text-body-lg block truncate text-foreground">
                  {ligne.valeur}
                </span>
              </span>
              <IconChevron />
            </Link>
          ))}
        </div>
      </div>
      </div>
      <BottomNav locale={locale} compteLikes={compteLikes} />
    </div>
  );
}

function IconChevron() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" style={{ color: "var(--ink-muted)" }}>
      <path d="M9 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IconBouclier() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <path
        d="M12 3l7 3v5c0 5-3 8.5-7 10-4-1.5-7-5-7-10V6l7-3z"
        fill="white"
      />
      <path d="M9 12l2 2 4-4" stroke="var(--lagune)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IconPersonne() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="8" r="3.5" stroke="currentColor" strokeWidth="2" />
      <path d="M4.5 20c1.2-3.5 4-5.5 7.5-5.5s6.3 2 7.5 5.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function IconCalendrier() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <rect x="4" y="5" width="16" height="15" rx="2" stroke="currentColor" strokeWidth="2" />
      <path d="M4 9h16M8 3v4M16 3v4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function IconCoeur() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path
        d="M12 20.5l-1.3-1.2C5.7 14.9 3 12.4 3 9.3 3 6.8 5 4.8 7.5 4.8c1.4 0 2.8.7 3.6 1.7.9-1 2.2-1.7 3.6-1.7C17.2 4.8 19 6.8 19 9.3c0 3.1-2.7 5.6-7.7 10l-1.3 1.2z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconLoupe() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <circle cx="11" cy="11" r="6.5" stroke="currentColor" strokeWidth="2" />
      <path d="M20 20l-4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function IconLieu() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path
        d="M12 21s-7-5.5-7-11a7 7 0 0 1 14 0c0 5.5-7 11-7 11z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="10" r="2.5" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}

function IconTexte() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path d="M4 6h16M4 12h16M4 18h10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}
