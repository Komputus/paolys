import Image from "next/image";
import Link from "next/link";
import { HeroArt } from "@/components/HeroArt";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { Wordmark } from "@/components/brand/Wordmark";
import { Footer } from "@/components/Footer";
import { getLocale } from "@/lib/i18n/locale";
import { getDictionary } from "@/lib/i18n/dictionary";
import { createClient } from "@/lib/supabase/server";

export default async function Home() {
  const locale = await getLocale();
  const d = getDictionary(locale);

  const supabase = await createClient();
  const { data: nbProfilsVerifies } = await supabase.rpc("combien_de_profils_verifies");

  return (
    <div className="page-bg flex flex-1 flex-col">
      <div className="relative flex h-7 box-content items-center justify-end px-6 pt-4">
        <LanguageSwitcher locale={locale} />
      </div>

      {/* Hero — pas de padding-top ici : le logo doit tomber exactement a la
          meme position que sur /connexion et /inscription (meme hauteur de
          ligne d'en-tete juste au-dessus, sans espace supplementaire). */}
      <section className="flex flex-col items-center px-6 pb-8 text-center">
        <HeroArt size="sm" />
        <span className="font-display mt-2 text-sm tracking-[0.3em] text-gold uppercase">
          {d.home.kicker}
        </span>
        <h1 className="mt-3">
          <Wordmark size="lg" />
        </h1>
        <p className="mt-5 max-w-md text-lg leading-relaxed text-foreground/80">
          {d.home.tagline}
        </p>
        <div className="mt-10 flex flex-col gap-3 sm:flex-row">
          <Link
            href="/inscription"
            className="bg-mangue rounded-full px-8 py-3 font-medium text-white shadow-lg shadow-mangue/30 transition-transform hover:scale-105"
          >
            {d.home.creerCompte}
          </Link>
          <Link
            href="/connexion"
            className="rounded-full border border-brand/30 px-8 py-3 font-medium text-brand transition-colors hover:bg-brand-light"
          >
            {d.home.dejaCompte}
          </Link>
        </div>
        <Link href="/premium" className="mt-4 text-sm font-bold text-lagune underline">
          {d.home.decouvrirPremium}
        </Link>
      </section>

      {/* Trombinoscope — 3 photos rondes (seule touche photographique de la
          page, le reste de l'identite reste illustre/abstrait) pour rappeler
          que de vraies personnes se cachent derriere chaque profil. */}
      <section className="flex flex-col items-center gap-3 px-6 pb-8 text-center">
        <div className="flex -space-x-4">
          <Image
            src="/marketing/portrait-femme.jpg"
            alt=""
            width={64}
            height={64}
            className="ring-surface-100 h-16 w-16 rounded-full object-cover ring-4"
          />
          <Image
            src="/marketing/couple-cafe.jpg"
            alt=""
            width={72}
            height={72}
            className="ring-surface-100 z-10 h-[4.5rem] w-[4.5rem] rounded-full object-cover ring-4"
          />
          <Image
            src="/marketing/portrait-homme.jpg"
            alt=""
            width={64}
            height={64}
            className="ring-surface-100 h-16 w-16 rounded-full object-cover ring-4"
          />
        </div>
        <p className="text-caption text-ink-muted">{d.home.photosLegende}</p>
      </section>

      {/* Pourquoi Paolys */}
      <section className="px-6 py-6 sm:px-10">
        <h2 className="font-display text-center text-2xl text-foreground sm:text-3xl">
          {d.home.valeursTitre}
        </h2>
        <div className="mx-auto mt-6 grid max-w-4xl gap-4 sm:grid-cols-3">
          {d.home.valeurs.map((valeur, i) => (
            <div key={valeur.titre} className="card-warm flex flex-col items-center gap-3 p-6 text-center">
              <span
                className="flex h-12 w-12 items-center justify-center rounded-full"
                style={{
                  background:
                    i === 0
                      ? "var(--lagune-tint)"
                      : i === 1
                        ? "var(--rose)"
                        : "var(--azur-tint)",
                }}
              >
                {i === 0 ? (
                  <IconBouclier color="var(--lagune)" />
                ) : i === 1 ? (
                  <IconCoeur color="white" />
                ) : (
                  <IconCadeau color="var(--azur)" />
                )}
              </span>
              <p className="text-heading text-foreground">{valeur.titre}</p>
              <p className="text-body text-ink-muted">{valeur.texte}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Comment ça marche */}
      <section className="px-6 py-6 sm:px-10">
        <h2 className="font-display text-center text-2xl text-foreground sm:text-3xl">
          {d.home.commentCaMarcheTitre}
        </h2>
        <div className="mx-auto mt-6 flex max-w-4xl flex-col gap-6 sm:flex-row">
          {d.home.etapes.map((etape, i) => (
            <div key={etape.titre} className="flex flex-1 flex-col items-center gap-3 text-center">
              <span
                className="font-display flex h-11 w-11 items-center justify-center rounded-full text-lg text-white"
                style={{ background: "var(--mangue)" }}
              >
                {i + 1}
              </span>
              <p className="text-heading text-foreground">{etape.titre}</p>
              <p className="text-body text-ink-muted max-w-xs">{etape.texte}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Confiance */}
      <section className="px-6 py-4 sm:px-10">
        <div
          className="card-warm mx-auto flex max-w-3xl flex-col items-center gap-3 p-6 text-center"
          style={{ border: "1px solid var(--lagune)", background: "var(--lagune-tint)" }}
        >
          <span
            className="flex h-12 w-12 items-center justify-center rounded-full"
            style={{ background: "var(--lagune)" }}
          >
            <IconBouclier color="white" />
          </span>
          <p className="text-heading" style={{ color: "var(--lagune)" }}>
            {d.home.confianceTitre}
          </p>
          <p className="text-body max-w-xl" style={{ color: "var(--ink)" }}>
            {d.home.confianceTexte}
          </p>
        </div>
      </section>

      {/* Preuve sociale — uniquement si le chiffre reel est assez grand pour
          etre convaincant ; en dessous, il serait contre-productif de
          l'afficher. Jamais de nombre invente ici. */}
      {typeof nbProfilsVerifies === "number" && nbProfilsVerifies >= 10 && (
        <section className="flex flex-col items-center gap-1 px-6 py-2 text-center">
          <p className="font-display text-3xl text-brand">{nbProfilsVerifies}+</p>
          <p className="text-body text-ink-muted">{d.home.statProfilsVerifies}</p>
        </section>
      )}

      {/* CTA finale */}
      <section className="flex flex-col items-center gap-6 px-6 py-8 text-center">
        <p className="font-display text-2xl text-foreground sm:text-3xl">
          {d.home.ctaFinaleTitre}
        </p>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Link
            href="/inscription"
            className="bg-mangue rounded-full px-8 py-3 font-medium text-white shadow-lg shadow-mangue/30 transition-transform hover:scale-105"
          >
            {d.home.creerCompte}
          </Link>
          <Link
            href="/connexion"
            className="rounded-full border border-brand/30 px-8 py-3 font-medium text-brand transition-colors hover:bg-brand-light"
          >
            {d.home.dejaCompte}
          </Link>
        </div>
      </section>

      <Footer locale={locale} />
    </div>
  );
}

function IconBouclier({ color }: { color: string }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <path
        d="M12 3l7 3v5c0 5-3 8.5-7 10-4-1.5-7-5-7-10V6l7-3z"
        stroke={color}
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path d="M9 12l2 2 4-4" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IconCoeur({ color }: { color: string }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <path
        d="M12 20.5l-1.3-1.2C5.7 14.9 3 12.4 3 9.3 3 6.8 5 4.8 7.5 4.8c1.4 0 2.8.7 3.6 1.7.9-1 2.2-1.7 3.6-1.7C17.2 4.8 19 6.8 19 9.3c0 3.1-2.7 5.6-7.7 10l-1.3 1.2z"
        stroke={color}
        strokeWidth="2"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconCadeau({ color }: { color: string }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <rect x="4" y="9" width="16" height="11" rx="1.5" stroke={color} strokeWidth="2" />
      <path d="M4 9h16M12 9v11" stroke={color} strokeWidth="2" />
      <path
        d="M12 9c0-2.5-1.5-4.5-3.5-4.5S6 6 8 8c.6.6 2 1 4 1zM12 9c0-2.5 1.5-4.5 3.5-4.5S18 6 16 8c-.6.6-2 1-4 1z"
        stroke={color}
        strokeWidth="2"
        strokeLinejoin="round"
      />
    </svg>
  );
}
