alter table public.profiles
  add column premium_until timestamptz,
  add column boosted_until timestamptz,
  add column hidden_from_discovery boolean not null default false;

create table public.payments (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles (id) on delete cascade,
  amount_fcfa integer not null,
  duration_days integer not null,
  provider text not null default 'cinetpay',
  provider_transaction_id text not null unique,
  status text not null default 'pending' check (status in ('pending', 'success', 'failed')),
  created_at timestamptz not null default now()
);

alter table public.payments enable row level security;

create policy "Un utilisateur voit ses propres paiements"
  on public.payments for select
  to authenticated
  using (auth.uid() = profile_id);

create policy "Un utilisateur cree ses propres paiements en attente"
  on public.payments for insert
  to authenticated
  with check (auth.uid() = profile_id and status = 'pending');

-- Aucune policy update pour les utilisateurs : seul le webhook CinetPay (via
-- la cle secrete/service_role, qui contourne RLS) fait passer un paiement a
-- 'success' ou 'failed'.

-- L'utilisateur courant a-t-il un abonnement Paolys+ actif ?
create or replace function public.est_premium()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(
    (select premium_until > now() from public.profiles where id = auth.uid()),
    false
  );
$$;

-- profils_a_decouvrir : filtres avances (age, verifie uniquement) reserves aux
-- membres Paolys+ — ignores silencieusement sinon. Exclut les profils en mode
-- discret, priorise les profils boostes.
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

-- Combien de personnes m'ont like sans reponse de ma part (teaser, visible
-- de tous — c'est la LISTE qui est reservee Paolys+, pas le compteur)
create or replace function public.combien_m_ont_aime()
returns integer
language sql
security definer
set search_path = public
as $$
  select count(*)::integer
  from public.swipes s
  where s.swiped_id = auth.uid()
    and s.direction = 'like'
    and not exists (
      select 1 from public.swipes moi
      where moi.swiper_id = auth.uid() and moi.swiped_id = s.swiper_id
    );
$$;

-- Liste complete des profils qui m'ont like — reserve Paolys+
create or replace function public.qui_m_a_aime()
returns table (
  id uuid,
  display_name text,
  birth_date date,
  bio text,
  city text
)
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.est_premium() then
    return;
  end if;

  return query
    select p.id, p.display_name, p.birth_date, p.bio, p.city
    from public.swipes s
    join public.profiles p on p.id = s.swiper_id
    where s.swiped_id = auth.uid()
      and s.direction = 'like'
      and not exists (
        select 1 from public.swipes moi
        where moi.swiper_id = auth.uid() and moi.swiped_id = s.swiper_id
      )
    order by s.created_at desc;
end;
$$;

-- Annule mon dernier swipe (rattraper un "passer" accidentel) — reserve Paolys+
create or replace function public.annuler_dernier_swipe()
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_id uuid;
  v_swiped_id uuid;
begin
  if not public.est_premium() then
    raise exception 'Fonctionnalite reservee a Paolys+';
  end if;

  select id, swiped_id into v_id, v_swiped_id
  from public.swipes
  where swiper_id = auth.uid()
  order by created_at desc
  limit 1;

  if v_id is null then
    return null;
  end if;

  delete from public.swipes where id = v_id;
  return v_swiped_id;
end;
$$;

-- Active un boost de visibilite de 24h — reserve Paolys+
create or replace function public.activer_boost()
returns timestamptz
language plpgsql
security definer
set search_path = public
as $$
declare
  v_boosted_until timestamptz;
begin
  if not public.est_premium() then
    raise exception 'Fonctionnalite reservee a Paolys+';
  end if;

  update public.profiles
  set boosted_until = now() + interval '24 hours'
  where id = auth.uid()
  returning boosted_until into v_boosted_until;

  return v_boosted_until;
end;
$$;

-- Active/desactive le mode discret — reserve Paolys+
create or replace function public.definir_mode_discret(actif boolean)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if actif and not public.est_premium() then
    raise exception 'Fonctionnalite reservee a Paolys+';
  end if;

  update public.profiles set hidden_from_discovery = actif where id = auth.uid();
end;
$$;
