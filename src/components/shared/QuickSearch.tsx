'use client'

import { useState, useCallback } from 'react'

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

  const handleSearch = useCallback(async (value: string) => {
    setQuery(value)
    if (value.length < 2) {
      setResults([])
      return
    }

    setIsLoading(true)
    try {
      const searchResults = await onSearch(value)
      setResults(searchResults)
      setIsOpen(true)
    } finally {
      setIsLoading(false)
    }
  }, [onSearch])

  return (
    <div style={{ position: 'relative', marginBottom: 20 }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        padding: '10px 16px',
        borderRadius: 8,
        border: '1px solid var(--color-border)',
        background: 'var(--color-surface-card)',
      }}>
        <span>🔍</span>
        <input
          type="text"
          placeholder="Chercher un pronostiqueur ou équipe..."
          value={query}
          onChange={(e) => handleSearch(e.target.value)}
          onFocus={() => query.length >= 2 && setIsOpen(true)}
          style={{
            flex: 1,
            border: 'none',
            background: 'transparent',
            fontSize: '0.9rem',
            outline: 'none',
            color: 'var(--color-text)',
          }}
        />
        {isLoading && <span style={{ fontSize: '0.8rem' }}>⏳</span>}
      </div>

      {isOpen && results.length > 0 && (
        <div style={{
          position: 'absolute',
          top: '100%',
          left: 0,
          right: 0,
          marginTop: 8,
          background: 'var(--color-surface-card)',
          border: '1px solid var(--color-border)',
          borderRadius: 8,
          maxHeight: 300,
          overflowY: 'auto',
          zIndex: 1000,
        }}>
          {results.map((result, idx) => (
            <button
              key={result.id}
              onClick={() => {
                onSelect(result)
                setQuery('')
                setResults([])
                setIsOpen(false)
              }}
              style={{
                width: '100%',
                padding: '12px 16px',
                borderBottom: idx < results.length - 1 ? '1px solid var(--color-border)' : 'none',
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                textAlign: 'left',
                transition: 'background 0.15s',
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = 'var(--color-surface)'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
            >
              {result.avatar ? (
                <img src={result.avatar} alt="" style={{ width: 32, height: 32, borderRadius: '50%', objectFit: 'cover' }} />
              ) : (
                <div style={{
                  width: 32,
                  height: 32,
                  borderRadius: '50%',
                  background: 'var(--color-surface)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.8rem',
                }}>
                  {result.type === 'pronostiqueur' ? '👤' : '⚽'}
                </div>
              )}
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{result.name}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                  {result.type === 'pronostiqueur' ? 'Pronostiqueur' : 'Équipe'}
                  {result.points !== undefined && ` • ${result.points} pts`}
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      {isOpen && query.length >= 2 && results.length === 0 && !isLoading && (
        <div style={{
          position: 'absolute',
          top: '100%',
          left: 0,
          right: 0,
          marginTop: 8,
          background: 'var(--color-surface-card)',
          border: '1px solid var(--color-border)',
          borderRadius: 8,
          padding: 16,
          textAlign: 'center',
          color: 'var(--color-text-muted)',
          fontSize: '0.85rem',
        }}>
          Aucun résultat trouvé
        </div>
      )}

      {isOpen && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 999,
          }}
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  )
}
