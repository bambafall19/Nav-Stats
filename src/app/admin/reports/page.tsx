'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useSearchParams } from 'next/navigation'

interface MatchReport {
  id: string
  match_id: string
  reported_by: string | null
  reason: string
  new_date_match: string | null
  new_heure_match: string | null
  statut: 'pending' | 'approved' | 'rejected'
  resolved_by: string | null
  resolution: string | null
  created_at: string
  updated_at: string
  reporter?: { username: string | null } | null
  resolver?: { username: string | null } | null
  match?: { id: string; date_match: string; heure_match: string; stade: string; statut: string; equipe_a?: { nom: string; sigle: string | null } | null; equipe_b?: { nom: string; sigle: string | null } | null } | null
}

const TABS = [
  { key: 'pending', label: 'En attente' },
  { key: 'approved', label: 'Approuvés' },
  { key: 'rejected', label: 'Rejetés' },
] as const

const STATUS_STYLE: Record<string, { label: string; color: string; bg: string }> = {
  pending: { label: 'En attente', color: '#B45309', bg: 'rgba(180,83,9,0.12)' },
  approved: { label: 'Approuvé', color: '#0dca6b', bg: 'rgba(42,255,160,0.1)' },
  rejected: { label: 'Rejeté', color: '#E53E3E', bg: 'rgba(229,62,62,0.1)' },
}

function parseScore(reason: string): string | null {
  const m = reason.match(/(\d+)\s*[-–—:]\s*(\d+)/)
  if (!m) return null
  return `${m[1]} - ${m[2]}`
}

export default function AdminReportsPage() {
  const supabase = createClient() as any
  const searchParams = useSearchParams()
  const [tab, setTab] = useState<string>(searchParams.get('tab') || 'pending')
  const [reports, setReports] = useState<MatchReport[]>([])
  const [loading, setLoading] = useState(true)
  const [busyId, setBusyId] = useState<string | null>(null)
  const [resolution, setResolution] = useState<Record<string, string>>({})
  const [adminId, setAdminId] = useState<string | null>(null)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const fetchReports = useCallback(async () => {
    setLoading(true)
    const { data } = await supabase
      .from('match_reports')
      .select('*, reporter:profiles!match_reports_reported_by_fkey(username), resolver:profiles!match_reports_resolved_by_fkey(username), match:matchs(equipe_a:equipes!matchs_equipe_a_id_fkey(nom,sigle), equipe_b:equipes!matchs_equipe_b_id_fkey(nom,sigle))')
      .order('created_at', { ascending: false })
      .limit(100)
    setReports((data || []) as MatchReport[])
    setLoading(false)
  }, [supabase])

  useEffect(() => {
    fetchReports()
    supabase.auth.getUser().then(({ data }: { data: { user: { id: string } | null } | null }) => setAdminId(data?.user?.id || null))
  }, [fetchReports, supabase])

  const handleResolve = async (report: MatchReport, statut: 'approved' | 'rejected') => {
    setBusyId(report.id)
    setMessage(null)
    const note = resolution[report.id]?.trim() || null

    const { error } = await supabase
      .from('match_reports')
      .update({ statut, resolved_by: adminId, resolution: note, updated_at: new Date().toISOString() })
      .eq('id', report.id)

    if (error) {
      setMessage({ type: 'error', text: error.message })
      setBusyId(null)
      return
    }

    // Si approbation sans changement de date, le déclencheur ne notifie pas :
    // on notifie manuellement les pronostiqueurs du match.
    if (statut === 'approved' && !report.new_date_match) {
      const { data: pronos } = await supabase.from('pronostics').select('user_id').eq('match_id', report.match_id)
      const userIds: string[] = [...new Set<string>((pronos || []).map((p: any) => String(p.user_id)))]
      if (userIds.length > 0) {
        const name = `${report.match?.equipe_a?.nom || 'Equipe A'} vs ${report.match?.equipe_b?.nom || 'Equipe B'}`
        await supabase.from('notifications').insert(
          userIds.map((uid: string) => ({
            user_id: uid,
            titre: '✅ Résultat corrigé',
            message: `Le résultat du match ${name} a été corrigé. Merci pour ta vigilance !`,
            type: 'match',
            lien: `/matchs/${report.match_id}`,
          }))
        )
      }
    }

    setMessage({
      type: 'success',
      text: statut === 'approved' ? 'Report approuvé. Le match a été mis à jour.' : 'Report rejeté.',
    })
    setBusyId(null)
    fetchReports()
  }

  const filtered = reports.filter(r => r.statut === tab)

  return (
    <div style={{ display: 'grid', gap: 20 }}>
      <div>
        <h1 style={{ fontFamily: 'var(--font-plus-jakarta)', fontSize: '1.6rem', fontWeight: 900, color: 'var(--color-text-primary)', margin: 0 }}>
          Reports de matchs
        </h1>
        <p style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem', marginTop: 4 }}>
          Modération des signalements de scores, dates et lieux incorrects.
        </p>
      </div>

      {message && (
        <div style={{
          padding: '12px 16px', borderRadius: 12,
          background: message.type === 'success' ? 'rgba(42,255,160,0.1)' : 'rgba(229,62,62,0.1)',
          color: message.type === 'success' ? '#0dca6b' : '#E53E3E',
          fontSize: '0.85rem', fontWeight: 600,
          border: `1px solid ${message.type === 'success' ? 'rgba(42,255,160,0.25)' : 'rgba(229,62,62,0.25)'}`,
        }}>
          {message.text}
        </div>
      )}

      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {TABS.map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            style={{
              padding: '8px 16px', borderRadius: 999, cursor: 'pointer',
              fontFamily: 'var(--font-plus-jakarta)', fontWeight: 800, fontSize: '0.8rem',
              background: tab === t.key ? 'var(--color-primary)' : 'var(--color-surface)',
              color: tab === t.key ? '#fff' : 'var(--color-text-secondary)',
              border: `1px solid ${tab === t.key ? 'transparent' : 'var(--color-border)'}`,
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div style={{ display: 'grid', gap: 12 }}>
        {loading ? (
          <div style={{ padding: 28, textAlign: 'center', color: 'var(--color-text-muted)' }}>Chargement…</div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: 28, textAlign: 'center', color: 'var(--color-text-muted)', background: 'var(--color-surface-card)', border: '1px solid var(--color-border)', borderRadius: 16 }}>
            Aucun report dans cette catégorie ✅
          </div>
        ) : filtered.map(report => {
          const st = STATUS_STYLE[report.statut]
          const name = `${report.match?.equipe_a?.nom || 'Equipe A'} vs ${report.match?.equipe_b?.nom || 'Equipe B'}`
          const detectedScore = parseScore(report.reason)
          return (
            <div key={report.id} style={{
              background: 'var(--color-surface-card)', border: '1px solid var(--color-border)',
              borderRadius: 16, padding: 18, display: 'grid', gap: 12,
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'flex-start', flexWrap: 'wrap' }}>
                <div>
                  <div style={{ fontWeight: 850, color: 'var(--color-text-primary)', fontSize: '0.98rem', fontFamily: 'var(--font-plus-jakarta)' }}>
                    {name}
                  </div>
                  <div style={{ color: 'var(--color-text-muted)', fontSize: '0.78rem', marginTop: 2 }}>
                    {report.match ? (
                      <>
                        📅 {new Date(report.match.date_match).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })} · {report.match.heure_match?.slice(0, 5)} · {report.match.stade}
                      </>
                    ) : 'Match supprimé'}
                  </div>
                  {report.new_date_match && (
                    <div style={{ marginTop: 6, display: 'inline-flex', gap: 6, alignItems: 'center', padding: '5px 10px', borderRadius: 999, background: 'rgba(29,78,216,0.1)', color: '#1D4ED8', fontSize: '0.76rem', fontWeight: 700 }}>
                      📆 Reporté au {new Date(report.new_date_match).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })}
                      {report.new_heure_match ? ` à ${report.new_heure_match.slice(0, 5)}` : ''}
                    </div>
                  )}
                </div>
                <span style={{ padding: '4px 12px', borderRadius: 999, fontSize: '0.72rem', fontWeight: 800, color: st.color, background: st.bg }}>
                  {st.label}
                </span>
              </div>

              <div style={{ display: 'grid', gap: 6, fontSize: '0.83rem' }}>
                <div style={{ color: 'var(--color-text-secondary)' }}>
                  <strong style={{ color: 'var(--color-text-primary)' }}>Signalé par :</strong> {report.reporter?.username || 'Utilisateur inconnu'}
                  {' '}· {new Date(report.created_at).toLocaleString('fr-FR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                </div>
                <div style={{
                  padding: '10px 14px', borderRadius: 12, background: 'var(--color-surface)',
                  border: '1px solid var(--color-border)', color: 'var(--color-text-primary)', lineHeight: 1.5,
                }}>
                  💬 {report.reason}
                </div>
                {detectedScore && (
                  <div style={{ fontSize: '0.76rem', color: 'var(--color-text-muted)' }}>
                    Score détecté dans le signalement : <strong style={{ color: 'var(--color-primary)' }}>{detectedScore}</strong>
                  </div>
                )}
                {report.resolution && (
                  <div style={{ fontSize: '0.78rem', color: 'var(--color-text-secondary)' }}>
                    <strong>Note de modération :</strong> {report.resolution}
                  </div>
                )}
                {report.resolver && (
                  <div style={{ fontSize: '0.76rem', color: 'var(--color-text-muted)' }}>
                    Traité par {report.resolver.username}
                  </div>
                )}
              </div>

              {report.statut === 'pending' && (
                <div style={{ display: 'grid', gap: 10 }}>
                  <input
                    placeholder="Note de modération (facultatif)…"
                    value={resolution[report.id] || ''}
                    onChange={e => setResolution(prev => ({ ...prev, [report.id]: e.target.value }))}
                    style={{
                      padding: '10px 14px', borderRadius: 12, border: '1px solid var(--color-border)',
                      background: 'var(--color-surface)', color: 'var(--color-text-primary)', fontSize: '0.83rem',
                    }}
                  />
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    <button
                      onClick={() => handleResolve(report, 'approved')}
                      disabled={busyId === report.id}
                      style={{
                        padding: '9px 16px', borderRadius: 10, cursor: 'pointer', border: 'none',
                        background: 'linear-gradient(135deg, #0dca6b, #00883f)', color: '#fff',
                        fontWeight: 800, fontSize: '0.8rem', fontFamily: 'var(--font-plus-jakarta)',
                        opacity: busyId === report.id ? 0.6 : 1,
                      }}
                    >
                      ✅ Approuver
                    </button>
                    <button
                      onClick={() => handleResolve(report, 'rejected')}
                      disabled={busyId === report.id}
                      style={{
                        padding: '9px 16px', borderRadius: 10, cursor: 'pointer', border: 'none',
                        background: 'rgba(229,62,62,0.12)', color: '#E53E3E',
                        fontWeight: 800, fontSize: '0.8rem', fontFamily: 'var(--font-plus-jakarta)',
                        opacity: busyId === report.id ? 0.6 : 1,
                      }}
                    >
                      ✖ Rejeter
                    </button>
                    <a
                      href={`/admin/resultats?match=${report.match_id}`}
                      style={{
                        padding: '9px 16px', borderRadius: 10, textDecoration: 'none',
                        background: 'rgba(29,78,216,0.1)', color: '#1D4ED8',
                        fontWeight: 800, fontSize: '0.8rem', fontFamily: 'var(--font-plus-jakarta)',
                        display: 'inline-flex', alignItems: 'center',
                      }}
                    >
                      Saisir le score →
                    </a>
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
