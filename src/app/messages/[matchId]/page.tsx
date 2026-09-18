import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ConversationClient } from "@/components/ConversationClient";
import { urlPhotoSignee } from "@/lib/photo-url";
import { getLocale } from "@/lib/i18n/locale";

export default async function ConversationPage({
  params,
}: PageProps<"/messages/[matchId]">) {
  const { matchId } = await params;
  const locale = await getLocale();

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/connexion");
  }

  const { data: match } = await supabase
    .from("matches")
    .select("id, profile_a, profile_b")
    .eq("id", matchId)
    .maybeSingle();

  if (!match) {
    notFound();
  }

  const autreId = match.profile_a === user.id ? match.profile_b : match.profile_a;

  const { data: autreNom } = await supabase.rpc("nom_du_profil", {
    cible: autreId,
  });

  const autrePhotoUrl = await urlPhotoSignee(supabase, autreId);

  const { data: messages } = await supabase
    .from("messages")
    .select("id, sender_id, content, created_at")
    .eq("match_id", matchId)
    .order("created_at", { ascending: true });

  const { data: demandeRdv } = await supabase
    .from("demandes_rendezvous")
    .select("id, demandeur_id, statut")
    .eq("match_id", matchId)
    .neq("statut", "refuse")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  const { data: eligibleRdv } = await supabase.rpc("eligible_demande_rdv", {
    p_match_id: matchId,
  });

  return (
    <ConversationClient
      matchId={matchId}
      moiId={user.id}
      autreId={autreId}
      autreNom={autreNom ?? "..."}
      autrePhotoUrl={autrePhotoUrl}
      messagesInitiaux={messages ?? []}
      demandeRdvInitiale={demandeRdv ?? null}
      eligibleRdv={eligibleRdv ?? false}
      locale={locale}
    />
  );
}
