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
  const hasData = totalProno > 0

  const dominant = pctA !== null && pctB !== null
    ? pctA > pctB ? equipeA.nom : pctB > pctA ? equipeB.nom : 'Match Nul'
    : null

  const dominantPct = pctA !== null && pctB !== null
    ? Math.max(pctA, pctB, pctNul ?? 0)
    : 0

  const bars = [
    { label: equipeA.nom, sigle: equipeA.sigle || equipeA.nom.charAt(0), pct: pctA ?? 0, color: equipeA.couleur_principale || '#006233' },
    { label: 'Nul', sigle: '=', pct: pctNul ?? 0, color: '#64748B' },
    { label: equipeB.nom, sigle: equipeB.sigle || equipeB.nom.charAt(0), pct: pctB ?? 0, color: equipeB.couleur_principale || '#E8002D' },
  ]

  return (
    <div style={{
      background: 'var(--color-surface-card)',
      border: '1px solid var(--color-border)',
      borderRadius: 20,
      padding: 24,
      boxShadow: 'var(--shadow-sm)',
    }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
        <div style={{
          width: 40, height: 40,
          background: 'linear-gradient(135deg, #006233, #00A651)',
          borderRadius: 12,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '1.1rem',
          flexShrink: 0,
          boxShadow: '0 4px 12px rgba(0,98,51,0.3)',
        }}>🤖</div>
        <div>
          <h3 style={{ fontWeight: 800, fontSize: '0.95rem', color: 'var(--color-primary)', marginBottom: 2 }}>
            Pronostics de la Communauté
          </h3>
          <p style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)' }}>
            {hasData
              ? `Basé sur ${totalProno} pronostic${totalProno > 1 ? 's' : ''} · Visible par tous`
              : 'Soyez le premier à pronostiquer !'}
          </p>
        </div>
      </div>

      {hasData ? (
        <>
          {/* Dominant insight */}
          {dominant && (
            <div style={{
              padding: '10px 14px',
              background: 'rgba(0,98,51,0.06)',
              borderRadius: 12,
              marginBottom: 18,
              border: '1px solid rgba(0,98,51,0.1)',
            }}>
              <p style={{ fontSize: '0.82rem', color: 'var(--color-text-primary)', lineHeight: 1.5 }}>
                💡 La communauté donne <strong style={{ color: 'var(--color-primary)' }}>{dominant}</strong>{' '}
                gagnant avec <strong>{dominantPct}%</strong> des votes.
                <em style={{ color: 'var(--color-text-muted)', fontSize: '0.72rem', display: 'block', marginTop: 2 }}>
                  Estimation communautaire — pas une prédiction certaine.
                </em>
              </p>
            </div>
          )}

          {/* 3-column visual split */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: `${pctA ?? 0}fr ${pctNul ?? 0}fr ${pctB ?? 0}fr`,
            gap: 4,
            height: 10,
            borderRadius: 99,
            overflow: 'hidden',
            marginBottom: 16,
            background: 'var(--color-surface)',
          }}>
            {bars.map(b => b.pct > 0 && (
              <div key={b.label} style={{ background: b.color, height: '100%' }} />
            ))}
          </div>

          {/* Labels */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: 8, alignItems: 'center' }}>
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontFamily: 'var(--font-outfit)', fontWeight: 900, fontSize: '1.4rem', color: equipeA.couleur_principale || 'var(--color-primary)' }}>
                {pctA ?? 0}%
              </div>
              <div style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', fontWeight: 600 }}>{equipeA.nom}</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontFamily: 'var(--font-outfit)', fontWeight: 900, fontSize: '1rem', color: '#64748B' }}>
                {pctNul ?? 0}%
              </div>
              <div style={{ fontSize: '0.68rem', color: 'var(--color-text-muted)' }}>Nul</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontFamily: 'var(--font-outfit)', fontWeight: 900, fontSize: '1.4rem', color: equipeB.couleur_principale || 'var(--color-red)' }}>
                {pctB ?? 0}%
              </div>
              <div style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', fontWeight: 600 }}>{equipeB.nom}</div>
            </div>
          </div>
        </>
      ) : (
        /* Empty state — invite to pronostic */
        <div style={{ textAlign: 'center', padding: '12px 0' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: 8 }}>🎯</div>
          <p style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', lineHeight: 1.5 }}>
            Aucun pronostic pour l'instant.<br />
            <strong style={{ color: 'var(--color-primary)' }}>Pronostique ce match</strong> pour voir les statistiques de la communauté !
          </p>
          <div style={{
            marginTop: 12,
            display: 'grid', gridTemplateColumns: '1fr auto 1fr',
            gap: 8, alignItems: 'center',
          }}>
            <div style={{ height: 10, background: 'var(--color-surface)', borderRadius: 99 }} />
            <span style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)' }}>VS</span>
            <div style={{ height: 10, background: 'var(--color-surface)', borderRadius: 99 }} />
          </div>
        </div>
      )}
    </div>
  )
}
