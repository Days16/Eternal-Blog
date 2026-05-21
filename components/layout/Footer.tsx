import Link from 'next/link'
import { Mushroom } from '@/components/ui/Mushroom'

export function Footer() {
  return (
    <footer
      style={{
        padding: '56px 64px',
        borderTop: '1px solid var(--border-soft)',
        background: 'var(--moss-950)',
        textAlign: 'center',
      }}
    >
      <Mushroom size={28} />
      <div
        style={{
          fontFamily: 'var(--font-display)',
          fontSize: 18,
          letterSpacing: 4,
          color: 'var(--text-soft)',
          marginTop: 12,
        }}
      >
        ETERNIDAD
      </div>
      <div
        style={{
          fontFamily: 'var(--font-body)',
          fontStyle: 'italic',
          fontSize: 12,
          color: 'var(--text-mute)',
          marginTop: 4,
        }}
      >
        escrito a mano, fermentado bajo luna llena · est. 2026
      </div>
      <div
        style={{
          marginTop: 24,
          display: 'flex',
          gap: 24,
          justifyContent: 'center',
          fontFamily: 'var(--font-ui)',
          fontSize: 12,
          color: 'var(--text-mute)',
        }}
      >
        <Link href="/cronicas"  style={{ color: 'inherit', textDecoration: 'none' }}>Crónicas</Link>
        <Link href="/codex"     style={{ color: 'inherit', textDecoration: 'none' }}>Codex</Link>
        <Link href="/sobre"     style={{ color: 'inherit', textDecoration: 'none' }}>Sobre el autor</Link>
        <Link href="/colaborar" style={{ color: 'inherit', textDecoration: 'none' }}>Colaborar</Link>
        <Link href="/feed.xml"  style={{ color: 'inherit', textDecoration: 'none' }}>RSS</Link>
      </div>
    </footer>
  )
}
