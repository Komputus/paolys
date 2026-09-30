"use client";

import { useState } from "react";

// Bouton oeil pour afficher/masquer le mot de passe en clair — evite les
// erreurs de saisie invisibles (remonte comme point de friction a
// l'inscription).
export function ChampMotDePasse({
  id,
  name,
  required,
  minLength,
  autoComplete,
}: {
  id?: string;
  name: string;
  required?: boolean;
  minLength?: number;
  autoComplete?: string;
}) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="relative">
      <input
        id={id}
        name={name}
        type={visible ? "text" : "password"}
        required={required}
        minLength={minLength}
        autoComplete={autoComplete}
        className="field-warm mt-1 pr-10"
      />
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        aria-label={visible ? "Masquer le mot de passe" : "Afficher le mot de passe"}
        className="absolute right-2 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full text-foreground/50 transition-colors hover:bg-black/5"
      >
        {visible ? <IconOeilBarre /> : <IconOeil />}
      </button>
    </div>
  );
}

function IconOeil() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}

function IconOeilBarre() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2" />
      <path d="M3 21L21 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}
