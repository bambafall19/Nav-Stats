'use client'

import { useState, type CSSProperties } from 'react'
import MatchListClient, { type Match } from '@/components/matchs/MatchListClient'
import CadetsClient from '@/components/cadets/CadetsClient'
import type { CadetEquipe, CadetMatch } from '@/lib/cadets'
import { useT } from '@/lib/i18n/LanguageProvider'

type CatTab = 'senior' | 'cadets'

interface MatchsClientWrapperProps {
  initialMatchs: Match[]
  cadetMatches: CadetMatch[]
  equipesList: CadetEquipe[]
  journees: number[]
  initialTab?: CatTab
}

export default function MatchsClientWrapper({
  initialMatchs,
  cadetMatches,
  equipesList,
  journees,
  initialTab = 'senior',
}: MatchsClientWrapperProps) {
  const t = useT()
  const [tab, setTab] = useState<CatTab>(initialTab)

  const toggleStyle = (active: boolean): CSSProperties => ({
    flex: 1,
    maxWidth: 200,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
    padding: '10px 18px',
    borderRadius: 999,
    border: active ? '1px solid transparent' : '1px solid rgba(255, 255, 255, 0.08)',
    background: active ? 'var(--gradient-green)' : 'rgba(255, 255, 255, 0.04)',
    color: active ? '#04120A' : 'var(--color-text-secondary)',
    fontWeight: active ? 800 : 600,
    fontSize: '0.85rem',
    cursor: 'pointer',
    fontFamily: 'var(--font-plus-jakarta)',
    transition: 'all 0.2s ease',
    minHeight: 44,
    boxShadow: active ? '0 6px 20px rgba(42,255,160,0.28)' : 'none',
    letterSpacing: '-0.01em',
  })

  return (
    <>
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        gap: 8,
        marginBottom: 16,
        padding: 6,
        borderRadius: 999,
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(255,255,255,0.06)',
        maxWidth: 420,
        marginLeft: 'auto',
        marginRight: 'auto',
      }}>
        <button style={toggleStyle(tab === 'senior')} onClick={() => setTab('senior')}>
          <span>⚽</span> {t('matchs.senior')}
        </button>
        <button style={toggleStyle(tab === 'cadets')} onClick={() => setTab('cadets')}>
          <span>👶</span> {t('matchs.cadets')}
        </button>
      </div>

      {tab === 'senior' ? (
        <MatchListClient initialMatchs={initialMatchs} />
      ) : (
        <CadetsClient cadetMatches={cadetMatches} equipesList={equipesList} journees={journees} />
      )}
    </>
  )
}
