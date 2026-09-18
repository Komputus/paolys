"use client";

import { useState } from "react";
import { activerBoost, definirModeDiscret } from "@/lib/premium-actions";
import { getDictionary, localeVersDateFnsTag, type Locale } from "@/lib/i18n/dictionary";

// Cote d'Ivoire = UTC+0 toute l'annee, donc comparer les dates calendaires
// en UTC revient a comparer les journees locales — pas de fuseau horaire a
// gerer ici.
function memeJourUTC(a: Date, b: Date) {
  return a.toISOString().slice(0, 10) === b.toISOString().slice(0, 10);
}

function prochainRenouvellement() {
  const demain = new Date();
  demain.setUTCDate(demain.getUTCDate() + 1);
  demain.setUTCHours(0, 0, 0, 0);
  return demain;
}

export function PremiumControls({
  boostedUntil,
  boostLastUsedAt,
  hiddenFromDiscovery,
  locale,
}: {
  boostedUntil: string | null;
  boostLastUsedAt: string | null;
  hiddenFromDiscovery: boolean;
  locale: Locale;
}) {
  const d = getDictionary(locale);
  const [boost, setBoost] = useState(boostedUntil);
  const [dernierBoost, setDernierBoost] = useState(boostLastUsedAt);
  const [discret, setDiscret] = useState(hiddenFromDiscovery);
  const [enCours, setEnCours] = useState(false);
  const [erreur, setErreur] = useState<string | null>(null);

  const boostActif = boost && new Date(boost) > new Date();
  const dejaUtiliseAujourdhui =
    !boostActif && dernierBoost && memeJourUTC(new Date(dernierBoost), new Date());

  async function booster() {
    setEnCours(true);
    setErreur(null);
    try {
      const { boostedUntil: nouveau } = await activerBoost();
      setBoost(nouveau);
      setDernierBoost(new Date().toISOString());
    } catch (e) {
      setErreur(e instanceof Error ? e.message : String(e));
    } finally {
      setEnCours(false);
    }
  }

  async function toggleDiscret() {
    const nouveauEtat = !discret;
    setEnCours(true);
    try {
      const formData = new FormData();
      formData.set("actif", String(nouveauEtat));
      await definirModeDiscret(formData);
      setDiscret(nouveauEtat);
    } finally {
      setEnCours(false);
    }
  }

  return (
    <div className="mt-4 flex flex-col gap-2 text-sm">
      <button
        onClick={booster}
        disabled={enCours || Boolean(boostActif) || Boolean(dejaUtiliseAujourdhui)}
        className="rounded-full border border-brand/30 px-4 py-2 font-medium text-brand transition-colors hover:bg-brand/10 disabled:opacity-50"
      >
        {boostActif
          ? d.premiumControls.boostActif(
              new Date(boost!).toLocaleTimeString(localeVersDateFnsTag(locale), {
                hour: "2-digit",
                minute: "2-digit",
              }),
            )
          : dejaUtiliseAujourdhui
            ? d.premiumControls.prochainBoost(
                prochainRenouvellement().toLocaleTimeString(localeVersDateFnsTag(locale), {
                  hour: "2-digit",
                  minute: "2-digit",
                }),
              )
            : d.premiumControls.boosterProfil}
      </button>
      {erreur && <p className="text-center text-xs text-red-600">{erreur}</p>}
      <label className="flex items-center justify-center gap-2 text-foreground/70">
        <input
          type="checkbox"
          checked={discret}
          disabled={enCours}
          onChange={toggleDiscret}
        />
        {d.premiumControls.modeDiscret}
      </label>
    </div>
  );
}
