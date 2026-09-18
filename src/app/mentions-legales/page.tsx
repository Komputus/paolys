import Link from "next/link";
import { BoutonAccueil } from "@/components/BoutonAccueil";
import { EnTeteLogo } from "@/components/EnTeteLogo";
import { Footer } from "@/components/Footer";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { getLocale } from "@/lib/i18n/locale";
import { getDictionary } from "@/lib/i18n/dictionary";

// ⚠️ A completer par Manno avant mise en ligne definitive : identite legale
// exacte de l'editeur (nom, statut juridique, adresse, numero
// d'immatriculation si applicable). Impossible pour moi de deviner ces
// informations — les mentions legales sont une obligation reelle, pas du
// contenu decoratif.
export default async function MentionsLegalesPage() {
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
        <h1 className="font-display mt-4 text-3xl text-brand">{d.mentionsLegales.titre}</h1>

        <div className="mt-6 flex flex-col gap-5 text-foreground/80">
          <section>
            <h2 className="text-heading text-foreground">{d.mentionsLegales.editeurTitre}</h2>
            <p className="mt-2 rounded-lg bg-brand-light px-4 py-3 text-sm text-brand-dark">
              {d.mentionsLegales.editeurAvertissement}
            </p>
          </section>

          <section>
            <h2 className="text-heading text-foreground">{d.mentionsLegales.hebergementTitre}</h2>
            <p className="mt-2">{d.mentionsLegales.hebergementTexte}</p>
          </section>

          <section>
            <h2 className="text-heading text-foreground">{d.mentionsLegales.proprieteTitre}</h2>
            <p className="mt-2">{d.mentionsLegales.proprieteTexte}</p>
          </section>

          <section>
            <h2 className="text-heading text-foreground">{d.mentionsLegales.contactTitre}</h2>
            <p className="mt-2">
              {d.mentionsLegales.contactTexte}{" "}
              <Link href="/contact" className="link-warm">
                {d.mentionsLegales.contactLien}
              </Link>
              .
            </p>
          </section>
        </div>
      </div>
      <Footer locale={locale} />
    </div>
  );
}
