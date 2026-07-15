'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Database } from '@/types/database.types'

type Equipe = Database['public']['Tables']['equipes']['Row']
type Match = Database['public']['Tables']['matchs']['Row'] & {
  equipe_a: Equipe; equipe_b: Equipe
}

export default function AdminResultats() {
  const supabase = createClient() as any
  const [matchs, setMatchs] = useState<Match[]>([])
  const [selected, setSelected] = useState<Match | null>(null)
  const [scoreA, setScoreA] = useState('')
  const [scoreB, setScoreB] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState('')

  useEffect(() => {
    supabase
      .from('matchs')
      .select(`*, equipe_a:equipes!matchs_equipe_a_id_fkey(*), equipe_b:equipes!matchs_equipe_b_id_fkey(*)`)
      .in('statut', ['a_venir', 'en_cours'])
      .order('date_match')
      .then((res: any) => setMatchs(res.data || []))
  }, [])

  async function handleValidate() {
    if (!selected) return
    setLoading(true)

    const { error } = await supabase
      .from('matchs')
      .update({
        statut: 'termine',
        score_a: parseInt(scoreA) || 0,
        score_b: parseInt(scoreB) || 0,
      })
      .eq('id', selected.id)

    if (!error) {
      // Update team standings
      try {
        const scoreAInt = parseInt(scoreA) || 0
        const scoreBInt = parseInt(scoreB) || 0

        // Determine result: win/loss/draw
        let resultA = '', resultB = ''
        if (scoreAInt > scoreBInt) { resultA = 'victoire'; resultB = 'defaite' }
        else if (scoreAInt < scoreBInt) { resultA = 'defaite'; resultB = 'victoire' }
        else { resultA = 'nul'; resultB = 'nul' }

        // Direct stats update: fetch current stats and modify
        const { data: eqA } = await supabase.from('equipes').select('*').eq('id', selected.equipe_a_id).single()
        const { data: eqB } = await supabase.from('equipes').select('*').eq('id', selected.equipe_b_id).single()
        
        if (eqA) {
          const updateA: any = { 
            matchs_joues: (eqA.matchs_joues || 0) + 1,
            buts_marques: (eqA.buts_marques || 0) + scoreAInt,
            buts_encaisses: (eqA.buts_encaisses || 0) + scoreBInt,
          }
          if (resultA === 'victoire') updateA.victoires = (eqA.victoires || 0) + 1
          else if (resultA === 'nul') updateA.nuls = (eqA.nuls || 0) + 1
          else updateA.defaites = (eqA.defaites || 0) + 1
          updateA.points_classement = (updateA.victoires || 0) * 3 + (updateA.nuls || 0)

          await supabase.from('equipes').update(updateA).eq('id', selected.equipe_a_id)
        }

        if (eqB) {
          const updateB: any = { 
            matchs_joues: (eqB.matchs_joues || 0) + 1,
            buts_marques: (eqB.buts_marques || 0) + scoreBInt,
            buts_encaisses: (eqB.buts_encaisses || 0) + scoreAInt,
          }
          if (resultB === 'victoire') updateB.victoires = (eqB.victoires || 0) + 1
          else if (resultB === 'nul') updateB.nuls = (eqB.nuls || 0) + 1
          else updateB.defaites = (eqB.defaites || 0) + 1
          updateB.points_classement = (updateB.victoires || 0) * 3 + (updateB.nuls || 0)

          await supabase.from('equipes').update(updateB).eq('id', selected.equipe_b_id)
        }

        setSuccess(`Résultat validé : ${selected.equipe_a.nom} ${scoreA} – ${scoreB} ${selected.equipe_b.nom} — Classement mis à jour !`)
      } catch (statsError) {
        console.error('Erreur mise à jour stats:', statsError)
        setSuccess(`Résultat validé : ${selected.equipe_a.nom} ${scoreA} – ${scoreB} ${selected.equipe_b.nom}`)
      }
      
      setSelected(null); setScoreA(''); setScoreB('')
      // Refresh
      const { data } = await supabase
        .from('matchs')
        .select(`*, equipe_a:equipes!matchs_equipe_a_id_fkey(*), equipe_b:equipes!matchs_equipe_b_id_fkey(*)`)
        .in('statut', ['a_venir', 'en_cours'])
        .order('date_match')
      setMatchs(data as any || [])
    }
    setLoading(false)
  }

  return (
    <div>
      <h1 style={{ fontFamily: 'var(--font-outfit)', fontSize: '1.8rem', fontWeight: 800, marginBottom: 8 }}>✅ Valider Résultats</h1>
      <p style={{ color: 'var(--color-text-secondary)', marginBottom: 32 }}>Saisissez les scores des matchs terminés</p>

      {success && (
        <div style={{ padding: '14px 20px', background: 'rgba(0,166,81,0.1)', border: '1px solid rgba(0,166,81,0.3)', borderRadius: 'var(--radius-md)', color: 'var(--color-primary)', marginBottom: 24, fontWeight: 500 }}>
          ✅ {success}
        </div>
      )}

      <div style={{ display: 'grid', gap: 32 }} className="resultats-grid">
        {/* Liste matchs */}
        <div>
          <h2 style={{ fontWeight: 700, marginBottom: 16, fontSize: '1rem' }}>Matchs en attente</h2>
          <div className="card" style={{ overflow: 'hidden' }}>
            {matchs.length === 0 ? (
              <div style={{ padding: 40, textAlign: 'center', color: 'var(--color-text-muted)' }}>
                <div style={{ fontSize: '2.5rem', marginBottom: 8 }}>✅</div>
                <p>Tous les matchs ont leur résultat</p>
              </div>
            ) : matchs.map((m, i) => (
              <div key={m.id}
                style={{
                  padding: '16px 20px',
                  borderBottom: i < matchs.length - 1 ? '1px solid var(--color-border)' : 'none',
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  cursor: 'pointer',
                  background: selected?.id === m.id ? 'rgba(0,98,51,0.04)' : 'transparent',
                  borderLeft: selected?.id === m.id ? '3px solid var(--color-primary)' : '3px solid transparent',
                  transition: 'all 0.2s',
                }}
                onClick={() => { setSelected(m); setScoreA(''); setScoreB('') }}
                onMouseOver={e => { if (selected?.id !== m.id) e.currentTarget.style.background = 'rgba(0,98,51,0.02)' }}
                onMouseOut={e => { if (selected?.id !== m.id) e.currentTarget.style.background = 'transparent' }}
              >
                <div>
                  <div style={{ fontWeight: 600, fontSize: '0.9rem', marginBottom: 4 }}>
                    {m.equipe_a.nom} vs {m.equipe_b.nom}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                    {new Date(m.date_match).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })} à {m.heure_match?.slice(0,5)}
                    {m.statut === 'en_cours' && <span className="status-live" style={{ marginLeft: 8, display: 'inline-flex' }}>LIVE</span>}
                  </div>
                </div>
                <span style={{ fontSize: '0.8rem', color: 'var(--color-primary)', fontWeight: 600 }}>Saisir →</span>
              </div>
            ))}
          </div>
        </div>

        {/* Score form */}
        <div>
          <h2 style={{ fontWeight: 700, marginBottom: 16, fontSize: '1rem' }}>Saisir le score</h2>
          {selected ? (
            <div className="card" style={{ padding: 32 }}>
              <div style={{ textAlign: 'center', marginBottom: 28 }}>
                <p style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', marginBottom: 8 }}>Match sélectionné</p>
                <h3 style={{ fontFamily: 'var(--font-outfit)', fontWeight: 800, fontSize: '1.2rem', color: 'var(--color-primary)' }}>
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
                    style={{ textAlign: 'center', fontSize: '2rem', fontWeight: 900, height: 72, fontFamily: 'var(--font-outfit)' }}
                    placeholder="0"
                    id="admin-score-a"
                  />
                </div>
                <div style={{ fontFamily: 'var(--font-outfit)', fontWeight: 900, fontSize: '1.5rem', color: 'var(--color-text-muted)', textAlign: 'center', paddingTop: 24 }}>—</div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: 8 }}>{selected.equipe_b.nom}</div>
                  <input
                    type="number" min="0" max="20"
                    value={scoreB}
                    onChange={e => setScoreB(e.target.value)}
                    className="input"
                    style={{ textAlign: 'center', fontSize: '2rem', fontWeight: 900, height: 72, fontFamily: 'var(--font-outfit)' }}
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
                  {loading ? '⏳ Validation...' : '✅ Valider le Résultat'}
                </button>
              </div>

              <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', textAlign: 'center', marginTop: 16 }}>
                ⚠️ La validation calculera automatiquement les points des pronostiqueurs
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
