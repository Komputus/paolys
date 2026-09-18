import Link from "next/link";
import { signUp } from "@/lib/auth-actions";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { BoutonAccueil } from "@/components/BoutonAccueil";
import { EnTeteLogo } from "@/components/EnTeteLogo";
import { getLocale } from "@/lib/i18n/locale";
import { getDictionary } from "@/lib/i18n/dictionary";

export default async function InscriptionPage({
  searchParams,
}: PageProps<"/inscription">) {
  const { erreur, ref } = await searchParams;
  const codeParrainage = typeof ref === "string" ? ref : "";
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
          {d.auth.inscriptionTitre}
        </h1>
        <p className="mt-2 text-foreground/70">{d.auth.inscriptionSousTitre}</p>

        {erreur && (
          <p className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
            {erreur}
          </p>
        )}

        <form action={signUp} className="mt-6 flex flex-col gap-4">
          <input type="hidden" name="ref" value={codeParrainage} />
          <div>
            <label htmlFor="displayName" className="text-sm font-medium">
              {d.auth.prenom}
            </label>
            <input
              id="displayName"
              name="displayName"
              type="text"
              required
              className="field-warm mt-1"
            />
          </div>
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
            <label htmlFor="password" className="text-sm font-medium">
              {d.auth.motDePasse}
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              minLength={6}
              className="field-warm mt-1"
            />
          </div>
          <div className="flex items-start gap-2">
            <input
              type="checkbox"
              id="accepteConditions"
              name="accepteConditions"
              required
              className="mt-0.5 h-4 w-4 shrink-0 accent-mangue"
            />
            <label htmlFor="accepteConditions" className="text-xs text-foreground/70">
              {d.auth.jaiAgeEtAccepte}{" "}
              <Link href="/cgu" target="_blank" className="link-warm">
                {d.auth.cgu}
              </Link>{" "}
              {d.auth.et}{" "}
              <Link href="/confidentialite" target="_blank" className="link-warm">
                {d.auth.politiqueConfidentialite}
              </Link>
              .
            </label>
          </div>
          <button type="submit" className="btn-primary-warm mt-2">
            {d.auth.creerMonCompte}
          </button>
        </form>

        <p className="mt-6 text-sm text-foreground/70">
          {d.auth.dejaUnCompte}{" "}
          <Link href="/connexion" className="link-warm">
            {d.auth.seConnecterLien}
          </Link>
        </p>
      </div>
      </div>
    </div>
  );
}
