import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { urlPhotoSignee } from "@/lib/photo-url";
import {
  AdminVerificationsClient,
  type Demande,
} from "@/components/AdminVerificationsClient";
import { getLocale } from "@/lib/i18n/locale";
import { getDictionary } from "@/lib/i18n/dictionary";
import { BoutonAccueil } from "@/components/BoutonAccueil";
import { EnTeteLogo } from "@/components/EnTeteLogo";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";

type VerificationEnAttente = {
  id: string;
  profile_id: string;
  display_name: string;
  selfie_storage_path: string;
  created_at: string;
};

export default async function AdminVerificationsPage() {
  const locale = await getLocale();
  const d = getDictionary(locale);

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/connexion");
  }

  if (user.app_metadata?.role !== "admin") {
    redirect("/profil");
  }

  const { data, error } = await supabase.rpc("verifications_en_attente");

  if (error) {
    throw new Error(error.message);
  }

  const lignes = (data ?? []) as VerificationEnAttente[];

  const demandes: Demande[] = await Promise.all(
    lignes.map(async (d) => {
      const { data: selfieSigne } = await supabase.storage
        .from("verification-selfies")
        .createSignedUrl(d.selfie_storage_path, 300);

      const photoUrl = await urlPhotoSignee(supabase, d.profile_id);

      return {
        id: d.id,
        profile_id: d.profile_id,
        display_name: d.display_name,
        selfieUrl: selfieSigne?.signedUrl ?? null,
        photoUrl,
      };
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
      <div className="mx-auto w-full max-w-2xl">
        <h1 className="text-2xl font-semibold text-brand">
          {d.adminVerifications.titre}
        </h1>
        <AdminVerificationsClient demandesInitiales={demandes} locale={locale} />
      </div>
      </div>
    </div>
  );
}
