import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { demanderVerification } from "@/lib/verification-actions";
import { FileInputWarm } from "@/components/FileInputWarm";
import { BoutonAccueil } from "@/components/BoutonAccueil";
import { EnTeteLogo } from "@/components/EnTeteLogo";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { getLocale } from "@/lib/i18n/locale";
import { getDictionary } from "@/lib/i18n/dictionary";

export default async function VerificationPage({
  searchParams,
}: PageProps<"/profil/verification">) {
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

  const { data: derniereDemande } = await supabase
    .from("photo_verifications")
    .select("status, created_at")
    .eq("profile_id", user.id)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

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
          {d.verification.titre}
        </h1>
        <p className="mt-2 text-foreground/70">{d.verification.texte}</p>

        {profil?.photo_verified ? (
          <p
            className="mt-6 rounded-lg px-4 py-3 text-sm font-medium"
            style={{ background: "var(--lagune-tint)", color: "var(--lagune)" }}
          >
            {d.verification.dejaVerifie}
          </p>
        ) : derniereDemande?.status === "pending" ? (
          <p className="mt-6 rounded-lg bg-black/5 px-4 py-3 text-sm text-foreground/70">
            {d.verification.enAttente}
          </p>
        ) : (
          <>
            {derniereDemande?.status === "rejected" && (
              <p className="mt-6 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
                {d.verification.refusee}
              </p>
            )}

            {erreur && (
              <p className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
                {erreur}
              </p>
            )}

            <form action={demanderVerification} className="mt-6 flex flex-col gap-4">
              <div>
                <p className="text-sm font-medium">{d.verification.tonSelfie}</p>
                <div className="mt-1">
                  <FileInputWarm name="selfie" accept="image/*" required locale={locale} />
                </div>
              </div>
              <button type="submit" className="btn-primary-warm">
                {d.verification.envoyer}
              </button>
            </form>
          </>
        )}
      </div>
      </div>
    </div>
  );
}
