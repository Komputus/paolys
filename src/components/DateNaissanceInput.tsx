"use client";

import { useRef, useState } from "react";

// Trois champs jour/mois/annee saisissables au clavier plutot qu'un
// <input type="date"> : le calendrier natif oblige a cliquer en arriere
// des dizaines de fois pour atteindre une annee de naissance (ex. 1990),
// ce qui etait le principal point de friction remonte sur l'inscription.
export function DateNaissanceInput({
  name,
  defaultValue,
}: {
  name: string;
  defaultValue?: string;
}) {
  const [annee0, mois0, jour0] = defaultValue ? defaultValue.split("-") : ["", "", ""];
  const [jour, setJour] = useState(jour0 ?? "");
  const [mois, setMois] = useState(mois0 ?? "");
  const [annee, setAnnee] = useState(annee0 ?? "");

  const refMois = useRef<HTMLInputElement>(null);
  const refAnnee = useRef<HTMLInputElement>(null);

  const valeur =
    jour.length === 2 && mois.length === 2 && annee.length === 4
      ? `${annee}-${mois}-${jour}`
      : "";

  return (
    <div className="flex gap-2">
      <input type="hidden" name={name} value={valeur} />
      <input
        type="text"
        inputMode="numeric"
        placeholder="JJ"
        maxLength={2}
        required
        value={jour}
        onChange={(e) => {
          const v = e.target.value.replace(/\D/g, "").slice(0, 2);
          setJour(v);
          if (v.length === 2) refMois.current?.focus();
        }}
        aria-label="Jour"
        className="field-warm w-16 text-center"
      />
      <input
        ref={refMois}
        type="text"
        inputMode="numeric"
        placeholder="MM"
        maxLength={2}
        required
        value={mois}
        onChange={(e) => {
          const v = e.target.value.replace(/\D/g, "").slice(0, 2);
          setMois(v);
          if (v.length === 2) refAnnee.current?.focus();
        }}
        aria-label="Mois"
        className="field-warm w-16 text-center"
      />
      <input
        ref={refAnnee}
        type="text"
        inputMode="numeric"
        placeholder="AAAA"
        maxLength={4}
        required
        value={annee}
        onChange={(e) => setAnnee(e.target.value.replace(/\D/g, "").slice(0, 4))}
        aria-label="Année"
        className="field-warm w-20 text-center"
      />
    </div>
  );
}
