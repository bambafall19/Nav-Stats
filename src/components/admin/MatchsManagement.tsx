'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useToast } from '@/components/shared/Toast'

export default function MatchsManagement() {
  const [matchs, setMatchs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    equipe1: '',
    equipe2: '',
    date: '',
    heure: '',
    statut: 'planifie',
    score1: 0,
    score2: 0,
  })
  const supabase = createClient() as any
  const { addToast } = useToast()

  useEffect(() => {
    fetchMatchs()
  }, [])

  const fetchMatchs = async () => {
    try {
      const { data } = await supabase.from('matchs').select('*').order('date', { ascending: false })
      setMatchs(data || [])
    } catch (error) {
      addToast('Erreur lors du chargement', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (editingId) {
        await supabase.from('matchs').update(formData).eq('id', editingId)
        addToast('Match mis à jour', 'success')
      } else {
        await supabase.from('matchs').insert([formData])
        addToast('Match créé', 'success')
      }
      setFormData({ equipe1: '', equipe2: '', date: '', heure: '', statut: 'planifie', score1: 0, score2: 0 })
      setEditingId(null)
      setShowForm(false)
      fetchMatchs()
    } catch (error) {
      addToast('Erreur lors de la sauvegarde', 'error')
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Confirmer la suppression ?')) return
    try {
      await supabase.from('matchs').delete().eq('id', id)
      addToast('Match supprimé', 'success')
      fetchMatchs()
    } catch (error) {
      addToast('Erreur lors de la suppression', 'error')
    }
  }

  const handleEdit = (match: any) => {
    setFormData(match)
    setEditingId(match.id)
    setShowForm(true)
  }

  return (
    <div style={{ padding: 'clamp(16px, 3vw, 24px)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h1 style={{ fontFamily: 'var(--font-outfit)', fontWeight: 900, fontSize: 'clamp(1.3rem, 4vw, 1.8rem)', margin: 0 }}>
          ⚽ Gestion des Matchs
        </h1>
        <button
          onClick={() => {
            setShowForm(!showForm)
            setEditingId(null)
            setFormData({ equipe1: '', equipe2: '', date: '', heure: '', statut: 'planifie', score1: 0, score2: 0 })
          }}
          style={{
            padding: '10px 16px',
            background: 'var(--color-primary)',
            color: 'white',
            border: 'none',
            borderRadius: 'var(--radius-full)',
            cursor: 'pointer',
            fontWeight: 600,
            fontSize: '0.9rem',
          }}
        >
          {showForm ? '✕ Annuler' : '+ Nouveau Match'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} style={{
          background: 'var(--color-surface-card)',
          border: '1px solid var(--color-border)',
          borderRadius: 'clamp(12px, 3vw, 16px)',
          padding: 'clamp(16px, 3vw, 20px)',
          marginBottom: 24,
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: 16,
        }}>
          <input
            type="text"
            placeholder="Équipe 1"
            value={formData.equipe1}
            onChange={e => setFormData({ ...formData, equipe1: e.target.value })}
            required
            style={{
              padding: '10px 12px',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-md)',
              fontSize: '0.9rem',
            }}
          />
          <input
            type="text"
            placeholder="Équipe 2"
            value={formData.equipe2}
            onChange={e => setFormData({ ...formData, equipe2: e.target.value })}
            required
            style={{
              padding: '10px 12px',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-md)',
              fontSize: '0.9rem',
            }}
          />
          <input
            type="date"
            value={formData.date}
            onChange={e => setFormData({ ...formData, date: e.target.value })}
            required
            style={{
              padding: '10px 12px',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-md)',
              fontSize: '0.9rem',
            }}
          />
          <input
            type="time"
            value={formData.heure}
            onChange={e => setFormData({ ...formData, heure: e.target.value })}
            style={{
              padding: '10px 12px',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-md)',
              fontSize: '0.9rem',
            }}
          />
          <select
            value={formData.statut}
            onChange={e => setFormData({ ...formData, statut: e.target.value })}
            style={{
              padding: '10px 12px',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-md)',
              fontSize: '0.9rem',
            }}
          >
            <option value="planifie">Planifié</option>
            <option value="en_cours">En cours</option>
            <option value="termine">Terminé</option>
          </select>
          <input
            type="number"
            placeholder="Score 1"
            value={formData.score1}
            onChange={e => setFormData({ ...formData, score1: parseInt(e.target.value) })}
            style={{
              padding: '10px 12px',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-md)',
              fontSize: '0.9rem',
            }}
          />
          <input
            type="number"
            placeholder="Score 2"
            value={formData.score2}
            onChange={e => setFormData({ ...formData, score2: parseInt(e.target.value) })}
            style={{
              padding: '10px 12px',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-md)',
              fontSize: '0.9rem',
            }}
          />
          <button
            type="submit"
            style={{
              gridColumn: '1 / -1',
              padding: '12px 16px',
              background: 'var(--color-primary)',
              color: 'white',
              border: 'none',
              borderRadius: 'var(--radius-md)',
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: '0.9rem',
            }}
          >
            {editingId ? '✓ Mettre à jour' : '+ Créer'}
          </button>
        </form>
      )}

      {loading ? (
        <div style={{ textAlign: 'center', padding: 40 }}>Chargement...</div>
      ) : (
        <div style={{ background: 'var(--color-surface-card)', border: '1px solid var(--color-border)', borderRadius: 'clamp(12px, 3vw, 16px)', overflow: 'hidden' }}>
          {matchs.length > 0 ? (
            matchs.map((match, idx) => (
              <div key={match.id} style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: 'clamp(12px, 2vw, 16px)',
                borderBottom: idx < matchs.length - 1 ? '1px solid var(--color-border)' : 'none',
              }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: '0.95rem', marginBottom: 4 }}>
                    {match.equipe1} vs {match.equipe2}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
                    {match.date} {match.heure} • {match.statut}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button
                    onClick={() => handleEdit(match)}
                    style={{
                      padding: '6px 12px',
                      background: 'var(--color-primary)',
                      color: 'white',
                      border: 'none',
                      borderRadius: 'var(--radius-md)',
                      cursor: 'pointer',
                      fontSize: '0.8rem',
                    }}
                  >
                    ✏️ Éditer
                  </button>
                  <button
                    onClick={() => handleDelete(match.id)}
                    style={{
                      padding: '6px 12px',
                      background: 'var(--color-red)',
                      color: 'white',
                      border: 'none',
                      borderRadius: 'var(--radius-md)',
                      cursor: 'pointer',
                      fontSize: '0.8rem',
                    }}
                  >
                    🗑️ Supprimer
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div style={{ padding: 40, textAlign: 'center', color: 'var(--color-text-muted)' }}>
              Aucun match
            </div>
          )}
        </div>
      )}
    </div>
  )
}
