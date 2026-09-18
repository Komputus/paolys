"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { demanderRdv, repondreDemandeRdv } from "@/lib/rdv-negociation-actions";
import { getDictionary, type Locale } from "@/lib/i18n/dictionary";

export type DemandeRdv = {
  id: string;
  demandeur_id: string;
  statut: "attente_acceptation" | "confirme" | "refuse";
};

export function DemandeRendezVous({
  matchId,
  moiId,
  autreNom,
  demandeInitiale,
  eligible,
  locale,
}: {
  matchId: string;
  moiId: string;
  autreNom: string;
  demandeInitiale: DemandeRdv | null;
  eligible: boolean;
  locale: Locale;
}) {
  const d = getDictionary(locale);
  const [demande, setDemande] = useState<DemandeRdv | null>(demandeInitiale);
  const [enCours, setEnCours] = useState(false);
  const [erreur, setErreur] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createClient();
    let channel: ReturnType<typeof supabase.channel> | null = null;
    let annule = false;

    (async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session) {
        supabase.realtime.setAuth(session.access_token);
      }
      if (annule) return;

      channel = supabase
        .channel(`demandes-rdv-${matchId}`)
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "demandes_rendezvous",
            filter: `match_id=eq.${matchId}`,
          },
          (payload) => {
            if (payload.eventType === "DELETE") return;
            setDemande(payload.new as DemandeRdv);
          },
        )
        .subscribe();
    })();

    return () => {
      annule = true;
      if (channel) supabase.removeChannel(channel);
    };
  }, [matchId]);

  async function agir(action: () => Promise<void>) {
    setEnCours(true);
    setErreur(null);
    try {
      await action();
    } catch (e) {
      setErreur(e instanceof Error ? e.message : d.demandeRdv.erreur);
    } finally {
      setEnCours(false);
    }
  }

  async function creerDemande() {
    await agir(async () => {
      const id = await demanderRdv(matchId);
      setDemande({ id, demandeur_id: moiId, statut: "attente_acceptation" });
    });
  }

  if (!demande) {
    if (!eligible) return null;
    return (
      <div className="flex flex-col items-center gap-1 px-6 pb-2">
        <button
          onClick={creerDemande}
          disabled={enCours}
          className="btn-tertiary-warm text-xs disabled:opacity-50"
        >
          {d.demandeRdv.bouton}
        </button>
        {erreur && <p className="text-xs text-red-600">{erreur}</p>}
      </div>
    );
  }

  const jeSuisDemandeur = demande.demandeur_id === moiId;

  return (
    <div className="mx-6 mb-2 card-warm p-4 text-left text-sm">
      {erreur && <p className="mb-2 text-xs text-red-600">{erreur}</p>}

      {demande.statut === "attente_acceptation" &&
        (jeSuisDemandeur ? (
          <p className="text-foreground/70">{d.demandeRdv.enAttenteAcceptation(autreNom)}</p>
        ) : (
          <div className="flex flex-col gap-2">
            <p className="font-medium text-foreground">{d.demandeRdv.proposeAcceptation(autreNom)}</p>
            <div className="flex gap-2">
              <button
                onClick={() =>
                  agir(async () => {
                    await repondreDemandeRdv(demande.id, true);
                    setDemande({ ...demande, statut: "confirme" });
                  })
                }
                disabled={enCours}
                className="btn-primary-warm text-sm disabled:opacity-50"
              >
                {d.demandeRdv.accepter}
              </button>
              <button
                onClick={() =>
                  agir(async () => {
                    await repondreDemandeRdv(demande.id, false);
                    setDemande({ ...demande, statut: "refuse" });
                  })
                }
                disabled={enCours}
                className="btn-tertiary-warm text-sm disabled:opacity-50"
              >
                {d.demandeRdv.refuser}
              </button>
            </div>
          </div>
        ))}

      {demande.statut === "confirme" && (
        <p className="font-medium" style={{ color: "var(--lagune)" }}>
          {d.demandeRdv.confirme(autreNom)}
        </p>
      )}

      {demande.statut === "refuse" && (
        <p className="text-foreground/60">{d.demandeRdv.refuseTexte}</p>
      )}
    </div>
  );
}
