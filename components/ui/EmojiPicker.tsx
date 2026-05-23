'use client'

import { useEffect, useRef, useState } from 'react'

const EMOJI_GROUPS = [
  {
    label: 'Expresiones',
    emojis: ['😊','😄','😂','🥹','😍','🥺','😎','🤔','😮','😅','🙃','😏','😴','😤','🫡','🤗','😶','🫠'],
  },
  {
    label: 'Gestos',
    emojis: ['👍','👎','❤️','🔥','✨','💀','💡','⚡','🎉','🙌','🤝','👀','🫶','💪','✌️','🤌'],
  },
  {
    label: 'Bosque arcano',
    emojis: ['🌿','🍄','🌑','🌙','⭐','🍃','🌲','🦌','🦋','🐺','🌺','🌸','🍂','🌊','🔮','🗡️','📜','🕯️','⚗️','🌫️'],
  },
]

interface Props {
  onSelect: (emoji: string) => void
}

export function EmojiPicker({ onSelect }: Props) {
  const [open, setOpen] = useState(false)
  const [activeGroup, setActiveGroup] = useState(0)
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null)
  const ref = useRef<HTMLDivElement>(null)
  const btnRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (!open) return
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [open])

  function toggle() {
    if (!open && btnRef.current) {
      const r = btnRef.current.getBoundingClientRect()
      const PICKER_W = 360
      const left = Math.min(r.left, window.innerWidth - PICKER_W - 8)
      setPos({ top: r.top - 8, left: Math.max(8, left) })
    }
    setOpen(prev => !prev)
  }

  function pick(emoji: string) {
    onSelect(emoji)
    setOpen(false)
  }

  return (
    <div ref={ref} style={{ position: 'relative', display: 'inline-block' }}>
      <button
        ref={btnRef}
        type="button"
        onClick={toggle}
        title="Insertar emoji"
        style={{
          background: open ? 'var(--moss-800)' : 'transparent',
          border: '1px solid var(--border-soft)',
          borderRadius: 'var(--r-sm)',
          color: 'var(--text-soft)',
          cursor: 'pointer',
          fontFamily: 'var(--font-ui)',
          fontSize: 14,
          padding: '5px 8px',
          lineHeight: 1,
        }}
      >
        😊
      </button>

      {open && pos && (
        <div style={{
          position: 'fixed',
          top: pos.top,
          left: pos.left,
          transform: 'translateY(-100%)',
          zIndex: 9999,
          background: 'var(--moss-800)',
          border: '1px solid var(--border-soft)',
          borderRadius: 'var(--r-lg)',
          padding: '10px',
          width: 360,
          boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
        }}>
          {/* Tabs de grupo */}
          <div style={{ display: 'flex', gap: 4, marginBottom: 10, borderBottom: '1px solid var(--border-soft)', paddingBottom: 8 }}>
            {EMOJI_GROUPS.map((g, i) => (
              <button
                key={g.label}
                type="button"
                onClick={() => setActiveGroup(i)}
                style={{
                  flex: 1,
                  background: activeGroup === i ? 'var(--moss-700)' : 'transparent',
                  border: '1px solid',
                  borderColor: activeGroup === i ? 'var(--border-soft)' : 'transparent',
                  borderRadius: 'var(--r-sm)',
                  color: activeGroup === i ? 'var(--text)' : 'var(--text-mute)',
                  cursor: 'pointer',
                  fontFamily: 'var(--font-ui)',
                  fontSize: 9,
                  padding: '4px 4px',
                  textAlign: 'center',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                {g.label}
              </button>
            ))}
          </div>

          {/* Grid de emojis */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(10, 1fr)',
            gap: 2,
          }}>
            {EMOJI_GROUPS[activeGroup].emojis.map(emoji => (
              <button
                key={emoji}
                type="button"
                onClick={() => pick(emoji)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  borderRadius: 4,
                  cursor: 'pointer',
                  fontSize: 18,
                  lineHeight: 1,
                  padding: '4px 2px',
                  textAlign: 'center',
                  transition: 'background 0.1s',
                }}
                onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = 'var(--moss-700)' }}
                onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'transparent' }}
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
