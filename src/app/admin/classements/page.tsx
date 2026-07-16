'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

type Poule = 'A' | 'B' | 'C'

interface Equipe {
  id: string
  nom: string
  sigle: string | null
  poule: Poule
  points_classement: number
  matchs_joues: number
  victoires: number
  nuls: number
  defaites: number
  buts_marques: number
  buts_encaisses: number
  couleur_principale: string
  couleur_secondaire: string
}

export default function AdminClassementsPage() {
  const supabase = createClient() as any
  const [equipes, setEquipes] = useState<Equipe[]>([])
  const [loading, setLoading] = useState(false)
  const [activePoule, setActivePoule] = useState<Poule>('A')
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [editValues, setEditValues] = useState<Record<string, Partial<Equipe>>>({})

  const fetchEquipes = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('equipes')
      .select('*')
      .eq('poule', activePoule)
      .order('points_classement', { ascending: false })
    
    if (!error) {
      const sorted = (data || []).sort((a: Equipe, b: Equipe) => {
        if (b.points_classement !== a.points_classement) {
          return b.points_classement - a.points_classement
        }
        const diffA = (a.buts_marques || 0) - (a.buts_encaisses || 0)
        const diffB = (b.buts_marques || 0) - (b.buts_encaisses || 0)
        return diffB - diffA
      })
      setEquipes(sorted)
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchEquipes()
  }, [activePoule])

  const handleInputChange = (id: string, field: keyof Equipe, value: number) => {
    setEditValues(prev => ({
      ...prev,
      [id]: {
        ...prev[id],
        [field]: value
      }
    }))
  }

  const handleSave = async (equipe: Equipe) => {
    const values = editValues[equipe.id] || {}
    setLoading(true)
    
    const { error } = await supabase
      .from('equipes')
      .update({
        points_classement: values.points_classement ?? equipe.points_classement,
        matchs_joues: values.matchs_joues ?? equipe.matchs_joues,
        victoires: values.victoires ?? equipe.victoires,
        nuls: values.nuls ?? equipe.nuls,
        defaites: values.defaites ?? equipe.defaites,
        buts_marques: values.buts_marques ?? equipe.buts_marques,
        buts_encaisses: values.buts_encaisses ?? equipe.buts_encaisses,
      })
      .eq('id', equipe.id)

    if (error) {
      setMessage({ type: 'error', text: error.message })
    } else {
      setMessage({ type: 'success', text: `${equipe.nom} mis à jour.` })
      fetchEquipes()
    }
    setLoading(false)
  }

  const pouleColors: Record<Poule, string> = {
    A: '#006233',
    B: '#1E40AF', 
    C: '#B91C1C'
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-outfit)', fontSize: '1.8rem', fontWeight: 800, color: 'var(--color-text-primary)' }}>
            🏆 Classements par Poule
          </h1>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem', marginTop: 4 }}>
            Modifiez les statistiques et points des équipes dans chaque poule
          </p>
        </div>

        {/* Poule Tabs */}
        <div style={{ display: 'flex', gap: 8 }}>
          {(['A', 'B', 'C'] as Poule[]).map(p => (
            <button
              key={p}
              onClick={() => setActivePoule(p)}
              className={activePoule === p ? 'btn btn-primary' : 'btn btn-outline'}
            >
              Poule {p}
            </button>
          ))}
        </div>
      </div>

      {message && (
        <div style={{
          padding: '14px 20px',
          background: message.type === 'success' ? 'rgba(0,166,81,0.06)' : 'rgba(232,0,45,0.06)',
          border: message.type === 'success' ? '1px solid rgba(0,166,81,0.15)' : '1px solid rgba(232,0,45,0.15)',
          borderRadius: 12,
          color: message.type === 'success' ? 'var(--color-primary)' : 'var(--color-red)',
          marginBottom: 24,
          fontWeight: 600,
        }}>
          {message.text}
        </div>
      )}

      {/* Classement Table */}
      <div style={{ background: 'var(--color-surface-card)', borderRadius: 16, overflow: 'hidden', border: '1px solid var(--color-border)' }}>
        <table className="data-table" style={{ fontSize: '0.85rem' }}>
          <thead>
            <tr style={{ background: 'rgba(0,0,0,0.02)' }}>
              <th>#</th>
              <th style={{ width: 200 }}>Équipe</th>
              <th>MJ</th>
              <th>V</th>
              <th>N</th>
              <th>D</th>
              <th>BP</th>
              <th>BC</th>
              <th>Diff</th>
              <th>Points</th>
              <th style={{ width: 100 }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {equipes.map((eq, index) => {
              const diff = (editValues[eq.id]?.buts_marques ?? eq.buts_marques ?? 0) - (editValues[eq.id]?.buts_encaisses ?? eq.buts_encaisses ?? 0)
              const points = editValues[eq.id]?.points_classement ?? eq.points_classement ?? 0
              const mj = editValues[eq.id]?.matchs_joues ?? eq.matchs_joues ?? 0
              
              return (
                <tr key={eq.id}>
                  <td style={{ fontWeight: 700, color: pouleColors[eq.poule] }}>{index + 1}</td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{
                        width: 32, height: 32, borderRadius: 8,
                        background: eq.couleur_principale,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: 'white', fontWeight: 700, fontSize: '0.8rem'
                      }}>
                        {eq.sigle?.charAt(0) || '?'}
                      </div>
                      <span style={{ fontWeight: 600 }}>{eq.nom}</span>
                    </div>
                  </td>
                  <td>
                    <input
                      type="number" min="0"
                      value={mj}
                      onChange={e => handleInputChange(eq.id, 'matchs_joues', parseInt(e.target.value) || 0)}
                      style={{ width: 50, padding: '4px 6px', border: '1px solid var(--color-border)', borderRadius: 6, textAlign: 'center' }}
                    />
                  </td>
                  <td>
                    <input
                      type="number" min="0"
                      value={editValues[eq.id]?.victoires ?? eq.victoires ?? 0}
                      onChange={e => handleInputChange(eq.id, 'victoires', parseInt(e.target.value) || 0)}
                      style={{ width: 40, padding: '4px 6px', border: '1px solid var(--color-border)', borderRadius: 6, textAlign: 'center' }}
                    />
                  </td>
                  <td>
                    <input
                      type="number" min="0"
                      value={editValues[eq.id]?.nuls ?? eq.nuls ?? 0}
                      onChange={e => handleInputChange(eq.id, 'nuls', parseInt(e.target.value) || 0)}
                      style={{ width: 40, padding: '4px 6px', border: '1px solid var(--color-border)', borderRadius: 6, textAlign: 'center' }}
                    />
                  </td>
                  <td>
                    <input
                      type="number" min="0"
                      value={editValues[eq.id]?.defaites ?? eq.defaites ?? 0}
                      onChange={e => handleInputChange(eq.id, 'defaites', parseInt(e.target.value) || 0)}
                      style={{ width: 40, padding: '4px 6px', border: '1px solid var(--color-border)', borderRadius: 6, textAlign: 'center' }}
                    />
                  </td>
                  <td>
                    <input
                      type="number" min="0"
                      value={editValues[eq.id]?.buts_marques ?? eq.buts_marques ?? 0}
                      onChange={e => handleInputChange(eq.id, 'buts_marques', parseInt(e.target.value) || 0)}
                      style={{ width: 40, padding: '4px 6px', border: '1px solid var(--color-border)', borderRadius: 6, textAlign: 'center' }}
                    />
                  </td>
                  <td>
                    <input
                      type="number" min="0"
                      value={editValues[eq.id]?.buts_encaisses ?? eq.buts_encaisses ?? 0}
                      onChange={e => handleInputChange(eq.id, 'buts_encaisses', parseInt(e.target.value) || 0)}
                      style={{ width: 40, padding: '4px 6px', border: '1px solid var(--color-border)', borderRadius: 6, textAlign: 'center' }}
                    />
                  </td>
                  <td style={{ fontWeight: 600, color: diff > 0 ? 'var(--color-primary)' : diff < 0 ? 'var(--color-red)' : 'var(--color-text-muted)' }}>
                    {diff > 0 ? '+' : ''}{diff}
                  </td>
                  <td>
                    <input
                      type="number" min="0"
                      value={points}
                      onChange={e => handleInputChange(eq.id, 'points_classement', parseInt(e.target.value) || 0)}
                      style={{ width: 50, padding: '4px 6px', border: '1px solid var(--color-border)', borderRadius: 6, textAlign: 'center', fontWeight: 700 }}
                    />
                  </td>
                  <td>
                    <button
                      onClick={() => handleSave(eq)}
                      disabled={loading}
                      className="btn btn-sm btn-primary"
                    >
                      Enregistrer
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
}