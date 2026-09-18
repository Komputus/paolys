-- Preuve sociale sur la page d'accueil (publique) : un chiffre reel, jamais
-- invente. La table profiles n'est lisible que par les utilisateurs
-- authentifies (RLS "to authenticated"), donc un visiteur anonyme ne peut
-- pas la requeter directement — cette fonction expose uniquement un compte
-- agrege (aucune donnee personnelle), utilisable par n'importe qui.
create or replace function public.combien_de_profils_verifies()
returns integer
language sql
stable
security definer
set search_path = public
as $$
  select count(*)::integer from public.profiles where photo_verified = true;
$$;

grant execute on function public.combien_de_profils_verifies() to anon, authenticated;
