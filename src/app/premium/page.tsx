import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { demarrerAbonnement } from "@/lib/payment-actions";
import { FORMULES } from "@/lib/premium-pricing";
import { getLocale } from "@/lib/i18n/locale";
import { getDictionary, localeVersDateFnsTag } from "@/lib/i18n/dictionary";
import { Wordmark } from "@/components/brand/Wordmark";
import { BoutonAccueil } from "@/components/BoutonAccueil";
import { EnTeteLogo } from "@/components/EnTeteLogo";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";

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

  return (
    <div className="page-bg flex flex-1 flex-col overflow-y-auto">
      <div className="relative flex h-7 box-content shrink-0 items-center justify-end gap-2 px-6 pt-4">
        <EnTeteLogo />
        <BoutonAccueil />
        <LanguageSwitcher locale={locale} />
      </div>
      <div className="flex flex-1 justify-center px-6 pb-12 pt-4">
      <div className="card-warm w-full max-w-sm p-8">
        <Link href="/profil" className="link-warm text-sm">
          {d.nav.monProfil}
        </Link>
        <span className="mt-4 block text-sm font-medium tracking-[0.3em] text-gold uppercase">
          {d.premium.edition}
        </span>
        <h1 className="flex items-baseline gap-1">
          <Wordmark size="md" />
          <span className="text-display-md text-mangue">+</span>
        </h1>
        <p className="mt-2 text-foreground/70">{d.premium.texteIntro}</p>

        <ul className="mt-6 flex flex-col gap-3">
          {d.premium.avantages.map((a) => (
            <li key={a} className="flex gap-3 text-foreground/80">
              <span className="bg-mangue flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-xs text-white">
                ✓
              </span>
              <span>{a}</span>
            </li>
          ))}
        </ul>

        {erreur && (
          <p className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
            {erreur}
          </p>
        )}

        {estPremium ? (
          <p
            className="mt-8 rounded-lg px-4 py-3 text-center text-sm font-medium"
            style={{ background: "var(--lagune-tint)", color: "var(--lagune)" }}
          >
            {d.premium.abonnementActif(
              new Date(profil!.premium_until!).toLocaleDateString(
                localeVersDateFnsTag(locale),
              ),
            )}
          </p>
        ) : (
          <div className="mt-8 flex flex-col gap-3">
            <form action={demarrerAbonnement.bind(null, "mois")}>
              <button
                type="submit"
                className="btn-primary-warm w-full whitespace-nowrap text-sm"
                style={{ padding: "0.75rem 0.5rem" }}
              >
                {d.premium.abonnerMois(FORMULES.mois.montantFcfa)}
              </button>
            </form>
            <form action={demarrerAbonnement.bind(null, "semaine")}>
              <button
                type="submit"
                className="btn-secondary-warm w-full whitespace-nowrap text-sm"
                style={{ padding: "0.75rem 0.5rem" }}
              >
                {d.premium.abonnerSemaine(FORMULES.semaine.montantFcfa)}
              </button>
            </form>
            <p className="text-center text-xs text-foreground/50">
              {d.premium.paiementSecurise}
            </p>
          </div>
        )}
      </div>
      </div>
    </div>
  );
}
