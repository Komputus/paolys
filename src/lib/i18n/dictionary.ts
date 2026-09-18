export type Locale = "fr" | "en";

export const LOCALES: Locale[] = ["fr", "en"];
export const DEFAULT_LOCALE: Locale = "fr";
export const LOCALE_COOKIE = "paolys_locale";

export function estLocale(valeur: string | undefined | null): valeur is Locale {
  return valeur === "fr" || valeur === "en";
}

const fr = {
  nav: {
    monProfil: "← Mon profil",
    messages: "← Messages",
    accueil: "← Accueil",
    aProximite: "À proximité",
    rencontres: "Rencontres",
    likes: "Likes",
    discussions: "Discussions",
    profil: "Profil",
  },
  commun: {
    copier: "Copier",
    copie: "Copié ✓",
  },
  footer: {
    cgu: "CGU",
    confidentialite: "Confidentialité",
    mentionsLegales: "Mentions légales",
    contact: "Contact",
  },
  cgu: {
    titre: "Conditions Générales d'Utilisation",
    miseAJour: "Dernière mise à jour : septembre 2026",
    sections: [
      {
        titre: "1. Objet et acceptation",
        texte:
          "Les présentes Conditions Générales d'Utilisation (« CGU ») régissent l'accès et l'utilisation de l'application Paolys (« le Service »), éditée depuis la Côte d'Ivoire. En créant un compte, tu acceptes sans réserve les présentes CGU ainsi que la Politique de Confidentialité.",
      },
      {
        titre: "2. Âge minimum",
        texte:
          "Paolys est strictement réservé aux personnes âgées de 18 ans ou plus. En créant un compte, tu certifies avoir au moins 18 ans. Tout compte dont l'âge déclaré s'avère inexact ou inférieur à 18 ans sera supprimé sans préavis.",
      },
      {
        titre: "3. Ton compte",
        texte:
          "Tu es responsable de l'exactitude des informations fournies (nom, âge, photos) et de la confidentialité de ton mot de passe. Un seul compte par personne est autorisé. Tu t'engages à ne publier que des photos et informations te concernant réellement — les faux profils sont interdits et entraînent la suppression du compte.",
      },
      {
        titre: "4. Comportement attendu",
        texte:
          "Il est interdit d'utiliser Paolys pour : harceler ou menacer un autre membre, publier du contenu haineux, illégal ou à caractère pornographique, usurper l'identité d'autrui, solliciter de l'argent à d'autres membres (arnaques), ou utiliser le Service à des fins commerciales non autorisées. Tout signalement fait l'objet d'une modération ; un compte peut être suspendu ou supprimé en cas de manquement.",
      },
      {
        titre: "5. Vérification de profil",
        texte:
          "Paolys propose une vérification optionnelle par selfie, comparée aux photos de profil, pour obtenir un badge « Profil vérifié ». Cette vérification ne garantit pas l'identité complète d'un membre ; elle vise seulement à confirmer que les photos correspondent à une personne réelle.",
      },
      {
        titre: "6. Abonnement Paolys+ et paiement",
        texte:
          "L'essentiel du Service (swipes, matchs, messages) est et restera gratuit. L'abonnement payant optionnel « Paolys+ » donne accès à des fonctionnalités de confort (voir qui t'a aimé, filtres avancés, boost de visibilité). Les paiements sont traités par notre prestataire CinetPay (Orange Money, MTN Money, Wave, Moov Money, carte bancaire) ; Paolys ne stocke aucune donnée de carte bancaire. Les montants et durées sont indiqués avant tout paiement. Sauf erreur technique de notre part, les abonnements ne sont pas remboursables une fois activés.",
      },
      {
        titre: "7. Suspension et résiliation",
        texte:
          "Tu peux supprimer ton compte à tout moment en nous contactant. Paolys se réserve le droit de suspendre ou supprimer un compte en cas de violation des présentes CGU, sans obligation de remboursement des sommes déjà versées.",
      },
      {
        titre: "8. Responsabilité",
        texte:
          "Paolys met en relation des personnes mais ne peut garantir l'exactitude des informations fournies par les membres, ni la sécurité des rencontres organisées en dehors de l'application. Nous t'invitons à rester prudent·e : privilégie un premier rendez-vous dans un lieu public et informe un proche de tes plans (l'application propose un outil dédié à cet effet).",
      },
      {
        titre: "9. Droit applicable",
        texte:
          "Les présentes CGU sont soumises au droit ivoirien. Tout litige relève des juridictions compétentes de Côte d'Ivoire.",
      },
      {
        titre: "10. Contact",
        texte:
          "Pour toute question relative aux présentes CGU, contacte-nous à l'adresse indiquée dans l'application.",
      },
    ],
  },
  confidentialite: {
    titre: "Politique de Confidentialité",
    miseAJour: "Dernière mise à jour : septembre 2026",
    sections: [
      {
        titre: "1. Données que nous collectons",
        items: [
          "Informations de profil : prénom, date de naissance, genre, ville, bio, photos, prompts.",
          "Position géographique (optionnelle), utilisée pour te montrer des profils proches.",
          "Contenu des messages échangés avec tes matchs.",
          "Selfie de vérification (si tu utilises cette fonctionnalité), analysé automatiquement puis conservé pour la modération.",
          "Informations de paiement lors d'un abonnement Paolys+ (traitées par CinetPay — Paolys ne voit ni ne stocke ton numéro de carte).",
          "Numéro de téléphone si tu utilises la connexion par SMS.",
        ],
      },
      {
        titre: "2. Pourquoi on les utilise",
        texte:
          "Pour faire fonctionner le service (matching, messagerie), sécuriser la plateforme (vérification de profil, lutte contre les faux comptes), traiter tes paiements d'abonnement, et t'envoyer des notifications liées à ton compte.",
      },
      {
        titre: "3. Avec qui on les partage",
        texte: "Tes données sont partagées uniquement avec les prestataires nécessaires au fonctionnement du Service :",
        items: [
          "Supabase — hébergement de la base de données et des photos.",
          "CinetPay — traitement des paiements mobile money et carte.",
          "Twilio — envoi des codes de connexion par SMS.",
          "AWS Rekognition — détection automatique d'un visage net sur les selfies de vérification (aucune reconnaissance faciale d'identité, juste un contrôle qualité).",
        ],
        texteApres: "Nous ne vendons jamais tes données à des tiers à des fins publicitaires.",
      },
      {
        titre: "4. Visibilité de tes informations",
        texte:
          "Ton prénom, âge, ville, bio, prompts et photos sont visibles par les autres membres dans la découverte. Tes messages ne sont visibles que par toi et la personne avec qui tu discutes. Ton numéro de téléphone et tes informations de paiement ne sont jamais partagés avec d'autres membres.",
      },
      {
        titre: "5. Tes droits",
        texte:
          "Tu peux à tout moment consulter, modifier ou supprimer les informations de ton profil directement dans l'application. Tu peux demander la suppression complète de ton compte et de tes données en nous contactant ; nous y donnons suite dans un délai raisonnable, sauf obligation légale de conservation (ex. données de facturation).",
      },
      {
        titre: "6. Sécurité",
        texte:
          "Les photos de profil sont stockées de façon privée et accessibles uniquement via des liens temporaires signés. Les mots de passe ne sont jamais stockés en clair. L'accès aux données est protégé par des règles de sécurité au niveau de la base de données.",
      },
      {
        titre: "7. Conservation",
        texte:
          "Tes données sont conservées tant que ton compte est actif. En cas de suppression de compte, tes informations de profil et photos sont supprimées ; certaines données (historique de paiement) peuvent être conservées plus longtemps si la loi l'exige.",
      },
      {
        titre: "8. Contact",
        texte:
          "Pour toute question sur cette politique ou pour exercer tes droits, contacte-nous à l'adresse indiquée dans l'application.",
      },
    ],
  },
  mentionsLegales: {
    titre: "Mentions légales",
    editeurTitre: "Éditeur du site",
    editeurAvertissement:
      "⚠️ À compléter : nom de l'entité ou de l'auto-entrepreneur exploitant Paolys, forme juridique, adresse du siège, numéro d'immatriculation (RCCM) si applicable, et coordonnées de contact du responsable de la publication.",
    hebergementTitre: "Hébergement",
    hebergementTexte:
      "L'application est hébergée par Vercel Inc. (440 N Barranca Ave #4133, Covina, CA 91723, États-Unis) et sa base de données par Supabase Inc.",
    proprieteTitre: "Propriété intellectuelle",
    proprieteTexte:
      "Le nom « Paolys », son logo et son identité visuelle sont la propriété de l'éditeur. Toute reproduction sans autorisation est interdite.",
    contactTitre: "Contact",
    contactTexte: "Pour toute question, consulte la page",
    contactLien: "Contact",
  },
  contact: {
    titre: "Contact",
    intro: "Une question, un problème, un signalement ? Écris-nous, nous te répondrons dès que possible.",
    emailTitre: "Par e-mail",
    emailAvertissement: "⚠️ À compléter : adresse e-mail de support à afficher ici (ex. contact@paolys.app).",
    signalerTitre: "Signaler un profil ou un abus",
    signalerTexte:
      "Si tu rencontres un comportement inapproprié sur l'application, utilise en priorité le bouton de signalement présent sur les profils et conversations concernés — cela nous permet d'agir plus vite.",
  },
  home: {
    kicker: "Il était une fois",
    tagline: "Derrière chaque profil, une vraie personne, pour des amitiés et rencontres sincères",
    creerCompte: "Créer mon compte",
    dejaCompte: "J'ai déjà un compte",
    photosLegende: "De vraies personnes se cachent derrière chaque profil.",
    valeursTitre: "Pourquoi Paolys",
    valeurs: [
      {
        titre: "Des profils vérifiés",
        texte: "Un badge de vérification par selfie, pour savoir que la personne en face est bien réelle.",
      },
      {
        titre: "Des rencontres sincères",
        texte: "Des prompts pour te présenter en vrai, pas juste une photo et un swipe à l'aveugle.",
      },
      {
        titre: "Toujours gratuit à l'essentiel",
        texte: "Swipes, matchs et messages illimités — l'essentiel y est déjà.",
      },
    ],
    commentCaMarcheTitre: "Comment ça marche",
    etapes: [
      { titre: "Crée ton profil", texte: "Quelques infos, une photo, et tes prompts pour te démarquer." },
      { titre: "Découvre & matche", texte: "Swipe parmi des profils proches de toi, gratuitement." },
      { titre: "Discute en confiance", texte: "Le match confirmé, lance la conversation à ton rythme." },
    ],
    confianceTitre: "La confiance avant tout",
    confianceTexte:
      "Vérification par photo, signalement et blocage en un geste, modération active : ta sécurité n'est pas une option.",
    ctaFinaleTitre: "Prêt·e à faire de vraies rencontres ?",
    footerTexte: "Fait avec ♥",
    decouvrirPremium: "✨ Découvrir Paolys+",
    statProfilsVerifies: "profils vérifiés",
  },
  langue: {
    francais: "FR",
    anglais: "EN",
  },
  auth: {
    connexionTitre: "Bon retour",
    connexionSousTitre: "Connecte-toi à ton compte Paolys.",
    email: "Email",
    motDePasse: "Mot de passe",
    seConnecter: "Se connecter",
    pasDeCompte: "Pas encore de compte ?",
    sInscrire: "S'inscrire",
    inscriptionTitre: "Rejoindre Paolys",
    inscriptionSousTitre: "Crée ton compte en une minute.",
    prenom: "Prénom",
    creerMonCompte: "Créer mon compte",
    dejaUnCompte: "Déjà un compte ?",
    seConnecterLien: "Se connecter",
    jaiAgeEtAccepte: "Je certifie avoir 18 ans ou plus et j'accepte les",
    cgu: "Conditions Générales d'Utilisation",
    et: "et la",
    politiqueConfidentialite: "Politique de Confidentialité",
    erreurConditions: "Merci de confirmer ton âge et d'accepter les conditions pour continuer.",
    motDePasseOublie: "Mot de passe oublié ?",
    ou: "ou",
    continuerAvecGoogle: "Continuer avec Google",
    chargement: "Chargement…",
    erreurs: {
      "Invalid login credentials": "Email ou mot de passe incorrect.",
      "User already registered": "Un compte existe déjà avec cet email.",
      "Password should be at least 6 characters":
        "Le mot de passe doit contenir au moins 6 caractères.",
      "Email not confirmed": "Confirme d'abord ton email avant de te connecter.",
    } as Record<string, string>,
  },
  motDePasseOublie: {
    titre: "Mot de passe oublié",
    texte: "Indique ton email, on t'envoie un lien pour en choisir un nouveau.",
    envoyer: "Envoyer le lien",
    emailEnvoyeTitre: "Vérifie ta boîte mail",
    emailEnvoyeTexte:
      "Si un compte existe avec cet email, un lien de réinitialisation vient d'être envoyé.",
    retourConnexion: "Retour à la connexion",
  },
  nouveauMotDePasse: {
    titre: "Choisis un nouveau mot de passe",
    label: "Nouveau mot de passe",
    confirmer: "Mettre à jour le mot de passe",
    succes: "Mot de passe mis à jour. Tu peux te connecter.",
    erreurLienInvalide:
      "Ce lien n'est plus valide. Redemande un lien de réinitialisation.",
  },
  verifiezEmails: {
    titre: "Vérifie ta boîte mail",
    texte:
      "On vient de t'envoyer un lien de confirmation. Clique dessus pour activer ton compte Paolys, puis reviens te connecter.",
  },
  profilCompleter: {
    titre: "Ton profil",
    sousTitre: "Quelques infos pour te présenter aux autres membres.",
    prenom: "Prénom",
    dateNaissance: "Date de naissance",
    tuEs: "Tu es",
    choisir: "Choisir",
    unHomme: "Un homme",
    uneFemme: "Une femme",
    autre: "Autre",
    tuRecherches: "Tu recherches",
    desHommes: "Des hommes",
    desFemmes: "Des femmes",
    toutLeMonde: "Tout le monde",
    ville: "Ville",
    villePlaceholder: "Abidjan",
    bio: "Bio",
    bioPlaceholder: "Parle un peu de toi...",
    photoTitre: "Photo de profil (optionnelle)",
    photoTexte:
      "Sans photo, tu ne verras pas non plus celles des autres membres en découverte.",
    valider: "Valider mon profil",
    erreurAge: "Tu dois avoir au moins 18 ans pour utiliser Paolys.",
  },
  localisation: {
    positionEnregistree: "Position enregistrée ✓",
    enCours: "Localisation en cours...",
    utiliserPosition: "Utiliser ma position",
    erreur: "Impossible d'accéder à ta position. Tu peux continuer sans — on utilisera ta ville.",
    aide: "Optionnel : aide à te montrer les profils les plus proches.",
  },
  fileInput: {
    choisirFichier: "Choisir un fichier",
  },
  profil: {
    profilVerifie: "✓ Profil vérifié",
    verificationEnCours: "Vérification en cours d'examen",
    refaireVerification: "Refaire une demande de vérification",
    faireVerifier: "Faire vérifier mon profil",
    modifierPrompts: "Modifier mes prompts",
    ajouterPrompts: "Ajouter des prompts (plus vivant qu'une bio)",
    inviteAmis: "Invite tes amis sur Paolys",
    inviteTexte: (n: number) =>
      `3 jours de Paolys+ offerts à toi et à ton ami·e dès qu'il/elle complète son profil.${
        n > 0 ? ` ${n} déjà invité(e)s.` : ""
      }`,
    passerPremium: "Passer à Paolys+",
    passerPremiumTitre: "✨ Débloque Paolys+",
    passerPremiumTexte: "Vois qui t'a déjà aimé, filtres avancés, boost de visibilité — un peu plus de confort, sans jamais rendre l'essentiel payant.",
    premiumActif: (date: string) => `✨ Paolys+ actif jusqu'au ${date}`,
    decouvrirProfils: "Découvrir des profils",
    quiTaAime: "Qui t'a aimé",
    messages: "Messages",
    profilsExclusifs: "Profils exclusifs",
    espaceSponsor: "Espace sponsor",
    adminVerifications: "Admin · Vérifications",
    adminSignalements: "Admin · Signalements",
    seDeconnecter: "Se déconnecter",
    modifierProfil: "Modifier mon profil",
  },
  profilModifier: {
    titre: "Modifier mon profil",
    verificationTitre: "Vérification par photo",
    verificationTexteAFaire:
      "Un badge qui inspire confiance : les profils vérifiés reçoivent bien plus de matchs.",
    verificationCta: "Faire vérifier par photo",
    verificationFait: "✓ Profil vérifié",
    verificationEnCours: "Ta demande est en cours d'examen",
    verificationRefusee: "Demande refusée — réessaie",
    champs: {
      displayName: "Prénom",
      birthDate: "Date de naissance",
      gender: "Tu es",
      lookingFor: "Tu recherches",
      city: "Ville",
      bio: "À propos",
    },
    nonRenseigne: "Non renseigné",
    modifier: "Modifier",
    enregistrer: "Enregistrer",
    annuler: "Annuler",
    erreurAge: "Tu dois avoir au moins 18 ans pour utiliser Paolys.",
    erreurRequis: "Ce champ est obligatoire.",
  },
  prompts: {
    titre: "Tes trois prompts",
    sousTitre:
      "Bien plus vivant qu'une bio vide — choisis jusqu'à 3 questions et réponds-y avec ton ton à toi.",
    question: (n: number) => `Question ${n}`,
    aucune: "— Aucune —",
    reponsePlaceholder: "Ta réponse...",
    enregistrer: "Enregistrer",
    erreurQuestionInvalide: "Question invalide.",
    options: {
      lieu_reve: "Un lieu que je rêve de visiter à deux...",
      rendezvous_parfait: "Ma définition d'un rendez-vous parfait...",
      ne_peux_pas_vivre_sans: "Je ne peux pas vivre sans...",
      compliment_prefere: "Le compliment que j'aime le plus recevoir...",
      plat_prefere: "Mon plat préféré...",
      a_savoir: "Une chose à savoir sur moi avant de me rencontrer...",
      dimanche_ideal: "Mon dimanche idéal ressemble à...",
      fait_rire: "Ce qui me fait rire à coup sûr...",
    } as Record<string, string>,
  },
  verification: {
    titre: "Vérification du profil",
    texte:
      "Un selfie clair de ton visage, comparé à tes photos de profil, pour obtenir le badge « Profil vérifié ». Optionnel, mais ça rassure les autres membres.",
    dejaVerifie: "Ton profil est déjà vérifié ✓",
    enAttente: "Ta demande est en cours d'examen. On te préviendra une fois traitée.",
    refusee:
      "Ta dernière demande a été refusée (selfie pas assez clair ou ne correspondant pas à tes photos). Tu peux réessayer.",
    tonSelfie: "Ton selfie",
    envoyer: "Envoyer pour vérification",
    erreurSansSelfie: "Ajoute un selfie pour continuer.",
    erreurDejaEnAttente: "Tu as déjà une demande en cours d'examen.",
  },
  premium: {
    edition: "Édition Sensation",
    texteIntro:
      "Tout ce qui fait Paolys reste gratuit — swipes, matchs et messages illimités. Paolys+ ajoute juste un peu plus de confort.",
    avantages: [
      "Voir qui t'a déjà aimé avant de swiper toi-même",
      "Filtres avancés (tranche d'âge, profils vérifiés uniquement)",
      "Annuler un swipe (rattraper un « passer » accidentel)",
      "Boost de visibilité pendant 24h",
      "Mode discret : navigue sans apparaître dans la découverte des autres",
    ],
    abonnementActif: (date: string) => `Abonnement actif jusqu'au ${date}`,
    abonnerMois: (montant: number) => `S'abonner 1 mois — ${montant} FCFA`,
    abonnerSemaine: (montant: number) => `S'abonner 1 semaine — ${montant} FCFA`,
    paiementSecurise:
      "Paiement sécurisé via CinetPay (Orange Money, MTN, Wave, Moov, carte).",
  },
  premiumControls: {
    boostActif: (heure: string) => `Boost actif jusqu'à ${heure}`,
    boosterProfil: "Booster mon profil (24h)",
    modeDiscret: "Mode discret (invisible en découverte)",
  },
  profilsExclusifs: {
    titre: "Profils exclusifs",
    sousTitre: "Des membres privilégiés qui ont choisi de te montrer leur profil.",
    rien: "Rien pour l'instant.",
  },
  aimesPar: {
    titreAvecCompte: (n: number) =>
      `${n} personne${n > 1 ? "s" : ""} t'ont déjà aimé ✨`,
    titreSansCompte: "Personne ne t'a encore aimé",
    texteIncitation: "Passe à Paolys+ pour voir qui, sans attendre de matcher au hasard.",
    decouvrirPremium: "Découvrir Paolys+",
    titre: "Qui t'a aimé",
    rien: "Personne pour l'instant — reviens plus tard !",
    allerDecouverte: "Aller à la découverte pour leur répondre",
  },
  messagesListe: {
    titre: "Messages",
    aucunMatch: "Pas encore de match. Va découvrir des profils !",
    ditesBonjour: "Dites bonjour !",
  },
  conversation: {
    ditesBonjourA: (nom: string) => `Dites bonjour à ${nom} !`,
    ecrisMessage: "Écris un message...",
    envoyer: "Envoyer",
    signaler: "Signaler",
    bloquer: "Bloquer",
    erreurEnvoi: "Erreur lors de l'envoi.",
    erreurContact:
      "Le partage d'un numéro ou d'un email dans le chat est réservé aux membres Paolys+ ou sponsors.",
    erreurNonConnecte: "Non connecté.",
  },
  moderation: {
    confirmerBlocage: (nom: string) => `Bloquer ${nom} ? Vous ne vous verrez plus mutuellement.`,
    raisonPlaceholder: "Pourquoi signales-tu ce profil ?",
    envoyerSignalement: "Envoyer le signalement",
    signalementEnvoye: "Signalement envoyé, merci.",
    erreurRaisonVide: "Merci de préciser la raison du signalement.",
  },
  decouverte: {
    filtres: "Filtres",
    ageMin: "Âge min",
    ageMax: "Âge max",
    verifiesUniquement: "Profils vérifiés uniquement",
    appliquer: "Appliquer",
    cestReciproque: "C'est réciproque",
    cestUnMatch: "C'est un match !",
    plusMutuellement: (nom: string) => `Toi et ${nom} vous êtes plu mutuellement.`,
    envoyerMessage: "Envoyer un message",
    continuerDecouvrir: "Continuer à découvrir",
    plusDeProfils: "Plus de profils pour le moment. Reviens un peu plus tard !",
    ajoutePhoto: "Ajoute ta photo pour voir celles des autres",
    annulerSwipe: "Annuler le dernier swipe",
    passer: "Passer",
    jAime: "J'aime",
    superLike: "Super like",
    ans: (age: number) => `${age} ans`,
    verifie: "Vérifié",
    voirPrompts: "Voir plus",
  },
  rendezvous: {
    bouton: "🛡️ Programmer un rendez-vous en sécurité",
    partageTitre: "Partage les détails avec un proche",
    partageTexte:
      "On génère un lien à envoyer toi-même (WhatsApp, SMS...) à quelqu'un de confiance — pas besoin qu'il ait un compte Paolys.",
    partagerLien: "Partager le lien",
    lienCopie: "Lien copié !",
    lieuPlaceholder: "Lieu du rendez-vous",
    notePlaceholder: "Note pour ton proche (optionnel)",
    genererLien: "Générer le lien",
    erreurCreation: "Erreur lors de la création.",
    partageTitreNatif: "Mon rendez-vous Paolys",
    partageTexteNatif: "Voici les détails de mon rendez-vous, pour ta sécurité :",
  },
  rendezvousPublic: {
    kicker: "Rendez-vous Paolys",
    rencontre: (organisateur: string, rencontre: string) => `${organisateur} rencontre ${rencontre}`,
    partage:
      "Partagé depuis Paolys pour plus de sécurité — si tu es cette personne de confiance, garde un œil sur l'heure prévue.",
  },
  demandeRdv: {
    bouton: "💌 Demander un rendez-vous",
    enAttenteAcceptation: (nom: string) => `En attente de la réponse de ${nom}.`,
    proposeAcceptation: (nom: string) => `${nom} propose de se rencontrer.`,
    accepter: "Accepter",
    refuser: "Refuser",
    confirme: (nom: string) => `🎉 Vous avez tous les deux accepté de vous rencontrer ! Mettez-vous d'accord sur le lieu et la date ici, dans la conversation avec ${nom}.`,
    refuseTexte: "Demande de rendez-vous refusée.",
    erreur: "Une erreur est survenue.",
  },
  sponsor: {
    titre: "Espace sponsor",
    texte:
      "Ton profil n'apparaît dans la découverte de personne — choisis à qui tu montres ton profil, ta photo et ton contact.",
    numeroLabel: "Ton numéro (révélé uniquement à qui tu autorises)",
    numeroPlaceholder: "+225 07 00 00 00 00",
    enregistrer: "Enregistrer",
    voirProfil: "Voir mon profil",
    voirPhoto: "Voir ma photo",
    voirContact: "Voir mon contact",
  },
  adminVerifications: {
    titre: "Vérifications en attente",
    aucune: "Aucune demande en attente.",
    selfie: "Selfie",
    photoProfil: "Photo de profil",
    approuver: "Approuver",
    rejeter: "Rejeter",
  },
  adminSignalements: {
    titre: "Signalements en attente",
    aucun: "Aucun signalement en attente.",
    signale: "signale",
    marquerTraite: "Marquer traité",
  },
  paiementRetour: {
    recu: "Paiement reçu !",
    enCours: "Paiement en cours de traitement",
    texteRecu: "Ton abonnement Paolys+ sera actif dans quelques instants.",
    texteEnCours:
      "On confirme ton paiement avec CinetPay — ça peut prendre une minute. Reviens sur ton profil pour vérifier.",
    retour: "Retour à mon profil",
  },
};

type Dictionary = typeof fr;

const en: Dictionary = {
  nav: {
    monProfil: "← My profile",
    messages: "← Messages",
    accueil: "← Home",
    aProximite: "Nearby",
    rencontres: "Encounters",
    likes: "Likes",
    discussions: "Chats",
    profil: "Profile",
  },
  commun: {
    copier: "Copy",
    copie: "Copied ✓",
  },
  footer: {
    cgu: "Terms",
    confidentialite: "Privacy",
    mentionsLegales: "Legal notice",
    contact: "Contact",
  },
  cgu: {
    titre: "Terms of Service",
    miseAJour: "Last updated: September 2026",
    sections: [
      {
        titre: "1. Purpose and acceptance",
        texte:
          "These Terms of Service (\"Terms\") govern access to and use of the Paolys application (\"the Service\"), published from Côte d'Ivoire. By creating an account, you accept these Terms without reservation, as well as the Privacy Policy.",
      },
      {
        titre: "2. Minimum age",
        texte:
          "Paolys is strictly reserved for people aged 18 or older. By creating an account, you certify that you are at least 18. Any account whose declared age is found to be inaccurate or under 18 will be deleted without notice.",
      },
      {
        titre: "3. Your account",
        texte:
          "You are responsible for the accuracy of the information you provide (name, age, photos) and for keeping your password confidential. Only one account per person is allowed. You agree to only post photos and information that genuinely represent you — fake profiles are prohibited and will result in account deletion.",
      },
      {
        titre: "4. Expected behaviour",
        texte:
          "It is forbidden to use Paolys to: harass or threaten another member, post hateful, illegal or pornographic content, impersonate someone else, solicit money from other members (scams), or use the Service for unauthorised commercial purposes. Every report is reviewed by moderation; an account may be suspended or deleted in case of a breach.",
      },
      {
        titre: "5. Profile verification",
        texte:
          "Paolys offers an optional selfie verification, compared to profile photos, to earn a \"Verified profile\" badge. This verification does not guarantee a member's full identity; it only aims to confirm that the photos match a real person.",
      },
      {
        titre: "6. Paolys+ subscription and payment",
        texte:
          "The core of the Service (swipes, matches, messages) is and will remain free. The optional paid \"Paolys+\" subscription unlocks convenience features (see who liked you, advanced filters, visibility boost). Payments are processed by our provider CinetPay (Orange Money, MTN Money, Wave, Moov Money, card); Paolys never stores your card details. Amounts and durations are shown before any payment. Except in case of a technical error on our part, subscriptions are non-refundable once activated.",
      },
      {
        titre: "7. Suspension and termination",
        texte:
          "You can delete your account at any time by contacting us. Paolys reserves the right to suspend or delete an account in case of a breach of these Terms, without any obligation to refund amounts already paid.",
      },
      {
        titre: "8. Liability",
        texte:
          "Paolys connects people but cannot guarantee the accuracy of information provided by members, nor the safety of meetings arranged outside the application. We encourage you to stay cautious: favour a first date in a public place and let someone close to you know your plans (the application offers a dedicated tool for this).",
      },
      {
        titre: "9. Governing law",
        texte:
          "These Terms are governed by the law of Côte d'Ivoire. Any dispute falls under the jurisdiction of the competent courts of Côte d'Ivoire.",
      },
      {
        titre: "10. Contact",
        texte: "For any question about these Terms, contact us at the address shown in the application.",
      },
    ],
  },
  confidentialite: {
    titre: "Privacy Policy",
    miseAJour: "Last updated: September 2026",
    sections: [
      {
        titre: "1. Data we collect",
        items: [
          "Profile information: first name, date of birth, gender, city, bio, photos, prompts.",
          "Geographic location (optional), used to show you nearby profiles.",
          "Content of messages exchanged with your matches.",
          "Verification selfie (if you use this feature), analysed automatically then kept for moderation purposes.",
          "Payment information for a Paolys+ subscription (processed by CinetPay — Paolys never sees or stores your card number).",
          "Phone number if you use SMS sign-in.",
        ],
      },
      {
        titre: "2. Why we use it",
        texte:
          "To operate the service (matching, messaging), secure the platform (profile verification, fighting fake accounts), process your subscription payments, and send you account-related notifications.",
      },
      {
        titre: "3. Who we share it with",
        texte: "Your data is only shared with the providers necessary to operate the Service:",
        items: [
          "Supabase — database and photo hosting.",
          "CinetPay — mobile money and card payment processing.",
          "Twilio — sending SMS sign-in codes.",
          "AWS Rekognition — automatic detection of a clear face on verification selfies (no facial identity recognition, just a quality check).",
        ],
        texteApres: "We never sell your data to third parties for advertising purposes.",
      },
      {
        titre: "4. Visibility of your information",
        texte:
          "Your first name, age, city, bio, prompts and photos are visible to other members in discovery. Your messages are only visible to you and the person you're chatting with. Your phone number and payment information are never shared with other members.",
      },
      {
        titre: "5. Your rights",
        texte:
          "You can view, edit or delete your profile information at any time directly in the application. You can request full deletion of your account and data by contacting us; we will act on it within a reasonable time, except where the law requires us to retain certain data (e.g. billing records).",
      },
      {
        titre: "6. Security",
        texte:
          "Profile photos are stored privately and are only accessible via temporary signed links. Passwords are never stored in plain text. Access to data is protected by security rules at the database level.",
      },
      {
        titre: "7. Retention",
        texte:
          "Your data is kept as long as your account is active. If you delete your account, your profile information and photos are deleted; some data (payment history) may be kept longer if required by law.",
      },
      {
        titre: "8. Contact",
        texte: "For any question about this policy or to exercise your rights, contact us at the address shown in the application.",
      },
    ],
  },
  mentionsLegales: {
    titre: "Legal Notice",
    editeurTitre: "Publisher",
    editeurAvertissement:
      "⚠️ To be completed: name of the entity or sole proprietor operating Paolys, legal form, registered address, business registration number (RCCM) if applicable, and contact details of the publication manager.",
    hebergementTitre: "Hosting",
    hebergementTexte:
      "The application is hosted by Vercel Inc. (440 N Barranca Ave #4133, Covina, CA 91723, USA) and its database by Supabase Inc.",
    proprieteTitre: "Intellectual property",
    proprieteTexte:
      "The name \"Paolys\", its logo and visual identity are the property of the publisher. Any reproduction without authorisation is prohibited.",
    contactTitre: "Contact",
    contactTexte: "For any question, see the",
    contactLien: "Contact",
  },
  contact: {
    titre: "Contact",
    intro: "A question, a problem, something to report? Write to us, we'll get back to you as soon as possible.",
    emailTitre: "By email",
    emailAvertissement: "⚠️ To be completed: support email address to display here (e.g. contact@paolys.app).",
    signalerTitre: "Report a profile or abuse",
    signalerTexte:
      "If you encounter inappropriate behaviour on the application, use the report button on the profiles and conversations concerned as a priority — this helps us act faster.",
  },
  home: {
    kicker: "Once upon a time",
    tagline: "Behind every profile, a real person, for genuine friendships and encounters",
    creerCompte: "Create my account",
    dejaCompte: "I already have an account",
    photosLegende: "Real people are behind every profile.",
    valeursTitre: "Why Paolys",
    valeurs: [
      {
        titre: "Verified profiles",
        texte: "A selfie verification badge, so you know the person on the other side is really real.",
      },
      {
        titre: "Genuine connections",
        texte: "Prompts to show who you really are — not just a photo and a blind swipe.",
      },
      {
        titre: "Always free where it counts",
        texte: "Unlimited swipes, matches and messages — the essentials are already here.",
      },
    ],
    commentCaMarcheTitre: "How it works",
    etapes: [
      { titre: "Create your profile", texte: "A few details, a photo, and your prompts to stand out." },
      { titre: "Discover & match", texte: "Swipe through profiles near you, for free." },
      { titre: "Chat with confidence", texte: "Once matched, start the conversation at your own pace." },
    ],
    confianceTitre: "Trust comes first",
    confianceTexte:
      "Photo verification, one-tap reporting and blocking, active moderation: your safety isn't optional.",
    ctaFinaleTitre: "Ready for real encounters?",
    footerTexte: "Made with ♥",
    decouvrirPremium: "✨ Discover Paolys+",
    statProfilsVerifies: "verified profiles",
  },
  langue: {
    francais: "FR",
    anglais: "EN",
  },
  auth: {
    connexionTitre: "Welcome back",
    connexionSousTitre: "Sign in to your Paolys account.",
    email: "Email",
    motDePasse: "Password",
    seConnecter: "Sign in",
    pasDeCompte: "Don't have an account yet?",
    sInscrire: "Sign up",
    inscriptionTitre: "Join Paolys",
    inscriptionSousTitre: "Create your account in a minute.",
    prenom: "First name",
    creerMonCompte: "Create my account",
    dejaUnCompte: "Already have an account?",
    seConnecterLien: "Sign in",
    jaiAgeEtAccepte: "I certify that I am 18 or older and I agree to the",
    cgu: "Terms of Service",
    et: "and the",
    politiqueConfidentialite: "Privacy Policy",
    erreurConditions: "Please confirm your age and accept the terms to continue.",
    motDePasseOublie: "Forgot password?",
    ou: "or",
    continuerAvecGoogle: "Continue with Google",
    chargement: "Loading…",
    erreurs: {
      "Invalid login credentials": "Incorrect email or password.",
      "User already registered": "An account already exists with this email.",
      "Password should be at least 6 characters":
        "Password must be at least 6 characters long.",
      "Email not confirmed": "Please confirm your email before signing in.",
    } as Record<string, string>,
  },
  motDePasseOublie: {
    titre: "Forgot password",
    texte: "Enter your email and we'll send you a link to choose a new one.",
    envoyer: "Send the link",
    emailEnvoyeTitre: "Check your inbox",
    emailEnvoyeTexte: "If an account exists with that email, a reset link was just sent.",
    retourConnexion: "Back to sign in",
  },
  nouveauMotDePasse: {
    titre: "Choose a new password",
    label: "New password",
    confirmer: "Update password",
    succes: "Password updated. You can now sign in.",
    erreurLienInvalide: "This link is no longer valid. Request a new reset link.",
  },
  verifiezEmails: {
    titre: "Check your inbox",
    texte:
      "We just sent you a confirmation link. Click it to activate your Paolys account, then come back to sign in.",
  },
  profilCompleter: {
    titre: "Your profile",
    sousTitre: "A few details to introduce yourself to other members.",
    prenom: "First name",
    dateNaissance: "Date of birth",
    tuEs: "You are",
    choisir: "Choose",
    unHomme: "A man",
    uneFemme: "A woman",
    autre: "Other",
    tuRecherches: "You're looking for",
    desHommes: "Men",
    desFemmes: "Women",
    toutLeMonde: "Everyone",
    ville: "City",
    villePlaceholder: "Abidjan",
    bio: "Bio",
    bioPlaceholder: "Tell us a bit about yourself...",
    photoTitre: "Profile photo (optional)",
    photoTexte:
      "Without a photo, you won't be able to see other members' photos in discovery either.",
    valider: "Save my profile",
    erreurAge: "You must be at least 18 years old to use Paolys.",
  },
  localisation: {
    positionEnregistree: "Location saved ✓",
    enCours: "Locating...",
    utiliserPosition: "Use my location",
    erreur: "Couldn't access your location. You can continue without it — we'll use your city instead.",
    aide: "Optional: helps show you the closest profiles.",
  },
  fileInput: {
    choisirFichier: "Choose a file",
  },
  profil: {
    profilVerifie: "✓ Verified profile",
    verificationEnCours: "Verification under review",
    refaireVerification: "Submit a new verification request",
    faireVerifier: "Get my profile verified",
    modifierPrompts: "Edit my prompts",
    ajouterPrompts: "Add prompts (livelier than a bio)",
    inviteAmis: "Invite your friends to Paolys",
    inviteTexte: (n: number) =>
      `3 days of Paolys+ for free for you and your friend as soon as they complete their profile.${
        n > 0 ? ` ${n} already invited.` : ""
      }`,
    passerPremium: "Upgrade to Paolys+",
    passerPremiumTitre: "✨ Unlock Paolys+",
    passerPremiumTexte: "See who already liked you, advanced filters, visibility boost — a bit more comfort, never a paywall on the essentials.",
    premiumActif: (date: string) => `✨ Paolys+ active until ${date}`,
    decouvrirProfils: "Discover profiles",
    quiTaAime: "Who liked you",
    messages: "Messages",
    profilsExclusifs: "Exclusive profiles",
    espaceSponsor: "Sponsor area",
    adminVerifications: "Admin · Verifications",
    adminSignalements: "Admin · Reports",
    seDeconnecter: "Sign out",
    modifierProfil: "Edit my profile",
  },
  profilModifier: {
    titre: "Edit my profile",
    verificationTitre: "Photo verification",
    verificationTexteAFaire:
      "A badge that builds trust: verified profiles get far more matches.",
    verificationCta: "Get verified by photo",
    verificationFait: "✓ Verified profile",
    verificationEnCours: "Your request is under review",
    verificationRefusee: "Request declined — try again",
    champs: {
      displayName: "First name",
      birthDate: "Date of birth",
      gender: "You are",
      lookingFor: "You're looking for",
      city: "City",
      bio: "About",
    },
    nonRenseigne: "Not set",
    modifier: "Edit",
    enregistrer: "Save",
    annuler: "Cancel",
    erreurAge: "You must be at least 18 to use Paolys.",
    erreurRequis: "This field is required.",
  },
  prompts: {
    titre: "Your three prompts",
    sousTitre:
      "So much livelier than an empty bio — pick up to 3 questions and answer them in your own voice.",
    question: (n: number) => `Question ${n}`,
    aucune: "— None —",
    reponsePlaceholder: "Your answer...",
    enregistrer: "Save",
    erreurQuestionInvalide: "Invalid question.",
    options: {
      lieu_reve: "A place I dream of visiting as a couple...",
      rendezvous_parfait: "My definition of a perfect date...",
      ne_peux_pas_vivre_sans: "I can't live without...",
      compliment_prefere: "The compliment I love receiving most...",
      plat_prefere: "My favorite dish...",
      a_savoir: "Something to know about me before we meet...",
      dimanche_ideal: "My ideal Sunday looks like...",
      fait_rire: "What always makes me laugh...",
    } as Record<string, string>,
  },
  verification: {
    titre: "Profile verification",
    texte:
      "A clear selfie of your face, compared to your profile photos, to earn the «Verified profile» badge. Optional, but it reassures other members.",
    dejaVerifie: "Your profile is already verified ✓",
    enAttente: "Your request is under review. We'll let you know once it's processed.",
    refusee:
      "Your last request was rejected (selfie not clear enough or doesn't match your photos). You can try again.",
    tonSelfie: "Your selfie",
    envoyer: "Submit for verification",
    erreurSansSelfie: "Add a selfie to continue.",
    erreurDejaEnAttente: "You already have a request under review.",
  },
  premium: {
    edition: "Sensation Edition",
    texteIntro:
      "Everything that makes Paolys great stays free — unlimited swipes, matches, and messages. Paolys+ just adds a bit more comfort.",
    avantages: [
      "See who already liked you before you swipe yourself",
      "Advanced filters (age range, verified profiles only)",
      "Undo a swipe (recover from an accidental pass)",
      "24h visibility boost",
      "Discreet mode: browse without appearing in others' discovery",
    ],
    abonnementActif: (date: string) => `Subscription active until ${date}`,
    abonnerMois: (montant: number) => `Subscribe for 1 month — ${montant} FCFA`,
    abonnerSemaine: (montant: number) => `Subscribe for 1 week — ${montant} FCFA`,
    paiementSecurise:
      "Secure payment via CinetPay (Orange Money, MTN, Wave, Moov, card).",
  },
  premiumControls: {
    boostActif: (heure: string) => `Boost active until ${heure}`,
    boosterProfil: "Boost my profile (24h)",
    modeDiscret: "Discreet mode (invisible in discovery)",
  },
  profilsExclusifs: {
    titre: "Exclusive profiles",
    sousTitre: "Privileged members who chose to show you their profile.",
    rien: "Nothing for now.",
  },
  aimesPar: {
    titreAvecCompte: (n: number) => `${n} ${n > 1 ? "people" : "person"} already liked you ✨`,
    titreSansCompte: "No one has liked you yet",
    texteIncitation: "Upgrade to Paolys+ to see who, without waiting to match at random.",
    decouvrirPremium: "Discover Paolys+",
    titre: "Who liked you",
    rien: "No one for now — check back later!",
    allerDecouverte: "Go to discovery to answer them",
  },
  messagesListe: {
    titre: "Messages",
    aucunMatch: "No matches yet. Go discover some profiles!",
    ditesBonjour: "Say hello!",
  },
  conversation: {
    ditesBonjourA: (nom: string) => `Say hello to ${nom}!`,
    ecrisMessage: "Write a message...",
    envoyer: "Send",
    signaler: "Report",
    bloquer: "Block",
    erreurEnvoi: "Error while sending.",
    erreurContact:
      "Sharing a phone number or email in chat is reserved for Paolys+ members or sponsors.",
    erreurNonConnecte: "Not signed in.",
  },
  moderation: {
    confirmerBlocage: (nom: string) => `Block ${nom}? You will no longer see each other.`,
    raisonPlaceholder: "Why are you reporting this profile?",
    envoyerSignalement: "Send report",
    signalementEnvoye: "Report sent, thank you.",
    erreurRaisonVide: "Please specify the reason for the report.",
  },
  decouverte: {
    filtres: "Filters",
    ageMin: "Min age",
    ageMax: "Max age",
    verifiesUniquement: "Verified profiles only",
    appliquer: "Apply",
    cestReciproque: "It's mutual",
    cestUnMatch: "It's a match!",
    plusMutuellement: (nom: string) => `You and ${nom} liked each other.`,
    envoyerMessage: "Send a message",
    continuerDecouvrir: "Keep discovering",
    plusDeProfils: "No more profiles for now. Check back a bit later!",
    ajoutePhoto: "Add your photo to see others'",
    annulerSwipe: "Undo last swipe",
    passer: "Pass",
    jAime: "Like",
    superLike: "Super like",
    ans: (age: number) => `${age} y/o`,
    verifie: "Verified",
    voirPrompts: "See more",
  },
  rendezvous: {
    bouton: "🛡️ Plan a safe date",
    partageTitre: "Share the details with someone you trust",
    partageTexte:
      "We generate a link for you to send yourself (WhatsApp, SMS...) to someone you trust — they don't need a Paolys account.",
    partagerLien: "Share the link",
    lienCopie: "Link copied!",
    lieuPlaceholder: "Date location",
    notePlaceholder: "Note for your trusted contact (optional)",
    genererLien: "Generate the link",
    erreurCreation: "Error while creating.",
    partageTitreNatif: "My Paolys date",
    partageTexteNatif: "Here are the details of my date, for your safety:",
  },
  rendezvousPublic: {
    kicker: "Paolys date",
    rencontre: (organisateur: string, rencontre: string) => `${organisateur} is meeting ${rencontre}`,
    partage:
      "Shared from Paolys for extra safety — if you're that trusted contact, keep an eye on the planned time.",
  },
  demandeRdv: {
    bouton: "💌 Request a date",
    enAttenteAcceptation: (nom: string) => `Waiting for ${nom}'s reply.`,
    proposeAcceptation: (nom: string) => `${nom} would like to meet up.`,
    accepter: "Accept",
    refuser: "Decline",
    confirme: (nom: string) => `🎉 You both agreed to meet! Work out the place and time here, in your conversation with ${nom}.`,
    refuseTexte: "Date request declined.",
    erreur: "Something went wrong.",
  },
  sponsor: {
    titre: "Sponsor area",
    texte:
      "Your profile doesn't appear in anyone's discovery — choose who you show your profile, photo, and contact to.",
    numeroLabel: "Your phone number (revealed only to those you allow)",
    numeroPlaceholder: "+225 07 00 00 00 00",
    enregistrer: "Save",
    voirProfil: "See my profile",
    voirPhoto: "See my photo",
    voirContact: "See my contact",
  },
  adminVerifications: {
    titre: "Pending verifications",
    aucune: "No pending requests.",
    selfie: "Selfie",
    photoProfil: "Profile photo",
    approuver: "Approve",
    rejeter: "Reject",
  },
  adminSignalements: {
    titre: "Pending reports",
    aucun: "No pending reports.",
    signale: "reports",
    marquerTraite: "Mark as reviewed",
  },
  paiementRetour: {
    recu: "Payment received!",
    enCours: "Payment being processed",
    texteRecu: "Your Paolys+ subscription will be active in a few moments.",
    texteEnCours:
      "We're confirming your payment with CinetPay — this can take a minute. Check back on your profile.",
    retour: "Back to my profile",
  },
};

export const dictionaries: Record<Locale, Dictionary> = { fr, en };

export function getDictionary(locale: Locale): Dictionary {
  return dictionaries[locale];
}

export function localeVersDateFnsTag(locale: Locale): string {
  return locale === "en" ? "en-US" : "fr-FR";
}
