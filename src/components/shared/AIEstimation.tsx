import { Users, TrendingUp, Vote } from 'lucide-react'
import ScoreboardPanel from '@/components/shared/ScoreboardPanel'
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

function TeamAvatar({ equipe, size = 34 }: { equipe: Equipe; size?: number }) {
  const inner = equipe.logo_url ? (
    <img src={equipe.logo_url} alt={equipe.nom}
      style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: size * 0.34 }}
    />
  ) : (
    <div style={{
      width: '100%', height: '100%',
      background: `linear-gradient(135deg, ${equipe.couleur_principale || '#0dca6b'}, ${equipe.couleur_secondaire || '#ffc94d'})`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: size * 0.34, fontWeight: 800, color: 'white',
      fontFamily: 'var(--font-plus-jakarta)', borderRadius: size * 0.34,
    }}>
      {equipe.sigle || equipe.nom.charAt(0)}
    </div>
  )
  return (
    <div style={{
      width: size, height: size, borderRadius: size * 0.34,
      overflow: 'hidden', border: '1px solid var(--color-border-subtle)',
      background: 'var(--color-surface-card)', flexShrink: 0,
      boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
    }}>
      {inner}
    </div>
  )
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
    { label: equipeA.nom, pct: pctA ?? 0, color: equipeA.couleur_principale || '#2affa0' },
    { label: 'Nul', pct: pctNul ?? 0, color: 'var(--color-text-muted)' },
    { label: equipeB.nom, pct: pctB ?? 0, color: equipeB.couleur_principale || '#ff4d5a' },
  ]

  return (
    <ScoreboardPanel
      title="Pronostics de la Communauté"
      icon={<Users size={14} color="var(--color-primary)" />}
      right={hasData ? (
        <span style={{
          display: 'inline-flex', alignItems: 'center', gap: 4,
          fontFamily: 'var(--font-mono)', fontSize: '0.58rem', fontWeight: 700,
          color: 'var(--color-primary)', letterSpacing: '0.04em', whiteSpace: 'nowrap',
          padding: '3px 9px', borderRadius: 999,
          background: 'rgba(42,255,160,0.1)', border: '1px solid rgba(42,255,160,0.18)',
        }}>
          <Vote size={10} /> {totalProno} VOTE{totalProno > 1 ? 'S' : ''}
        </span>
      ) : undefined}
    >
      {hasData ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Dominant insight */}
          {dominant && (
            <div style={{
              padding: '12px 14px',
              background: 'var(--gradient-green-soft)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid rgba(42,255,160,0.18)',
              display: 'flex', gap: 10, alignItems: 'flex-start',
            }}>
              <span style={{
                width: 28, height: 28, borderRadius: 9, flexShrink: 0,
                background: 'rgba(42,255,160,0.14)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <TrendingUp size={14} color="var(--color-primary)" />
              </span>
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: '0.78rem', color: 'var(--color-text-primary)', lineHeight: 1.5, margin: 0 }}>
                  La communauté donne <strong style={{ color: 'var(--color-primary)' }}>{dominant}</strong> gagnant avec <strong style={{ color: 'var(--color-accent)' }}>{dominantPct}%</strong> des votes.
                </p>
                <p style={{ fontSize: '0.62rem', color: 'var(--color-text-muted)', marginTop: 2 }}>
                  Estimation communautaire — pas une prédiction certaine.
                </p>
              </div>
            </div>
          )}

          {/* Teams vs */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
              <TeamAvatar equipe={equipeA} />
              <div style={{ minWidth: 0 }}>
                <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 900, fontSize: '1.15rem', color: 'var(--color-primary)', lineHeight: 1.1 }}>{pctA ?? 0}%</div>
                <div style={{ fontSize: '0.62rem', color: 'var(--color-text-muted)', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {equipeA.nom}
                </div>
              </div>
            </div>
            <div style={{ textAlign: 'center', flexShrink: 0 }}>
              <div style={{ fontSize: '0.62rem', color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)', fontWeight: 800, padding: '4px 10px', borderRadius: 999, background: 'var(--color-bg-secondary)', border: '1px solid var(--color-border-subtle)' }}>
                {pctNul ?? 0}% · N
              </div>
            </div>
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 10, justifyContent: 'flex-end', minWidth: 0 }}>
              <div style={{ textAlign: 'right', minWidth: 0 }}>
                <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 900, fontSize: '1.15rem', color: 'var(--color-red)', lineHeight: 1.1 }}>{pctB ?? 0}%</div>
                <div style={{ fontSize: '0.62rem', color: 'var(--color-text-muted)', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {equipeB.nom}
                </div>
              </div>
              <TeamAvatar equipe={equipeB} />
            </div>
          </div>

          {/* Split bar */}
          <div>
            <div style={{
              display: 'flex',
              height: 10,
              borderRadius: 999,
              overflow: 'hidden',
              background: 'var(--color-bg-secondary)',
              border: '1px solid var(--color-border-subtle)',
              marginBottom: 8,
            }}>
              {bars.map(b => b.pct > 0 && (
                <div key={b.label} style={{
                  width: `${b.pct}%`,
                  background: b.color === 'var(--color-text-muted)' ? 'var(--color-text-muted)' : b.color,
                  height: '100%',
                  transition: 'width 600ms var(--ease-out)',
                }} />
              ))}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.58rem', color: 'var(--color-text-muted)', fontFamily: 'var(--font-plus-jakarta)', fontWeight: 600 }}>
              {bars.map(b => (
                <span key={b.label} style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '33%' }}>
                  {b.label}
                </span>
              ))}
            </div>
          </div>
        </div>
      ) : (
        /* Empty state */
        <div style={{ textAlign: 'center', padding: '12px 0' }}>
          <div style={{
            width: 46, height: 46, borderRadius: 14,
            background: 'var(--color-bg-secondary)',
            border: '1px solid var(--color-border-subtle)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 12px',
          }}>
            <Users size={20} color="var(--color-text-muted)" />
          </div>
          <p style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>
            Aucun pronostic pour l&apos;instant.<br />
            <strong style={{ color: 'var(--color-primary)' }}>Pronostique ce match</strong> pour voir les statistiques de la communauté !
          </p>
        </div>
      )}
    </ScoreboardPanel>
  )
}
