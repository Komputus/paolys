const TYPES_AUTORISES = new Set(["image/jpeg", "image/png", "image/webp"]);
const TAILLE_MAX_OCTETS = 8 * 1024 * 1024; // 8 Mo

export type ResultatValidationImage = { ok: true } | { ok: false; raison: string };

// Rejette explicitement les SVG (peuvent contenir du script — risque de XSS
// stocké) et tout type non listé, ainsi que les fichiers trop volumineux.
// Le type declare par le navigateur (photo.type) n'est qu'un indice, jamais
// une garantie — mais valider au moins ca ferme la porte la plus evidente.
export function validerImage(fichier: File): ResultatValidationImage {
  if (!TYPES_AUTORISES.has(fichier.type)) {
    return {
      ok: false,
      raison: "Format d'image non supporté (JPEG, PNG ou WebP uniquement).",
    };
  }

  if (fichier.size > TAILLE_MAX_OCTETS) {
    return { ok: false, raison: "Image trop volumineuse (8 Mo maximum)." };
  }

  return { ok: true };
}
