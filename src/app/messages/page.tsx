import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { urlPhotoSignee } from "@/lib/photo-url";
import { ProtectedImage } from "@/components/ProtectedImage";
import { getLocale } from "@/lib/i18n/locale";
import { getDictionary } from "@/lib/i18n/dictionary";
import { BottomNav } from "@/components/BottomNav";
import { BoutonAccueil } from "@/components/BoutonAccueil";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";

type MatchApercu = {
  match_id: string;
  autre_id: string;
  autre_nom: string;
  dernier_message: string | null;
  dernier_message_at: string | null;
};

export default async function MessagesPage() {
  const locale = await getLocale();
  const d = getDictionary(locale);

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/connexion");
  }

  const { data: compteLikesData } = await supabase.rpc("combien_m_ont_aime");
  const compteLikes = (compteLikesData as number | null) ?? 0;

  const { data, error } = await supabase.rpc("mes_matchs");

  if (error) {
    throw new Error(error.message);
  }

  const matchs = (data ?? []) as MatchApercu[];

  const matchsAvecPhoto = await Promise.all(
    matchs.map(async (m) => {
      const photoUrl = await urlPhotoSignee(supabase, m.autre_id);
      return { ...m, photoUrl };
    }),
  );

  return (
    <div className="page-bg flex h-dvh flex-col overflow-hidden">
      <header className="flex shrink-0 items-center justify-between px-6 py-4">
        <Link href="/profil" className="link-warm text-sm">
          {d.nav.monProfil}
        </Link>
        <div className="flex items-center gap-2">
          <BoutonAccueil />
          <LanguageSwitcher locale={locale} />
        </div>
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto px-6 pb-12">
        <h1 className="font-display text-3xl text-brand">
          {d.messagesListe.titre}
        </h1>

        {matchsAvecPhoto.length === 0 ? (
          <p className="mt-6 text-foreground/70">{d.messagesListe.aucunMatch}</p>
        ) : (
          <ul className="mt-6 flex flex-col gap-2">
            {matchsAvecPhoto.map((m) => (
              <li key={m.match_id}>
                <Link
                  href={`/messages/${m.match_id}`}
                  className="card-warm flex items-center gap-3 p-3 transition-transform hover:scale-[1.01]"
                >
                  <div className="h-12 w-12 shrink-0 overflow-hidden rounded-full bg-brand-light">
                    {m.photoUrl && (
                      <ProtectedImage
                        src={m.photoUrl}
                        alt={m.autre_nom}
                        width={48}
                        height={48}
                        className="h-full w-full object-cover"
                      />
                    )}
                  </div>
                  <div className="min-w-0 flex-1 text-left">
                    <p className="font-medium">{m.autre_nom}</p>
                    <p className="truncate text-sm text-foreground/60">
                      {m.dernier_message ?? d.messagesListe.ditesBonjour}
                    </p>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
      <BottomNav locale={locale} compteLikes={compteLikes} />
    </div>
  );
}
