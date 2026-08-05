'use client'

import { useState, useCallback } from 'react'
import { Search, Loader2, User, Shield } from 'lucide-react'

export interface SearchResult {
  id: string
  name: string
  type: 'pronostiqueur' | 'equipe'
  avatar?: string
  points?: number
}

interface QuickSearchProps {
  onSearch: (query: string) => Promise<SearchResult[]>
  onSelect: (result: SearchResult) => void
}

export function QuickSearch({ onSearch, onSelect }: QuickSearchProps) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [focused, setFocused] = useState(false)

  const handleSearch = useCallback(async (value: string) => {
    setQuery(value)
    if (value.length < 2) { setResults([]); return }
    setIsLoading(true)
    try {
      const searchResults = await onSearch(value)
      setResults(searchResults)
      setIsOpen(true)
    } finally { setIsLoading(false) }
  }, [onSearch])

  return (
    <div style={{ position: 'relative', marginBottom: 0, width: '100%', minWidth: 0, maxWidth: '100%' }}>
      <div style={{
        display: 'flex', alignItems: 'center', gap: 10,
        padding: '12px 16px', borderRadius: 14,
        border: focused ? '1px solid rgba(42,255,160,0.45)' : '1px solid rgba(255, 255, 255, 0.07)',
        background: focused ? 'rgba(42,255,160,0.05)' : 'rgba(255, 255, 255, 0.03)',
        boxShadow: focused ? '0 0 0 4px rgba(42,255,160,0.08), 0 4px 18px rgba(0,0,0,0.25)' : '0 1px 3px rgba(0, 0, 0, 0.3)',
        transition: 'all 0.2s ease',
      }}>
        <Search size={17} color={focused ? 'var(--color-primary)' : 'var(--color-text-muted)'} style={{ flexShrink: 0, transition: 'color 0.2s' }} />
        <input
          type="text"
          placeholder="Chercher un pronostiqueur ou équipe..."
          value={query}
          onChange={(e) => handleSearch(e.target.value)}
          onFocus={() => { setFocused(true); if (query.length >= 2) setIsOpen(true) }}
          onBlur={() => setFocused(false)}
          style={{
            flex: 1, border: 'none', background: 'transparent',
            fontSize: '0.88rem', outline: 'none', color: 'var(--color-text-primary)',
            fontFamily: 'var(--font-inter)',
            fontWeight: 500,
          }}
        />
        {query && (
          <button
            aria-label="Effacer"
            onClick={() => { setQuery(''); setResults([]); setIsOpen(false) }}
            style={{
              background: 'rgba(255,255,255,0.08)', border: 'none', cursor: 'pointer',
              color: 'var(--color-text-muted)', width: 22, height: 22, borderRadius: '50%',
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
              fontSize: '0.7rem', fontWeight: 700,
            }}
          >✕</button>
        )}
        {isLoading && <Loader2 size={15} color="var(--color-primary)" style={{ animation: 'spin 1s linear infinite' }} />}
      </div>

      {isOpen && results.length > 0 && (
        <div style={{
          position: 'absolute', top: '100%', left: 0, right: 0, marginTop: 8,
          background: 'rgba(14, 17, 15, 0.95)',
          backdropFilter: 'blur(20px) saturate(140%)',
          WebkitBackdropFilter: 'blur(20px) saturate(140%)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: 16, maxHeight: 300, overflowY: 'auto', zIndex: 1000,
          boxShadow: 'var(--shadow-lg)',
          padding: 4,
        }}>
          {results.map((result) => (
            <button
              key={result.id}
              onClick={() => { onSelect(result); setQuery(''); setResults([]); setIsOpen(false) }}
              style={{
                width: '100%', padding: '10px 12px',
                borderRadius: 12,
                background: 'transparent', border: 'none', cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: 12, textAlign: 'left',
                transition: 'background 0.15s',
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
            >
              {result.avatar ? (
                <img src={result.avatar} alt="" style={{ width: 32, height: 32, borderRadius: 8, objectFit: 'cover' }} />
              ) : (
                <div style={{
                  width: 32, height: 32, borderRadius: 8,
                  background: 'var(--color-bg-secondary)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  {result.type === 'pronostiqueur' ? <User size={14} color="var(--color-primary)" /> : <Shield size={14} color="var(--color-accent)" />}
                </div>
              )}
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--color-text-primary)' }}>{result.name}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                  {result.type === 'pronostiqueur' ? 'Pronostiqueur' : 'Équipe'}
                  {result.points !== undefined && ` · ${result.points} pts`}
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      {isOpen && query.length >= 2 && results.length === 0 && !isLoading && (
        <div style={{
          position: 'absolute', top: '100%', left: 0, right: 0, marginTop: 8,
          background: 'rgba(14, 17, 15, 0.95)',
          backdropFilter: 'blur(20px) saturate(140%)',
          WebkitBackdropFilter: 'blur(20px) saturate(140%)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: 16, padding: 16, textAlign: 'center',
          color: 'var(--color-text-muted)', fontSize: '0.85rem',
          boxShadow: 'var(--shadow-lg)',
        }}>
          Aucun résultat trouvé
        </div>
      )}

      {isOpen && (
        <div
          style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 999 }}
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  )
}
