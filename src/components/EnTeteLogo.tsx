import Link from "next/link";
import { Wordmark } from "@/components/brand/Wordmark";

// Identite du site (marque + mot-symbole "paolys"), centree sur la ligne
// d'en-tete a cote des boutons Accueil/langue — presente sur toutes les pages,
// pas seulement l'accueil. Cliquable vers "/" (comme le logo de la plupart
// des sites), en plus du bouton Accueil dedie.
export function EnTeteLogo() {
  return (
    <Link
      href="/"
      aria-label="Accueil"
      className="absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 items-center gap-1.5"
    >
      <svg width="19" height="19" viewBox="0 0 200 200" aria-hidden="true">
        <circle cx="78" cy="98" r="52" fill="var(--azur)" />
        <circle cx="130" cy="134" r="37" fill="var(--rose)" />
        <circle cx="148" cy="62" r="16" fill="var(--mangue)" />
      </svg>
      <Wordmark size="nav" />
    </Link>
  );
}
