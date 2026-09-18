import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { enregistrerPrompts } from "@/lib/prompt-actions";
import { BoutonAccueil } from "@/components/BoutonAccueil";
import { EnTeteLogo } from "@/components/EnTeteLogo";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { getLocale } from "@/lib/i18n/locale";
import { getDictionary } from "@/lib/i18n/dictionary";

type MonPrompt = { pos: number; prompt_key: string; reponse: string };

export default async function PromptsPage({
  searchParams,
}: PageProps<"/profil/prompts">) {
  const { erreur } = await searchParams;
  const locale = await getLocale();
  const d = getDictionary(locale);

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/connexion");
  }

  const { data } = await supabase.rpc("mes_prompts");
  const mesPrompts = (data ?? []) as MonPrompt[];

  const options = Object.entries(d.prompts.options);

  return (
    <div className="page-bg flex flex-1 flex-col overflow-y-auto">
      <div className="relative flex h-7 box-content shrink-0 items-center justify-end gap-2 px-6 pt-4">
        <EnTeteLogo />
        <BoutonAccueil />
        <LanguageSwitcher locale={locale} />
      </div>
      <div className="flex flex-1 justify-center px-6 pb-12 pt-4">
      <div className="card-warm w-full max-w-sm p-8">
        <Link href="/profil" className="link-warm text-sm">
          {d.nav.monProfil}
        </Link>
        <h1 className="font-display mt-4 text-3xl text-brand">
          {d.prompts.titre}
        </h1>
        <p className="mt-2 text-foreground/70">{d.prompts.sousTitre}</p>

        {erreur && (
          <p className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
            {erreur}
          </p>
        )}

        <form action={enregistrerPrompts} className="mt-6 flex flex-col gap-6">
          {[0, 1, 2].map((position) => {
            const existant = mesPrompts.find((p) => p.pos === position);
            return (
              <div key={position} className="flex flex-col gap-2">
                <label className="text-sm font-medium">
                  {d.prompts.question(position + 1)}
                </label>
                <select
                  name={`promptKey${position}`}
                  defaultValue={existant?.prompt_key ?? ""}
                  className="field-warm"
                >
                  <option value="">{d.prompts.aucune}</option>
                  {options.map(([key, texte]) => (
                    <option key={key} value={key}>
                      {texte}
                    </option>
                  ))}
                </select>
                <input
                  type="text"
                  name={`reponse${position}`}
                  defaultValue={existant?.reponse ?? ""}
                  placeholder={d.prompts.reponsePlaceholder}
                  maxLength={200}
                  className="field-warm"
                />
              </div>
            );
          })}
          <button type="submit" className="btn-primary-warm">
            {d.prompts.enregistrer}
          </button>
        </form>
      </div>
      </div>
    </div>
  );
}
