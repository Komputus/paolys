import { getLocale } from "@/lib/i18n/locale";
import { getDictionary } from "@/lib/i18n/dictionary";
import { BoutonAccueil } from "@/components/BoutonAccueil";
import { EnTeteLogo } from "@/components/EnTeteLogo";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";

export default async function VerifiezVosEmailsPage() {
  const locale = await getLocale();
  const d = getDictionary(locale);

  return (
    <div className="page-bg flex flex-1 flex-col overflow-y-auto text-center">
      <div className="relative flex h-7 box-content shrink-0 items-center justify-end gap-2 px-6 pt-4">
        <EnTeteLogo />
        <BoutonAccueil />
        <LanguageSwitcher locale={locale} />
      </div>
      <div className="flex flex-col items-center px-6 pb-12">
      <div className="mt-4 max-w-sm">
        <h1 className="text-2xl font-semibold text-brand">{d.verifiezEmails.titre}</h1>
        <p className="mt-4 text-foreground/70">{d.verifiezEmails.texte}</p>
      </div>
      </div>
    </div>
  );
}
