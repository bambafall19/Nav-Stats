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

      <div className="card" style={{ overflow: 'hidden' }}>
        {users.length === 0 ? (
          <div style={{ padding: 40, textAlign: 'center' }}>
            <div style={{ fontSize: '3rem', marginBottom: 12 }}>🏆</div>
            <p style={{ color: 'var(--color-text-secondary)' }}>Soyez le premier à pronostiquer !</p>
          </div>
        ) : (
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
              {users.map((user, i) => {
                const { emoji, className } = rankMedal(i)
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
                        fontSize: i < 3 ? '1rem' : '0.75rem',
                        fontWeight: 700,
                        ...(i < 3 ? { backgroundImage: `linear-gradient(135deg, ${['#FFD700,#FFA500', '#C0C0C0,#A0A0A0', '#CD7F32,#A0522D'][i]})` } : {}),
                        color: i < 3 ? (i === 0 ? '#5a3800' : i === 1 ? '#2a2a2a' : 'white') : 'var(--color-text-secondary)',
                        background: i >= 3 ? 'var(--color-surface)' : undefined,
                      }}>
                        {emoji}
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
        )}
      </div>
    </div>
  )
}
