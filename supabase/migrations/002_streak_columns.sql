-- Migración 002: Columnas para racha diaria
-- Ejecutar desde el SQL Editor del Dashboard de Supabase
alter table public.users
  add column if not exists streak int not null default 0,
  add column if not exists last_activity_date date;
