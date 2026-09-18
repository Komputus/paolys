-- Le boost passe de "24h, reactivable sans limite" a "1 boost gratuit par
-- jour, 15 minutes, non cumulable" (decision Manno du 2026-09-18, pour
-- eviter la saturation de l'effet si plusieurs utilisateurs boostent en
-- meme temps et compenser la frequence quotidienne). Cote d'Ivoire est en
-- UTC+0 toute l'annee (pas d'heure d'ete) : les journees calendaires en UTC
-- correspondent exactement aux journees locales, donc date_trunc('day', ...)
-- en UTC suffit sans gestion de fuseau horaire dediee.
alter table public.profiles
  add column if not exists boost_last_used_at timestamptz;

create or replace function public.activer_boost()
returns timestamptz
language plpgsql
security definer
set search_path = public
as $$
declare
  v_boosted_until timestamptz;
  v_last_used timestamptz;
begin
  if not public.est_premium() then
    raise exception 'Fonctionnalite reservee a Paolys+';
  end if;

  select boost_last_used_at into v_last_used
  from public.profiles
  where id = auth.uid();

  if v_last_used is not null and date_trunc('day', v_last_used) = date_trunc('day', now()) then
    raise exception 'Boost deja utilise aujourd''hui';
  end if;

  update public.profiles
  set boosted_until = now() + interval '15 minutes',
      boost_last_used_at = now()
  where id = auth.uid()
  returning boosted_until into v_boosted_until;

  return v_boosted_until;
end;
$$;
