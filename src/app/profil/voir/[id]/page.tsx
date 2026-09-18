import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { urlPhotoSignee } from "@/lib/photo-url";
import { ProtectedImage } from "@/components/ProtectedImage";
import { calculerAge } from "@/lib/age";
import { getLocale } from "@/lib/i18n/locale";
import { getDictionary } from "@/lib/i18n/dictionary";
import { BoutonAccueil } from "@/components/BoutonAccueil";
import { EnTeteLogo } from "@/components/EnTeteLogo";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";

type ProfilAffiche = {
  display_name: string;
  birth_date: string;
  bio: string | null;
  city: string | null;
  photo_verified: boolean;
  prompts: { prompt_key: string; reponse: string }[] | null;
};

export default async function VoirProfilPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ retour?: string }>;
}) {
  const { id } = await params;
  const { retour } = await searchParams;
  const locale = await getLocale();
  const d = getDictionary(locale);

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/connexion");
  }

  const { data, error } = await supabase
    .rpc("profil_pour_affichage", { p_id: id })
    .maybeSingle<ProfilAffiche>();

  if (error || !data) {
    notFound();
  }

  const photoUrl = await urlPhotoSignee(supabase, id);
  const prompts = (data.prompts ?? []).filter((p) => p.prompt_key in d.prompts.options);
  const lienRetour = retour ? `/messages/${retour}` : "/messages";

  return (
    <div className="page-bg flex flex-1 flex-col overflow-y-auto">
      <div className="relative flex h-7 box-content shrink-0 items-center justify-end gap-2 px-6 pt-4">
        <EnTeteLogo />
        <BoutonAccueil />
        <LanguageSwitcher locale={locale} />
      </div>
      <div className="flex flex-1 justify-center px-6 pb-12 pt-4">
        <div className="card-warm w-full max-w-sm p-8 text-center">
          <Link href={lienRetour} className="link-warm text-sm">
            {d.nav.messages}
          </Link>

          {photoUrl && (
            <div className="mx-auto mt-4 h-36 w-36 overflow-hidden rounded-full">
              <ProtectedImage
                src={photoUrl}
                alt={data.display_name}
                width={144}
                height={144}
                className="h-full w-full object-cover"
              />
            </div>
          )}

          <h1 className="font-display mt-4 text-3xl text-foreground">
            {data.display_name}, {calculerAge(data.birth_date)}
          </h1>
          {data.photo_verified && (
            <p className="mt-1 text-sm font-medium text-lagune">
              ✓ {d.profil.profilVerifie}
            </p>
          )}
          {data.city && <p className="mt-2 text-muted">{data.city}</p>}
          {data.bio && <p className="mt-4 text-foreground/80">{data.bio}</p>}

          {prompts.length > 0 && (
            <div className="mt-4 flex flex-col gap-2 text-left">
              {prompts.map((p) => (
                <div key={p.prompt_key} className="rounded-lg bg-brand-light px-3 py-2">
                  <p className="text-xs font-medium text-brand-dark">
                    {d.prompts.options[p.prompt_key]}
                  </p>
                  <p className="text-sm text-foreground/80">{p.reponse}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
