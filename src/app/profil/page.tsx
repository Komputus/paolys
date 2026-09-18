import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { signOut } from "@/lib/auth-actions";
import { PremiumControls } from "@/components/PremiumControls";
import { ProtectedImage } from "@/components/ProtectedImage";
import { urlPhotoSignee } from "@/lib/photo-url";
import { CopierLien } from "@/components/CopierLien";
import { getLocale } from "@/lib/i18n/locale";
import { getDictionary, localeVersDateFnsTag } from "@/lib/i18n/dictionary";
import { BottomNav } from "@/components/BottomNav";
import { BoutonAccueil } from "@/components/BoutonAccueil";
import { EnTeteLogo } from "@/components/EnTeteLogo";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";

type MonPrompt = { pos: number; prompt_key: string; reponse: string };

export default async function ProfilPage() {
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
    .select(
      "display_name, city, bio, photo_verified, premium_until, boosted_until, hidden_from_discovery, referral_code",
    )
    .eq("id", user.id)
    .maybeSingle();

  if (!profil) {
    redirect("/profil/completer");
  }

  const { data: promptsData } = await supabase.rpc("mes_prompts");
  const mesPrompts = (promptsData ?? []) as MonPrompt[];

  const { data: compteParraines } = await supabase.rpc("combien_j_ai_parraine");
  const { data: compteLikesData } = await supabase.rpc("combien_m_ont_aime");
  const compteLikes = (compteLikesData as number | null) ?? 0;

  const { data: derniereDemande } = await supabase
    .from("photo_verifications")
    .select("status")
    .eq("profile_id", user.id)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  const photoUrl = await urlPhotoSignee(supabase, user.id);

  const estPremium = Boolean(
    profil.premium_until && new Date(profil.premium_until) > new Date(),
  );

  return (
    <div className="page-bg flex h-dvh flex-col overflow-hidden">
      <div className="relative flex h-7 box-content shrink-0 items-center justify-end gap-2 px-6 pt-4">
        <EnTeteLogo />
        <BoutonAccueil />
        <LanguageSwitcher locale={locale} />
      </div>
      <div className="flex min-h-0 flex-1 justify-center overflow-y-auto px-6 pb-12 pt-4">
      <div className="card-warm w-full max-w-sm p-8 text-center">
        {photoUrl && (
          <div className="bg-mangue mx-auto flex h-36 w-36 items-center justify-center rounded-full p-1">
            <ProtectedImage
              src={photoUrl}
              alt={profil.display_name}
              width={128}
              height={128}
              className="h-full w-full rounded-full object-cover ring-4 ring-surface"
            />
          </div>
        )}
        <h1 className="font-display mt-4 text-3xl text-foreground">
          {profil.display_name}
        </h1>
        {profil.photo_verified ? (
          <p className="mt-1 inline-flex items-center gap-1 text-sm font-medium text-lagune">
            {d.profil.profilVerifie}
          </p>
        ) : derniereDemande?.status === "pending" ? (
          <p className="mt-1 text-sm font-medium text-foreground/60">
            {d.profil.verificationEnCours}
          </p>
        ) : (
          <Link
            href="/profil/verification"
            className="mt-1 inline-block text-sm font-medium text-brand underline"
          >
            {derniereDemande?.status === "rejected"
              ? d.profil.refaireVerification
              : d.profil.faireVerifier}
          </Link>
        )}
        {profil.city && <p className="mt-2 text-muted">{profil.city}</p>}
        {profil.bio && <p className="mt-4 text-foreground/80">{profil.bio}</p>}

        <Link
          href="/profil/modifier"
          className="mt-3 inline-block text-sm font-medium text-brand underline"
        >
          {d.profil.modifierProfil}
        </Link>

        {mesPrompts.length > 0 ? (
          <div className="mt-4 flex flex-col gap-2 text-left">
            {mesPrompts.map((p) => (
              <div key={p.pos} className="rounded-lg bg-brand-light px-3 py-2">
                <p className="text-xs font-medium text-brand-dark">
                  {d.prompts.options[p.prompt_key] ?? p.prompt_key}
                </p>
                <p className="text-sm text-foreground/80">{p.reponse}</p>
              </div>
            ))}
            <Link
              href="/profil/prompts"
              className="self-center text-xs font-medium text-brand underline"
            >
              {d.profil.modifierPrompts}
            </Link>
          </div>
        ) : (
          <Link
            href="/profil/prompts"
            className="mt-2 inline-block text-sm font-medium text-brand underline"
          >
            {d.profil.ajouterPrompts}
          </Link>
        )}

        <div className="card-warm mt-6 p-4 text-left">
          <p className="text-sm font-medium text-foreground">{d.profil.inviteAmis}</p>
          <p className="mt-1 text-xs text-foreground/60">
            {d.profil.inviteTexte(compteParraines ?? 0)}
          </p>
          <CopierLien
            texte={`${process.env.NEXT_PUBLIC_SITE_URL ?? ""}/inscription?ref=${profil.referral_code}`}
            locale={locale}
          />
        </div>

        {estPremium ? (
          <p className="mt-4 inline-block rounded-full bg-brand-light px-4 py-1.5 text-sm font-medium text-brand-dark">
            {d.profil.premiumActif(
              new Date(profil.premium_until!).toLocaleDateString(
                localeVersDateFnsTag(locale),
              ),
            )}
          </p>
        ) : (
          <Link
            href="/premium"
            className="mt-4 inline-block text-sm font-medium text-gold underline"
          >
            {d.profil.passerPremium}
          </Link>
        )}

        {estPremium && (
          <PremiumControls
            boostedUntil={profil.boosted_until}
            hiddenFromDiscovery={profil.hidden_from_discovery}
            locale={locale}
          />
        )}

        <div className="mt-8 flex flex-col gap-3">
          <Link href="/decouverte" className="btn-primary-warm">
            {d.profil.decouvrirProfils}
          </Link>
          <Link href="/aimes-par" className="btn-secondary-warm">
            {d.profil.quiTaAime}
          </Link>
          <Link href="/messages" className="btn-secondary-warm">
            {d.profil.messages}
          </Link>
          <Link href="/profils-exclusifs" className="btn-secondary-warm">
            {d.profil.profilsExclusifs}
          </Link>
          {user.app_metadata?.role === "sponsor" && (
            <Link
              href="/sponsor"
              className="rounded-full border border-black/10 px-8 py-3 font-medium text-foreground/70 transition-colors hover:bg-black/5"
            >
              {d.profil.espaceSponsor}
            </Link>
          )}
          {user.app_metadata?.role === "admin" && (
            <>
              <Link
                href="/admin/verifications"
                className="rounded-full border border-black/10 px-8 py-3 font-medium text-foreground/70 transition-colors hover:bg-black/5"
              >
                {d.profil.adminVerifications}
              </Link>
              <Link
                href="/admin/signalements"
                className="rounded-full border border-black/10 px-8 py-3 font-medium text-foreground/70 transition-colors hover:bg-black/5"
              >
                {d.profil.adminSignalements}
              </Link>
            </>
          )}
        </div>
        <form action={signOut} className="mt-4">
          <button type="submit" className="btn-tertiary-warm">
            {d.profil.seDeconnecter}
          </button>
        </form>
      </div>
      </div>
      <BottomNav locale={locale} compteLikes={compteLikes} />
    </div>
  );
}
