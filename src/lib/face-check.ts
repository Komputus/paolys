import { RekognitionClient, DetectFacesCommand } from "@aws-sdk/client-rekognition";

// Cree paresseusement (pas au chargement du module) : sinon Next.js evalue le
// constructeur pendant `next build` (collecte des donnees de page), qui
// echoue si les variables AWS_* ne sont pas encore configurees sur la
// plateforme de deploiement.
function creerClient() {
  return new RekognitionClient({
    region: process.env.AWS_REGION,
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
    },
  });
}

export type ResultatFaceCheck =
  | { ok: true }
  | { ok: false; raison: string };

export async function verifierUnVisageNet(bytes: Uint8Array): Promise<ResultatFaceCheck> {
  const client = creerClient();
  const reponse = await client.send(
    new DetectFacesCommand({
      Image: { Bytes: bytes },
      Attributes: ["DEFAULT"],
    }),
  );

  const visages = reponse.FaceDetails ?? [];

  if (visages.length === 0) {
    return { ok: false, raison: "Aucun visage détecté sur la photo. Reprends un selfie de face, bien éclairé." };
  }

  if (visages.length > 1) {
    return { ok: false, raison: "Plusieurs visages détectés. Le selfie doit montrer uniquement toi." };
  }

  const [visage] = visages;
  const confiance = visage.Confidence ?? 0;

  if (confiance < 90) {
    return { ok: false, raison: "Le visage n'est pas assez net. Reprends la photo dans un endroit bien éclairé." };
  }

  return { ok: true };
}
