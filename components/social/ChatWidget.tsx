'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import useSWR from 'swr'

interface Conversation {
  userId: string
  name: string | null
  username: string | null
  avatarUrl: string | null
  lastMessage: { body: string; createdAt: Date } | null
  unreadCount: number
}

interface Message {
  id: string
  senderId: string
  receiverId: string
  body: string
  readAt: Date | null
  createdAt: Date | null
}

const fetcher = (url: string) => fetch(url).then(r => r.json())

function initials(name: string | null, username: string | null) {
  const src = name ?? username ?? '?'
  return src.charAt(0).toUpperCase()
}

function relTime(date: Date | null | string) {
  if (!date) return ''
  const d = typeof date === 'string' ? new Date(date) : date
  const diff = Date.now() - d.getTime()
  if (diff < 60_000) return 'ahora'
  if (diff < 3_600_000) return `${Math.floor(diff / 60_000)}m`
  if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)}h`
  return d.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })
}

export function ChatWidget({ currentUserId }: { currentUserId: string }) {
  const [open, setOpen] = useState(false)
  const [activeConv, setActiveConv] = useState<Conversation | null>(null)
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const { data: convData, mutate: mutateConvs } = useSWR<{ conversations: Conversation[] }>(
    '/api/social?type=conversations',
    fetcher,
    { refreshInterval: 5000 },
  )

  const conversations = convData?.conversations ?? []
  const totalUnread = conversations.reduce((sum, c) => sum + c.unreadCount, 0)

  const { data: msgData, mutate: mutateMsgs } = useSWR<{ messages: Message[] }>(
    activeConv ? `/api/social?type=messages&partnerId=${activeConv.userId}` : null,
    fetcher,
    { refreshInterval: 3000 },
  )
  const messages = msgData?.messages ?? []

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [msgData])

  useEffect(() => {
    if (activeConv) {
      fetch('/api/social', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'mark_read', partnerId: activeConv.userId }),
      }).then(() => mutateConvs())
    }
  }, [activeConv, mutateConvs])

  const handleSend = useCallback(async () => {
    if (!activeConv || !input.trim() || sending) return
    setSending(true)
    await fetch('/api/social', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'send_message', receiverId: activeConv.userId, body: input.trim() }),
    })
    setInput('')
    setSending(false)
    mutateMsgs()
    mutateConvs()
  }, [activeConv, input, sending, mutateMsgs, mutateConvs])

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Abrir chat"
        style={{
          position: 'fixed', bottom: 24, right: 24, zIndex: 200,
          width: 52, height: 52, borderRadius: '50%',
          background: 'var(--moss-800)', border: '1px solid var(--border)',
          cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 20, boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
          transition: 'background var(--t-fast)',
        }}
      >
        💬
        {totalUnread > 0 && (
          <span style={{
            position: 'absolute', top: 0, right: 0,
            background: 'var(--ember)', color: '#fff',
            borderRadius: '50%', width: 18, height: 18,
            fontFamily: 'var(--font-ui)', fontSize: 10, fontWeight: 700,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            border: '2px solid var(--bg)',
          }}>
            {totalUnread > 9 ? '9+' : totalUnread}
          </span>
        )}
      </button>
    )
  }

  return (
    <div style={{
      position: 'fixed', bottom: 24, right: 24, zIndex: 200,
      width: 340, borderRadius: 16,
      background: 'var(--moss-900)', border: '1px solid var(--border)',
      boxShadow: '0 8px 40px rgba(0,0,0,0.5)',
      display: 'flex', flexDirection: 'column', overflow: 'hidden',
      maxHeight: 520,
    }}>
      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '12px 16px',
        background: 'var(--moss-800)', borderBottom: '1px solid var(--border-soft)',
        flexShrink: 0,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {activeConv && (
            <button type="button" onClick={() => setActiveConv(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-mute)', fontSize: 14, padding: '0 4px 0 0' }}>
              ‹
            </button>
          )}
          <span style={{ fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 600 }}>
            {activeConv ? (activeConv.name ?? activeConv.username ?? 'Chat') : 'Mensajes'}
          </span>
        </div>
        <button type="button" onClick={() => { setOpen(false); setActiveConv(null) }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-mute)', fontSize: 16, lineHeight: 1 }}>
          ✕
        </button>
      </div>

      {/* Cuerpo */}
      {!activeConv ? (
        /* Lista de conversaciones */
        <div style={{ overflowY: 'auto', flex: 1 }}>
          {conversations.length === 0 ? (
            <div style={{ padding: 32, textAlign: 'center', fontFamily: 'var(--font-body)', color: 'var(--text-mute)', fontStyle: 'italic', fontSize: 13 }}>
              Aún no tienes conversaciones. Añade amigos para chatear.
            </div>
          ) : (
            conversations.map(conv => (
              <button
                type="button"
                key={conv.userId}
                onClick={() => setActiveConv(conv)}
                style={{
                  width: '100%', textAlign: 'left',
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: '12px 16px',
                  background: 'transparent',
                  border: 'none', borderBottom: '1px solid var(--border-soft)',
                  cursor: 'pointer',
                  transition: 'background var(--t-fast)',
                }}
                onMouseEnter={e => (e.currentTarget.style.background = 'var(--moss-800)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
              >
                <div style={{
                  width: 38, height: 38, borderRadius: '50%', flexShrink: 0,
                  background: 'var(--moss-700)', border: '1px solid var(--border)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontFamily: 'var(--font-display)', fontSize: 16, color: 'var(--spore)',
                  position: 'relative',
                }}>
                  {initials(conv.name, conv.username)}
                  {conv.unreadCount > 0 && (
                    <span style={{
                      position: 'absolute', top: -4, right: -4,
                      background: 'var(--ember)', color: '#fff',
                      borderRadius: '50%', width: 16, height: 16,
                      fontFamily: 'var(--font-ui)', fontSize: 9, fontWeight: 700,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      border: '2px solid var(--bg)',
                    }}>
                      {conv.unreadCount > 9 ? '9+' : conv.unreadCount}
                    </span>
                  )}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontFamily: 'var(--font-ui)', fontSize: 13, fontWeight: conv.unreadCount > 0 ? 700 : 400, color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {conv.name ?? conv.username ?? 'Usuario'}
                  </div>
                  {conv.lastMessage && (
                    <div style={{ fontFamily: 'var(--font-body)', fontSize: 11, color: 'var(--text-mute)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {conv.lastMessage.body}
                    </div>
                  )}
                </div>
                {conv.lastMessage && (
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-mute)', flexShrink: 0 }}>
                    {relTime(conv.lastMessage.createdAt)}
                  </div>
                )}
              </button>
            ))
          )}
        </div>
      ) : (
        /* Ventana de chat */
        <>
          <div style={{ flex: 1, overflowY: 'auto', padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: 8 }}>
            {messages.map(msg => {
              const isOwn = msg.senderId === currentUserId
              return (
                <div key={msg.id} style={{ display: 'flex', justifyContent: isOwn ? 'flex-end' : 'flex-start' }}>
                  <div style={{
                    maxWidth: '75%', padding: '8px 12px',
                    borderRadius: isOwn ? '14px 14px 4px 14px' : '14px 14px 14px 4px',
                    background: isOwn ? 'var(--spore)' : 'var(--moss-700)',
                    color: isOwn ? 'var(--moss-900)' : 'var(--text)',
                    fontFamily: 'var(--font-body)', fontSize: 13, lineHeight: 1.5,
                    wordBreak: 'break-word',
                  }}>
                    {msg.body}
                    <div style={{ fontSize: 9, color: isOwn ? 'rgba(0,0,0,0.4)' : 'var(--text-mute)', marginTop: 3, textAlign: 'right' }}>
                      {relTime(msg.createdAt)}
                    </div>
                  </div>
                </div>
              )
            })}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div style={{ padding: '8px 12px', borderTop: '1px solid var(--border-soft)', display: 'flex', gap: 8, flexShrink: 0 }}>
            <input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleSend()}
              placeholder="Escribe un mensaje..."
              maxLength={2000}
              style={{
                flex: 1, background: 'var(--moss-800)', border: '1px solid var(--border)',
                borderRadius: 20, padding: '8px 14px',
                fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--text)',
                outline: 'none',
              }}
            />
            <button
              type="button"
              onClick={handleSend}
              disabled={!input.trim() || sending}
              style={{
                width: 36, height: 36, borderRadius: '50%', flexShrink: 0,
                background: input.trim() ? 'var(--spore)' : 'var(--moss-700)',
                border: 'none', cursor: input.trim() ? 'pointer' : 'default',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: input.trim() ? 'var(--moss-900)' : 'var(--text-mute)',
                fontSize: 14, transition: 'background var(--t-fast)',
              }}
            >
              ➤
            </button>
          </div>
        </>
      )}
    </div>
  )
}
