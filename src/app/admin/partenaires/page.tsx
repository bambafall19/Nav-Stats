'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

interface Partenaire {
  id: string
  nom: string
  logo_url: string | null
  description: string | null
  lien_url: string | null
  niveau: 'or' | 'argent' | 'bronze'
  actif: boolean
  ordre: number
  created_at: string
}

const NIVEAU_LABELS: Record<string, { label: string; color: string; bg: string }> = {
  or: { label: '🥇 Or', color: '#b45309', bg: 'linear-gradient(135deg, #ffd97d, #f0a800)' },
  argent: { label: '🥈 Argent', color: '#334155', bg: 'linear-gradient(135deg, #e4ece9, #9aa8a3)' },
  bronze: { label: '🥉 Bronze', color: '#7c2d12', bg: 'linear-gradient(135deg, #e8a15c, #8a4a0e)' },
}

const defaultForm = {
  nom: '',
  logo_url: '',
  description: '',
  lien_url: '',
  niveau: 'bronze' as 'or' | 'argent' | 'bronze',
  actif: true,
  ordre: 0,
}

export default function AdminPartenairesPage() {
  const supabase = createClient() as any
  const [partenaires, setPartenaires] = useState<Partenaire[]>([])
  const [search, setSearch] = useState('')
  const [form, setForm] = useState(defaultForm)
  const [editId, setEditId] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const fetchData = async () => {
    setLoading(true)
    const { data: list } = await supabase.from('partenaires').select('*').order('ordre').order('nom')
    setPartenaires((list || []) as Partenaire[])
    setLoading(false)
  }

  useEffect(() => {
    fetchData()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage(null)

    const payload = {
      nom: form.nom,
      logo_url: form.logo_url || null,
      description: form.description || null,
      lien_url: form.lien_url || null,
      niveau: form.niveau,
      actif: form.actif,
      ordre: Number(form.ordre) || 0,
    }

    if (editId) {
      const { error } = await supabase.from('partenaires').update(payload).eq('id', editId)
      if (error) {
        setMessage({ type: 'error', text: error.message })
      } else {
        setMessage({ type: 'success', text: 'Partenaire mis à jour.' })
        fetchData()
        resetForm()
      }
    } else {
      const { error } = await supabase.from('partenaires').insert(payload)
      if (error) {
        setMessage({ type: 'error', text: error.message })
      } else {
        setMessage({ type: 'success', text: 'Partenaire ajouté avec succès.' })
        fetchData()
        resetForm()
      }
    }
    setLoading(false)
  }

  const handleEdit = (p: Partenaire) => {
    setForm({
      nom: p.nom,
      logo_url: p.logo_url || '',
      description: p.description || '',
      lien_url: p.lien_url || '',
      niveau: p.niveau,
      actif: p.actif,
      ordre: p.ordre,
    })
    setEditId(p.id)
    setShowForm(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Supprimer ce partenaire ?')) return
    setLoading(true)
    const { error } = await supabase.from('partenaires').delete().eq('id', id)
    if (error) {
      setMessage({ type: 'error', text: error.message })
    } else {
      setMessage({ type: 'success', text: 'Partenaire supprimé.' })
      fetchData()
    }
    setLoading(false)
  }

  const resetForm = () => {
    setForm(defaultForm)
    setEditId(null)
    setShowForm(false)
  }

  const filtered = partenaires.filter(p =>
    p.nom.toLowerCase().includes(search.toLowerCase()) ||
    (p.description || '').toLowerCase().includes(search.toLowerCase())
  )

  const inputStyle = {
    width: '100%',
    padding: '12px 14px',
    borderRadius: 10,
    border: '1px solid var(--color-border)',
    outline: 'none',
    background: 'var(--color-surface-elevated)',
    fontFamily: 'var(--font-plus-jakarta)',
  } as const

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-plus-jakarta)', fontSize: '1.8rem', fontWeight: 800, color: 'var(--color-text-primary)' }}>
            🤝 Partenaires
          </h1>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem', marginTop: 4 }}>
            Sponsors affichés dans la section Partenaires de la page d&apos;accueil
          </p>
        </div>
        <button
          onClick={() => { resetForm(); setShowForm(true) }}
          className="btn btn-primary"
          style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'var(--gradient-gold)', color: '#1a0a00' }}
        >
          ➕ Nouveau Partenaire
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

      <div style={{ marginBottom: 24 }}>
        <input
          type="text"
          placeholder="Rechercher un partenaire..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ ...inputStyle, boxShadow: 'var(--shadow-sm)' }}
        />
      </div>

      {showForm && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.4)',
          backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center',
          justifyContent: 'center', zIndex: 1000, padding: 20
        }}>
          <div className="card" style={{ width: '100%', maxWidth: 600, padding: 32, borderRadius: 24, background: 'var(--color-surface-elevated)', maxHeight: '90vh', overflowY: 'auto' }}>
            <h2 style={{ fontFamily: 'var(--font-plus-jakarta)', fontSize: '1.4rem', fontWeight: 800, marginBottom: 24 }}>
              {editId ? '🤝 Modifier le partenaire' : '🤝 Nouveau partenaire'}
            </h2>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-text-secondary)', display: 'block', marginBottom: 6 }}>Nom *</label>
                <input type="text" required value={form.nom} onChange={e => setForm({ ...form, nom: e.target.value })} placeholder="ex: Boulangerie Khombole" style={inputStyle} />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-text-secondary)', display: 'block', marginBottom: 6 }}>Niveau</label>
                  <select value={form.niveau} onChange={e => setForm({ ...form, niveau: e.target.value as 'or' | 'argent' | 'bronze' })} style={inputStyle}>
                    <option value="or">🥇 Or</option>
                    <option value="argent">🥈 Argent</option>
                    <option value="bronze">🥉 Bronze</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-text-secondary)', display: 'block', marginBottom: 6 }}>Ordre d&apos;affichage</label>
                  <input type="number" value={form.ordre} onChange={e => setForm({ ...form, ordre: Number(e.target.value) })} style={inputStyle} />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-text-secondary)', display: 'block', marginBottom: 6 }}>Logo (URL)</label>
                  <input type="text" value={form.logo_url} onChange={e => setForm({ ...form, logo_url: e.target.value })} placeholder="https://lien-logo.jpg" style={inputStyle} />
                </div>
                <div>
                  <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-text-secondary)', display: 'block', marginBottom: 6 }}>Site web (URL)</label>
                  <input type="text" value={form.lien_url} onChange={e => setForm({ ...form, lien_url: e.target.value })} placeholder="https://..." style={inputStyle} />
                </div>
              </div>

              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-text-secondary)', display: 'block', marginBottom: 6 }}>Description</label>
                <textarea rows={3} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Ce que fait ce partenaire..." style={{ ...inputStyle, resize: 'vertical' }} />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <input type="checkbox" id="actif-check" checked={form.actif} onChange={e => setForm({ ...form, actif: e.target.checked })} style={{ width: 18, height: 18 }} />
                <label htmlFor="actif-check" style={{ fontSize: '0.85rem', fontWeight: 600 }}>Afficher sur le site</label>
              </div>

              <div style={{ display: 'flex', gap: 12, marginTop: 16 }}>
                <button type="button" onClick={resetForm} className="btn btn-outline" style={{ flex: 1 }}>Annuler</button>
                <button type="submit" disabled={loading} className="btn btn-primary" style={{ flex: 2 }}>
                  {editId ? 'Enregistrer' : 'Ajouter'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {filtered.length === 0 ? (
          <div className="card" style={{ padding: 40, textAlign: 'center', color: 'var(--color-text-muted)' }}>
            {loading ? 'Chargement...' : 'Aucun partenaire. Ajoutez votre premier sponsor !'}
          </div>
        ) : filtered.map(p => {
          const niveau = NIVEAU_LABELS[p.niveau]
          return (
            <div key={p.id} className="card" style={{ padding: 20, display: 'flex', gap: 16, alignItems: 'center' }}>
              {p.logo_url ? (
                <img src={p.logo_url} alt={p.nom} style={{ width: 56, height: 56, borderRadius: 12, objectFit: 'cover', flexShrink: 0, background: 'var(--color-surface-elevated)' }} />
              ) : (
                <div style={{
                  width: 56, height: 56, borderRadius: 12, flexShrink: 0,
                  background: 'linear-gradient(135deg, rgba(42,255,160,0.14), rgba(16,185,129,0.08))',
                  border: '1px solid rgba(42,255,160,0.2)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: 'var(--color-primary)', fontWeight: 800, fontSize: '1.2rem',
                  fontFamily: 'var(--font-plus-jakarta)',
                }}>
                  {p.nom.charAt(0).toUpperCase()}
                </div>
              )}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 6, flexWrap: 'wrap' }}>
                  <h3 style={{ fontFamily: 'var(--font-plus-jakarta)', fontSize: '1rem', fontWeight: 800, color: 'var(--color-text-primary)', margin: 0 }}>
                    {p.nom}
                  </h3>
                  <span style={{
                    fontSize: '0.68rem', fontWeight: 800,
                    padding: '2px 9px', borderRadius: 999,
                    background: niveau.bg, color: niveau.color,
                  }}>
                    {niveau.label}
                  </span>
                  <span style={{
                    fontSize: '0.7rem', fontWeight: 700,
                    padding: '2px 8px', borderRadius: 4,
                    background: p.actif ? 'rgba(42,255,160,0.06)' : 'rgba(232,0,45,0.06)',
                    color: p.actif ? 'var(--color-primary)' : 'var(--color-red)'
                  }}>
                    {p.actif ? 'En ligne' : 'Masqué'}
                  </span>
                </div>
                {p.description && (
                  <p style={{ fontSize: '0.82rem', color: 'var(--color-text-secondary)', lineHeight: 1.4, margin: 0, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {p.description}
                  </p>
                )}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, flexShrink: 0 }}>
                <button onClick={() => handleEdit(p)} className="btn btn-sm btn-outline">✏️ Éditer</button>
                <button onClick={() => handleDelete(p.id)} className="btn btn-sm btn-outline" style={{ borderColor: '#FEE2E2', color: '#EF4444' }}>🗑️ Supprimer</button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
