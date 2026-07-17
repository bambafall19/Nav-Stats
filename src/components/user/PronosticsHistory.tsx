'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export function PronosticsHistory({ userId }: { userId: string }) {
  const [pronostics, setPronostics] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'correct' | 'incorrect'>('all')
  const supabase = createClient() as any

  useEffect(() => {
    const fetchPronostics = async () => {
      try {
        const { data } = await supabase
          .from('pronostics')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false })

        setPronostics(data || [])
      } catch (error) {
        console.error('Error fetching pronostics:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchPronostics()
  }, [userId])

  const filteredPronostics = pronostics.filter(p => {
    if (filter === 'correct') return p.is_correct
    if (filter === 'incorrect') return !p.is_correct
    return true
  })

  const stats = {
    total: pronostics.length,
    correct: pronostics.filter(p => p.is_correct).length,
    incorrect: pronostics.filter(p => !p.is_correct).length,
    successRate: pronostics.length > 0 ? Math.round((pronostics.filter(p => p.is_correct).length / pronostics.length) * 100) : 0,
  }

  if (loading) {
    return <div style={{ padding: 20, textAlign: 'center' }}>Chargement...</div>
  }

  return (
    <div style={{ padding: 'clamp(16px, 3vw, 24px)' }}>
      <h1 style={{ fontFamily: 'var(--font-outfit)', fontWeight: 900, fontSize: 'clamp(1.3rem, 4vw, 1.8rem)', marginBottom: 24 }}>
        📋 Historique des Pronostics
      </h1>

      {/* Stats */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
        gap: 'clamp(12px, 2vw, 16px)',
        marginBottom: 'clamp(24px, 5vw, 32px)',
      }}>
        <div style={{
          background: 'var(--color-surface-card)',
          border: '1px solid var(--color-border)',
          borderRadius: 'clamp(12px, 3vw, 16px)',
          padding: 'clamp(12px, 2vw, 16px)',
          textAlign: 'center',
        }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginBottom: 4 }}>Total</div>
          <div style={{ fontFamily: 'var(--font-outfit)', fontWeight: 900, fontSize: 'clamp(0.9rem, 2vw, 1.1rem)', color: 'var(--color-primary)' }}>
            {stats.total}
          </div>
        </div>
        <div style={{
          background: 'var(--color-surface-card)',
          border: '1px solid var(--color-border)',
          borderRadius: 'clamp(12px, 3vw, 16px)',
          padding: 'clamp(12px, 2vw, 16px)',
          textAlign: 'center',
        }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginBottom: 4 }}>Réussis</div>
          <div style={{ fontFamily: 'var(--font-outfit)', fontWeight: 900, fontSize: 'clamp(0.9rem, 2vw, 1.1rem)', color: '#10b981' }}>
            {stats.correct}
          </div>
        </div>
        <div style={{
          background: 'var(--color-surface-card)',
          border: '1px solid var(--color-border)',
          borderRadius: 'clamp(12px, 3vw, 16px)',
          padding: 'clamp(12px, 2vw, 16px)',
          textAlign: 'center',
        }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginBottom: 4 }}>Échoués</div>
          <div style={{ fontFamily: 'var(--font-outfit)', fontWeight: 900, fontSize: 'clamp(0.9rem, 2vw, 1.1rem)', color: '#ef4444' }}>
            {stats.incorrect}
          </div>
        </div>
        <div style={{
          background: 'var(--color-surface-card)',
          border: '1px solid var(--color-border)',
          borderRadius: 'clamp(12px, 3vw, 16px)',
          padding: 'clamp(12px, 2vw, 16px)',
          textAlign: 'center',
        }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginBottom: 4 }}>Taux</div>
          <div style={{ fontFamily: 'var(--font-outfit)', fontWeight: 900, fontSize: 'clamp(0.9rem, 2vw, 1.1rem)', color: 'var(--color-primary)' }}>
            {stats.successRate}%
          </div>
        </div>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 'clamp(16px, 3vw, 20px)', flexWrap: 'wrap' }}>
        {(['all', 'correct', 'incorrect'] as const).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            style={{
              padding: '8px 12px',
              borderRadius: 'var(--radius-full)',
              border: '1px solid var(--color-border)',
              background: filter === f ? 'var(--color-primary)' : 'var(--color-surface-card)',
              color: filter === f ? 'white' : 'var(--color-text-primary)',
              cursor: 'pointer',
              fontSize: '0.8rem',
              fontWeight: 600,
              transition: 'all 0.2s',
            }}
          >
            {f === 'all' ? '📊 Tous' : f === 'correct' ? '✓ Réussis' : '✗ Échoués'}
          </button>
        ))}
      </div>

      {/* List */}
      <div style={{ background: 'var(--color-surface-card)', border: '1px solid var(--color-border)', borderRadius: 'clamp(12px, 3vw, 16px)', overflow: 'hidden' }}>
        {filteredPronostics.length > 0 ? (
          filteredPronostics.map((p, idx) => (
            <div key={p.id} style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: 'clamp(12px, 2vw, 16px)',
              borderBottom: idx < filteredPronostics.length - 1 ? '1px solid var(--color-border)' : 'none',
              flexWrap: 'wrap',
              gap: 12,
            }}>
              <div style={{ flex: 1, minWidth: 200 }}>
                <div style={{ fontWeight: 600, fontSize: '0.95rem', marginBottom: 4 }}>
                  {p.equipe1} vs {p.equipe2}
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
                  {new Date(p.created_at).toLocaleDateString('fr-FR')}
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: 2 }}>
                    {p.pronostic_1} - {p.pronostic_2}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                    Résultat: {p.score_1} - {p.score_2}
                  </div>
                </div>

                <div style={{
                  width: 40,
                  height: 40,
                  borderRadius: '50%',
                  background: p.is_correct ? '#10b981' : '#ef4444',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontWeight: 700,
                  fontSize: '1.2rem',
                }}>
                  {p.is_correct ? '✓' : '✗'}
                </div>

                <div style={{ textAlign: 'right', minWidth: 50 }}>
                  <div style={{ fontFamily: 'var(--font-outfit)', fontWeight: 900, fontSize: '1rem', color: p.is_correct ? '#10b981' : '#ef4444' }}>
                    {p.points_earned || 0}
                  </div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)' }}>
                    pts
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div style={{ padding: 40, textAlign: 'center', color: 'var(--color-text-muted)' }}>
            Aucun pronostic
          </div>
        )}
      </div>
    </div>
  )
}
