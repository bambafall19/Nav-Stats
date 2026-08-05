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
    if (m.score_a === null || m.score_b === null) return { type: '?', color: 'var(--color-text-muted)', bg: 'var(--color-bg-secondary)', border: 'var(--color-border-subtle)', details: 'Non joué' }

    const isA = m.equipe_a_id === teamId
    const scoreFor = isA ? m.score_a : m.score_b
    const scoreAgainst = isA ? m.score_b : m.score_a
    const opponent = isA ? (m.equipe_b.sigle || m.equipe_b.nom) : (m.equipe_a.sigle || m.equipe_a.nom)
    const scoreStr = `${scoreFor}-${scoreAgainst}`

    if (scoreFor > scoreAgainst) {
      return { type: 'V', color: 'var(--color-primary)', bg: 'rgba(42,255,160,0.12)', border: 'rgba(42,255,160,0.4)', details: `Victoire vs ${opponent} (${scoreStr})` }
    } else if (scoreFor < scoreAgainst) {
      return { type: 'D', color: 'var(--color-red)', bg: 'rgba(255,77,90,0.12)', border: 'rgba(255,77,90,0.4)', details: `Défaite vs ${opponent} (${scoreStr})` }
    } else {
      return { type: 'N', color: 'var(--color-accent)', bg: 'rgba(255,201,77,0.12)', border: 'rgba(255,201,77,0.4)', details: `Nul vs ${opponent} (${scoreStr})` }
    }
  })

  return (
    <div style={{ display: 'flex', gap: 6, alignItems: 'center', margin: '8px 0' }}>
      <span style={{ fontSize: '0.58rem', color: 'var(--color-text-muted)', fontWeight: 700, fontFamily: 'var(--font-plus-jakarta)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
        Forme
      </span>
      <div style={{ display: 'flex', gap: 6 }}>
        {outcomes.map((o, idx) => (
          <div
            key={idx}
            title={o.details}
            style={{
              width: 28,
              height: 28,
              borderRadius: 9,
              background: o.bg,
              color: o.color,
              border: `1px solid ${o.border}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '0.76rem',
              fontWeight: 800,
              cursor: 'help',
              transition: 'transform 0.15s ease',
              fontFamily: 'var(--font-mono)',
            }}
            onMouseOver={e => (e.currentTarget.style.transform = 'scale(1.15)')}
            onMouseOut={e => (e.currentTarget.style.transform = 'none')}
          >
            {o.type}
          </div>
        ))}
      </div>
    </div>
  )
}
