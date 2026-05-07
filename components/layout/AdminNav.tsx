'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

export interface AdminNavItem {
  href: string
  label: string
  icon: string
  count?: number
  badge?: boolean
}

export function AdminNav({ items }: { items: AdminNavItem[] }) {
  const pathname = usePathname()

  return (
    <nav style={{ display: 'flex', flexDirection: 'column', gap: 2, flex: 1 }}>
      {items.map(item => {
        const isActive = item.href === '/admin'
          ? pathname === '/admin'
          : pathname.startsWith(item.href)

        return (
          <Link
            key={item.href}
            href={item.href}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              padding: '9px 12px',
              borderRadius: 'var(--r-md)',
              color: isActive ? 'var(--spore)' : 'var(--text-soft)',
              textDecoration: 'none',
              fontFamily: 'var(--font-ui)',
              fontSize: 13,
              fontWeight: isActive ? 600 : 400,
              background: isActive ? 'rgba(212, 166, 74, 0.10)' : 'transparent',
              transition: 'background 0.15s, color 0.15s',
              borderLeft: isActive ? '2px solid var(--spore)' : '2px solid transparent',
            }}
          >
            <span style={{
              fontSize: 15,
              width: 18,
              flexShrink: 0,
              opacity: isActive ? 1 : 0.55,
              color: isActive ? 'var(--spore)' : 'var(--text-mute)',
            }}>
              {item.icon}
            </span>
            <span style={{ flex: 1, letterSpacing: 0.1 }}>{item.label}</span>
            {item.count != null && (
              <span style={{
                display: 'flex',
                alignItems: 'center',
                gap: 4,
                fontFamily: 'var(--font-ui)',
                fontSize: 11,
                color: item.badge ? 'var(--ember)' : 'var(--text-mute)',
                fontWeight: item.badge ? 700 : 400,
              }}>
                {item.badge && (
                  <span style={{
                    width: 6,
                    height: 6,
                    borderRadius: '50%',
                    background: 'var(--ember)',
                    display: 'inline-block',
                    flexShrink: 0,
                  }} />
                )}
                {item.count.toLocaleString('es-ES')}
              </span>
            )}
          </Link>
        )
      })}
    </nav>
  )
}
