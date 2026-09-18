"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { getDictionary, type Locale } from "@/lib/i18n/dictionary";
import { EnTeteLogo } from "@/components/EnTeteLogo";
import { BoutonAccueil } from "@/components/BoutonAccueil";

export default function NouveauMotDePassePage() {
  // Pas de layout serveur ici (page client autonome, atteinte via le lien
  // recu par email) : on affiche en francais, l'essentiel (definir un
  // nouveau mot de passe) reste clair sans traduction parfaite ici.
  const locale: Locale = "fr";
  const d = getDictionary(locale);
  const router = useRouter();

  const [pret, setPret] = useState(false);
  const [motDePasse, setMotDePasse] = useState("");
  const [enCours, setEnCours] = useState(false);
  const [erreur, setErreur] = useState<string | null>(null);
  const [succes, setSucces] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") {
        setPret(true);
      }
    });

    // Si la session de recuperation est deja etablie au chargement (l'evenement
    // peut avoir ete emis avant l'attachement du listener).
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) setPret(true);
    });

    return () => subscription.unsubscribe();
  }, []);

  async function envoyer() {
    if (motDePasse.length < 6) return;
    setEnCours(true);
    setErreur(null);
    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ password: motDePasse });
    setEnCours(false);
    if (error) {
      setErreur(error.message);
      return;
    }
    setSucces(true);
    setTimeout(() => router.push("/connexion"), 2000);
  }

  return (
    <div className="page-bg flex flex-1 flex-col overflow-y-auto">
      <div className="relative flex h-7 box-content shrink-0 items-center justify-end gap-2 px-6 pt-4">
        <EnTeteLogo />
        <BoutonAccueil />
      </div>
      <div className="flex flex-col items-center px-6 pb-8">
        <div className="card-warm mt-10 w-full max-w-sm p-8">
          <h1 className="font-display text-3xl text-brand">
            {d.nouveauMotDePasse.titre}
          </h1>

          {succes ? (
            <p className="mt-4 rounded-lg px-4 py-3 text-sm font-medium" style={{ background: "var(--lagune-tint)", color: "var(--lagune)" }}>
              {d.nouveauMotDePasse.succes}
            </p>
          ) : !pret ? (
            <p className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
              {d.nouveauMotDePasse.erreurLienInvalide}
            </p>
          ) : (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                envoyer();
              }}
              className="mt-6 flex flex-col gap-4"
            >
              <div>
                <label htmlFor="motDePasse" className="text-sm font-medium">
                  {d.nouveauMotDePasse.label}
                </label>
                <input
                  id="motDePasse"
                  type="password"
                  required
                  minLength={6}
                  value={motDePasse}
                  onChange={(e) => setMotDePasse(e.target.value)}
                  className="field-warm mt-1"
                />
              </div>
              {erreur && <p className="text-sm text-red-600">{erreur}</p>}
              <button type="submit" disabled={enCours} className="btn-primary-warm mt-2 disabled:opacity-50">
                {d.nouveauMotDePasse.confirmer}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
