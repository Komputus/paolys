import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// Point d'arrivee apres signInWithOAuth (Google) : Supabase redirige ici avec
// un ?code= a echanger contre une session — ou avec ?error=... si Google/
// Supabase a refuse avant meme d'arriver ici (ex. consentement annule,
// provider mal configure). On fait toujours remonter la raison exacte vers
// /connexion plutot que de rediriger silencieusement : un echec muet est
// indiagnosticable pour l'utilisateur comme pour nous.
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const erreurEntrante = searchParams.get("error_description") ?? searchParams.get("error");

  if (erreurEntrante) {
    return NextResponse.redirect(
      `${origin}/connexion?erreur=${encodeURIComponent(erreurEntrante)}`,
    );
  }

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}/profil`);
    }
    return NextResponse.redirect(
      `${origin}/connexion?erreur=${encodeURIComponent(error.message)}`,
    );
  }

  return NextResponse.redirect(
    `${origin}/connexion?erreur=${encodeURIComponent("Connexion Google incomplete (code manquant).")}`,
  );
}
