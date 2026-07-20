'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

interface Equipe {
  id: string
  nom: string
  sigle?: string
  logo_url?: string
  poule?: string
  points_classement: number
  matchs_joues: number
  victoires: number
  nuls: number
  defaites: number
  buts_marques: number
  buts_encaisses: number
}

interface AdminClassementClientProps {
  equipes: Equipe[]
}

export function AdminClassementClient({ equipes: initialEquipes }: AdminClassementClientProps) {
  const [equipes, setEquipes] = useState(initialEquipes)
  const [saving, setSaving] = useState<string | null>(null)
  const [saved, setSaved] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const supabase = createClient()

  const handleChange = (id: string, field: keyof Equipe, value: string) => {
    setEquipes(prev => prev.map(eq =>
      eq.id === id
        ? { ...eq, [field]: field === 'nom' || field === 'sigle' || field === 'poule' ? value : parseInt(value) || 0 }
        : eq
    ))
  }

  const handleSave = async (eq: Equipe) => {
    setSaving(eq.id)
    const diffButsNets = (eq.buts_marques || 0) - (eq.buts_encaisses || 0)
    // Recalculer les points : 3 par victoire, 1 par nul
    const calculatedPoints = (eq.victoires * 3) + (eq.nuls * 1)

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase as any).from('equipes').update({
      points_classement: calculatedPoints,
      matchs_joues: eq.matchs_joues,
      victoires: eq.victoires,
      nuls: eq.nuls,
      defaites: eq.defaites,
      buts_marques: eq.buts_marques,
      buts_encaisses: eq.buts_encaisses,
    }).eq('id', eq.id)

    setSaving(null)
    if (!error) {
      // Mettre à jour les points calculés localement aussi
      setEquipes(prev => prev.map(e => e.id === eq.id ? { ...e, points_classement: calculatedPoints } : e))
      setSaved(eq.id)
      setTimeout(() => setSaved(null), 2000)
    }
  }

  const filtered = equipes.filter(eq =>
    eq.nom.toLowerCase().includes(search.toLowerCase()) ||
    (eq.poule || '').toLowerCase().includes(search.toLowerCase())
  )

  const poules = [...new Set(equipes.map(e => e.poule || 'Sans poule').filter(Boolean))].sort()

  return (
    <div>
      {/* Barre de recherche + infos */}
      <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 20, flexWrap: 'wrap' }}>
        <input
          type="text"
          placeholder="🔍 Rechercher une équipe ou une poule…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{
            flex: 1, minWidth: 200, padding: '10px 14px', borderRadius: 10,
            border: '1px solid var(--color-border)', background: 'var(--color-surface)',
            fontSize: '0.9rem', outline: 'none', color: 'var(--color-text-primary)',
          }}
        />
        <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', whiteSpace: 'nowrap' }}>
          {filtered.length} équipe(s)
        </span>
        <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', background: 'rgba(0,98,51,0.08)', padding: '6px 12px', borderRadius: 8 }}>
          💡 Les points sont recalculés automatiquement (V×3 + N×1)
        </div>
      </div>

      {/* Tableau par poule */}
      {poules.length > 0 ? (
        poules.filter(poule => filtered.some(eq => (eq.poule || 'Sans poule') === poule)).map(poule => {
          const pouleEquipes = filtered
            .filter(eq => (eq.poule || 'Sans poule') === poule)
            .sort((a, b) => {
              const ptsA = a.victoires * 3 + a.nuls
              const ptsB = b.victoires * 3 + b.nuls
              if (ptsB !== ptsA) return ptsB - ptsA
              const gbA = (a.buts_marques || 0) - (a.buts_encaisses || 0)
              const gbB = (b.buts_marques || 0) - (b.buts_encaisses || 0)
              return gbB - gbA
            })

          return (
            <div key={poule} style={{ marginBottom: 32 }}>
              <div style={{
                display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12,
                padding: '8px 16px', background: 'linear-gradient(90deg, #004d27, #006233)',
                borderRadius: 10, color: 'white',
              }}>
                <span style={{ fontFamily: 'var(--font-outfit)', fontWeight: 900, fontSize: '1rem' }}>
                  🏆 {poule}
                </span>
                <span style={{ fontSize: '0.75rem', opacity: 0.8 }}>{pouleEquipes.length} équipe(s)</span>
              </div>

              {/* Table */}
              <div style={{ overflowX: 'auto', borderRadius: 12, border: '1px solid var(--color-border)' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
                  <thead>
                    <tr style={{ background: '#f8fafc', borderBottom: '2px solid var(--color-border)' }}>
                      <th style={thStyle}>#</th>
                      <th style={{ ...thStyle, textAlign: 'left' }}>Équipe</th>
                      <th style={thStyle} title="Points">Pts</th>
                      <th style={thStyle} title="Matchs joués">J</th>
                      <th style={thStyle} title="Victoires">G</th>
                      <th style={thStyle} title="Nuls">N</th>
                      <th style={thStyle} title="Défaites">P</th>
                      <th style={thStyle} title="Buts marqués">Bp</th>
                      <th style={thStyle} title="Buts concédés">Bc</th>
                      <th style={thStyle} title="Différence de buts">+/-</th>
                      <th style={thStyle}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pouleEquipes.map((eq, idx) => {
                      const pts = eq.victoires * 3 + eq.nuls
                      const diff = (eq.buts_marques || 0) - (eq.buts_encaisses || 0)
                      const isSaving = saving === eq.id
                      const isSaved = saved === eq.id
                      return (
                        <tr
                          key={eq.id}
                          style={{
                            borderBottom: '1px solid var(--color-border)',
                            background: idx % 2 === 0 ? 'white' : '#fafafa',
                            transition: 'background 0.15s',
                          }}
                        >
                          <td style={{ ...tdStyle, fontWeight: 800, color: idx < 2 ? '#006233' : 'var(--color-text-muted)' }}>
                            {idx + 1}
                          </td>
                          <td style={{ ...tdStyle, textAlign: 'left', fontWeight: 700, minWidth: 140 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                              {eq.logo_url
                                ? <img src={eq.logo_url} alt="" style={{ width: 28, height: 28, borderRadius: 6, objectFit: 'cover', flexShrink: 0 }} />
                                : <div style={{ width: 28, height: 28, borderRadius: 6, background: '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', flexShrink: 0 }}>⚽</div>
                              }
                              <span style={{ fontSize: '0.82rem' }}>{eq.nom}</span>
                            </div>
                          </td>
                          <td style={{ ...tdStyle, fontWeight: 900, color: '#006233', fontSize: '0.95rem' }}>{pts}</td>
                          {(['matchs_joues', 'victoires', 'nuls', 'defaites', 'buts_marques', 'buts_encaisses'] as const).map(field => (
                            <td key={field} style={tdStyle}>
                              <input
                                type="number"
                                min={0}
                                value={eq[field] || 0}
                                onChange={e => handleChange(eq.id, field, e.target.value)}
                                style={inputStyle}
                              />
                            </td>
                          ))}
                          <td style={{
                            ...tdStyle,
                            fontWeight: 700,
                            color: diff > 0 ? '#16a34a' : diff < 0 ? '#dc2626' : 'var(--color-text-muted)',
                          }}>
                            {diff > 0 ? `+${diff}` : diff}
                          </td>
                          <td style={tdStyle}>
                            <button
                              onClick={() => handleSave(eq)}
                              disabled={isSaving}
                              style={{
                                padding: '5px 12px', borderRadius: 8, border: 'none',
                                background: isSaved ? '#16a34a' : '#006233',
                                color: 'white', fontWeight: 700, fontSize: '0.75rem',
                                cursor: isSaving ? 'wait' : 'pointer',
                                transition: 'all 0.2s', whiteSpace: 'nowrap',
                              }}
                            >
                              {isSaving ? '⏳' : isSaved ? '✅ Sauvé' : '💾 Sauvegarder'}
                            </button>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )
        })
      ) : (
        /* Si pas de poules définies, tableau simple */
        <div style={{ overflowX: 'auto', borderRadius: 12, border: '1px solid var(--color-border)' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '2px solid var(--color-border)' }}>
                <th style={thStyle}>#</th>
                <th style={{ ...thStyle, textAlign: 'left' }}>Équipe</th>
                <th style={thStyle}>Pts</th>
                <th style={thStyle}>J</th>
                <th style={thStyle}>G</th>
                <th style={thStyle}>N</th>
                <th style={thStyle}>P</th>
                <th style={thStyle}>Bp</th>
                <th style={thStyle}>Bc</th>
                <th style={thStyle}>+/-</th>
                <th style={thStyle}>Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered
                .sort((a, b) => (b.victoires * 3 + b.nuls) - (a.victoires * 3 + a.nuls))
                .map((eq, idx) => {
                  const pts = eq.victoires * 3 + eq.nuls
                  const diff = (eq.buts_marques || 0) - (eq.buts_encaisses || 0)
                  const isSaving = saving === eq.id
                  const isSaved = saved === eq.id
                  return (
                    <tr key={eq.id} style={{ borderBottom: '1px solid var(--color-border)', background: idx % 2 === 0 ? 'white' : '#fafafa' }}>
                      <td style={{ ...tdStyle, fontWeight: 800, color: idx < 2 ? '#006233' : 'var(--color-text-muted)' }}>{idx + 1}</td>
                      <td style={{ ...tdStyle, textAlign: 'left', fontWeight: 700, minWidth: 140 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          {eq.logo_url
                            ? <img src={eq.logo_url} alt="" style={{ width: 28, height: 28, borderRadius: 6, objectFit: 'cover' }} />
                            : <div style={{ width: 28, height: 28, borderRadius: 6, background: '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem' }}>⚽</div>
                          }
                          {eq.nom}
                        </div>
                      </td>
                      <td style={{ ...tdStyle, fontWeight: 900, color: '#006233' }}>{pts}</td>
                      {(['matchs_joues', 'victoires', 'nuls', 'defaites', 'buts_marques', 'buts_encaisses'] as const).map(field => (
                        <td key={field} style={tdStyle}>
                          <input type="number" min={0} value={eq[field] || 0} onChange={e => handleChange(eq.id, field, e.target.value)} style={inputStyle} />
                        </td>
                      ))}
                      <td style={{ ...tdStyle, fontWeight: 700, color: diff > 0 ? '#16a34a' : diff < 0 ? '#dc2626' : 'var(--color-text-muted)' }}>
                        {diff > 0 ? `+${diff}` : diff}
                      </td>
                      <td style={tdStyle}>
                        <button
                          onClick={() => handleSave(eq)}
                          disabled={isSaving}
                          style={{ padding: '5px 12px', borderRadius: 8, border: 'none', background: isSaved ? '#16a34a' : '#006233', color: 'white', fontWeight: 700, fontSize: '0.75rem', cursor: isSaving ? 'wait' : 'pointer' }}
                        >
                          {isSaving ? '⏳' : isSaved ? '✅ Sauvé' : '💾 Sauvegarder'}
                        </button>
                      </td>
                    </tr>
                  )
                })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

const thStyle: React.CSSProperties = {
  padding: '10px 8px', textAlign: 'center', fontSize: '0.78rem',
  fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em',
}
const tdStyle: React.CSSProperties = {
  padding: '8px 6px', textAlign: 'center', verticalAlign: 'middle',
}
const inputStyle: React.CSSProperties = {
  width: 48, padding: '4px 6px', textAlign: 'center',
  border: '1px solid #e2e8f0', borderRadius: 6, fontSize: '0.82rem',
  background: 'white', fontWeight: 600, outline: 'none',
}
