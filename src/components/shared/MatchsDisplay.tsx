'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

interface Match {
  id: string
  equipe1: string
  equipe2: string
  date: string
  heure: string
  statut: 'planifie' | 'en_cours' | 'termine'
  score1?: number
  score2?: number
}

export function MatchsDisplay() {
  const [matchs, setMatchs] = useState<Match[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient() as any

  useEffect(() => {
    fetchMatchs()
    const interval = setInterval(fetchMatchs, 30000) // Refresh every 30 seconds
    return () => clearInterval(interval)
  }, [])

  const fetchMatchs = async () => {
    try {
      const { data } = await supabase
        .from('matchs')
        .select('*')
        .order('date', { ascending: true })
        .order('heure', { ascending: true })

      setMatchs(data || [])
    } catch (error) {
      console.error('Error fetching matchs:', error)
    } finally {
      setLoading(false)
    }
  }

  const groupedMatchs = matchs.reduce((acc: any, match) => {
    const key = `${match.date}-${match.heure}`
    if (!acc[key]) {
      acc[key] = []
    }
    acc[key].push(match)
    return acc
  }, {})

  const getStatusColor = (statut: string) => {
    switch (statut) {
      case 'planifie':
        return '#3B82F6'
      case 'en_cours':
        return '#10B981'
      case 'termine':
        return '#6B7280'
      default:
        return '#9CA3AF'
    }
  }

  const getStatusLabel = (statut: string) => {
    switch (statut) {
      case 'planifie':
        return 'Planifié'
      case 'en_cours':
        return 'En cours'
      case 'termine':
        return 'Terminé'
      default:
        return statut
    }
  }

  if (loading) {
    return <div style={{ padding: 20, textAlign: 'center' }}>Chargement...</div>
  }

  return (
    <div style={{ padding: 'clamp(16px, 3vw, 24px)' }}>
      <h1 style={{ fontFamily: 'var(--font-outfit)', fontWeight: 900, fontSize: 'clamp(1.3rem, 4vw, 1.8rem)', marginBottom: 24 }}>
        ⚽ Matchs du Jour
      </h1>

      {Object.entries(groupedMatchs).length > 0 ? (
        <div style={{ display: 'grid', gap: 'clamp(24px, 5vw, 32px)' }}>
          {Object.entries(groupedMatchs).map(([timeSlot, matchList]: any) => {
            const [date, time] = timeSlot.split('-')
            const timeLabel = time === '15:00' ? '🕐 Première heure (15h)' : time === '16:00' ? '🕑 Deuxième heure (16h)' : `Heure: ${time}`

            return (
              <div key={timeSlot}>
                <h2 style={{
                  fontFamily: 'var(--font-outfit)',
                  fontWeight: 800,
                  fontSize: 'clamp(0.95rem, 3vw, 1.1rem)',
                  marginBottom: 12,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                }}>
                  {timeLabel}
                  <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', fontWeight: 400 }}>
                    ({new Date(date).toLocaleDateString('fr-FR')})
                  </span>
                </h2>

                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                  gap: 'clamp(12px, 2vw, 16px)',
                }}>
                  {matchList.map((match: Match) => (
                    <div
                      key={match.id}
                      style={{
                        background: 'var(--color-surface-card)',
                        border: `2px solid ${getStatusColor(match.statut)}`,
                        borderRadius: 'clamp(12px, 3vw, 16px)',
                        padding: 'clamp(16px, 3vw, 20px)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 12,
                      }}
                    >
                      {/* Status Badge */}
                      <div style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 6,
                        width: 'fit-content',
                        background: getStatusColor(match.statut),
                        color: 'white',
                        padding: '4px 10px',
                        borderRadius: 'var(--radius-full)',
                        fontSize: '0.7rem',
                        fontWeight: 700,
                      }}>
                        <span style={{
                          width: 6,
                          height: 6,
                          borderRadius: '50%',
                          background: 'white',
                          animation: match.statut === 'en_cours' ? 'pulse 1s infinite' : 'none',
                        }} />
                        {getStatusLabel(match.statut)}
                      </div>

                      {/* Teams */}
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: 12,
                      }}>
                        <div style={{ flex: 1, textAlign: 'center' }}>
                          <div style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: 4 }}>
                            {match.equipe1}
                          </div>
                          {match.statut === 'termine' && (
                            <div style={{
                              fontFamily: 'var(--font-outfit)',
                              fontWeight: 900,
                              fontSize: '1.3rem',
                              color: 'var(--color-primary)',
                            }}>
                              {match.score1}
                            </div>
                          )}
                        </div>

                        <div style={{
                          fontSize: '1.2rem',
                          fontWeight: 700,
                          color: 'var(--color-text-muted)',
                        }}>
                          vs
                        </div>

                        <div style={{ flex: 1, textAlign: 'center' }}>
                          <div style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: 4 }}>
                            {match.equipe2}
                          </div>
                          {match.statut === 'termine' && (
                            <div style={{
                              fontFamily: 'var(--font-outfit)',
                              fontWeight: 900,
                              fontSize: '1.3rem',
                              color: 'var(--color-primary)',
                            }}>
                              {match.score2}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Time */}
                      <div style={{
                        textAlign: 'center',
                        fontSize: '0.85rem',
                        color: 'var(--color-text-muted)',
                        paddingTop: 8,
                        borderTop: '1px solid var(--color-border)',
                      }}>
                        🕐 {match.heure}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <div style={{
          background: 'var(--color-surface-card)',
          border: '1px solid var(--color-border)',
          borderRadius: 'clamp(12px, 3vw, 16px)',
          padding: 'clamp(32px, 5vw, 48px)',
          textAlign: 'center',
          color: 'var(--color-text-muted)',
        }}>
          <div style={{ fontSize: '2rem', marginBottom: 12 }}>⚽</div>
          <div style={{ fontSize: '0.95rem' }}>Aucun match prévu</div>
        </div>
      )}
    </div>
  )
}
