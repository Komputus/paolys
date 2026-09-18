import Link from "next/link";
import { demanderReinitialisation } from "@/lib/auth-actions";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { BoutonAccueil } from "@/components/BoutonAccueil";
import { EnTeteLogo } from "@/components/EnTeteLogo";
import { getLocale } from "@/lib/i18n/locale";
import { getDictionary } from "@/lib/i18n/dictionary";

export default async function MotDePasseOubliePage({
  searchParams,
}: {
  searchParams: Promise<{ envoye?: string }>;
}) {
  const { envoye } = await searchParams;
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
          {envoye === "1" ? (
            <>
              <h1 className="font-display text-3xl text-brand">
                {d.motDePasseOublie.emailEnvoyeTitre}
              </h1>
              <p className="mt-2 text-foreground/70">
                {d.motDePasseOublie.emailEnvoyeTexte}
              </p>
            </>
          ) : (
            <>
              <h1 className="font-display text-3xl text-brand">
                {d.motDePasseOublie.titre}
              </h1>
              <p className="mt-2 text-foreground/70">{d.motDePasseOublie.texte}</p>

              <form action={demanderReinitialisation} className="mt-6 flex flex-col gap-4">
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
                <button type="submit" className="btn-primary-warm mt-2">
                  {d.motDePasseOublie.envoyer}
                </button>
              </form>
            </>
          )}

          <p className="mt-6 text-sm text-foreground/70">
            <Link href="/connexion" className="link-warm">
              {d.motDePasseOublie.retourConnexion}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
