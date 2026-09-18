"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { getDictionary, type Locale } from "@/lib/i18n/dictionary";

// Nav du bas (design system > "Nav du bas") : état actif en mangue, badge de
// notification en rose. "À proximité" ouvre pour l'instant le même écran que
// "Rencontres" — il n'existe pas encore de vue "profils à proximité" séparée
// du fil de découverte par swipe.
export function BottomNav({
  locale,
  compteLikes = 0,
}: {
  locale: Locale;
  compteLikes?: number;
}) {
  const d = getDictionary(locale);
  const pathname = usePathname();

  const items = [
    { href: "/decouverte", label: d.nav.aProximite, icon: IconProximite },
    { href: "/decouverte", label: d.nav.rencontres, icon: IconRencontres },
    { href: "/aimes-par", label: d.nav.likes, icon: IconLikes, badge: compteLikes },
    { href: "/messages", label: d.nav.discussions, icon: IconDiscussions },
    { href: "/profil", label: d.nav.profil, icon: IconProfil },
  ];

  return (
    <nav
      className="z-10 flex shrink-0 items-stretch justify-around border-t"
      style={{ background: "var(--surface-200)", borderColor: "var(--line)" }}
    >
      {items.map((item, i) => {
        const actif =
          i !== 0 &&
          (pathname === item.href || pathname.startsWith(item.href + "/"));
        const Icon = item.icon;
        return (
          <Link
            key={item.label + i}
            href={item.href}
            className="relative flex flex-1 flex-col items-center gap-1 py-2.5 text-[11px] font-bold"
            style={{ color: actif ? "var(--mangue)" : "var(--ink-muted)" }}
          >
            <span className="relative">
              <Icon />
              {!!item.badge && (
                <span
                  className="absolute -right-1.5 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[9px] font-bold text-white"
                  style={{ background: "var(--rose)" }}
                >
                  {item.badge > 9 ? "9+" : item.badge}
                </span>
              )}
            </span>
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

function IconProximite() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <path
        d="M12 21s-7-5.5-7-11a7 7 0 0 1 14 0c0 5.5-7 11-7 11z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="10" r="2.5" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}

function IconRencontres() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <rect x="4" y="3" width="12" height="16" rx="3" stroke="currentColor" strokeWidth="2" />
      <rect x="8" y="5" width="12" height="16" rx="3" stroke="currentColor" strokeWidth="2" fill="var(--surface-200)" />
    </svg>
  );
}

function IconLikes() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <path
        d="M12 20.5l-1.3-1.2C5.7 14.9 3 12.4 3 9.3 3 6.8 5 4.8 7.5 4.8c1.4 0 2.8.7 3.6 1.7.9-1 2.2-1.7 3.6-1.7C17.2 4.8 19 6.8 19 9.3c0 3.1-2.7 5.6-7.7 10l-1.3 1.2z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconDiscussions() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <path
        d="M4 5h16v11H8l-4 4V5z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconProfil() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="8" r="3.5" stroke="currentColor" strokeWidth="2" />
      <path d="M4.5 20c1.2-3.5 4-5.5 7.5-5.5s6.3 2 7.5 5.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}
