'use client'

import { useEffect, useRef, useState } from 'react'

export interface ToastDetail {
  message: string
  title?: string
  xpDelta?: number
  runeGlyph?: string
}

export function AchievementToast() {
  const [toast, setToast] = useState<ToastDetail | null>(null)
  const [visible, setVisible] = useState(false)
  const hideTimerRef = useRef<number | null>(null)
  const clearTimerRef = useRef<number | null>(null)

  useEffect(() => {
    function clearTimers() {
      if (hideTimerRef.current !== null) window.clearTimeout(hideTimerRef.current)
      if (clearTimerRef.current !== null) window.clearTimeout(clearTimerRef.current)
    }

    function handler(event: Event) {
      clearTimers()
      const detail = (event as CustomEvent<ToastDetail>).detail
      setToast({
        message: detail?.message ?? 'Logro desbloqueado',
        title: detail?.title,
        xpDelta: detail?.xpDelta,
        runeGlyph: detail?.runeGlyph,
      })
      setVisible(true)

      hideTimerRef.current = window.setTimeout(() => {
        setVisible(false)
        clearTimerRef.current = window.setTimeout(() => setToast(null), 320)
      }, 4200)
    }

    window.addEventListener('eternidad:toast', handler)
    return () => {
      clearTimers()
      window.removeEventListener('eternidad:toast', handler)
    }
  }, [])

  if (!toast) return null

  return (
    <>
      <div
        aria-live="polite"
        className={visible ? 'toast-shell toast-visible' : 'toast-shell toast-hidden'}
        style={{
          position: 'fixed',
          right: 24,
          bottom: 24,
          zIndex: 50,
          width: 'min(360px, calc(100vw - 32px))',
          background: 'var(--bg-card)',
          border: '1px solid var(--rune)',
          borderRadius: 'var(--r-lg)',
          padding: 18,
          boxShadow: 'var(--glow-spore)',
          color: 'var(--text)',
          display: 'grid',
          gridTemplateColumns: '56px 1fr',
          gap: 14,
          alignItems: 'center',
          pointerEvents: 'none',
        }}
      >
        <div
          style={{
            fontFamily: 'var(--font-display)',
            color: 'var(--rune)',
            fontSize: 36,
            lineHeight: 1,
            textAlign: 'center',
          }}
        >
          {toast.runeGlyph ?? 'ᛟ'}
        </div>
        <div>
          <div style={{ fontFamily: 'var(--font-display)', color: 'var(--rune)', fontSize: 22, lineHeight: 1.1, marginBottom: 4 }}>
            {toast.title ?? 'Sello roto'}
          </div>
          <div style={{ fontFamily: 'var(--font-body)', fontSize: 14, color: 'var(--text-soft)' }}>
            {toast.message}
          </div>
          {typeof toast.xpDelta === 'number' && (
            <div style={{ fontFamily: 'var(--font-ui)', fontSize: 12, color: 'var(--spore)', marginTop: 8, letterSpacing: 0.5 }}>
              +{toast.xpDelta} XP
            </div>
          )}
        </div>
      </div>
      <style jsx>{`
        .toast-shell {
          transform-origin: bottom right;
        }

        .toast-visible {
          animation: toast-fade-in 220ms ease forwards;
        }

        .toast-hidden {
          animation: toast-fade-out 320ms ease forwards;
        }

        @keyframes toast-fade-in {
          from {
            opacity: 0;
            transform: translateY(12px) scale(0.98);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        @keyframes toast-fade-out {
          from {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
          to {
            opacity: 0;
            transform: translateY(10px) scale(0.98);
          }
        }
      `}</style>
    </>
  )
}
