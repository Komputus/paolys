-- Le bucket "profile-photos" devient prive : les URLs publiques permanentes
-- sont remplacees par des liens signes temporaires (1h), generes a chaque
-- affichage cote serveur. Avant ce changement, n'importe qui disposant d'un
-- lien (meme sans etre connecte a l'app) pouvait voir une photo indefiniment.
update storage.buckets set public = false where id = 'profile-photos';

drop policy if exists "Photos de profil visibles publiquement" on storage.objects;

create policy "Photos de profil visibles aux utilisateurs connectes"
  on storage.objects for select
  to authenticated
  using (bucket_id = 'profile-photos');
