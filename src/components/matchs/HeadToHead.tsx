'use client'

interface HeadToHeadMatch {
  id: string
  date_match: string
  score_a: number | null
  score_b: number | null
  statut: string
  equipe_a: { id: string; nom: string; sigle: string | null; couleur_principale: string }
  equipe_b: { id: string; nom: string; sigle: string | null; couleur_principale: string }
}

interface HeadToHeadProps {
  matchs: HeadToHeadMatch[]
  equipeAId: string
  equipeBId: string
  equipeANom: string
  equipeBNom: string
}

function getResult(m: HeadToHeadMatch, focusTeamId: string): 'win' | 'draw' | 'loss' | null {
  if (m.statut !== 'termine' || m.score_a === null || m.score_b === null) return null
  const isA = m.equipe_a.id === focusTeamId
  const scoreFor = isA ? m.score_a : m.score_b
  const scoreAgainst = isA ? m.score_b : m.score_a
  if (scoreFor > scoreAgainst) return 'win'
  if (scoreFor < scoreAgainst) return 'loss'
  return 'draw'
}

export default function HeadToHead({ matchs, equipeAId, equipeANom, equipeBNom }: HeadToHeadProps) {
  if (!matchs || matchs.length === 0) {
    return (
      <div className="card" style={{ padding: 24 }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: 16 }}>🆚 Historique des confrontations</h3>
        <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', textAlign: 'center', padding: '16px 0' }}>
          Aucune confrontation précédente enregistrée.
        </p>
      </div>
    )
  }

  // Tally for equipe_a perspective
  let wins = 0, draws = 0, losses = 0
  matchs.forEach(m => {
    const r = getResult(m, equipeAId)
    if (r === 'win') wins++
    else if (r === 'draw') draws++
    else if (r === 'loss') losses++
  })
  const total = wins + draws + losses

  return (
    <div className="card" style={{ padding: 24 }}>
      <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
        🆚 Historique des confrontations
      </h3>

      {/* Summary */}
      {total > 0 && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr auto 1fr',
          gap: 8,
          marginBottom: 20,
          textAlign: 'center',
          background: 'var(--color-surface)',
          borderRadius: 'var(--radius-md)',
          padding: 16,
        }}>
          <div>
            <div style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--color-primary)', fontFamily: 'var(--font-outfit)' }}>{wins}</div>
            <div style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', fontWeight: 600, marginTop: 2 }}>Victoires {equipeANom}</div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
            <div style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--color-accent)', fontFamily: 'var(--font-outfit)' }}>{draws}</div>
            <div style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', fontWeight: 600 }}>Nuls</div>
          </div>
          <div>
            <div style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--color-red)', fontFamily: 'var(--font-outfit)' }}>{losses}</div>
            <div style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', fontWeight: 600, marginTop: 2 }}>Victoires {equipeBNom}</div>
          </div>
        </div>
      )}

      {/* Match list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {matchs.map(m => {
          const result = getResult(m, equipeAId)
          const resultColor = result === 'win' ? 'var(--color-primary)' : result === 'loss' ? 'var(--color-red)' : 'var(--color-accent)'
          const resultBg = result === 'win' ? 'rgba(0,166,81,0.1)' : result === 'loss' ? 'rgba(232,0,45,0.08)' : 'rgba(251,191,0,0.12)'
          const resultLabel = result === 'win' ? 'V' : result === 'loss' ? 'D' : result === 'draw' ? 'N' : '?'

          return (
            <div key={m.id} style={{
              display: 'grid',
              gridTemplateColumns: '1fr auto 1fr auto',
              gap: 8,
              alignItems: 'center',
              padding: '10px 14px',
              background: 'var(--color-surface)',
              borderRadius: 'var(--radius-md)',
              fontSize: '0.82rem',
            }}>
              <div style={{ fontWeight: 600, color: 'var(--color-text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {m.equipe_a.sigle || m.equipe_a.nom}
              </div>
              <div style={{ fontWeight: 900, fontFamily: 'var(--font-outfit)', color: 'var(--color-text-primary)', textAlign: 'center', minWidth: 50 }}>
                {m.statut === 'termine' ? `${m.score_a} – ${m.score_b}` : '- – -'}
              </div>
              <div style={{ fontWeight: 600, color: 'var(--color-text-primary)', textAlign: 'right', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {m.equipe_b.sigle || m.equipe_b.nom}
              </div>
              <div style={{
                width: 24, height: 24,
                borderRadius: 'var(--radius-full)',
                background: resultBg,
                color: resultColor,
                fontWeight: 900,
                fontSize: '0.75rem',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: 'var(--font-outfit)',
              }}>
                {resultLabel}
              </div>
            </div>
          )
        })}
      </div>

      <div style={{ marginTop: 10, fontSize: '0.72rem', color: 'var(--color-text-muted)', textAlign: 'center' }}>
        V = Victoire {equipeANom} · N = Nul · D = Défaite {equipeANom}
      </div>
    </div>
  )
}
