import { notFound } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { getLocale } from "@/lib/i18n/locale";
import { getDictionary, localeVersDateFnsTag } from "@/lib/i18n/dictionary";
import { BoutonAccueil } from "@/components/BoutonAccueil";
import { EnTeteLogo } from "@/components/EnTeteLogo";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";

type RendezVousPublic = {
  lieu: string;
  moment: string;
  note: string | null;
  nom_organisateur: string;
  nom_rencontre: string;
};

// Page volontairement publique (pas de connexion requise) : le but est de
// pouvoir l'envoyer a un proche qui n'a pas de compte Paolys, pour la
// securite. Seuls les champs strictement necessaires sont exposes (aucune
// photo, aucun contact) — voir la fonction SQL rendezvous_public.
export default async function RendezVousPublicPage({
  params,
}: PageProps<"/rendez-vous/[id]">) {
  const { id } = await params;
  const locale = await getLocale();
  const d = getDictionary(locale);

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .rpc("rendezvous_public", { p_id: id })
    .maybeSingle<RendezVousPublic>();

  if (error || !data) {
    notFound();
  }

  const date = new Date(data.moment);
  const tag = localeVersDateFnsTag(locale);

  return (
    <div className="page-bg flex flex-1 flex-col overflow-y-auto">
      <div className="relative flex h-7 box-content shrink-0 items-center justify-end gap-2 px-6 pt-4">
        <EnTeteLogo />
        <BoutonAccueil />
        <LanguageSwitcher locale={locale} />
      </div>
      <div className="flex flex-col items-center px-6 pb-12">
      <div className="card-warm mt-4 w-full max-w-sm p-8 text-center">
        <span className="text-sm font-medium tracking-[0.2em] text-gold uppercase">
          {d.rendezvousPublic.kicker}
        </span>
        <h1 className="font-display mt-2 text-2xl text-brand">
          {d.rendezvousPublic.rencontre(data.nom_organisateur, data.nom_rencontre)}
        </h1>
        <p className="mt-6 text-lg text-foreground">
          {date.toLocaleDateString(tag, {
            weekday: "long",
            day: "numeric",
            month: "long",
          })}
          {locale === "en" ? " at " : " à "}
          {date.toLocaleTimeString(tag, { hour: "2-digit", minute: "2-digit" })}
        </p>
        <p className="mt-2 text-foreground/80">📍 {data.lieu}</p>
        {data.note && (
          <p className="mt-4 rounded-lg bg-brand-light px-4 py-3 text-sm text-foreground/80">
            {data.note}
          </p>
        )}
        <p className="mt-8 text-xs text-foreground/50">{d.rendezvousPublic.partage}</p>
      </div>
      </div>
    </div>
  );
}
