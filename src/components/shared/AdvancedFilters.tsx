'use client'

import { useState } from 'react'
import { SlidersHorizontal, ChevronDown, ChevronRight, RotateCcw } from 'lucide-react'

export interface FilterOptions {
  quartier?: string
  asc?: string
}

interface AdvancedFiltersProps {
  quartiers: string[]
  ascs: string[]
  onFilterChange: (filters: FilterOptions) => void
}

export function AdvancedFilters({ quartiers, ascs, onFilterChange }: AdvancedFiltersProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [filters, setFilters] = useState<FilterOptions>({})

  const handleFilterChange = (newFilters: FilterOptions) => {
    setFilters(newFilters)
    onFilterChange(newFilters)
  }

  const selectStyle: React.CSSProperties = {
    width: '100%', padding: '12px 14px', borderRadius: 12,
    border: '1px solid rgba(255, 255, 255, 0.08)',
    background: 'rgba(255, 255, 255, 0.04)',
    fontSize: '0.85rem', color: 'var(--color-text-primary)',
    fontFamily: 'var(--font-inter), system-ui',
    outline: 'none',
  }

  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <button onClick={() => setIsOpen(!isOpen)} style={{
          padding: '10px 20px', borderRadius: 'var(--radius-full)',
          border: isOpen ? '1px solid rgba(42,255,160,0.45)' : '1px solid rgba(255, 255, 255, 0.08)',
          background: isOpen ? 'rgba(42,255,160,0.1)' : 'rgba(255, 255, 255, 0.04)',
          cursor: 'pointer', fontSize: '0.82rem', fontWeight: 700,
          fontFamily: 'var(--font-plus-jakarta)',
          display: 'inline-flex', alignItems: 'center', gap: 8,
          color: isOpen ? 'var(--color-primary)' : 'var(--color-text-secondary)',
          transition: 'all 0.2s ease',
          minHeight: 42,
          boxShadow: isOpen ? '0 6px 20px rgba(42,255,160,0.18)' : '0 1px 3px rgba(0, 0, 0, 0.3)',
        }}>
          <SlidersHorizontal size={15} />
          Filtres avancés
          {isOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
        </button>
      </div>

      {isOpen && (
        <div style={{
          marginTop: 12, padding: 16, background: 'rgba(255, 255, 255, 0.03)',
          backdropFilter: 'blur(12px) saturate(140%)',
          WebkitBackdropFilter: 'blur(12px) saturate(140%)',
          border: '1px solid rgba(255, 255, 255, 0.07)',
          borderRadius: 18,
          boxShadow: '0 6px 18px rgba(0, 0, 0, 0.22)',
          display: 'grid', gap: 12,
        }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, marginBottom: 6, color: 'var(--color-text-secondary)' }}>Quartier</label>
            <select value={filters.quartier || ''} onChange={(e) => handleFilterChange({ ...filters, quartier: e.target.value || undefined })} style={selectStyle}>
              <option value="">Tous les quartiers</option>
              {quartiers.map(q => <option key={q} value={q}>{q}</option>)}
            </select>
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, marginBottom: 6, color: 'var(--color-text-secondary)' }}>ASC</label>
            <select value={filters.asc || ''} onChange={(e) => handleFilterChange({ ...filters, asc: e.target.value || undefined })} style={selectStyle}>
              <option value="">Tous les ASC</option>
              {ascs.map(a => <option key={a} value={a}>ASC {a}</option>)}
            </select>
          </div>
          <button onClick={() => { setFilters({}); onFilterChange({}) }} style={{
            padding: '10px 14px', borderRadius: 999, border: '1px solid rgba(255, 255, 255, 0.08)',
            background: 'rgba(255, 255, 255, 0.04)', color: 'var(--color-text-muted)',
            cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600,
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
            fontFamily: 'var(--font-plus-jakarta)',
          }}>
            <RotateCcw size={12} /> Réinitialiser les filtres
          </button>
        </div>
      )}
    </div>
  )
}
