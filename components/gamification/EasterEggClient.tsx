'use client'

import { useEffect } from 'react'

const KONAMI = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a']

async function claim(slug: string) {
  const response = await fetch('/api/xp', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ kind: 'easter_egg', slug }) })
  if (response.ok) window.dispatchEvent(new CustomEvent('eternidad:toast', { detail: { message: 'Has encontrado un huevo de pascua rúnico.' } }))
}

export function EasterEggClient() {
  useEffect(() => {
    let index = 0
    function keydown(event: KeyboardEvent) {
      if (event.key === KONAMI[index]) index += 1
      else index = 0
      if (index === KONAMI.length) { index = 0; void claim('konami') }
    }
    window.addEventListener('keydown', keydown)
    return () => window.removeEventListener('keydown', keydown)
  }, [])

  useEffect(() => {
    if (window.location.search.toLowerCase().includes('archimago')) void claim('archimago-search')
  }, [])

  return null
}
