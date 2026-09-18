import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { urlPhotoSignee } from "@/lib/photo-url";
import { ProtectedImage } from "@/components/ProtectedImage";
import { getLocale } from "@/lib/i18n/locale";
import { getDictionary } from "@/lib/i18n/dictionary";
import { BoutonAccueil } from "@/components/BoutonAccueil";
import { EnTeteLogo } from "@/components/EnTeteLogo";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";

type ProfilSponsorPourMoi = {
  sponsor_id: string;
  display_name: string;
  bio: string | null;
  city: string | null;
  voir_photo: boolean;
  voir_contact: boolean;
};

export default async function ProfilsExclusifsPage() {
  const locale = await getLocale();
  const d = getDictionary(locale);

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/connexion");
  }

  const { data, error } = await supabase.rpc("profils_sponsors_pour_moi");

  if (error) {
    throw new Error(error.message);
  }

  const profils = (data ?? []) as ProfilSponsorPourMoi[];

  const complets = await Promise.all(
    profils.map(async (p) => {
      const photoUrl = p.voir_photo
        ? await urlPhotoSignee(supabase, p.sponsor_id)
        : null;

      let phone: string | null = null;
      if (p.voir_contact) {
        const { data: contact } = await supabase
          .from("profile_contacts")
          .select("phone")
          .eq("profile_id", p.sponsor_id)
          .maybeSingle();
        phone = contact?.phone ?? null;
      }

      return { ...p, photoUrl, phone };
    }),
  );

  return (
    <div className="page-bg flex flex-1 flex-col">
      <div className="relative flex h-7 box-content items-center justify-end gap-2 px-6 pt-6">
        <EnTeteLogo />
        <BoutonAccueil />
        <LanguageSwitcher locale={locale} />
      </div>
      <div className="flex flex-1 flex-col px-6 pb-12">
      <div className="mx-auto flex w-full max-w-lg flex-col">
      <Link href="/profil" className="link-warm text-sm">
        {d.nav.monProfil}
      </Link>
      <h1 className="font-display mt-4 text-3xl text-brand">
        {d.profilsExclusifs.titre}
      </h1>
      <p className="mt-2 text-foreground/70">{d.profilsExclusifs.sousTitre}</p>

      {complets.length === 0 ? (
        <p className="mt-6 text-foreground/70">{d.profilsExclusifs.rien}</p>
      ) : (
        <ul className="mt-6 flex flex-col gap-4">
          {complets.map((p) => (
            <li
              key={p.sponsor_id}
              className="card-warm flex items-center gap-4 p-4"
            >
              <div className="h-16 w-16 shrink-0 overflow-hidden rounded-full bg-black/5">
                {p.photoUrl && (
                  <ProtectedImage
                    src={p.photoUrl}
                    alt={p.display_name}
                    width={64}
                    height={64}
                    className="h-full w-full object-cover"
                  />
                )}
              </div>
              <div>
                <p className="font-medium">{p.display_name}</p>
                {p.city && <p className="text-sm text-foreground/60">{p.city}</p>}
                {p.bio && <p className="mt-1 text-sm text-foreground/80">{p.bio}</p>}
                {p.phone && (
                  <p className="mt-1 text-sm font-medium text-brand">
                    {p.phone}
                  </p>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
      </div>
      </div>
    </div>
  );
}
