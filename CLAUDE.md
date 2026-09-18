# Paolys — Application de Rencontre en Ligne

## Identité du projet

**Paolys** = application de rencontre en ligne visant à surpasser Badoo (UX, sécurité,
pertinence du matching, adaptation locale). Cible prioritaire : **Côte d'Ivoire**, puis
extension à l'espace **UEMOA francophone** (Sénégal, Bénin, Mali, etc.).

Approche : **web d'abord** (MVP complet et autonome), déclinaison mobile (iOS/Android)
dans un second temps.

## Positionnement & identité de marque

- **Nom** : Paolys — sonne comme un prénom, volontairement humain, pas un nom de start-up
  abstrait.
- **Message central** : il y a une vraie personne derrière chaque profil, pas un algorithme
  froid.
- **Ton** : chaleureux, rassurant, accessible, jamais générique ni "corporate tech".
- **Langue** : français par défaut + anglais (voir section i18n ci-dessous), vocabulaire
  simple et direct dans les deux.

## Patterns d'interface façon Badoo — écran de Découverte (2026-09-17)

Demande de Manno après analyse de captures Badoo : reconstruire la Découverte
avec des patterns Badoo (profil scrollable, puces de faits, prompts entre
photos, nav du bas, desktop qui exploite l'espace) en gardant l'identité
Paolys. **Portée de cette passe : uniquement l'écran de Découverte** — la
demande enchaîne explicitement sur l'édition de profil ensuite, non traitée
ici.

- **Carte scrollable** ([DecouverteClient.tsx](src/components/DecouverteClient.tsx)) :
  photo plein cadre (nom seul en overlay, plus d'âge/ville dedans) → puces de
  faits (`ChipFait` : 🎂 âge, 📍 ville, ✓ vérifié en `lagune`) → prompts en
  cartes `mangue-tint` intercalés avec les photos suivantes (fonction
  `construireBlocs` : un prompt avant chaque photo au-delà de la première,
  puis les prompts restants à la fin). **Aujourd'hui la plupart des profils
  n'ont qu'une seule photo** (l'upload multiple n'est pas encore construit
  côté `/profil/completer`) — le composant est prêt pour plusieurs photos
  (nouvelle fonction [urlsPhotosSignees](src/lib/photo-url.ts)) mais
  l'entrelacement ne sera visible qu'une fois l'upload multi-photo ajouté
  (probablement avec l'édition de profil, prochaine étape).
- **Actions fixes en bas de la zone photo**, colorées : passer = contour
  azur, super like = disque rose (icône étincelle), j'aime = disque mangue
  (icône cœur plein). **Simplification assumée** : le bouton "super like"
  appelle actuellement la même action que "j'aime" (`enregistrerSwipe(...,
  "like")") — il n'existe pas encore de notion de super-like distincte côté
  base de données (notification prioritaire immédiate, etc.). À construire
  séparément si Manno veut un vrai super-like.
- **Bug de mise en page corrigé en cours de route** : le défilement touchait
  toute la page (le bandeau du haut et les boutons remontaient avec le
  contenu) à cause du piège classique flexbox imbriqué (un enfant `flex-1`
  ne rétrécit pas sous sa taille de contenu sans `min-h-0`). Corrigé en
  donnant à la racine un vrai viewport borné (`h-dvh overflow-hidden`) et en
  ajoutant `min-h-0` sur toute la chaîne flex jusqu'au conteneur
  `overflow-y-auto` de la carte — vérifié : le scroll ne bouge plus que le
  contenu de la carte, header/actions/nav restent fixes.
- **Nav du bas** ([BottomNav.tsx](src/components/BottomNav.tsx)) : 5 icônes
  (À proximité, Rencontres, Likes, Discussions, Profil), actif en `mangue`,
  badge de notification en `rose` sur "Likes" (compteur réel via
  `combien_m_ont_aime`, pas un chiffre inventé). **Simplification assumée** :
  "À proximité" pointe pour l'instant vers `/decouverte`, comme
  "Rencontres" — il n'existe pas de vue "profils à proximité" séparée du fil
  de swipe. Composant réutilisable, pas encore posé sur les autres écrans
  connectés (à faire au fur et à mesure).
- **Desktop** : panneau latéral fixe (`aside` à droite, `lg:flex`) avec les
  filtres (promus toujours visibles au lieu d'un panneau à déplier) et une
  file "à suivre" (avatars + noms des prochains candidats, déjà en mémoire
  côté client) — jamais un vide flottant à côté d'une colonne étroite.
- **Nouvelle colonne SQL exposée** :
  [0012_decouverte_verifie.sql](supabase/migrations/0012_decouverte_verifie.sql)
  ajoute `photo_verified` au retour de `profils_a_decouvrir` (nécessaire
  pour la puce "Vérifié" en `lagune`) — **migration à exécuter par Manno**,
  en attendant le badge ne s'affiche simplement pas (dégradation gracieuse,
  aucune erreur).
- Vérifié dans le navigateur, Jour et Nuit, mobile et desktop, avec un
  compte de test ayant deux prompts et sans photo (le flou/placeholder
  photo se comporte normalement en son absence).

## Internationalisation FR/EN (2026-09-17)

Demande de Manno : version anglaise + choix de la langue à la connexion/inscription,
le système pouvant s'étendre au-delà de l'Afrique de l'Ouest.

- **Pas de routes `/fr` `/en`** (choix volontaire pour limiter le risque de casser les
  routes typées Next 16 existantes) : un **cookie** `paolys_locale` (1 an, `fr` par
  défaut) stocke la préférence, lu côté serveur par
  [locale.ts](src/lib/i18n/locale.ts) (`getLocale()`).
- **Dictionnaire unique** [dictionary.ts](src/lib/i18n/dictionary.ts) : objet `fr` comme
  source de vérité, `type Dictionary = typeof fr`, objet `en` typé `Dictionary` (le
  compilateur force à traduire CHAQUE clé — piège rencontré : `as const` sur `fr`
  aurait figé les valeurs en literal types, rendant `en` impossible à typer ; retiré).
  Entrées dynamiques (dates, compteurs, noms) sont des fonctions
  (`t.profil.premiumActif(date) => string`) plutôt que de l'interpolation de chaîne.
- **Bascule** : [LanguageSwitcher.tsx](src/components/LanguageSwitcher.tsx) (2 boutons
  FR/EN) + [locale-actions.ts](src/lib/i18n/locale-actions.ts) (`definirLangue`, server
  action qui pose le cookie et redirige vers `retour` = pathname actuel via
  `usePathname()`). Placé sur accueil, connexion, inscription (demande explicite) —
  pas encore sur les pages membre (profil, découverte, etc.), qui héritent simplement
  de la langue déjà choisie.
- **Toutes les pages et composants traduits** (~25 fichiers) : accueil, connexion,
  inscription, complétion de profil, profil, prompts (y compris les 8 intitulés de
  prompts), vérification photo, premium, profils exclusifs, qui-m-a-aimé, messages +
  conversation, sponsor, admin (vérifications + signalements), paiement/retour,
  rendez-vous public, plus tous les composants clients (SignalerBloquer,
  RendezVousPlanner, CopierLien, PremiumControls, SponsorClient,
  AdminVerificationsClient, LocalisationInput, FileInputWarm) — reçoivent `locale` en
  prop depuis leur page serveur parente.
- **Erreurs serveur traduites** : les messages d'erreur définis en dur dans les "use
  server" (auth-actions, profile-actions, verification-actions, moderation-actions,
  message-actions) appellent désormais `getLocale()` + `getDictionary()`.
- **Limite connue acceptée** : les erreurs `raise exception` définies dans les
  fonctions SQL (ex. `'Match introuvable'` dans `creer_rendezvous`) restent en
  français quelle que soit la langue — les traduire demanderait de modifier les
  migrations SQL, hors scope de cette passe.
- **Dates** : `localeVersDateFnsTag(locale)` → `"fr-FR"` ou `"en-US"` pour
  `toLocaleDateString`/`toLocaleTimeString`.
- **`html lang`** dynamique dans [layout.tsx](src/app/layout.tsx) (composant devenu
  `async`).
- Testé en direct dans le navigateur : bascule FR→EN→FR, inscription complète en
  anglais, profil/prompts entièrement traduits, cookie persistant à la navigation.

## Logo (2026-09-17)

- **État actuel (2026-09-17) : logo = le nom "Paolys" seul.** Après plusieurs
  itérations sur une icône (cœur → monogramme "P" en formes géométriques →
  carré dégradé sans symbole → lettre "P" typographique), Manno a clarifié
  vouloir **uniquement le nom, sans icône du tout** ("le nom seulement
  uniquement j'ai dit", puis "sans icône pour le moment"). Décision : le
  travail sur une icône/favicon séparée est **mis en pause** — pas abandonné,
  juste pas la priorité actuelle.
  - [logo-full.svg](public/logo-full.svg) : le mot "Paolys" seul, Fraunces
    italic, dégradé corail→or→azur, fond transparent. C'est le logo actuel.
  - `src/app/icon.svg` (favicon Next.js) et `public/app-icons/*.png` ont été
    **retirés/pas activés** — le site n'a pas de favicon personnalisé pour
    l'instant, ce qui est le choix assumé de Manno, pas un oubli.
  - `public/logo-mark.svg` existe encore sur disque (dernière tentative :
    lettre "P" sur fond blanc) mais n'est **plus référencé nulle part** —
    fichier orphelin, à nettoyer ou reprendre si Manno relance le sujet de
    l'icône plus tard.
  - Ne pas réintroduire une icône/favicon sans demande explicite de Manno.
- **Fichiers sources** (vecteur, à conserver comme référence) :
  [logo-mark.svg](public/logo-mark.svg) (icône seule, carré, pour favicon/app) et
  [logo-full.svg](public/logo-full.svg) (icône + mot "Paolys" en Fraunces italic
  dégradé, pour usages marketing/store listing — dégrade proprement vers Georgia
  italic si Fraunces n'est pas chargé, ce qui arrive hors du site lui-même).
- **Favicon** : [icon.svg](src/app/icon.svg) (copie de logo-mark.svg) — convention
  Next.js App Router, pris en compte automatiquement, aucune config requise.
  L'ancien favicon.ico par défaut de create-next-app a été supprimé.
- **PNG réels générés** dans `public/app-icons/` via une technique de
  rastérisation navigateur (canvas `drawImage` du SVG + une route API temporaire
  `POST /api/dev-save-icon` qui écrivait le résultat sur disque, supprimée juste
  après usage — pas un outil permanent du projet) : `icon-1024-appstore.png`,
  `icon-512-playstore.png`, `icon-192-android.png`, `icon-180-apple-touch.png`,
  `icon-32-favicon.png`, `icon-16-favicon.png`. Vérifiés visuellement, qualité
  nette même à 1024px.
- **Reste à faire pour les stores** : générer les jeux complets d'icônes iOS
  (toutes les tailles Xcode) et Android (toutes les densités mipmap) à partir de
  `icon-1024-appstore.png` — à faire au moment de créer les projets natifs
  (Xcode Image Asset Catalog ou Android Studio Image Asset Studio acceptent une
  seule image 1024px et génèrent tout automatiquement ; sinon un outil gratuit
  comme appicon.co/icon.kitchen fait la même chose sans rien installer).

## Design system officiel v4 (2026-09-17) — MIGRATION COMPLÈTE

Manno a fourni un design system officiel complet (Artifact Claude, type
"Design System") avec tokens, règles de marque, 5 SVG de logo, puis (v4) un
composant "Fond d'écran". Infrastructure posée puis audit présenté à Manno
("montre-moi avant de tout corriger"), qui a ensuite validé une migration
complète en une seule passe ("migre tout") — **terminée et vérifiée dans le
navigateur (Jour + Nuit), `tsc`/`eslint` propres.**

- **Fond d'écran officiel ("le ciel qui bascule", v4)** : classe
  [.page-bg](src/app/globals.css) — trois `radial-gradient` fixes (azur
  haut-droite, rose bas-gauche, mangue centre) à opacité et positions EXACTES
  du README (`0.10/0.09/0.06` jour, `0.16/0.15/0.09` nuit), sur
  `background-color: var(--surface-100)`, avec `background-attachment: fixed`
  pour que les lueurs ne bougent pas au scroll (vérifié dans le navigateur :
  scroll sur `/profil`, les lueurs de coin restent bien collées au viewport).
  **Remplace entièrement `.glow-warm`** (halo "maison" inventé avant d'avoir
  la charte officielle, supprimé du CSS). Appliqué sur les ~20 écrans pleins
  (accueil, connexion, inscription, profil + sous-pages, découverte,
  messages + conversation, premium, sponsor, admin, paiement, rendez-vous,
  profils exclusifs, qui-t'a-aimé) — **jamais** sur `card-warm`/`surface-200`
  qui reste unie, conforme à la règle du README.

- **Palette officielle** (remplace à terme corail/or/azur "ancien sens") :
  `surface-100/200`, `ink`, `ink-muted`, **`azur`** (astre masculin,
  #2E5AA8 jour / #7CA6E3 nuit), **`rose`** (astre féminin, #C6316B /
  #EA6F9A), **`mangue`** (action/joie, CTA primaire, #D9821F / #EBA854),
  `mangue-tint`, **`lagune`** (confiance/vérification/paiement, #146B68 /
  #4AA39D), `line` (bordures). Thèmes Jour/Nuit réels via
  `@media (prefers-color-scheme: dark)` (même mécanisme que l'ancien
  système, donc déjà "un vrai mode clair/sombre" fonctionnel).
- **Typographie officielle** : **Fredoka** (titres, mot-symbole) + **Nunito**
  (interface) — SEULES polices du site désormais. Geist et Fraunces ont été
  **entièrement retirés** de [layout.tsx](src/app/layout.tsx) (plus aucune
  référence dans le code — vérifié par recherche). `--font-sans`/`--font-display`
  Tailwind pointent directement sur Nunito/Fredoka, donc `.font-display` et le
  corps de texte partout héritent automatiquement, sans édition fichier par
  fichier. Classes dédiées : `.text-display-lg/md`, `.text-heading`,
  `.text-caption`, `.text-button`.
- **Palette** : les noms de classes/variables historiques (`.btn-primary-warm`,
  `.card-warm`, `--brand`, `--gold`, `--sky`, etc.) sont **conservés comme
  alias internes** dans [globals.css](src/app/globals.css) mais repointent
  entièrement sur les tokens officiels (`--brand → mangue`, `--gold → mangue`,
  `--sky → azur`, `--brand-light/--gold-light → mangue-tint`) — ça a permis de
  migrer visuellement TOUT le site (28 fichiers) sans avoir à renommer chaque
  className une par une, avec un risque d'erreur minimal. **Tous les dégradés
  ont été retirés** (`.gradient-warm`, `.text-gradient-warm`, `.gradient-couple`
  supprimés du CSS — le nouveau système est en aplats, conforme à tokens.json
  qui ne définit aucun dégradé) : les usages ont été remplacés par `bg-mangue`
  ou `text-mangue` directement dans chaque fichier concerné.
- **5 SVG de logo** copiés dans [public/brand/](public/brand/) :
  `paolys-icon-dark-tile.svg` (favicon/icône d'app — `src/app/icon.svg`),
  `paolys-icon-light-tile.svg`, `paolys-mark-transparent.svg` (marque seule,
  sans cadre — pour lockup), `paolys-mark-mono-ink.svg` et
  `paolys-mark-mono-ivory.svg` (usages monochromes). Ceci lève la pause posée
  le 17/09 sur l'icône ("sans icône pour le moment") — nouvelle instruction
  explicite de Manno avec un fichier officiel nommé pour cet usage précis.
- **Composants** [Wordmark.tsx](src/components/brand/Wordmark.tsx) (mot-symbole
  "paolys" — bas de casse, coloré lettre par lettre : p azur, a rose, o
  mangue, l lagune, y rose, s azur) et [Logo.tsx](src/components/brand/Logo.tsx)
  (lockup marque + wordmark, marque sans tuile). Utilisés partout où le mot-
  symbole standalone apparaissait (accueil, page premium en "paolys+" avec le
  "+" en mangue à côté du Wordmark).
- **Cœur littéral supprimé** : le bouton "J'aime" de la découverte
  ([DecouverteClient.tsx](src/components/DecouverteClient.tsx)) affichait
  l'emoji ❤ (interdit explicitement par le README) — remplacé par une
  étincelle SVG blanche sur fond mangue, cohérente avec le spark de la marque.
- **HeroArt** ([HeroArt.tsx](src/components/HeroArt.tsx)) entièrement
  redessiné : représente maintenant le concept officiel du logo (cercle azur
  + cercle rose qui se chevauchent, étincelle mangue), utilisée sur l'accueil,
  connexion, inscription, écran de match et état vide de découverte.
- **Italique retiré partout** : Fredoka n'a pas de véritable italique (le
  navigateur aurait appliqué un oblique synthétique disgracieux) — la classe
  `italic` a été retirée de tous les titres (`~15` occurrences).
- **Badges de confiance recolorés en `lagune`** (au lieu de vert générique) :
  "✓ Profil vérifié" sur `/profil`, "Ton profil est déjà vérifié" sur
  `/profil/verification`, "Abonnement actif jusqu'au..." sur `/premium` —
  conforme au rôle défini pour `lagune` (vérification, confiance, paiement).
- **Vérifié dans le navigateur** (Jour + Nuit, comptes de test) : accueil,
  connexion, profil, premium, découverte (swipe sans cœur, état vide),
  messagerie (bulle envoyée en mangue plein, plus de dégradé). `tsc --noEmit`
  et `eslint` propres après chaque étape.
- La page de démo temporaire `design-preview` a été supprimée après usage.

## Lint Supabase — RLS spatial_ref_sys : NON CORRIGEABLE, à ignorer (2026-09-17)

Le Security Advisor de Supabase signale `public.spatial_ref_sys` (table
technique de l'extension PostGIS, liste statique de systèmes de coordonnées
géographiques — aucune donnée utilisateur) comme n'ayant pas RLS activé.
**Tentative de correction échouée** : `alter table ... enable row level
security` renvoie `ERROR: 42501: must be owner of table spatial_ref_sys` —
sur Supabase, cette table appartient à un rôle interne à l'extension, même le
propriétaire du projet n'a pas les droits pour la modifier. C'est une
restriction de la plateforme, pas un problème de permissions mal configurées.
**Décision : accepter ce lint, ne pas retenter.** Sans danger réel (données
statiques non sensibles) ; cas connu et documenté côté Supabase où
l'avertissement doit rester ignoré. Ne pas re-proposer de migration dessus
sauf si Supabase change un jour sa politique de gestion des extensions.

## Test complet du site (2026-09-17)

Passage systématique sur toutes les pages/flux avec les comptes de test (Aya,
Boubacar, Fili, TestManno) — tout fonctionne, aucun bug trouvé cette fois :

- Accueil, connexion (erreur + succès), inscription — FR et EN.
- **Validation d'âge < 18 ans** : message d'erreur correct, testé avec un
  compte créé pour l'occasion (2015 comme date de naissance).
- Profil, complétion de profil, prompts, vérification photo, premium
  (affichage actif + offres).
- Découverte : swipe, filtres (Premium), état "plus de profils", flou photo
  pour un compte sans photo propre.
- Messages : liste, conversation, envoi de message, **partage de contact
  autorisé pour un compte Premium** (Aya) — confirme que le blocage vu plus
  tôt dans la session était bien spécifique aux comptes gratuits.
- Rendez-vous : création + page publique (lieu/heure/note corrects).
- Signalement : formulaire + confirmation.
- **Contrôle d'accès vérifié** : `/sponsor`, `/admin/verifications`,
  `/admin/signalements` redirigent bien vers `/profil` pour un compte non
  autorisé (Aya, ni sponsor ni admin).
- Paiement/retour : affichage correct sans transaction réelle (CinetPay non
  testé en conditions réelles — nécessite de vraies clés API).
- **Non testé faute de comptes/accès** : fonctionnalités sponsor et admin
  elles-mêmes (approuver/rejeter, autorisations) — nécessiteraient un compte
  avec `app_metadata.role` positionné, pas faisable depuis le navigateur seul.
  Le blocage (`Bloquer`) n'a pas été ré-exécuté pour ne pas détruire le match
  Aya↔Boubacar réutilisé pour d'autres tests — déjà validé le 16/09.

## Système visuel (2026-09-16)

Demande explicite de Manno : "gaité, sensualité, romance, sans extravagance,
unique, plus beau que Badoo/Tinder/Bumble". Décisions :

- **Deux polices** ([layout.tsx](src/app/layout.tsx)) : Geist Sans pour le
  corps de texte (lisible, neutre), **Fraunces** (serif chaleureuse, italique)
  pour tous les titres et le wordmark "Paolys" — volontairement différent de
  la sans-serif générique que Tinder/Bumble/Hinge utilisent toutes. Classe
  utilitaire `.font-display`.
- **Palette** ([globals.css](src/app/globals.css)) : rose profond `--brand`
  (#E8546F, plus sophistiqué que le rose vif initial) + doré chaleureux
  `--gold` en accent secondaire + plum profond `--plum` pour la richesse
  visuelle. Dégradé `--gradient-warm` (rose → doré) utilisé sur les CTA
  principaux, le wordmark (`.text-gradient-warm`), les bulles de message
  envoyées. Halo décoratif `.glow-warm` (radial-gradient flouté) sur les
  écrans d'accueil/formulaires/célébration de match.
- **Composants réutilisables** (classes CSS, pas de composants React dupliqués
  page par page) : `.card-warm` (carte blanche, ombre douce rosée),
  `.field-warm` (champ de formulaire), `.btn-primary-warm` (dégradé + ombre
  portée, léger effet d'échelle au survol), `.btn-secondary-warm` (contour).
  Appliquées à toutes les pages membre (auth, profil, découverte, messages,
  premium, vérification, profils exclusifs).
- **Carte de découverte** repensée façon "carte de rencontre" premium : photo
  plein cadre en ratio portrait, dégradé sombre en bas avec nom/âge/ville
  incrustés sur la photo (au lieu d'un texte séparé sous une photo carrée).
- **Refonte palette "sans marron" (2026-09-16)** : Manno a jugé la palette
  précédente (foreground `#2b1b17` brun, `--plum` `#6d2740` utilisé partout en
  ombres/bordures, mode sombre café `#1b0f0d`) trop terne/brune, pas assez
  gaie. Nouvelle palette dans [globals.css](src/app/globals.css) :
  - **Corail** `--brand` (#ff5d7e, féminin/chaleur) + **azur** `--sky`
    (#4f8ef7, masculin/fraîcheur) comme duo d'harmonie homme-femme, plutôt
    qu'une seule teinte dominante. `--gold` conservé en accent joyeux.
  - `--foreground` passé à un charcoal froid (#241f33, plus de brun) ;
    `--plum` supprimé, remplacé par `--shadow-soft` (valeurs RGB neutres pour
    ombres/bordures translucides).
  - Mode sombre : fond indigo profond (#14112a) au lieu de brun café.
  - Nouveau dégradé `--gradient-couple` (corail → or → azur) utilisé sur le
    wordmark et disponible via `.gradient-couple`.
  - [HeroArt.tsx](src/components/HeroArt.tsx) : illustration SVG réutilisable
    (prop `size="lg"|"sm"`) — deux cartes de profil dégradées (corail/azur)
    qui se chevauchent en éventail, avec ombre portée douce et étincelles
    dorées. **Itérée 2 fois suite au retour de Manno** : la 1ère version
    (deux cercles + cœur blanc à l'intersection) jugée "trop plate, le cœur
    ne rend pas, le concept ne va pas" → remplacée par les cartes inclinées
    (plus premium, illustre le produit lui-même). Halos flous en fond
    supprimés ensuite (jugés superflus). Utilisée en `size="lg"` sur la page
    d'accueil, en `size="sm"` sur connexion/inscription/écran de match/état
    vide de découverte, pour une cohérence visuelle sur tout le parcours.
  - **Luminosité ajustée sur retour de Manno** : mode sombre éclairci
    (`--background` #14112a → #2a2450, moins "presque noir"), puis mode clair
    assombri (`--background` #fffaf8 → #fbeee8 + halo `--gradient-glow` plus
    saturé) car jugé trop blanc/éblouissant après le premier ajustement —
    équilibre à surveiller si nouveau retour sur la luminosité.
  - Liens inline manqués lors de la passe précédente corrigés en `.link-warm`
    ("S'inscrire"/"Se connecter" dans le texte des pages connexion/inscription).
- **Bug trouvé en testant le résultat** (pas lié au design) :
  `payment-actions.ts` exportait `FORMULES` (une constante) depuis un fichier
  `"use server"` — Next.js interdit tout export non-async dans ce type de
  fichier, erreur uniquement visible à l'exécution (ni `tsc` ni `eslint` ne
  l'attrapent). Déplacé vers [premium-pricing.ts](src/lib/premium-pricing.ts).
  Leçon : toujours tester une page dans le navigateur après un changement
  touchant un fichier `"use server"`, le type-check seul ne suffit pas.
- **Honnêteté sur les limites** : aucune retouche visuelle ne remplace de
  vraies photos utilisateur — le rendu final dépendra beaucoup des photos que
  les membres uploaderont réellement (les captures de test utilisent des
  aplats de couleur).

## Différenciation face à Badoo / Tinder / Bumble

1. **Paiement mobile natif dès le départ** — Orange Money, MTN Mobile Money, Wave (pas
   seulement carte bancaire, qui est un frein majeur localement).
2. **Vérification d'identité renforcée** — la confiance est le principal frein perçu au
   dating en ligne localement. Vérification photo/selfie + badges de confiance visibles.
3. **App légère** — optimisée pour connexions mobiles à bande passante limitée et coût
   data élevé (poids de page, images compressées, pas de sur-chargement JS).
4. **Interface en français**, ton chaleureux et humain plutôt qu'un produit traduit
   tel quel depuis l'anglais.

## Marché cible

- Priorité 1 : Côte d'Ivoire (Abidjan en premier).
- Priorité 2 : UEMOA francophone (Sénégal, Bénin, Mali, Togo, Burkina Faso, etc.).
- Réseau mobile dominant, coût data élevé, usage majoritairement smartphone Android
  d'entrée/milieu de gamme.

## Architecture technique (VALIDÉE — 2026-09-10)

Utilisateur non-développeur, budget ~100$/mois, délai MVP visé 4-6 semaines → priorité à
une stack **entièrement managée**, la moins d'ops possible, pour avancer vite sans avoir
à administrer des serveurs.

```
[Next.js (Vercel)] ←→ [Supabase : Postgres+PostGIS, Auth, Realtime, Storage]
        ↓
[Twilio (OTP SMS)] · [CinetPay (mobile money + carte)] · [modération manuelle photo]
```

- **Frontend + backend** : Next.js (TypeScript), App Router, API routes/Server Actions
  pour la logique serveur — un seul projet, pas de backend séparé à maintenir.
- **Hébergement** : Vercel (déploiement automatique, zéro administration serveur,
  tier gratuit large, largement dans le budget).
- **Base de données + Auth + Temps réel + Stockage** : **Supabase** (Postgres managé
  avec extension PostGIS pour la géoloc, Auth intégrée, Realtime pour la messagerie
  instantanée, Storage pour les photos). Un seul fournisseur = un seul tableau de bord
  à surveiller, adapté à un profil non-dev.
- **OTP/SMS** : Twilio en phase 1 (intégration native avec Supabase Auth, fonctionne
  bien en Côte d'Ivoire/UEMOA, coût acceptable au volume MVP). Migration possible vers
  un agrégateur africain (Africa's Talking/Termii) plus tard si le volume grossit et
  que le coût SMS devient significatif.
- **Paiement mobile money** : CinetPay (Orange Money, MTN MoMo, Wave, Moov + carte),
  un seul contrat/API à intégrer, bien implanté en Côte d'Ivoire.
- **Vérification photo/selfie — HYBRIDE (décidé le 2026-09-10)** : filtre automatique
  (AWS Rekognition `DetectFaces` — un seul visage net, sinon rejet immédiat avec
  message clair) puis modération **manuelle** pour les cas qui passent ce filtre
  (comparaison visuelle admin du selfie vs photos de profil). Décision motivée par
  l'inquiétude de Manno sur le volume de vérifications à traiter manuellement : le
  filtre automatique élimine les cas absurdes (pas de visage, flou, plusieurs
  personnes) sans le coût/complexité d'un `CompareFaces` complet. Badge "Profil
  vérifié" — **optionnel, non bloquant** (pas obligatoire pour utiliser l'app, pour
  éviter de goulot d'étranglement le lancement).

**Pourquoi ce choix plutôt que NestJS/VPS séparé** : moins de pièces mobiles à opérer,
déploiement en un clic, pas de serveur à sécuriser/mettre à jour soi-même — critique
pour un porteur de projet non-développeur qui devra un jour maintenir ça sans moi à
côté en permanence.

## Fonctionnalités MVP (web)

1. Inscription/authentification (email + téléphone, vérification OTP).
2. Création de profil (photos, bio, centres d'intérêt, intentions de rencontre).
3. Vérification photo (comparaison selfie vs photos de profil — modération manuelle v1).
4. Découverte de profils géolocalisée (swipe ou équivalent).
5. Système de match mutuel.
6. Messagerie en temps réel entre matchs.
7. Confidentialité et sécurité (blocage, signalement).
8. Abonnement premium — paiement mobile money (Orange/MTN/Wave) + carte en option.

## Roadmap par phases

- **Phase 0** : cadrage (budget, stack, délai) — FAIT (2026-09-10).
- **Phase 1 (fondations)** : scaffolding Next.js — FAIT. Projet Supabase "PAOLYSDEMO"
  (dev/test) créé, schéma SQL initial exécuté (`profiles`, `profile_photos`,
  `photo_verifications`) — FAIT (2026-09-10). Auth email+mot de passe (inscription,
  connexion, déconnexion, protection de route) — FAIT et testé end-to-end
  (2026-09-10). Phone OTP volontairement différé (voir Décisions). Création de
  profil (prénom, date de naissance, genre, recherche, ville, bio, photo →
  Supabase Storage bucket "profile-photos") — FAIT et testé end-to-end
  (2026-09-10), y compris upload de photo réel.
- **Phase 1** globalement FAIT (2026-09-10) : auth + création de profil bout en
  bout, testées dans le navigateur.
- **Phase 2** FAIT (2026-09-10) : découverte de profils (compatibilité de genre,
  tri par distance si position connue, exclusion des profils déjà swipés),
  swipe like/pass, détection de match réciproque. Testé bout en bout avec 3
  comptes de test (2 matchs vérifiés, dont un avec photos réelles). Table
  `swipes`, `matches`, fonctions RPC `enregistrer_swipe`/`profils_a_decouvrir`
  (migration 0003).
- **Phase 3** FAIT (2026-09-10) : messagerie en temps réel entre matchs (table
  `messages`, RLS par participant, Realtime activé). Liste des conversations
  (`/messages`, RPC `mes_matchs`) + conversation (`/messages/[matchId]`).
  Bug corrigé : le client Realtime navigateur (`@supabase/ssr`) doit recevoir
  `supabase.realtime.setAuth(session.access_token)` explicitement avant de
  s'abonner — sans ça, les évènements `postgres_changes` sont bloqués
  silencieusement par les policies RLS (le canal se dit quand même "SUBSCRIBED").
  Testé bidirectionnel bout en bout (Manno ↔ TestFemme, 2 navigateurs distincts).
- **Phase 4** FAIT (2026-09-10) : accès admin (`app_metadata.role = 'admin'`,
  jamais modifiable par l'utilisateur), badge "Profil vérifié" (optionnel, pas
  bloquant), file de vérification photo avec filtre automatique AWS Rekognition
  (rejette immédiatement si aucun visage net et unique détecté, sans déranger
  l'admin) + décision manuelle admin (`/admin/verifications`, approuver/rejeter).
  Photo de profil rendue **optionnelle** (au lieu d'obligatoire) ; en découverte,
  un utilisateur sans photo voit celles des autres floutées avec une incitation
  à ajouter la sienne (swipe/match/chat restent accessibles sans photo). Testé
  bout en bout (rejet AWS sur image sans visage, approbation admin réelle,
  badge affiché). Signalement et blocage — FAIT (2026-09-10) : tables `blocks`
  et `reports` (RLS), RPC `bloquer_utilisateur` (supprime aussi le match et les
  messages, cascade voulue — bloquer efface toute trace, pas juste masque),
  exclusion des profils/matchs bloqués dans `profils_a_decouvrir`/`mes_matchs`.
  Boutons "Signaler"/"Bloquer" en découverte et dans la conversation
  ([SignalerBloquer.tsx](src/components/SignalerBloquer.tsx)). File admin
  `/admin/signalements`. Testé bout en bout (signalement visible admin, blocage
  supprime la conversation et renvoie 404 sur l'ancienne URL). **Phase 4
  intégralement terminée.**
- **Phase 5** EN COURS (2026-09-10) : abonnement **Paolys+**, deux formules —
  1000 FCFA/semaine ou 3000 FCFA/mois (révisé le 2026-09-16, était
  500/1000 FCFA) — `FORMULES` dans
  [payment-actions.ts](src/lib/payment-actions.ts)). Tarif hebdo volontairement
  plus cher au prorata (barrière d'entrée basse + incite à l'engagement mensuel,
  pratique standard Tinder/Bumble). `payments.duration_days` porte la durée
  réelle achetée ; le webhook prolonge `premium_until` de ce nombre de jours
  précis (pas un mois fixe). Philosophie explicite de Manno : le gratuit reste
  pleinement fonctionnel
  (swipes/matchs/messages illimités, plus généreux que Badoo/Tinder) — le
  premium n'ajoute que du confort, ne bloque jamais l'usage normal. 5 avantages :
  voir qui m'a aimé (`qui_m_a_aime`/`combien_m_ont_aime`), filtres avancés
  (âge, vérifiés uniquement — dans `profils_a_decouvrir`), annuler un swipe
  (`annuler_dernier_swipe`), boost 24h (`activer_boost`, priorise en
  découverte), mode discret (`definir_mode_discret`, exclu de la découverte
  des autres). Toutes les fonctions RPC vérifient `est_premium()` côté serveur
  (pas seulement côté UI) — un appel direct à l'API ne peut pas contourner le
  paywall. Paiement **CinetPay** (`/v2/payment` pour initier, `/v2/payment/check`
  pour vérifier — jamais confiance dans la notification seule, recommandation
  officielle CinetPay) : table `payments`, webhook `/api/paiement/notifier`
  (utilise la clé secrète Supabase pour contourner RLS, aucune session
  utilisateur dans un webhook). Migration 0007. Code complet et type-checké ;
  **pas encore testé en conditions réelles** (compte marchand CinetPay à créer
  par Manno, clé secrète Supabase à récupérer). Limitation connue : le webhook
  CinetPay ne peut pas atteindre `localhost` — l'abonnement ne s'activera
  réellement qu'une fois déployé sur une URL publique (ou via un tunnel type
  ngrok en local).
- **Rôle sponsor** FAIT (2026-09-16) : 4e catégorie d'utilisateur, en plus de
  admin/normal/premium — accès privilégié, **séparé du système de swipe/match**
  (les sponsors ne swipent pas, ils choisissent qui peut les voir). Attribution
  manuelle uniquement par Manno (comme admin, via `app_metadata.role = 'sponsor'`
  + mirroir `profiles.is_sponsor` — nécessaire pour que `profils_a_decouvrir`
  puisse exclure les sponsors des autres profils sans lire `auth.users`).
  Un sponsor : parcourt tous les profils compatibles avec sa préférence de genre
  sans exclusion "déjà vu" (`profils_pour_sponsor`) ; choisit pour chaque
  personne trois autorisations progressives — voir profil / voir photo / voir
  contact (`sponsor_grants`, RLS stricte). Le profil d'un sponsor n'apparaît
  JAMAIS dans la découverte normale des autres, uniquement via ces autorisations
  (page beneficiaire `/profils-exclusifs`). **Contact = numéro de
  téléphone/WhatsApp**, stocké dans une table séparée `profile_contacts` avec
  RLS réelle (pas juste masqué côté interface) — seul le propriétaire et les
  bénéficiaires explicitement autorisés (`voir_contact`) peuvent le lire.
  Migration 0008. La limite initiale (bucket photos public, "voir_photo"
  purement applicatif) a été corrigée juste après — voir section Sécurité.
- **Phase 6 (post-MVP)** : déclinaison mobile (iOS/Android).

## Différenciation & fidélisation (2026-09-16)

Suite à une réflexion explicite avec Manno sur "qu'est-ce qui rend Paolys
incomparable" : 3 ajouts priorisés (sécurité rendez-vous d'abord — le plus
différenciant vis-à-vis de Badoo/Tinder qui ne l'ont pas). Migration 0011.

- **Sécurité rendez-vous** : bouton dans la conversation
  ([RendezVousPlanner.tsx](src/components/RendezVousPlanner.tsx)) pour générer
  un lien public (`/rendez-vous/[id]`) à envoyer soi-même (WhatsApp/SMS) à un
  proche — **aucun compte Paolys requis côté proche**, volontairement pour ne
  pas dépendre de Twilio (différé). La page publique n'expose que lieu/heure/
  note + les prénoms, jamais photo ni contact (fonction SQL
  `rendezvous_public`, appelée via la clé secrète côté serveur — la table
  `rendezvous` elle-même reste verrouillée au propriétaire, cohérent avec la
  passe de sécurité du 16/09).
- **Prompts au lieu d'une bio vide** ([prompts.ts](src/lib/prompts.ts), liste
  fixe de 8 questions) : jusqu'à 3 par profil, gérés sur `/profil/prompts`.
  Exposés aux autres uniquement via `profils_a_decouvrir` (agrégation JSON
  dans la fonction SQL, même principe que pour la bio — pas de policy de
  lecture large sur `profile_prompts`). Affichés à la place de la bio en
  découverte quand ils existent.
- **Parrainage** : chaque profil a un `referral_code` auto-généré. Lien
  `/inscription?ref=CODE` → le code est porté dans `user_metadata` à
  l'inscription (traverse la confirmation d'email sans état serveur
  supplémentaire) → appliqué via `appliquer_parrainage()` à la complétion du
  profil (le filleul doit avoir un vrai profil, pas juste un email, avant que
  la récompense parte — limite l'abus). Récompense : **+3 jours Paolys+ pour
  les deux côtés**, fonction idempotente (jamais deux fois pour le même
  filleul même si l'action est rappelée). Lien affiché sur `/profil` avec
  [CopierLien.tsx](src/components/CopierLien.tsx), compteur de filleuls
  (`combien_j_ai_parraine`).
- **Bug corrigé (2026-09-16)** : `position` est un mot réservé PostgreSQL qui
  casse la syntaxe dans un `RETURNS TABLE(...)` (mais pas comme simple colonne
  de table). Renommé en `pos` partout (`profile_prompts`, `mes_prompts()`,
  `profils_a_decouvrir`, `prompt-actions.ts`, pages profil/prompts) — **ne pas
  réintroduire `position` comme nom de colonne dans un `RETURNS TABLE`.**
- **Migration 0011 exécutée avec succès le 2026-09-16, et les 3 fonctionnalités
  testées bout en bout ce jour-là** avec de nouveaux comptes de test (Aya,
  Boubacar, Fili — emails en alias `+` sur le Gmail de Manno, mot de passe
  `TestPaolys2026!`) : match Aya↔Boubacar créé, message + blocage
  contact (email/tel refusé pour compte gratuit avec message clair) +
  rendez-vous partagé (lien public `/rendez-vous/[id]` lisible sans compte)
  tous validés. Parrainage validé des deux côtés (filleul Fili et marraine
  Aya ont chacun reçu +3 jours Paolys+, compteur "1 déjà invité(e)s" correct).
- **Confirm email désactivé temporairement dans Supabase** (Authentication →
  Providers → Email) pour contourner la limite de débit du SMTP intégré
  pendant les tests — **à réactiver avant mise en prod**.
- **Bug mineur corrigé (2026-09-16)** : `signUp()` dans
  [auth-actions.ts](src/lib/auth-actions.ts) redirigeait toujours vers
  `/inscription/verifiez-vos-emails` même quand `Confirm email` est désactivé
  et qu'une session est déjà active. Corrigé : si `data.session` existe après
  `signUp()`, redirection directe vers `/profil/completer` (auto-connecté).
- **Incident du 2026-09-16** : en testant, le compte réel "Manno" a été
  accidentellement modifié (display_name → "TestManno", bio → texte de test)
  via une soumission de `/profil/completer` faite par erreur pendant qu'une
  session Manno était encore active. Décision de Manno : laisser tel quel
  (compte de dev, pas de restauration nécessaire).

## Sécurité — durcissement (2026-09-16)

Demande explicite de Manno : protection des données contre fuites/piratage,
déterrents anti-copie, blocage du partage de contact hors premium/sponsor.
Migrations 0009 et 0010.

- **Photos privées + liens signés** (migration 0009) : le bucket
  `profile-photos` était **public** — n'importe qui avec un lien y accédait
  indéfiniment, même sans être connecté. Passé en bucket privé ; chaque
  affichage génère un lien signé à durée limitée (1h) via
  [photo-url.ts](src/lib/photo-url.ts) (`urlPhotoSignee`, un seul helper
  réutilisé partout — 6 pages consolidées).
- **`profiles` trop permissif** (migration 0010, bug réel trouvé) : la policy
  RLS `using (true)` exposait **toutes les colonnes** de **tous les profils**
  (`premium_until`, `is_sponsor`, `hidden_from_discovery`...) à n'importe quel
  compte connecté via une requête API directe, en contournant les fonctions
  RPC pourtant soigneusement limitées utilisées partout ailleurs. Remplacée
  par : chacun voit sa propre ligne + les admins voient tout (nécessaire pour
  la jointure de `/admin/signalements`). Aucune fonction RPC existante n'est
  affectée (toutes `security definer`, donc indépendantes de cette policy).
  Nouvelle fonction `nom_du_profil(cible)` pour le nom affiché en conversation
  (remplace une lecture directe de `profiles`), limitée à soi-même/un
  match/un admin.
- **Photo sponsor contournable** (migration 0010, bug réel trouvé) : même
  après le passage en bucket privé, un utilisateur connecté pouvait générer
  lui-même un lien signé vers la photo d'un sponsor en appelant le client
  Supabase directement (hors de nos pages), contournant tout le système
  `sponsor_grants`. Corrigé par une policy de stockage qui vérifie
  `is_sponsor`/`sponsor_grants.voir_photo` **côté base de données**, pas
  seulement côté application.
- **Validation des fichiers uploadés** ([validate-image.ts](src/lib/validate-image.ts)) :
  type MIME limité à JPEG/PNG/WebP (SVG explicitement exclu — un SVG peut
  contenir du script, risque de XSS stocké), taille max 8 Mo. Appliqué à la
  photo de profil et au selfie de vérification.
- **Anti-spam vérification photo** : une demande ne peut être soumise que si
  aucune autre n'est déjà en attente (chaque tentative coûte un appel AWS
  Rekognition — sans ce garde-fou, un utilisateur pouvait générer des coûts en
  boucle).
- **Blocage contact dans le chat, sauf Paolys+/sponsor**
  ([message-actions.ts](src/lib/message-actions.ts)) : détection par
  expression régulière (email, numéro de téléphone) côté serveur avant
  l'insertion du message — volontairement simple, ne prétend pas contrer un
  contournement créatif (ex. écrire un numéro en toutes lettres), couvre les
  cas évidents.
- **Déterrents anti-copie sur les photos**
  ([ProtectedImage.tsx](src/components/ProtectedImage.tsx)) : clic droit et
  glisser-déposer désactivés. ⚠️ Honnêteté technique : **aucune protection web
  n'empêche réellement une capture d'écran** — ni CSS, ni JS, ni aucune
  technique connue. Ce qu'on a fait décourage la copie occasionnelle
  (clic droit → enregistrer), rien de plus. Ne jamais présenter ça comme une
  garantie à Manno ou aux utilisateurs.
- **Limite assumée et non corrigée** : la réciprocité photo (floutage si
  l'utilisateur n'a pas sa propre photo, Phase 4) reste purement applicative,
  contournable via le client Supabase directement — décision volontaire, c'est
  un mécanisme d'incitation à l'engagement, pas une promesse de confidentialité
  comme pour les sponsors/contacts.

Une étape validée avant de passer à la suivante — pas de fonctionnalité avancée avant
que les fondations (auth + profils) soient solides.

## Décisions validées (2026-09-10)

- **Niveau technique** : utilisateur non-développeur → avancer étape par étape,
  expliquer simplement, attendre validation avant chaque étape clé (même convention
  que les projets SENTINEL).
- **Budget MVP** : ~100$/mois (hébergement + APIs tierces).
- **Stack** : liberté totale laissée — Next.js + Supabase + Vercel retenus (voir
  Architecture technique ci-dessus).
- **Délai MVP** : rapide, 4-6 semaines → scope v1 volontairement resserré
  (vérification photo manuelle plutôt qu'automatisée, cf. ci-dessus).
- **Phone OTP différé** (2026-09-10) : auth v1 = email + mot de passe uniquement
  (natif Supabase, zéro coût, zéro compte tiers à créer avant de commencer à coder).
  Le téléphone/OTP (Twilio) sera ajouté après, probablement comme condition pour
  qu'un profil devienne visible en découverte (couche de confiance en plus du
  selfie), pas comme méthode de connexion principale.
- **Nom du projet** : Paoly → **Paolys** (dossier et nom de package renommés,
  2026-09-10).
- **Vérification photo hybride** (2026-09-10) : ni 100% manuelle (ne passerait
  pas à l'échelle pour Manno seul) ni 100% automatisée d'entrée (coût/dépendance
  externe dès le départ). Filtre automatique AWS Rekognition (`DetectFaces` —
  un seul visage net, sinon rejet immédiat sans solliciter l'admin) + décision
  finale humaine sur les cas qui passent le filtre. Compte AWS IAM dédié,
  permission minimale `AmazonRekognitionReadOnlyAccess`. Badge non bloquant
  (cf. Phase 4) — évite le goulot d'étranglement d'une vérification obligatoire
  pour utiliser l'app.
- **Photo de profil optionnelle + réciprocité** (2026-09-10) : allège l'inscription
  (photo non obligatoire) tout en gardant l'incitation — en découverte, pas de
  photo de soi = photos des autres floutées. Aucune dépendance à la modération
  admin (contrairement au badge vérifié), donc pas de goulot d'étranglement.

## Notes techniques

- **Realtime + `@supabase/ssr`** : tout composant client qui s'abonne à
  `postgres_changes` doit appeler `supabase.realtime.setAuth(session.access_token)`
  (après `supabase.auth.getSession()`) AVANT `.channel().subscribe()`. Sans ça,
  le canal se connecte quand même ("SUBSCRIBED") mais les évènements sont
  filtrés silencieusement par les policies RLS car le socket reste authentifié
  en tant que rôle `anon`. Voir [ConversationClient.tsx](src/components/ConversationClient.tsx).
- **Noms de policies SQL sans accents** (volontaire) : le collage automatisé dans
  l'éditeur SQL Supabase via navigateur corrompt les caractères accentués (bug
  d'encodage entre l'automatisation et le presse-papier réel). Les noms de policy
  RLS sont donc en français sans accents (ex. "authentifies" pas "authentifiés") —
  purement cosmétique, aucun impact fonctionnel. Si un futur script SQL doit être
  collé via automatisation navigateur, éviter les accents dans les chaînes ou
  passer par un copier-coller manuel.

## Patterns d'interface façon Badoo — édition de profil + nav globale (2026-09-18)

- **Écran d'édition de profil** (`/profil/modifier`) : liste de lignes icône +
  label + valeur + chevron (Prénom, Date de naissance, Tu es, Tu recherches,
  Ville, À propos). Chaque ligne ouvre un écran dédié `/profil/modifier/[champ]`
  (`src/app/profil/modifier/[champ]/page.tsx`) avec le bon type de champ
  (select, date, texte, textarea) et une seule action serveur `mettreAJourChamp`
  (`src/lib/profile-actions.ts`) qui ne met à jour QUE la colonne concernée
  (update ciblé, pas un upsert complet comme `enregistrerProfil` utilisé par
  `/profil/completer`).
- **Bloc Vérification** en haut de `/profil/modifier` : fond `lagune-tint`,
  bordure `lagune`, CTA plein largeur "Faire vérifier par photo" — traité comme
  argument de confiance central, pas un réglage secondaire perdu dans la liste.
- **Nav du bas globale** : `BottomNav` (`src/components/BottomNav.tsx`) posé sur
  tous les écrans principaux connectés — `/decouverte`, `/profil`,
  `/profil/modifier`, `/messages`, `/aimes-par` — avec le layout anti-bug
  `h-dvh flex-col overflow-hidden` + `min-h-0 flex-1 overflow-y-auto` sur la
  zone de contenu à chaque fois (même fix que le bug de scroll imbriqué de
  Découverte). État actif détecté par préfixe de route (`pathname.startsWith`)
  pour que les sous-écrans (`/profil/modifier`, etc.) gardent l'onglet parent
  surligné en mangue. Badge de likes (rose) alimenté par `combien_m_ont_aime`
  sur chaque écran qui affiche la nav.
- Simplifications encore en place (déjà disclosées) : "À proximité" == route
  `/decouverte`, super-like == like. `/profil/verification` et
  `/profil/modifier/[champ]` (écrans de saisie ciblée) n'ont volontairement PAS
  la nav du bas, pour rester des flux de saisie focalisés avec juste un lien
  retour — cohérent avec `/profil/prompts`.

## Décisions en attente

- Nom de domaine à réserver (paolys.ci ? .com ?).
- Compte Supabase, Vercel, Twilio, CinetPay à créer par l'utilisateur (comptes/clés API
  — je ne peux pas les créer à sa place).
- Charte graphique précise (couleurs, logo) — à définir ou proposer en phase 1.

## Conventions de communication

- Réponses concises, propositions suivies de fichiers complets.
- Changements de scope explicites, jamais silencieux.
- Avancer phase par phase, valider avant de passer à la suivante.

## Fichiers du projet

```
src/app/             — Pages et routes Next.js (App Router)
src/components/      — Composants React réutilisables
src/lib/supabase/    — Client Supabase (browser + server)
src/lib/             — Logique métier (auth, matching, paiement, etc.)
supabase/migrations/ — Schéma SQL (tables, PostGIS, RLS)
public/              — Assets statiques (logo, icônes PWA)
CLAUDE.md            — Ce fichier (mémoire de projet)
AGENTS.md            — Généré par Next.js (notes de version du framework, ne pas
                        confondre avec la mémoire de projet ci-dessus)
```
