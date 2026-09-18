-- =========================================================================
-- Simplification de la demande de rendez-vous (accord Manno, 2026-09-18) :
-- plus de negociation de lieu/date/heure dans l'app — juste un accord mutuel
-- (bouton -> Accepter/Decliner). Les details du rendez-vous se discutent
-- ensuite dans le chat normal, ou via le bouton de partage securise existant
-- ("rendezvous" / RendezVousPlanner) qui reste inchange.
-- =========================================================================

drop function if exists public.proposer_creneau_rdv(uuid, text, timestamptz);
drop function if exists public.accepter_creneau_rdv(uuid);

alter table public.demandes_rendezvous drop column if exists lieu;
alter table public.demandes_rendezvous drop column if exists moment;
alter table public.demandes_rendezvous drop column if exists proposant_id;

alter table public.demandes_rendezvous drop constraint if exists demandes_rendezvous_statut_check;
alter table public.demandes_rendezvous
  add constraint demandes_rendezvous_statut_check
  check (statut in ('attente_acceptation', 'confirme', 'refuse'));

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
  set statut = case when p_accepte then 'confirme' else 'refuse' end,
      updated_at = now()
  where id = p_id;
end;
$$;
