'use client'

import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { translations, type Language } from './translations'

type Dict = Record<string, unknown>

interface LanguageContextType {
  language: Language
  setLanguage: (lang: Language) => void
  t: (key: string) => string
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

const STORAGE_KEY = 'navestats_language'

function getNested(dict: Dict | undefined, key: string): unknown {
  if (!dict) return undefined
  return key.split('.').reduce<unknown>((acc, part) => {
    if (acc && typeof acc === 'object' && part in (acc as Dict)) {
      return (acc as Dict)[part]
    }
    return undefined
  }, dict)
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>('fr')

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY) as Language | null
      if (stored === 'fr' || stored === 'wo') {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setLanguageState(stored)
      }
    } catch {
      // localStorage indisponible — ignore
    }
  }, [])

  useEffect(() => {
    document.documentElement.lang = language === 'wo' ? 'wo' : 'fr'
    try {
      localStorage.setItem(STORAGE_KEY, language)
    } catch {
      // ignore
    }
  }, [language])

  const setLanguage = useCallback((lang: Language) => {
    setLanguageState(lang)
  }, [])

  const t = useCallback(
    (key: string): string => {
      const fr = getNested(translations.fr as unknown as Dict, key)
      if (language === 'fr') return typeof fr === 'string' ? fr : key
      const wo = getNested(translations.wo as unknown as Dict, key)
      return typeof wo === 'string' ? wo : typeof fr === 'string' ? fr : key
    },
    [language]
  )

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (!context) throw new Error('useLanguage must be used within LanguageProvider')
  return context
}

export function useT() {
  return useLanguage().t
}
