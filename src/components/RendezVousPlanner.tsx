"use client";

import { useState } from "react";
import { creerRendezVous } from "@/lib/rendezvous-actions";
import { getDictionary, type Locale } from "@/lib/i18n/dictionary";

export function RendezVousPlanner({ matchId, locale }: { matchId: string; locale: Locale }) {
  const d = getDictionary(locale);
  const [ouvert, setOuvert] = useState(false);
  const [lieu, setLieu] = useState("");
  const [moment, setMoment] = useState("");
  const [note, setNote] = useState("");
  const [lien, setLien] = useState<string | null>(null);
  const [enCours, setEnCours] = useState(false);
  const [erreur, setErreur] = useState<string | null>(null);

  async function creer() {
    if (!lieu.trim() || !moment) return;
    setEnCours(true);
    setErreur(null);
    try {
      const { id } = await creerRendezVous({ matchId, lieu, moment, note });
      setLien(`${window.location.origin}/rendez-vous/${id}`);
    } catch (e) {
      setErreur(e instanceof Error ? e.message : d.rendezvous.erreurCreation);
    } finally {
      setEnCours(false);
    }
  }

  async function partager() {
    if (!lien) return;
    if (navigator.share) {
      try {
        await navigator.share({
          title: d.rendezvous.partageTitreNatif,
          text: d.rendezvous.partageTexteNatif,
          url: lien,
        });
        return;
      } catch {
        // l'utilisateur a annulé le partage natif, on retombe sur la copie
      }
    }
    await navigator.clipboard.writeText(lien);
    alert(d.rendezvous.lienCopie);
  }

  if (!ouvert) {
    return (
      <button
        onClick={() => setOuvert(true)}
        className="btn-tertiary-warm text-xs"
      >
        {d.rendezvous.bouton}
      </button>
    );
  }

  return (
    <div className="card-warm w-full max-w-sm p-4 text-left text-sm">
      <p className="font-medium text-foreground">{d.rendezvous.partageTitre}</p>
      <p className="mt-1 text-xs text-foreground/60">{d.rendezvous.partageTexte}</p>

      {lien ? (
        <div className="mt-3 flex flex-col gap-2">
          <p className="break-all rounded-lg bg-brand-light px-3 py-2 text-xs text-foreground/80">
            {lien}
          </p>
          <button onClick={partager} className="btn-primary-warm text-sm">
            {d.rendezvous.partagerLien}
          </button>
        </div>
      ) : (
        <div className="mt-3 flex flex-col gap-2">
          <input
            type="text"
            placeholder={d.rendezvous.lieuPlaceholder}
            value={lieu}
            onChange={(e) => setLieu(e.target.value)}
            className="field-warm text-sm"
          />
          <input
            type="datetime-local"
            value={moment}
            onChange={(e) => setMoment(e.target.value)}
            className="field-warm text-sm"
          />
          <textarea
            placeholder={d.rendezvous.notePlaceholder}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={2}
            className="field-warm text-sm"
          />
          {erreur && <p className="text-xs text-red-600">{erreur}</p>}
          <button
            onClick={creer}
            disabled={enCours || !lieu.trim() || !moment}
            className="btn-primary-warm text-sm disabled:opacity-50"
          >
            {d.rendezvous.genererLien}
          </button>
        </div>
      )}
    </div>
  );
}
