-- Fonction utilitaire : l'utilisateur courant est-il administrateur ?
-- Le role admin est stocke dans app_metadata (modifiable uniquement via la
-- base de donnees ou la cle service_role, jamais par l'utilisateur lui-meme).
create or replace function public.est_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin', false);
$$;

create policy "Les admins voient toutes les demandes de verification"
  on public.photo_verifications for select
  to authenticated
  using (public.est_admin());

-- Bucket prive pour les selfies de verification (jamais public, contrairement
-- aux photos de profil)
insert into storage.buckets (id, name, public)
values ('verification-selfies', 'verification-selfies', false)
on conflict (id) do nothing;

create policy "Un utilisateur televerse son propre selfie"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'verification-selfies'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "Le proprietaire ou un admin lit le selfie"
  on storage.objects for select
  to authenticated
  using (
    bucket_id = 'verification-selfies'
    and (
      (storage.foldername(name))[1] = auth.uid()::text
      or public.est_admin()
    )
  );

-- File d'attente admin (selfie + nom du profil concerne)
create or replace function public.verifications_en_attente()
returns table (
  id uuid,
  profile_id uuid,
  display_name text,
  selfie_storage_path text,
  created_at timestamptz
)
language sql
security definer
set search_path = public
as $$
  select pv.id, pv.profile_id, p.display_name, pv.selfie_storage_path, pv.created_at
  from public.photo_verifications pv
  join public.profiles p on p.id = pv.profile_id
  where pv.status = 'pending'
    and public.est_admin()
  order by pv.created_at asc;
$$;

-- Decision admin : approuve ou rejette, et met a jour profiles.photo_verified
create or replace function public.traiter_verification(verification_id uuid, decision text)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_profile_id uuid;
begin
  if not public.est_admin() then
    raise exception 'Acces refuse';
  end if;

  if decision not in ('approved', 'rejected') then
    raise exception 'Decision invalide';
  end if;

  update public.photo_verifications
  set status = decision, reviewed_by = auth.uid(), reviewed_at = now()
  where id = verification_id
  returning profile_id into v_profile_id;

  if decision = 'approved' then
    update public.profiles set photo_verified = true where id = v_profile_id;
  end if;
end;
$$;
