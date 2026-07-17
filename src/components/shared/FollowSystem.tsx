'use client'

import { useState } from 'react'

interface FollowButtonProps {
  userId: string
  isFollowing: boolean
  onFollowChange: (userId: string, isFollowing: boolean) => Promise<void>
}

export function FollowButton({ userId, isFollowing: initialFollowing, onFollowChange }: FollowButtonProps) {
  const [isFollowing, setIsFollowing] = useState(initialFollowing)
  const [isLoading, setIsLoading] = useState(false)

  const handleToggle = async () => {
    setIsLoading(true)
    try {
      await onFollowChange(userId, !isFollowing)
      setIsFollowing(!isFollowing)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <button
      onClick={handleToggle}
      disabled={isLoading}
      style={{
        padding: '8px 16px',
        borderRadius: 6,
        border: isFollowing ? 'none' : '1px solid var(--color-border)',
        background: isFollowing ? 'var(--color-primary)' : 'var(--color-surface-card)',
        color: isFollowing ? 'white' : 'var(--color-text)',
        cursor: isLoading ? 'not-allowed' : 'pointer',
        fontWeight: 600,
        fontSize: '0.85rem',
        opacity: isLoading ? 0.6 : 1,
        transition: 'all 0.2s',
      }}
    >
      {isLoading ? '⏳' : isFollowing ? '✓ Suivi' : '+ Suivre'}
    </button>
  )
}

interface FollowersListProps {
  followers: Array<{
    id: string
    username: string
    avatar_url?: string
    points: number
  }>
}

export function FollowersList({ followers }: FollowersListProps) {
  return (
    <div style={{
      background: 'var(--color-surface-card)',
      border: '1px solid var(--color-border)',
      borderRadius: 8,
      overflow: 'hidden',
    }}>
      {followers.length === 0 ? (
        <div style={{
          padding: 16,
          textAlign: 'center',
          color: 'var(--color-text-muted)',
          fontSize: '0.85rem',
        }}>
          Aucun follower pour le moment
        </div>
      ) : (
        followers.map((follower, idx) => (
          <div
            key={follower.id}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              padding: '12px 16px',
              borderBottom: idx < followers.length - 1 ? '1px solid var(--color-border)' : 'none',
            }}
          >
            {follower.avatar_url ? (
              <img
                src={follower.avatar_url}
                alt=""
                style={{ width: 32, height: 32, borderRadius: '50%', objectFit: 'cover' }}
              />
            ) : (
              <div style={{
                width: 32,
                height: 32,
                borderRadius: '50%',
                background: 'var(--color-surface)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '0.8rem',
              }}>
                👤
              </div>
            )}
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{follower.username}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                {follower.points} points
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  )
}
