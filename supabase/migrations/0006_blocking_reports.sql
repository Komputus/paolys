create table public.blocks (
  id uuid primary key default gen_random_uuid(),
  blocker_id uuid not null references public.profiles (id) on delete cascade,
  blocked_id uuid not null references public.profiles (id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (blocker_id, blocked_id),
  check (blocker_id != blocked_id)
);

alter table public.blocks enable row level security;

create policy "Un utilisateur voit ses propres blocages"
  on public.blocks for select
  to authenticated
  using (auth.uid() = blocker_id);

create policy "Un utilisateur cree ses propres blocages"
  on public.blocks for insert
  to authenticated
  with check (auth.uid() = blocker_id);

create policy "Un utilisateur supprime ses propres blocages"
  on public.blocks for delete
  to authenticated
  using (auth.uid() = blocker_id);

create table public.reports (
  id uuid primary key default gen_random_uuid(),
  reporter_id uuid not null references public.profiles (id) on delete cascade,
  reported_id uuid not null references public.profiles (id) on delete cascade,
  reason text not null check (char_length(reason) between 1 and 1000),
  status text not null default 'pending' check (status in ('pending', 'reviewed')),
  created_at timestamptz not null default now(),
  check (reporter_id != reported_id)
);

alter table public.reports enable row level security;

create policy "Un utilisateur cree ses propres signalements"
  on public.reports for insert
  to authenticated
  with check (auth.uid() = reporter_id);

create policy "Les admins voient tous les signalements"
  on public.reports for select
  to authenticated
  using (public.est_admin());

create policy "Les admins mettent a jour les signalements"
  on public.reports for update
  to authenticated
  using (public.est_admin());

-- Bloquer quelqu'un supprime aussi tout match existant (et donc les messages,
-- par cascade) entre les deux comptes.
create or replace function public.bloquer_utilisateur(cible uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  moi uuid := auth.uid();
  a uuid;
  b uuid;
begin
  insert into public.blocks (blocker_id, blocked_id)
  values (moi, cible)
  on conflict do nothing;

  if moi < cible then a := moi; b := cible; else a := cible; b := moi; end if;
  delete from public.matches where profile_a = a and profile_b = b;
end;
$$;

-- profils_a_decouvrir : exclut desormais les profils bloques (dans les deux sens)
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
    and not exists (
      select 1 from public.blocks b
      where (b.blocker_id = auth.uid() and b.blocked_id = p.id)
         or (b.blocker_id = p.id and b.blocked_id = auth.uid())
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

-- mes_matchs : exclut desormais les matchs avec un utilisateur bloque
create or replace function public.mes_matchs()
returns table (
  match_id uuid,
  autre_id uuid,
  autre_nom text,
  dernier_message text,
  dernier_message_at timestamptz
)
language sql
security definer
set search_path = public
as $$
  select
    m.id as match_id,
    case when m.profile_a = auth.uid() then m.profile_b else m.profile_a end as autre_id,
    p.display_name as autre_nom,
    lm.content as dernier_message,
    lm.created_at as dernier_message_at
  from public.matches m
  join public.profiles p
    on p.id = case when m.profile_a = auth.uid() then m.profile_b else m.profile_a end
  left join lateral (
    select content, created_at
    from public.messages
    where match_id = m.id
    order by created_at desc
    limit 1
  ) lm on true
  where (m.profile_a = auth.uid() or m.profile_b = auth.uid())
    and not exists (
      select 1 from public.blocks b
      where (b.blocker_id = auth.uid() and b.blocked_id = p.id)
         or (b.blocker_id = p.id and b.blocked_id = auth.uid())
    )
  order by coalesce(lm.created_at, m.created_at) desc;
$$;
