-- =========================================================================
-- Demandes de rendez-vous entre membres d'un match (negociation a deux, DISTINCT
-- de la table `rendezvous` existante qui sert a partager un creneau deja fixe
-- avec un proche hors-app pour la securite — les deux features coexistent).
--
-- Regle d'acces (accord Manno, 2026-09-18) :
--   - Membre simple : le bouton "Demander un rendez-vous" n'apparait qu'apres
--     au moins 3 jours d'echanges dans le match (matches.created_at).
--   - Premium ou sponsor : disponible des le 1er jour.
--
-- Flux :
--   1. attente_acceptation : le demandeur a clique, l'autre doit accepter/refuser.
--   2. attente_creneau     : accepte, le DEMANDEUR doit proposer lieu + date/heure.
--   3. propose              : un creneau est sur la table, l'autre partie peut
--                             l'accepter (-> confirme) ou en reproposer un autre
--                             (le tour de proposition alterne jusqu'a accord).
--   4. confirme / refuse    : etats finaux.
-- =========================================================================

create table public.demandes_rendezvous (
  id uuid primary key default gen_random_uuid(),
  match_id uuid not null references public.matches (id) on delete cascade,
  demandeur_id uuid not null references public.profiles (id) on delete cascade,
  statut text not null default 'attente_acceptation'
    check (statut in ('attente_acceptation', 'attente_creneau', 'propose', 'confirme', 'refuse')),
  lieu text check (lieu is null or char_length(lieu) between 1 and 200),
  moment timestamptz,
  proposant_id uuid references public.profiles (id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.demandes_rendezvous enable row level security;

create policy "Participants du match voient la demande"
  on public.demandes_rendezvous for select
  to authenticated
  using (exists (
    select 1 from public.matches m
    where m.id = demandes_rendezvous.match_id
      and (m.profile_a = auth.uid() or m.profile_b = auth.uid())
  ));

-- Pas de policy insert/update pour authenticated : toute mutation passe par
-- les fonctions security definer ci-dessous, qui verifient elles-memes qui a
-- le droit de faire quoi et a quelle etape (evite qu'un client modifie le
-- statut ou le proposant_id directement).

create or replace function public.eligible_demande_rdv(p_match_id uuid)
returns boolean
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_moi uuid := auth.uid();
  v_cree_le timestamptz;
begin
  select created_at into v_cree_le
  from public.matches
  where id = p_match_id
    and (profile_a = v_moi or profile_b = v_moi);

  if v_cree_le is null then
    return false;
  end if;

  return public.est_premium() or public.est_sponsor() or now() >= v_cree_le + interval '3 days';
end;
$$;

create or replace function public.demander_rdv(p_match_id uuid)
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
    where m.id = p_match_id and (m.profile_a = v_moi or m.profile_b = v_moi)
  ) then
    raise exception 'Match introuvable';
  end if;

  if not public.eligible_demande_rdv(p_match_id) then
    raise exception 'Pas encore eligible pour demander un rendez-vous';
  end if;

  if exists (
    select 1 from public.demandes_rendezvous
    where match_id = p_match_id and statut != 'refuse'
  ) then
    raise exception 'Une demande est deja en cours pour ce match';
  end if;

  insert into public.demandes_rendezvous (match_id, demandeur_id)
  values (p_match_id, v_moi)
  returning id into v_id;

  return v_id;
end;
$$;

create or replace function public.repondre_demande_rdv(p_id uuid, p_accepte boolean)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_moi uuid := auth.uid();
  v_demandeur uuid;
  v_match uuid;
  v_statut text;
begin
  select demandeur_id, match_id, statut into v_demandeur, v_match, v_statut
  from public.demandes_rendezvous where id = p_id;

  if v_demandeur is null then
    raise exception 'Demande introuvable';
  end if;
  if v_demandeur = v_moi then
    raise exception 'Tu ne peux pas repondre a ta propre demande';
  end if;
  if not exists (
    select 1 from public.matches m
    where m.id = v_match and (m.profile_a = v_moi or m.profile_b = v_moi)
  ) then
    raise exception 'Match introuvable';
  end if;
  if v_statut != 'attente_acceptation' then
    raise exception 'Cette demande a deja ete traitee';
  end if;

  update public.demandes_rendezvous
  set statut = case when p_accepte then 'attente_creneau' else 'refuse' end,
      updated_at = now()
  where id = p_id;
end;
$$;

create or replace function public.proposer_creneau_rdv(p_id uuid, p_lieu text, p_moment timestamptz)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_moi uuid := auth.uid();
  v_match uuid;
  v_statut text;
  v_demandeur uuid;
  v_proposant uuid;
begin
  select match_id, statut, demandeur_id, proposant_id
    into v_match, v_statut, v_demandeur, v_proposant
  from public.demandes_rendezvous where id = p_id;

  if v_match is null then
    raise exception 'Demande introuvable';
  end if;
  if not exists (
    select 1 from public.matches m
    where m.id = v_match and (m.profile_a = v_moi or m.profile_b = v_moi)
  ) then
    raise exception 'Match introuvable';
  end if;

  if v_statut = 'attente_creneau' then
    if v_moi != v_demandeur then
      raise exception 'Seul le demandeur propose le premier creneau';
    end if;
  elsif v_statut = 'propose' then
    if v_moi = v_proposant then
      raise exception 'En attente de la reponse de l''autre membre';
    end if;
  else
    raise exception 'Cette demande n''est pas au stade de proposition de creneau';
  end if;

  update public.demandes_rendezvous
  set statut = 'propose', lieu = p_lieu, moment = p_moment, proposant_id = v_moi, updated_at = now()
  where id = p_id;
end;
$$;

create or replace function public.accepter_creneau_rdv(p_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_moi uuid := auth.uid();
  v_match uuid;
  v_statut text;
  v_proposant uuid;
begin
  select match_id, statut, proposant_id into v_match, v_statut, v_proposant
  from public.demandes_rendezvous where id = p_id;

  if v_match is null then
    raise exception 'Demande introuvable';
  end if;
  if not exists (
    select 1 from public.matches m
    where m.id = v_match and (m.profile_a = v_moi or m.profile_b = v_moi)
  ) then
    raise exception 'Match introuvable';
  end if;
  if v_statut != 'propose' then
    raise exception 'Aucun creneau en attente de validation';
  end if;
  if v_moi = v_proposant then
    raise exception 'En attente de la reponse de l''autre membre';
  end if;

  update public.demandes_rendezvous
  set statut = 'confirme', updated_at = now()
  where id = p_id;
end;
$$;

-- Realtime : indispensable pour que les deux membres voient les changements
-- d'etat (acceptation, proposition, confirmation) sans recharger la page.
alter publication supabase_realtime add table public.demandes_rendezvous;
