"use client";

import { useState } from "react";
import { getDictionary, type Locale } from "@/lib/i18n/dictionary";

export function LocalisationInput({ locale }: { locale: Locale }) {
  const d = getDictionary(locale);
  const [statut, setStatut] = useState<"inactif" | "en_cours" | "ok" | "erreur">(
    "inactif",
  );
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);

  function localiser() {
    if (!navigator.geolocation) {
      setStatut("erreur");
      return;
    }
    setStatut("en_cours");
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setCoords({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
        setStatut("ok");
      },
      () => setStatut("erreur"),
    );
  }

  return (
    <div>
      <input type="hidden" name="lat" value={coords?.lat ?? ""} />
      <input type="hidden" name="lng" value={coords?.lng ?? ""} />
      <button
        type="button"
        onClick={localiser}
        className="btn-secondary-warm w-full text-sm"
      >
        {statut === "ok"
          ? d.localisation.positionEnregistree
          : statut === "en_cours"
            ? d.localisation.enCours
            : d.localisation.utiliserPosition}
      </button>
      {statut === "erreur" && (
        <p className="mt-1 text-xs text-red-600">{d.localisation.erreur}</p>
      )}
      <p className="mt-1 text-xs text-foreground/50">{d.localisation.aide}</p>
    </div>
  );
}
