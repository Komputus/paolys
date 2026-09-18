import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getLocale } from "@/lib/i18n/locale";
import { getDictionary, localeVersDateFnsTag } from "@/lib/i18n/dictionary";
import { Wordmark } from "@/components/brand/Wordmark";
import { BoutonAccueil } from "@/components/BoutonAccueil";
import { EnTeteLogo } from "@/components/EnTeteLogo";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { Footer } from "@/components/Footer";
import { PremiumCheckout } from "@/components/PremiumCheckout";

const ICONES_FONCTIONNALITES = [
  IconOeil,
  IconEtincelle,
  IconFusee,
  IconRetourArriere,
  IconOeilBarre,
  IconFiltre,
];

export default async function PremiumPage({
  searchParams,
}: PageProps<"/premium">) {
  const { erreur } = await searchParams;
  const locale = await getLocale();
  const d = getDictionary(locale);

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Page publique (accessible sans compte, pour servir de vitrine marketing) —
  // seul le clic sur "S'abonner" exige une connexion (demarrerAbonnement le
  // verifie et redirige vers /connexion si besoin).
  const { data: profil } = user
    ? await supabase
        .from("profiles")
        .select("premium_until")
        .eq("id", user.id)
        .maybeSingle()
    : { data: null };

  const estPremium = Boolean(
    profil?.premium_until && new Date(profil.premium_until) > new Date(),
  );

  return (
    <div className="page-bg flex flex-1 flex-col overflow-y-auto">
      <div className="relative flex h-7 box-content shrink-0 items-center justify-end gap-2 px-6 pt-4">
        <EnTeteLogo />
        <BoutonAccueil />
        <LanguageSwitcher locale={locale} />
      </div>

      <div className="mx-auto w-full max-w-md px-6 pb-16 pt-4">
        <Link href={user ? "/profil" : "/"} className="link-warm text-sm">
          {user ? d.nav.monProfil : d.nav.accueil}
        </Link>

        {/* En-tete */}
        <div className="card-warm mt-4 p-8 text-center">
          <span className="block text-sm font-medium tracking-[0.3em] text-gold uppercase">
            {d.premium.edition}
          </span>
          <h1 className="mt-2 flex items-baseline justify-center gap-1">
            <Wordmark size="md" />
            <span className="text-display-md text-mangue">+</span>
          </h1>
          <p className="mt-2 text-foreground/70">{d.premium.texteIntro}</p>
        </div>

        {erreur && (
          <p className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
            {erreur}
          </p>
        )}

        {/* 6 fonctionnalites, une par une avec icone */}
        <div className="card-warm mt-4 p-6">
          <p className="text-heading text-foreground">{d.premium.fonctionnalitesTitre}</p>
          <ul className="mt-4 flex flex-col gap-4">
            {d.premium.fonctionnalites.map((f, i) => {
              const Icone = ICONES_FONCTIONNALITES[i];
              return (
                <li key={f.titre} className="flex gap-3">
                  <span
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full"
                    style={{ background: "var(--mangue-tint)" }}
                  >
                    <Icone />
                  </span>
                  <span>
                    <p className="text-sm font-bold text-foreground">{f.titre}</p>
                    <p className="text-sm text-foreground/70">{f.texte}</p>
                  </span>
                </li>
              );
            })}
          </ul>
        </div>

        {/* Rappel : ce qui reste gratuit */}
        <div
          className="card-warm mt-4 p-6"
          style={{ border: "1px solid var(--lagune)", background: "var(--lagune-tint)" }}
        >
          <p className="text-heading" style={{ color: "var(--lagune)" }}>
            {d.premium.gratuitTitre}
          </p>
          <p className="mt-1 text-sm" style={{ color: "var(--ink)" }}>
            {d.premium.gratuitTexte}
          </p>
          <ul className="mt-3 flex flex-col gap-1.5">
            {d.premium.gratuitItems.map((item) => (
              <li key={item} className="flex items-center gap-2 text-sm" style={{ color: "var(--ink)" }}>
                <IconCoche />
                {item}
              </li>
            ))}
          </ul>
        </div>

        {/* Formule + moyen de paiement */}
        <div className="card-warm mt-4 p-6">
          {estPremium ? (
            <p
              className="rounded-lg px-4 py-3 text-center text-sm font-medium"
              style={{ background: "var(--lagune-tint)", color: "var(--lagune)" }}
            >
              {d.premium.abonnementActif(
                new Date(profil!.premium_until!).toLocaleDateString(
                  localeVersDateFnsTag(locale),
                ),
              )}
            </p>
          ) : (
            <PremiumCheckout locale={locale} />
          )}
        </div>
      </div>
      <Footer locale={locale} />
    </div>
  );
}

function IconOeil() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z" stroke="var(--mangue-dark)" strokeWidth="2" strokeLinejoin="round" />
      <circle cx="12" cy="12" r="3" stroke="var(--mangue-dark)" strokeWidth="2" />
    </svg>
  );
}

function IconEtincelle() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="var(--mangue-dark)">
      <path d="M12 2l2.4 7.6L22 12l-7.6 2.4L12 22l-2.4-7.6L2 12l7.6-2.4L12 2z" />
    </svg>
  );
}

function IconFusee() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path
        d="M12 2c3 2 5 6 5 10 0 2-.5 4-1.5 5.5L12 21l-3.5-3.5C7.5 16 7 14 7 12c0-4 2-8 5-10z"
        stroke="var(--mangue-dark)"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="10" r="2" stroke="var(--mangue-dark)" strokeWidth="2" />
      <path d="M9 18l-2 3M15 18l2 3" stroke="var(--mangue-dark)" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function IconRetourArriere() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path d="M4 12a8 8 0 1 0 3-6.3" stroke="var(--mangue-dark)" strokeWidth="2" strokeLinecap="round" />
      <path d="M4 3v5h5" stroke="var(--mangue-dark)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IconOeilBarre() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z" stroke="var(--mangue-dark)" strokeWidth="2" strokeLinejoin="round" />
      <circle cx="12" cy="12" r="3" stroke="var(--mangue-dark)" strokeWidth="2" />
      <path d="M3 21L21 3" stroke="var(--mangue-dark)" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function IconFiltre() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path d="M4 5h16M7 12h10M10 19h4" stroke="var(--mangue-dark)" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function IconCoche() {
  return (
    <span
      className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full text-[10px] text-white"
      style={{ background: "var(--lagune)" }}
    >
      ✓
    </span>
  );
}
