'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

interface Equipe {
  id: string
  nom: string
  sigle: string | null
  couleur_principale: string
}

interface MatchData {
  id: string
  date_match: string
  heure_match: string
  stade: string
  journee: number
  statut: string
  equipe_a_id: string
  equipe_b_id: string
  equipe_a?: Equipe
  equipe_b?: Equipe
}

const STATUT_LABELS: Record<string, { label: string; color: string; bg: string }> = {
  a_venir: { label: 'À venir', color: '#006233', bg: 'rgba(0,98,51,0.08)' },
  en_cours: { label: 'En cours', color: '#E8002D', bg: 'rgba(232,0,45,0.08)' },
  termine: { label: 'Terminé', color: '#64748b', bg: 'rgba(100,116,139,0.08)' },
}

const defaultForm = {
  date_match: '',
  heure_match: '15:00',
  stade: 'Stade de Khombole',
  journee: 1,
  statut: 'a_venir',
  equipe_a_id: '',
  equipe_b_id: '',
}

export default function AdminMatchsPage() {
  const supabase = createClient() as any
  const [equipes, setEquipes] = useState<Equipe[]>([])
  const [matchs, setMatchs] = useState<MatchData[]>([])
  const [form, setForm] = useState(defaultForm)
  const [editId, setEditId] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [filterJournee, setFilterJournee] = useState<number | 'all'>('all')

  const fetchData = async () => {
    const [{ data: eqs }, { data: mts }] = await Promise.all([
      supabase.from('equipes').select('id, nom, sigle, couleur_principale').order('nom'),
      supabase.from('matchs').select(`
        id, date_match, heure_match, stade, journee, statut, equipe_a_id, equipe_b_id,
        equipe_a:equipes!matchs_equipe_a_id_fkey(id, nom, sigle, couleur_principale),
        equipe_b:equipes!matchs_equipe_b_id_fkey(id, nom, sigle, couleur_principale)
      `).order('journee').order('date_match').order('heure_match'),
    ])
    setEquipes(eqs || [])
    setMatchs((mts || []) as MatchData[])
  }

  useEffect(() => { fetchData() }, [])

  const resetForm = () => {
    setForm(defaultForm)
    setEditId(null)
    setShowForm(false)
    setMessage(null)
  }

  const handleEdit = (m: MatchData) => {
    setForm({
      date_match: m.date_match,
      heure_match: m.heure_match?.slice(0, 5) || '15:00',
      stade: m.stade || 'Stade de Khombole',
      journee: m.journee,
      statut: m.statut,
      equipe_a_id: m.equipe_a_id,
      equipe_b_id: m.equipe_b_id,
    })
    setEditId(m.id)
    setShowForm(true)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Supprimer ce match ? Cette action est irréversible.')) return
    const { error } = await supabase.from('matchs').delete().eq('id', id)
    if (error) {
      setMessage({ type: 'error', text: 'Erreur : ' + error.message })
    } else {
      setMessage({ type: 'success', text: 'Match supprimé.' })
      fetchData()
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (form.equipe_a_id === form.equipe_b_id) {
      setMessage({ type: 'error', text: 'Les deux équipes doivent être différentes.' })
      return
    }
    setLoading(true)
    setMessage(null)
    const payload = { ...form, journee: Number(form.journee) }
    let error
    if (editId) {
      ({ error } = await supabase.from('matchs').update(payload).eq('id', editId))
    } else {
      ({ error } = await supabase.from('matchs').insert(payload))
    }
    setLoading(false)
    if (error) {
      setMessage({ type: 'error', text: 'Erreur : ' + error.message })
    } else {
      setMessage({ type: 'success', text: editId ? 'Match mis à jour !' : 'Match créé avec succès !' })
      resetForm()
      fetchData()
    }
  }

  const filteredMatchs = filterJournee === 'all' ? matchs : matchs.filter(m => m.journee === filterJournee)
  const journees = [...new Set(matchs.map(m => m.journee))].sort((a, b) => a - b)

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, fontFamily: 'var(--font-outfit)', color: 'var(--color-text-primary)' }}>
            ⚽ Gestion des Matchs
          </h1>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem', marginTop: 4 }}>
            Planifier, modifier et supprimer les matchs du calendrier
          </p>
        </div>
        <button
          id="admin-create-match-btn"
          onClick={() => { setShowForm(!showForm); if (showForm) resetForm() }}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            padding: '10px 20px', borderRadius: 'var(--radius-full)',
            background: showForm ? 'var(--color-surface)' : 'var(--gradient-green)',
            color: showForm ? 'var(--color-text-primary)' : 'white',
            border: showForm ? '1px solid var(--color-border)' : 'none',
            fontWeight: 700, fontSize: '0.875rem', cursor: 'pointer',
            transition: 'all 0.2s', fontFamily: 'var(--font-outfit)',
          }}
        >
          {showForm ? '✕ Annuler' : '+ Nouveau Match'}
        </button>
      </div>

      {/* Message */}
      {message && (
        <div style={{
          padding: '12px 18px', borderRadius: 'var(--radius-md)', marginBottom: 20,
          background: message.type === 'success' ? 'rgba(0,166,81,0.1)' : 'rgba(232,0,45,0.1)',
          color: message.type === 'success' ? 'var(--color-primary)' : 'var(--color-red)',
          border: `1px solid ${message.type === 'success' ? 'rgba(0,166,81,0.3)' : 'rgba(232,0,45,0.3)'}`,
          fontWeight: 600, fontSize: '0.875rem',
        }}>
          {message.type === 'success' ? '✅' : '❌'} {message.text}
        </div>
      )}

      {/* Form */}
      {showForm && (
        <div style={{ background: 'white', borderRadius: 'var(--radius-xl)', border: '1px solid var(--color-border)', padding: 28, marginBottom: 28, boxShadow: 'var(--shadow-md)' }}>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: 20, color: 'var(--color-text-primary)' }}>
            {editId ? '✏️ Modifier le match' : '➕ Créer un nouveau match'}
          </h2>
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>

              {/* Équipe A */}
              <div>
                <label style={{ display: 'block', fontWeight: 600, fontSize: '0.8rem', color: 'var(--color-text-secondary)', marginBottom: 6 }}>
                  Équipe A *
                </label>
                <select
                  required
                  value={form.equipe_a_id}
                  onChange={e => setForm(f => ({ ...f, equipe_a_id: e.target.value }))}
                  id="match-equipe-a-select"
                  style={{ width: '100%', padding: '10px 12px', borderRadius: 'var(--radius-md)', border: '1.5px solid var(--color-border)', fontSize: '0.875rem', background: 'white', color: 'var(--color-text-primary)', cursor: 'pointer' }}
                >
                  <option value="">-- Choisir --</option>
                  {equipes.map(e => <option key={e.id} value={e.id}>{e.nom}</option>)}
                </select>
              </div>

              {/* Équipe B */}
              <div>
                <label style={{ display: 'block', fontWeight: 600, fontSize: '0.8rem', color: 'var(--color-text-secondary)', marginBottom: 6 }}>
                  Équipe B *
                </label>
                <select
                  required
                  value={form.equipe_b_id}
                  onChange={e => setForm(f => ({ ...f, equipe_b_id: e.target.value }))}
                  id="match-equipe-b-select"
                  style={{ width: '100%', padding: '10px 12px', borderRadius: 'var(--radius-md)', border: '1.5px solid var(--color-border)', fontSize: '0.875rem', background: 'white', color: 'var(--color-text-primary)', cursor: 'pointer' }}
                >
                  <option value="">-- Choisir --</option>
                  {equipes.map(e => <option key={e.id} value={e.id}>{e.nom}</option>)}
                </select>
              </div>

              {/* Date */}
              <div>
                <label style={{ display: 'block', fontWeight: 600, fontSize: '0.8rem', color: 'var(--color-text-secondary)', marginBottom: 6 }}>
                  Date *
                </label>
                <input
                  type="date"
                  required
                  value={form.date_match}
                  onChange={e => setForm(f => ({ ...f, date_match: e.target.value }))}
                  id="match-date-input"
                  style={{ width: '100%', padding: '10px 12px', borderRadius: 'var(--radius-md)', border: '1.5px solid var(--color-border)', fontSize: '0.875rem', color: 'var(--color-text-primary)' }}
                />
              </div>

              {/* Heure */}
              <div>
                <label style={{ display: 'block', fontWeight: 600, fontSize: '0.8rem', color: 'var(--color-text-secondary)', marginBottom: 6 }}>
                  Heure *
                </label>
                <input
                  type="time"
                  required
                  value={form.heure_match}
                  onChange={e => setForm(f => ({ ...f, heure_match: e.target.value }))}
                  id="match-heure-input"
                  style={{ width: '100%', padding: '10px 12px', borderRadius: 'var(--radius-md)', border: '1.5px solid var(--color-border)', fontSize: '0.875rem', color: 'var(--color-text-primary)' }}
                />
              </div>

              {/* Stade */}
              <div>
                <label style={{ display: 'block', fontWeight: 600, fontSize: '0.8rem', color: 'var(--color-text-secondary)', marginBottom: 6 }}>
                  Stade
                </label>
                <input
                  type="text"
                  value={form.stade}
                  onChange={e => setForm(f => ({ ...f, stade: e.target.value }))}
                  id="match-stade-input"
                  placeholder="Stade de Khombole"
                  style={{ width: '100%', padding: '10px 12px', borderRadius: 'var(--radius-md)', border: '1.5px solid var(--color-border)', fontSize: '0.875rem', color: 'var(--color-text-primary)' }}
                />
              </div>

              {/* Journée */}
              <div>
                <label style={{ display: 'block', fontWeight: 600, fontSize: '0.8rem', color: 'var(--color-text-secondary)', marginBottom: 6 }}>
                  Journée
                </label>
                <input
                  type="number"
                  min={1}
                  max={10}
                  value={form.journee}
                  onChange={e => setForm(f => ({ ...f, journee: Number(e.target.value) }))}
                  id="match-journee-input"
                  style={{ width: '100%', padding: '10px 12px', borderRadius: 'var(--radius-md)', border: '1.5px solid var(--color-border)', fontSize: '0.875rem', color: 'var(--color-text-primary)' }}
                />
              </div>

              {/* Statut */}
              <div>
                <label style={{ display: 'block', fontWeight: 600, fontSize: '0.8rem', color: 'var(--color-text-secondary)', marginBottom: 6 }}>
                  Statut
                </label>
                <select
                  value={form.statut}
                  onChange={e => setForm(f => ({ ...f, statut: e.target.value }))}
                  id="match-statut-select"
                  style={{ width: '100%', padding: '10px 12px', borderRadius: 'var(--radius-md)', border: '1.5px solid var(--color-border)', fontSize: '0.875rem', background: 'white', color: 'var(--color-text-primary)', cursor: 'pointer' }}
                >
                  <option value="a_venir">À venir</option>
                  <option value="en_cours">En cours</option>
                  <option value="termine">Terminé</option>
                </select>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
              <button
                type="submit"
                id="match-submit-btn"
                disabled={loading}
                style={{
                  padding: '12px 28px', borderRadius: 'var(--radius-full)',
                  background: 'var(--gradient-green)', color: 'white',
                  border: 'none', fontWeight: 700, fontSize: '0.875rem', cursor: loading ? 'not-allowed' : 'pointer',
                  opacity: loading ? 0.7 : 1, transition: 'all 0.2s', fontFamily: 'var(--font-outfit)',
                }}
              >
                {loading ? 'Enregistrement...' : editId ? '✏️ Mettre à jour' : '➕ Créer le match'}
              </button>
              <button
                type="button"
                onClick={resetForm}
                style={{
                  padding: '12px 20px', borderRadius: 'var(--radius-full)',
                  background: 'transparent', color: 'var(--color-text-secondary)',
                  border: '1px solid var(--color-border)', fontWeight: 600, fontSize: '0.875rem', cursor: 'pointer',
                }}
              >
                Annuler
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Filter by journée */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
        <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-text-muted)' }}>Filtrer :</span>
        {(['all', ...journees] as (number | 'all')[]).map(j => (
          <button
            key={j}
            onClick={() => setFilterJournee(j)}
            style={{
              padding: '5px 14px', borderRadius: 'var(--radius-full)', fontSize: '0.8rem', fontWeight: 600,
              background: filterJournee === j ? 'var(--gradient-green)' : 'white',
              color: filterJournee === j ? 'white' : 'var(--color-text-secondary)',
              border: '1px solid var(--color-border)', cursor: 'pointer', transition: 'all 0.2s',
            }}
          >
            {j === 'all' ? 'Toutes' : `J${j}`}
          </button>
        ))}
        <span style={{ marginLeft: 'auto', fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
          {filteredMatchs.length} match{filteredMatchs.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Matchs Table */}
      <div style={{ background: 'white', borderRadius: 'var(--radius-xl)', border: '1px solid var(--color-border)', overflow: 'hidden', boxShadow: 'var(--shadow-sm)' }}>
        {filteredMatchs.length === 0 ? (
          <div style={{ padding: 48, textAlign: 'center', color: 'var(--color-text-muted)' }}>
            <div style={{ fontSize: '3rem', marginBottom: 12 }}>⚽</div>
            <div style={{ fontWeight: 600 }}>Aucun match trouvé</div>
            <div style={{ fontSize: '0.875rem', marginTop: 6 }}>Cliquez sur "Nouveau Match" pour en créer un.</div>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: 'var(--color-surface)', borderBottom: '1px solid var(--color-border)' }}>
                  {['J', 'Date', 'Heure', 'Équipe A', 'vs', 'Équipe B', 'Stade', 'Statut', 'Actions'].map(h => (
                    <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', whiteSpace: 'nowrap' }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredMatchs.map((m, i) => {
                  const s = STATUT_LABELS[m.statut] || { label: m.statut, color: '#64748b', bg: 'transparent' }
                  return (
                    <tr key={m.id} style={{ borderBottom: '1px solid var(--color-border)', background: i % 2 === 0 ? 'white' : 'rgba(0,0,0,0.01)', transition: 'background 0.15s' }}
                      onMouseOver={e => (e.currentTarget.style.background = 'rgba(0,98,51,0.03)')}
                      onMouseOut={e => (e.currentTarget.style.background = i % 2 === 0 ? 'white' : 'rgba(0,0,0,0.01)')}
                    >
                      <td style={{ padding: '12px 16px', fontSize: '0.8rem', fontWeight: 700, color: 'var(--color-primary)', whiteSpace: 'nowrap' }}>J{m.journee}</td>
                      <td style={{ padding: '12px 16px', fontSize: '0.8rem', color: 'var(--color-text-secondary)', whiteSpace: 'nowrap' }}>
                        {new Date(m.date_match).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
                      </td>
                      <td style={{ padding: '12px 16px', fontSize: '0.8rem', color: 'var(--color-text-secondary)', whiteSpace: 'nowrap' }}>
                        {m.heure_match?.slice(0, 5) || '-'}
                      </td>
                      <td style={{ padding: '12px 16px', whiteSpace: 'nowrap' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <div style={{ width: 8, height: 8, borderRadius: '50%', background: (m.equipe_a as any)?.couleur_principale || '#ccc', flexShrink: 0 }} />
                          <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-text-primary)' }}>
                            {(m.equipe_a as any)?.nom || '-'}
                          </span>
                        </div>
                      </td>
                      <td style={{ padding: '12px 8px', fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-text-muted)', textAlign: 'center' }}>vs</td>
                      <td style={{ padding: '12px 16px', whiteSpace: 'nowrap' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <div style={{ width: 8, height: 8, borderRadius: '50%', background: (m.equipe_b as any)?.couleur_principale || '#ccc', flexShrink: 0 }} />
                          <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-text-primary)' }}>
                            {(m.equipe_b as any)?.nom || '-'}
                          </span>
                        </div>
                      </td>
                      <td style={{ padding: '12px 16px', fontSize: '0.8rem', color: 'var(--color-text-muted)', maxWidth: 140, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {m.stade || '-'}
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <span style={{ display: 'inline-flex', alignItems: 'center', padding: '3px 10px', borderRadius: 'var(--radius-full)', fontSize: '0.75rem', fontWeight: 700, color: s.color, background: s.bg, whiteSpace: 'nowrap' }}>
                          {s.label}
                        </span>
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <div style={{ display: 'flex', gap: 6 }}>
                          <button
                            onClick={() => handleEdit(m)}
                            title="Modifier"
                            style={{ width: 32, height: 32, borderRadius: 'var(--radius-md)', background: 'rgba(0,98,51,0.08)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9rem', transition: 'all 0.2s' }}
                            onMouseOver={e => (e.currentTarget.style.background = 'rgba(0,98,51,0.18)')}
                            onMouseOut={e => (e.currentTarget.style.background = 'rgba(0,98,51,0.08)')}
                          >✏️</button>
                          <button
                            onClick={() => handleDelete(m.id)}
                            title="Supprimer"
                            style={{ width: 32, height: 32, borderRadius: 'var(--radius-md)', background: 'rgba(232,0,45,0.07)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9rem', transition: 'all 0.2s' }}
                            onMouseOver={e => (e.currentTarget.style.background = 'rgba(232,0,45,0.15)')}
                            onMouseOut={e => (e.currentTarget.style.background = 'rgba(232,0,45,0.07)')}
                          >🗑️</button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
