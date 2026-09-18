import Link from "next/link";
import { Wordmark } from "@/components/brand/Wordmark";
import { getDictionary, type Locale } from "@/lib/i18n/dictionary";

// Footer commun aux pages publiques (accueil, connexion, inscription,
// premium, pages legales). Pas de reseaux sociaux pour l'instant : aucun
// compte reel n'existe encore, un lien mort serait pire qu'une absence.
export function Footer({ locale }: { locale: Locale }) {
  const d = getDictionary(locale);

  return (
    <footer
      className="border-t px-6 py-10 text-center"
      style={{ background: "var(--surface-100)", borderColor: "var(--line)" }}
    >
      <div className="mx-auto flex max-w-2xl flex-col items-center gap-4">
        <Wordmark size="sm" />
        <nav className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm">
          <Link href="/cgu" className="text-ink-muted transition-colors hover:text-brand">
            {d.footer.cgu}
          </Link>
          <Link href="/confidentialite" className="text-ink-muted transition-colors hover:text-brand">
            {d.footer.confidentialite}
          </Link>
          <Link href="/mentions-legales" className="text-ink-muted transition-colors hover:text-brand">
            {d.footer.mentionsLegales}
          </Link>
          <Link href="/contact" className="text-ink-muted transition-colors hover:text-brand">
            {d.footer.contact}
          </Link>
        </nav>
        <p className="text-caption text-ink-muted">{d.home.footerTexte}</p>
      </div>
    </footer>
  );
}
