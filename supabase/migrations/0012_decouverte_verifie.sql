-- Expose photo_verified dans profils_a_decouvrir, pour afficher un badge de
-- confiance (lagune) sur la carte de decouverte, comme le reste du design
-- system l'exige pour les elements de confiance/verification.
drop function if exists public.profils_a_decouvrir(integer, integer, integer, boolean);

create function public.profils_a_decouvrir(
  limite integer default 10,
  age_min integer default null,
  age_max integer default null,
  verifies_uniquement boolean default false
)
returns table (
  id uuid,
  display_name text,
  birth_date date,
  bio text,
  city text,
  gender text,
  photo_verified boolean,
  prompts jsonb
)
language sql
security definer
set search_path = public
as $$
  select
    p.id, p.display_name, p.birth_date, p.bio, p.city, p.gender, p.photo_verified,
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
  order by
    case when p.boosted_until is not null and p.boosted_until > now() then 0 else 1 end,
    case when moi.location is not null and p.location is not null
      then ST_Distance(moi.location, p.location)
    end nulls last,
    p.created_at desc
  limit limite;
$$;
