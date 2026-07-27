'use client'

import { useEffect, useRef, useState, type CSSProperties } from 'react'

type Role = 'user' | 'assistant'
type ChatMessage = { role: Role; content: string }

const MODES = [
  { id: 'general', label: 'Général', icon: '🤖' },
  { id: 'actualite', label: 'Actualité', icon: '📰' },
  { id: 'match', label: 'Match', icon: '⚽' },
  { id: 'social', label: 'Réseaux', icon: '📱' },
  { id: 'analyse', label: 'Analyse', icon: '📊' },
] as const

const SUGGESTIONS = [
  'Rédige une annonce pour les matchs de ce week-end',
  'Fais un compte-rendu d\'un match à partir des derniers résultats',
  'Propose 3 posts WhatsApp pour engager les pronostiqueurs',
  'Analyse le classement et dis qui est en forme',
  'Écris une actu catégorie résultat prête à publier',
]

export default function AgentChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [mode, setMode] = useState<(typeof MODES)[number]['id']>('general')
  const [includeLiveData, setIncludeLiveData] = useState(true)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const bottomRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  const send = async (text?: string) => {
    const content = (text ?? input).trim()
    if (!content || loading) return

    setError(null)
    setInput('')
    const next: ChatMessage[] = [...messages, { role: 'user', content }]
    setMessages(next)
    setLoading(true)

    try {
      const res = await fetch('/api/ai/agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: next,
          mode,
          includeLiveData,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Erreur API')

      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: data.reply as string },
      ])
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erreur inconnue')
    } finally {
      setLoading(false)
      textareaRef.current?.focus()
    }
  }

  const clearChat = () => {
    setMessages([])
    setError(null)
  }

  const copyLast = async () => {
    const last = [...messages].reverse().find((m) => m.role === 'assistant')
    if (!last) return
    await navigator.clipboard.writeText(last.content)
  }

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: 'calc(100vh - 120px)',
        minHeight: 520,
        background: 'var(--color-surface-card)',
        border: '1px solid var(--color-border)',
        borderRadius: 16,
        overflow: 'hidden',
        boxShadow: 'var(--shadow-md)',
      }}
    >
      {/* Header tools */}
      <div
        style={{
          padding: '14px 16px',
          borderBottom: '1px solid var(--color-border)',
          display: 'flex',
          flexWrap: 'wrap',
          gap: 10,
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'linear-gradient(135deg, rgba(0,98,51,0.06), rgba(251,191,0,0.08))',
        }}
      >
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {MODES.map((m) => (
            <button
              key={m.id}
              type="button"
              onClick={() => setMode(m.id)}
              style={{
                border: mode === m.id ? '1px solid var(--color-primary)' : '1px solid var(--color-border)',
                background: mode === m.id ? 'rgba(0,98,51,0.12)' : 'var(--color-surface-card)',
                color: mode === m.id ? 'var(--color-primary)' : 'var(--color-text-secondary)',
                borderRadius: 999,
                padding: '6px 12px',
                fontSize: '0.78rem',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              {m.icon} {m.label}
            </button>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <label
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              fontSize: '0.75rem',
              color: 'var(--color-text-secondary)',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            <input
              type="checkbox"
              checked={includeLiveData}
              onChange={(e) => setIncludeLiveData(e.target.checked)}
            />
            Données live
          </label>
          <button type="button" onClick={copyLast} className="btn" style={toolBtnStyle}>
            Copier
          </button>
          <button type="button" onClick={clearChat} className="btn" style={toolBtnStyle}>
            Nouveau
          </button>
        </div>
      </div>

      {/* Messages */}
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: 20,
          display: 'flex',
          flexDirection: 'column',
          gap: 14,
          background: 'var(--color-surface)',
        }}
      >
        {messages.length === 0 && !loading && (
          <div style={{ maxWidth: 640, margin: 'auto', textAlign: 'center' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: 8 }}>🤖⚽</div>
            <h2
              style={{
                fontFamily: 'var(--font-outfit)',
                fontWeight: 800,
                fontSize: '1.25rem',
                marginBottom: 8,
                color: 'var(--color-primary)',
              }}
            >
              Navé Agent — ton assistant de travail
            </h2>
            <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem', marginBottom: 18 }}>
              Rédaction d&apos;actus, analyses de matchs, posts réseaux, idées de contenu.
              Branché sur les données NavéStats quand « Données live » est activé.
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center' }}>
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => send(s)}
                  style={{
                    border: '1px solid var(--color-border)',
                    background: 'var(--color-surface-card)',
                    borderRadius: 12,
                    padding: '10px 12px',
                    fontSize: '0.8rem',
                    textAlign: 'left',
                    cursor: 'pointer',
                    color: 'var(--color-text-primary)',
                    maxWidth: 280,
                    boxShadow: 'var(--shadow-sm)',
                  }}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((m, i) => (
          <div
            key={`${m.role}-${i}`}
            style={{
              alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start',
              maxWidth: 'min(720px, 92%)',
              padding: '12px 14px',
              borderRadius: m.role === 'user' ? '14px 14px 4px 14px' : '14px 14px 14px 4px',
              background:
                m.role === 'user'
                  ? 'linear-gradient(135deg, #006233, #00A651)'
                  : 'var(--color-surface-card)',
              color: m.role === 'user' ? 'white' : 'var(--color-text-primary)',
              border: m.role === 'assistant' ? '1px solid var(--color-border)' : 'none',
              boxShadow: 'var(--shadow-sm)',
              whiteSpace: 'pre-wrap',
              lineHeight: 1.55,
              fontSize: '0.9rem',
            }}
          >
            {m.role === 'assistant' && (
              <div
                style={{
                  fontSize: '0.7rem',
                  fontWeight: 800,
                  color: 'var(--color-primary)',
                  marginBottom: 6,
                  letterSpacing: '0.02em',
                }}
              >
                NAVÉ AGENT
              </div>
            )}
            {m.content}
          </div>
        ))}

        {loading && (
          <div
            style={{
              alignSelf: 'flex-start',
              padding: '12px 14px',
              borderRadius: 14,
              background: 'var(--color-surface-card)',
              border: '1px solid var(--color-border)',
              color: 'var(--color-text-muted)',
              fontSize: '0.85rem',
            }}
          >
            Navé Agent réfléchit…
          </div>
        )}

        {error && (
          <div
            style={{
              padding: '10px 12px',
              borderRadius: 10,
              background: 'rgba(232,0,45,0.08)',
              border: '1px solid rgba(232,0,45,0.25)',
              color: 'var(--color-red)',
              fontSize: '0.85rem',
            }}
          >
            {error}
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Composer */}
      <div
        style={{
          padding: 14,
          borderTop: '1px solid var(--color-border)',
          background: 'var(--color-surface-card)',
        }}
      >
        <div style={{ display: 'flex', gap: 10, alignItems: 'flex-end' }}>
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                send()
              }
            }}
            placeholder="Ex. : Rédige une actu sur le prochain match de la journée…"
            rows={2}
            style={{
              flex: 1,
              resize: 'none',
              border: '1px solid var(--color-border)',
              borderRadius: 12,
              padding: '12px 14px',
              fontSize: '0.9rem',
              fontFamily: 'inherit',
              outline: 'none',
              background: 'var(--color-surface)',
              color: 'var(--color-text-primary)',
            }}
          />
          <button
            type="button"
            onClick={() => send()}
            disabled={loading || !input.trim()}
            style={{
              border: 'none',
              borderRadius: 12,
              padding: '12px 18px',
              background: loading || !input.trim()
                ? 'var(--color-border)'
                : 'linear-gradient(135deg, #006233, #00A651)',
              color: 'white',
              fontWeight: 800,
              cursor: loading || !input.trim() ? 'not-allowed' : 'pointer',
              minHeight: 48,
            }}
          >
            Envoyer
          </button>
        </div>
        <p style={{ marginTop: 8, fontSize: '0.72rem', color: 'var(--color-text-muted)' }}>
          Entrée pour envoyer · Shift+Entrée pour une nouvelle ligne · Propulsé par Grok (SpaceXAI)
        </p>
      </div>
    </div>
  )
}

const toolBtnStyle: CSSProperties = {
  border: '1px solid var(--color-border)',
  background: 'var(--color-surface-card)',
  borderRadius: 8,
  padding: '6px 10px',
  fontSize: '0.75rem',
  fontWeight: 700,
  cursor: 'pointer',
  color: 'var(--color-text-secondary)',
}
