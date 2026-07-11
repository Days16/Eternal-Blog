-- =====================================================================
-- ETERNIDAD — esquema completo de base de datos (Supabase / Postgres)
-- Reconstruido a partir del uso real del código (no existía SQL previo).
-- Ejecutar una sola vez sobre un proyecto Supabase nuevo (SQL Editor).
-- =====================================================================

create extension if not exists pgcrypto;

-- ---------------------------------------------------------------------
-- Función utilitaria: mantener updated_at al día
-- ---------------------------------------------------------------------
create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- =====================================================================
-- achievements (sin dependencias, referenciada por users)
-- =====================================================================
create table achievements (
  id             uuid primary key default gen_random_uuid(),
  slug           text not null unique,
  name           text not null,
  description    text,
  rune_glyph     text not null default 'ᛟ',
  color          text not null default 'var(--spore)',
  criteria_type  text not null check (criteria_type in (
                   'xp_total','level_reached','comment_count','reaction_given',
                   'reaction_received','easter_egg_found','easter_egg_all',
                   'entry_published','forum_thread_count','forum_reply_count',
                   'streak_days','follow_count','friend_count','profile_complete','manual'
                 )),
  criteria_value integer not null default 0,
  xp_reward      integer not null default 0,
  has_name_badge boolean not null default false,
  badge_icon     text,
  created_at     timestamptz not null default now()
);

-- =====================================================================
-- users (id compartido con auth.users de Supabase Auth)
-- =====================================================================
create table users (
  id                          uuid primary key references auth.users(id) on delete cascade,
  name                        text,
  email                       text unique,
  email_verified              timestamptz,
  image                       text,
  password_hash               text,
  username                    text unique,
  bio                         text,
  avatar_url                  text,
  role                        text not null default 'reader',
  special_role                text,
  level                       integer not null default 1,
  xp                          integer not null default 0,
  active_badge_achievement_id uuid references achievements(id) on delete set null,
  streak                      integer not null default 0,
  last_activity_date          date,
  notify_new_posts            boolean not null default false,
  created_at                  timestamptz not null default now(),
  updated_at                  timestamptz not null default now()
);

create trigger trg_users_updated_at before update on users
  for each row execute function set_updated_at();

-- =====================================================================
-- entries (crónicas + codex)
-- =====================================================================
create table entries (
  id            uuid primary key default gen_random_uuid(),
  slug          text not null unique,
  type          text not null check (type in ('chronicle','codex')),
  title         text not null,
  excerpt       text,
  body          text,
  cover_url     text,
  tags          text,
  category      text check (category is null or category in (
                  'geography','characters','bestiary','spells','timeline','glossary'
                )),
  status        text not null default 'draft' check (status in ('draft','published','archived')),
  word_count    integer not null default 0,
  published_at  timestamptz,
  author_id     uuid references users(id) on delete set null,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create index idx_entries_type_status_published on entries (type, status, published_at desc);
create index idx_entries_type_status_category on entries (type, status, category);

create trigger trg_entries_updated_at before update on entries
  for each row execute function set_updated_at();

-- =====================================================================
-- comments
-- =====================================================================
create table comments (
  id         uuid primary key default gen_random_uuid(),
  entry_id   uuid not null references entries(id) on delete cascade,
  user_id    uuid not null references users(id) on delete cascade,
  body       text not null,
  parent_id  uuid references comments(id) on delete cascade,
  depth      integer not null default 0,
  path       text not null,
  sealed     boolean not null default false,
  deleted    boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_comments_entry_path on comments (entry_id, path);
create index idx_comments_entry_deleted on comments (entry_id, deleted);
create index idx_comments_user_deleted on comments (user_id, deleted);

create trigger trg_comments_updated_at before update on comments
  for each row execute function set_updated_at();

-- =====================================================================
-- reactions
-- =====================================================================
create table reactions (
  id         uuid primary key default gen_random_uuid(),
  entry_id   uuid not null references entries(id) on delete cascade,
  user_id    uuid not null references users(id) on delete cascade,
  kind       text not null check (kind in ('magic','bright','uneasy','dreamer')),
  created_at timestamptz not null default now(),
  unique (entry_id, user_id, kind)
);

create index idx_reactions_entry on reactions (entry_id);

-- =====================================================================
-- user_achievements
-- =====================================================================
create table user_achievements (
  user_id        uuid not null references users(id) on delete cascade,
  achievement_id uuid not null references achievements(id) on delete cascade,
  unlocked_at    timestamptz not null default now(),
  primary key (user_id, achievement_id)
);

-- =====================================================================
-- activity_log
-- =====================================================================
create table activity_log (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references users(id) on delete cascade,
  kind       text not null check (kind in (
               'comment','reaction','entry_published','achievement_unlocked',
               'easter_egg_found','mission_completed','daily_streak','entry_read'
             )),
  ref_id     text,
  xp_delta   integer not null default 0,
  created_at timestamptz not null default now()
);

create index idx_activity_log_user_created on activity_log (user_id, created_at desc);

-- =====================================================================
-- easter_eggs / user_easter_eggs
-- =====================================================================
create table easter_eggs (
  id          uuid primary key default gen_random_uuid(),
  slug        text not null unique,
  description text not null,
  xp_reward   integer not null default 0,
  found_count integer not null default 0
);

create table user_easter_eggs (
  user_id    uuid not null references users(id) on delete cascade,
  egg_id     uuid not null references easter_eggs(id) on delete cascade,
  found_at   timestamptz not null default now(),
  primary key (user_id, egg_id)
);

-- =====================================================================
-- missions / user_missions
-- =====================================================================
create table missions (
  id             uuid primary key default gen_random_uuid(),
  title          text not null,
  description    text,
  criteria_type  text not null check (criteria_type in (
                   'comment_count','reaction_given','easter_egg_found',
                   'entry_published','xp_total','level_reached','streak_days'
                 )),
  criteria_value integer not null default 1,
  xp_reward      integer not null default 25,
  glyph          text not null default 'ᛟ',
  starts_at      timestamptz,
  ends_at        timestamptz,
  created_at     timestamptz not null default now()
);

create index idx_missions_active on missions (starts_at, ends_at);

create table user_missions (
  user_id      uuid not null references users(id) on delete cascade,
  mission_id   uuid not null references missions(id) on delete cascade,
  completed_at timestamptz not null default now(),
  xp_awarded   integer not null default 0,
  primary key (user_id, mission_id)
);

-- =====================================================================
-- follows / friendships / direct_messages
-- =====================================================================
create table follows (
  follower_id  uuid not null references users(id) on delete cascade,
  following_id uuid not null references users(id) on delete cascade,
  created_at   timestamptz not null default now(),
  primary key (follower_id, following_id),
  check (follower_id <> following_id)
);

create table friendships (
  id          uuid primary key default gen_random_uuid(),
  sender_id   uuid not null references users(id) on delete cascade,
  receiver_id uuid not null references users(id) on delete cascade,
  status      text not null default 'pending' check (status in ('pending','accepted','rejected')),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  check (sender_id <> receiver_id)
);

create index idx_friendships_pair on friendships (sender_id, receiver_id);

create trigger trg_friendships_updated_at before update on friendships
  for each row execute function set_updated_at();

create table direct_messages (
  id          uuid primary key default gen_random_uuid(),
  sender_id   uuid not null references users(id) on delete cascade,
  receiver_id uuid not null references users(id) on delete cascade,
  body        text not null,
  read_at     timestamptz,
  created_at  timestamptz not null default now()
);

create index idx_dm_conversation on direct_messages (sender_id, receiver_id, created_at);
create index idx_dm_unread on direct_messages (receiver_id, read_at);

-- =====================================================================
-- collaborator_applications
-- =====================================================================
create table collaborator_applications (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null unique references users(id) on delete cascade,
  motivation   text not null,
  portfolio    text,
  status       text not null default 'pending' check (status in ('pending','accepted','rejected')),
  reviewed_by  uuid references users(id) on delete set null,
  reviewed_at  timestamptz,
  created_at   timestamptz not null default now()
);

-- =====================================================================
-- forum
-- =====================================================================
create table forum_categories (
  id          uuid primary key default gen_random_uuid(),
  slug        text not null unique,
  name        text not null,
  description text,
  icon        text not null default '◈',
  color       text not null default 'var(--spore)',
  sort_order  integer not null default 0
);

create table forum_threads (
  id          uuid primary key default gen_random_uuid(),
  slug        text not null unique,
  title       text not null,
  body        text not null,
  author_id   uuid references users(id) on delete set null,
  category_id uuid not null references forum_categories(id) on delete cascade,
  pinned      boolean not null default false,
  locked      boolean not null default false,
  views       integer not null default 0,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index idx_forum_threads_category on forum_threads (category_id, pinned, created_at desc);

create trigger trg_forum_threads_updated_at before update on forum_threads
  for each row execute function set_updated_at();

create table forum_replies (
  id         uuid primary key default gen_random_uuid(),
  thread_id  uuid not null references forum_threads(id) on delete cascade,
  user_id    uuid not null references users(id) on delete cascade,
  body       text not null,
  parent_id  uuid references forum_replies(id) on delete cascade,
  deleted    boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_forum_replies_thread on forum_replies (thread_id, deleted, created_at);

create trigger trg_forum_replies_updated_at before update on forum_replies
  for each row execute function set_updated_at();

create table forum_thread_follows (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references users(id) on delete cascade,
  thread_id  uuid not null references forum_threads(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (user_id, thread_id)
);

-- =====================================================================
-- roadmap_items
-- =====================================================================
create table roadmap_items (
  id           uuid primary key default gen_random_uuid(),
  phase        text not null check (phase in ('done','in_progress','next','future')),
  title        text not null,
  description  text,
  version_tag  text,
  sort_order   integer not null default 0,
  public       boolean not null default true,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create index idx_roadmap_public_order on roadmap_items (public, sort_order);

create trigger trg_roadmap_items_updated_at before update on roadmap_items
  for each row execute function set_updated_at();

-- =====================================================================
-- read_history
-- =====================================================================
create table read_history (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references users(id) on delete cascade,
  entry_id   uuid not null references entries(id) on delete cascade,
  read_at    timestamptz not null default now(),
  unique (user_id, entry_id)
);

-- =====================================================================
-- notifications
-- =====================================================================
create table notifications (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references users(id) on delete cascade,
  actor_id   uuid references users(id) on delete set null,
  type       text not null check (type in (
               'friend_request','friend_accepted','direct_message','forum_reply'
             )),
  data       jsonb not null default '{}'::jsonb,
  read_at    timestamptz,
  created_at timestamptz not null default now()
);

create index idx_notifications_user_read on notifications (user_id, read_at);
create index idx_notifications_user_created on notifications (user_id, created_at desc);

-- =====================================================================
-- custom_roles
-- =====================================================================
create table custom_roles (
  id          uuid primary key default gen_random_uuid(),
  name        text not null unique,
  label       text not null,
  description text,
  color       text not null default 'var(--spore)',
  permissions text[] not null default '{}',
  created_at  timestamptz not null default now()
);

-- =====================================================================
-- site_texts / site_settings
-- =====================================================================
create table site_texts (
  key           text primary key,
  value         text not null,
  default_value text not null,
  description   text,
  section       text not null default 'general',
  updated_at    timestamptz not null default now()
);

create index idx_site_texts_section on site_texts (section);

create trigger trg_site_texts_updated_at before update on site_texts
  for each row execute function set_updated_at();

create table site_settings (
  key        text primary key,
  value      text not null,
  updated_at timestamptz not null default now()
);

create trigger trg_site_settings_updated_at before update on site_settings
  for each row execute function set_updated_at();

-- =====================================================================
-- marketplace: products / cart_items / orders
-- =====================================================================
create table products (
  id          uuid primary key default gen_random_uuid(),
  slug        text not null unique,
  name        text not null,
  description text,
  price       numeric(10,2) not null default 0,
  image_url   text,
  type        text not null check (type in ('merch','book','digital')),
  stock       integer not null default 0,
  visible     boolean not null default true,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create trigger trg_products_updated_at before update on products
  for each row execute function set_updated_at();

create table cart_items (
  user_id    uuid not null references users(id) on delete cascade,
  product_id uuid not null references products(id) on delete cascade,
  quantity   integer not null default 1 check (quantity >= 1),
  created_at timestamptz not null default now(),
  primary key (user_id, product_id)
);

create table orders (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references users(id) on delete cascade,
  status     text not null default 'pending' check (status in ('pending','paid','shipped','cancelled')),
  total      numeric(10,2) not null default 0,
  items_json jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now()
);

create index idx_orders_user_created on orders (user_id, created_at desc);

-- =====================================================================
-- user_featured_entries
-- =====================================================================
create table user_featured_entries (
  user_id    uuid not null references users(id) on delete cascade,
  entry_id   uuid not null references entries(id) on delete cascade,
  position   integer not null check (position between 1 and 3),
  created_at timestamptz not null default now(),
  primary key (user_id, position)
);

-- =====================================================================
-- Función RPC: add_xp — actualización atómica de xp/nivel del usuario
-- Umbrales de nivel (lib/xp/events.ts): 0 / 500 / 2000 / 5000 / 12000
-- =====================================================================
create or replace function add_xp(p_user_id uuid, p_delta integer)
returns table(new_xp integer, new_level integer, leveled_up boolean)
language plpgsql
as $$
declare
  v_old_level integer;
  v_new_xp    integer;
  v_new_level integer;
begin
  select xp, level into v_new_xp, v_old_level
  from users
  where id = p_user_id
  for update;

  if not found then
    raise exception 'user % not found', p_user_id;
  end if;

  v_new_xp := greatest(0, v_new_xp + p_delta);

  v_new_level := case
    when v_new_xp >= 12000 then 5
    when v_new_xp >= 5000  then 4
    when v_new_xp >= 2000  then 3
    when v_new_xp >= 500   then 2
    else 1
  end;

  update users
  set xp = v_new_xp, level = v_new_level, updated_at = now()
  where id = p_user_id;

  return query select v_new_xp, v_new_level, (v_new_level > v_old_level);
end;
$$;

-- =====================================================================
-- Storage bucket usado por la app (avatares de perfil)
-- =====================================================================
insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do nothing;
