'use client'

import Image from 'next/image'
import React, { memo } from 'react'

interface TeamBadgeProps {
  name: string
  logo?: string
  size?: 'sm' | 'md' | 'lg'
}

const TeamBadge = memo(function TeamBadge({
  name,
  logo,
  size = 'md',
}: TeamBadgeProps) {
  const sizeMap = {
    sm: { width: 20, height: 20, fontSize: '0.7rem' },
    md: { width: 28, height: 28, fontSize: '0.8rem' },
    lg: { width: 36, height: 36, fontSize: '0.9rem' },
  }

  const dims = sizeMap[size]

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        fontSize: dims.fontSize,
        fontWeight: 600,
        color: '#1a1a2e',
      }}
    >
      {logo ? (
        <Image
          src={logo}
          alt={name}
          width={dims.width}
          height={dims.height}
          style={{ borderRadius: '50%', objectFit: 'cover' }}
        />
      ) : (
        <div
          style={{
            width: dims.width,
            height: dims.height,
            borderRadius: '50%',
            background: '#e0e0e0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '0.6rem',
            fontWeight: 700,
            color: '#999',
          }}
        >
          {name.substring(0, 2).toUpperCase()}
        </div>
      )}
      <span>{name}</span>
    </div>
  )
})

export default TeamBadge
