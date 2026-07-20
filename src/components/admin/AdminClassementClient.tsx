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
  const [draggedId, setDraggedId] = useState<string | null>(null)
  const [dragOverId, setDragOverId] = useState<string | null>(null)
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
      setEquipes(prev => prev.map(e => e.id === eq.id ? { ...e, points_classement: calculatedPoints } : e))
      setSaved(eq.id)
      setTimeout(() => setSaved(null), 2000)
    }
  }

  const handleDelete = async (id: string, nom: string) => {
    if (!confirm(`Êtes-vous sûr de vouloir supprimer l'équipe "${nom}" du classement ?`)) {
      return
    }

    setSaving(id)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase as any).from('equipes').delete().eq('id', id)

    setSaving(null)
    if (!error) {
      setEquipes(prev => prev.filter(e => e.id !== id))
      setSaved(id)
      setTimeout(() => setSaved(null), 2000)
    }
  }

  // Drag and drop handlers - AMÉLIORÉ
  const handleDragStart = (e: React.DragEvent, id: string) => {
    setDraggedId(id)
    e.dataTransfer.effectAllowed = 'move'
    // Masquer l'élément pendant le drag
    if (e.currentTarget instanceof HTMLElement) {
      e.currentTarget.style.opacity = '0.4'
    }
  }

  const handleDragOver = (e: React.DragEvent, id: string) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    setDragOverId(id)
  }

  const handleDrop = (e: React.DragEvent, targetId: string) => {
    e.preventDefault()
    
    if (!draggedId || draggedId === targetId) {
      setDraggedId(null)
      setDragOverId(null)
      return
    }

    setEquipes(prev => {
      const newEquipes = [...prev]
      const draggedIndex = newEquipes.findIndex(eq => eq.id === draggedId)
      const targetIndex = newEquipes.findIndex(eq => eq.id === targetId)

      if (draggedIndex === -1 || targetIndex === -1) return prev

      // Supprimer l'élément déplacé
      const [removed] = newEquipes.splice(draggedIndex, 1)
      // Insérer à la nouvelle position
      newEquipes.splice(targetIndex, 0, removed)

      // Sauvegarder automatiquement la nouvelle position
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ;(supabase as any).from('equipes').update({ ordre: targetIndex }).eq('id', targetId)
      
      return newEquipes
    })

    setDraggedId(null)
    setDragOverId(null)
  }

  const handleDragEnd = (e: React.DragEvent) => {
    // Réafficher l'élément
    if (e.currentTarget instanceof HTMLElement) {
      e.currentTarget.style.opacity = '1'
    }
    setDraggedId(null)
    setDragOverId(null)
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
          💡 Glissez-déposez les équipes pour réorganiser
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
                      <th style={{ ...thStyle, width: 60 }}>#</th>
                      <th style={{ ...thStyle, textAlign: 'left', minWidth: 180 }}>Équipe</th>
                      <th style={thStyle}>MJ</th>
                      <th style={thStyle}>V</th>
                      <th style={thStyle}>N</th>
                      <th style={thStyle}>D</th>
                      <th style={thStyle}>BP</th>
                      <th style={thStyle}>BC</th>
                      <th style={thStyle}>Diff</th>
                      <th style={thStyle}>Pts</th>
                      <th style={{ ...thStyle, width: 120 }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pouleEquipes.map((eq, idx) => {
                      const pts = eq.victoires * 3 + eq.nuls
                      const diff = (eq.buts_marques || 0) - (eq.buts_encaisses || 0)
                      const isSaving = saving === eq.id
                      const isSaved = saved === eq.id
                      const isDragging = draggedId === eq.id
                      const isDragOver = dragOverId === eq.id

                      return (
                        <tr
                          key={eq.id}
                          draggable
                          onDragStart={(e) => handleDragStart(e, eq.id)}
                          onDragOver={(e) => handleDragOver(e, eq.id)}
                          onDrop={(e) => handleDrop(e, eq.id)}
                          onDragEnd={handleDragEnd}
                          style={{
                            borderBottom: '1px solid var(--color-border)',
                            background: isDragging ? 'rgba(0,98,51,0.05)' : isDragOver ? 'rgba(0,98,51,0.08)' : idx % 2 === 0 ? 'white' : '#fafafa',
                            transition: 'all 0.15s',
                            cursor: 'grab',
                            opacity: isDragging ? 0.4 : 1,
                            transform: isDragOver ? 'scale(1.01)' : 'scale(1)',
                          }}
                        >
                          <td style={{ ...tdStyle, fontWeight: 800, color: idx < 2 ? '#006233' : 'var(--color-text-muted)' }}>
                            {idx + 1}
                          </td>
                          <td style={{ ...tdStyle, textAlign: 'left', fontWeight: 700, minWidth: 180 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                              <div style={{ fontSize: '0.9rem', cursor: 'grab' }}>⋮⋮</div>
                              {eq.logo_url
                                ? <img src={eq.logo_url} alt="" style={{ width: 28, height: 28, borderRadius: 6, objectFit: 'cover', flexShrink: 0 }} />
                                : <div style={{ width: 28, height: 28, borderRadius: 6, background: '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', flexShrink: 0 }}>⚽</div>
                              }
                              <div>
                                <div style={{ fontSize: '0.82rem', fontWeight: 600 }}>{eq.nom}</div>
                                {eq.sigle && <div style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)' }}>{eq.sigle}</div>}
                              </div>
                            </div>
                          </td>
                          <td style={{ ...tdStyle, width: 50 }}>{eq.matchs_joues}</td>
                          <td style={{ ...tdStyle, width: 50 }}>{eq.victoires}</td>
                          <td style={{ ...tdStyle, width: 50 }}>{eq.nuls}</td>
                          <td style={{ ...tdStyle, width: 50 }}>{eq.defaites}</td>
                          <td style={{ ...tdStyle, width: 50 }}>{eq.buts_marques}</td>
                          <td style={{ ...tdStyle, width: 50 }}>{eq.buts_encaisses}</td>
                          <td style={{
                            ...tdStyle,
                            fontWeight: 700,
                            color: diff > 0 ? '#16a34a' : diff < 0 ? '#dc2626' : 'var(--color-text-muted)',
                          }}>
                            {diff > 0 ? `+${diff}` : diff}
                          </td>
                          <td style={{ ...tdStyle, fontWeight: 900, color: '#006233', fontSize: '0.95rem' }}>{pts}</td>
                          <td style={{ ...tdStyle, display: 'flex', gap: 6, justifyContent: 'center', width: 120 }}>
                            <button
                              onClick={() => handleSave(eq)}
                              disabled={isSaving}
                              style={{
                                padding: '6px 10px', borderRadius: 8, border: 'none',
                                background: isSaved ? '#16a34a' : '#006233',
                                color: 'white', fontWeight: 600, fontSize: '0.75rem',
                                cursor: isSaving ? 'wait' : 'pointer',
                                transition: 'all 0.2s', whiteSpace: 'nowrap',
                              }}
                            >
                              {isSaving ? '⏳' : isSaved ? '✅' : '💾'}
                            </button>
                            <button
                              onClick={() => handleDelete(eq.id, eq.nom)}
                              disabled={isSaving}
                              style={{
                                padding: '6px 10px', borderRadius: 8, border: 'none',
                                background: '#dc2626',
                                color: 'white', fontWeight: 600, fontSize: '0.75rem',
                                cursor: isSaving ? 'not-allowed' : 'pointer',
                                transition: 'all 0.2s', whiteSpace: 'nowrap',
                              }}
                            >
                              🗑️
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
                <th style={thStyle}>MJ</th>
                <th style={thStyle}>V</th>
                <th style={thStyle}>N</th>
                <th style={thStyle}>D</th>
                <th style={thStyle}>BP</th>
                <th style={thStyle}>BC</th>
                <th style={thStyle}>Diff</th>
                <th style={thStyle}>Pts</th>
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
                  const isDragging = draggedId === eq.id
                  const isDragOver = dragOverId === eq.id

                  return (
                    <tr
                      key={eq.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, eq.id)}
                      onDragOver={(e) => handleDragOver(e, eq.id)}
                      onDrop={(e) => handleDrop(e, eq.id)}
                      onDragEnd={handleDragEnd}
                      style={{
                        borderBottom: '1px solid var(--color-border)',
                        background: isDragging ? 'rgba(0,98,51,0.05)' : isDragOver ? 'rgba(0,98,51,0.08)' : idx % 2 === 0 ? 'white' : '#fafafa',
                        transition: 'all 0.15s',
                        cursor: 'grab',
                        opacity: isDragging ? 0.4 : 1,
                        transform: isDragOver ? 'scale(1.01)' : 'scale(1)',
                      }}
                    >
                      <td style={{ ...tdStyle, fontWeight: 800, color: idx < 2 ? '#006233' : 'var(--color-text-muted)' }}>{idx + 1}</td>
                      <td style={{ ...tdStyle, textAlign: 'left', fontWeight: 700, minWidth: 180 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <div style={{ fontSize: '0.9rem' }}>⋮⋮</div>
                          {eq.logo_url
                            ? <img src={eq.logo_url} alt="" style={{ width: 28, height: 28, borderRadius: 6, objectFit: 'cover' }} />
                            : <div style={{ width: 28, height: 28, borderRadius: 6, background: '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem' }}>⚽</div>
                          }
                          {eq.nom}
                        </div>
                      </td>
                      <td style={tdStyle}>{eq.matchs_joues}</td>
                      <td style={tdStyle}>{eq.victoires}</td>
                      <td style={tdStyle}>{eq.nuls}</td>
                      <td style={tdStyle}>{eq.defaites}</td>
                      <td style={tdStyle}>{eq.buts_marques}</td>
                      <td style={tdStyle}>{eq.buts_encaisses}</td>
                      <td style={{ ...tdStyle, fontWeight: 700, color: diff > 0 ? '#16a34a' : diff < 0 ? '#dc2626' : 'var(--color-text-muted)' }}>
                        {diff > 0 ? `+${diff}` : diff}
                      </td>
                      <td style={{ ...tdStyle, fontWeight: 900, color: '#006233' }}>{pts}</td>
                      <td style={{ ...tdStyle, display: 'flex', gap: 6, justifyContent: 'center' }}>
                        <button
                          onClick={() => handleSave(eq)}
                          disabled={isSaving}
                          style={{ padding: '6px 10px', borderRadius: 8, border: 'none', background: isSaved ? '#16a34a' : '#006233', color: 'white', fontWeight: 600, fontSize: '0.75rem', cursor: isSaving ? 'wait' : 'pointer' }}
                        >
                          {isSaving ? '⏳' : isSaved ? '✅' : '💾'}
                        </button>
                        <button
                          onClick={() => handleDelete(eq.id, eq.nom)}
                          disabled={isSaving}
                          style={{ padding: '6px 10px', borderRadius: 8, border: 'none', background: '#dc2626', color: 'white', fontWeight: 600, fontSize: '0.75rem', cursor: isSaving ? 'not-allowed' : 'pointer' }}
                        >
                          🗑️
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