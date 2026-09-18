alter table public.profiles add column is_sponsor boolean not null default false;

-- L'utilisateur courant est-il sponsor ?
create or replace function public.est_sponsor()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce((auth.jwt() -> 'app_metadata' ->> 'role') = 'sponsor', false);
$$;

-- Autorisations de visibilite accordees par un sponsor a des beneficiaires choisis
create table public.sponsor_grants (
  id uuid primary key default gen_random_uuid(),
  sponsor_id uuid not null references public.profiles (id) on delete cascade,
  beneficiaire_id uuid not null references public.profiles (id) on delete cascade,
  voir_profil boolean not null default false,
  voir_photo boolean not null default false,
  voir_contact boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (sponsor_id, beneficiaire_id),
  check (sponsor_id != beneficiaire_id)
);

alter table public.sponsor_grants enable row level security;

create policy "Un sponsor gere ses propres autorisations"
  on public.sponsor_grants for all
  to authenticated
  using (auth.uid() = sponsor_id and public.est_sponsor())
  with check (auth.uid() = sponsor_id and public.est_sponsor());

create policy "Un beneficiaire voit les autorisations qui le concernent"
  on public.sponsor_grants for select
  to authenticated
  using (auth.uid() = beneficiaire_id);

-- Contact (telephone/WhatsApp) : table separee des profils, protection RLS
-- reelle (pas juste un masquage cote interface) — seul le proprietaire et les
-- beneficiaires explicitement autorises (voir_contact) peuvent le lire.
create table public.profile_contacts (
  profile_id uuid primary key references public.profiles (id) on delete cascade,
  phone text,
  updated_at timestamptz not null default now()
);

alter table public.profile_contacts enable row level security;

create policy "Un utilisateur gere son propre contact"
  on public.profile_contacts for all
  to authenticated
  using (auth.uid() = profile_id)
  with check (auth.uid() = profile_id);

create policy "Un beneficiaire autorise voit le contact du sponsor"
  on public.profile_contacts for select
  to authenticated
  using (
    exists (
      select 1 from public.sponsor_grants g
      where g.sponsor_id = profile_contacts.profile_id
        and g.beneficiaire_id = auth.uid()
        and g.voir_contact
    )
  );

-- profils_a_decouvrir : les sponsors n'apparaissent jamais dans le swipe
-- normal (ils ne sont decouvrables que via une autorisation explicite)
create or replace function public.profils_a_decouvrir(
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

-- Parcours illimite pour un sponsor : garde le filtre de preference de genre,
-- mais pas l'exclusion "deja swipe" (voir tous les profils, en boucle)
create or replace function public.profils_pour_sponsor(limite integer default 30)
returns table (
  id uuid,
  display_name text,
  birth_date date,
  bio text,
  city text,
  gender text
)
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.est_sponsor() then
    raise exception 'Reserve aux sponsors';
  end if;

  return query
    select p.id, p.display_name, p.birth_date, p.bio, p.city, p.gender
    from public.profiles p
    join public.profiles moi on moi.id = auth.uid()
    where p.id != auth.uid()
      and not exists (
        select 1 from public.blocks b
        where (b.blocker_id = auth.uid() and b.blocked_id = p.id)
           or (b.blocker_id = p.id and b.blocked_id = auth.uid())
      )
      and (moi.looking_for = 'tous' or p.gender = moi.looking_for)
      and (p.looking_for = 'tous' or moi.gender = p.looking_for)
    order by p.created_at desc
    limit limite;
end;
$$;

-- Cree/met a jour une autorisation de visibilite (idempotent)
create or replace function public.definir_autorisation_sponsor(
  cible uuid,
  p_voir_profil boolean,
  p_voir_photo boolean,
  p_voir_contact boolean
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.est_sponsor() then
    raise exception 'Reserve aux sponsors';
  end if;

  insert into public.sponsor_grants
    (sponsor_id, beneficiaire_id, voir_profil, voir_photo, voir_contact)
  values (auth.uid(), cible, p_voir_profil, p_voir_photo, p_voir_contact)
  on conflict (sponsor_id, beneficiaire_id)
  do update set
    voir_profil = excluded.voir_profil,
    voir_photo = excluded.voir_photo,
    voir_contact = excluded.voir_contact,
    updated_at = now();
end;
$$;

-- Liste des autorisations donnees par le sponsor courant
create or replace function public.mes_autorisations_sponsor()
returns table (
  beneficiaire_id uuid,
  display_name text,
  voir_profil boolean,
  voir_photo boolean,
  voir_contact boolean
)
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.est_sponsor() then
    return;
  end if;

  return query
    select g.beneficiaire_id, p.display_name, g.voir_profil, g.voir_photo, g.voir_contact
    from public.sponsor_grants g
    join public.profiles p on p.id = g.beneficiaire_id
    where g.sponsor_id = auth.uid()
    order by g.updated_at desc;
end;
$$;

-- Cote beneficiaire : profils sponsors qui m'ont accorde au moins voir_profil
create or replace function public.profils_sponsors_pour_moi()
returns table (
  sponsor_id uuid,
  display_name text,
  bio text,
  city text,
  voir_photo boolean,
  voir_contact boolean
)
language sql
security definer
set search_path = public
as $$
  select p.id, p.display_name, p.bio, p.city, g.voir_photo, g.voir_contact
  from public.sponsor_grants g
  join public.profiles p on p.id = g.sponsor_id
  where g.beneficiaire_id = auth.uid() and g.voir_profil
  order by g.updated_at desc;
$$;
