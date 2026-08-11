'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Database } from '@/types/database.types'

type Equipe = Database['public']['Tables']['equipes']['Row']
type EquipeUpdate = Database['public']['Tables']['equipes']['Update']
type Match = Database['public']['Tables']['matchs']['Row'] & {
  equipe_a: Equipe; equipe_b: Equipe
}

type ResultStat = 'victoire' | 'nul' | 'defaite'

function resultFor(scoreFor: number, scoreAgainst: number): ResultStat {
  if (scoreFor > scoreAgainst) return 'victoire'
  if (scoreFor < scoreAgainst) return 'defaite'
  return 'nul'
}

export default function AdminResultats() {
  const supabase = createClient() as any
  const [matchs, setMatchs] = useState<Match[]>([])
  const [selected, setSelected] = useState<Match | null>(null)
  const [scoreA, setScoreA] = useState('')
  const [scoreB, setScoreB] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState('')
  const [tab, setTab] = useState<'attente' | 'valides'>('attente')

  const loadMatchs = () =>
    supabase
      .from('matchs')
      .select(`*, equipe_a:equipes!matchs_equipe_a_id_fkey(*), equipe_b:equipes!matchs_equipe_b_id_fkey(*)`)
      .in('statut', ['a_venir', 'en_cours', 'termine'])
      .order('date_match')
      .then((res: { data: Match[] | null }) => {
        const data = res.data || []
        setMatchs(data)

        // Présélection via ?match=xxx (lien du dashboard admin)
        const id = new URLSearchParams(window.location.search).get('match')
        if (id) {
          const m = data.find((x: Match) => x.id === id)
          if (m) {
            setSelected(m)
            setScoreA(m.score_a != null ? String(m.score_a) : '')
            setScoreB(m.score_b != null ? String(m.score_b) : '')
          }
          const url = new URL(window.location.href)
          url.searchParams.delete('match')
          window.history.replaceState({}, '', url.toString())
        }
      })

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { loadMatchs() }, [])

  const pending = matchs.filter(m => m.statut !== 'termine' || m.score_a === null || m.score_b === null)
  const valides = matchs.filter(m => m.statut === 'termine' && m.score_a !== null && m.score_b !== null)

  async function reverseStats(m: Match) {
    const sA = m.score_a ?? 0
    const sB = m.score_b ?? 0
    const { data: eqA } = await supabase.from('equipes').select('*').eq('id', m.equipe_a_id).single()
    const { data: eqB } = await supabase.from('equipes').select('*').eq('id', m.equipe_b_id).single()

    if (eqA) {
      const res = resultFor(sA, sB)
      const up: EquipeUpdate = {
        matchs_joues: Math.max(0, (eqA.matchs_joues || 0) - 1),
        buts_marques: Math.max(0, (eqA.buts_marques || 0) - sA),
        buts_encaisses: Math.max(0, (eqA.buts_encaisses || 0) - sB),
      }
      if (res === 'victoire') up.victoires = Math.max(0, (eqA.victoires || 0) - 1)
      else if (res === 'nul') up.nuls = Math.max(0, (eqA.nuls || 0) - 1)
      else up.defaites = Math.max(0, (eqA.defaites || 0) - 1)
      up.points_classement = (up.victoires || 0) * 3 + (up.nuls || 0)
      await supabase.from('equipes').update(up).eq('id', eqA.id)
    }

    if (eqB) {
      const res = resultFor(sB, sA)
      const up: EquipeUpdate = {
        matchs_joues: Math.max(0, (eqB.matchs_joues || 0) - 1),
        buts_marques: Math.max(0, (eqB.buts_marques || 0) - sB),
        buts_encaisses: Math.max(0, (eqB.buts_encaisses || 0) - sA),
      }
      if (res === 'victoire') up.victoires = Math.max(0, (eqB.victoires || 0) - 1)
      else if (res === 'nul') up.nuls = Math.max(0, (eqB.nuls || 0) - 1)
      else up.defaites = Math.max(0, (eqB.defaites || 0) - 1)
      up.points_classement = (up.victoires || 0) * 3 + (up.nuls || 0)
      await supabase.from('equipes').update(up).eq('id', eqB.id)
    }
  }

  async function applyStats(m: Match, sA: number, sB: number) {
    const { data: eqA } = await supabase.from('equipes').select('*').eq('id', m.equipe_a_id).single()
    const { data: eqB } = await supabase.from('equipes').select('*').eq('id', m.equipe_b_id).single()

    if (eqA) {
      const res = resultFor(sA, sB)
      const up: EquipeUpdate = {
        matchs_joues: (eqA.matchs_joues || 0) + 1,
        buts_marques: (eqA.buts_marques || 0) + sA,
        buts_encaisses: (eqA.buts_encaisses || 0) + sB,
      }
      if (res === 'victoire') up.victoires = (eqA.victoires || 0) + 1
      else if (res === 'nul') up.nuls = (eqA.nuls || 0) + 1
      else up.defaites = (eqA.defaites || 0) + 1
      up.points_classement = (up.victoires || 0) * 3 + (up.nuls || 0)
      await supabase.from('equipes').update(up).eq('id', eqA.id)
    }

    if (eqB) {
      const res = resultFor(sB, sA)
      const up: EquipeUpdate = {
        matchs_joues: (eqB.matchs_joues || 0) + 1,
        buts_marques: (eqB.buts_marques || 0) + sB,
        buts_encaisses: (eqB.buts_encaisses || 0) + sA,
      }
      if (res === 'victoire') up.victoires = (eqB.victoires || 0) + 1
      else if (res === 'nul') up.nuls = (eqB.nuls || 0) + 1
      else up.defaites = (eqB.defaites || 0) + 1
      up.points_classement = (up.victoires || 0) * 3 + (up.nuls || 0)
      await supabase.from('equipes').update(up).eq('id', eqB.id)
    }
  }

  async function handleValidate() {
    if (!selected) return
    setLoading(true)

    const scoreAInt = parseInt(scoreA) || 0
    const scoreBInt = parseInt(scoreB) || 0

    const { error } = await supabase
      .from('matchs')
      .update({
        statut: 'termine',
        score_a: scoreAInt,
        score_b: scoreBInt,
      })
      .eq('id', selected.id)

    if (!error) {
      try {
        // Annule l'ancien score s'il existait, puis applique le nouveau
        if (selected.statut === 'termine' && selected.score_a !== null && selected.score_b !== null) {
          await reverseStats(selected)
        }
        await applyStats(selected, scoreAInt, scoreBInt)
        setSuccess(`Résultat validé : ${selected.equipe_a.nom} ${scoreAInt} – ${scoreBInt} ${selected.equipe_b.nom} — Classement mis à jour !`)
      } catch (statsError) {
        console.error('Erreur mise à jour stats:', statsError)
        setSuccess(`Résultat validé : ${selected.equipe_a.nom} ${scoreAInt} – ${scoreBInt} ${selected.equipe_b.nom}`)
      }

      setSelected(null); setScoreA(''); setScoreB('')
      await loadMatchs()
    }
    setLoading(false)
  }

  const selectMatch = (m: Match) => {
    setSelected(m)
    setScoreA(m.score_a != null ? String(m.score_a) : '')
    setScoreB(m.score_b != null ? String(m.score_b) : '')
  }

  const renderRow = (m: Match, i: number, isPending: boolean) => (
    <div key={m.id}
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
        <div style={{ fontWeight: 600, fontSize: '0.9rem', marginBottom: 4 }}>
          {m.equipe_a.nom} vs {m.equipe_b.nom}
        </div>
        <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
          {new Date(m.date_match).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })}
          {m.heure_match && ` à ${m.heure_match.slice(0, 5)}`}
          {m.statut === 'en_cours' && <span className="status-live" style={{ marginLeft: 8, display: 'inline-flex' }}>LIVE</span>}
        </div>
      </div>
      {isPending ? (
        <span style={{ fontSize: '0.8rem', color: 'var(--color-primary)', fontWeight: 600 }}>Saisir →</span>
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
      <h1 style={{ fontFamily: 'var(--font-plus-jakarta)', fontSize: '1.8rem', fontWeight: 800, marginBottom: 8 }}>✅ Valider Résultats</h1>
      <p style={{ color: 'var(--color-text-secondary)', marginBottom: 32 }}>
        Saisissez les scores des matchs terminés — le classement des poules A/B/C se met à jour automatiquement
      </p>

      {success && (
        <div style={{ padding: '14px 20px', background: 'rgba(0,166,81,0.1)', border: '1px solid rgba(0,166,81,0.3)', borderRadius: 'var(--radius-md)', color: 'var(--color-primary)', marginBottom: 24, fontWeight: 500 }}>
          ✅ {success}
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
            {tab === 'attente' ? 'Matchs en attente' : 'Résultats validés'}
          </h2>
          <div className="card" style={{ overflow: 'hidden' }}>
            {list.length === 0 ? (
              <div style={{ padding: 40, textAlign: 'center', color: 'var(--color-text-muted)' }}>
                <div style={{ fontSize: '2.5rem', marginBottom: 8 }}>
                  {tab === 'attente' ? '✅' : '⚽'}
                </div>
                <p>
                  {tab === 'attente'
                    ? 'Tous les matchs ont leur résultat'
                    : 'Aucun résultat validé pour le moment'}
                </p>
              </div>
            ) : list.map((m, i) => renderRow(m, i, tab === 'attente'))}
          </div>

          {tab === 'valides' && valides.length > 0 && (
            <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: 12 }}>
              💡 Cliquez sur un résultat pour corriger le score — le classement sera recalculé.
            </p>
          )}
        </div>

        {/* Score form */}
        <div>
          <h2 style={{ fontWeight: 700, marginBottom: 16, fontSize: '1rem' }}>
            {selected?.statut === 'termine' && selected.score_a !== null ? 'Corriger le score' : 'Saisir le score'}
          </h2>
          {selected ? (
            <div className="card" style={{ padding: 32 }}>
              <div style={{ textAlign: 'center', marginBottom: 28 }}>
                <p style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', marginBottom: 8 }}>Match sélectionné</p>
                <h3 style={{ fontFamily: 'var(--font-plus-jakarta)', fontWeight: 800, fontSize: '1.2rem', color: 'var(--color-primary)' }}>
                  {selected.equipe_a.nom} vs {selected.equipe_b.nom}
                </h3>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: 12, alignItems: 'center', marginBottom: 28 }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: 8 }}>{selected.equipe_a.nom}</div>
                  <input
                    type="number" min="0" max="20"
                    value={scoreA}
                    onChange={e => setScoreA(e.target.value)}
                    className="input"
                    style={{ textAlign: 'center', fontSize: '2rem', fontWeight: 900, height: 72, fontFamily: 'var(--font-plus-jakarta)' }}
                    placeholder="0"
                    id="admin-score-a"
                  />
                </div>
                <div style={{ fontFamily: 'var(--font-plus-jakarta)', fontWeight: 900, fontSize: '1.5rem', color: 'var(--color-text-muted)', textAlign: 'center', paddingTop: 24 }}>—</div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: 8 }}>{selected.equipe_b.nom}</div>
                  <input
                    type="number" min="0" max="20"
                    value={scoreB}
                    onChange={e => setScoreB(e.target.value)}
                    className="input"
                    style={{ textAlign: 'center', fontSize: '2rem', fontWeight: 900, height: 72, fontFamily: 'var(--font-plus-jakarta)' }}
                    placeholder="0"
                    id="admin-score-b"
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: 10 }}>
                <button onClick={() => setSelected(null)} className="btn btn-ghost" style={{ flex: 1 }}>Annuler</button>
                <button
                  onClick={handleValidate}
                  className="btn btn-primary"
                  style={{ flex: 2 }}
                  disabled={loading || !scoreA || !scoreB}
                  id="validate-result-btn"
                >
                  {loading ? '⏳ Validation...' : selected.statut === 'termine' ? '🔄 Corriger le Résultat' : '✅ Valider le Résultat'}
                </button>
              </div>

              <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', textAlign: 'center', marginTop: 16 }}>
                ⚠️ La validation mettra à jour automatiquement les stats des équipes dans les poules A/B/C
              </p>
            </div>
          ) : (
            <div className="card" style={{ padding: 48, textAlign: 'center', color: 'var(--color-text-muted)' }}>
              <div style={{ fontSize: '3rem', marginBottom: 12 }}>👆</div>
              <p style={{ fontSize: '0.9rem' }}>Sélectionnez un match à gauche pour saisir son score</p>
            </div>
          )}
        </div>
      </div>

      <style>{`
        @media (min-width: 900px) { .resultats-grid { grid-template-columns: 1fr 1fr !important; } }
      `}</style>
    </div>
  )
}
