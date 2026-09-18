import Link from "next/link";
import { BoutonAccueil } from "@/components/BoutonAccueil";
import { EnTeteLogo } from "@/components/EnTeteLogo";
import { Footer } from "@/components/Footer";
import { getLocale } from "@/lib/i18n/locale";

export default async function ContactPage() {
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
        <h1 className="font-display mt-4 text-3xl text-brand">Contact</h1>

        <div className="mt-6 flex flex-col gap-5 text-foreground/80">
          <p>
            Une question, un problème, un signalement ? Écris-nous, nous te répondrons
            dès que possible.
          </p>

          <section>
            <h2 className="text-heading text-foreground">Par e-mail</h2>
            <p className="mt-2 rounded-lg bg-brand-light px-4 py-3 text-sm text-brand-dark">
              ⚠️ À compléter : adresse e-mail de support à afficher ici (ex.
              contact@paolys.app).
            </p>
          </section>

          <section>
            <h2 className="text-heading text-foreground">Signaler un profil ou un abus</h2>
            <p className="mt-2">
              Si tu rencontres un comportement inapproprié sur l&apos;application, utilise
              en priorité le bouton de signalement présent sur les profils et
              conversations concernés — cela nous permet d&apos;agir plus vite.
            </p>
          </section>
        </div>
      </div>
      <Footer locale={locale} />
    </div>
  );
}
