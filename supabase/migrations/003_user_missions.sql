-- Migración 003: Tabla de progreso de misiones por usuario
-- Ejecutar desde el SQL Editor del Dashboard de Supabase
create table if not exists public.user_missions (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references public.users(id) on delete cascade,
  mission_id    uuid not null references public.missions(id) on delete cascade,
  completed_at  timestamptz not null default now(),
  xp_awarded    int not null default 0,
  unique (user_id, mission_id)
);
