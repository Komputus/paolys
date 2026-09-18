create table public.swipes (
  id uuid primary key default gen_random_uuid(),
  swiper_id uuid not null references public.profiles (id) on delete cascade,
  swiped_id uuid not null references public.profiles (id) on delete cascade,
  direction text not null check (direction in ('like', 'pass')),
  created_at timestamptz not null default now(),
  unique (swiper_id, swiped_id)
);

alter table public.swipes enable row level security;

create policy "Un utilisateur voit ses propres swipes"
  on public.swipes for select
  to authenticated
  using (auth.uid() = swiper_id);

create policy "Un utilisateur cree uniquement ses propres swipes"
  on public.swipes for insert
  to authenticated
  with check (auth.uid() = swiper_id);

create table public.matches (
  id uuid primary key default gen_random_uuid(),
  profile_a uuid not null references public.profiles (id) on delete cascade,
  profile_b uuid not null references public.profiles (id) on delete cascade,
  created_at timestamptz not null default now(),
  constraint ordre_stable check (profile_a < profile_b),
  unique (profile_a, profile_b)
);

alter table public.matches enable row level security;

create policy "Un utilisateur voit ses propres matchs"
  on public.matches for select
  to authenticated
  using (auth.uid() = profile_a or auth.uid() = profile_b);

-- Enregistre un swipe et cree un match si reciproque (like des deux cotes)
create or replace function public.enregistrer_swipe(cible uuid, sens text)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  moi uuid := auth.uid();
  reciproque boolean;
  a uuid;
  b uuid;
begin
  insert into public.swipes (swiper_id, swiped_id, direction)
  values (moi, cible, sens)
  on conflict (swiper_id, swiped_id) do update set direction = excluded.direction;

  if sens != 'like' then
    return false;
  end if;

  select exists (
    select 1 from public.swipes
    where swiper_id = cible and swiped_id = moi and direction = 'like'
  ) into reciproque;

  if reciproque then
    if moi < cible then a := moi; b := cible; else a := cible; b := moi; end if;
    insert into public.matches (profile_a, profile_b)
    values (a, b)
    on conflict do nothing;
  end if;

  return reciproque;
end;
$$;

-- Renvoie des profils a decouvrir : pas encore swipes, compatibles avec les
-- preferences de genre, tries par distance quand la position est connue
create or replace function public.profils_a_decouvrir(limite integer default 10)
returns table (
  id uuid,
  display_name text,
  birth_date date,
  bio text,
  city text,
  gender text
)
language sql
security definer
set search_path = public
as $$
  select p.id, p.display_name, p.birth_date, p.bio, p.city, p.gender
  from public.profiles p
  join public.profiles moi on moi.id = auth.uid()
  where p.id != auth.uid()
    and not exists (
      select 1 from public.swipes s
      where s.swiper_id = auth.uid() and s.swiped_id = p.id
    )
    and (moi.looking_for = 'tous' or p.gender = moi.looking_for)
    and (p.looking_for = 'tous' or moi.gender = p.looking_for)
  order by
    case when moi.location is not null and p.location is not null
      then ST_Distance(moi.location, p.location)
    end nulls last,
    p.created_at desc
  limit limite;
$$;
