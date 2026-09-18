"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { envoyerMessage } from "@/lib/message-actions";
import { SignalerBloquer } from "@/components/SignalerBloquer";
import { ProtectedImage } from "@/components/ProtectedImage";
import { RendezVousPlanner } from "@/components/RendezVousPlanner";
import { DemandeRendezVous, type DemandeRdv } from "@/components/DemandeRendezVous";
import { BoutonAccueil } from "@/components/BoutonAccueil";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { getDictionary, type Locale } from "@/lib/i18n/dictionary";

export type Message = {
  id: string;
  sender_id: string;
  content: string;
  created_at: string;
};

export function ConversationClient({
  matchId,
  moiId,
  autreId,
  autreNom,
  autrePhotoUrl,
  messagesInitiaux,
  demandeRdvInitiale,
  eligibleRdv,
  locale,
}: {
  matchId: string;
  moiId: string;
  autreId: string;
  autreNom: string;
  autrePhotoUrl: string | null;
  messagesInitiaux: Message[];
  demandeRdvInitiale: DemandeRdv | null;
  eligibleRdv: boolean;
  locale: Locale;
}) {
  const d = getDictionary(locale);
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>(messagesInitiaux);
  const [texte, setTexte] = useState("");
  const [envoi, setEnvoi] = useState(false);
  const [erreur, setErreur] = useState<string | null>(null);
  const finRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const supabase = createClient();
    let channel: ReturnType<typeof supabase.channel> | null = null;
    let annule = false;

    (async () => {
      // Le canal Realtime doit connaître le token de la session pour que les
      // policies RLS s'appliquent avec le rôle "authenticated" — sans ça, les
      // évènements sont filtrés silencieusement côté serveur.
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session) {
        supabase.realtime.setAuth(session.access_token);
      }
      if (annule) return;

      channel = supabase
        .channel(`messages-${matchId}`)
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "messages",
            filter: `match_id=eq.${matchId}`,
          },
          (payload) => {
            const nouveau = payload.new as Message;
            setMessages((precedents) =>
              precedents.some((m) => m.id === nouveau.id)
                ? precedents
                : [...precedents, nouveau],
            );
          },
        )
        .subscribe();
    })();

    return () => {
      annule = true;
      if (channel) supabase.removeChannel(channel);
    };
  }, [matchId]);

  useEffect(() => {
    finRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  async function envoyer() {
    const contenu = texte.trim();
    if (!contenu || envoi) return;
    setEnvoi(true);
    setErreur(null);
    try {
      await envoyerMessage(matchId, contenu);
      setTexte("");
    } catch (e) {
      setErreur(e instanceof Error ? e.message : d.conversation.erreurEnvoi);
    } finally {
      setEnvoi(false);
    }
  }

  return (
    <div className="page-bg flex flex-1 flex-col">
      <header className="flex items-center gap-3 border-b border-brand-light bg-surface px-6 py-4">
        <Link href="/messages" className="link-warm text-sm">
          {d.nav.messages}
        </Link>
        <Link
          href={`/profil/voir/${autreId}?retour=${matchId}`}
          className="h-10 w-10 shrink-0 overflow-hidden rounded-full bg-brand-light"
          aria-label={autreNom}
        >
          {autrePhotoUrl && (
            <ProtectedImage
              src={autrePhotoUrl}
              alt={autreNom}
              width={40}
              height={40}
              className="h-full w-full object-cover"
            />
          )}
        </Link>
        <Link href={`/profil/voir/${autreId}?retour=${matchId}`} className="hover:underline">
          <h1 className="font-display text-foreground">{autreNom}</h1>
        </Link>
        <div className="ml-auto flex items-center gap-2">
          <SignalerBloquer
            cibleId={autreId}
            cibleNom={autreNom}
            onBloque={() => router.push("/messages")}
            locale={locale}
          />
          <BoutonAccueil />
          <LanguageSwitcher locale={locale} />
        </div>
      </header>

      <div className="flex-1 space-y-2 overflow-y-auto px-6 py-4">
        {messages.length === 0 && (
          <p className="text-center text-sm text-foreground/50">
            {d.conversation.ditesBonjourA(autreNom)}
          </p>
        )}
        {messages.map((m) => (
          <div
            key={m.id}
            className={`max-w-[75%] rounded-2xl px-4 py-2 ${
              m.sender_id === moiId
                ? "bg-mangue ml-auto text-white shadow-md shadow-mangue/20"
                : "bg-brand-light text-foreground"
            }`}
          >
            {m.content}
          </div>
        ))}
        <div ref={finRef} />
      </div>

      <DemandeRendezVous
        matchId={matchId}
        moiId={moiId}
        autreNom={autreNom}
        demandeInitiale={demandeRdvInitiale}
        eligible={eligibleRdv}
        locale={locale}
      />

      <div className="flex justify-center px-6 pb-2">
        <RendezVousPlanner matchId={matchId} locale={locale} />
      </div>

      {erreur && (
        <p className="px-6 text-sm text-red-600">{erreur}</p>
      )}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          envoyer();
        }}
        className="flex gap-2 border-t border-black/10 px-6 py-4"
      >
        <input
          value={texte}
          onChange={(e) => setTexte(e.target.value)}
          placeholder={d.conversation.ecrisMessage}
          className="field-warm flex-1 rounded-full"
        />
        <button
          type="submit"
          disabled={envoi || !texte.trim()}
          className="btn-primary-warm px-6 py-2.5 disabled:opacity-50"
        >
          {d.conversation.envoyer}
        </button>
      </form>
    </div>
  );
}
