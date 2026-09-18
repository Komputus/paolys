"use client";

import { useState } from "react";
import {
  definirAutorisationSponsor,
  definirTelephoneSponsor,
} from "@/lib/sponsor-actions";
import { getDictionary, type Locale } from "@/lib/i18n/dictionary";

export type ProfilSponsor = {
  id: string;
  display_name: string;
  age: number;
  bio: string | null;
  city: string | null;
  voirProfil: boolean;
  voirPhoto: boolean;
  voirContact: boolean;
};

export function SponsorClient({
  profils,
  telephoneActuel,
  locale,
}: {
  profils: ProfilSponsor[];
  telephoneActuel: string;
  locale: Locale;
}) {
  const d = getDictionary(locale);
  const [etats, setEtats] = useState<Record<string, ProfilSponsor>>(
    Object.fromEntries(profils.map((p) => [p.id, p])),
  );
  const [enCours, setEnCours] = useState<string | null>(null);

  async function basculer(
    id: string,
    champ: "voirProfil" | "voirPhoto" | "voirContact",
  ) {
    const actuel = etats[id];
    const nouveau = { ...actuel, [champ]: !actuel[champ] };
    setEtats((prec) => ({ ...prec, [id]: nouveau }));
    setEnCours(id);
    try {
      await definirAutorisationSponsor(id, {
        voirProfil: nouveau.voirProfil,
        voirPhoto: nouveau.voirPhoto,
        voirContact: nouveau.voirContact,
      });
    } finally {
      setEnCours(null);
    }
  }

  return (
    <div>
      <form
        action={definirTelephoneSponsor}
        className="mb-8 flex flex-wrap items-end gap-3 rounded-xl border border-black/10 p-4"
      >
        <div>
          <label className="text-xs text-foreground/60">{d.sponsor.numeroLabel}</label>
          <input
            type="tel"
            name="phone"
            defaultValue={telephoneActuel}
            placeholder={d.sponsor.numeroPlaceholder}
            className="mt-1 rounded-lg border border-black/10 px-3 py-2 text-sm"
          />
        </div>
        <button
          type="submit"
          className="rounded-full bg-brand px-4 py-2 text-sm font-medium text-white"
        >
          {d.sponsor.enregistrer}
        </button>
      </form>

      <ul className="flex flex-col gap-3">
        {profils.map((p) => {
          const etat = etats[p.id];
          return (
            <li key={p.id} className="rounded-xl border border-black/10 p-4">
              <p className="font-medium">
                {p.display_name}, {p.age}
              </p>
              {p.city && <p className="text-sm text-foreground/60">{p.city}</p>}
              {p.bio && <p className="mt-1 text-sm text-foreground/80">{p.bio}</p>}

              <div className="mt-3 flex flex-wrap gap-4 text-sm">
                <label className="flex items-center gap-1.5">
                  <input
                    type="checkbox"
                    checked={etat.voirProfil}
                    disabled={enCours === p.id}
                    onChange={() => basculer(p.id, "voirProfil")}
                  />
                  {d.sponsor.voirProfil}
                </label>
                <label className="flex items-center gap-1.5">
                  <input
                    type="checkbox"
                    checked={etat.voirPhoto}
                    disabled={enCours === p.id || !etat.voirProfil}
                    onChange={() => basculer(p.id, "voirPhoto")}
                  />
                  {d.sponsor.voirPhoto}
                </label>
                <label className="flex items-center gap-1.5">
                  <input
                    type="checkbox"
                    checked={etat.voirContact}
                    disabled={enCours === p.id || !etat.voirProfil}
                    onChange={() => basculer(p.id, "voirContact")}
                  />
                  {d.sponsor.voirContact}
                </label>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
