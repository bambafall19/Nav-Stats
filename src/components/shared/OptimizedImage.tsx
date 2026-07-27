import Image from 'next/image'

interface OptimizedImageProps {
  src: string
  alt: string
  width?: number
  height?: number
  className?: string
  style?: React.CSSProperties
  priority?: boolean
}

export function OptimizedImage({
  src,
  alt,
  width = 100,
  height = 100,
  className,
  style,
  priority = false,
}: OptimizedImageProps) {
  // Fallback for invalid URLs
  if (!src || !src.startsWith('http')) {
    return (
      <div
        style={{
          width,
          height,
          background: 'var(--color-surface)',
          borderRadius: 8,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          ...style,
        }}
        className={className}
      >
        📷
      </div>
    )
  }

  return (
    <Image
      src={src}
      alt={alt}
      width={width}
      height={height}
      className={className}
      style={style}
      priority={priority}
      loading={priority ? 'eager' : 'lazy'}
      onError={() => {
        // Fallback on error
      }}
    />
  )
}
