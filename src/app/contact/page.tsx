import Link from "next/link";
import { BoutonAccueil } from "@/components/BoutonAccueil";
import { EnTeteLogo } from "@/components/EnTeteLogo";
import { Footer } from "@/components/Footer";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { getLocale } from "@/lib/i18n/locale";
import { getDictionary } from "@/lib/i18n/dictionary";

export default async function ContactPage() {
  const locale = await getLocale();
  const d = getDictionary(locale);
  return (
    <div className="page-bg flex flex-1 flex-col overflow-y-auto">
      <div className="relative flex h-7 box-content shrink-0 items-center justify-end gap-2 px-6 pt-4">
        <EnTeteLogo />
        <BoutonAccueil />
        <LanguageSwitcher locale={locale} />
      </div>
      <div className="mx-auto w-full max-w-2xl px-6 pb-16 pt-4">
        <Link href="/" className="link-warm text-sm">
          {d.nav.accueil}
        </Link>
        <h1 className="font-display mt-4 text-3xl text-brand">{d.contact.titre}</h1>

        <div className="mt-6 flex flex-col gap-5 text-foreground/80">
          <p>{d.contact.intro}</p>

          <section>
            <h2 className="text-heading text-foreground">{d.contact.emailTitre}</h2>
            <p className="mt-2 rounded-lg bg-brand-light px-4 py-3 text-sm text-brand-dark">
              {d.contact.emailAvertissement}
            </p>
          </section>

          <section>
            <h2 className="text-heading text-foreground">{d.contact.signalerTitre}</h2>
            <p className="mt-2">{d.contact.signalerTexte}</p>
          </section>
        </div>
      </div>
      <Footer locale={locale} />
    </div>
  );
}
