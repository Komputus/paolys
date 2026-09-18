import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { verifierPaiement } from "@/lib/cinetpay";
import { getLocale } from "@/lib/i18n/locale";
import { getDictionary } from "@/lib/i18n/dictionary";
import { BoutonAccueil } from "@/components/BoutonAccueil";
import { EnTeteLogo } from "@/components/EnTeteLogo";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";

export default async function PaiementRetourPage({
  searchParams,
}: PageProps<"/paiement/retour">) {
  const { transaction } = await searchParams;
  const locale = await getLocale();
  const d = getDictionary(locale);

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/connexion");
  }

  // Affichage uniquement — l'activation reelle de l'abonnement vient toujours
  // du webhook /api/paiement/notifier, jamais de cette page (l'utilisateur
  // pourrait fermer son navigateur avant d'y revenir, ou manipuler l'URL).
  const verification =
    typeof transaction === "string" ? await verifierPaiement(transaction) : null;

  const accepte = verification?.data?.status === "ACCEPTED";

  return (
    <div className="page-bg flex flex-1 flex-col overflow-y-auto text-center">
      <div className="relative flex h-7 box-content shrink-0 items-center justify-end gap-2 px-6 pt-4">
        <EnTeteLogo />
        <BoutonAccueil />
        <LanguageSwitcher locale={locale} />
      </div>
      <div className="flex flex-col items-center px-6 pb-12">
      <div className="mt-4 max-w-sm">
        <h1 className="text-2xl font-semibold text-brand">
          {accepte ? d.paiementRetour.recu : d.paiementRetour.enCours}
        </h1>
        <p className="mt-4 text-foreground/70">
          {accepte ? d.paiementRetour.texteRecu : d.paiementRetour.texteEnCours}
        </p>
        <Link
          href="/profil"
          className="mt-8 inline-block rounded-full bg-brand px-8 py-3 font-medium text-white transition-colors hover:bg-brand-dark"
        >
          {d.paiementRetour.retour}
        </Link>
      </div>
      </div>
    </div>
  );
}
