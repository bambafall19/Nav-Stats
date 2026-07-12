'use client'

import Image from 'next/image'
import React, { useState } from 'react'

interface ImageOptimizedProps {
  src: string
  alt: string
  width: number
  height: number
  quality?: number
  priority?: boolean
  className?: string
}

export default function ImageOptimized({
  src,
  alt,
  width,
  height,
  quality = 75,
  priority = false,
  className,
}: ImageOptimizedProps) {
  const [isLoading, setIsLoading] = useState(true)

  return (
    <div style={{ position: 'relative', overflow: 'hidden' }}>
      {isLoading && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: '#e0e0e0',
            animation: 'pulse 2s infinite',
            zIndex: 1,
          }}
        />
      )}
      <Image
        src={src}
        alt={alt}
        width={width}
        height={height}
        quality={quality}
        priority={priority}
        loading={priority ? 'eager' : 'lazy'}
        onLoadingComplete={() => setIsLoading(false)}
        className={className}
        style={{
          width: '100%',
          height: 'auto',
          display: 'block',
        }}
      />
    </div>
  )
}
