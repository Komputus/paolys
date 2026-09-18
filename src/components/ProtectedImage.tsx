"use client";

import Image, { type ImageProps } from "next/image";

// Freine la copie occasionnelle (clic droit "Enregistrer l'image", glisser-
// déposer) — n'empêche PAS une capture d'écran ou les outils développeur,
// aucune technique web ne le peut réellement.
export function ProtectedImage(props: ImageProps) {
  return (
    <Image
      {...props}
      draggable={false}
      onContextMenu={(e) => e.preventDefault()}
      style={{ ...props.style, userSelect: "none", WebkitUserSelect: "none" }}
    />
  );
}
