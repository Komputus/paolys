insert into storage.buckets (id, name, public)
values ('profile-photos', 'profile-photos', true)
on conflict (id) do nothing;

create policy "Photos de profil visibles publiquement"
  on storage.objects for select
  using (bucket_id = 'profile-photos');

create policy "Un utilisateur televerse dans son propre dossier"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'profile-photos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "Un utilisateur modifie ses propres photos"
  on storage.objects for update
  to authenticated
  using (
    bucket_id = 'profile-photos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "Un utilisateur supprime ses propres photos"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'profile-photos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
