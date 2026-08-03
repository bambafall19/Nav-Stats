'use client'

import { useState, useEffect, useRef, ReactNode } from 'react'

interface PullToRefreshProps {
  onRefresh: () => Promise<void>
  children: ReactNode
  className?: string
}

export default function PullToRefresh({ onRefresh, children, className }: PullToRefreshProps) {
  const [pullDistance, setPullDistance] = useState(0)
  const [refreshing, setRefreshing] = useState(false)
  const startY = useRef(0)
  const isPulling = useRef(false)
  const containerRef = useRef<HTMLDivElement>(null)

  const THRESHOLD = 80

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const isMobile = /iphone|ipad|ipod|android/i.test(navigator.userAgent)
    if (!isMobile) return

    const onTouchStart = (e: TouchEvent) => {
      // Only trigger when at top of page
      if (window.scrollY <= 0) {
        startY.current = e.touches[0].clientY
        isPulling.current = true
      }
    }

    const onTouchMove = (e: TouchEvent) => {
      if (!isPulling.current || refreshing) return
      const currentY = e.touches[0].clientY
      const diff = currentY - startY.current
      if (diff > 0 && window.scrollY <= 0) {
        // Apply resistance
        const resistance = 0.4
        const distance = Math.min(diff * resistance, 120)
        setPullDistance(distance)
        if (distance > 0) {
          e.preventDefault()
        }
      }
    }

    const onTouchEnd = async () => {
      if (!isPulling.current) return
      isPulling.current = false

      if (pullDistance >= THRESHOLD && !refreshing) {
        setRefreshing(true)
        setPullDistance(THRESHOLD)
        try {
          await onRefresh()
        } finally {
          setRefreshing(false)
          setPullDistance(0)
        }
      } else {
        setPullDistance(0)
      }
    }

    container.addEventListener('touchstart', onTouchStart, { passive: true })
    container.addEventListener('touchmove', onTouchMove, { passive: false })
    container.addEventListener('touchend', onTouchEnd)

    return () => {
      container.removeEventListener('touchstart', onTouchStart)
      container.removeEventListener('touchmove', onTouchMove)
      container.removeEventListener('touchend', onTouchEnd)
    }
  }, [pullDistance, refreshing, onRefresh])

  return (
    <div ref={containerRef} className={className} style={{ position: 'relative' }}>
      {/* Pull indicator */}
      <div style={{
        position: 'absolute',
        top: -50 + pullDistance,
        left: 0,
        right: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: 50,
        pointerEvents: 'none',
        transition: refreshing ? 'none' : 'transform 0.2s ease',
        opacity: Math.min(pullDistance / THRESHOLD, 1),
        zIndex: 10,
      }}>
        <div style={{
          width: 36,
          height: 36,
          borderRadius: '50%',
          background: 'var(--color-surface-card)',
          border: '1px solid var(--color-border)',
          boxShadow: 'var(--shadow-md)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '1rem',
          transform: refreshing ? 'rotate(360deg)' : `rotate(${pullDistance * 3}deg)`,
          transition: refreshing ? 'transform 0.6s linear infinite' : 'transform 0.2s ease',
          color: 'var(--color-primary)',
        }}>
          {refreshing ? '⏳' : '⬇️'}
        </div>
      </div>

      {children}
    </div>
  )
}