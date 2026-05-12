'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { Mushroom } from '@/components/ui/Mushroom'
import { LevelBadge } from '@/components/ui/LevelBadge'
import { Btn } from '@/components/ui/Btn'
import { TopNavSearch } from '@/components/search/TopNavSearch'
import { NotificationBell } from '@/components/layout/NotificationBell'
import { useUserStats } from '@/hooks/use-user-stats'
import type { LevelNumber } from '@/components/ui/constants'

const NAV_ITEMS = [
  { href: '/cronicas', label: 'Crónicas' },
  { href: '/codex',    label: 'Codex' },
  { href: '/sobre',    label: 'Sobre el autor' },
]

interface TopNavProps {
  compact?: boolean
}

export function TopNav({ compact = false }: TopNavProps) {
  const pathname   = usePathname()
  const { data: session } = useSession()
  const { stats }  = useUserStats(!!session?.user)
  const user = session?.user as { name?: string; level?: number; xp?: number; role?: string } | undefined
  const level = (stats?.level ?? user?.level ?? 1) as LevelNumber
  const xp    = stats?.xp ?? user?.xp ?? 0
  const canAccessAdmin = user?.role === 'admin' || user?.role === 'moderator' || user?.role === 'dev'
  const navItems = canAccessAdmin
    ? [...NAV_ITEMS, { href: '/admin', label: user?.role === 'moderator' ? 'Panel Mod' : (user?.role === 'dev' ? 'Panel Dev' : 'Admin') }]
    : NAV_ITEMS

  const [menuOpen, setMenuOpen] = useState(false)

  // Cerrar menú al navegar
  useEffect(() => { setMenuOpen(false) }, [pathname])

  // Bloquear scroll al abrir
  useEffect(() => {
    if (menuOpen) document.body.style.overflow = 'hidden'
    else document.body.style.overflow = ''
    return () => { document.body.style.overflow = '' }
  }, [menuOpen])

  // Cerrar con Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') setMenuOpen(false) }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [])

  const isActive = (href: string) =>
    href === '/' ? pathname === href : pathname.startsWith(href)

  return (
    <>
      <header
        className={compact ? '' : 'topnav-header'}
        style={{
          display: 'flex',
          alignItems: 'center',
          padding: compact ? '14px 20px' : '20px 48px',
          borderBottom: '1px solid var(--border-soft)',
          background: 'rgba(11,17,25,0.92)',
          backdropFilter: 'blur(12px)',
          gap: compact ? 12 : 32,
          position: 'sticky',
          top: 0,
          zIndex: 10,
        }}
      >
        {/* Logo */}
        <Link href="/cronicas" className="logo-link" style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
          <Mushroom size={compact ? 20 : 24} />
          <span
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: compact ? 18 : 22,
              fontWeight: 600,
              letterSpacing: compact ? 2 : 4,
              color: 'var(--text)',
            }}
          >
            ETERNIDAD
          </span>
        </Link>

        {/* Nav links — visible en desktop */}
        {!compact && (
          <nav style={{ display: 'flex', gap: 28, marginLeft: 24 }} className="topnav-desktop-nav">
            {navItems.map(item => {
              const active = isActive(item.href)
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  style={{
                    fontFamily: 'var(--font-ui)',
                    fontSize: 13,
                    color: active ? 'var(--spore)' : 'var(--text-soft)',
                    textDecoration: 'none',
                    fontWeight: active ? 600 : 400,
                    letterSpacing: 0.3,
                    position: 'relative',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {item.label}
                  {active && (
                    <span
                      className="nav-dot"
                      style={{
                        position: 'absolute',
                        bottom: -22,
                        left: '50%',
                        transform: 'translateX(-50%)',
                        width: 4,
                        height: 4,
                        borderRadius: '50%',
                        background: 'var(--spore)',
                        boxShadow: 'var(--glow-spore)',
                      }}
                    />
                  )}
                </Link>
              )
            })}
          </nav>
        )}

        <div style={{ flex: 1 }} />

        {/* Search — solo desktop */}
        {!compact && (
          <div className="topnav-desktop-search">
            <TopNavSearch />
          </div>
        )}

        {/* Notificaciones */}
        <NotificationBell />

        {/* Usuario / Sesión */}
        {user ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <LevelBadge level={level} size={28} />
            {!compact && (
              <Link href="/perfil" style={{ textDecoration: 'none' }} className="topnav-user-info">
                <div style={{ fontFamily: 'var(--font-ui)', fontSize: 12 }}>
                  <div style={{ color: 'var(--text)', fontWeight: 500 }}>{user.name}</div>
                  <div style={{ color: 'var(--text-mute)', fontSize: 10 }}>{xp.toLocaleString('es-ES')} XP</div>
                </div>
              </Link>
            )}
          </div>
        ) : (
          <Link href="/login" style={{ textDecoration: 'none' }} className="topnav-desktop-login">
            <Btn size="sm" variant="rune">Invocar sesión</Btn>
          </Link>
        )}

        {/* Hamburger — visible en móvil */}
        {!compact && (
          <button
            className="topnav-hamburger"
            onClick={() => setMenuOpen(o => !o)}
            aria-label={menuOpen ? 'Cerrar menú' : 'Abrir menú'}
            aria-expanded={menuOpen}
          >
            {menuOpen ? '✕' : '☰'}
          </button>
        )}
      </header>

      {/* ── Menú móvil full-screen ────────────────────────── */}
      {menuOpen && !compact && (
        <div className="topnav-mobile-menu" role="dialog" aria-modal="true" aria-label="Menú de navegación">
          {/* Cabecera del menú */}
          <div className="topnav-mobile-menu-header">
            <Link href="/cronicas" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none' }} onClick={() => setMenuOpen(false)}>
              <Mushroom size={22} />
              <span style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 600, letterSpacing: 3, color: 'var(--text)' }}>
                ETERNIDAD
              </span>
            </Link>
            <button className="topnav-mobile-menu-close" onClick={() => setMenuOpen(false)} aria-label="Cerrar menú">
              ✕
            </button>
          </div>

          {/* Links de navegación */}
          <nav className="topnav-mobile-nav">
            {navItems.map(item => (
              <Link
                key={item.href}
                href={item.href}
                className={`topnav-mobile-nav-item${isActive(item.href) ? ' active' : ''}`}
                onClick={() => setMenuOpen(false)}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Footer del menú: usuario + search */}
          <div className="topnav-mobile-footer">
            {/* Búsqueda */}
            <TopNavSearch />

            {/* Usuario */}
            {user ? (
              <Link href="/perfil" style={{ display: 'flex', alignItems: 'center', gap: 12, textDecoration: 'none', padding: '12px 0' }} onClick={() => setMenuOpen(false)}>
                <LevelBadge level={level} size={36} />
                <div style={{ fontFamily: 'var(--font-ui)', fontSize: 13 }}>
                  <div style={{ color: 'var(--text)', fontWeight: 500 }}>{user.name}</div>
                  <div style={{ color: 'var(--text-mute)', fontSize: 11 }}>{xp.toLocaleString('es-ES')} XP</div>
                </div>
              </Link>
            ) : (
              <Link href="/login" style={{ textDecoration: 'none' }} onClick={() => setMenuOpen(false)}>
                <Btn variant="rune" style={{ width: '100%', justifyContent: 'center' }}>Invocar sesión</Btn>
              </Link>
            )}
          </div>
        </div>
      )}
    </>
  )
}
