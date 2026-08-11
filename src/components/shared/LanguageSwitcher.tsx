'use client'

import { Languages } from 'lucide-react'
import { useLanguage } from '@/lib/i18n/LanguageProvider'

export default function LanguageSwitcher({ compact = false }: { compact?: boolean }) {
  const { language, setLanguage } = useLanguage()

  const toggle = () => setLanguage(language === 'fr' ? 'wo' : 'fr')

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label="Changer de langue / Change language"
      title={language === 'fr' ? 'Wolof' : 'Français'}
      className="language-switcher-btn"
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        height: compact ? 36 : 40,
        padding: compact ? '0 10px' : '0 12px',
        borderRadius: 999,
        background: 'rgba(255,255,255,0.06)',
        border: '1px solid rgba(255,255,255,0.1)',
        color: 'var(--color-text-primary)',
        cursor: 'pointer',
        fontFamily: 'var(--font-plus-jakarta)',
        fontWeight: 800,
        fontSize: '0.72rem',
        letterSpacing: '0.04em',
        transition: 'background 0.15s, transform 0.15s',
      }}
      onMouseEnter={e => e.currentTarget.style.background = 'rgba(42,255,160,0.12)'}
      onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.06)'}
    >
      {!compact && <Languages size={13} style={{ opacity: 0.8 }} />}
      <span>{language === 'fr' ? 'FR' : 'WO'}</span>
    </button>
  )
}
