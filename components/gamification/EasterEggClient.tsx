'use client'

import { useEffect } from 'react'
import type { ToastDetail } from '@/components/gamification/AchievementToast'

const KONAMI = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a']
const LS_KEY = 'eternidad:found_eggs'

const TOASTS: Record<string, Omit<ToastDetail, 'message'> & { message: string }> = {
  konami: {
    title: 'Código Konami',
    message: 'Has encontrado un huevo de pascua rúnico.',
    xpDelta: 30,
    runeGlyph: 'ᚲ',
  },
  'archimago-search': {
    title: 'Visión del Archimago',
    message: 'Has invocado un eco secreto entre los índices del bosque.',
    xpDelta: 30,
    runeGlyph: 'ᛉ',
  },
  'triple-click-logo': {
    title: 'Latido del Bosque',
    message: 'El bosque palpita bajo tus dedos.',
    xpDelta: 15,
    runeGlyph: 'ᚹ',
  },
  'idle-watcher': {
    title: 'Guardián Silencioso',
    message: 'Permaneces inmóvil. El bosque te observa.',
    xpDelta: 20,
    runeGlyph: 'ᛈ',
  },
  'footer-scroll': {
    title: 'Las Raíces Profundas',
    message: 'Has llegado al fondo del árbol.',
    xpDelta: 10,
    runeGlyph: 'ᛜ',
  },
}

function isEggFound(slug: string): boolean {
  try {
    const raw = localStorage.getItem(LS_KEY)
    const found: string[] = raw ? JSON.parse(raw) : []
    return found.includes(slug)
  } catch {
    return false
  }
}

function markEggFound(slug: string): void {
  try {
    const raw = localStorage.getItem(LS_KEY)
    const found: string[] = raw ? JSON.parse(raw) : []
    if (!found.includes(slug)) {
      found.push(slug)
      localStorage.setItem(LS_KEY, JSON.stringify(found))
    }
  } catch {
    // localStorage no disponible — no es crítico
  }
}

async function claim(slug: string) {
  if (isEggFound(slug)) return

  const response = await fetch('/api/xp', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ kind: 'easter_egg', slug }),
  })

  if (!response.ok) return

  const payload = (await response.json().catch(() => ({}))) as { alreadyFound?: boolean }

  markEggFound(slug)

  if (payload.alreadyFound) return

  const detail = TOASTS[slug] ?? {
    title: 'Secreto rúnico',
    message: 'Has encontrado un huevo de pascua rúnico.',
    xpDelta: 30,
    runeGlyph: 'ᛟ',
  }

  window.dispatchEvent(new CustomEvent<ToastDetail>('eternidad:toast', {
    detail: {
      title: detail.title,
      message: detail.message,
      xpDelta: detail.xpDelta,
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

  // Triple click en el logo
  useEffect(() => {
    let clicks = 0
    let timer: ReturnType<typeof setTimeout>
    function handleClick(e: MouseEvent) {
      const target = e.target as HTMLElement
      if (!target.closest('a[href="/cronicas"]')) return
      clicks++
      clearTimeout(timer)
      if (clicks >= 3) { clicks = 0; void claim('triple-click-logo') }
      else timer = setTimeout(() => { clicks = 0 }, 600)
    }
    document.addEventListener('click', handleClick)
    return () => { document.removeEventListener('click', handleClick); clearTimeout(timer) }
  }, [])

  // Inactividad de 2 minutos
  useEffect(() => {
    let idleTimer: ReturnType<typeof setTimeout>
    const reset = () => {
      clearTimeout(idleTimer)
      idleTimer = setTimeout(() => void claim('idle-watcher'), 120_000)
    }
    reset()
    window.addEventListener('mousemove', reset)
    window.addEventListener('keydown', reset)
    return () => {
      clearTimeout(idleTimer)
      window.removeEventListener('mousemove', reset)
      window.removeEventListener('keydown', reset)
    }
  }, [])

  // Scroll hasta el footer
  useEffect(() => {
    let fired = false
    function onScroll() {
      if (fired) return
      const scrollBottom = window.scrollY + window.innerHeight
      if (scrollBottom >= document.body.scrollHeight - 20) {
        fired = true
        void claim('footer-scroll')
      }
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return null
}
