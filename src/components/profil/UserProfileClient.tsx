'use client'

import { useState } from 'react'
import { BadgesDisplay, ACHIEVEMENT_BADGES } from '@/components/shared/BadgesDisplay'
import { SocialShareButtons } from '@/components/shared/SocialShareButtons'
import { FollowButton, FollowersList } from '@/components/shared/FollowSystem'
import { ComparisonChart } from '@/components/shared/ComparisonChart'

interface UserProfileClientProps {
  user: any
  followers: any[]
  isFollowing: boolean
  onFollowChange: (userId: string, isFollowing: boolean) => Promise<void>
}

export function UserProfileClient({
  user,
  followers,
  isFollowing: initialFollowing,
  onFollowChange,
}: UserProfileClientProps) {
  const [showComparison, setShowComparison] = useState(false)
  const [comparisonUser, setComparisonUser] = useState<any>(null)

  const pct = user?.total_pronostics > 0
    ? Math.round((user.pronostics_corrects / user.total_pronostics) * 100)
    : 0

  const userBadges = ACHIEVEMENT_BADGES.map(badge => ({
    ...badge,
    earned: false, // À remplacer par la logique réelle
  }))

  const shareText = `Découvrez mon classement sur NavéStats: ${user?.username} - ${user?.points} points (${pct}% de réussite)`
  const shareUrl = typeof window !== 'undefined' ? window.location.href : ''

  return (
    <div style={{ display: 'grid', gap: 24 }}>
      {/* En-tête profil */}
      <div style={{
        background: 'var(--gradient-hero)',
        borderRadius: 'var(--radius-xl)',
        padding: 24,
        color: 'white',
        position: 'relative',
        overflow: 'hidden',
        boxShadow: 'var(--shadow-green)',
      }}>
        <div style={{ position: 'absolute', top: -40, right: -20, fontSize: 100, opacity: 0.1 }}>👤</div>
        <div style={{
          position: 'absolute', bottom: -60, left: -30, width: 160, height: 160, borderRadius: '50%',
          background: 'rgba(255,255,255,0.05)',
        }} />
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16, marginBottom: 16 }}>
            {user?.avatar_url ? (
              <img
                src={user.avatar_url}
                alt=""
                style={{ width: 80, height: 80, borderRadius: '50%', objectFit: 'cover', border: '3px solid white' }}
              />
            ) : (
              <div style={{
                width: 80,
                height: 80,
                borderRadius: '50%',
                background: 'rgba(255,255,255,0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '2rem',
                border: '3px solid white',
              }}>
                👤
              </div>
            )}
            <div style={{ flex: 1 }}>
              <h1 style={{ fontSize: '1.5rem', fontWeight: 900, margin: 0, marginBottom: 4, color: 'white' }}>
                {user?.username}
              </h1>
              <p style={{ margin: 0, opacity: 0.9, fontSize: '0.9rem' }}>
                {user?.quartier && `${user.quartier} • `}
                {user?.asc_nom && `ASC ${user.asc_nom}`}
              </p>
            </div>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: 10,
            marginBottom: 16,
          }}>
            <div style={{ background: 'rgba(255,255,255,0.12)', borderRadius: 'var(--radius-md)', padding: 12, textAlign: 'center', border: '1px solid rgba(255,255,255,0.14)' }}>
              <div style={{ fontSize: '0.78rem', opacity: 0.8, fontWeight: 600 }}>Points</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 900 }}>{user?.points || 0}</div>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.12)', borderRadius: 'var(--radius-md)', padding: 12, textAlign: 'center', border: '1px solid rgba(255,255,255,0.14)' }}>
              <div style={{ fontSize: '0.78rem', opacity: 0.8, fontWeight: 600 }}>Réussite</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 900 }}>{pct}%</div>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.12)', borderRadius: 'var(--radius-md)', padding: 12, textAlign: 'center', border: '1px solid rgba(255,255,255,0.14)' }}>
              <div style={{ fontSize: '0.78rem', opacity: 0.8, fontWeight: 600 }}>Pronostics</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 900 }}>{user?.total_pronostics || 0}</div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 8 }}>
            <FollowButton
              userId={user?.id}
              isFollowing={initialFollowing}
              onFollowChange={onFollowChange}
            />
            <button
              onClick={() => setShowComparison(!showComparison)}
              style={{
                padding: '8px 16px',
                borderRadius: 'var(--radius-md)',
                border: '1px solid rgba(255,255,255,0.3)',
                background: 'rgba(255,255,255,0.1)',
                color: 'white',
                cursor: 'pointer',
                fontWeight: 700,
                fontSize: '0.82rem',
                backdropFilter: 'blur(8px)',
                transition: 'background var(--transition-base)',
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.2)'}
              onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
            >
              ⚖️ Comparer
            </button>
          </div>
        </div>
      </div>

      {/* Partage social */}
      <div style={{
        background: 'var(--color-surface-card)',
        border: '1px solid var(--color-border-subtle)',
        borderRadius: 'var(--radius-lg)',
        padding: 16,
        boxShadow: 'var(--shadow-card)',
      }}>
        <div style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: 12 }}>Partager mon profil</div>
        <SocialShareButtons
          title={user?.username}
          text={shareText}
          url={shareUrl}
        />
      </div>

      {/* Badges */}
      <div style={{
        background: 'var(--color-surface-card)',
        border: '1px solid var(--color-border-subtle)',
        borderRadius: 'var(--radius-lg)',
        padding: 16,
        boxShadow: 'var(--shadow-card)',
      }}>
        <div style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: 12 }}>🏆 Achievements</div>
        <BadgesDisplay badges={userBadges} />
      </div>

      {/* Followers */}
      {followers.length > 0 && (
        <div style={{
          background: 'var(--color-surface-card)',
          border: '1px solid var(--color-border-subtle)',
          borderRadius: 'var(--radius-lg)',
          padding: 16,
        }}>
          <div style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: 12 }}>
            👥 Followers ({followers.length})
          </div>
          <FollowersList followers={followers} />
        </div>
      )}

      {/* Statistiques détaillées */}
      <div style={{
        background: 'var(--color-surface-card)',
        border: '1px solid var(--color-border-subtle)',
        borderRadius: 'var(--radius-lg)',
        padding: 16,
        boxShadow: 'var(--shadow-card)',
      }}>
        <div style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: 16 }}>📊 Statistiques</div>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: 12,
        }}>
          <div style={{
            background: 'var(--color-surface)',
            borderRadius: 'var(--radius-lg)',
            padding: 12,
            textAlign: 'center',
          }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginBottom: 4 }}>
              Corrects
            </div>
            <div style={{ fontSize: '1.3rem', fontWeight: 900, color: 'var(--color-primary)' }}>
              {user?.pronostics_corrects || 0}
            </div>
          </div>
          <div style={{
            background: 'var(--color-surface)',
            borderRadius: 'var(--radius-lg)',
            padding: 12,
            textAlign: 'center',
          }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginBottom: 4 }}>
              Incorrects
            </div>
            <div style={{ fontSize: '1.3rem', fontWeight: 900, color: '#E74C3C' }}>
              {(user?.total_pronostics || 0) - (user?.pronostics_corrects || 0)}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
