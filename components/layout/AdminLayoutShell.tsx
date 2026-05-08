'use client'

import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { Mushroom } from '@/components/ui/Mushroom'

export function AdminLayoutShell({
  sidebar,
  children,
  chamberLabel,
}: {
  sidebar: React.ReactNode
  children: React.ReactNode
  chamberLabel: string
}) {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()

  // Cerrar drawer al navegar
  useEffect(() => { setOpen(false) }, [pathname])

  // Cerrar con Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false) }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [])

  // Bloquear scroll del body cuando drawer está abierto
  useEffect(() => {
    if (open) document.body.style.overflow = 'hidden'
    else document.body.style.overflow = ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  return (
    <div className="admin-shell tex-canopy">

      {/* ── Barra superior móvil ─────────────────────────── */}
      <div className="admin-mobile-topbar">
        <button
          className="admin-hamburger"
          onClick={() => setOpen(o => !o)}
          aria-label={open ? 'Cerrar menú' : 'Abrir menú de administración'}
          aria-expanded={open}
        >
          {open
            ? <span style={{ fontSize: 18, display: 'block', lineHeight: 1, color: 'var(--spore)', width: 22, textAlign: 'center' }}>✕</span>
            : <><span /><span /><span /></>
          }
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Mushroom size={18} />
          <span style={{
            fontFamily: 'var(--font-display)',
            fontSize: 17,
            fontWeight: 600,
            letterSpacing: 3,
            color: 'var(--text)',
          }}>
            ETERNIDAD
          </span>
        </div>

        <span style={{
          marginLeft: 'auto',
          fontFamily: 'var(--font-ui)',
          fontSize: 8,
          letterSpacing: 1.5,
          color: 'var(--spore)',
          fontWeight: 700,
          textTransform: 'uppercase',
          textAlign: 'right',
          maxWidth: 100,
          lineHeight: 1.4,
        }}>
          {chamberLabel}
        </span>
      </div>

      {/* ── Overlay ─────────────────────────────────────── */}
      {open && (
        <div
          className="admin-sidebar-overlay"
          onClick={() => setOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* ── Shell inner: sidebar + main ──────────────────── */}
      <div className="admin-shell-inner">
        <div className={`admin-drawer${open ? ' open' : ''}`}>
          {sidebar}
        </div>

        <main className="admin-main">
          {children}
        </main>
      </div>

    </div>
  )
}
