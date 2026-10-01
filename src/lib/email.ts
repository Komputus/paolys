import { Resend } from "resend";

// Factory paresseuse (comme pour AWS Rekognition) : instancier au chargement
// du module ferait planter `next build` si RESEND_API_KEY est absente au
// moment du build.
function creerClient() {
  return new Resend(process.env.RESEND_API_KEY);
}

const EXPEDITEUR = "Paolys <noreply@paolys.com>";

export async function envoyerResumeQuotidien(params: {
  destinataire: string;
  prenom: string;
  nbVues: number;
  nbLikes: number;
  nbMessages: number;
}) {
  const { destinataire, prenom, nbVues, nbLikes, nbMessages } = params;

  const lignes: string[] = [];
  if (nbVues > 0) {
    lignes.push(`👀 <strong>${nbVues}</strong> personne${nbVues > 1 ? "s ont" : " a"} vu ton profil`);
  }
  if (nbLikes > 0) {
    lignes.push(`❤️ <strong>${nbLikes}</strong> nouveau${nbLikes > 1 ? "x" : ""} like${nbLikes > 1 ? "s" : ""}`);
  }
  if (nbMessages > 0) {
    lignes.push(`💬 <strong>${nbMessages}</strong> nouveau${nbMessages > 1 ? "x" : ""} message${nbMessages > 1 ? "s" : ""}`);
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://paolys.com";

  const html = `
    <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; color: #241729;">
      <h1 style="color: #d9821f;">Salut ${prenom} 👋</h1>
      <p>Voici ce qui s'est passé sur ton profil Paolys aujourd'hui :</p>
      <ul style="line-height: 1.8;">
        ${lignes.map((l) => `<li>${l}</li>`).join("")}
      </ul>
      <a href="${siteUrl}/decouverte" style="display: inline-block; margin-top: 16px; padding: 12px 24px; background: #d9821f; color: white; border-radius: 999px; text-decoration: none; font-weight: bold;">
        Ouvrir Paolys
      </a>
    </div>
  `;

  const resend = creerClient();
  return resend.emails.send({
    from: EXPEDITEUR,
    to: destinataire,
    subject: "Ton résumé Paolys du jour ✨",
    html,
  });
}
