"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { initierPaiement } from "@/lib/cinetpay";
import { FORMULES, type Formule } from "@/lib/premium-pricing";

export async function demarrerAbonnement(formule: Formule) {
  const { montantFcfa, dureeJours, libelle } = FORMULES[formule];

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/connexion");
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const transactionId = `paolys-${user.id}-${Date.now()}`;

  const { error: insertError } = await supabase.from("payments").insert({
    profile_id: user.id,
    amount_fcfa: montantFcfa,
    duration_days: dureeJours,
    provider_transaction_id: transactionId,
    status: "pending",
  });

  if (insertError) {
    redirect(`/premium?erreur=${encodeURIComponent(insertError.message)}`);
  }

  const reponse = await initierPaiement({
    transactionId,
    montantFcfa,
    description: `Abonnement Paolys+ (${libelle})`,
    notifyUrl: `${siteUrl}/api/paiement/notifier`,
    returnUrl: `${siteUrl}/paiement/retour?transaction=${transactionId}`,
    metadata: user.id,
  });

  if (reponse.code !== "201" || !reponse.data?.payment_url) {
    redirect(
      `/premium?erreur=${encodeURIComponent(reponse.message || "Erreur de connexion à CinetPay")}`,
    );
  }

  redirect(reponse.data.payment_url);
}
