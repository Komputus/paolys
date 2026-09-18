import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// Point d'arrivee apres signInWithOAuth (Google) : Supabase redirige ici avec
// un ?code= a echanger contre une session.
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}/profil`);
    }
  }

  return NextResponse.redirect(`${origin}/connexion`);
}
