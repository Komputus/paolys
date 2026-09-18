-- Lecture du profil d'un correspondant matche, pour l'ecran "voir le profil"
-- accessible depuis une conversation (photo cliquable). Les prompts sont
-- verrouilles par RLS a leur propre proprietaire (0011_ameliorations.sql) —
-- il faut donc une fonction security definer, comme profils_a_decouvrir,
-- mais restreinte a un match existant (pas une decouverte libre).
create or replace function public.profil_pour_affichage(p_id uuid)
returns table (
  display_name text,
  birth_date date,
  bio text,
  city text,
  photo_verified boolean,
  prompts jsonb
)
language plpgsql
security definer
set search_path = public
as $$
begin
  if not exists (
    select 1 from public.matches m
    where (m.profile_a = auth.uid() and m.profile_b = p_id)
       or (m.profile_a = p_id and m.profile_b = auth.uid())
  ) then
    return;
  end if;

  return query
    select
      p.display_name, p.birth_date, p.bio, p.city, p.photo_verified,
      coalesce(
        (select jsonb_agg(
                  jsonb_build_object('prompt_key', pp.prompt_key, 'reponse', pp.reponse)
                  order by pp.pos
                )
         from public.profile_prompts pp
         where pp.profile_id = p.id),
        '[]'::jsonb
      ) as prompts
    from public.profiles p
    where p.id = p_id;
end;
$$;
