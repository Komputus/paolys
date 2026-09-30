import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { urlsPhotosSignees, MAX_PHOTOS_PAR_PROFIL } from "@/lib/photo-url";
import { ajouterPhoto, supprimerPhoto, definirPhotoPrincipale } from "@/lib/photo-actions";
import { ProtectedImage } from "@/components/ProtectedImage";
import { FileInputWarm } from "@/components/FileInputWarm";
import { EnTeteLogo } from "@/components/EnTeteLogo";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { BoutonProfil } from "@/components/BoutonProfil";
import { getLocale } from "@/lib/i18n/locale";
import { getDictionary } from "@/lib/i18n/dictionary";

export default async function PhotosPage({
  searchParams,
}: {
  searchParams: Promise<{ erreur?: string }>;
}) {
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

  const { data: profil } = await supabase
    .from("profiles")
    .select("photo_verified")
    .eq("id", user.id)
    .maybeSingle();
  const estVerifie = Boolean(profil?.photo_verified);

  const { data: photos } = await supabase
    .from("profile_photos")
    .select("id, storage_path")
    .eq("profile_id", user.id)
    .order("position", { ascending: true });

  const lignes = photos ?? [];
  const urls = await urlsPhotosSignees(supabase, user.id, MAX_PHOTOS_PAR_PROFIL);
  const photosAffichees = lignes.map((ligne, i) => ({ id: ligne.id, url: urls[i] }));
  const placesRestantes = MAX_PHOTOS_PAR_PROFIL - lignes.length;

  return (
    <div className="page-bg flex flex-1 flex-col overflow-y-auto">
      <div className="relative flex h-7 box-content shrink-0 items-center justify-end gap-2 px-6 pt-4">
        <EnTeteLogo />
        <LanguageSwitcher locale={locale} />
        <BoutonProfil connecte />
      </div>
      <div className="flex flex-col items-center px-6 pb-12">
        <div className="card-warm mt-4 w-full max-w-sm p-8">
          <Link href="/profil/modifier" className="link-warm text-sm">
            {d.nav.monProfil}
          </Link>
          <h1 className="font-display mt-4 text-3xl text-brand">{d.photos.titre}</h1>
          <p className="mt-2 text-foreground/70">
            {d.photos.texte(MAX_PHOTOS_PAR_PROFIL)}
          </p>
          {estVerifie && (
            <p className="mt-2 text-xs" style={{ color: "var(--lagune)" }}>
              {d.photos.notePrincipaleVerrouillee}
            </p>
          )}

          {erreur && (
            <p className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
              {erreur}
            </p>
          )}

          <div className="mt-6 grid grid-cols-3 gap-3">
            {photosAffichees.map((photo, i) =>
              photo.url ? (
                <div key={photo.id} className="flex flex-col items-center gap-1.5">
                  <div className="relative aspect-square w-full overflow-hidden rounded-xl">
                    <ProtectedImage
                      src={photo.url}
                      alt=""
                      fill
                      sizes="120px"
                      className="object-cover"
                    />
                    {i === 0 && (
                      <span
                        className="absolute left-1 top-1 rounded-full px-1.5 py-0.5 text-[9px] font-bold text-white"
                        style={{ background: estVerifie ? "var(--lagune)" : "var(--mangue)" }}
                      >
                        {estVerifie ? d.photos.principaleVerifiee : d.photos.principale}
                      </span>
                    )}
                  </div>
                  <div className="flex gap-1">
                    {i !== 0 && !estVerifie && (
                      <form action={definirPhotoPrincipale}>
                        <input type="hidden" name="photoId" value={photo.id} />
                        <button type="submit" className="text-[10px] font-medium text-brand underline">
                          {d.photos.definirPrincipale}
                        </button>
                      </form>
                    )}
                    {!(i === 0 && estVerifie) && (
                      <form action={supprimerPhoto}>
                        <input type="hidden" name="photoId" value={photo.id} />
                        <button type="submit" className="text-[10px] font-medium text-red-600 underline">
                          {d.photos.supprimer}
                        </button>
                      </form>
                    )}
                  </div>
                </div>
              ) : null,
            )}

            {placesRestantes > 0 && (
              <div className="flex aspect-square w-full items-center justify-center rounded-xl border-2 border-dashed" style={{ borderColor: "var(--line)" }}>
                <span className="text-xs text-foreground/40">{d.photos.emplacementVide}</span>
              </div>
            )}
          </div>

          {placesRestantes > 0 && (
            <form action={ajouterPhoto} className="mt-6">
              <FileInputWarm name="photo" accept="image/*" locale={locale} />
              <button type="submit" className="btn-primary-warm mt-3 w-full">
                {d.photos.ajouter}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
