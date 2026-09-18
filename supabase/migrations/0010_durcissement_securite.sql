-- La policy "using (true)" sur profiles exposait TOUTES les colonnes de TOUS
-- les profils (y compris premium_until, is_sponsor, hidden_from_discovery,
-- boosted_until, birth_date exact) a n'importe quel utilisateur connecte via
-- une requete API directe, en contournant les fonctions RPC soigneusement
-- limitees utilisees partout ailleurs dans l'app. Remplacee par : chacun ne
-- voit que sa propre ligne complete, + les admins voient tout (necessaire
-- pour la jointure de la page /admin/signalements). Tout le reste (decouverte,
-- matchs, sponsors...) passe deja par des fonctions "security definer" qui ne
-- dependent pas de cette policy.
drop policy if exists "Profils visibles par les utilisateurs authentifies" on public.profiles;

create policy "Un utilisateur voit son propre profil"
  on public.profiles for select
  to authenticated
  using (auth.uid() = id);

create policy "Les admins voient tous les profils"
  on public.profiles for select
  to authenticated
  using (public.est_admin());

-- Meme raisonnement pour profile_photos (le detail des chemins de stockage
-- n'a pas besoin d'etre lisible par tout le monde en direct).
drop policy if exists "Photos visibles par les utilisateurs authentifies" on public.profile_photos;

create policy "Un utilisateur voit ses propres entrees photo"
  on public.profile_photos for select
  to authenticated
  using (auth.uid() = profile_id);

create policy "Les admins voient toutes les entrees photo"
  on public.profile_photos for select
  to authenticated
  using (public.est_admin());

-- Nom affiche d'un profil, expose seulement pour usage legitime (soi-meme,
-- un match, ou un admin) plutot qu'une lecture large de la table profiles.
create or replace function public.nom_du_profil(cible uuid)
returns text
language sql
security definer
set search_path = public
as $$
  select p.display_name
  from public.profiles p
  where p.id = cible
    and (
      p.id = auth.uid()
      or public.est_admin()
      or exists (
        select 1 from public.matches m
        where (m.profile_a = auth.uid() and m.profile_b = cible)
           or (m.profile_b = auth.uid() and m.profile_a = cible)
      )
    );
$$;

-- Stockage des photos : jusqu'ici, une fois authentifie, n'importe qui pouvait
-- generer lui-meme un lien signe vers la photo d'un sponsor en appelant le
-- client Supabase directement (sans passer par nos pages), ce qui contournait
-- entierement le systeme d'autorisation sponsor. Desormais impose au niveau
-- base de donnees : la photo d'un sponsor necessite un "voir_photo" accorde.
drop policy if exists "Photos de profil visibles aux utilisateurs connectes" on storage.objects;

create policy "Photos de profil visibles selon le statut sponsor"
  on storage.objects for select
  to authenticated
  using (
    bucket_id = 'profile-photos'
    and (
      (storage.foldername(name))[1] = auth.uid()::text
      or public.est_admin()
      or not exists (
        select 1 from public.profiles p
        where p.id::text = (storage.foldername(name))[1] and p.is_sponsor
      )
      or exists (
        select 1 from public.sponsor_grants g
        where g.sponsor_id::text = (storage.foldername(name))[1]
          and g.beneficiaire_id = auth.uid()
          and g.voir_photo
      )
    )
  );
