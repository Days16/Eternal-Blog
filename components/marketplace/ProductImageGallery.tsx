'use client'

import { useState } from 'react'

interface ProductImageGalleryProps {
  images: string[]
  alt: string
  typeIcon: string
}

export function ProductImageGallery({ images, alt, typeIcon }: ProductImageGalleryProps) {
  const [activeIdx, setActiveIdx] = useState(0)

  if (images.length === 0) {
    return (
      <div style={{
        aspectRatio: '1', background: 'var(--moss-700)', borderRadius: 'var(--r-lg)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontFamily: 'var(--font-display)', fontSize: 80, color: 'var(--spore)', opacity: 0.4,
      }}>
        {typeIcon}
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {/* Imagen principal */}
      <div style={{
        aspectRatio: '1', background: 'var(--moss-700)', borderRadius: 'var(--r-lg)',
        overflow: 'hidden', position: 'relative',
      }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={images[activeIdx]}
          alt={`${alt} — imagen ${activeIdx + 1}`}
          style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'opacity 0.2s' }}
        />
        {images.length > 1 && (
          <>
            <button
              type="button"
              onClick={() => setActiveIdx(prev => (prev === 0 ? images.length - 1 : prev - 1))}
              style={{
                position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)',
                background: 'rgba(11, 17, 25, 0.8)', border: '1px solid rgba(212, 166, 74, 0.3)',
                color: 'var(--spore)', borderRadius: '50%', width: 36, height: 36,
                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 16, zIndex: 2,
              }}
            >
              ‹
            </button>
            <button
              type="button"
              onClick={() => setActiveIdx(prev => (prev === images.length - 1 ? 0 : prev + 1))}
              style={{
                position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                background: 'rgba(11, 17, 25, 0.8)', border: '1px solid rgba(212, 166, 74, 0.3)',
                color: 'var(--spore)', borderRadius: '50%', width: 36, height: 36,
                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 16, zIndex: 2,
              }}
            >
              ›
            </button>
            <div style={{
              position: 'absolute', bottom: 10, right: 12,
              fontFamily: 'var(--font-mono)', fontSize: 10,
              color: 'rgba(255,255,255,0.7)',
              background: 'rgba(11,17,25,0.6)',
              padding: '2px 7px', borderRadius: 10,
            }}>
              {activeIdx + 1} / {images.length}
            </div>
          </>
        )}
      </div>

      {/* Miniaturas */}
      {images.length > 1 && (
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {images.map((src, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setActiveIdx(idx)}
              style={{
                width: 64, height: 64, padding: 0, border: 'none',
                borderRadius: 'var(--r-sm)', overflow: 'hidden',
                outline: idx === activeIdx ? '2px solid var(--spore)' : '2px solid transparent',
                outlineOffset: 2, cursor: 'pointer', flexShrink: 0,
                opacity: idx === activeIdx ? 1 : 0.6,
                transition: 'opacity 0.15s, outline-color 0.15s',
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={src} alt={`${alt} — miniatura ${idx + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
