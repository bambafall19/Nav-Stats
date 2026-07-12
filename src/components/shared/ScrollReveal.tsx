'use client'

import { useEffect, useRef } from 'react'

interface ScrollRevealProps {
  children: React.ReactNode
  delay?: number
  direction?: 'up' | 'left' | 'right' | 'fade'
  className?: string
  style?: React.CSSProperties
}

export default function ScrollReveal({
  children,
  delay = 0,
  direction = 'up',
  className,
  style,
}: ScrollRevealProps) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const getInitialTransform = () => {
      switch (direction) {
        case 'up': return 'translateY(32px)'
        case 'left': return 'translateX(-32px)'
        case 'right': return 'translateX(32px)'
        case 'fade': return 'scale(0.97)'
        default: return 'translateY(32px)'
      }
    }

    el.style.opacity = '0'
    el.style.transform = getInitialTransform()
    el.style.transition = `opacity 0.6s ease ${delay}ms, transform 0.6s ease ${delay}ms`

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.style.opacity = '1'
          el.style.transform = 'none'
          observer.unobserve(el)
        }
      },
      { threshold: 0.12, rootMargin: '0px 0px -30px 0px' }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [delay, direction])

  return (
    <div ref={ref} className={className} style={style}>
      {children}
    </div>
  )
}
