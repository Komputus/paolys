-- =========================================================================
-- 1. Securite rendez-vous : partager les details d'un rendez-vous (lieu,
--    heure, avec qui) via un lien public, a envoyer soi-meme a un proche par
--    WhatsApp/SMS. Le proche n'a pas besoin d'un compte Paolys.
-- =========================================================================
create table public.rendezvous (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles (id) on delete cascade,
  match_id uuid not null references public.matches (id) on delete cascade,
  lieu text not null check (char_length(lieu) between 1 and 200),
  moment timestamptz not null,
  note text check (note is null or char_length(note) <= 500),
  created_at timestamptz not null default now()
);

alter table public.rendezvous enable row level security;

create policy "Un utilisateur gere ses propres rendez-vous"
  on public.rendezvous for all
  to authenticated
  using (auth.uid() = profile_id)
  with check (auth.uid() = profile_id);

-- Pas de policy pour un lecteur anonyme : la page publique de partage passe
-- par la cle secrete (service_role) cote serveur, qui contourne RLS, et ne
-- renvoie que les champs necessaires (jamais l'API brute).
create or replace function public.creer_rendezvous(
  p_match_id uuid,
  p_lieu text,
  p_moment timestamptz,
  p_note text
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_id uuid;
  v_moi uuid := auth.uid();
begin
  if not exists (
    select 1 from public.matches m
    where m.id = p_match_id
      and (m.profile_a = v_moi or m.profile_b = v_moi)
  ) then
    raise exception 'Match introuvable';
  end if;

  insert into public.rendezvous (profile_id, match_id, lieu, moment, note)
  values (v_moi, p_match_id, p_lieu, p_moment, p_note)
  returning id into v_id;

  return v_id;
end;
$$;

-- Lecture publique controlee : renvoie uniquement les champs necessaires a la
-- securite (jamais l'identite complete, la photo ou le contact de personne).
create or replace function public.rendezvous_public(p_id uuid)
returns table (
  lieu text,
  moment timestamptz,
  note text,
  nom_organisateur text,
  nom_rencontre text
)
language sql
security definer
set search_path = public
as $$
  select
    r.lieu,
    r.moment,
    r.note,
    po.display_name,
    case when m.profile_a = r.profile_id then pb.display_name else pa.display_name end
  from public.rendezvous r
  join public.matches m on m.id = r.match_id
  join public.profiles po on po.id = r.profile_id
  join public.profiles pa on pa.id = m.profile_a
  join public.profiles pb on pb.id = m.profile_b
  where r.id = p_id;
$$;

-- =========================================================================
-- 2. Prompts (icebreakers) a la place d'une bio vide et intimidante.
-- =========================================================================
create table public.profile_prompts (
  profile_id uuid not null references public.profiles (id) on delete cascade,
  pos smallint not null check (pos between 0 and 2),
  prompt_key text not null,
  reponse text not null check (char_length(reponse) between 1 and 200),
  primary key (profile_id, pos)
);

alter table public.profile_prompts enable row level security;

create policy "Un utilisateur gere ses propres prompts"
  on public.profile_prompts for all
  to authenticated
  using (auth.uid() = profile_id)
  with check (auth.uid() = profile_id);

-- Pas de policy de lecture large (meme raisonnement que pour "profiles") : la
-- visibilite aux autres passe par profils_a_decouvrir, qui les agrege en JSON.
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
  prompts jsonb
)
language sql
security definer
set search_path = public
as $$
  select
    p.id, p.display_name, p.birth_date, p.bio, p.city, p.gender,
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

-- Mes propres prompts (pour les afficher/editer sur /profil)
create or replace function public.mes_prompts()
returns table (pos smallint, prompt_key text, reponse text)
language sql
security definer
set search_path = public
as $$
  select pos, prompt_key, reponse
  from public.profile_prompts
  where profile_id = auth.uid()
  order by pos;
$$;

-- =========================================================================
-- 3. Parrainage : chaque profil a un code, le filleul et le parrain gagnent
--    3 jours de Paolys+ des que le filleul termine son profil.
-- =========================================================================
alter table public.profiles add column referral_code text unique;

update public.profiles
set referral_code = substr(md5(random()::text || id::text), 1, 8)
where referral_code is null;

alter table public.profiles
  alter column referral_code set default substr(md5(random()::text), 1, 8);

alter table public.profiles alter column referral_code set not null;

create table public.referrals (
  id uuid primary key default gen_random_uuid(),
  referrer_id uuid not null references public.profiles (id) on delete cascade,
  referred_id uuid not null unique references public.profiles (id) on delete cascade,
  created_at timestamptz not null default now(),
  check (referrer_id != referred_id)
);

alter table public.referrals enable row level security;

create policy "Un utilisateur voit les parrainages qu'il a faits"
  on public.referrals for select
  to authenticated
  using (auth.uid() = referrer_id);

-- Recompense les deux cotes une seule fois par filleul (protege contre les
-- doubles appels ou la manipulation du code cote client).
create or replace function public.appliquer_parrainage(code text)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_referrer_id uuid;
  v_moi uuid := auth.uid();
begin
  if code is null or code = '' then
    return;
  end if;

  select id into v_referrer_id from public.profiles where referral_code = code;

  if v_referrer_id is null or v_referrer_id = v_moi then
    return;
  end if;

  if exists (select 1 from public.referrals where referred_id = v_moi) then
    return;
  end if;

  insert into public.referrals (referrer_id, referred_id) values (v_referrer_id, v_moi);

  update public.profiles
  set premium_until = greatest(coalesce(premium_until, now()), now()) + interval '3 days'
  where id = v_moi;

  update public.profiles
  set premium_until = greatest(coalesce(premium_until, now()), now()) + interval '3 days'
  where id = v_referrer_id;
end;
$$;

-- Combien de personnes j'ai parraine (pour l'affichage sur /profil)
create or replace function public.combien_j_ai_parraine()
returns integer
language sql
security definer
set search_path = public
as $$
  select count(*)::integer from public.referrals where referrer_id = auth.uid();
$$;
