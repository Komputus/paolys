"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { getDictionary, type Locale } from "@/lib/i18n/dictionary";

// Necessite que le provider Google soit configure cote Supabase
// (Authentication -> Providers -> Google, avec un Client ID/Secret Google
// Cloud) — sans quoi Supabase renverra une erreur "provider not enabled".
export function BoutonGoogle({ locale, className = "" }: { locale: Locale; className?: string }) {
  const d = getDictionary(locale);
  const [chargement, setChargement] = useState(false);
  const [erreur, setErreur] = useState<string | null>(null);

  async function continuerAvecGoogle() {
    setChargement(true);
    setErreur(null);
    const supabase = createClient();
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? window.location.origin;
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${siteUrl}/auth/callback` },
    });
    if (error) {
      setErreur(error.message);
      setChargement(false);
    }
  }

  return (
    <div className={className}>
      <button
        type="button"
        onClick={continuerAvecGoogle}
        disabled={chargement}
        className="btn-secondary-warm w-full gap-3"
      >
        <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
          <path
            fill="#FFC107"
            d="M43.6 20.5H42V20H24v8h11.3C33.7 32.9 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.1 8 3l5.7-5.7C34.6 6.1 29.6 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.7-.4-3.5z"
          />
          <path
            fill="#FF3D00"
            d="M6.3 14.7l6.6 4.8C14.6 15.9 18.9 13 24 13c3.1 0 5.8 1.1 8 3l5.7-5.7C34.6 6.1 29.6 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"
          />
          <path
            fill="#4CAF50"
            d="M24 44c5.5 0 10.4-1.9 14.3-5.1l-6.6-5.6C29.6 35.4 27 36 24 36c-5.3 0-9.7-3.1-11.3-7.8l-6.5 5C9.5 39.6 16.2 44 24 44z"
          />
          <path
            fill="#1976D2"
            d="M43.6 20.5H42V20H24v8h11.3c-.8 2.3-2.3 4.3-4.2 5.7l6.6 5.6C41.4 36 44 30.5 44 24c0-1.3-.1-2.7-.4-3.5z"
          />
        </svg>
        {chargement ? d.auth.chargement : d.auth.continuerAvecGoogle}
      </button>
      {erreur && <p className="mt-2 text-sm text-red-600">{erreur}</p>}
    </div>
  );
}
