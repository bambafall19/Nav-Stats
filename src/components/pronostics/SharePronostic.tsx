'use client'

import { useState } from 'react'

interface SharePronosticProps {
  equipeA: string
  equipeB: string
  pronostic: 'equipe_a' | 'equipe_b' | 'nul'
  dateMatch?: string
}

const RESULT_LABELS: Record<string, string> = {
  equipe_a: 'victoire de',
  equipe_b: 'victoire de',
  nul: 'match nul entre',
}

export default function SharePronostic({ equipeA, equipeB, pronostic, dateMatch }: SharePronosticProps) {
  const [copied, setCopied] = useState(false)

  const buildText = () => {
    const dateStr = dateMatch
      ? ` le ${new Date(dateMatch).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })}`
      : ''
    if (pronostic === 'nul') {
      return `🔮 Mon pronostic NavéStats : Match nul entre ${equipeA} et ${equipeB}${dateStr} ! 🟡\n🏆 Navétanes Khombole 2026 – navestats.com`
    }
    const winner = pronostic === 'equipe_a' ? equipeA : equipeB
    return `🔮 Mon pronostic NavéStats : Victoire de ${winner}${dateStr} ! 🟢\n🏆 Navétanes Khombole 2026 – navestats.com`
  }

  const text = buildText()
  const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(text)}`
  const twitterUrl = `https://x.com/intent/tweet?text=${encodeURIComponent(text)}`

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // fallback
    }
  }

  return (
    <div style={{
      background: 'linear-gradient(135deg, rgba(0,98,51,0.06), rgba(251,191,0,0.06))',
      border: '1px solid var(--color-border)',
      borderRadius: 'var(--radius-lg)',
      padding: '20px 24px',
    }}>
      <div style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--color-text-primary)', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
        📲 Partager mon pronostic
      </div>

      {/* Preview */}
      <div style={{
        background: 'var(--color-surface)',
        borderRadius: 'var(--radius-md)',
        padding: '12px 16px',
        fontSize: '0.8rem',
        color: 'var(--color-text-secondary)',
        lineHeight: 1.6,
        marginBottom: 14,
        fontStyle: 'italic',
      }}>
        {text.split('\n').map((line, i) => <div key={i}>{line}</div>)}
      </div>

      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {/* WhatsApp */}
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          id="share-whatsapp-btn"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            padding: '10px 18px',
            borderRadius: 'var(--radius-full)',
            background: '#25D366',
            color: 'white',
            fontWeight: 700,
            fontSize: '0.85rem',
            textDecoration: 'none',
            transition: 'filter 0.2s, transform 0.15s',
            fontFamily: 'var(--font-outfit)',
          }}
          onMouseOver={e => { (e.currentTarget as HTMLElement).style.filter = 'brightness(1.1)'; (e.currentTarget as HTMLElement).style.transform = 'translateY(-1px)' }}
          onMouseOut={e => { (e.currentTarget as HTMLElement).style.filter = ''; (e.currentTarget as HTMLElement).style.transform = '' }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
          WhatsApp
        </a>

        {/* X / Twitter */}
        <a
          href={twitterUrl}
          target="_blank"
          rel="noopener noreferrer"
          id="share-twitter-btn"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            padding: '10px 18px',
            borderRadius: 'var(--radius-full)',
            background: '#000',
            color: 'white',
            fontWeight: 700,
            fontSize: '0.85rem',
            textDecoration: 'none',
            transition: 'filter 0.2s, transform 0.15s',
            fontFamily: 'var(--font-outfit)',
          }}
          onMouseOver={e => { (e.currentTarget as HTMLElement).style.filter = 'brightness(1.3)'; (e.currentTarget as HTMLElement).style.transform = 'translateY(-1px)' }}
          onMouseOut={e => { (e.currentTarget as HTMLElement).style.filter = ''; (e.currentTarget as HTMLElement).style.transform = '' }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.747l7.732-8.857L1.999 2.25H8.08l4.253 5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
          X (Twitter)
        </a>

        {/* Copy */}
        <button
          onClick={handleCopy}
          id="share-copy-btn"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            padding: '10px 18px',
            borderRadius: 'var(--radius-full)',
            background: copied ? 'var(--color-primary)' : 'var(--color-surface)',
            color: copied ? 'white' : 'var(--color-text-secondary)',
            fontWeight: 700,
            fontSize: '0.85rem',
            border: '1px solid var(--color-border)',
            cursor: 'pointer',
            transition: 'all 0.2s',
            fontFamily: 'var(--font-outfit)',
          }}
        >
          {copied ? '✅ Copié !' : '📋 Copier'}
        </button>
      </div>
    </div>
  )
}
