'use client'

interface ShareButtonsProps {
  title: string
  text: string
  url: string
}

export function SocialShareButtons({ title, text, url }: ShareButtonsProps) {
  const encodedUrl = encodeURIComponent(url)
  const encodedText = encodeURIComponent(text)

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
      icon: '📘',
      url: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
    },
    {
      name: 'Copier',
      icon: '📋',
      url: null,
    },
  ]

  const handleCopy = () => {
    navigator.clipboard.writeText(`${text}\n${url}`)
    alert('Lien copié!')
  }

  return (
    <div style={{
      display: 'flex',
      gap: 8,
      flexWrap: 'wrap',
      marginTop: 12,
    }}>
      {shareLinks.map(link => (
        <button
          key={link.name}
          onClick={() => {
            if (link.url) {
              window.open(link.url, '_blank', 'width=600,height=400')
            } else {
              handleCopy()
            }
          }}
          style={{
            padding: '8px 12px',
            borderRadius: 6,
            border: '1px solid var(--color-border)',
            background: 'var(--color-surface-card)',
            cursor: 'pointer',
            fontSize: '0.85rem',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            transition: 'all 0.2s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'var(--color-primary)'
            e.currentTarget.style.color = 'white'
            e.currentTarget.style.borderColor = 'var(--color-primary)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'var(--color-surface-card)'
            e.currentTarget.style.color = 'var(--color-text)'
            e.currentTarget.style.borderColor = 'var(--color-border)'
          }}
        >
          <span>{link.icon}</span>
          <span>{link.name}</span>
        </button>
      ))}
    </div>
  )
}
