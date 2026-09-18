import Link from "next/link";

// Petit lien-symbole de retour a l'accueil ("/"), utilise sur les pages qui
// n'ont pas deja un lien de navigation equivalent (ex. "← Mon profil").
// Meme gabarit (padding, taille de police) que les boutons FR/EN du
// LanguageSwitcher, pour s'aligner proprement a cote d'eux.
export function BoutonAccueil() {
  return (
    <Link
      href="/"
      aria-label="Accueil"
      className="flex items-center justify-center rounded-full px-2 py-1 text-foreground/70 transition-colors hover:bg-black/5"
    >
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
        <path
          d="M4 11.5L12 4l8 7.5"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M6.5 10v9a1 1 0 0 0 1 1H16.5a1 1 0 0 0 1-1v-9"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </Link>
  );
}
