'use client'

import { useState, useRef, useEffect } from 'react'

interface PullToRefreshProps {
  onRefresh: () => Promise<void>
  children: React.ReactNode
}

export function PullToRefresh({ onRefresh, children }: PullToRefreshProps) {
  const [pulling, setPulling] = useState(false)
  const [pullDistance, setPullDistance] = useState(0)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const startYRef = useRef(0)
  const containerRef = useRef<HTMLDivElement>(null)

  const handleTouchStart = (e: TouchEvent) => {
    if (containerRef.current?.scrollTop === 0) {
      startYRef.current = e.touches[0].clientY
      setPulling(true)
    }
  }

  const handleTouchMove = (e: TouchEvent) => {
    if (!pulling) return

    const currentY = e.touches[0].clientY
    const distance = currentY - startYRef.current

    if (distance > 0) {
      setPullDistance(Math.min(distance, 100))
    }
  }

  const handleTouchEnd = async () => {
    setPulling(false)

    if (pullDistance > 60 && !isRefreshing) {
      setIsRefreshing(true)
      try {
        await onRefresh()
      } finally {
        setIsRefreshing(false)
      }
    }

    setPullDistance(0)
  }

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    container.addEventListener('touchstart', handleTouchStart as any)
    container.addEventListener('touchmove', handleTouchMove as any)
    container.addEventListener('touchend', handleTouchEnd)

    return () => {
      container.removeEventListener('touchstart', handleTouchStart as any)
      container.removeEventListener('touchmove', handleTouchMove as any)
      container.removeEventListener('touchend', handleTouchEnd)
    }
  }, [pulling, pullDistance, isRefreshing])

  return (
    <div
      ref={containerRef}
      style={{
        position: 'relative',
        overflow: 'auto',
        height: '100%',
      }}
    >
      {/* Pull indicator */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: Math.max(0, pullDistance),
          background: 'linear-gradient(180deg, rgba(0,98,51,0.1), transparent)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
          zIndex: 1,
        }}
      >
        {pullDistance > 0 && (
          <div
            style={{
              fontSize: '1.5rem',
              transform: `rotate(${Math.min(pullDistance * 3.6, 360)}deg)`,
              transition: isRefreshing ? 'none' : 'transform 0.2s',
            }}
          >
            {isRefreshing ? '⟳' : '⬇️'}
          </div>
        )}
      </div>

      {/* Content */}
      <div style={{ paddingTop: Math.max(0, pullDistance) }}>
        {children}
      </div>

      {/* Refreshing indicator */}
      {isRefreshing && (
        <div
          style={{
            position: 'fixed',
            top: 'clamp(60px, 15vh, 100px)',
            left: '50%',
            transform: 'translateX(-50%)',
            background: 'var(--color-surface-card)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-full)',
            padding: '8px 16px',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            zIndex: 100,
            boxShadow: 'var(--shadow-lg)',
            animation: 'slideDown 0.3s ease',
          }}
        >
          <span style={{ animation: 'spin 1s linear infinite' }}>⟳</span>
          <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>Actualisation...</span>
        </div>
      )}
    </div>
  )
}
