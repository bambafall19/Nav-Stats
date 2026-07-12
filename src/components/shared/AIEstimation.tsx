import type { Database } from '@/types/database.types'

type Equipe = Database['public']['Tables']['equipes']['Row']

interface Props {
  equipeA: Equipe
  equipeB: Equipe
  pctA: number | null
  pctNul: number | null
  pctB: number | null
  totalProno: number
}

export default function AIEstimation({ equipeA, equipeB, pctA, pctNul, pctB, totalProno }: Props) {
  const dominant = pctA !== null && pctB !== null
    ? pctA > pctB ? equipeA.nom : pctB > pctA ? equipeB.nom : null
    : null

  const dominantPct = pctA !== null && pctB !== null
    ? Math.max(pctA, pctB, pctNul ?? 0)
    : 0

  return (
    <div className="ai-card">
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
        <div style={{
          width: 36, height: 36,
          background: 'linear-gradient(135deg, #006233, #00A651)',
          borderRadius: 10,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '1rem',
        }}>🤖</div>
        <div>
          <h3 style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--color-primary)' }}>Analyse IA Communautaire</h3>
          <p style={{ fontSize: '0.7rem', color: 'var(--color-text-secondary)' }}>Basée sur {totalProno} pronostic{totalProno > 1 ? 's' : ''}</p>
        </div>
      </div>

      {dominant && (
        <div style={{
          padding: '12px 16px',
          background: 'rgba(0,98,51,0.08)',
          borderRadius: 'var(--radius-md)',
          marginBottom: 16,
          border: '1px solid rgba(0,98,51,0.15)',
        }}>
          <p style={{ fontSize: '0.875rem', color: 'var(--color-text-primary)', lineHeight: 1.5 }}>
            💡 Selon les données de la communauté,{' '}
            <strong style={{ color: 'var(--color-primary)' }}>{dominant}</strong>{' '}
            a <strong>{dominantPct}%</strong> de chances de gagner.{' '}
            <em style={{ color: 'var(--color-text-secondary)', fontSize: '0.8rem' }}>
              (Estimation – pas une prédiction certaine)
            </em>
          </p>
        </div>
      )}

      {/* Barres */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {[
          { label: equipeA.nom, pct: pctA ?? 0, color: equipeA.couleur_principale },
          { label: 'Match Nul', pct: pctNul ?? 0, color: '#64748B' },
          { label: equipeB.nom, pct: pctB ?? 0, color: equipeB.couleur_principale },
        ].map(item => (
          <div key={item.label}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-text-secondary)' }}>{item.label}</span>
              <span style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--color-text-primary)' }}>{item.pct}%</span>
            </div>
            <div className="progress-bar">
              <div style={{
                height: '100%',
                width: `${item.pct}%`,
                background: item.color,
                borderRadius: 'var(--radius-full)',
                transition: 'width 0.8s cubic-bezier(0.34, 1.56, 0.64, 1)',
              }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
