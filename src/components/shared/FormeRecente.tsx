'use client'

interface MatchSimple {
  id: string
  date_match: string
  score_a: number | null
  score_b: number | null
  equipe_a_id: string
  equipe_b_id: string
  equipe_a: { nom: string; sigle: string | null }
  equipe_b: { nom: string; sigle: string | null }
}

interface FormeRecenteProps {
  teamId: string
  lastMatchs: MatchSimple[]
}

export default function FormeRecente({ teamId, lastMatchs }: FormeRecenteProps) {
  if (!lastMatchs || lastMatchs.length === 0) {
    return <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>Pas de matchs récents</span>
  }

  // Determine outcome (V/N/D) for each match from the team's perspective
  const outcomes = lastMatchs.map(m => {
    if (m.score_a === null || m.score_b === null) return { type: '?', details: 'Non joué' }
    
    const isA = m.equipe_a_id === teamId
    const scoreFor = isA ? m.score_a : m.score_b
    const scoreAgainst = isA ? m.score_b : m.score_a
    const opponent = isA ? (m.equipe_b.sigle || m.equipe_b.nom) : (m.equipe_a.sigle || m.equipe_a.nom)
    const scoreStr = `${scoreFor}-${scoreAgainst}`

    if (scoreFor > scoreAgainst) {
      return { type: 'V', color: 'var(--color-primary-light)', bg: 'rgba(0,166,81,0.15)', details: `Victoire vs ${opponent} (${scoreStr})` }
    } else if (scoreFor < scoreAgainst) {
      return { type: 'D', color: 'var(--color-red)', bg: 'rgba(232,0,45,0.15)', details: `Défaite vs ${opponent} (${scoreStr})` }
    } else {
      return { type: 'N', color: 'var(--color-accent-dark)', bg: 'rgba(251,191,0,0.2)', details: `Nul vs ${opponent} (${scoreStr})` }
    }
  })

  return (
    <div style={{ display: 'flex', gap: 6, alignItems: 'center', margin: '8px 0' }}>
      {outcomes.map((o, idx) => (
        <div
          key={idx}
          title={o.details}
          style={{
            width: 26,
            height: 26,
            borderRadius: '50%',
            background: o.bg,
            color: o.color,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '0.78rem',
            fontWeight: 800,
            cursor: 'help',
            transition: 'transform 0.15s ease',
            fontFamily: 'var(--font-outfit)',
          }}
          onMouseOver={e => (e.currentTarget.style.transform = 'scale(1.15)')}
          onMouseOut={e => (e.currentTarget.style.transform = 'none')}
        >
          {o.type}
        </div>
      ))}
    </div>
  )
}
