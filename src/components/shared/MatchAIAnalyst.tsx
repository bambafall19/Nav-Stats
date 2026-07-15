'use client'

import { useState } from 'react'

interface Props {
  matchId: string
  equipeANom: string
  equipeBNom: string
  statut: 'a_venir' | 'en_cours' | 'termine' | 'reporte' | string
}

const QUICK_Q = [
  'Qui a le plus d’arguments ?',
  'Quel score plausible ?',
  'Sur qui parier pour un but ?',
]

export default function MatchAIAnalyst({ matchId, equipeANom, equipeBNom, statut }: Props) {
  const [analysis, setAnalysis] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [question, setQuestion] = useState('')

  const run = async (q?: string) => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/ai/match-analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          matchId,
          question: q?.trim() || undefined,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Erreur analyse')
      setAnalysis(String(data.analysis || ''))
      setQuestion('')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erreur inconnue')
    } finally {
      setLoading(false)
    }
  }

  const ctaLabel =
    statut === 'termine'
      ? 'Bilan IA du match'
      : statut === 'en_cours'
        ? 'Lecture IA du match'
        : 'Analyse IA du match'

  return (
    <div
      style={{
        background: 'var(--color-surface-card)',
        border: '1px solid var(--color-border)',
        borderRadius: 20,
        padding: 24,
        boxShadow: 'var(--shadow-sm)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Accent */}
      <div
        aria-hidden
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: 3,
          background: 'linear-gradient(90deg, #006233, #00A651, #FBBF00)',
        }}
      />

      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 16 }}>
        <div
          style={{
            width: 44,
            height: 44,
            borderRadius: 14,
            background: 'linear-gradient(135deg, #004d27, #00A651)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.25rem',
            flexShrink: 0,
            boxShadow: '0 6px 16px rgba(0,98,51,0.28)',
          }}
        >
          🧠
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <h3
            style={{
              fontWeight: 800,
              fontSize: '1rem',
              color: 'var(--color-primary)',
              marginBottom: 2,
              fontFamily: 'var(--font-outfit)',
            }}
          >
            Navé Analyste IA
          </h3>
          <p style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)', lineHeight: 1.4 }}>
            Analyse Grok basée sur les stats NavéStats · {equipeANom} vs {equipeBNom}
            <br />
            <em>Estimation informative — pas une certitude.</em>
          </p>
        </div>
      </div>

      {!analysis && !loading && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <button
            type="button"
            onClick={() => run()}
            style={{
              border: 'none',
              borderRadius: 14,
              padding: '14px 18px',
              background: 'linear-gradient(135deg, #006233, #00A651)',
              color: 'white',
              fontWeight: 800,
              fontSize: '0.95rem',
              cursor: 'pointer',
              boxShadow: '0 8px 20px rgba(0,98,51,0.25)',
            }}
          >
            ⚽ {ctaLabel}
          </button>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {QUICK_Q.map((q) => (
              <button
                key={q}
                type="button"
                onClick={() => run(q)}
                style={{
                  border: '1px solid var(--color-border)',
                  background: 'var(--color-surface)',
                  borderRadius: 999,
                  padding: '7px 12px',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  color: 'var(--color-text-secondary)',
                  cursor: 'pointer',
                }}
              >
                {q}
              </button>
            ))}
          </div>
        </div>
      )}

      {loading && (
        <div
          style={{
            padding: '20px 12px',
            textAlign: 'center',
            color: 'var(--color-text-secondary)',
            fontSize: '0.9rem',
          }}
        >
          <div style={{ fontSize: '1.6rem', marginBottom: 8 }}>⚡</div>
          Navé Analyste regarde les stats…
        </div>
      )}

      {error && (
        <div
          style={{
            marginTop: 8,
            padding: '12px 14px',
            borderRadius: 12,
            background: 'rgba(232,0,45,0.07)',
            border: '1px solid rgba(232,0,45,0.2)',
            color: 'var(--color-red)',
            fontSize: '0.85rem',
            fontWeight: 600,
          }}
        >
          {error}
          {error.toLowerCase().includes('xai_api_key') && (
            <span style={{ display: 'block', marginTop: 6, fontWeight: 500, fontSize: '0.78rem' }}>
              Configure XAI_API_KEY dans .env.local pour activer l’IA.
            </span>
          )}
        </div>
      )}

      {analysis && !loading && (
        <div>
          <div
            style={{
              whiteSpace: 'pre-wrap',
              fontSize: '0.9rem',
              lineHeight: 1.6,
              color: 'var(--color-text-primary)',
              background: 'var(--color-surface)',
              borderRadius: 14,
              padding: 16,
              border: '1px solid var(--color-border)',
            }}
          >
            {analysis}
          </div>

          <div style={{ marginTop: 14, display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {QUICK_Q.map((q) => (
                <button
                  key={q}
                  type="button"
                  onClick={() => run(q)}
                  style={{
                    border: '1px solid var(--color-border)',
                    background: 'var(--color-surface-card)',
                    borderRadius: 999,
                    padding: '6px 11px',
                    fontSize: '0.72rem',
                    fontWeight: 600,
                    color: 'var(--color-text-secondary)',
                    cursor: 'pointer',
                  }}
                >
                  {q}
                </button>
              ))}
            </div>

            <div style={{ display: 'flex', gap: 8 }}>
              <input
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && question.trim()) run(question)
                }}
                placeholder="Pose une question sur ce match…"
                maxLength={500}
                style={{
                  flex: 1,
                  border: '1px solid var(--color-border)',
                  borderRadius: 12,
                  padding: '10px 12px',
                  fontSize: '0.85rem',
                  outline: 'none',
                  background: 'var(--color-surface)',
                  color: 'var(--color-text-primary)',
                }}
              />
              <button
                type="button"
                disabled={!question.trim()}
                onClick={() => run(question)}
                style={{
                  border: 'none',
                  borderRadius: 12,
                  padding: '10px 14px',
                  background: question.trim()
                    ? 'linear-gradient(135deg, #006233, #00A651)'
                    : 'var(--color-border)',
                  color: 'white',
                  fontWeight: 800,
                  fontSize: '0.8rem',
                  cursor: question.trim() ? 'pointer' : 'not-allowed',
                }}
              >
                Demander
              </button>
            </div>

            <button
              type="button"
              onClick={() => run()}
              style={{
                alignSelf: 'flex-start',
                border: '1px solid var(--color-border)',
                background: 'transparent',
                borderRadius: 10,
                padding: '8px 12px',
                fontSize: '0.78rem',
                fontWeight: 700,
                color: 'var(--color-primary)',
                cursor: 'pointer',
              }}
            >
              ↻ Relancer l’analyse complète
            </button>
          </div>
        </div>
      )}

    </div>
  )
}
