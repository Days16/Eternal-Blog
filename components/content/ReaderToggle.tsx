'use client'

import { useState, useEffect } from 'react'

const KEY = 'eternidad-reader-mode'

export function ReaderToggle() {
  const [active, setActive] = useState(false)

  useEffect(() => {
    const saved = localStorage.getItem(KEY) === 'true'
    setActive(saved)
    if (saved) document.documentElement.classList.add('reader-mode')
  }, [])

  function toggle() {
    const next = !active
    setActive(next)
    localStorage.setItem(KEY, String(next))
    document.documentElement.classList.toggle('reader-mode', next)
  }

  return (
    <button
      onClick={toggle}
      title={active ? 'Desactivar modo lector' : 'Modo lector'}
      aria-pressed={active}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 6,
        padding: '6px 12px',
        background: active ? 'color-mix(in srgb, var(--spore) 12%, transparent)' : 'transparent',
        border: `1px solid ${active ? 'var(--spore)' : 'var(--border-soft)'}`,
        borderRadius: 'var(--r-sm)',
        color: active ? 'var(--spore)' : 'var(--text-mute)',
        fontFamily: 'var(--font-ui)',
        fontSize: 11,
        cursor: 'pointer',
        letterSpacing: 0.5,
        transition: 'all 0.2s',
        flexShrink: 0,
      }}
    >
      <span style={{ fontSize: 13 }}>{active ? 'ᛉ' : 'ᛟ'}</span>
      <span>{active ? 'Salir' : 'Leer'}</span>
    </button>
  )
}
