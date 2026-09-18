"use client";

import { useState } from "react";
import Link from "next/link";
import { enregistrerSwipe } from "@/lib/swipe-actions";
import { annulerDernierSwipe } from "@/lib/premium-actions";
import { SignalerBloquer } from "@/components/SignalerBloquer";
import { ProtectedImage } from "@/components/ProtectedImage";
import { HeroArt } from "@/components/HeroArt";
import { BottomNav } from "@/components/BottomNav";
import { BoutonAccueil } from "@/components/BoutonAccueil";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { getDictionary, type Locale } from "@/lib/i18n/dictionary";

export type Candidat = {
  id: string;
  display_name: string;
  age: number;
  bio: string | null;
  city: string | null;
  verifie: boolean;
  photoUrls: string[];
  prompts: { question: string; reponse: string }[];
};

type Bloc =
  | { type: "prompt"; question: string; reponse: string }
  | { type: "photo"; url: string };

function construireBlocs(candidat: Candidat): Bloc[] {
  const photosSuivantes = candidat.photoUrls.slice(1);
  const blocs: Bloc[] = [];
  let iPrompt = 0;

  for (const url of photosSuivantes) {
    if (iPrompt < candidat.prompts.length) {
      const p = candidat.prompts[iPrompt];
      blocs.push({ type: "prompt", question: p.question, reponse: p.reponse });
      iPrompt++;
    }
    blocs.push({ type: "photo", url });
  }
  while (iPrompt < candidat.prompts.length) {
    const p = candidat.prompts[iPrompt];
    blocs.push({ type: "prompt", question: p.question, reponse: p.reponse });
    iPrompt++;
  }
  return blocs;
}

export function DecouverteClient({
  candidats,
  viewerAUnePhoto,
  estPremium,
  filtres,
  locale,
  compteLikes,
}: {
  candidats: Candidat[];
  viewerAUnePhoto: boolean;
  estPremium: boolean;
  filtres: { ageMin?: string; ageMax?: string; verifie: boolean };
  locale: Locale;
  compteLikes: number;
}) {
  const d = getDictionary(locale);
  const [index, setIndex] = useState(0);
  const [enCours, setEnCours] = useState(false);
  const [filtresOuverts, setFiltresOuverts] = useState(false);
  const [match, setMatch] = useState<{ candidat: Candidat; matchId: string } | null>(
    null,
  );

  const candidat = candidats[index];
  const aSuivre = candidats.slice(index + 1, index + 6);

  async function swiper(sens: "like" | "pass") {
    if (!candidat || enCours) return;
    setEnCours(true);
    try {
      const resultat = await enregistrerSwipe(candidat.id, sens);
      if (resultat.matchId) {
        setMatch({ candidat, matchId: resultat.matchId });
      } else {
        setIndex((i) => i + 1);
      }
    } finally {
      setEnCours(false);
    }
  }

  async function annuler() {
    if (index === 0 || enCours) return;
    setEnCours(true);
    try {
      const resultat = await annulerDernierSwipe();
      if (resultat.profilId === candidats[index - 1]?.id) {
        setIndex((i) => i - 1);
      }
    } finally {
      setEnCours(false);
    }
  }

  const panneauFiltres = estPremium && (
    <form
      method="get"
      className="card-warm flex flex-col gap-3 p-4"
    >
      <p className="text-heading">{d.decouverte.filtres}</p>
      <div className="flex gap-3">
        <div>
          <label className="text-xs text-muted">{d.decouverte.ageMin}</label>
          <input
            type="number"
            name="ageMin"
            min={18}
            defaultValue={filtres.ageMin}
            className="field-warm mt-1 w-20 text-sm"
          />
        </div>
        <div>
          <label className="text-xs text-muted">{d.decouverte.ageMax}</label>
          <input
            type="number"
            name="ageMax"
            min={18}
            defaultValue={filtres.ageMax}
            className="field-warm mt-1 w-20 text-sm"
          />
        </div>
      </div>
      <label className="flex items-center gap-1.5 text-sm">
        <input
          type="checkbox"
          name="verifie"
          value="true"
          defaultChecked={filtres.verifie}
        />
        {d.decouverte.verifiesUniquement}
      </label>
      <button type="submit" className="btn-primary-warm text-sm">
        {d.decouverte.appliquer}
      </button>
    </form>
  );

  return (
    <div className="page-bg flex h-dvh flex-col overflow-hidden">
      <header className="flex shrink-0 items-center justify-between px-6 py-4">
        <Link href="/profil" className="link-warm text-sm">
          {d.nav.monProfil}
        </Link>
        <div className="flex items-center gap-2">
          {estPremium && (
            <button
              onClick={() => setFiltresOuverts((v) => !v)}
              className="btn-tertiary-warm lg:hidden"
            >
              {d.decouverte.filtres}
            </button>
          )}
          <BoutonAccueil />
          <LanguageSwitcher locale={locale} />
        </div>
      </header>

      {estPremium && filtresOuverts && (
        <div className="mx-6 mb-4 lg:hidden">{panneauFiltres}</div>
      )}

      <div className="flex min-h-0 flex-1 gap-6 px-0 lg:grid lg:grid-cols-[320px_1fr_320px] lg:px-6 lg:pb-6">
        {/* Colonne fantome : meme largeur que le panneau lateral, pour que la
            carte du milieu soit vraiment centree sur la page (et non centree
            dans l'espace restant apres le panneau, ce qui la decalait a
            gauche sur grand ecran). */}
        <div className="hidden lg:block" />

        {/* Colonne principale : carte de decouverte */}
        <div className="flex min-h-0 flex-1 justify-center lg:min-w-0">
          {match ? (
            <div className="flex flex-1 items-center justify-center overflow-y-auto px-6 pb-12 text-center">
              <div className="max-w-sm">
                <HeroArt size="sm" />
                <p className="font-display mt-2 text-lg text-gold">
                  {d.decouverte.cestReciproque}
                </p>
                <h1 className="font-display mt-1 text-4xl text-mangue">
                  {d.decouverte.cestUnMatch}
                </h1>
                <p className="mt-4 text-foreground/80">
                  {d.decouverte.plusMutuellement(match.candidat.display_name)}
                </p>
                <Link
                  href={`/messages/${match.matchId}`}
                  className="btn-primary-warm mt-8 inline-flex"
                >
                  {d.decouverte.envoyerMessage}
                </Link>
                <button
                  onClick={() => {
                    setMatch(null);
                    setIndex((i) => i + 1);
                  }}
                  className="btn-tertiary-warm mt-4 w-full"
                >
                  {d.decouverte.continuerDecouvrir}
                </button>
              </div>
            </div>
          ) : !candidat ? (
            <div className="flex flex-1 items-center justify-center overflow-y-auto px-6 pb-12 text-center">
              <div className="max-w-sm">
                <HeroArt size="sm" />
                <p className="mt-4 text-foreground/70">{d.decouverte.plusDeProfils}</p>
              </div>
            </div>
          ) : (
            <CarteCandidat
              candidat={candidat}
              viewerAUnePhoto={viewerAUnePhoto}
              estPremium={estPremium}
              enCours={enCours}
              peutAnnuler={estPremium && index > 0}
              onPass={() => swiper("pass")}
              onLike={() => swiper("like")}
              onAnnuler={annuler}
              onBloque={() => setIndex((i) => i + 1)}
              locale={locale}
              d={d}
            />
          )}
        </div>

        {/* Panneau lateral desktop : filtres + a suivre (jamais un vide flottant) */}
        <aside className="hidden w-80 shrink-0 flex-col gap-6 overflow-y-auto py-2 lg:flex">
          {panneauFiltres}
          {aSuivre.length > 0 && (
            <div className="card-warm flex flex-col gap-3 p-4">
              <p className="text-heading">{d.nav.rencontres}</p>
              <ul className="flex flex-col gap-3">
                {aSuivre.map((c) => (
                  <li key={c.id} className="flex items-center gap-3">
                    <div className="h-11 w-11 shrink-0 overflow-hidden rounded-full bg-brand-light">
                      {c.photoUrls[0] && (
                        <ProtectedImage
                          src={c.photoUrls[0]}
                          alt={c.display_name}
                          width={44}
                          height={44}
                          className="h-full w-full object-cover"
                        />
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-foreground">
                        {c.display_name}, {c.age}
                      </p>
                      {c.city && (
                        <p className="truncate text-xs text-muted">{c.city}</p>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </aside>
      </div>

      <BottomNav locale={locale} compteLikes={compteLikes} />
    </div>
  );
}

function CarteCandidat({
  candidat,
  viewerAUnePhoto,
  estPremium,
  enCours,
  peutAnnuler,
  onPass,
  onLike,
  onAnnuler,
  onBloque,
  locale,
  d,
}: {
  candidat: Candidat;
  viewerAUnePhoto: boolean;
  estPremium: boolean;
  enCours: boolean;
  peutAnnuler: boolean;
  onPass: () => void;
  onLike: () => void;
  onAnnuler: () => void;
  onBloque: () => void;
  locale: Locale;
  d: ReturnType<typeof getDictionary>;
}) {
  const premierePhoto = candidat.photoUrls[0] ?? null;
  const blocs = construireBlocs(candidat);

  return (
    <div className="relative flex min-h-0 w-full max-w-md flex-col">
      <div className="flex-1 overflow-y-auto pb-28">
        <div className="relative aspect-[3/4] w-full overflow-hidden sm:rounded-b-3xl">
          {premierePhoto ? (
            <ProtectedImage
              src={premierePhoto}
              alt={candidat.display_name}
              fill
              sizes="480px"
              className={`object-cover ${viewerAUnePhoto ? "" : "blur-xl"}`}
            />
          ) : (
            // Pas de photo : fond degrade de marque + silhouette, jamais un
            // rectangle vide (le nom en blanc devenait invisible dessus).
            <div
              className="absolute inset-0 flex items-center justify-center"
              style={{
                background:
                  "linear-gradient(135deg, var(--azur), var(--rose))",
              }}
            >
              <IconSilhouette />
            </div>
          )}
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent px-5 pb-4 pt-16 text-left">
            <h1 className="font-display text-2xl text-white">
              {candidat.display_name}
            </h1>
          </div>
          {!viewerAUnePhoto && premierePhoto && (
            <Link
              href="/profil/completer"
              className="absolute inset-0 flex items-center justify-center bg-black/40 p-4 text-center text-sm font-medium text-white"
            >
              {d.decouverte.ajoutePhoto}
            </Link>
          )}
        </div>

        {/* Puces de faits rapides (icone + texte), sous la photo */}
        <div className="flex flex-wrap gap-2 px-5 pt-4">
          <ChipFait icone="🎂" texte={d.decouverte.ans(candidat.age)} />
          {candidat.city && <ChipFait icone="📍" texte={candidat.city} />}
          {candidat.verifie && (
            <ChipFait icone="✓" texte={d.decouverte.verifie} accent="lagune" />
          )}
        </div>

        <div className="flex flex-col gap-4 px-5 pt-4">
          {blocs.length === 0 && candidat.bio && (
            <p className="text-body text-foreground/80">{candidat.bio}</p>
          )}
          {blocs.map((bloc, i) =>
            bloc.type === "prompt" ? (
              <div
                key={`prompt-${i}`}
                className="rounded-2xl px-4 py-3"
                style={{ background: "var(--mangue-tint)" }}
              >
                <p className="text-caption" style={{ color: "var(--mangue-dark)" }}>
                  {bloc.question}
                </p>
                <p className="text-body-lg mt-1 text-foreground">{bloc.reponse}</p>
              </div>
            ) : (
              <div
                key={`photo-${i}`}
                className="relative aspect-[3/4] w-full overflow-hidden rounded-2xl"
              >
                <ProtectedImage
                  src={bloc.url}
                  alt={candidat.display_name}
                  fill
                  sizes="480px"
                  className={`object-cover ${viewerAUnePhoto ? "" : "blur-xl"}`}
                />
              </div>
            ),
          )}
        </div>

        <div className="mt-6 flex justify-center">
          <SignalerBloquer
            cibleId={candidat.id}
            cibleNom={candidat.display_name}
            onBloque={onBloque}
            locale={locale}
          />
        </div>
      </div>

      {/* Actions fixes en bas de la zone photo (design system > carte de decouverte) */}
      <div className="absolute inset-x-0 bottom-0 flex items-center justify-center gap-5 pb-6 pt-10" style={{ background: "linear-gradient(to top, var(--surface-100) 55%, transparent)" }}>
        {peutAnnuler && (
          <button
            onClick={onAnnuler}
            disabled={enCours}
            className="absolute left-5 h-10 w-10 rounded-full border text-base shadow-md transition-transform hover:scale-105 disabled:opacity-50"
            style={{ borderColor: "var(--line)", background: "var(--surface-200)", color: "var(--ink-muted)" }}
            aria-label={d.decouverte.annulerSwipe}
            title={d.decouverte.annulerSwipe}
          >
            ↺
          </button>
        )}
        <button
          onClick={onPass}
          disabled={enCours}
          className="flex h-14 w-14 items-center justify-center rounded-full shadow-lg transition-transform hover:scale-105 disabled:opacity-50"
          style={{ background: "var(--surface-200)", border: "2px solid var(--azur)", color: "var(--azur)" }}
          aria-label={d.decouverte.passer}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
          </svg>
        </button>
        <button
          disabled={enCours}
          className="flex h-11 w-11 items-center justify-center rounded-full text-white shadow-lg transition-transform hover:scale-105 disabled:opacity-50"
          style={{ background: "var(--rose)" }}
          aria-label={d.decouverte.superLike}
          title={d.decouverte.superLike}
          onClick={onLike}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2l2.6 8.4L23 13l-8.4 2.6L12 24l-2.6-8.4L1 13l8.4-2.6L12 2z" />
          </svg>
        </button>
        <button
          onClick={onLike}
          disabled={enCours}
          className="flex h-16 w-16 items-center justify-center rounded-full text-white shadow-lg transition-transform hover:scale-105 disabled:opacity-50"
          style={{ background: "var(--mangue)" }}
          aria-label={d.decouverte.jAime}
        >
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
            <path
              d="M12 20.5l-1.3-1.2C5.7 14.9 3 12.4 3 9.3 3 6.8 5 4.8 7.5 4.8c1.4 0 2.8.7 3.6 1.7.9-1 2.2-1.7 3.6-1.7C17.2 4.8 19 6.8 19 9.3c0 3.1-2.7 5.6-7.7 10l-1.3 1.2z"
              fill="white"
            />
          </svg>
        </button>
      </div>
    </div>
  );
}

function IconSilhouette() {
  return (
    <svg width="72" height="72" viewBox="0 0 24 24" fill="none" opacity="0.5">
      <circle cx="12" cy="8" r="4" fill="white" />
      <path d="M4 21c1.4-4.2 4.6-6.5 8-6.5s6.6 2.3 8 6.5" fill="white" />
    </svg>
  );
}

function ChipFait({
  icone,
  texte,
  accent,
}: {
  icone: string;
  texte: string;
  accent?: "lagune";
}) {
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-caption"
      style={
        accent === "lagune"
          ? { background: "var(--lagune-tint)", color: "var(--lagune)" }
          : { background: "var(--surface-200)", color: "var(--ink)", border: "1px solid var(--line)" }
      }
    >
      <span aria-hidden>{icone}</span>
      {texte}
    </span>
  );
}
