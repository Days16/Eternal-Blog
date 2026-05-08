-- Migración 001: Función atómica add_xp
-- Ejecutar desde el SQL Editor del Dashboard de Supabase
-- (Database → SQL Editor → New query → Paste → Run)
--
-- Elimina la condición de carrera read-modify-write en lib/xp/award.ts
-- y lib/achievements/evaluator.ts usando FOR UPDATE para bloqueo de fila.

create or replace function public.add_xp(p_user_id uuid, p_delta int)
returns table(new_xp int, new_level int, leveled_up boolean)
language plpgsql
security definer
as $$
declare
  v_old_xp    int;
  v_new_xp    int;
  v_old_level int;
  v_new_level int;
begin
  -- Bloqueo de fila para evitar condiciones de carrera concurrentes
  select xp, level
    into v_old_xp, v_old_level
    from public.users
   where id = p_user_id
     for update;

  if not found then
    raise exception 'Usuario no encontrado: %', p_user_id;
  end if;

  v_new_xp := coalesce(v_old_xp, 0) + p_delta;

  -- Umbrales de nivel deben coincidir con LEVEL_THRESHOLDS en lib/xp/events.ts
  v_new_level := case
    when v_new_xp >= 12000 then 5
    when v_new_xp >= 5000  then 4
    when v_new_xp >= 2000  then 3
    when v_new_xp >= 500   then 2
    else 1
  end;

  update public.users
     set xp         = v_new_xp,
         level      = v_new_level,
         updated_at = now()
   where id = p_user_id;

  return query select v_new_xp, v_new_level, (v_new_level > v_old_level);
end;
$$;
