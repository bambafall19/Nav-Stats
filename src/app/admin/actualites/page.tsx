'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

interface Actualite {
  id: string
  titre: string
  contenu: string
  image_url: string | null
  categorie: 'actualite' | 'annonce' | 'resultat' | 'classement'
  est_publie: boolean
  created_at: string
}

const CATEGORIE_LABELS: Record<string, string> = {
  actualite: '📰 Actualité',
  annonce: '📢 Annonce',
  resultat: '⚽ Résultat',
  classement: '🏆 Classement',
}

const defaultForm: {
  titre: string
  contenu: string
  image_url: string
  categorie: 'actualite' | 'annonce' | 'resultat' | 'classement'
  est_publie: boolean
} = {
  titre: '',
  contenu: '',
  image_url: '',
  categorie: 'annonce',
  est_publie: true,
}

export default function AdminActualitesPage() {
  const supabase = createClient() as any
  const [annonces, setAnnonces] = useState<Actualite[]>([])
  const [search, setSearch] = useState('')
  const [form, setForm] = useState(defaultForm)
  const [editId, setEditId] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const fetchData = async () => {
    setLoading(true)
    const { data: list } = await supabase.from('actualites').select('*').order('created_at', { ascending: false })
    setAnnonces((list || []) as Actualite[])

    const { data: { user } } = await supabase.auth.getUser()
    if (user) setUserId(user.id)
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
      titre: form.titre,
      contenu: form.contenu,
      image_url: form.image_url || null,
      categorie: form.categorie,
      est_publie: form.est_publie,
      auteur_id: userId,
    }

    if (editId) {
      const { error } = await supabase.from('actualites').update(payload).eq('id', editId)
      if (error) {
        setMessage({ type: 'error', text: error.message })
      } else {
        setMessage({ type: 'success', text: 'Article mis à jour.' })
        fetchData()
        resetForm()
      }
    } else {
      const { error } = await supabase.from('actualites').insert(payload)
      if (error) {
        setMessage({ type: 'error', text: error.message })
      } else {
        setMessage({ type: 'success', text: 'Article publié avec succès.' })
        fetchData()
        resetForm()
      }
    }
    setLoading(false)
  }

  const handleEdit = (act: Actualite) => {
    setForm({
      titre: act.titre,
      contenu: act.contenu,
      image_url: act.image_url || '',
      categorie: act.categorie,
      est_publie: act.est_publie,
    })
    setEditId(act.id)
    setShowForm(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Supprimer cet article ?')) return
    setLoading(true)
    const { error } = await supabase.from('actualites').delete().eq('id', id)
    if (error) {
      setMessage({ type: 'error', text: error.message })
    } else {
      setMessage({ type: 'success', text: 'Article supprimé.' })
      fetchData()
    }
    setLoading(false)
  }

  const resetForm = () => {
    setForm(defaultForm)
    setEditId(null)
    setShowForm(false)
  }

  const filteredArticles = annonces.filter(a =>
    a.titre.toLowerCase().includes(search.toLowerCase()) ||
    a.contenu.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-outfit)', fontSize: '1.8rem', fontWeight: 800, color: 'var(--color-text-primary)' }}>
            📢 Publier une Annonce / Actualité
          </h1>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem', marginTop: 4 }}>
            Communiquez les informations officielles sur les tournois, les classements et les résultats
          </p>
        </div>
        <button
          onClick={() => { resetForm(); setShowForm(true) }}
          className="btn btn-primary"
          style={{ display: 'flex', alignItems: 'center', gap: 8 }}
        >
          ➕ Nouvelle Annonce
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

      {/* Filter and search bar */}
      <div style={{ marginBottom: 24 }}>
        <input
          type="text"
          placeholder="Rechercher une annonce par titre ou contenu..."
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

      {/* Modal form */}
      {showForm && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.4)',
          backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center',
          justifyContent: 'center', zIndex: 1000, padding: 20
        }}>
          <div className="card" style={{ width: '100%', maxWidth: 600, padding: 32, borderRadius: 24, background: 'white', maxHeight: '90vh', overflowY: 'auto' }}>
            <h2 style={{ fontFamily: 'var(--font-outfit)', fontSize: '1.4rem', fontWeight: 800, marginBottom: 24 }}>
              {editId ? '📢 Modifier l\'Annonce' : '📢 Nouvelle Annonce'}
            </h2>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-text-secondary)', display: 'block', marginBottom: 6 }}>Titre de l'annonce *</label>
                <input type="text" required value={form.titre} onChange={e => setForm({ ...form, titre: e.target.value })} placeholder="ex: Reprise des matchs après le Magal !" style={{ width: '100%', padding: '12px 14px', borderRadius: 10, border: '1px solid var(--color-border)', outline: 'none' }} />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-text-secondary)', display: 'block', marginBottom: 6 }}>Catégorie *</label>
                  <select value={form.categorie} onChange={e => setForm({ ...form, categorie: e.target.value as any })} style={{ width: '100%', padding: '12px 14px', borderRadius: 10, border: '1px solid var(--color-border)', outline: 'none', background: 'white' }}>
                    <option value="annonce">📢 Annonce officielle</option>
                    <option value="actualite">📰 Actualité</option>
                    <option value="resultat">⚽ Résultat du match</option>
                    <option value="classement">🏆 Classement et Stats</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-text-secondary)', display: 'block', marginBottom: 6 }}>Statut</label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 12 }}>
                    <input type="checkbox" id="publie-check" checked={form.est_publie} onChange={e => setForm({ ...form, est_publie: e.target.checked })} style={{ width: 18, height: 18 }} />
                    <label htmlFor="publie-check" style={{ fontSize: '0.85rem', fontWeight: 600 }}>Publier immédiatement</label>
                  </div>
                </div>
              </div>

              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-text-secondary)', display: 'block', marginBottom: 6 }}>Image d'illustration (URL)</label>
                <input type="text" value={form.image_url} onChange={e => setForm({ ...form, image_url: e.target.value })} placeholder="https://lien-image.jpg" style={{ width: '100%', padding: '12px 14px', borderRadius: 10, border: '1px solid var(--color-border)', outline: 'none' }} />
              </div>

              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-text-secondary)', display: 'block', marginBottom: 6 }}>Contenu du communiqué *</label>
                <textarea required rows={6} value={form.contenu} onChange={e => setForm({ ...form, contenu: e.target.value })} placeholder="Saisissez le texte ici..." style={{ width: '100%', padding: '12px 14px', borderRadius: 10, border: '1px solid var(--color-border)', outline: 'none', fontFamily: 'inherit' }} />
              </div>

              <div style={{ display: 'flex', gap: 12, marginTop: 16 }}>
                <button type="button" onClick={resetForm} className="btn btn-outline" style={{ flex: 1 }}>Annuler</button>
                <button type="submit" disabled={loading} className="btn btn-primary" style={{ flex: 2 }}>
                  Publier
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* List layout */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {filteredArticles.length === 0 ? (
          <div className="card" style={{ padding: 40, textAlign: 'center', color: 'var(--color-text-muted)' }}>
            Aucun article ou annonce publié
          </div>
        ) : filteredArticles.map(art => (
          <div key={art.id} className="card" style={{ padding: 24, display: 'flex', gap: 20 }}>
            {art.image_url && (
              <img src={art.image_url} alt={art.titre} style={{ width: 120, height: 120, borderRadius: 12, objectFit: 'cover', flexShrink: 0 }} />
            )}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 8 }}>
                  <span className="badge" style={{ background: 'rgba(0,0,0,0.04)', color: 'var(--color-text-secondary)', fontSize: '0.7rem' }}>
                    {CATEGORIE_LABELS[art.categorie] || art.categorie}
                  </span>
                  <span style={{
                    fontSize: '0.7rem',
                    fontWeight: 700,
                    padding: '2px 6px',
                    borderRadius: 4,
                    background: art.est_publie ? 'rgba(0,98,51,0.06)' : 'rgba(232,0,45,0.06)',
                    color: art.est_publie ? 'var(--color-primary)' : 'var(--color-red)'
                  }}>
                    {art.est_publie ? 'En Ligne' : 'Brouillon'}
                  </span>
                  <span style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)' }}>
                    📅 {new Date(art.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </span>
                </div>
                <h3 style={{ fontFamily: 'var(--font-outfit)', fontSize: '1.1rem', fontWeight: 800, color: 'var(--color-text-primary)', marginBottom: 8 }}>
                  {art.titre}
                </h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', lineHeight: 1.4, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                  {art.contenu}
                </p>
              </div>

              <div style={{ display: 'flex', gap: 10, marginTop: 14 }}>
                <button onClick={() => handleEdit(art)} className="btn btn-sm btn-outline">✏️ Éditer</button>
                <button onClick={() => handleDelete(art.id)} className="btn btn-sm btn-outline" style={{ borderColor: '#FECACA', color: '#EF4444' }}>🗑️ Supprimer</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
