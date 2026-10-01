-- Suivi des vues de profil (n'existait pas) + horodatage du dernier resume
-- envoye, pour la fonctionnalite "resume quotidien par email" (vues, likes,
-- messages). Une vue = ton profil apparait dans la decouverte de quelqu'un,
-- comptee une seule fois par personne (pas a chaque reaffichage).
create table public.profile_views (
  id uuid primary key default gen_random_uuid(),
  viewer_id uuid not null references public.profiles (id) on delete cascade,
  viewed_id uuid not null references public.profiles (id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (viewer_id, viewed_id)
);

create index profile_views_viewed_id_idx on public.profile_views (viewed_id, created_at);

alter table public.profile_views enable row level security;

-- On voit qui nous a vu, jamais l'inverse (pas de liste "j'ai vu ces profils"
-- cote visiteur — non demande, et ca romprait l'effet de decouverte).
create policy "Un profil voit qui l'a vu"
  on public.profile_views for select
  to authenticated
  using (auth.uid() = viewed_id);

-- Jamais d'insertion directe par le client : uniquement via cette fonction,
-- pour empecher un utilisateur de fabriquer de fausses vues sur n'importe
-- quel profil.
create or replace function public.enregistrer_vue(p_viewed_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if p_viewed_id = auth.uid() then
    return;
  end if;

  insert into public.profile_views (viewer_id, viewed_id)
  values (auth.uid(), p_viewed_id)
  on conflict (viewer_id, viewed_id) do nothing;
end;
$$;

grant execute on function public.enregistrer_vue(uuid) to authenticated;

alter table public.profiles
  add column if not exists last_digest_sent_at timestamptz;
