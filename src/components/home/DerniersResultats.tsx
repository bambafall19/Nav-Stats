import type { Database } from '@/types/database.types'

type Match = Database['public']['Tables']['matchs']['Row'] & {
  equipe_a: Database['public']['Tables']['equipes']['Row']
  equipe_b: Database['public']['Tables']['equipes']['Row']
}

export default function DerniersResultats({ matchs }: { matchs: Match[] }) {
  return (
    <div>
      <h2 className="section-title" style={{ marginBottom: 4 }}>📋 Derniers Résultats</h2>
      <p className="section-subtitle" style={{ marginBottom: 20 }}>Résultats récents</p>

      <div className="card" style={{ overflow: 'hidden' }}>
        {matchs.map((match, i) => {
          const isWinA = (match.score_a ?? 0) > (match.score_b ?? 0)
          const isWinB = (match.score_b ?? 0) > (match.score_a ?? 0)
          const matchDate = new Date(match.date_match)

          return (
            <div key={match.id} style={{
              padding: '14px 20px',
              borderBottom: i < matchs.length - 1 ? '1px solid var(--color-border)' : 'none',
              display: 'grid',
              gridTemplateColumns: '1fr auto 1fr',
              gap: 12,
              alignItems: 'center',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'flex-end' }}>
                <span style={{ fontSize: '0.875rem', fontWeight: isWinA ? 700 : 400, color: isWinA ? 'var(--color-primary)' : 'var(--color-text-secondary)', textAlign: 'right' }}>
                  {match.equipe_a.nom}
                </span>
                {match.equipe_a.logo_url ? (
                  <img src={match.equipe_a.logo_url} alt={match.equipe_a.nom} style={{ width: 28, height: 28, borderRadius: 6, objectFit: 'cover', flexShrink: 0 }} />
                ) : (
                  <div style={{
                    width: 28, height: 28, borderRadius: 6,
                    background: `linear-gradient(135deg, ${match.equipe_a.couleur_principale || '#006233'}, ${match.equipe_a.couleur_secondaire || '#FBBF00'})`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '0.65rem', fontWeight: 800, color: 'white', flexShrink: 0,
                  }}>
                    {match.equipe_a.sigle || match.equipe_a.nom.charAt(0)}
                  </div>
                )}
              </div>

              <div style={{ textAlign: 'center' }}>
                <div style={{ fontFamily: 'var(--font-outfit)', fontWeight: 900, fontSize: '1.1rem', letterSpacing: '-0.02em' }}>
                  {match.score_a} – {match.score_b}
                </div>
                <div style={{ fontSize: '0.65rem', color: 'var(--color-text-muted)' }}>
                  {matchDate.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                {match.equipe_b.logo_url ? (
                  <img src={match.equipe_b.logo_url} alt={match.equipe_b.nom} style={{ width: 28, height: 28, borderRadius: 6, objectFit: 'cover', flexShrink: 0 }} />
                ) : (
                  <div style={{
                    width: 28, height: 28, borderRadius: 6,
                    background: `linear-gradient(135deg, ${match.equipe_b.couleur_principale || '#006233'}, ${match.equipe_b.couleur_secondaire || '#FBBF00'})`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '0.65rem', fontWeight: 800, color: 'white', flexShrink: 0,
                  }}>
                    {match.equipe_b.sigle || match.equipe_b.nom.charAt(0)}
                  </div>
                )}
                <span style={{ fontSize: '0.875rem', fontWeight: isWinB ? 700 : 400, color: isWinB ? 'var(--color-primary)' : 'var(--color-text-secondary)' }}>
                  {match.equipe_b.nom}
                </span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
