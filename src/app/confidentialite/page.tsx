import Link from "next/link";
import { BoutonAccueil } from "@/components/BoutonAccueil";
import { EnTeteLogo } from "@/components/EnTeteLogo";
import { Footer } from "@/components/Footer";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { getLocale } from "@/lib/i18n/locale";
import { getDictionary } from "@/lib/i18n/dictionary";

// Contenu de base — a faire valider par un juriste avant un lancement
// officiel, notamment au regard de la loi ivoirienne sur la protection des
// donnees a caractere personnel (ARTCI) et, le cas echeant, du RGPD pour les
// utilisateurs europeens.
export default async function ConfidentialitePage() {
  const locale = await getLocale();
  const d = getDictionary(locale);
  return (
    <div className="page-bg flex flex-1 flex-col overflow-y-auto">
      <div className="relative flex h-7 box-content shrink-0 items-center justify-end gap-2 px-6 pt-4">
        <EnTeteLogo />
        <BoutonAccueil />
        <LanguageSwitcher locale={locale} />
      </div>
      <div className="mx-auto w-full max-w-2xl px-6 pb-16 pt-4">
        <Link href="/" className="link-warm text-sm">
          {d.nav.accueil}
        </Link>
        <h1 className="font-display mt-4 text-3xl text-brand">{d.confidentialite.titre}</h1>
        <p className="mt-2 text-sm text-foreground/50">{d.confidentialite.miseAJour}</p>

        <div className="mt-6 flex flex-col gap-5 text-foreground/80">
          {d.confidentialite.sections.map((section) => (
            <section key={section.titre}>
              <h2 className="text-heading text-foreground">{section.titre}</h2>
              {"texte" in section && section.texte && <p className="mt-2">{section.texte}</p>}
              {"items" in section && section.items && (
                <ul className="mt-2 list-disc space-y-1 pl-5">
                  {section.items.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              )}
              {"texteApres" in section && section.texteApres && (
                <p className="mt-2">{section.texteApres}</p>
              )}
            </section>
          ))}
        </div>
      </div>
      <Footer locale={locale} />
    </div>
  );
}
