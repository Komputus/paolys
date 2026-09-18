"use client";

import { useState } from "react";
import { traiterVerification } from "@/lib/verification-actions";
import { getDictionary, type Locale } from "@/lib/i18n/dictionary";

export type Demande = {
  id: string;
  profile_id: string;
  display_name: string;
  selfieUrl: string | null;
  photoUrl: string | null;
};

export function AdminVerificationsClient({
  demandesInitiales,
  locale,
}: {
  demandesInitiales: Demande[];
  locale: Locale;
}) {
  const d = getDictionary(locale);
  const [demandes, setDemandes] = useState(demandesInitiales);
  const [enCours, setEnCours] = useState<string | null>(null);

  async function decider(id: string, decision: "approved" | "rejected") {
    setEnCours(id);
    try {
      await traiterVerification(id, decision);
      setDemandes((prec) => prec.filter((d) => d.id !== id));
    } finally {
      setEnCours(null);
    }
  }

  if (demandes.length === 0) {
    return <p className="mt-6 text-foreground/70">{d.adminVerifications.aucune}</p>;
  }

  return (
    <ul className="mt-6 flex flex-col gap-6">
      {demandes.map((demande) => (
        <li
          key={demande.id}
          className="flex flex-col gap-4 rounded-xl border border-black/10 p-4 sm:flex-row sm:items-center"
        >
          <div className="flex gap-4">
            <div className="text-center">
              <p className="mb-1 text-xs text-foreground/50">
                {d.adminVerifications.selfie}
              </p>
              <div className="h-32 w-32 overflow-hidden rounded-xl bg-black/5">
                {demande.selfieUrl && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={demande.selfieUrl}
                    alt={d.adminVerifications.selfie}
                    draggable={false}
                    onContextMenu={(e) => e.preventDefault()}
                    className="h-full w-full select-none object-cover"
                  />
                )}
              </div>
            </div>
            <div className="text-center">
              <p className="mb-1 text-xs text-foreground/50">
                {d.adminVerifications.photoProfil}
              </p>
              <div className="h-32 w-32 overflow-hidden rounded-xl bg-black/5">
                {demande.photoUrl && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={demande.photoUrl}
                    alt={d.adminVerifications.photoProfil}
                    draggable={false}
                    onContextMenu={(e) => e.preventDefault()}
                    className="h-full w-full select-none object-cover"
                  />
                )}
              </div>
            </div>
          </div>

          <div className="flex flex-1 flex-col gap-2">
            <p className="font-medium">{demande.display_name}</p>
            <div className="flex gap-2">
              <button
                onClick={() => decider(demande.id, "approved")}
                disabled={enCours === demande.id}
                className="rounded-full bg-brand px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-dark disabled:opacity-50"
              >
                {d.adminVerifications.approuver}
              </button>
              <button
                onClick={() => decider(demande.id, "rejected")}
                disabled={enCours === demande.id}
                className="rounded-full border border-black/10 px-5 py-2 text-sm font-medium transition-colors hover:bg-black/5 disabled:opacity-50"
              >
                {d.adminVerifications.rejeter}
              </button>
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
}
