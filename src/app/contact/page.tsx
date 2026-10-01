import { EnTeteLogo } from "@/components/EnTeteLogo";
import { Footer } from "@/components/Footer";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { BoutonProfil } from "@/components/BoutonProfil";
import { createClient } from "@/lib/supabase/server";
import { getLocale } from "@/lib/i18n/locale";
import { getDictionary } from "@/lib/i18n/dictionary";
import { EMAIL_CONTACT } from "@/lib/site-config";

export default async function ContactPage() {
  const locale = await getLocale();
  const d = getDictionary(locale);
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return (
    <div className="page-bg flex flex-1 flex-col overflow-y-auto">
      <div className="relative flex h-7 box-content shrink-0 items-center justify-end gap-2 px-6 pt-4">
        <EnTeteLogo />
        <LanguageSwitcher locale={locale} />
        <BoutonProfil connecte={Boolean(user)} />
      </div>
      <div className="mx-auto w-full max-w-2xl px-6 pb-16 pt-4">
        <h1 className="font-display mt-4 text-3xl text-brand">{d.contact.titre}</h1>

        <div className="mt-6 flex flex-col gap-5 text-foreground/80">
          <p>{d.contact.intro}</p>

          <section>
            <h2 className="text-heading text-foreground">{d.contact.emailTitre}</h2>
            <a
              href={`mailto:${EMAIL_CONTACT}`}
              className="mt-2 inline-block rounded-lg bg-brand-light px-4 py-3 text-sm font-medium text-brand-dark underline"
            >
              {EMAIL_CONTACT}
            </a>
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
