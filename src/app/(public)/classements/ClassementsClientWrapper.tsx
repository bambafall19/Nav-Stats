'use client'

import { useEffect, useMemo, useState } from 'react'
import { ClassementsClient, type ClassementsClientProps } from '@/components/classements/ClassementsClient'
import { useT } from '@/lib/i18n/LanguageProvider'

const CACHE_KEY = 'navestats_classements_offline_v1'

type CachedData = { savedAt: number; data: ClassementsClientProps }

function readOfflineCache(): CachedData | null {
  if (typeof window === 'undefined' || navigator.onLine) return null
  try {
    const raw = localStorage.getItem(CACHE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw) as CachedData
      if (parsed?.data) return { data: parsed.data, savedAt: parsed.savedAt }
    }
  } catch {
    // ignore
  }
  return null
}

export default function ClassementsClientWrapper(props: ClassementsClientProps) {
  const t = useT()

  const [cached] = useState<CachedData | null>(() => readOfflineCache())

  useEffect(() => {
    if (navigator.onLine) {
      try {
        localStorage.setItem(CACHE_KEY, JSON.stringify({ savedAt: Date.now(), data: props }))
      } catch {
        // ignore
      }
    }
  }, [props])

  const data: ClassementsClientProps = cached?.data ?? props
  const cachedDate = useMemo(() => (cached ? new Date(cached.savedAt) : null), [cached])

  return (
    <>
      {cached && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          marginBottom: 12,
          padding: '9px 12px',
          borderRadius: 10,
          background: 'rgba(255,201,77,0.08)',
          border: '1px solid rgba(255,201,77,0.3)',
          fontSize: '0.7rem',
          fontWeight: 700,
          color: 'var(--color-accent)',
        }}>
          <span>📡</span>
          <span>
            {t('classements.offlineData').replace(
              '{date}',
              cachedDate ? cachedDate.toLocaleDateString('fr-FR') : '—'
            )}
          </span>
        </div>
      )}
      <ClassementsClient {...data} />
    </>
  )
}
