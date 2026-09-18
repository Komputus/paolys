"use client";

import { usePathname } from "next/navigation";
import { definirLangue } from "@/lib/i18n/locale-actions";
import type { Locale } from "@/lib/i18n/dictionary";

export function LanguageSwitcher({ locale }: { locale: Locale }) {
  const pathname = usePathname();

  return (
    <div className="flex items-center gap-1 text-xs font-medium">
      {(["fr", "en"] as const).map((l) => (
        <form key={l} action={definirLangue}>
          <input type="hidden" name="langue" value={l} />
          <input type="hidden" name="retour" value={pathname} />
          <button
            type="submit"
            aria-current={locale === l}
            className={`rounded-full px-2.5 py-1 transition-colors ${
              locale === l
                ? "bg-brand text-white"
                : "text-foreground/50 hover:bg-black/5"
            }`}
          >
            {l.toUpperCase()}
          </button>
        </form>
      ))}
    </div>
  );
}
