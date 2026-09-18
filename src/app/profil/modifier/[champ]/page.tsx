import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { mettreAJourChamp } from "@/lib/profile-actions";
import { getLocale } from "@/lib/i18n/locale";
import { getDictionary } from "@/lib/i18n/dictionary";
import { BoutonAccueil } from "@/components/BoutonAccueil";
import { EnTeteLogo } from "@/components/EnTeteLogo";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";

const CHAMPS_VALIDES = [
  "displayName",
  "birthDate",
  "gender",
  "lookingFor",
  "city",
  "bio",
] as const;
type Champ = (typeof CHAMPS_VALIDES)[number];

const COLONNE_PAR_CHAMP: Record<Champ, string> = {
  displayName: "display_name",
  birthDate: "birth_date",
  gender: "gender",
  lookingFor: "looking_for",
  city: "city",
  bio: "bio",
};

export default async function ModifierChampPage({
  params,
  searchParams,
}: PageProps<"/profil/modifier/[champ]">) {
  const { champ } = await params;
  const { erreur } = await searchParams;
  const locale = await getLocale();
  const d = getDictionary(locale);

  if (!CHAMPS_VALIDES.includes(champ as Champ)) {
    notFound();
  }
  const champType = champ as Champ;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/connexion");
  }

  const { data: profil } = await supabase
    .from("profiles")
    .select(COLONNE_PAR_CHAMP[champType])
    .eq("id", user.id)
    .maybeSingle<Record<string, string>>();

  if (!profil) {
    redirect("/profil/completer");
  }

  const valeurActuelle = profil[COLONNE_PAR_CHAMP[champType]] ?? "";

  return (
    <div className="page-bg min-h-dvh">
      <div className="relative flex h-7 box-content items-center justify-end gap-2 px-4 pt-4 sm:px-6">
        <EnTeteLogo />
        <BoutonAccueil />
        <LanguageSwitcher locale={locale} />
      </div>
      <div className="px-4 pb-8 sm:px-6">
      <div className="mx-auto flex w-full max-w-lg flex-col gap-6">
        <div>
          <Link href="/profil/modifier" className="link-warm text-sm">
            {d.profilModifier.annuler}
          </Link>
          <h1 className="font-display mt-2 text-3xl text-foreground">
            {d.profilModifier.champs[champType]}
          </h1>
        </div>

        {erreur && (
          <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{erreur}</p>
        )}

        <form action={mettreAJourChamp} className="card-warm flex flex-col gap-4 p-6">
          <input type="hidden" name="champ" value={champType} />
          <ChampInput champ={champType} valeurActuelle={valeurActuelle} d={d} />
          <button type="submit" className="btn-primary-warm mt-2">
            {d.profilModifier.enregistrer}
          </button>
        </form>
      </div>
      </div>
    </div>
  );
}

function ChampInput({
  champ,
  valeurActuelle,
  d,
}: {
  champ: Champ;
  valeurActuelle: string;
  d: ReturnType<typeof getDictionary>;
}) {
  switch (champ) {
    case "displayName":
      return (
        <input
          name="valeur"
          type="text"
          required
          defaultValue={valeurActuelle}
          className="field-warm"
          autoFocus
        />
      );
    case "birthDate":
      return (
        <input
          name="valeur"
          type="date"
          required
          defaultValue={valeurActuelle}
          className="field-warm"
        />
      );
    case "gender":
      return (
        <select name="valeur" required defaultValue={valeurActuelle} className="field-warm">
          <option value="homme">{d.profilCompleter.unHomme}</option>
          <option value="femme">{d.profilCompleter.uneFemme}</option>
          <option value="autre">{d.profilCompleter.autre}</option>
        </select>
      );
    case "lookingFor":
      return (
        <select name="valeur" required defaultValue={valeurActuelle} className="field-warm">
          <option value="homme">{d.profilCompleter.desHommes}</option>
          <option value="femme">{d.profilCompleter.desFemmes}</option>
          <option value="tous">{d.profilCompleter.toutLeMonde}</option>
        </select>
      );
    case "city":
      return (
        <input
          name="valeur"
          type="text"
          required
          defaultValue={valeurActuelle}
          placeholder={d.profilCompleter.villePlaceholder}
          className="field-warm"
          autoFocus
        />
      );
    case "bio":
      return (
        <textarea
          name="valeur"
          rows={4}
          maxLength={280}
          defaultValue={valeurActuelle}
          placeholder={d.profilCompleter.bioPlaceholder}
          className="field-warm"
          autoFocus
        />
      );
  }
}
