-- Correctif : la table public.payments existe deja mais n'a jamais recu la
-- colonne duration_days prevue par 0007_premium.sql (la migration 0007 a du
-- etre partiellement appliquee/sautee a l'epoque). Ajout idempotent, sans
-- toucher au reste de la table.
alter table public.payments
  add column if not exists duration_days integer not null default 0;
