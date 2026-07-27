'use client'

import { useEffect, useRef, useState } from 'react'

interface LazyLoadProps {
  children: React.ReactNode
  threshold?: number
  rootMargin?: string
}

export function LazyLoad({ children, threshold = 0.1, rootMargin = '50px' }: LazyLoadProps) {
  const [isVisible, setIsVisible] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
          observer.unobserve(entry.target)
        }
      },
      { threshold, rootMargin }
    )

    if (ref.current) {
      observer.observe(ref.current)
    }

    return () => {
      if (ref.current) {
        observer.unobserve(ref.current)
      }
    }
  }, [threshold, rootMargin])

  return (
    <div
      ref={ref}
      style={{
        animation: isVisible ? 'fadeInUp 0.4s ease' : 'none',
        opacity: isVisible ? 1 : 0,
      }}
    >
      {isVisible ? children : <div style={{ minHeight: 200 }} />}
    </div>
  )
}
