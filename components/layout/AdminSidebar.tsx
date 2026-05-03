import Link from 'next/link'
import { auth } from '@/auth'

const ITEMS = [
  { href: '/admin', label: 'Dashboard', rune: 'ᚨ' },
  { href: '/admin/entradas', label: 'Entradas', rune: 'ᛈ' },
  { href: '/admin/comentarios', label: 'Comentarios', rune: 'ᚺ' },
  { href: '/admin/usuarios', label: 'Usuarios', rune: 'ᛗ' },
  { href: '/admin/logros', label: 'Logros', rune: 'ᛟ' },
  { href: '/admin/misiones', label: 'Misiones', rune: 'ᛞ' },
]

export async function AdminSidebar() {
  const session = await auth()
  const isMod = session?.user?.role === 'moderator'
  const isDev = session?.user?.role === 'dev'
  const visibleItems = isMod
    ? ITEMS.filter(item => ['/admin', '/admin/entradas', '/admin/comentarios'].includes(item.href))
    : ITEMS

  return (
    <aside style={{ 
      width: 260, 
      minHeight: '100vh', 
      background: 'var(--moss-950)', 
      borderRight: '1px solid var(--border-soft)', 
      padding: '48px 24px', 
      position: 'sticky', 
      top: 0, 
      display: 'flex', 
      flexDirection: 'column' 
    }}>
      <div style={{ marginBottom: 48, padding: '0 8px' }}>
        <Link href="/admin" style={{ textDecoration: 'none' }}>
          <div style={{ fontFamily: 'var(--font-ui)', fontSize: 10, letterSpacing: 4, color: 'var(--spore)', fontWeight: 700, marginBottom: 4 }}>ETERNIDAD</div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 24, color: 'var(--text)', fontWeight: 600 }}>{isDev ? 'Dev Sanctum' : (isMod ? 'Moderación' : 'Administración')}</div>
        </Link>
      </div>

      <nav style={{ display: 'grid', gap: 4, flex: 1 }}>
        {visibleItems.map(item => (
          <Link key={item.href} href={item.href} style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: 12, 
            padding: '10px 16px', 
            borderRadius: 'var(--r-md)', 
            color: 'var(--text-soft)', 
            textDecoration: 'none', 
            fontFamily: 'var(--font-ui)', 
            fontSize: 13,
            transition: 'all 0.2s'
          }} className="hover-glow">
            <span style={{ color: 'var(--spore)', fontFamily: 'var(--font-display)', fontSize: 18, width: 20 }}>{item.rune}</span>
            {item.label}
          </Link>
        ))}
      </nav>

      <div style={{ marginTop: 'auto', padding: '24px 8px 0', borderTop: '1px solid var(--border-soft)' }}>
        <Link href="/cronicas" style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text-mute)', fontFamily: 'var(--font-ui)', fontSize: 11, textDecoration: 'none', textTransform: 'uppercase', letterSpacing: 1.5 }}>
          ← Salir al Bosque
        </Link>
      </div>
    </aside>
  )
}
