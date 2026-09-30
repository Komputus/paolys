-- Ajoute situation matrimoniale et nombre d'enfants, au choix (optionnels —
-- beaucoup ne veulent pas repondre a ce genre de question a l'inscription,
-- donc jamais obligatoires), utilisables comme filtres Paolys+ en decouverte
-- au meme titre que l'age et la verification.
alter table public.profiles
  add column if not exists situation_matrimoniale text,
  add column if not exists nombre_enfants text;

drop function if exists public.profils_a_decouvrir(integer, integer, integer, boolean);

create function public.profils_a_decouvrir(
  limite integer default 10,
  age_min integer default null,
  age_max integer default null,
  verifies_uniquement boolean default false,
  situation_matrimoniale_filtre text default null,
  nombre_enfants_filtre text default null
)
returns table (
  id uuid,
  display_name text,
  birth_date date,
  bio text,
  city text,
  gender text,
  photo_verified boolean,
  situation_matrimoniale text,
  nombre_enfants text,
  prompts jsonb
)
language sql
security definer
set search_path = public
as $$
  select
    p.id, p.display_name, p.birth_date, p.bio, p.city, p.gender, p.photo_verified,
    p.situation_matrimoniale, p.nombre_enfants,
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
  join public.profiles moi on moi.id = auth.uid()
  where p.id != auth.uid()
    and not p.hidden_from_discovery
    and not p.is_sponsor
    and not exists (
      select 1 from public.swipes s
      where s.swiper_id = auth.uid() and s.swiped_id = p.id
    )
    and not exists (
      select 1 from public.blocks b
      where (b.blocker_id = auth.uid() and b.blocked_id = p.id)
         or (b.blocker_id = p.id and b.blocked_id = auth.uid())
    )
    and (moi.looking_for = 'tous' or p.gender = moi.looking_for)
    and (p.looking_for = 'tous' or moi.gender = p.looking_for)
    and (age_min is null or not public.est_premium()
         or date_part('year', age(p.birth_date)) >= age_min)
    and (age_max is null or not public.est_premium()
         or date_part('year', age(p.birth_date)) <= age_max)
    and (not verifies_uniquement or not public.est_premium() or p.photo_verified)
    and (situation_matrimoniale_filtre is null or not public.est_premium()
         or p.situation_matrimoniale = situation_matrimoniale_filtre)
    and (nombre_enfants_filtre is null or not public.est_premium()
         or p.nombre_enfants = nombre_enfants_filtre)
  order by
    case when p.boosted_until is not null and p.boosted_until > now() then 0 else 1 end,
    case when moi.location is not null and p.location is not null
      then ST_Distance(moi.location, p.location)
    end nulls last,
    p.created_at desc
  limit limite;
$$;

create or replace function public.profil_pour_affichage(p_id uuid)
returns table (
  display_name text,
  birth_date date,
  bio text,
  city text,
  photo_verified boolean,
  situation_matrimoniale text,
  nombre_enfants text,
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
      p.situation_matrimoniale, p.nombre_enfants,
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
