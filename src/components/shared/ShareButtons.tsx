'use client'

interface ShareProps {
  title: string
  text: string
  url?: string
}

export function ShareButtons({ title, text, url = typeof window !== 'undefined' ? window.location.href : '' }: ShareProps) {
  const encodedText = encodeURIComponent(text)
  const encodedUrl = encodeURIComponent(url)

  const shareLinks = [
    {
      name: 'WhatsApp',
      icon: '💬',
      url: `https://wa.me/?text=${encodedText}%20${encodedUrl}`,
    },
    {
      name: 'Twitter',
      icon: '𝕏',
      url: `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`,
    },
    {
      name: 'Facebook',
      icon: '👍',
      url: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
    },
    {
      name: 'Copier',
      icon: '📋',
      url: '#',
      onClick: () => {
        navigator.clipboard.writeText(`${text} ${url}`)
        alert('Lien copié!')
      },
    },
  ]

  return (
    <div style={{
      display: 'flex',
      gap: 8,
      flexWrap: 'wrap',
      marginTop: 'clamp(12px, 2vw, 16px)',
    }}>
      {shareLinks.map(link => (
        <a
          key={link.name}
          href={link.url}
          onClick={link.onClick}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            padding: '8px 12px',
            borderRadius: 'var(--radius-full)',
            background: 'var(--color-surface-card)',
            border: '1px solid var(--color-border)',
            textDecoration: 'none',
            color: 'var(--color-text-primary)',
            fontSize: '0.8rem',
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'all 0.2s',
          }}
          onMouseOver={e => {
            e.currentTarget.style.background = 'var(--color-primary)'
            e.currentTarget.style.color = 'white'
            e.currentTarget.style.borderColor = 'var(--color-primary)'
          }}
          onMouseOut={e => {
            e.currentTarget.style.background = 'var(--color-surface-card)'
            e.currentTarget.style.color = 'var(--color-text-primary)'
            e.currentTarget.style.borderColor = 'var(--color-border)'
          }}
        >
          <span>{link.icon}</span>
          <span>{link.name}</span>
        </a>
      ))}
    </div>
  )
}
