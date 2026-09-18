import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { verifierPaiement } from "@/lib/cinetpay";

// CinetPay appelle cette URL en POST (formulaire, pas JSON) avec au minimum
// cpm_trans_id. Il ne faut JAMAIS faire confiance a cette notification seule
// (recommandation officielle CinetPay) — on revérifie systematiquement le
// statut réel via /v2/payment/check avant de faire quoi que ce soit.
export async function POST(request: Request) {
  const formData = await request.formData().catch(() => null);
  const transactionId = formData?.get("cpm_trans_id")?.toString();

  if (!transactionId) {
    return NextResponse.json({ error: "cpm_trans_id manquant" }, { status: 400 });
  }

  const verification = await verifierPaiement(transactionId);

  if (verification.code !== "00" || verification.data?.status !== "ACCEPTED") {
    const supabase = createAdminClient();
    await supabase
      .from("payments")
      .update({ status: "failed" })
      .eq("provider_transaction_id", transactionId)
      .eq("status", "pending");

    return NextResponse.json({ ok: true, status: "non accepté" });
  }

  const supabase = createAdminClient();

  const { data: paiement } = await supabase
    .from("payments")
    .select("id, profile_id, duration_days, status")
    .eq("provider_transaction_id", transactionId)
    .maybeSingle();

  // Deja traite (la notification peut arriver plusieurs fois) : on ne double
  // compte pas la duree de l'abonnement.
  if (!paiement || paiement.status === "success") {
    return NextResponse.json({ ok: true, status: "déjà traité" });
  }

  await supabase
    .from("payments")
    .update({ status: "success" })
    .eq("id", paiement.id);

  const { data: profil } = await supabase
    .from("profiles")
    .select("premium_until")
    .eq("id", paiement.profile_id)
    .maybeSingle();

  const depart =
    profil?.premium_until && new Date(profil.premium_until) > new Date()
      ? new Date(profil.premium_until)
      : new Date();

  const nouvelleDate = new Date(depart);
  nouvelleDate.setDate(nouvelleDate.getDate() + paiement.duration_days);

  await supabase
    .from("profiles")
    .update({ premium_until: nouvelleDate.toISOString() })
    .eq("id", paiement.profile_id);

  return NextResponse.json({ ok: true, status: "premium activé" });
}
