import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { envoyerResumeQuotidien } from "@/lib/email";

// Declenchee une fois par jour par Vercel Cron (voir vercel.json). Proteger
// par CRON_SECRET : sans ca, n'importe qui pourrait declencher l'envoi en
// masse en appelant cette URL.
export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Non autorise" }, { status: 401 });
  }

  const supabase = createAdminClient();

  // Candidats : tout profil ayant au moins une vue, un like ou un message
  // recu depuis son dernier resume (ou les dernieres 24h si jamais envoye).
  const { data: profils } = await supabase
    .from("profiles")
    .select("id, display_name, last_digest_sent_at");

  if (!profils) {
    return NextResponse.json({ envoyes: 0 });
  }

  let envoyes = 0;

  for (const profil of profils) {
    const depuis = profil.last_digest_sent_at ?? new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

    const [{ count: nbVues }, { count: nbLikes }] = await Promise.all([
      supabase
        .from("profile_views")
        .select("id", { count: "exact", head: true })
        .eq("viewed_id", profil.id)
        .gt("created_at", depuis),
      supabase
        .from("swipes")
        .select("id", { count: "exact", head: true })
        .eq("swiped_id", profil.id)
        .eq("direction", "like")
        .gt("created_at", depuis),
    ]);

    // Messages recus : il faut d'abord les matchs du profil, puis les
    // messages de ces matchs dont il n'est pas l'auteur.
    const { data: mesMatchs } = await supabase
      .from("matches")
      .select("id")
      .or(`profile_a.eq.${profil.id},profile_b.eq.${profil.id}`);

    const idsMatchs = (mesMatchs ?? []).map((m) => m.id);
    let nbMessages = 0;
    if (idsMatchs.length > 0) {
      const { count } = await supabase
        .from("messages")
        .select("id", { count: "exact", head: true })
        .in("match_id", idsMatchs)
        .neq("sender_id", profil.id)
        .gt("created_at", depuis);
      nbMessages = count ?? 0;
    }

    const total = (nbVues ?? 0) + (nbLikes ?? 0) + nbMessages;
    if (total === 0) continue;

    const { data: userData } = await supabase.auth.admin.getUserById(profil.id);
    const email = userData?.user?.email;
    if (!email) continue;

    try {
      await envoyerResumeQuotidien({
        destinataire: email,
        prenom: profil.display_name,
        nbVues: nbVues ?? 0,
        nbLikes: nbLikes ?? 0,
        nbMessages,
      });
      await supabase
        .from("profiles")
        .update({ last_digest_sent_at: new Date().toISOString() })
        .eq("id", profil.id);
      envoyes++;
    } catch (e) {
      console.warn(`Echec envoi resume pour ${profil.id}:`, e);
    }
  }

  return NextResponse.json({ envoyes });
}
