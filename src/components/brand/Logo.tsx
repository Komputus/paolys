import Image from "next/image";
import { Wordmark } from "./Wordmark";

// Lockup officiel (project/README.md > "Le logo") : la marque seule, sans
// cadre ni tuile, posée directement à côté du logotype. La tuile pleine
// (paolys-icon-*-tile.svg) est réservée aux formats qui l'imposent
// techniquement (icône d'app, favicon) — jamais ici.
export function Logo({ size = "md" }: { size?: "md" | "lg" }) {
  const markSize = size === "lg" ? 48 : 32;

  return (
    <div className="inline-flex items-center gap-2">
      <Image
        src="/brand/paolys-mark-transparent.svg"
        alt=""
        width={markSize}
        height={markSize}
        aria-hidden
      />
      <Wordmark size={size === "lg" ? "lg" : "md"} />
    </div>
  );
}
