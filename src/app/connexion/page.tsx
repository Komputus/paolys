import Link from "next/link";
import { signIn } from "@/lib/auth-actions";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { BoutonAccueil } from "@/components/BoutonAccueil";
import { EnTeteLogo } from "@/components/EnTeteLogo";
import { Footer } from "@/components/Footer";
import { BoutonGoogle } from "@/components/BoutonGoogle";
import { getLocale } from "@/lib/i18n/locale";
import { getDictionary } from "@/lib/i18n/dictionary";

export default async function ConnexionPage({
  searchParams,
}: PageProps<"/connexion">) {
  const { erreur } = await searchParams;
  const locale = await getLocale();
  const d = getDictionary(locale);

  return (
    <div className="page-bg flex flex-1 flex-col overflow-y-auto">
      <div className="relative flex h-7 box-content shrink-0 items-center justify-end gap-2 px-6 pt-4">
        <EnTeteLogo />
        <BoutonAccueil />
        <LanguageSwitcher locale={locale} />
      </div>
      <div className="flex flex-col items-center px-6 pb-8">
      <div className="card-warm mt-10 w-full max-w-sm p-8">
        <h1 className="font-display text-3xl text-brand">
          {d.auth.connexionTitre}
        </h1>
        <p className="mt-2 text-foreground/70">{d.auth.connexionSousTitre}</p>

        {erreur && (
          <p className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
            {erreur}
          </p>
        )}

        <form action={signIn} className="mt-6 flex flex-col gap-4">
          <div>
            <label htmlFor="email" className="text-sm font-medium">
              {d.auth.email}
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              className="field-warm mt-1"
            />
          </div>
          <div>
            <div className="flex items-center justify-between">
              <label htmlFor="password" className="text-sm font-medium">
                {d.auth.motDePasse}
              </label>
              <Link href="/connexion/mot-de-passe-oublie" className="link-warm text-xs">
                {d.auth.motDePasseOublie}
              </Link>
            </div>
            <input
              id="password"
              name="password"
              type="password"
              required
              className="field-warm mt-1"
            />
          </div>
          <button type="submit" className="btn-primary-warm mt-2">
            {d.auth.seConnecter}
          </button>
        </form>

        <div className="mt-5 flex items-center gap-3">
          <div className="h-px flex-1" style={{ background: "var(--line)" }} />
          <span className="text-caption text-ink-muted">{d.auth.ou}</span>
          <div className="h-px flex-1" style={{ background: "var(--line)" }} />
        </div>

        <BoutonGoogle locale={locale} className="mt-5" />

        <p className="mt-6 text-sm text-foreground/70">
          {d.auth.pasDeCompte}{" "}
          <Link href="/inscription" className="link-warm">
            {d.auth.sInscrire}
          </Link>
        </p>
      </div>
      </div>
      <Footer locale={locale} />
    </div>
  );
}
