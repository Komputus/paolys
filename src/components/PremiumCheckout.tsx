"use client";

import { useState } from "react";
import { demarrerAbonnement } from "@/lib/payment-actions";
import { FORMULES, type Formule } from "@/lib/premium-pricing";
import { getDictionary, type Locale } from "@/lib/i18n/dictionary";

type Canal = "mobile_money" | "carte";

export function PremiumCheckout({ locale }: { locale: Locale }) {
  const d = getDictionary(locale);
  const [formule, setFormule] = useState<Formule>("mois");
  const [canal, setCanal] = useState<Canal>("mobile_money");

  return (
    <form action={demarrerAbonnement} className="flex flex-col gap-5">
      <input type="hidden" name="formule" value={formule} />
      <input type="hidden" name="canal" value={canal} />

      <div>
        <p className="text-heading text-foreground">{d.premium.formuleTitre}</p>
        <div className="mt-3 grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setFormule("semaine")}
            className="rounded-xl border p-4 text-left transition-colors"
            style={{
              borderColor: formule === "semaine" ? "var(--mangue)" : "var(--line)",
              background: formule === "semaine" ? "var(--mangue-tint)" : "var(--surface-200)",
              borderWidth: formule === "semaine" ? "2px" : "1px",
            }}
          >
            <p className="text-sm font-bold text-foreground">{d.premium.formuleSemaineNom}</p>
            <p className="mt-1 text-lg font-extrabold text-brand-dark">
              {FORMULES.semaine.montantFcfa} FCFA
            </p>
            <p className="text-xs text-foreground/60">{d.premium.parSemaine}</p>
          </button>

          <button
            type="button"
            onClick={() => setFormule("mois")}
            className="relative rounded-xl border p-4 text-left transition-colors"
            style={{
              borderColor: formule === "mois" ? "var(--mangue)" : "var(--line)",
              background: formule === "mois" ? "var(--mangue-tint)" : "var(--surface-200)",
              borderWidth: formule === "mois" ? "2px" : "1px",
            }}
          >
            <span
              className="absolute -top-2.5 right-3 rounded-full px-2 py-0.5 text-[10px] font-bold text-white"
              style={{ background: "var(--mangue)" }}
            >
              {d.premium.badgePopulaire}
            </span>
            <p className="text-sm font-bold text-foreground">{d.premium.formuleMoisNom}</p>
            <p className="mt-1 text-lg font-extrabold text-brand-dark">
              {FORMULES.mois.montantFcfa} FCFA
            </p>
            <p className="text-xs text-foreground/60">{d.premium.parMois}</p>
          </button>
        </div>
      </div>

      <div>
        <p className="text-heading text-foreground">{d.premium.moyenPaiementTitre}</p>
        <div className="mt-3 flex flex-col gap-2">
          <button
            type="button"
            onClick={() => setCanal("mobile_money")}
            className="flex items-center gap-3 rounded-xl border p-3 text-left transition-colors"
            style={{
              borderColor: canal === "mobile_money" ? "var(--lagune)" : "var(--line)",
              background: canal === "mobile_money" ? "var(--lagune-tint)" : "var(--surface-200)",
              borderWidth: canal === "mobile_money" ? "2px" : "1px",
            }}
          >
            <span
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full"
              style={{ background: "var(--lagune)" }}
            >
              <IconTelephone />
            </span>
            <span>
              <p className="text-sm font-bold text-foreground">{d.premium.mobileMoney}</p>
              <p className="text-xs text-foreground/60">{d.premium.mobileMoneyDetail}</p>
            </span>
          </button>

          <button
            type="button"
            onClick={() => setCanal("carte")}
            className="flex items-center gap-3 rounded-xl border p-3 text-left transition-colors"
            style={{
              borderColor: canal === "carte" ? "var(--lagune)" : "var(--line)",
              background: canal === "carte" ? "var(--lagune-tint)" : "var(--surface-200)",
              borderWidth: canal === "carte" ? "2px" : "1px",
            }}
          >
            <span
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full"
              style={{ background: "var(--ink-muted)" }}
            >
              <IconCarte />
            </span>
            <span>
              <p className="text-sm font-bold text-foreground">{d.premium.carteBancaire}</p>
              <p className="text-xs text-foreground/60">{d.premium.carteBancaireDetail}</p>
            </span>
          </button>
        </div>
      </div>

      <button type="submit" className="btn-primary-warm w-full">
        {d.premium.sAbonner(FORMULES[formule].montantFcfa)}
      </button>

      <p className="flex items-center justify-center gap-1.5 text-center text-xs" style={{ color: "var(--lagune)" }}>
        <IconCadenas />
        {d.premium.paiementSecurise}
      </p>
    </form>
  );
}

function IconTelephone() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <rect x="7" y="2" width="10" height="20" rx="2" stroke="white" strokeWidth="2" />
      <path d="M11 18h2" stroke="white" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function IconCarte() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <rect x="2" y="5" width="20" height="14" rx="2" stroke="white" strokeWidth="2" />
      <path d="M2 10h20" stroke="white" strokeWidth="2" />
    </svg>
  );
}

function IconCadenas() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
      <rect x="5" y="11" width="14" height="9" rx="2" stroke="var(--lagune)" strokeWidth="2" />
      <path d="M8 11V8a4 4 0 0 1 8 0v3" stroke="var(--lagune)" strokeWidth="2" />
    </svg>
  );
}
