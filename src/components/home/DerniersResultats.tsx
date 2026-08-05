import Link from 'next/link'
import type { Database } from '@/types/database.types'
import { Trophy, ChevronRight } from 'lucide-react'

type Match = Database['public']['Tables']['matchs']['Row'] & {
  equipe_a: Database['public']['Tables']['equipes']['Row']
  equipe_b: Database['public']['Tables']['equipes']['Row']
}

function TeamLogo({ equipe, size = 24, dim }: { equipe: Database['public']['Tables']['equipes']['Row']; size?: number; dim?: boolean }) {
  const inner = equipe.logo_url ? (
    <img src={equipe.logo_url} alt={equipe.nom}
      style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: size * 0.34 }}
    />
  ) : (
    <div style={{
      width: '100%', height: '100%',
      background: `linear-gradient(135deg, ${equipe.couleur_principale || '#0dca6b'}, ${equipe.couleur_secondaire || '#ffc94d'})`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: size * 0.36, fontWeight: 800, color: 'white',
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
      opacity: dim ? 0.5 : 1,
      filter: dim ? 'grayscale(0.5)' : 'none',
      boxShadow: dim ? 'none' : '0 2px 8px rgba(0,0,0,0.15)',
    }}>
      {inner}
    </div>
  )
}

export default function DerniersResultats({ matchs }: { matchs: Match[] }) {
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 12, gap: 8 }}>
        <div>
          <h2 className="section-title" style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2, fontSize: '1rem' }}>
            <Trophy size={17} color="var(--color-accent)" /> Derniers Résultats
          </h2>
          <p className="section-subtitle" style={{ fontSize: '0.7rem' }}>Résultats récents</p>
        </div>
        {matchs.length > 0 && (
          <Link href="/matchs" style={{ display: 'flex', alignItems: 'center', gap: 3, color: 'var(--color-primary)', fontWeight: 700, fontSize: '0.72rem', textDecoration: 'none', fontFamily: 'var(--font-plus-jakarta)', whiteSpace: 'nowrap' }}>
            Tous les matchs <ChevronRight size={13} />
          </Link>
        )}
      </div>

      {matchs.length === 0 ? (
        <div className="card" style={{ padding: 28, textAlign: 'center' }}>
          <Trophy size={24} color="var(--color-text-muted)" style={{ marginBottom: 8 }} />
          <p style={{ color: 'var(--color-text-secondary)', fontWeight: 500, fontSize: '0.8rem' }}>Aucun résultat pour le moment</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {matchs.map((match) => {
            const scoreA = match.score_a ?? 0
            const scoreB = match.score_b ?? 0
            const isWinA = scoreA > scoreB
            const isWinB = scoreB > scoreA
            const draw = scoreA === scoreB
            const matchDate = new Date(match.date_match)

            return (
              <Link key={match.id} href={`/matchs/${match.id}`} style={{ textDecoration: 'none' }}>
                <div className="resultat-card" style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  padding: '10px 12px',
                  background: 'var(--color-surface-card)',
                  border: '1px solid var(--color-border-subtle)',
                  borderRadius: 'var(--radius-lg)',
                  transition: 'all var(--transition-base) var(--ease-out)',
                  boxShadow: 'var(--shadow-card)',
                }}>
                  <div style={{
                    flexShrink: 0, textAlign: 'center',
                    padding: '5px 8px', borderRadius: 10,
                    background: 'var(--color-bg-secondary)',
                    fontSize: '0.52rem', fontWeight: 700,
                    color: 'var(--color-text-muted)',
                    fontFamily: 'var(--font-mono)',
                    letterSpacing: '0.02em',
                  }}>
                    {matchDate.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
                  </div>

                  <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 7, justifyContent: 'flex-end', minWidth: 0 }}>
                    {isWinA && <span style={{ fontSize: '0.56rem', fontWeight: 800, color: 'var(--color-primary)', fontFamily: 'var(--font-plus-jakarta)', flexShrink: 0 }}>V</span>}
                    <TeamLogo equipe={match.equipe_a} size={22} dim={isWinB} />
                    <span style={{
                      fontSize: '0.66rem',
                      fontWeight: isWinA ? 700 : 500,
                      color: isWinA ? 'var(--color-primary)' : 'var(--color-text-secondary)',
                      overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                    }}>
                      {match.equipe_a.nom}
                    </span>
                  </div>

                  <div style={{
                    display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0,
                    padding: '5px 12px', borderRadius: 12,
                    background: draw ? 'var(--color-bg-secondary)' : 'rgba(42,255,160,0.08)',
                    border: `1px solid ${draw ? 'var(--color-border-subtle)' : 'rgba(42,255,160,0.15)'}`,
                  }}>
                    <span style={{
                      fontFamily: 'var(--font-mono)', fontWeight: 800, fontSize: '0.9rem',
                      color: isWinA ? 'var(--color-primary)' : 'var(--color-text-primary)',
                      lineHeight: 1,
                    }}>{scoreA}</span>
                    <span style={{ color: 'var(--color-text-muted)', fontWeight: 600, fontSize: '0.5rem' }}>–</span>
                    <span style={{
                      fontFamily: 'var(--font-mono)', fontWeight: 800, fontSize: '0.9rem',
                      color: isWinB ? 'var(--color-primary)' : 'var(--color-text-primary)',
                      lineHeight: 1,
                    }}>{scoreB}</span>
                  </div>

                  <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 7, minWidth: 0 }}>
                    <span style={{
                      fontSize: '0.66rem',
                      fontWeight: isWinB ? 700 : 500,
                      color: isWinB ? 'var(--color-primary)' : 'var(--color-text-secondary)',
                      overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                    }}>
                      {match.equipe_b.nom}
                    </span>
                    <TeamLogo equipe={match.equipe_b} size={22} dim={isWinA} />
                    {isWinB && <span style={{ fontSize: '0.56rem', fontWeight: 800, color: 'var(--color-primary)', fontFamily: 'var(--font-plus-jakarta)', flexShrink: 0 }}>V</span>}
                  </div>

                  <ChevronRight size={13} color="var(--color-text-muted)" style={{ flexShrink: 0, opacity: 0.5 }} />
                </div>
              </Link>
            )
          })}
        </div>
      )}
      <style>{`
        .resultat-card:hover { border-color: rgba(42,255,160,0.3); box-shadow: var(--shadow-card-hover) !important; transform: translateY(-2px); }
        @media (max-width: 767px) {
          .resultat-card { padding: 9px 10px !important; gap: 8px !important; }
        }
      `}</style>
    </div>
  )
}
