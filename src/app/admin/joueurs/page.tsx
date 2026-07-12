'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

interface Equipe {
  id: string
  nom: string
}

interface Joueur {
  id: string
  nom: string
  prenom: string | null
  numero_maillot: number | null
  poste: 'gardien' | 'defenseur' | 'milieu' | 'attaquant' | null
  buts: number
  passes_decisives: number
  matchs_joues: number
  cartons_jaunes: number
  cartons_rouges: number
  photo_url: string | null
  equipe_id: string | null
  equipe?: Equipe | null
}

const POSTE_LABELS: Record<string, string> = {
  gardien: '🧤 Gardien',
  defenseur: '🛡️ Défenseur',
  milieu: '⚙️ Milieu',
  attaquant: '🎯 Attaquant',
}

const defaultForm: {
  nom: string
  prenom: string
  numero_maillot: string | number
  poste: 'gardien' | 'defenseur' | 'milieu' | 'attaquant'
  equipe_id: string
  buts: number
  passes_decisives: number
  matchs_joues: number
  cartons_jaunes: number
  cartons_rouges: number
  photo_url: string
} = {
  nom: '',
  prenom: '',
  numero_maillot: '',
  poste: 'milieu',
  equipe_id: '',
  buts: 0,
  passes_decisives: 0,
  matchs_joues: 0,
  cartons_jaunes: 0,
  cartons_rouges: 0,
  photo_url: '',
}

export default function AdminJoueursPage() {
  const supabase = createClient() as any
  const [joueurs, setJoueurs] = useState<Joueur[]>([])
  const [equipes, setEquipes] = useState<Equipe[]>([])
  const [search, setSearch] = useState('')
  const [teamFilter, setTeamFilter] = useState<string>('all')
  const [form, setForm] = useState(defaultForm)
  const [editId, setEditId] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const fetchData = async () => {
    setLoading(true)
    const [{ data: eqs }, { data: jrs }] = await Promise.all([
      supabase.from('equipes').select('id, nom').order('nom'),
      supabase.from('joueurs').select('*, equipe:equipes(id, nom)').order('nom'),
    ])
    setEquipes(eqs || [])
    setJoueurs((jrs || []) as Joueur[])
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
      prenom: form.prenom || null,
      numero_maillot: form.numero_maillot ? Number(form.numero_maillot) : null,
      poste: form.poste,
      equipe_id: form.equipe_id || null,
      buts: Number(form.buts),
      passes_decisives: Number(form.passes_decisives),
      matchs_joues: Number(form.matchs_joues),
      cartons_jaunes: Number(form.cartons_jaunes),
      cartons_rouges: Number(form.cartons_rouges),
      photo_url: form.photo_url || null,
    }

    if (editId) {
      const { error } = await supabase.from('joueurs').update(payload).eq('id', editId)
      if (error) {
        setMessage({ type: 'error', text: error.message })
      } else {
        setMessage({ type: 'success', text: 'Joueur mis à jour avec succès.' })
        fetchData()
        resetForm()
      }
    } else {
      const { error } = await supabase.from('joueurs').insert(payload)
      if (error) {
        setMessage({ type: 'error', text: error.message })
      } else {
        setMessage({ type: 'success', text: 'Joueur créé avec succès.' })
        fetchData()
        resetForm()
      }
    }
    setLoading(false)
  }

  const handleEdit = (j: Joueur) => {
    setForm({
      nom: j.nom,
      prenom: j.prenom || '',
      numero_maillot: j.numero_maillot?.toString() || '',
      poste: (j.poste as any) || 'milieu',
      equipe_id: j.equipe_id || '',
      buts: j.buts || 0,
      passes_decisives: j.passes_decisives || 0,
      matchs_joues: j.matchs_joues || 0,
      cartons_jaunes: j.cartons_jaunes || 0,
      cartons_rouges: j.cartons_rouges || 0,
      photo_url: j.photo_url || '',
    })
    setEditId(j.id)
    setShowForm(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Supprimer ce joueur ? Cet enregistrement sera définitivement perdu.')) return
    setLoading(true)
    const { error } = await supabase.from('joueurs').delete().eq('id', id)
    if (error) {
      setMessage({ type: 'error', text: error.message })
    } else {
      setMessage({ type: 'success', text: 'Joueur supprimé.' })
      fetchData()
    }
    setLoading(false)
  }

  const resetForm = () => {
    setForm(defaultForm)
    setEditId(null)
    setShowForm(false)
  }

  const filteredJoueurs = joueurs.filter(j => {
    const matchesSearch =
      j.nom.toLowerCase().includes(search.toLowerCase()) ||
      (j.prenom && j.prenom.toLowerCase().includes(search.toLowerCase()))
    const matchesTeam = teamFilter === 'all' || j.equipe_id === teamFilter
    return matchesSearch && matchesTeam
  })

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-outfit)', fontSize: '1.8rem', fontWeight: 800, color: 'var(--color-text-primary)' }}>
            👤 Gérer les Joueurs
          </h1>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem', marginTop: 4 }}>
            Gérez les effectifs, numéros de maillot et statistiques individuelles des joueurs de Khombole
          </p>
        </div>
        <button
          onClick={() => { resetForm(); setShowForm(true) }}
          className="btn btn-primary"
          style={{ display: 'flex', alignItems: 'center', gap: 8 }}
        >
          ➕ Nouveau Joueur
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
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 16, marginBottom: 24 }} className="filters-grid">
        <input
          type="text"
          placeholder="Rechercher un joueur..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{
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
        <select
          value={teamFilter}
          onChange={e => setTeamFilter(e.target.value)}
          style={{
            padding: '14px 18px',
            borderRadius: 14,
            border: '1px solid var(--color-border)',
            background: 'white',
            outline: 'none',
            fontSize: '0.9rem',
            fontFamily: 'var(--font-outfit)',
            boxShadow: 'var(--shadow-sm)'
          }}
        >
          <option value="all">Toutes les équipes</option>
          {equipes.map(eq => (
            <option key={eq.id} value={eq.id}>{eq.nom}</option>
          ))}
        </select>
      </div>

      {/* Add/Edit Modal */}
      {showForm && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.4)',
          backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center',
          justifyContent: 'center', zIndex: 1000, padding: 20
        }}>
          <div className="card" style={{ width: '100%', maxWidth: 500, padding: 32, borderRadius: 24, background: 'white', maxHeight: '90vh', overflowY: 'auto' }}>
            <h2 style={{ fontFamily: 'var(--font-outfit)', fontSize: '1.4rem', fontWeight: 800, marginBottom: 24 }}>
              {editId ? '👤 Modifier le Joueur' : '👤 Nouveau Joueur'}
            </h2>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-text-secondary)', display: 'block', marginBottom: 6 }}>Prénom *</label>
                  <input type="text" required value={form.prenom} onChange={e => setForm({ ...form, prenom: e.target.value })} placeholder="ex: Sadio" style={{ width: '100%', padding: '12px 14px', borderRadius: 10, border: '1px solid var(--color-border)', outline: 'none' }} />
                </div>
                <div>
                  <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-text-secondary)', display: 'block', marginBottom: 6 }}>Nom *</label>
                  <input type="text" required value={form.nom} onChange={e => setForm({ ...form, nom: e.target.value })} placeholder="ex: Mané" style={{ width: '100%', padding: '12px 14px', borderRadius: 10, border: '1px solid var(--color-border)', outline: 'none' }} />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-text-secondary)', display: 'block', marginBottom: 6 }}>Numéro de maillot</label>
                  <input type="number" value={form.numero_maillot} onChange={e => setForm({ ...form, numero_maillot: e.target.value })} placeholder="ex: 10" style={{ width: '100%', padding: '12px 14px', borderRadius: 10, border: '1px solid var(--color-border)', outline: 'none' }} />
                </div>
                <div>
                  <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-text-secondary)', display: 'block', marginBottom: 6 }}>Poste *</label>
                  <select value={form.poste} onChange={e => setForm({ ...form, poste: e.target.value as any })} style={{ width: '100%', padding: '12px 14px', borderRadius: 10, border: '1px solid var(--color-border)', outline: 'none', background: 'white' }}>
                    <option value="gardien">🧤 Gardien</option>
                    <option value="defenseur">🛡️ Défenseur</option>
                    <option value="milieu">⚙️ Milieu</option>
                    <option value="attaquant">🎯 Attaquant</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-text-secondary)', display: 'block', marginBottom: 6 }}>Équipe de rattachement</label>
                <select value={form.equipe_id} onChange={e => setForm({ ...form, equipe_id: e.target.value })} style={{ width: '100%', padding: '12px 14px', borderRadius: 10, border: '1px solid var(--color-border)', outline: 'none', background: 'white' }}>
                  <option value="">Sélectionner une équipe...</option>
                  {equipes.map(eq => (
                    <option key={eq.id} value={eq.id}>{eq.nom}</option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-text-secondary)', display: 'block', marginBottom: 6 }}>Matchs joués</label>
                  <input type="number" min={0} value={form.matchs_joues} onChange={e => setForm({ ...form, matchs_joues: Number(e.target.value) })} style={{ width: '100%', padding: '12px 14px', borderRadius: 10, border: '1px solid var(--color-border)' }} />
                </div>
                <div>
                  <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-text-secondary)', display: 'block', marginBottom: 6 }}>Buts</label>
                  <input type="number" min={0} value={form.buts} onChange={e => setForm({ ...form, buts: Number(e.target.value) })} style={{ width: '100%', padding: '12px 14px', borderRadius: 10, border: '1px solid var(--color-border)' }} />
                </div>
                <div>
                  <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-text-secondary)', display: 'block', marginBottom: 6 }}>Passes déc.</label>
                  <input type="number" min={0} value={form.passes_decisives} onChange={e => setForm({ ...form, passes_decisives: Number(e.target.value) })} style={{ width: '100%', padding: '12px 14px', borderRadius: 10, border: '1px solid var(--color-border)' }} />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-text-secondary)', display: 'block', marginBottom: 6 }}>Cartons Jaunes</label>
                  <input type="number" min={0} value={form.cartons_jaunes} onChange={e => setForm({ ...form, cartons_jaunes: Number(e.target.value) })} style={{ width: '100%', padding: '12px 14px', borderRadius: 10, border: '1px solid var(--color-border)' }} />
                </div>
                <div>
                  <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-text-secondary)', display: 'block', marginBottom: 6 }}>Cartons Rouges</label>
                  <input type="number" min={0} value={form.cartons_rouges} onChange={e => setForm({ ...form, cartons_rouges: Number(e.target.value) })} style={{ width: '100%', padding: '12px 14px', borderRadius: 10, border: '1px solid var(--color-border)' }} />
                </div>
              </div>

              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-text-secondary)', display: 'block', marginBottom: 6 }}>Photo URL</label>
                <input type="text" value={form.photo_url} onChange={e => setForm({ ...form, photo_url: e.target.value })} placeholder="https://lien-photo.png" style={{ width: '100%', padding: '12px 14px', borderRadius: 10, border: '1px solid var(--color-border)', outline: 'none' }} />
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

      {/* Players List Table */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: 600 }}>
            <thead>
              <tr style={{ background: '#F8FAFC', borderBottom: '1px solid var(--color-border)' }}>
                <th style={{ padding: '16px 20px', fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-text-secondary)', textTransform: 'uppercase' }}>Joueur</th>
                <th style={{ padding: '16px 20px', fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-text-secondary)', textTransform: 'uppercase' }}>Équipe</th>
                <th style={{ padding: '16px 20px', fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-text-secondary)', textTransform: 'uppercase' }}>Poste</th>
                <th style={{ padding: '16px 20px', fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-text-secondary)', textTransform: 'uppercase', textAlign: 'center' }}>Maillot</th>
                <th style={{ padding: '16px 20px', fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-text-secondary)', textTransform: 'uppercase', textAlign: 'center' }}>MJ</th>
                <th style={{ padding: '16px 20px', fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-text-secondary)', textTransform: 'uppercase', textAlign: 'center' }}>Buts</th>
                <th style={{ padding: '16px 20px', fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-text-secondary)', textTransform: 'uppercase', textAlign: 'center' }}>Passes</th>
                <th style={{ padding: '16px 20px', fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-text-secondary)', textTransform: 'uppercase', textAlign: 'center' }}>Cartons</th>
                <th style={{ padding: '16px 20px', fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-text-secondary)', textTransform: 'uppercase', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredJoueurs.length === 0 ? (
                <tr>
                  <td colSpan={9} style={{ padding: 40, textAlign: 'center', color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>
                    Aucun joueur trouvé
                  </td>
                </tr>
              ) : filteredJoueurs.map((j, idx) => (
                <tr key={j.id} style={{ borderBottom: idx < filteredJoueurs.length - 1 ? '1px solid var(--color-border)' : 'none' }}>
                  <td style={{ padding: '16px 20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <img
                        src={j.photo_url || 'https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y'}
                        alt={j.nom}
                        style={{ width: 36, height: 36, borderRadius: '50%', objectFit: 'cover' }}
                      />
                      <div>
                        <div style={{ fontSize: '0.875rem', fontWeight: 700 }}>{j.prenom} {j.nom}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '16px 20px', fontSize: '0.875rem', fontWeight: 500 }}>
                    {j.equipe?.nom || <span style={{ color: 'var(--color-text-muted)' }}>Sans équipe</span>}
                  </td>
                  <td style={{ padding: '16px 20px', fontSize: '0.82rem', fontWeight: 600 }}>
                    {POSTE_LABELS[j.poste || ''] || j.poste}
                  </td>
                  <td style={{ padding: '16px 20px', fontSize: '0.875rem', fontWeight: 700, textAlign: 'center' }}>
                    {j.numero_maillot ?? '-'}
                  </td>
                  <td style={{ padding: '16px 20px', fontSize: '0.875rem', textAlign: 'center' }}>{j.matchs_joues}</td>
                  <td style={{ padding: '16px 20px', fontSize: '0.875rem', fontWeight: 700, color: 'var(--color-primary)', textAlign: 'center' }}>{j.buts}</td>
                  <td style={{ padding: '16px 20px', fontSize: '0.875rem', textAlign: 'center' }}>{j.passes_decisives}</td>
                  <td style={{ padding: '16px 20px', textAlign: 'center' }}>
                    <div style={{ display: 'flex', gap: 4, justifyContent: 'center', fontSize: '0.8rem' }}>
                      {j.cartons_jaunes > 0 && <span style={{ padding: '2px 6px', background: '#FEF08A', color: '#854D0E', borderRadius: 4, fontWeight: 700 }}>🟨 {j.cartons_jaunes}</span>}
                      {j.cartons_rouges > 0 && <span style={{ padding: '2px 6px', background: '#FCA5A5', color: '#991B1B', borderRadius: 4, fontWeight: 700 }}>🟥 {j.cartons_rouges}</span>}
                      {j.cartons_jaunes === 0 && j.cartons_rouges === 0 && '-'}
                    </div>
                  </td>
                  <td style={{ padding: '16px 20px', textAlign: 'right' }}>
                    <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                      <button onClick={() => handleEdit(j)} className="btn btn-sm btn-outline" style={{ padding: '6px 10px' }}>✏️</button>
                      <button onClick={() => handleDelete(j.id)} className="btn btn-sm btn-outline" style={{ padding: '6px 10px', borderColor: '#FECACA', color: '#EF4444' }}>🗑️</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <style>{`
        @media (max-width: 600px) {
          .filters-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  )
}
