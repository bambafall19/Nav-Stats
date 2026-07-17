'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useToast } from '@/components/shared/Toast'

export default function EquipesManagement() {
  const [equipes, setEquipes] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    nom: '',
    logo_url: '',
    couleur_principale: '#006233',
    couleur_secondaire: '#00A651',
    asc_nom: '',
    quartier: '',
    sigle: '',
  })
  const supabase = createClient() as any
  const { addToast } = useToast()

  useEffect(() => {
    fetchEquipes()
  }, [])

  const fetchEquipes = async () => {
    try {
      const { data } = await supabase.from('equipes').select('*').order('nom')
      setEquipes(data || [])
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
        await supabase.from('equipes').update(formData).eq('id', editingId)
        addToast('Équipe mise à jour', 'success')
      } else {
        await supabase.from('equipes').insert([formData])
        addToast('Équipe créée', 'success')
      }
      setFormData({ nom: '', logo_url: '', couleur_principale: '#006233', couleur_secondaire: '#00A651', asc_nom: '', quartier: '', sigle: '' })
      setEditingId(null)
      setShowForm(false)
      fetchEquipes()
    } catch (error) {
      addToast('Erreur lors de la sauvegarde', 'error')
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Confirmer la suppression ?')) return
    try {
      await supabase.from('equipes').delete().eq('id', id)
      addToast('Équipe supprimée', 'success')
      fetchEquipes()
    } catch (error) {
      addToast('Erreur lors de la suppression', 'error')
    }
  }

  const handleEdit = (equipe: any) => {
    setFormData(equipe)
    setEditingId(equipe.id)
    setShowForm(true)
  }

  return (
    <div style={{ padding: 'clamp(16px, 3vw, 24px)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h1 style={{ fontFamily: 'var(--font-outfit)', fontWeight: 900, fontSize: 'clamp(1.3rem, 4vw, 1.8rem)', margin: 0 }}>
          🏆 Gestion des Équipes
        </h1>
        <button
          onClick={() => {
            setShowForm(!showForm)
            setEditingId(null)
            setFormData({ nom: '', logo_url: '', couleur_principale: '#006233', couleur_secondaire: '#00A651', asc_nom: '', quartier: '', sigle: '' })
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
          {showForm ? '✕ Annuler' : '+ Nouvelle Équipe'}
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
            placeholder="Nom de l'équipe"
            value={formData.nom}
            onChange={e => setFormData({ ...formData, nom: e.target.value })}
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
            placeholder="Sigle"
            value={formData.sigle}
            onChange={e => setFormData({ ...formData, sigle: e.target.value })}
            style={{
              padding: '10px 12px',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-md)',
              fontSize: '0.9rem',
            }}
          />
          <input
            type="text"
            placeholder="URL du logo"
            value={formData.logo_url}
            onChange={e => setFormData({ ...formData, logo_url: e.target.value })}
            style={{
              padding: '10px 12px',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-md)',
              fontSize: '0.9rem',
            }}
          />
          <input
            type="text"
            placeholder="ASC"
            value={formData.asc_nom}
            onChange={e => setFormData({ ...formData, asc_nom: e.target.value })}
            style={{
              padding: '10px 12px',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-md)',
              fontSize: '0.9rem',
            }}
          />
          <input
            type="text"
            placeholder="Quartier"
            value={formData.quartier}
            onChange={e => setFormData({ ...formData, quartier: e.target.value })}
            style={{
              padding: '10px 12px',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-md)',
              fontSize: '0.9rem',
            }}
          />
          <div style={{ display: 'flex', gap: 8 }}>
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', display: 'block', marginBottom: 4 }}>
                Couleur principale
              </label>
              <input
                type="color"
                value={formData.couleur_principale}
                onChange={e => setFormData({ ...formData, couleur_principale: e.target.value })}
                style={{
                  width: '100%',
                  height: 40,
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-md)',
                  cursor: 'pointer',
                }}
              />
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', display: 'block', marginBottom: 4 }}>
                Couleur secondaire
              </label>
              <input
                type="color"
                value={formData.couleur_secondaire}
                onChange={e => setFormData({ ...formData, couleur_secondaire: e.target.value })}
                style={{
                  width: '100%',
                  height: 40,
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-md)',
                  cursor: 'pointer',
                }}
              />
            </div>
          </div>
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
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: 'clamp(12px, 2vw, 16px)' }}>
          {equipes.length > 0 ? (
            equipes.map(equipe => (
              <div key={equipe.id} style={{
                background: 'var(--color-surface-card)',
                border: '1px solid var(--color-border)',
                borderRadius: 'clamp(12px, 3vw, 16px)',
                padding: 'clamp(12px, 2vw, 16px)',
                display: 'flex',
                flexDirection: 'column',
                gap: 12,
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  {equipe.logo_url ? (
                    <img src={equipe.logo_url} alt="" style={{ width: 40, height: 40, borderRadius: 8, objectFit: 'cover' }} />
                  ) : (
                    <div style={{
                      width: 40,
                      height: 40,
                      borderRadius: 8,
                      background: `linear-gradient(135deg, ${equipe.couleur_principale}, ${equipe.couleur_secondaire})`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.8rem',
                      fontWeight: 700,
                      color: 'white',
                    }}>
                      {equipe.sigle || equipe.nom.charAt(0)}
                    </div>
                  )}
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>
                      {equipe.nom}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                      {equipe.asc_nom || equipe.quartier}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 6 }}>
                  <button
                    onClick={() => handleEdit(equipe)}
                    style={{
                      flex: 1,
                      padding: '6px 10px',
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
                    onClick={() => handleDelete(equipe.id)}
                    style={{
                      flex: 1,
                      padding: '6px 10px',
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
            <div style={{ gridColumn: '1 / -1', padding: 40, textAlign: 'center', color: 'var(--color-text-muted)' }}>
              Aucune équipe
            </div>
          )}
        </div>
      )}
    </div>
  )
}
