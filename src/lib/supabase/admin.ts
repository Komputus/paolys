import { createClient as createSupabaseClient } from "@supabase/supabase-js";

// Client avec la cle secrete (bypass RLS) — reserve aux traitements serveur
// sans session utilisateur, comme le webhook de paiement CinetPay. Ne JAMAIS
// exposer cette cle ou ce client au navigateur.
export function createAdminClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );
}
