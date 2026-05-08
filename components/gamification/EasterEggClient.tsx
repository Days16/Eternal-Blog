'use client'

import { useEffect } from 'react'
import type { ToastDetail } from '@/components/gamification/AchievementToast'

const KONAMI = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a']

const TOASTS: Record<string, Omit<ToastDetail, 'message'> & { message: string; repeatMessage: string }> = {
  konami: {
    title: 'Código Konami',
    message: 'Has encontrado un huevo de pascua rúnico.',
    repeatMessage: 'El sello de Konami ya había sido roto.',
    xpDelta: 30,
    runeGlyph: 'ᚲ',
  },
  'archimago-search': {
    title: 'Visión del Archimago',
    message: 'Has invocado un eco secreto entre los índices del bosque.',
    repeatMessage: 'La visión del Archimago ya estaba inscrita en tu grimorio.',
    xpDelta: 30,
    runeGlyph: 'ᛉ',
  },
}

async function claim(slug: string) {
  const response = await fetch('/api/xp', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ kind: 'easter_egg', slug }),
  })

  if (!response.ok) return

  const payload = (await response.json().catch(() => ({}))) as { alreadyFound?: boolean }
  const detail = TOASTS[slug] ?? {
    title: 'Secreto rúnico',
    message: 'Has encontrado un huevo de pascua rúnico.',
    repeatMessage: 'Este secreto ya dormía en tu inventario.',
    xpDelta: 30,
    runeGlyph: 'ᛟ',
  }

  window.dispatchEvent(new CustomEvent<ToastDetail>('eternidad:toast', {
    detail: {
      title: detail.title,
      message: payload.alreadyFound ? detail.repeatMessage : detail.message,
      xpDelta: payload.alreadyFound ? undefined : detail.xpDelta,
      runeGlyph: detail.runeGlyph,
    },
  }))
}

export function EasterEggClient() {
  useEffect(() => {
    let index = 0

    function keydown(event: KeyboardEvent) {
      if (event.key === KONAMI[index]) index += 1
      else index = 0
      if (index === KONAMI.length) {
        index = 0
        void claim('konami')
      }
    }

    window.addEventListener('keydown', keydown)
    return () => window.removeEventListener('keydown', keydown)
  }, [])

  useEffect(() => {
    if (window.location.search.toLowerCase().includes('archimago')) void claim('archimago-search')
  }, [])

  return null
}
