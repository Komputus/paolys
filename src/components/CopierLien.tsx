"use client";

import { useState } from "react";
import { getDictionary, type Locale } from "@/lib/i18n/dictionary";

export function CopierLien({ texte, locale }: { texte: string; locale: Locale }) {
  const d = getDictionary(locale);
  const [copie, setCopie] = useState(false);

  async function copier() {
    await navigator.clipboard.writeText(texte);
    setCopie(true);
    setTimeout(() => setCopie(false), 2000);
  }

  return (
    <div className="mt-2 flex items-center gap-2">
      <p className="flex-1 truncate rounded-lg bg-brand-light px-3 py-2 text-xs text-foreground/70">
        {texte}
      </p>
      <button
        onClick={copier}
        className="shrink-0 rounded-full border border-brand/30 px-3 py-2 text-xs font-medium text-brand hover:bg-brand-light"
      >
        {copie ? d.commun.copie : d.commun.copier}
      </button>
    </div>
  );
}
