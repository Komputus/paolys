import type { Metadata } from "next";
import { Fredoka, Nunito } from "next/font/google";
import { getLocale } from "@/lib/i18n/locale";
import "./globals.css";

// Design system officiel Paolys (v3, 2026-09-17) : Fredoka (titres, mot-
// symbole) + Nunito (interface) sont les seules polices de la marque.
const fredoka = Fredoka({
  variable: "--font-fredoka",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

const nunito = Nunito({
  variable: "--font-nunito",
  subsets: ["latin"],
  weight: ["500", "700", "800"],
});

export const metadata: Metadata = {
  title: "Paolys",
  description: "Paolys — des rencontres vraies, entre profils réels et vérifiés.",
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const locale = await getLocale();

  return (
    <html
      lang={locale}
      className={`${fredoka.variable} ${nunito.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
