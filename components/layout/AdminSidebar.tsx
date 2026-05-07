import Link from 'next/link'
import { auth } from '@/auth'
import { AdminNav, type AdminNavItem } from './AdminNav'
import { requireSupabase } from '@/lib/supabase/helpers'

async function getNavCounts() {
  const supabase = requireSupabase()
  const [
    { count: entriesCount },
    { count: codexCount },
    { count: commentsCount },
    { count: usersCount },
  ] = await Promise.all([
    supabase.from('entries').select('id', { count: 'exact', head: true }).neq('type', 'codex'),
    supabase.from('entries').select('id', { count: 'exact', head: true }).eq('type', 'codex'),
    supabase.from('comments').select('id', { count: 'exact', head: true }).eq('deleted', false),
    supabase.from('users').select('id', { count: 'exact', head: true }),
  ])
  return {
    entries: entriesCount ?? 0,
    codex: codexCount ?? 0,
    comments: commentsCount ?? 0,
    users: usersCount ?? 0,
  }
}

export async function AdminSidebar() {
  const [session, counts] = await Promise.all([auth(), getNavCounts()])
  const isMod = session?.user?.role === 'moderator'
  const isDev = session?.user?.role === 'dev'

  const ALL_ITEMS: AdminNavItem[] = [
    { href: '/admin',              label: 'Resumen',          icon: '◆' },
    { href: '/admin/entradas',     label: 'Entradas',         icon: '✎', count: counts.entries },
    { href: '/admin/codex',        label: 'Codex (wiki)',     icon: '◉', count: counts.codex },
    { href: '/admin/comentarios',  label: 'Comentarios',      icon: '✉', count: counts.comments, badge: counts.comments > 0 },
    { href: '/admin/usuarios',     label: 'Usuarios',         icon: '○', count: counts.users },
    { href: '/admin/misiones',     label: 'Misiones',         icon: '⚑' },
    { href: '/admin/logros',       label: 'Logros',           icon: '✦' },
    { href: '/admin/roles',        label: 'Roles & permisos', icon: '≡' },
    { href: '/admin/tema',         label: 'Tema y aspecto',   icon: '⚙' },
  ]

  const MOD_ITEMS: AdminNavItem[] = ALL_ITEMS.filter(item =>
    ['/admin', '/admin/entradas', '/admin/comentarios'].includes(item.href)
  )

  const visibleItems = isMod ? MOD_ITEMS : ALL_ITEMS

  const chamberLabel = isDev
    ? 'DEV SANCTUM'
    : isMod
      ? 'SALA DE MODERACIÓN'
      : 'CÁMARA DEL ARCHIMAGO'

  return (
    <aside style={{
      width: 236,
      minHeight: '100vh',
      background: 'var(--moss-950)',
      borderRight: '1px solid var(--border-soft)',
      padding: '28px 12px 28px 16px',
      position: 'sticky',
      top: 0,
      display: 'flex',
      flexDirection: 'column',
      flexShrink: 0,
    }}>
      {/* Cabecera */}
      <div style={{ padding: '0 4px', marginBottom: 28 }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          fontFamily: 'var(--font-ui)',
          fontSize: 9,
          letterSpacing: 2.5,
          color: 'var(--spore)',
          fontWeight: 700,
          textTransform: 'uppercase',
          marginBottom: 2,
        }}>
          <span style={{ fontSize: 11 }}>+</span>
          <span>{chamberLabel}</span>
        </div>
      </div>

      {/* Navegación */}
      <AdminNav items={visibleItems} />

      {/* Pie */}
      <div style={{
        marginTop: 'auto',
        paddingTop: 20,
        borderTop: '1px solid var(--border-soft)',
      }}>
        <Link
          href="/cronicas"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '6px 4px',
            color: 'var(--text-mute)',
            fontFamily: 'var(--font-ui)',
            fontSize: 10,
            textDecoration: 'none',
            textTransform: 'uppercase',
            letterSpacing: 1.5,
            transition: 'color 0.15s',
          }}
        >
          ← Salir al Bosque
        </Link>
      </div>
    </aside>
  )
}
