-- Extension geospatiale pour la decouverte de profils par proximite
create extension if not exists postgis;

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text not null,
  birth_date date not null,
  bio text,
  gender text not null check (gender in ('homme', 'femme', 'autre')),
  looking_for text not null check (looking_for in ('homme', 'femme', 'tous')),
  location geography(point, 4326),
  city text,
  country text not null default 'CI',
  photo_verified boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index profiles_location_idx on public.profiles using gist (location);

alter table public.profiles enable row level security;

create policy "Profils visibles par les utilisateurs authentifies"
  on public.profiles for select
  to authenticated
  using (true);

create policy "Un utilisateur cree uniquement son propre profil"
  on public.profiles for insert
  to authenticated
  with check (auth.uid() = id);

create policy "Un utilisateur modifie uniquement son propre profil"
  on public.profiles for update
  to authenticated
  using (auth.uid() = id);

-- Photos de profil (fichiers reels dans Supabase Storage, bucket "profile-photos")
create table public.profile_photos (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles (id) on delete cascade,
  storage_path text not null,
  position smallint not null default 0,
  created_at timestamptz not null default now()
);

alter table public.profile_photos enable row level security;

create policy "Photos visibles par les utilisateurs authentifies"
  on public.profile_photos for select
  to authenticated
  using (true);

create policy "Un utilisateur gere uniquement ses propres photos"
  on public.profile_photos for all
  to authenticated
  using (auth.uid() = profile_id)
  with check (auth.uid() = profile_id);

-- File de moderation pour la verification photo/selfie (MVP v1 = manuelle)
create table public.photo_verifications (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles (id) on delete cascade,
  selfie_storage_path text not null,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  reviewed_by uuid references auth.users (id),
  reviewed_at timestamptz,
  created_at timestamptz not null default now()
);

alter table public.photo_verifications enable row level security;

create policy "Un utilisateur voit uniquement ses propres demandes de verification"
  on public.photo_verifications for select
  to authenticated
  using (auth.uid() = profile_id);

create policy "Un utilisateur cree uniquement sa propre demande de verification"
  on public.photo_verifications for insert
  to authenticated
  with check (auth.uid() = profile_id);
