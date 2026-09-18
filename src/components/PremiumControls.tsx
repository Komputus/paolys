"use client";

import { useState } from "react";
import { activerBoost, definirModeDiscret } from "@/lib/premium-actions";
import { getDictionary, localeVersDateFnsTag, type Locale } from "@/lib/i18n/dictionary";

export function PremiumControls({
  boostedUntil,
  hiddenFromDiscovery,
  locale,
}: {
  boostedUntil: string | null;
  hiddenFromDiscovery: boolean;
  locale: Locale;
}) {
  const d = getDictionary(locale);
  const [boost, setBoost] = useState(boostedUntil);
  const [discret, setDiscret] = useState(hiddenFromDiscovery);
  const [enCours, setEnCours] = useState(false);

  const boostActif = boost && new Date(boost) > new Date();

  async function booster() {
    setEnCours(true);
    try {
      const { boostedUntil: nouveau } = await activerBoost();
      setBoost(nouveau);
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
        disabled={enCours || Boolean(boostActif)}
        className="rounded-full border border-brand/30 px-4 py-2 font-medium text-brand transition-colors hover:bg-brand/10 disabled:opacity-50"
      >
        {boostActif
          ? d.premiumControls.boostActif(
              new Date(boost!).toLocaleTimeString(localeVersDateFnsTag(locale), {
                hour: "2-digit",
                minute: "2-digit",
              }),
            )
          : d.premiumControls.boosterProfil}
      </button>
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
