-- ── Foro de la comunidad ─────────────────────────────────────

create table if not exists public.forum_categories (
  id          uuid primary key default gen_random_uuid(),
  slug        text not null unique,
  name        text not null,
  description text,
  icon        text not null default '◈',
  color       text not null default 'var(--spore)',
  sort_order  integer not null default 0,
  created_at  timestamptz not null default now()
);

create table if not exists public.forum_threads (
  id          uuid primary key default gen_random_uuid(),
  slug        text not null unique,
  title       text not null,
  body        text not null,
  author_id   uuid not null references public.users(id) on delete cascade,
  category_id uuid not null references public.forum_categories(id) on delete cascade,
  pinned      boolean not null default false,
  locked      boolean not null default false,
  views       integer not null default 0,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create table if not exists public.forum_replies (
  id          uuid primary key default gen_random_uuid(),
  thread_id   uuid not null references public.forum_threads(id) on delete cascade,
  user_id     uuid not null references public.users(id) on delete cascade,
  body        text not null,
  parent_id   uuid references public.forum_replies(id) on delete set null,
  deleted     boolean not null default false,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- Índices
create index if not exists forum_threads_category on public.forum_threads (category_id, created_at desc);
create index if not exists forum_threads_author   on public.forum_threads (author_id);
create index if not exists forum_replies_thread   on public.forum_replies (thread_id, created_at asc);

-- RLS
alter table public.forum_categories enable row level security;
alter table public.forum_threads     enable row level security;
alter table public.forum_replies     enable row level security;

-- Categorías — lectura pública
create policy "forum_categories_read"  on public.forum_categories for select using (true);
create policy "forum_categories_write" on public.forum_categories for all    using (auth.role() = 'service_role');

-- Hilos — lectura pública; escritura solo autenticados (via service role en server actions)
create policy "forum_threads_read"  on public.forum_threads for select using (true);
create policy "forum_threads_write" on public.forum_threads for all    using (auth.role() = 'service_role');

-- Respuestas — lectura pública; escritura solo autenticados
create policy "forum_replies_read"  on public.forum_replies for select using (true);
create policy "forum_replies_write" on public.forum_replies for all    using (auth.role() = 'service_role');

-- Seed: categorías iniciales
insert into public.forum_categories (slug, name, description, icon, color, sort_order) values
  ('pergaminos',  'Pergaminos',       'Teorías, análisis y debate sobre la obra.',            '◈', 'var(--spore)',     10),
  ('la-taberna',  'La Taberna',       'Conversación general. Cualquier cosa del bosque.',     '◉', 'var(--mist)',      20),
  ('bestiario',   'Bestiario Vivo',   'Preguntas y curiosidades sobre criaturas y el mundo.', '✦', 'var(--amethyst)',  30),
  ('escribas',    'Escribas',         'Proceso, consejos y recursos de escritura.',            '✎', 'var(--rune)',      40),
  ('ofrenda',     'Ofrenda',          'Fan-art, escritura de fans y creaciones propias.',      '○', 'var(--text-soft)', 50);
