'use client'

import { useRef, useEffect, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { bulkUpdateEntriesAction } from '@/app/admin/actions'
import { formatDate } from '@/lib/utils/dates'

const STORAGE_KEY = 'admin:entries:selected'

type Entry = {
  id: string
  title: string
  type: 'chronicle' | 'codex'
  status: 'draft' | 'published' | 'archived'
  updatedAt: Date | null
}

const STATUS_LABELS: Record<string, string> = {
  published: 'Publicada',
  draft:     'Borrador',
  archived:  'Archivada',
}

const STATUS_COLORS: Record<string, string> = {
  published: 'var(--spore)',
  draft:     'var(--text-mute)',
  archived:  'var(--moss-500, var(--text-mute))',
}

function loadSelection(): Set<string> {
  if (typeof window === 'undefined') return new Set()
  try {
    return new Set(JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]'))
  } catch {
    return new Set()
  }
}

export function EntriesTable({ entries }: { entries: Entry[] }) {
  const router = useRouter()
  const [selected, setSelected] = useState<Set<string>>(loadSelection)
  const [tagInput, setTagInput] = useState('')
  const [feedback, setFeedback] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const allCheckboxRef = useRef<HTMLInputElement>(null)

  const pageIds = entries.map(e => e.id)
  const pageSelectedCount = pageIds.filter(id => selected.has(id)).length
  const allPageSelected = pageIds.length > 0 && pageSelectedCount === pageIds.length
  const somePageSelected = pageSelectedCount > 0 && !allPageSelected

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...selected]))
  }, [selected])

  useEffect(() => {
    if (allCheckboxRef.current) {
      allCheckboxRef.current.indeterminate = somePageSelected
    }
  }, [somePageSelected])

  function toggleAll() {
    setSelected(prev => {
      const next = new Set(prev)
      if (allPageSelected) {
        pageIds.forEach(id => next.delete(id))
      } else {
        pageIds.forEach(id => next.add(id))
      }
      return next
    })
  }

  function toggleEntry(id: string) {
    setSelected(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  function clearSelection() {
    setSelected(new Set())
    setTagInput('')
  }

  function applyBulk(field: string, value: string) {
    if (!value || selected.size === 0) return
    const formData = new FormData()
    formData.set('ids', JSON.stringify([...selected]))
    formData.set('field', field)
    formData.set('value', value)

    startTransition(async () => {
      await bulkUpdateEntriesAction(formData)
      const n = selected.size
      setFeedback(`${n} entrada${n > 1 ? 's' : ''} actualizada${n > 1 ? 's' : ''}`)
      clearSelection()
      setTimeout(() => setFeedback(null), 3500)
    })
  }

  const rowBase: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: '40px 1fr 110px 110px 150px',
    gap: 16,
    padding: '14px 16px',
    borderBottom: '1px solid var(--border-soft)',
    fontFamily: 'var(--font-ui)',
    fontSize: 13,
    alignItems: 'center',
    cursor: 'pointer',
    transition: 'background 0.1s',
  }

  const btnSmall: React.CSSProperties = {
    padding: '4px 10px',
    border: '1px solid var(--border-soft)',
    borderRadius: 'var(--r-sm)',
    background: 'transparent',
    color: 'var(--text-soft)',
    fontFamily: 'var(--font-ui)',
    fontSize: 11,
    cursor: isPending ? 'not-allowed' : 'pointer',
    transition: 'border-color 0.1s, color 0.1s',
    whiteSpace: 'nowrap' as const,
    opacity: isPending ? 0.5 : 1,
  }

  return (
    <div>
      {/* Barra de acciones bulk */}
      {selected.size > 0 && (
        <div style={{
          background: 'var(--moss-800)',
          border: '1px solid var(--spore)',
          borderRadius: 'var(--r-md)',
          padding: '10px 16px',
          marginBottom: 12,
          display: 'flex',
          alignItems: 'center',
          gap: 16,
          flexWrap: 'wrap',
        }}>
          <span style={{
            color: 'var(--spore)',
            fontFamily: 'var(--font-ui)',
            fontSize: 13,
            fontWeight: 700,
            whiteSpace: 'nowrap',
          }}>
            ✦ {selected.size} seleccionada{selected.size > 1 ? 's' : ''}
          </span>

          {/* Estado */}
          <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
            <span style={{ color: 'var(--text-mute)', fontSize: 11, fontFamily: 'var(--font-ui)' }}>Estado:</span>
            {(['published', 'draft', 'archived'] as const).map(s => (
              <button key={s} onClick={() => applyBulk('status', s)} disabled={isPending} style={btnSmall}>
                {STATUS_LABELS[s]}
              </button>
            ))}
          </div>

          {/* Tipo */}
          <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
            <span style={{ color: 'var(--text-mute)', fontSize: 11, fontFamily: 'var(--font-ui)' }}>Tipo:</span>
            <button onClick={() => applyBulk('type', 'chronicle')} disabled={isPending} style={btnSmall}>Crónica</button>
            <button onClick={() => applyBulk('type', 'codex')} disabled={isPending} style={btnSmall}>Codex</button>
          </div>

          {/* Tags */}
          <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
            <input
              value={tagInput}
              onChange={e => setTagInput(e.target.value)}
              placeholder="Etiqueta…"
              disabled={isPending}
              style={{
                background: 'var(--moss-900)',
                border: '1px solid var(--border-soft)',
                borderRadius: 'var(--r-sm)',
                color: 'var(--text)',
                fontFamily: 'var(--font-ui)',
                fontSize: 12,
                padding: '4px 8px',
                width: 110,
              }}
            />
            <button
              onClick={() => { if (tagInput.trim()) applyBulk('tag_add', tagInput.trim()) }}
              disabled={isPending || !tagInput.trim()}
              style={{ ...btnSmall, color: 'var(--spore)', borderColor: 'var(--spore)' }}
            >
              + Añadir
            </button>
            <button
              onClick={() => { if (tagInput.trim()) applyBulk('tag_remove', tagInput.trim()) }}
              disabled={isPending || !tagInput.trim()}
              style={btnSmall}
            >
              − Quitar
            </button>
          </div>

          {feedback && (
            <span style={{ color: 'var(--spore)', fontSize: 12, fontFamily: 'var(--font-ui)' }}>
              ✓ {feedback}
            </span>
          )}

          <button
            onClick={clearSelection}
            style={{ ...btnSmall, marginLeft: 'auto', color: 'var(--text-mute)' }}
          >
            ✕ Deseleccionar
          </button>
        </div>
      )}

      {/* Tabla */}
      <div className="table-scroll" style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border-soft)',
        borderRadius: 'var(--r-lg)',
        overflow: 'hidden',
      }}>
        <div style={{ minWidth: 560 }}>
          {/* Cabecera */}
          <div style={{
            ...rowBase,
            padding: '10px 16px',
            background: 'var(--moss-900)',
            borderBottom: '1px solid var(--border-soft)',
            fontSize: 10,
            color: 'var(--text-mute)',
            textTransform: 'uppercase' as const,
            letterSpacing: 1.5,
            fontWeight: 600,
            cursor: 'default',
          }}>
            <span style={{ display: 'flex', alignItems: 'center' }}>
              <input
                ref={allCheckboxRef}
                type="checkbox"
                checked={allPageSelected}
                onChange={toggleAll}
                style={{ cursor: 'pointer', accentColor: 'var(--spore)', width: 14, height: 14 }}
              />
            </span>
            <span>Título</span>
            <span>Tipo</span>
            <span>Estado</span>
            <span>Actualizado</span>
          </div>

          {/* Filas */}
          {entries.map(entry => {
            const isSelected = selected.has(entry.id)
            return (
              <div
                key={entry.id}
                onClick={() => router.push(`/admin/entradas/${entry.id}`)}
                style={{
                  ...rowBase,
                  background: isSelected ? 'color-mix(in srgb, var(--spore) 8%, var(--bg-card))' : undefined,
                  borderLeft: isSelected ? '2px solid var(--spore)' : '2px solid transparent',
                  paddingLeft: isSelected ? 14 : 16,
                  color: 'var(--text)',
                }}
                className="hover-row"
              >
                <span
                  onClick={e => { e.stopPropagation(); toggleEntry(entry.id) }}
                  style={{ display: 'flex', alignItems: 'center' }}
                >
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => toggleEntry(entry.id)}
                    style={{ cursor: 'pointer', accentColor: 'var(--spore)', width: 14, height: 14 }}
                  />
                </span>
                <span style={{ overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>
                  {entry.title}
                </span>
                <span style={{ color: 'var(--text-mute)', textTransform: 'capitalize' }}>
                  {entry.type === 'chronicle' ? 'Crónica' : 'Codex'}
                </span>
                <span style={{ color: STATUS_COLORS[entry.status] ?? 'var(--text-mute)' }}>
                  {STATUS_LABELS[entry.status] ?? entry.status}
                </span>
                <span style={{ color: 'var(--text-mute)' }}>
                  {formatDate(entry.updatedAt)}
                </span>
              </div>
            )
          })}

          {entries.length === 0 && (
            <p style={{ padding: 24, color: 'var(--text-mute)', fontFamily: 'var(--font-body)', fontStyle: 'italic' }}>
              No hay entradas.
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
