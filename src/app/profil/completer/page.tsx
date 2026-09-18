import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { enregistrerProfil } from "@/lib/profile-actions";
import { LocalisationInput } from "@/components/LocalisationInput";
import { FileInputWarm } from "@/components/FileInputWarm";
import { BoutonAccueil } from "@/components/BoutonAccueil";
import { EnTeteLogo } from "@/components/EnTeteLogo";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { getLocale } from "@/lib/i18n/locale";
import { getDictionary } from "@/lib/i18n/dictionary";

export default async function CompleterProfilPage({
  searchParams,
}: PageProps<"/profil/completer">) {
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

  return (
    <div className="page-bg flex flex-1 flex-col overflow-y-auto">
      <div className="relative flex h-7 box-content shrink-0 items-center justify-end gap-2 px-6 pt-4">
        <EnTeteLogo />
        <BoutonAccueil />
        <LanguageSwitcher locale={locale} />
      </div>
      <div className="flex flex-col items-center px-6 pb-12">
      <div className="card-warm mt-4 w-full max-w-sm p-8">
        <h1 className="font-display text-3xl text-brand">
          {d.profilCompleter.titre}
        </h1>
        <p className="mt-2 text-foreground/70">{d.profilCompleter.sousTitre}</p>

        {erreur && (
          <p className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
            {erreur}
          </p>
        )}

        <form action={enregistrerProfil} className="mt-6 flex flex-col gap-4">
          <div>
            <label htmlFor="displayName" className="text-sm font-medium">
              {d.profilCompleter.prenom}
            </label>
            <input
              id="displayName"
              name="displayName"
              type="text"
              required
              defaultValue={user.user_metadata.display_name ?? ""}
              className="field-warm mt-1"
            />
          </div>
          <div>
            <label htmlFor="birthDate" className="text-sm font-medium">
              {d.profilCompleter.dateNaissance}
            </label>
            <input
              id="birthDate"
              name="birthDate"
              type="date"
              required
              className="field-warm mt-1"
            />
          </div>
          <div>
            <label htmlFor="gender" className="text-sm font-medium">
              {d.profilCompleter.tuEs}
            </label>
            <select
              id="gender"
              name="gender"
              required
              defaultValue=""
              className="field-warm mt-1"
            >
              <option value="" disabled>
                {d.profilCompleter.choisir}
              </option>
              <option value="homme">{d.profilCompleter.unHomme}</option>
              <option value="femme">{d.profilCompleter.uneFemme}</option>
              <option value="autre">{d.profilCompleter.autre}</option>
            </select>
          </div>
          <div>
            <label htmlFor="lookingFor" className="text-sm font-medium">
              {d.profilCompleter.tuRecherches}
            </label>
            <select
              id="lookingFor"
              name="lookingFor"
              required
              defaultValue=""
              className="field-warm mt-1"
            >
              <option value="" disabled>
                {d.profilCompleter.choisir}
              </option>
              <option value="homme">{d.profilCompleter.desHommes}</option>
              <option value="femme">{d.profilCompleter.desFemmes}</option>
              <option value="tous">{d.profilCompleter.toutLeMonde}</option>
            </select>
          </div>
          <div>
            <label htmlFor="city" className="text-sm font-medium">
              {d.profilCompleter.ville}
            </label>
            <input
              id="city"
              name="city"
              type="text"
              placeholder={d.profilCompleter.villePlaceholder}
              required
              className="field-warm mt-1"
            />
          </div>
          <div>
            <label htmlFor="bio" className="text-sm font-medium">
              {d.profilCompleter.bio}
            </label>
            <textarea
              id="bio"
              name="bio"
              rows={3}
              maxLength={280}
              placeholder={d.profilCompleter.bioPlaceholder}
              className="field-warm mt-1"
            />
          </div>
          <LocalisationInput locale={locale} />
          <div>
            <p className="text-sm font-medium">{d.profilCompleter.photoTitre}</p>
            <p className="mb-1 text-xs text-foreground/50">
              {d.profilCompleter.photoTexte}
            </p>
            <div className="mt-1">
              <FileInputWarm name="photo" accept="image/*" locale={locale} />
            </div>
          </div>
          <button type="submit" className="btn-primary-warm mt-2">
            {d.profilCompleter.valider}
          </button>
        </form>
      </div>
      </div>
    </div>
  );
}
