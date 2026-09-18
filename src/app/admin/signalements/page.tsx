import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { marquerSignalementTraite } from "@/lib/moderation-actions";
import { getLocale } from "@/lib/i18n/locale";
import { getDictionary } from "@/lib/i18n/dictionary";
import { BoutonAccueil } from "@/components/BoutonAccueil";
import { EnTeteLogo } from "@/components/EnTeteLogo";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";

type Signalement = {
  id: string;
  reason: string;
  created_at: string;
  reporter: { display_name: string } | null;
  reported: { display_name: string } | null;
};

export default async function AdminSignalementsPage() {
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

  const { data, error } = await supabase
    .from("reports")
    .select(
      `id, reason, created_at,
       reporter:profiles!reports_reporter_id_fkey(display_name),
       reported:profiles!reports_reported_id_fkey(display_name)`,
    )
    .eq("status", "pending")
    .order("created_at", { ascending: true })
    .returns<Signalement[]>();

  if (error) {
    throw new Error(error.message);
  }

  const signalements = data ?? [];

  return (
    <div className="page-bg flex flex-1 flex-col">
      <div className="relative flex h-7 box-content items-center justify-end gap-2 px-6 pt-6">
        <EnTeteLogo />
        <BoutonAccueil />
        <LanguageSwitcher locale={locale} />
      </div>
      <div className="flex flex-1 flex-col px-6 pb-12">
      <div className="mx-auto w-full max-w-2xl">
      <Link href="/profil" className="link-warm text-sm">
        {d.nav.monProfil}
      </Link>
      <h1 className="mt-4 text-2xl font-semibold text-brand">
        {d.adminSignalements.titre}
      </h1>

      {signalements.length === 0 ? (
        <p className="mt-6 text-foreground/70">{d.adminSignalements.aucun}</p>
      ) : (
        <ul className="mt-6 flex flex-col gap-4">
          {signalements.map((s) => (
            <li key={s.id} className="rounded-xl border border-black/10 p-4">
              <p className="text-sm text-foreground/60">
                <span className="font-medium text-foreground">
                  {s.reporter?.display_name ?? "?"}
                </span>{" "}
                {d.adminSignalements.signale}{" "}
                <span className="font-medium text-foreground">
                  {s.reported?.display_name ?? "?"}
                </span>
              </p>
              <p className="mt-2">{s.reason}</p>
              <form action={marquerSignalementTraite} className="mt-3">
                <input type="hidden" name="reportId" value={s.id} />
                <button
                  type="submit"
                  className="rounded-full border border-black/10 px-4 py-1.5 text-sm font-medium transition-colors hover:bg-black/5"
                >
                  {d.adminSignalements.marquerTraite}
                </button>
              </form>
            </li>
          ))}
        </ul>
      )}
      </div>
      </div>
    </div>
  );
}
