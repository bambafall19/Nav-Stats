import Link from 'next/link'
import type { Database } from '@/types/database.types'

type Profile = Pick<Database['public']['Tables']['profiles']['Row'],
  'id' | 'username' | 'avatar_url' | 'points' | 'total_pronostics' | 'pronostics_corrects' | 'rang'>

const rankMedal = (i: number) => {
  if (i === 0) return { emoji: '🥇', className: 'rank-1' }
  if (i === 1) return { emoji: '🥈', className: 'rank-2' }
  if (i === 2) return { emoji: '🥉', className: 'rank-3' }
  return { emoji: `${i + 1}`, className: '' }
}

export default function TopPronostiqueurs({ users }: { users: Profile[] }) {
  const top3 = users.slice(0, 3)
  const rest = users.slice(3)

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 20 }}>
        <div>
          <h2 className="section-title">🏆 Top Pronostiqueurs</h2>
          <p className="section-subtitle">Classement général des meilleurs</p>
        </div>
        <Link href="/classements" className="btn btn-outline btn-sm" style={{ textDecoration: 'none' }}>
          Voir tout →
        </Link>
      </div>

      {users.length === 0 ? (
        <div className="card" style={{ padding: 40, textAlign: 'center' }}>
          <div style={{ fontSize: '3rem', marginBottom: 12 }}>🏆</div>
          <p style={{ color: 'var(--color-text-secondary)' }}>Soyez le premier à pronostiquer !</p>
        </div>
      ) : (
        <>
          {/* Podium Top 3 */}
          {top3.length > 0 && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 16 }}>
              {top3.map((user, i) => {
                const { emoji } = rankMedal(i)
                const pct = user.total_pronostics > 0
                  ? Math.round((user.pronostics_corrects / user.total_pronostics) * 100)
                  : 0
                return (
                  <Link key={user.id} href={`/profil/${user.id}`} style={{ textDecoration: 'none' }}>
                    <div className={`podium-card${i === 0 ? ' first' : ''}`}>
                      <div style={{ fontSize: '1.6rem', marginBottom: 8 }}>{emoji}</div>
                      <div className="avatar" style={{ width: 44, height: 44, fontSize: '1rem', margin: '0 auto 8px' }}>
                        {user.avatar_url
                          ? <img src={user.avatar_url} alt={user.username} style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                          : user.username.charAt(0).toUpperCase()
                        }
                      </div>
                      <div style={{ fontWeight: 700, fontSize: '0.8rem', color: 'var(--color-text-primary)', marginBottom: 4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {user.username}
                      </div>
                      <div style={{ fontFamily: 'var(--font-outfit)', fontWeight: 900, fontSize: '1.1rem', color: 'var(--color-primary)' }}>
                        {user.points} pts
                      </div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', marginTop: 2 }}>
                        {pct}% réussite
                      </div>
                    </div>
                  </Link>
                )
              })}
            </div>
          )}

          {/* Reste du classement */}
          {rest.length > 0 && (
            <div className="card" style={{ overflow: 'hidden' }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Pronostiqueur</th>
                    <th style={{ textAlign: 'center' }}>Pts</th>
                    <th style={{ textAlign: 'center' }}>Réussite</th>
                  </tr>
                </thead>
                <tbody>
                  {rest.map((user, i) => {
                    const pct = user.total_pronostics > 0
                      ? Math.round((user.pronostics_corrects / user.total_pronostics) * 100)
                      : 0
                    return (
                      <tr key={user.id}>
                        <td>
                          <div style={{
                            width: 28, height: 28,
                            borderRadius: 'var(--radius-full)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: '0.75rem', fontWeight: 700,
                            background: 'var(--color-surface)',
                            color: 'var(--color-text-secondary)',
                          }}>
                            {i + 4}
                          </div>
                        </td>
                        <td>
                          <Link href={`/profil/${user.id}`} style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 10 }}>
                            <div className="avatar" style={{ width: 34, height: 34, fontSize: '0.8rem' }}>
                              {user.avatar_url
                                ? <img src={user.avatar_url} alt={user.username} style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                                : user.username.charAt(0).toUpperCase()
                              }
                            </div>
                            <div>
                              <div style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--color-text-primary)' }}>
                                {user.username}
                              </div>
                              <div style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)' }}>
                                {user.total_pronostics} pronostics
                              </div>
                            </div>
                          </Link>
                        </td>
                        <td style={{ textAlign: 'center' }}>
                          <span className="stat-number" style={{ fontSize: '1rem' }}>{user.points}</span>
                        </td>
                        <td style={{ textAlign: 'center' }}>
                          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: pct >= 60 ? 'var(--color-primary)' : 'var(--color-text-secondary)' }}>
                              {pct}%
                            </span>
                            <div className="progress-bar" style={{ width: 48 }}>
                              <div className="progress-fill" style={{ width: `${pct}%` }} />
                            </div>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  )
}
