import Link from 'next/link'
import { Trophy, ArrowRight, Crown, TrendingUp } from 'lucide-react'
import type { Database } from '@/types/database.types'

type Profile = Pick<Database['public']['Tables']['profiles']['Row'],
  'id' | 'username' | 'avatar_url' | 'points' | 'total_pronostics' | 'pronostics_corrects' | 'rang'>

const PODIUM_COLORS = [
  { medal: '🥇', ring: 'linear-gradient(135deg, #ffc94d, #b8860b)', glow: '0 6px 24px rgba(255,201,77,0.35)', bg: 'linear-gradient(160deg, rgba(255,201,77,0.16), rgba(255,201,77,0.02))', border: '1px solid rgba(255,201,77,0.35)' },
  { medal: '🥈', ring: 'linear-gradient(135deg, #cbd5e1, #64748b)', glow: '0 4px 16px rgba(148,163,184,0.25)', bg: 'linear-gradient(160deg, rgba(148,163,184,0.14), rgba(148,163,184,0.02))', border: '1px solid rgba(148,163,184,0.25)' },
  { medal: '🥉', ring: 'linear-gradient(135deg, #fbbf24, #92400e)', glow: '0 4px 16px rgba(217,119,6,0.25)', bg: 'linear-gradient(160deg, rgba(217,119,6,0.14), rgba(217,119,6,0.02))', border: '1px solid rgba(217,119,6,0.25)' },
]

export default function TopPronostiqueurs({ users }: { users: Profile[] }) {
  const top3 = users.slice(0, 3)
  const rest = users.slice(3)

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 18 }}>
        <div>
          <h2 className="section-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Trophy size={20} color="var(--color-accent)" /> Top Pronostiqueurs
          </h2>
          <p className="section-subtitle">Classement général des meilleurs</p>
        </div>
        <Link href="/classements" style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--color-primary)', fontWeight: 600, fontSize: '0.78rem', textDecoration: 'none', fontFamily: 'var(--font-plus-jakarta)' }}>
          Voir tout <ArrowRight size={14} />
        </Link>
      </div>

      {users.length === 0 ? (
        <div className="card" style={{ padding: 40, textAlign: 'center' }}>
          <Trophy size={32} color="var(--color-text-muted)" style={{ marginBottom: 12 }} />
          <p style={{ color: 'var(--color-text-secondary)', fontWeight: 500 }}>Soyez le premier à pronostiquer !</p>
        </div>
      ) : (
        <>
          {/* Podium */}
          {top3.length > 0 && (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: 10,
              alignItems: 'flex-end',
              marginBottom: 16,
            }}>
              {top3.map((user, i) => {
                const style = PODIUM_COLORS[i]
                const pct = user.total_pronostics > 0 ? Math.round((user.pronostics_corrects / user.total_pronostics) * 100) : 0
                const profileHref = user.id ? `/profil/${user.id}` : '/classements'
                const isFirst = i === 0
                return (
                  <Link key={user.id || `${user.username}-${i}`} href={profileHref} style={{ textDecoration: 'none' }}>
                    <div className={`podium-card${isFirst ? ' first' : ''}`} style={{
                      position: 'relative',
                      display: 'flex', flexDirection: 'column', alignItems: 'center',
                      padding: isFirst ? '22px 12px 18px' : '16px 12px 14px',
                      background: style.bg,
                      border: style.border,
                      borderRadius: 'var(--radius-lg)',
                      boxShadow: isFirst ? style.glow : 'var(--shadow-card)',
                      transform: isFirst ? 'translateY(-6px)' : 'none',
                      transition: 'all var(--transition-base) var(--ease-out)',
                      overflow: 'hidden',
                    }}>
                      {isFirst && (
                        <div style={{
                          position: 'absolute', top: 0, left: 0, right: 0, height: 3,
                          background: 'linear-gradient(90deg, transparent, #ffc94d, transparent)',
                        }} />
                      )}
                      <div style={{ position: 'relative', marginBottom: 8 }}>
                        {isFirst && (
                          <div style={{
                            position: 'absolute', top: -22, left: '50%', transform: 'translateX(-50%)',
                            width: 30, height: 30, borderRadius: 9,
                            background: 'linear-gradient(135deg, #ffc94d, #b8860b)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            boxShadow: '0 4px 14px rgba(255,201,77,0.4)',
                          }}>
                            <Crown size={15} color="#0a0f0d" strokeWidth={2.4} />
                          </div>
                        )}
                        <div style={{ fontSize: isFirst ? '1.5rem' : '1.2rem' }}>{style.medal}</div>
                      </div>
                      <div className="podium-ring" style={{
                        width: isFirst ? 52 : 44, height: isFirst ? 52 : 44, margin: '0 auto 8px', borderRadius: '50%',
                        padding: 2.5, background: style.ring,
                        boxShadow: style.glow,
                      }}>
                        <div className="avatar" style={{ width: '100%', height: '100%', fontSize: '0.9rem', borderRadius: '50%' }}>
                          {user.avatar_url
                            ? <img src={user.avatar_url} alt={user.username} style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                            : user.username.charAt(0).toUpperCase()
                          }
                        </div>
                      </div>
                      <div className="podium-name" style={{
                        fontWeight: 700, fontSize: '0.78rem', color: 'var(--color-text-primary)',
                        marginBottom: 4, fontFamily: 'var(--font-plus-jakarta)',
                        maxWidth: '100%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                      }}>
                        {user.username}
                      </div>
                      <div className="podium-points" style={{ fontFamily: 'var(--font-mono)', fontWeight: 800, fontSize: isFirst ? '1.15rem' : '1rem', color: isFirst ? 'var(--color-accent)' : 'var(--color-primary)' }}>
                        {user.points} pts
                      </div>
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: '0.62rem', color: 'var(--color-text-muted)', marginTop: 4, fontFamily: 'var(--font-plus-jakarta)' }}>
                        <TrendingUp size={11} color={pct >= 50 ? 'var(--color-primary)' : 'var(--color-text-muted)'} /> {pct}% réussite
                      </div>
                    </div>
                  </Link>
                )
              })}
            </div>
          )}

          {/* Rest */}
          {rest.length > 0 && (
            <div style={{
              background: 'var(--color-surface-card)',
              border: '1px solid var(--color-border-subtle)',
              borderRadius: 'var(--radius-xl)',
              overflow: 'hidden',
              boxShadow: 'var(--shadow-card)',
            }}>
              {rest.map((user, i) => {
                const pct = user.total_pronostics > 0 ? Math.round((user.pronostics_corrects / user.total_pronostics) * 100) : 0
                const profileHref = user.id ? `/profil/${user.id}` : '/classements'
                return (
                  <Link key={user.id || `${user.username}-${i + 3}`} href={profileHref} style={{ textDecoration: 'none' }}>
                    <div className="pros-rest-row" style={{
                      display: 'flex', alignItems: 'center', gap: 12,
                      padding: '11px 16px',
                      borderBottom: i < rest.length - 1 ? '1px solid var(--color-border-subtle)' : 'none',
                      transition: 'background 0.15s',
                    }}>
                      <div style={{
                        width: 28, height: 28, borderRadius: 9, flexShrink: 0,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '0.7rem', fontWeight: 800,
                        background: 'var(--color-bg-secondary)', color: 'var(--color-text-secondary)',
                        fontFamily: 'var(--font-mono)',
                      }}>
                        {i + 4}
                      </div>
                      <div className="avatar" style={{ width: 32, height: 32, fontSize: '0.75rem', flexShrink: 0 }}>
                        {user.avatar_url
                          ? <img src={user.avatar_url} alt={user.username} style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                          : user.username.charAt(0).toUpperCase()
                        }
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{
                          fontWeight: 600, fontSize: '0.8rem', color: 'var(--color-text-primary)',
                          fontFamily: 'var(--font-plus-jakarta)',
                          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                        }}>{user.username}</div>
                        <div style={{ fontSize: '0.62rem', color: 'var(--color-text-muted)' }}>{user.total_pronostics} pronostics · {pct}% réussite</div>
                      </div>
                      <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 800, fontSize: '0.9rem', color: 'var(--color-primary)', flexShrink: 0 }}>
                        {user.points} <span style={{ fontSize: '0.56rem', color: 'var(--color-text-muted)', fontWeight: 600 }}>pts</span>
                      </div>
                    </div>
                  </Link>
                )
              })}
            </div>
          )}
        </>
      )}

      <style>{`
        .podium-card:hover { transform: translateY(-8px) !important; box-shadow: var(--shadow-card-hover) !important; }
        .pros-rest-row:hover { background: var(--color-surface-hover); }
        @media (max-width: 767px) {
          .podium-card { padding: 16px 6px 13px !important; }
          .podium-ring { width: 40px !important; height: 40px !important; }
          .podium-name { font-size: 0.7rem !important; }
          .podium-points { font-size: 0.9rem !important; }
          .pros-rest-row { padding: 10px 14px !important; }
        }
      `}</style>
    </div>
  )
}
