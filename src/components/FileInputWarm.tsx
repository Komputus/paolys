"use client";

import { useId, useState } from "react";
import { getDictionary, type Locale } from "@/lib/i18n/dictionary";

export function FileInputWarm({
  name,
  accept,
  required,
  locale,
}: {
  name: string;
  accept?: string;
  required?: boolean;
  locale: Locale;
}) {
  const d = getDictionary(locale);
  const id = useId();
  const [nomFichier, setNomFichier] = useState<string | null>(null);

  return (
    <div>
      <input
        id={id}
        name={name}
        type="file"
        accept={accept}
        required={required}
        onChange={(e) => setNomFichier(e.target.files?.[0]?.name ?? null)}
        className="peer sr-only"
      />
      <label
        htmlFor={id}
        className="btn-secondary-warm w-full cursor-pointer truncate text-sm peer-focus-visible:ring-2 peer-focus-visible:ring-brand"
      >
        {nomFichier ?? d.fileInput.choisirFichier}
      </label>
    </div>
  );
}
