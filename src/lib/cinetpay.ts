const CINETPAY_BASE = "https://api-checkout.cinetpay.com/v2";

type ReponseInitiation = {
  code: string;
  message: string;
  data?: { payment_token: string; payment_url: string };
};

type ReponseVerification = {
  code: string;
  message: string;
  data?: {
    status: string;
    amount: string;
    currency: string;
    metadata: string;
  };
};

export async function initierPaiement(params: {
  transactionId: string;
  montantFcfa: number;
  description: string;
  notifyUrl: string;
  returnUrl: string;
  metadata: string;
}): Promise<ReponseInitiation> {
  const reponse = await fetch(`${CINETPAY_BASE}/payment`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      apikey: process.env.CINETPAY_API_KEY,
      site_id: process.env.CINETPAY_SITE_ID,
      transaction_id: params.transactionId,
      amount: params.montantFcfa,
      currency: "XOF",
      description: params.description,
      notify_url: params.notifyUrl,
      return_url: params.returnUrl,
      channels: "ALL",
      metadata: params.metadata,
    }),
  });

  return reponse.json();
}

// CinetPay ne transmet jamais le statut dans la notification elle-meme (pour
// eviter les attaques "man in the middle") : il faut toujours revérifier ici.
export async function verifierPaiement(
  transactionId: string,
): Promise<ReponseVerification> {
  const reponse = await fetch(`${CINETPAY_BASE}/payment/check`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      apikey: process.env.CINETPAY_API_KEY,
      site_id: process.env.CINETPAY_SITE_ID,
      transaction_id: transactionId,
    }),
  });

  return reponse.json();
}
