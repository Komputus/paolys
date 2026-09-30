import sharp from "sharp";

// Reencode systematiquement en JPEG, quel que soit le format d'origine —
// garde le stockage previsible (1 seule extension geree) et evite qu'un
// utilisateur avec un appareil photo recent (photos de 10-15 Mo en PNG/HEIC
// converti) fasse exploser le quota Supabase gratuit. Sans ca, une galerie
// de 3 photos par profil peut peser 3x plus que l'unique photo d'avant.
const LARGEUR_MAX = 1080;
const QUALITE_JPEG = 78;

export async function compresserImage(fichier: File): Promise<Buffer> {
  const arrayBuffer = await fichier.arrayBuffer();
  return sharp(Buffer.from(arrayBuffer))
    .rotate() // applique l'orientation EXIF puis la retire (evite les photos pivotees)
    .resize({ width: LARGEUR_MAX, height: LARGEUR_MAX, fit: "inside", withoutEnlargement: true })
    .jpeg({ quality: QUALITE_JPEG })
    .toBuffer();
}
