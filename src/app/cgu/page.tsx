import Link from "next/link";
import { BoutonAccueil } from "@/components/BoutonAccueil";
import { EnTeteLogo } from "@/components/EnTeteLogo";

// Contenu de base — a faire valider par un juriste avant un lancement
// officiel (paiement reel, echelle). Couvre les points essentiels : age
// minimum, comportement attendu, abonnement/paiement, moderation, droit
// applicable (Cote d'Ivoire), contact.
export default function CguPage() {
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
          Conditions Générales d&apos;Utilisation
        </h1>
        <p className="mt-2 text-sm text-foreground/50">Dernière mise à jour : septembre 2026</p>

        <div className="mt-6 flex flex-col gap-5 text-foreground/80">
          <section>
            <h2 className="text-heading text-foreground">1. Objet et acceptation</h2>
            <p className="mt-2">
              Les présentes Conditions Générales d&apos;Utilisation (« CGU ») régissent l&apos;accès et
              l&apos;utilisation de l&apos;application Paolys (« le Service »), éditée depuis la Côte
              d&apos;Ivoire. En créant un compte, tu acceptes sans réserve les présentes CGU ainsi que
              la Politique de Confidentialité.
            </p>
          </section>

          <section>
            <h2 className="text-heading text-foreground">2. Âge minimum</h2>
            <p className="mt-2">
              Paolys est strictement réservé aux personnes âgées de <strong>18 ans ou plus</strong>.
              En créant un compte, tu certifies avoir au moins 18 ans. Tout compte dont l&apos;âge
              déclaré s&apos;avère inexact ou inférieur à 18 ans sera supprimé sans préavis.
            </p>
          </section>

          <section>
            <h2 className="text-heading text-foreground">3. Ton compte</h2>
            <p className="mt-2">
              Tu es responsable de l&apos;exactitude des informations fournies (nom, âge, photos) et de
              la confidentialité de ton mot de passe. Un seul compte par personne est autorisé. Tu
              t&apos;engages à ne publier que des photos et informations te concernant réellement — les
              faux profils sont interdits et entraînent la suppression du compte.
            </p>
          </section>

          <section>
            <h2 className="text-heading text-foreground">4. Comportement attendu</h2>
            <p className="mt-2">
              Il est interdit d&apos;utiliser Paolys pour : harceler ou menacer un autre membre,
              publier du contenu haineux, illégal ou à caractère pornographique, usurper l&apos;identité
              d&apos;autrui, solliciter de l&apos;argent à d&apos;autres membres (arnaques), ou utiliser le
              Service à des fins commerciales non autorisées. Tout signalement fait l&apos;objet d&apos;une
              modération ; un compte peut être suspendu ou supprimé en cas de manquement.
            </p>
          </section>

          <section>
            <h2 className="text-heading text-foreground">5. Vérification de profil</h2>
            <p className="mt-2">
              Paolys propose une vérification optionnelle par selfie, comparée aux photos de profil,
              pour obtenir un badge « Profil vérifié ». Cette vérification ne garantit pas
              l&apos;identité complète d&apos;un membre ; elle vise seulement à confirmer que les photos
              correspondent à une personne réelle.
            </p>
          </section>

          <section>
            <h2 className="text-heading text-foreground">6. Abonnement Paolys+ et paiement</h2>
            <p className="mt-2">
              L&apos;essentiel du Service (swipes, matchs, messages) est et restera gratuit. L&apos;abonnement
              payant optionnel « Paolys+ » donne accès à des fonctionnalités de confort (voir qui t&apos;a
              aimé, filtres avancés, boost de visibilité). Les paiements sont traités par notre
              prestataire CinetPay (Orange Money, MTN Money, Wave, Moov Money, carte bancaire) ; Paolys
              ne stocke aucune donnée de carte bancaire. Les montants et durées sont indiqués avant
              tout paiement. Sauf erreur technique de notre part, les abonnements ne sont pas
              remboursables une fois activés.
            </p>
          </section>

          <section>
            <h2 className="text-heading text-foreground">7. Suspension et résiliation</h2>
            <p className="mt-2">
              Tu peux supprimer ton compte à tout moment en nous contactant. Paolys se réserve le
              droit de suspendre ou supprimer un compte en cas de violation des présentes CGU, sans
              obligation de remboursement des sommes déjà versées.
            </p>
          </section>

          <section>
            <h2 className="text-heading text-foreground">8. Responsabilité</h2>
            <p className="mt-2">
              Paolys met en relation des personnes mais ne peut garantir l&apos;exactitude des
              informations fournies par les membres, ni la sécurité des rencontres organisées en
              dehors de l&apos;application. Nous t&apos;invitons à rester prudent·e : privilégie un premier
              rendez-vous dans un lieu public et informe un proche de tes plans (l&apos;application
              propose un outil dédié à cet effet).
            </p>
          </section>

          <section>
            <h2 className="text-heading text-foreground">9. Droit applicable</h2>
            <p className="mt-2">
              Les présentes CGU sont soumises au droit ivoirien. Tout litige relève des juridictions
              compétentes de Côte d&apos;Ivoire.
            </p>
          </section>

          <section>
            <h2 className="text-heading text-foreground">10. Contact</h2>
            <p className="mt-2">
              Pour toute question relative aux présentes CGU, contacte-nous à l&apos;adresse indiquée
              dans l&apos;application.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
