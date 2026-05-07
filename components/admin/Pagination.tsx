import Link from 'next/link'

type PaginationProps = {
  page: number
  total: number
  pageSize: number
  basePath: string
  /** Parámetros extra que deben preservarse en la URL (type, status, etc.) */
  extraParams?: Record<string, string>
}

export function Pagination({ page, total, pageSize, basePath, extraParams = {} }: PaginationProps) {
  const totalPages = Math.ceil(total / pageSize)
  if (totalPages <= 1) return null

  function href(p: number) {
    const params = new URLSearchParams({ ...extraParams, page: String(p) })
    return `${basePath}?${params}`
  }

  const window = 2
  const pages: (number | '…')[] = []
  for (let i = 1; i <= totalPages; i++) {
    if (i === 1 || i === totalPages || (i >= page - window && i <= page + window)) {
      pages.push(i)
    } else if (pages[pages.length - 1] !== '…') {
      pages.push('…')
    }
  }

  return (
    <nav style={{ display: 'flex', alignItems: 'center', gap: 6, justifyContent: 'center', marginTop: 24, fontFamily: 'var(--font-ui)', fontSize: 13 }}>
      {page > 1 && (
        <Link href={href(page - 1)} style={btnStyle}>← Anterior</Link>
      )}

      {pages.map((p, i) =>
        p === '…' ? (
          <span key={`ellipsis-${i}`} style={{ color: 'var(--text-mute)', padding: '0 4px' }}>…</span>
        ) : (
          <Link
            key={p}
            href={href(p)}
            style={{ ...btnStyle, ...(p === page ? activeStyle : {}) }}
          >
            {p}
          </Link>
        )
      )}

      {page < totalPages && (
        <Link href={href(page + 1)} style={btnStyle}>Siguiente →</Link>
      )}

      <span style={{ color: 'var(--text-mute)', fontSize: 11, marginLeft: 8 }}>
        {total} en total
      </span>
    </nav>
  )
}

const btnStyle: React.CSSProperties = {
  padding: '6px 12px',
  border: '1px solid var(--border-soft)',
  borderRadius: 'var(--r-sm)',
  background: 'var(--bg-card)',
  color: 'var(--text-soft)',
  textDecoration: 'none',
  transition: 'border-color 0.15s',
}

const activeStyle: React.CSSProperties = {
  borderColor: 'var(--spore)',
  color: 'var(--spore)',
  fontWeight: 700,
}
