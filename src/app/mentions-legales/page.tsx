import Link from "next/link";
import { BoutonAccueil } from "@/components/BoutonAccueil";
import { EnTeteLogo } from "@/components/EnTeteLogo";
import { Footer } from "@/components/Footer";
import { getLocale } from "@/lib/i18n/locale";

// ⚠️ A completer par Manno avant mise en ligne definitive : identite legale
// exacte de l'editeur (nom, statut juridique, adresse, numero
// d'immatriculation si applicable). Impossible pour moi de deviner ces
// informations — les mentions legales sont une obligation reelle, pas du
// contenu decoratif.
export default async function MentionsLegalesPage() {
  const locale = await getLocale();
  return (
    <div className="page-bg flex flex-1 flex-col overflow-y-auto">
      <div className="relative flex h-7 box-content shrink-0 items-center justify-end gap-2 px-6 pt-4">
        <EnTeteLogo />
        <BoutonAccueil />
      </div>
      <div className="mx-auto w-full max-w-2xl px-6 pb-16 pt-4">
        <Link href="/" className="link-warm text-sm">
          ← Accueil
        </Link>
        <h1 className="font-display mt-4 text-3xl text-brand">Mentions légales</h1>

        <div className="mt-6 flex flex-col gap-5 text-foreground/80">
          <section>
            <h2 className="text-heading text-foreground">Éditeur du site</h2>
            <p className="mt-2 rounded-lg bg-brand-light px-4 py-3 text-sm text-brand-dark">
              ⚠️ À compléter : nom de l&apos;entité ou de l&apos;auto-entrepreneur exploitant
              Paolys, forme juridique, adresse du siège, numéro d&apos;immatriculation
              (RCCM) si applicable, et coordonnées de contact du responsable de la
              publication.
            </p>
          </section>

          <section>
            <h2 className="text-heading text-foreground">Hébergement</h2>
            <p className="mt-2">
              L&apos;application est hébergée par <strong>Vercel Inc.</strong> (440 N Barranca
              Ave #4133, Covina, CA 91723, États-Unis) et sa base de données par{" "}
              <strong>Supabase Inc.</strong>
            </p>
          </section>

          <section>
            <h2 className="text-heading text-foreground">Propriété intellectuelle</h2>
            <p className="mt-2">
              Le nom « Paolys », son logo et son identité visuelle sont la propriété de
              l&apos;éditeur. Toute reproduction sans autorisation est interdite.
            </p>
          </section>

          <section>
            <h2 className="text-heading text-foreground">Contact</h2>
            <p className="mt-2">
              Pour toute question, consulte la page{" "}
              <Link href="/contact" className="link-warm">
                Contact
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
