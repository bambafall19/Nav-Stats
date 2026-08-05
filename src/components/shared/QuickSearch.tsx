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
    <div style={{ position: 'relative', marginBottom: 20 }}>
      <div style={{
        display: 'flex', alignItems: 'center', gap: 8,
        padding: '10px 14px', borderRadius: 10,
        border: '1px solid var(--color-border-subtle)',
        background: 'var(--color-surface-card)',
      }}>
        <Search size={16} color="var(--color-text-muted)" />
        <input
          type="text"
          placeholder="Chercher un pronostiqueur ou équipe..."
          value={query}
          onChange={(e) => handleSearch(e.target.value)}
          onFocus={() => query.length >= 2 && setIsOpen(true)}
          style={{
            flex: 1, border: 'none', background: 'transparent',
            fontSize: '0.85rem', outline: 'none', color: 'var(--color-text-primary)',
          }}
        />
        {isLoading && <Loader2 size={14} color="var(--color-primary)" style={{ animation: 'spin 1s linear infinite' }} />}
      </div>

      {isOpen && results.length > 0 && (
        <div style={{
          position: 'absolute', top: '100%', left: 0, right: 0, marginTop: 8,
          background: 'var(--color-surface-elevated)', border: '1px solid var(--color-border-subtle)',
          borderRadius: 12, maxHeight: 300, overflowY: 'auto', zIndex: 1000,
          boxShadow: 'var(--shadow-lg)',
        }}>
          {results.map((result, idx) => (
            <button
              key={result.id}
              onClick={() => { onSelect(result); setQuery(''); setResults([]); setIsOpen(false) }}
              style={{
                width: '100%', padding: '12px 14px',
                borderBottom: idx < results.length - 1 ? '1px solid var(--color-border-subtle)' : 'none',
                background: 'transparent', border: 'none', cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: 12, textAlign: 'left',
                transition: 'background 0.15s',
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = 'var(--color-bg-secondary)'}
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
          background: 'var(--color-surface-elevated)', border: '1px solid var(--color-border-subtle)',
          borderRadius: 12, padding: 16, textAlign: 'center',
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
