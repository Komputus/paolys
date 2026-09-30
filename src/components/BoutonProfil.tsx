import Link from "next/link";

// Acces rapide au compte depuis n'importe quelle page, apres les boutons de
// langue : vers le profil (et la deconnexion, disponible sur cette page) si
// connecte, vers la connexion sinon (qui propose elle-meme la creation de
// compte). Toujours present, seule la destination change.
export function BoutonProfil({ connecte }: { connecte: boolean }) {
  return (
    <Link
      href={connecte ? "/profil" : "/connexion"}
      aria-label={connecte ? "Mon profil" : "Connexion"}
      className="flex items-center justify-center rounded-full px-2 py-1 text-foreground/70 transition-colors hover:bg-black/5"
    >
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="8" r="3.5" stroke="currentColor" strokeWidth="2" />
        <path
          d="M4.5 20c1.2-3.5 4-5.5 7.5-5.5s6.3 2 7.5 5.5"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>
    </Link>
  );
}
