'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { CadetMatch, CadetEquipe } from '@/lib/cadets'

type CadetMatchWithTeams = CadetMatch & {
  equipe_a_info?: CadetEquipe | null
  equipe_b_info?: CadetEquipe | null
}

export default function AdminResultatsCadets() {
  const supabase = createClient() as any
  const [matchs, setMatchs] = useState<CadetMatchWithTeams[]>([])
  const [selected, setSelected] = useState<CadetMatchWithTeams | null>(null)
  const [scoreA, setScoreA] = useState('')
  const [scoreB, setScoreB] = useState('')
  const [forfaitSide, setForfaitSide] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState('')
  const [tab, setTab] = useState<'attente' | 'valides'>('attente')
  const [liveScores, setLiveScores] = useState<Record<string, { a: number; b: number }>>({})
  const [savingId, setSavingId] = useState<string | null>(null)

  const loadMatchs = () =>
    supabase
      .from('cadet_matchs')
      .select(`
        id, journee, date_match, poule, terrain, ordre, equipe_a_id, equipe_b_id,
        equipe_a, equipe_b, score_a, score_b, statut, forfait,
        equipe_a_info:equipes!cadet_matchs_equipe_a_id_fkey(id, nom, sigle, couleur_principale),
        equipe_b_info:equipes!cadet_matchs_equipe_b_id_fkey(id, nom, sigle, couleur_principale)
      `)
      .order('journee')
      .order('date_match')
      .order('ordre')
      .then((res: { data: CadetMatchWithTeams[] | null }) => {
        const data = res.data || []
        setMatchs(data)

        setLiveScores(prev => {
          const next = { ...prev }
          data.forEach((m: CadetMatchWithTeams) => {
            if (m.statut === 'en_cours') {
              next[m.id!] = { a: m.score_a ?? 0, b: m.score_b ?? 0 }
            }
          })
          return next
        })

        const id = new URLSearchParams(window.location.search).get('match')
        if (id) {
          const m = data.find((x: CadetMatchWithTeams) => x.id === id)
          if (m) {
            setSelected(m)
            setScoreA(m.score_a != null ? String(m.score_a) : '')
            setScoreB(m.score_b != null ? String(m.score_b) : '')
            setForfaitSide(m.forfait || '')
          }
          const url = new URL(window.location.href)
          url.searchParams.delete('match')
          window.history.replaceState({}, '', url.toString())
        }
      })

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { loadMatchs() }, [])

  const pending = matchs.filter(m => m.statut !== 'termine' || (!m.forfait && (m.score_a === null || m.score_b === null)))
  const valides = matchs.filter(m => m.statut === 'termine' && (m.forfait || (m.score_a !== null && m.score_b !== null)))
  const liveMatchs = matchs.filter(m => m.statut === 'en_cours')

  const teamName = (m: CadetMatchWithTeams, side: 'a' | 'b') => {
    const info = side === 'a' ? m.equipe_a_info : m.equipe_b_info
    const raw = side === 'a' ? m.equipe_a : m.equipe_b
    return info?.nom || raw
  }

  async function finalizeMatch(m: CadetMatchWithTeams, scoreAInt: number, scoreBInt: number, forfait: string = '') {
    const isForfait = !!forfait
    const { error } = await supabase
      .from('cadet_matchs')
      .update({
        statut: 'termine',
        forfait: isForfait ? forfait : null,
        score_a: isForfait ? null : scoreAInt,
        score_b: isForfait ? null : scoreBInt,
      })
      .eq('id', m.id)

    if (!error) {
      return isForfait
        ? `Résultat cadet validé : Forfait — ${teamName(m, forfait === 'a' ? 'a' : 'b')}`
        : `Résultat cadet validé : ${teamName(m, 'a')} ${scoreAInt} – ${scoreBInt} ${teamName(m, 'b')}`
    }
    return null
  }

  async function handleValidate() {
    if (!selected) return
    setLoading(true)
    const scoreAInt = parseInt(scoreA) || 0
    const scoreBInt = parseInt(scoreB) || 0

    const msg = await finalizeMatch(selected, scoreAInt, scoreBInt, forfaitSide)
    if (msg) {
      setSuccess(msg)
      setSelected(null); setScoreA(''); setScoreB(''); setForfaitSide('')
      await loadMatchs()
    }
    setLoading(false)
  }

  const stepLive = (m: CadetMatchWithTeams, team: 'a' | 'b', delta: number) => {
    setLiveScores(prev => {
      const cur = prev[m.id!] || { a: m.score_a ?? 0, b: m.score_b ?? 0 }
      const next = { ...prev, [m.id!]: { ...cur } }
      next[m.id!][team] = Math.max(0, cur[team] + delta)
      return next
    })
  }

  async function saveLiveScore(m: CadetMatchWithTeams) {
    const s = liveScores[m.id!]
    if (!s) return
    setSavingId(m.id!)
    const { error } = await supabase
      .from('cadet_matchs')
      .update({ score_a: s.a, score_b: s.b })
      .eq('id', m.id)
    if (!error) {
      setSuccess(`Score en direct mis à jour : ${teamName(m, 'a')} ${s.a} – ${s.b} ${teamName(m, 'b')}`)
    }
    setSavingId(null)
  }

  async function finishLive(m: CadetMatchWithTeams) {
    const s = liveScores[m.id!] || { a: m.score_a ?? 0, b: m.score_b ?? 0 }
    setSavingId(m.id!)
    const msg = await finalizeMatch(m, s.a, s.b)
    if (msg) {
      setSuccess(msg)
      setLiveScores(prev => { const next = { ...prev }; delete next[m.id!]; return next })
      await loadMatchs()
    }
    setSavingId(null)
  }

  const selectMatch = (m: CadetMatchWithTeams) => {
    setSelected(m)
    setScoreA(m.score_a != null ? String(m.score_a) : '')
    setScoreB(m.score_b != null ? String(m.score_b) : '')
    setForfaitSide(m.forfait || '')
  }

  const renderRow = (m: CadetMatchWithTeams, i: number, isPending: boolean) => (
    <div key={m.id || `${m.journee}-${m.date_match}-${m.equipe_a}-${m.equipe_b}`}
      style={{
        padding: '16px 20px',
        borderBottom: i < (isPending ? pending : valides).length - 1 ? '1px solid var(--color-border)' : 'none',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        cursor: 'pointer',
        background: selected?.id === m.id ? 'rgba(42,255,160,0.04)' : 'transparent',
        borderLeft: selected?.id === m.id ? '3px solid var(--color-primary)' : '3px solid transparent',
        transition: 'all 0.2s',
      }}
      onClick={() => selectMatch(m)}
      onMouseOver={e => { if (selected?.id !== m.id) e.currentTarget.style.background = 'rgba(42,255,160,0.02)' }}
      onMouseOut={e => { if (selected?.id !== m.id) e.currentTarget.style.background = 'transparent' }}
    >
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 600, fontSize: '0.9rem', marginBottom: 4 }}>
          <span style={{
            fontSize: '0.68rem', fontWeight: 800, color: 'var(--color-text-muted)',
            background: 'var(--color-surface)', border: '1px solid var(--color-border)',
            borderRadius: 6, padding: '2px 7px', flexShrink: 0,
          }}>
            J{m.journee} · {m.poule}
          </span>
          <span>{teamName(m, 'a')} vs {teamName(m, 'b')}</span>
        </div>
        <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
          {new Date(`${m.date_match}T12:00:00`).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })}
          {m.terrain && ` · ${m.terrain}`}
          {m.statut === 'en_cours' && <span className="status-live" style={{ marginLeft: 8, display: 'inline-flex' }}>LIVE</span>}
        </div>
      </div>
      {isPending ? (
        <span style={{ fontSize: '0.8rem', color: 'var(--color-primary)', fontWeight: 600 }}>Saisir →</span>
      ) : m.forfait ? (
        <span style={{
          display: 'inline-flex', alignItems: 'center', gap: 5,
          padding: '4px 12px', borderRadius: 8,
          background: 'rgba(255,201,77,0.12)', border: '1px solid rgba(255,201,77,0.35)',
          color: 'var(--color-accent)', fontWeight: 800, fontSize: '0.75rem',
        }}>
          Forfait {teamName(m, m.forfait === 'a' ? 'a' : 'b')}
        </span>
      ) : (
        <span style={{
          fontSize: '0.9rem', fontWeight: 800, color: 'var(--color-text-primary)',
          fontFamily: 'var(--font-mono)', background: 'rgba(42,255,160,0.08)',
          padding: '4px 12px', borderRadius: 8,
        }}>
          {m.score_a} – {m.score_b}
        </span>
      )}
    </div>
  )

  const list = tab === 'attente' ? pending : valides

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap', marginBottom: 8 }}>
        <h1 style={{ fontFamily: 'var(--font-plus-jakarta)', fontSize: '1.8rem', fontWeight: 800 }}>👶 Résultats Cadets</h1>
        <div style={{ display: 'inline-flex', padding: 4, borderRadius: 999, background: 'var(--color-bg-secondary)', border: '1px solid var(--color-border)' }}>
          <a href="/admin/resultats" style={{
            display: 'inline-flex', alignItems: 'center', padding: '6px 16px', borderRadius: 999,
            color: 'var(--color-text-secondary)', fontWeight: 700, fontSize: '0.8rem', textDecoration: 'none',
            fontFamily: 'var(--font-plus-jakarta)',
          }}>⚽ Seniors</a>
          <span style={{
            display: 'inline-flex', alignItems: 'center', padding: '6px 16px', borderRadius: 999,
            background: 'var(--gradient-green)', color: 'white', fontWeight: 800, fontSize: '0.8rem',
            fontFamily: 'var(--font-plus-jakarta)',
          }}>👶 Cadets</span>
        </div>
      </div>
      <p style={{ color: 'var(--color-text-secondary)', marginBottom: 32 }}>
        Saisissez rapidement les scores des rencontres cadettes (poules A/B/C)
      </p>

      {success && (
        <div style={{ padding: '14px 20px', background: 'rgba(0,166,81,0.1)', border: '1px solid rgba(0,166,81,0.3)', borderRadius: 'var(--radius-md)', color: 'var(--color-primary)', marginBottom: 24, fontWeight: 500 }}>
          ✅ {success}
        </div>
      )}

      {/* ===== Scores en direct ===== */}
      {liveMatchs.length > 0 && (
        <div className="card" style={{ overflow: 'hidden', marginBottom: 32, border: '1px solid rgba(255,77,90,0.25)' }}>
          <div style={{
            padding: '12px 18px',
            background: 'rgba(255,77,90,0.07)',
            borderBottom: '1px solid var(--color-border-subtle)',
            display: 'flex', alignItems: 'center', gap: 10,
          }}>
            <span style={{
              width: 9, height: 9, borderRadius: '50%', background: '#ff4d5a', flexShrink: 0,
              boxShadow: '0 0 0 0 rgba(255,77,90,0.7)', animation: 'livePulse 1.4s infinite',
            }} />
            <div>
              <div style={{ fontWeight: 800, fontSize: '0.92rem', color: 'var(--color-text-primary)' }}>Scores en direct — Cadets</div>
              <div style={{ fontSize: '0.68rem', color: 'var(--color-text-muted)' }}>
                {liveMatchs.length} match{liveMatchs.length > 1 ? 's' : ''} en cours — ajustez les scores en temps réel
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gap: 12, padding: 16 }} className="live-grid">
            {liveMatchs.map(m => {
              const s = liveScores[m.id!] || { a: m.score_a ?? 0, b: m.score_b ?? 0 }
              const busy = savingId === m.id
              return (
                <div key={m.id} style={{
                  padding: 14, borderRadius: 'var(--radius-md)',
                  background: 'var(--color-surface-card)', border: '1px solid var(--color-border-subtle)',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12, flexWrap: 'wrap' }}>
                    <span className="status-live" style={{ display: 'inline-flex' }}>LIVE</span>
                    <span style={{ fontSize: '0.74rem', color: 'var(--color-text-muted)', fontWeight: 600 }}>
                      {teamName(m, 'a')} vs {teamName(m, 'b')}
                    </span>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: 12, alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                      <button className="btn btn-outline btn-sm" style={{ minWidth: 34, padding: '4px 8px' }} onClick={() => stepLive(m, 'a', -1)} disabled={busy}>−</button>
                      <span style={{ fontSize: '1.6rem', fontWeight: 900, fontFamily: 'var(--font-plus-jakarta)', color: 'var(--color-primary)', minWidth: 40, textAlign: 'center' }}>{s.a}</span>
                      <button className="btn btn-outline btn-sm" style={{ minWidth: 34, padding: '4px 8px' }} onClick={() => stepLive(m, 'a', 1)} disabled={busy}>+</button>
                    </div>
                    <span style={{ color: 'var(--color-text-muted)', fontWeight: 900 }}>—</span>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                      <button className="btn btn-outline btn-sm" style={{ minWidth: 34, padding: '4px 8px' }} onClick={() => stepLive(m, 'b', -1)} disabled={busy}>−</button>
                      <span style={{ fontSize: '1.6rem', fontWeight: 900, fontFamily: 'var(--font-plus-jakarta)', color: 'var(--color-primary)', minWidth: 40, textAlign: 'center' }}>{s.b}</span>
                      <button className="btn btn-outline btn-sm" style={{ minWidth: 34, padding: '4px 8px' }} onClick={() => stepLive(m, 'b', 1)} disabled={busy}>+</button>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                    <button className="btn btn-primary btn-sm" style={{ flex: 1 }} disabled={busy} onClick={() => saveLiveScore(m)}>
                      {busy ? '⏳…' : '💾 Mettre à jour'}
                    </button>
                    <button className="btn btn-outline btn-sm" style={{ flex: 1 }} disabled={busy} onClick={() => finishLive(m)}>
                      🏁 Terminer
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      <div style={{ display: 'grid', gap: 32 }} className="resultats-grid">
        {/* Liste matchs */}
        <div>
          <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
            <button
              onClick={() => setTab('attente')}
              className={tab === 'attente' ? 'btn btn-primary btn-sm' : 'btn btn-outline btn-sm'}
            >
              À saisir ({pending.length})
            </button>
            <button
              onClick={() => setTab('valides')}
              className={tab === 'valides' ? 'btn btn-primary btn-sm' : 'btn btn-outline btn-sm'}
            >
              Validés ({valides.length})
            </button>
          </div>

          <h2 style={{ fontWeight: 700, marginBottom: 16, fontSize: '1rem' }}>
            {tab === 'attente' ? 'Matchs cadets en attente' : 'Résultats cadets validés'}
          </h2>
          <div className="card" style={{ overflow: 'hidden' }}>
            {list.length === 0 ? (
              <div style={{ padding: 40, textAlign: 'center', color: 'var(--color-text-muted)' }}>
                <div style={{ fontSize: '2.5rem', marginBottom: 8 }}>
                  {tab === 'attente' ? '✅' : '⚽'}
                </div>
                <p>
                  {tab === 'attente'
                    ? 'Tous les matchs cadets ont leur résultat'
                    : 'Aucun résultat cadet validé pour le moment'}
                </p>
              </div>
            ) : list.map((m, i) => renderRow(m, i, tab === 'attente'))}
          </div>

          {tab === 'valides' && valides.length > 0 && (
            <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: 12 }}>
              💡 Cliquez sur un résultat pour corriger le score.
            </p>
          )}
        </div>

        {/* Score form */}
        <div>
          <h2 style={{ fontWeight: 700, marginBottom: 16, fontSize: '1rem' }}>
            {selected?.statut === 'termine' && (selected.score_a !== null || selected.forfait) ? 'Corriger le résultat' : 'Saisir le résultat'}
          </h2>
          {selected ? (
            <div className="card" style={{ padding: 32 }}>
              <div style={{ textAlign: 'center', marginBottom: 24 }}>
                <p style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', marginBottom: 8 }}>Match sélectionné</p>
                <h3 style={{ fontFamily: 'var(--font-plus-jakarta)', fontWeight: 800, fontSize: '1.2rem', color: 'var(--color-primary)' }}>
                  {teamName(selected, 'a')} vs {teamName(selected, 'b')}
                </h3>
                <p style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)', marginTop: 4 }}>
                  Journée {selected.journee} · Poule {selected.poule} · {selected.terrain}
                </p>
              </div>

              {/* Option Forfait */}
              <div style={{ marginBottom: 20 }}>
                <div style={{ fontSize: '0.78rem', fontWeight: 800, color: 'var(--color-text-secondary)', marginBottom: 8 }}>
                  Résultat du match
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                  <button
                    type="button"
                    onClick={() => {
                      const next = forfaitSide === 'a' ? '' : 'a'
                      setForfaitSide(next)
                      if (next) { setScoreA(''); setScoreB('') }
                    }}
                    style={{
                      padding: '10px 12px', borderRadius: 'var(--radius-md)',
                      border: `1.5px solid ${forfaitSide === 'a' ? 'rgba(255,201,77,0.6)' : 'var(--color-border)'}`,
                      background: forfaitSide === 'a' ? 'rgba(255,201,77,0.1)' : 'var(--color-bg-secondary)',
                      color: forfaitSide === 'a' ? 'var(--color-accent)' : 'var(--color-text-secondary)',
                      fontWeight: forfaitSide === 'a' ? 800 : 600, fontSize: '0.8rem',
                      cursor: 'pointer', fontFamily: 'var(--font-plus-jakarta)',
                    }}
                  >
                    Forfait {teamName(selected, 'a')}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const next = forfaitSide === 'b' ? '' : 'b'
                      setForfaitSide(next)
                      if (next) { setScoreA(''); setScoreB('') }
                    }}
                    style={{
                      padding: '10px 12px', borderRadius: 'var(--radius-md)',
                      border: `1.5px solid ${forfaitSide === 'b' ? 'rgba(255,201,77,0.6)' : 'var(--color-border)'}`,
                      background: forfaitSide === 'b' ? 'rgba(255,201,77,0.1)' : 'var(--color-bg-secondary)',
                      color: forfaitSide === 'b' ? 'var(--color-accent)' : 'var(--color-text-secondary)',
                      fontWeight: forfaitSide === 'b' ? 800 : 600, fontSize: '0.8rem',
                      cursor: 'pointer', fontFamily: 'var(--font-plus-jakarta)',
                    }}
                  >
                    Forfait {teamName(selected, 'b')}
                  </button>
                </div>
                {forfaitSide && (
                  <p style={{ fontSize: '0.72rem', color: 'var(--color-accent)', marginTop: 8, fontWeight: 600 }}>
                    🚩 {teamName(selected, forfaitSide === 'a' ? 'a' : 'b')} déclare forfait — {teamName(selected, forfaitSide === 'a' ? 'b' : 'a')} gagne sans buts.
                  </p>
                )}
              </div>

              <div style={{
                display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: 12, alignItems: 'center', marginBottom: 28,
                opacity: forfaitSide ? 0.4 : 1, pointerEvents: forfaitSide ? 'none' : 'auto',
              }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: 8 }}>{teamName(selected, 'a')}</div>
                  <input
                    type="number" min="0" max="20"
                    value={scoreA}
                    onChange={e => setScoreA(e.target.value)}
                    className="input"
                    style={{ textAlign: 'center', fontSize: '2rem', fontWeight: 900, height: 72, fontFamily: 'var(--font-plus-jakarta)' }}
                    placeholder="0"
                    id="admin-cadet-score-a"
                  />
                </div>
                <div style={{ fontFamily: 'var(--font-plus-jakarta)', fontWeight: 900, fontSize: '1.5rem', color: 'var(--color-text-muted)', textAlign: 'center', paddingTop: 24 }}>—</div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: 8 }}>{teamName(selected, 'b')}</div>
                  <input
                    type="number" min="0" max="20"
                    value={scoreB}
                    onChange={e => setScoreB(e.target.value)}
                    className="input"
                    style={{ textAlign: 'center', fontSize: '2rem', fontWeight: 900, height: 72, fontFamily: 'var(--font-plus-jakarta)' }}
                    placeholder="0"
                    id="admin-cadet-score-b"
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: 10 }}>
                <button onClick={() => setSelected(null)} className="btn btn-ghost" style={{ flex: 1 }}>Annuler</button>
                <button
                  onClick={handleValidate}
                  className="btn btn-primary"
                  style={{ flex: 2 }}
                  disabled={loading || (forfaitSide ? false : (!scoreA || !scoreB))}
                  id="validate-cadet-result-btn"
                >
                  {loading ? '⏳ Validation...' : forfaitSide ? '🚩 Valider le Forfait' : selected.statut === 'termine' ? '🔄 Corriger le Résultat' : '✅ Valider le Résultat'}
                </button>
              </div>

              <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', textAlign: 'center', marginTop: 16 }}>
                ⚠️ Le match sera marqué « Terminé » dans le calendrier public.
              </p>
            </div>
          ) : (
            <div className="card" style={{ padding: 48, textAlign: 'center', color: 'var(--color-text-muted)' }}>
              <div style={{ fontSize: '3rem', marginBottom: 12 }}>👆</div>
              <p style={{ fontSize: '0.9rem' }}>Sélectionnez un match cadet à gauche pour saisir son score</p>
            </div>
          )}
        </div>
      </div>

      <style>{`
        @media (min-width: 900px) { .resultats-grid { grid-template-columns: 1fr 1fr !important; } }
        @media (min-width: 760px) { .live-grid { grid-template-columns: repeat(2, minmax(0, 1fr)) !important; } }
        @keyframes livePulse {
          0% { box-shadow: 0 0 0 0 rgba(255,77,90,0.6); }
          70% { box-shadow: 0 0 0 10px rgba(255,77,90,0); }
          100% { box-shadow: 0 0 0 0 rgba(255,77,90,0); }
        }
      `}</style>
    </div>
  )
}
