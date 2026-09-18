import Link from "next/link";
import { BoutonAccueil } from "@/components/BoutonAccueil";
import { EnTeteLogo } from "@/components/EnTeteLogo";
import { Footer } from "@/components/Footer";
import { getLocale } from "@/lib/i18n/locale";

// Contenu de base — a faire valider par un juriste avant un lancement
// officiel, notamment au regard de la loi ivoirienne sur la protection des
// donnees a caractere personnel (ARTCI) et, le cas echeant, du RGPD pour les
// utilisateurs europeens.
export default async function ConfidentialitePage() {
  const locale = await getLocale();
  return (
    <div className="page-bg flex flex-1 flex-col overflow-y-auto">
      <div className="relative flex h-7 box-content shrink-0 items-center justify-end gap-2 px-6 pt-4">
        <EnTeteLogo />
        <BoutonAccueil />
      </div>
      <div className="mx-auto w-full max-w-2xl px-6 pb-16 pt-4">
        <Link href="/" className="link-warm text-sm">
          ← Accueil
        </Link>
        <h1 className="font-display mt-4 text-3xl text-brand">
          Politique de Confidentialité
        </h1>
        <p className="mt-2 text-sm text-foreground/50">Dernière mise à jour : septembre 2026</p>

        <div className="mt-6 flex flex-col gap-5 text-foreground/80">
          <section>
            <h2 className="text-heading text-foreground">1. Données que nous collectons</h2>
            <ul className="mt-2 list-disc space-y-1 pl-5">
              <li>Informations de profil : prénom, date de naissance, genre, ville, bio, photos, prompts.</li>
              <li>Position géographique (optionnelle), utilisée pour te montrer des profils proches.</li>
              <li>Contenu des messages échangés avec tes matchs.</li>
              <li>Selfie de vérification (si tu utilises cette fonctionnalité), analysé automatiquement puis conservé pour la modération.</li>
              <li>Informations de paiement lors d&apos;un abonnement Paolys+ (traitées par CinetPay — Paolys ne voit ni ne stocke ton numéro de carte).</li>
              <li>Numéro de téléphone si tu utilises la connexion par SMS.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-heading text-foreground">2. Pourquoi on les utilise</h2>
            <p className="mt-2">
              Pour faire fonctionner le service (matching, messagerie), sécuriser la plateforme
              (vérification de profil, lutte contre les faux comptes), traiter tes paiements
              d&apos;abonnement, et t&apos;envoyer des notifications liées à ton compte.
            </p>
          </section>

          <section>
            <h2 className="text-heading text-foreground">3. Avec qui on les partage</h2>
            <p className="mt-2">Tes données sont partagées uniquement avec les prestataires nécessaires au fonctionnement du Service :</p>
            <ul className="mt-2 list-disc space-y-1 pl-5">
              <li><strong>Supabase</strong> — hébergement de la base de données et des photos.</li>
              <li><strong>CinetPay</strong> — traitement des paiements mobile money et carte.</li>
              <li><strong>Twilio</strong> — envoi des codes de connexion par SMS.</li>
              <li><strong>AWS Rekognition</strong> — détection automatique d&apos;un visage net sur les selfies de vérification (aucune reconnaissance faciale d&apos;identité, juste un contrôle qualité).</li>
            </ul>
            <p className="mt-2">
              Nous ne vendons jamais tes données à des tiers à des fins publicitaires.
            </p>
          </section>

          <section>
            <h2 className="text-heading text-foreground">4. Visibilité de tes informations</h2>
            <p className="mt-2">
              Ton prénom, âge, ville, bio, prompts et photos sont visibles par les autres membres
              dans la découverte. Tes messages ne sont visibles que par toi et la personne avec qui
              tu discutes. Ton numéro de téléphone et tes informations de paiement ne sont jamais
              partagés avec d&apos;autres membres.
            </p>
          </section>

          <section>
            <h2 className="text-heading text-foreground">5. Tes droits</h2>
            <p className="mt-2">
              Tu peux à tout moment consulter, modifier ou supprimer les informations de ton profil
              directement dans l&apos;application. Tu peux demander la suppression complète de ton
              compte et de tes données en nous contactant ; nous y donnons suite dans un délai
              raisonnable, sauf obligation légale de conservation (ex. données de facturation).
            </p>
          </section>

          <section>
            <h2 className="text-heading text-foreground">6. Sécurité</h2>
            <p className="mt-2">
              Les photos de profil sont stockées de façon privée et accessibles uniquement via des
              liens temporaires signés. Les mots de passe ne sont jamais stockés en clair. L&apos;accès
              aux données est protégé par des règles de sécurité au niveau de la base de données.
            </p>
          </section>

          <section>
            <h2 className="text-heading text-foreground">7. Conservation</h2>
            <p className="mt-2">
              Tes données sont conservées tant que ton compte est actif. En cas de suppression de
              compte, tes informations de profil et photos sont supprimées ; certaines données
              (historique de paiement) peuvent être conservées plus longtemps si la loi l&apos;exige.
            </p>
          </section>

          <section>
            <h2 className="text-heading text-foreground">8. Contact</h2>
            <p className="mt-2">
              Pour toute question sur cette politique ou pour exercer tes droits, contacte-nous à
              l&apos;adresse indiquée dans l&apos;application.
            </p>
          </section>
        </div>
      </div>
      <Footer locale={locale} />
    </div>
  );
}
