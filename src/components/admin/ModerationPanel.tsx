'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useToast } from '@/components/shared/Toast'

export default function ModerationPanel() {
  const [reports, setReports] = useState<any[]>([])
  const [violations, setViolations] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'pending' | 'resolved' | 'all'>('pending')
  const supabase = createClient() as any
  const { addToast } = useToast()

  useEffect(() => {
    fetchReports()
  }, [filter])

  const fetchReports = async () => {
    try {
      let query = supabase.from('reports').select('*')

      if (filter === 'pending') {
        query = query.eq('status', 'pending')
      } else if (filter === 'resolved') {
        query = query.eq('status', 'resolved')
      }

      const { data } = await query.order('created_at', { ascending: false })
      setReports(data || [])
    } catch (error) {
      addToast('Erreur', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleResolveReport = async (reportId: string, action: 'dismiss' | 'ban' | 'warn') => {
    try {
      await supabase
        .from('reports')
        .update({ status: 'resolved', action })
        .eq('id', reportId)

      addToast(`Rapport ${action === 'dismiss' ? 'rejeté' : action === 'ban' ? 'utilisateur banni' : 'avertissement envoyé'}`, 'success')
      fetchReports()
    } catch (error) {
      addToast('Erreur', 'error')
    }
  }

  const handleBanUser = async (userId: string) => {
    try {
      await supabase
        .from('profiles')
        .update({ is_banned: true })
        .eq('id', userId)

      addToast('Utilisateur banni', 'success')
      fetchReports()
    } catch (error) {
      addToast('Erreur', 'error')
    }
  }

  if (loading) {
    return <div style={{ padding: 20, textAlign: 'center' }}>Chargement...</div>
  }

  return (
    <div style={{ padding: 'clamp(16px, 3vw, 24px)' }}>
      <h1 style={{ fontFamily: 'var(--font-outfit)', fontWeight: 900, fontSize: 'clamp(1.3rem, 4vw, 1.8rem)', marginBottom: 24 }}>
        🛡️ Modération
      </h1>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 24, flexWrap: 'wrap' }}>
        {(['pending', 'resolved', 'all'] as const).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            style={{
              padding: '8px 14px',
              borderRadius: 'var(--radius-full)',
              border: '1px solid var(--color-border)',
              background: filter === f ? 'var(--color-primary)' : 'var(--color-surface-card)',
              color: filter === f ? 'white' : 'var(--color-text-primary)',
              cursor: 'pointer',
              fontSize: '0.85rem',
              fontWeight: 600,
            }}
          >
            {f === 'pending' ? '⏳ En attente' : f === 'resolved' ? '✓ Résolus' : '📊 Tous'}
          </button>
        ))}
      </div>

      {/* Reports List */}
      {reports.length > 0 ? (
        <div style={{ display: 'grid', gap: 'clamp(12px, 2vw, 16px)' }}>
          {reports.map(report => (
            <div
              key={report.id}
              style={{
                background: 'var(--color-surface-card)',
                border: `2px solid ${report.status === 'pending' ? '#f59e0b' : '#10b981'}`,
                borderRadius: 'var(--radius-lg)',
                padding: 'clamp(12px, 2vw, 16px)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: 12 }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: 4 }}>
                    {report.reason}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginBottom: 8 }}>
                    Signalé par: {report.reporter_id}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
                    Utilisateur: {report.reported_user_id}
                  </div>
                </div>
                <div style={{
                  background: report.status === 'pending' ? '#fef3c7' : '#d1fae5',
                  color: report.status === 'pending' ? '#92400e' : '#065f46',
                  padding: '4px 10px',
                  borderRadius: 'var(--radius-full)',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                }}>
                  {report.status === 'pending' ? '⏳ En attente' : '✓ Résolu'}
                </div>
              </div>

              <div style={{ fontSize: '0.85rem', background: 'rgba(0,0,0,0.05)', padding: 12, borderRadius: 'var(--radius-md)', marginBottom: 12 }}>
                <strong>Description:</strong> {report.description}
              </div>

              {report.status === 'pending' && (
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  <button
                    onClick={() => handleResolveReport(report.id, 'dismiss')}
                    style={{
                      padding: '8px 12px',
                      background: '#6B7280',
                      color: 'white',
                      border: 'none',
                      borderRadius: 'var(--radius-md)',
                      cursor: 'pointer',
                      fontSize: '0.8rem',
                      fontWeight: 600,
                    }}
                  >
                    ✕ Rejeter
                  </button>
                  <button
                    onClick={() => handleResolveReport(report.id, 'warn')}
                    style={{
                      padding: '8px 12px',
                      background: '#f59e0b',
                      color: 'white',
                      border: 'none',
                      borderRadius: 'var(--radius-md)',
                      cursor: 'pointer',
                      fontSize: '0.8rem',
                      fontWeight: 600,
                    }}
                  >
                    ⚠️ Avertir
                  </button>
                  <button
                    onClick={() => {
                      handleBanUser(report.reported_user_id)
                      handleResolveReport(report.id, 'ban')
                    }}
                    style={{
                      padding: '8px 12px',
                      background: 'var(--color-red)',
                      color: 'white',
                      border: 'none',
                      borderRadius: 'var(--radius-md)',
                      cursor: 'pointer',
                      fontSize: '0.8rem',
                      fontWeight: 600,
                    }}
                  >
                    🚫 Bannir
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div style={{
          background: 'var(--color-surface-card)',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-lg)',
          padding: 'clamp(24px, 5vw, 32px)',
          textAlign: 'center',
          color: 'var(--color-text-muted)',
        }}>
          <div style={{ fontSize: '2rem', marginBottom: 12 }}>✓</div>
          <div>Aucun rapport</div>
        </div>
      )}
    </div>
  )
}
