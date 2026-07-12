'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

type Poule = 'A' | 'B' | 'C'

interface Equipe {
  id: string
  nom: string
  sigle: string | null
  poule: Poule
  couleur_principale: string
  couleur_secondaire: string
  logo_url: string | null
  quartier: string | null
  asc_nom: string | null
  description: string | null
  annee_creation: number | null
}

interface EquipeForm {
  nom: string
  sigle: string
  poule: Poule
  couleur_principale: string
  couleur_secondaire: string
  logo_url: string
  quartier: string
  asc_nom: string
  description: string
  annee_creation: number
}

const defaultForm: EquipeForm = {
  nom: '',
  sigle: '',
  poule: 'A',
  couleur_principale: '#006233',
  couleur_secondaire: '#FBBF00',
  logo_url: '',
  quartier: '',
  asc_nom: '',
  description: '',
  annee_creation: 2026,
}

export default function AdminEquipesPage() {
  const supabase = createClient() as any
  const [equipes, setEquipes] = useState<Equipe[]>([])
  const [search, setSearch] = useState('')
  const [form, setForm] = useState<EquipeForm>(defaultForm)
  const [editId, setEditId] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const fetchEquipes = async () => {
    setLoading(true)
    const { data, error } = await supabase.from('equipes').select('*').order('nom')
    if (!error) setEquipes(data || [])
    setLoading(false)
  }

  useEffect(() => {
    fetchEquipes()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage(null)

    const payload = {
      nom: form.nom,
      sigle: form.sigle || null,
      poule: form.poule,
      couleur_principale: form.couleur_principale,
      couleur_secondaire: form.couleur_secondaire,
      logo_url: form.logo_url || null,
      quartier: form.quartier || null,
      asc_nom: form.asc_nom || null,
      description: form.description || null,
      annee_creation: form.annee_creation ? Number(form.annee_creation) : null,
    }

    if (editId) {
      const { error } = await supabase.from('equipes').update(payload).eq('id', editId)
      if (error) {
        setMessage({ type: 'error', text: error.message })
      } else {
        setMessage({ type: 'success', text: 'Équipe mise à jour avec succès.' })
        fetchEquipes()
        resetForm()
      }
    } else {
      const { error } = await supabase.from('equipes').insert(payload)
      if (error) {
        setMessage({ type: 'error', text: error.message })
      } else {
        setMessage({ type: 'success', text: 'Équipe créée avec succès.' })
        fetchEquipes()
        resetForm()
      }
    }
    setLoading(false)
  }

  const handleEdit = (eq: Equipe) => {
    setForm({
      nom: eq.nom,
      sigle: eq.sigle || '',
      poule: eq.poule,
      couleur_principale: eq.couleur_principale || '#006233',
      couleur_secondaire: eq.couleur_secondaire || '#FBBF00',
      logo_url: eq.logo_url || '',
      quartier: eq.quartier || '',
      asc_nom: eq.asc_nom || '',
      description: eq.description || '',
      annee_creation: eq.annee_creation || 2026,
    })
    setEditId(eq.id)
    setShowForm(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Supprimer cette équipe ? Cela supprimera également tous ses joueurs et statistiques associés.')) return
    setLoading(true)
    const { error } = await supabase.from('equipes').delete().eq('id', id)
    if (error) {
      setMessage({ type: 'error', text: error.message })
    } else {
      setMessage({ type: 'success', text: 'Équipe supprimée.' })
      fetchEquipes()
    }
    setLoading(false)
  }

  const resetForm = () => {
    setForm(defaultForm)
    setEditId(null)
    setShowForm(false)
  }

  const filteredEquipes = equipes.filter(e =>
    e.nom.toLowerCase().includes(search.toLowerCase()) ||
    (e.sigle && e.sigle.toLowerCase().includes(search.toLowerCase())) ||
    (e.quartier && e.quartier.toLowerCase().includes(search.toLowerCase()))
  )

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-outfit)', fontSize: '1.8rem', fontWeight: 800, color: 'var(--color-text-primary)' }}>
            🛡️ Gérer les Équipes (ASC)
          </h1>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem', marginTop: 4 }}>
            Ajoutez, modifiez ou gérez les 17 ASC de Khombole
          </p>
        </div>
        <button
          onClick={() => { resetForm(); setShowForm(true) }}
          className="btn btn-primary"
          style={{ display: 'flex', alignItems: 'center', gap: 8 }}
        >
          ➕ Nouvelle Équipe
        </button>
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
          fontSize: '0.875rem'
        }}>
          {message.text}
        </div>
      )}

      {/* Filter/Search */}
      <div style={{ marginBottom: 24 }}>
        <input
          type="text"
          placeholder="Rechercher une équipe par nom, sigle, quartier..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{
            width: '100%',
            padding: '14px 18px',
            borderRadius: 14,
            border: '1px solid var(--color-border)',
            background: 'white',
            outline: 'none',
            fontSize: '0.9rem',
            fontFamily: 'var(--font-outfit)',
            boxShadow: 'var(--shadow-sm)'
          }}
        />
      </div>

      {/* Modal / Overlay Form */}
      {showForm && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.4)',
          backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center',
          justifyContent: 'center', zIndex: 1000, padding: 20
        }}>
          <div className="card" style={{ width: '100%', maxWidth: 500, padding: 32, borderRadius: 24, background: 'white', maxHeight: '90vh', overflowY: 'auto' }}>
            <h2 style={{ fontFamily: 'var(--font-outfit)', fontSize: '1.4rem', fontWeight: 800, marginBottom: 24 }}>
              {editId ? '🛡️ Modifier l\'Équipe' : '🛡️ Nouvelle Équipe'}
            </h2>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-text-secondary)', display: 'block', marginBottom: 6 }}>Nom complet *</label>
                  <input type="text" required value={form.nom} onChange={e => setForm({ ...form, nom: e.target.value })} placeholder="ex: Maag Daan" style={{ width: '100%', padding: '12px 14px', borderRadius: 10, border: '1px solid var(--color-border)', outline: 'none' }} />
                </div>
                <div>
                  <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-text-secondary)', display: 'block', marginBottom: 6 }}>Sigle *</label>
                  <input type="text" required value={form.sigle} onChange={e => setForm({ ...form, sigle: e.target.value })} placeholder="ex: MD" style={{ width: '100%', padding: '12px 14px', borderRadius: 10, border: '1px solid var(--color-border)', outline: 'none' }} />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-text-secondary)', display: 'block', marginBottom: 6 }}>Poule *</label>
                  <select value={form.poule} onChange={e => setForm({ ...form, poule: e.target.value as Poule })} style={{ width: '100%', padding: '12px 14px', borderRadius: 10, border: '1px solid var(--color-border)', outline: 'none', background: 'white' }}>
                    <option value="A">Poule A</option>
                    <option value="B">Poule B</option>
                    <option value="C">Poule C</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-text-secondary)', display: 'block', marginBottom: 6 }}>Quartier</label>
                  <input type="text" value={form.quartier} onChange={e => setForm({ ...form, quartier: e.target.value })} placeholder="ex: Escale" style={{ width: '100%', padding: '12px 14px', borderRadius: 10, border: '1px solid var(--color-border)', outline: 'none' }} />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-text-secondary)', display: 'block', marginBottom: 6 }}>Couleur 1 *</label>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <input type="color" value={form.couleur_principale} onChange={e => setForm({ ...form, couleur_principale: e.target.value })} style={{ width: 44, height: 44, border: 'none', borderRadius: 8, cursor: 'pointer' }} />
                    <input type="text" value={form.couleur_principale} onChange={e => setForm({ ...form, couleur_principale: e.target.value })} style={{ flex: 1, padding: '10px 12px', borderRadius: 10, border: '1px solid var(--color-border)', fontSize: '0.85rem' }} />
                  </div>
                </div>
                <div>
                  <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-text-secondary)', display: 'block', marginBottom: 6 }}>Couleur 2 *</label>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <input type="color" value={form.couleur_secondaire} onChange={e => setForm({ ...form, couleur_secondaire: e.target.value })} style={{ width: 44, height: 44, border: 'none', borderRadius: 8, cursor: 'pointer' }} />
                    <input type="text" value={form.couleur_secondaire} onChange={e => setForm({ ...form, couleur_secondaire: e.target.value })} style={{ flex: 1, padding: '10px 12px', borderRadius: 10, border: '1px solid var(--color-border)', fontSize: '0.85rem' }} />
                  </div>
                </div>
              </div>

              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-text-secondary)', display: 'block', marginBottom: 6 }}>Nom ASC officiel</label>
                <input type="text" value={form.asc_nom} onChange={e => setForm({ ...form, asc_nom: e.target.value })} placeholder="ex: ASC Maag Daan" style={{ width: '100%', padding: '12px 14px', borderRadius: 10, border: '1px solid var(--color-border)', outline: 'none' }} />
              </div>

              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-text-secondary)', display: 'block', marginBottom: 6 }}>Logo URL</label>
                <input type="text" value={form.logo_url} onChange={e => setForm({ ...form, logo_url: e.target.value })} placeholder="https://lien-du-logo.png" style={{ width: '100%', padding: '12px 14px', borderRadius: 10, border: '1px solid var(--color-border)', outline: 'none' }} />
              </div>

              <div style={{ display: 'flex', gap: 12, marginTop: 16 }}>
                <button type="button" onClick={resetForm} className="btn btn-outline" style={{ flex: 1 }}>Annuler</button>
                <button type="submit" disabled={loading} className="btn btn-primary" style={{ flex: 2 }}>
                  {loading ? 'Enregistrement...' : 'Sauvegarder'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Grid List */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 20 }}>
        {filteredEquipes.map(eq => (
          <div key={eq.id} className="card" style={{ padding: 24, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', border: '1px solid rgba(0,0,0,0.03)' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                {eq.logo_url ? (
                  <img src={eq.logo_url} alt={eq.nom} style={{ width: 48, height: 48, borderRadius: 10, objectFit: 'cover' }} />
                ) : (
                  <div style={{
                    width: 48, height: 48, borderRadius: 10,
                    background: `linear-gradient(135deg, ${eq.couleur_principale}, ${eq.couleur_secondaire})`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontWeight: 800, color: 'white', fontSize: '1.1rem'
                  }}>
                    {eq.sigle}
                  </div>
                )}
                <span className="badge" style={{ background: eq.poule === 'A' ? 'rgba(0,98,51,0.06)' : eq.poule === 'B' ? 'rgba(30,64,175,0.06)' : 'rgba(185,28,28,0.06)', color: eq.poule === 'A' ? '#006233' : eq.poule === 'B' ? '#1E40AF' : '#B91C1C', fontSize: '0.72rem', fontWeight: 800 }}>
                  Poule {eq.poule}
                </span>
              </div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, fontFamily: 'var(--font-outfit)', marginBottom: 4 }}>{eq.nom}</h3>
              <p style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', marginBottom: 12 }}>{eq.asc_nom || 'ASC non spécifiée'}</p>
              {eq.quartier && (
                <div style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
                  📍 <span>{eq.quartier}</span>
                </div>
              )}
            </div>

            <div style={{ display: 'flex', gap: 8, marginTop: 24, borderTop: '1px solid var(--color-border)', paddingTop: 14 }}>
              <button onClick={() => handleEdit(eq)} className="btn btn-sm btn-outline" style={{ flex: 1 }}>✏️ Modifier</button>
              <button onClick={() => handleDelete(eq.id)} className="btn btn-sm btn-outline" style={{ flex: 1, borderColor: '#FECACA', color: '#EF4444' }}>🗑️ Supprimer</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
