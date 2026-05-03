import Link from 'next/link'

const ITEMS = [
  { href: '/admin', label: 'Dashboard', rune: 'ᚨ' },
  { href: '/admin/entradas', label: 'Entradas', rune: 'ᛈ' },
  { href: '/admin/comentarios', label: 'Comentarios', rune: 'ᚺ' },
  { href: '/admin/usuarios', label: 'Usuarios', rune: 'ᛗ' },
  { href: '/admin/logros', label: 'Logros', rune: 'ᛟ' },
  { href: '/admin/misiones', label: 'Misiones', rune: 'ᛞ' },
]

export function AdminSidebar() {
  return (
    <aside style={{ width: 240, minHeight: '100vh', background: 'var(--moss-950)', borderRight: '1px solid var(--border-soft)', padding: 24, position: 'sticky', top: 0 }}>
      <Link href="/admin" style={{ fontFamily: 'var(--font-display)', fontSize: 22, color: 'var(--rune)', textDecoration: 'none', letterSpacing: 3 }}>
        ADMIN
      </Link>
      <nav style={{ display: 'grid', gap: 8, marginTop: 32 }}>
        {ITEMS.map(item => (
          <Link key={item.href} href={item.href} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 'var(--r-md)', color: 'var(--text-soft)', textDecoration: 'none', fontFamily: 'var(--font-ui)', fontSize: 13, border: '1px solid var(--border-soft)' }}>
            <span style={{ color: 'var(--spore)', fontFamily: 'var(--font-display)' }}>{item.rune}</span>
            {item.label}
          </Link>
        ))}
      </nav>
      <Link href="/cronicas" style={{ display: 'block', marginTop: 32, color: 'var(--text-mute)', fontFamily: 'var(--font-ui)', fontSize: 12, textDecoration: 'none' }}>
        ← Volver al sitio
      </Link>
    </aside>
  )
}
