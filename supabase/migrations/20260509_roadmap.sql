-- Tabla para el roadmap público del proyecto
create table if not exists public.roadmap_items (
  id          uuid primary key default gen_random_uuid(),
  phase       text not null check (phase in ('done', 'in_progress', 'next', 'future')),
  title       text not null,
  description text,
  version_tag text,          -- 'v0.4', 'v0.5', etc. — opcional
  sort_order  integer not null default 0,
  public      boolean not null default true,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- Índices
create index if not exists roadmap_items_phase_sort on public.roadmap_items (phase, sort_order);

-- RLS
alter table public.roadmap_items enable row level security;

-- Lectura pública solo para ítems marcados como public
create policy "roadmap_items_public_read"
  on public.roadmap_items for select
  using (public = true);

-- Solo service role puede escribir (las server actions usan el service key)
create policy "roadmap_items_service_write"
  on public.roadmap_items for all
  using (auth.role() = 'service_role');

-- Seed inicial: fases del roadmap basadas en el estado actual del proyecto
insert into public.roadmap_items (phase, title, description, version_tag, sort_order) values
  ('done', 'Diseño completo dark academia', 'Tokens de diseño, tipografía Cormorant + Fraunces + Inter, paleta añil-pizarra y pergamino dorado.', 'v0.1', 10),
  ('done', 'Feed de Crónicas con paginación', 'Página principal con entradas cronológicas, tarjetas, tags y paginación.', 'v0.1', 20),
  ('done', 'Codex / Wiki con categorías', 'Índice y artículos del bestiario y enciclopedia del mundo.', 'v0.2', 30),
  ('done', 'Sistema de autenticación', 'Login, registro y sesiones con NextAuth. Roles: Visitante, Lector, Escriba, Moderador, Admin.', 'v0.2', 40),
  ('done', 'Comentarios anidados', 'Árbol de comentarios con moderación, lacrado y eliminación lógica.', 'v0.2', 50),
  ('done', 'Reacciones con emojis', 'Sistema de reacciones por entrada con contadores en tiempo real.', 'v0.3', 60),
  ('done', 'Perfil público con nivel y logros', 'Página de perfil con stats de lectura, nivel rúnico y cromos de logros.', 'v0.3', 70),
  ('done', 'Panel de administración completo', 'CRUD de entradas, Codex, usuarios, comentarios, roles y textos del sitio.', 'v0.4', 80),
  ('done', 'Sistema de XP y niveles', 'Aprendiz → Iniciado → Adepto → Druida → Archimago. XP por comentar, reaccionar y publicar.', 'v0.3', 90),
  ('done', 'Misiones y logros desbloqueables', 'Misiones con fecha y criterios, logros automáticos como cromos rúnicos.', 'v0.4', 100),
  ('done', 'Búsqueda global', 'Búsqueda de entradas y artículos Codex con Orama.', 'v0.4', 110),
  ('done', 'RSS feed y sitemap', 'Feed RSS de crónicas y sitemap XML para buscadores.', 'v0.4', 120),
  ('done', 'Horizonte — roadmap público', 'Página pública con el mapa del camino recorrido y las tierras por venir, gestionable desde el panel de admin.', 'v0.4', 130),
  ('in_progress', 'Recuperación de contraseña', 'Flujo completo: formulario, correo via Resend y restablecimiento seguro.', 'v0.5', 10),
  ('in_progress', 'Edición de perfil', 'Avatar, nombre, bio y preferencias de notificación editables por el usuario.', 'v0.5', 20),
  ('in_progress', 'Carga de imágenes', 'Subida de imágenes para portadas de entradas y avatares de usuario vía Supabase Storage.', 'v0.5', 30),
  ('in_progress', 'Racha diaria activa', 'Detección automática de racha de escritura/lectura con recompensa de XP diaria.', 'v0.5', 40),
  ('in_progress', 'Verificación de correo', 'Email de confirmación al registrarse y opción de reenvío desde el perfil.', 'v0.5', 50),
  ('next', 'Notificaciones en tiempo real', 'Campana de notificaciones con actualizaciones instantáneas vía Supabase Realtime.', 'v0.6', 10),
  ('next', 'Easter eggs distribuidos', 'Secuencias ocultas, hover en runas y gestos especiales que otorgan XP secreto.', 'v0.6', 20),
  ('next', 'Modo lector sin distracciones', 'Oculta la navegación y amplía la tipografía para una lectura más inmersiva.', 'v0.6', 30),
  ('next', 'App instalable (PWA)', 'Manifiesto y service worker para instalar ETERNIDAD como app en móvil y escritorio.', 'v0.6', 40),
  ('next', 'Foro de la comunidad', 'Espacio de discusión por categorías: teorías, fan-art, preguntas al autor y más. Con XP por participar.', 'v0.7', 50),
  ('next', 'Moderación y logros del foro', 'Herramientas de admin para fijar y bloquear hilos, logros por participación y misiones de comunidad.', 'v0.7', 60),
  ('future', 'Mapa interactivo del mundo', 'Canvas pan/zoom con puntos de interés enlazados al Codex y anotaciones del autor.', 'v1.0', 10),
  ('future', 'Árbol de lectura guiada', 'Rutas de lectura recomendadas con desbloqueo progresivo de contenido.', 'v1.0', 20),
  ('future', 'Sistema de mecenazgo', 'Membresías para lectores que quieran apoyar el proyecto directamente.', 'v1.0', 30);
