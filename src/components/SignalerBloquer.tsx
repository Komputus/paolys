"use client";

import { useState } from "react";
import { bloquerUtilisateur, signalerUtilisateur } from "@/lib/moderation-actions";
import { getDictionary, type Locale } from "@/lib/i18n/dictionary";

export function SignalerBloquer({
  cibleId,
  cibleNom,
  onBloque,
  locale,
}: {
  cibleId: string;
  cibleNom: string;
  onBloque: () => void;
  locale: Locale;
}) {
  const d = getDictionary(locale);
  const [formulaireOuvert, setFormulaireOuvert] = useState(false);
  const [raison, setRaison] = useState("");
  const [enCours, setEnCours] = useState(false);

  async function bloquer() {
    if (!confirm(d.moderation.confirmerBlocage(cibleNom))) {
      return;
    }
    setEnCours(true);
    try {
      await bloquerUtilisateur(cibleId);
      onBloque();
    } finally {
      setEnCours(false);
    }
  }

  async function envoyerSignalement() {
    if (!raison.trim() || enCours) return;
    setEnCours(true);
    try {
      await signalerUtilisateur(cibleId, raison);
      setFormulaireOuvert(false);
      setRaison("");
      alert(d.moderation.signalementEnvoye);
    } finally {
      setEnCours(false);
    }
  }

  return (
    <div className="text-xs text-foreground/50">
      <div className="flex justify-center gap-2">
        <button onClick={() => setFormulaireOuvert((v) => !v)} className="btn-tertiary-warm">
          {d.conversation.signaler}
        </button>
        <button onClick={bloquer} disabled={enCours} className="btn-tertiary-warm">
          {d.conversation.bloquer}
        </button>
      </div>
      {formulaireOuvert && (
        <div className="mt-2 flex flex-col gap-2">
          <textarea
            value={raison}
            onChange={(e) => setRaison(e.target.value)}
            rows={2}
            placeholder={d.moderation.raisonPlaceholder}
            className="field-warm text-sm"
          />
          <button
            onClick={envoyerSignalement}
            disabled={enCours || !raison.trim()}
            className="btn-secondary-warm text-sm disabled:opacity-50"
          >
            {d.moderation.envoyerSignalement}
          </button>
        </div>
      )}
    </div>
  );
}
