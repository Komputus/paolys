create table public.messages (
  id uuid primary key default gen_random_uuid(),
  match_id uuid not null references public.matches (id) on delete cascade,
  sender_id uuid not null references public.profiles (id) on delete cascade,
  content text not null check (char_length(content) between 1 and 2000),
  created_at timestamptz not null default now()
);

create index messages_match_id_idx on public.messages (match_id, created_at);

alter table public.messages enable row level security;

create policy "Un participant du match voit les messages"
  on public.messages for select
  to authenticated
  using (
    exists (
      select 1 from public.matches m
      where m.id = match_id
        and (m.profile_a = auth.uid() or m.profile_b = auth.uid())
    )
  );

create policy "Un participant du match envoie des messages"
  on public.messages for insert
  to authenticated
  with check (
    sender_id = auth.uid()
    and exists (
      select 1 from public.matches m
      where m.id = match_id
        and (m.profile_a = auth.uid() or m.profile_b = auth.uid())
    )
  );

alter publication supabase_realtime add table public.messages;

-- Renvoie la liste des matchs de l'utilisateur avec le dernier message
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
  where m.profile_a = auth.uid() or m.profile_b = auth.uid()
  order by coalesce(lm.created_at, m.created_at) desc;
$$;

-- enregistrer_swipe renvoie maintenant l'id du match cree (ou null si pas de match)
drop function if exists public.enregistrer_swipe(uuid, text);

create function public.enregistrer_swipe(cible uuid, sens text)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  moi uuid := auth.uid();
  reciproque boolean;
  a uuid;
  b uuid;
  id_match uuid;
begin
  insert into public.swipes (swiper_id, swiped_id, direction)
  values (moi, cible, sens)
  on conflict (swiper_id, swiped_id) do update set direction = excluded.direction;

  if sens != 'like' then
    return null;
  end if;

  select exists (
    select 1 from public.swipes
    where swiper_id = cible and swiped_id = moi and direction = 'like'
  ) into reciproque;

  if not reciproque then
    return null;
  end if;

  if moi < cible then a := moi; b := cible; else a := cible; b := moi; end if;

  insert into public.matches (profile_a, profile_b)
  values (a, b)
  on conflict (profile_a, profile_b) do nothing;

  select id into id_match from public.matches where profile_a = a and profile_b = b;

  return id_match;
end;
$$;
