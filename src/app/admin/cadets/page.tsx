'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { defaultCadetMatches, type CadetEquipe, type CadetMatch } from '@/lib/cadets'

type CadetForm = {
  journee: number
  date_match: string
  poule: string
  equipe_a_id: string
  equipe_b_id: string
  terrain: string
  ordre: string
}

const defaultForm: CadetForm = {
  journee: 1,
  date_match: '',
  poule: 'A',
  equipe_a_id: '',
  equipe_b_id: '',
  terrain: '',
  ordre: '',
}

export default function AdminCadetsPage() {
  const supabase = createClient() as any
  const [matchs, setMatchs] = useState<CadetMatch[]>([])
  const [equipes, setEquipes] = useState<CadetEquipe[]>([])
  const [form, setForm] = useState<CadetForm>(defaultForm)
  const [editId, setEditId] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [filterJournee, setFilterJournee] = useState<number | 'all'>('all')

  const fetchData = async () => {
    setLoading(true)
    const [{ data, error }, { data: equipesData }] = await Promise.all([
      supabase
        .from('cadet_matchs')
        .select(`
          id, journee, date_match, poule, equipe_a_id, equipe_b_id, equipe_a, equipe_b, terrain, ordre,
          equipe_a_info:equipes!cadet_matchs_equipe_a_id_fkey(id, nom, sigle, logo_url, couleur_principale, couleur_secondaire, quartier, asc_nom),
          equipe_b_info:equipes!cadet_matchs_equipe_b_id_fkey(id, nom, sigle, logo_url, couleur_principale, couleur_secondaire, quartier, asc_nom)
        `)
        .order('journee')
        .order('date_match')
        .order('ordre'),
      supabase.from('equipes').select('id, nom, sigle, logo_url, couleur_principale, couleur_secondaire, quartier, asc_nom').order('nom'),
    ])

    if (error) {
      setMessage({ type: 'error', text: 'Table cadet_matchs indisponible. Appliquez la migration Supabase.' })
      setMatchs(defaultCadetMatches)
    } else {
      setMatchs((data || []) as CadetMatch[])
    }
    setEquipes((equipesData || []) as CadetEquipe[])
    setLoading(false)
  }

  useEffect(() => {
    fetchData()
  }, [])

  const resetForm = () => {
    setForm(defaultForm)
    setEditId(null)
    setShowForm(false)
  }

  const handleEdit = (match: CadetMatch) => {
    setForm({
      journee: match.journee,
      date_match: match.date_match,
      poule: match.poule,
      equipe_a_id: match.equipe_a_id || '',
      equipe_b_id: match.equipe_b_id || '',
      terrain: match.terrain,
      ordre: match.ordre || '',
    })
    setEditId(match.id || null)
    setShowForm(true)
    setMessage(null)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const equipeA = equipes.find(equipe => equipe.id === form.equipe_a_id)
    const equipeB = equipes.find(equipe => equipe.id === form.equipe_b_id)
    if (!equipeA || !equipeB) {
      setMessage({ type: 'error', text: 'Choisissez deux ASC existantes.' })
      return
    }
    if (equipeA.id === equipeB.id) {
      setMessage({ type: 'error', text: 'Les deux ASC doivent etre differentes.' })
      return
    }
    setLoading(true)
    setMessage(null)

    const payload = {
      journee: Number(form.journee),
      date_match: form.date_match,
      poule: form.poule,
      equipe_a_id: equipeA.id,
      equipe_b_id: equipeB.id,
      equipe_a: equipeA.nom,
      equipe_b: equipeB.nom,
      terrain: form.terrain.trim(),
      ordre: form.ordre.trim() || null,
    }

    const { error } = editId
      ? await supabase.from('cadet_matchs').update(payload).eq('id', editId)
      : await supabase.from('cadet_matchs').insert(payload)

    setLoading(false)
    if (error) {
      setMessage({ type: 'error', text: error.message })
      return
    }

    setMessage({ type: 'success', text: editId ? 'Rencontre cadette mise a jour.' : 'Rencontre cadette ajoutee.' })
    resetForm()
    fetchData()
  }

  const handleDelete = async (id?: string) => {
    if (!id) return
    if (!confirm('Supprimer cette rencontre cadette ?')) return
    const { error } = await supabase.from('cadet_matchs').delete().eq('id', id)
    if (error) {
      setMessage({ type: 'error', text: error.message })
    } else {
      setMessage({ type: 'success', text: 'Rencontre supprimee.' })
      fetchData()
    }
  }

  const seedDefaultCalendar = async () => {
    if (!confirm('Importer le calendrier cadets de la photo dans la base ?')) return
    setLoading(true)
    const rows = defaultCadetMatches.map(match => {
      const equipeA = findEquipeByName(equipes, match.equipe_a)
      const equipeB = findEquipeByName(equipes, match.equipe_b)
      return {
        ...match,
        equipe_a_id: equipeA?.id || null,
        equipe_b_id: equipeB?.id || null,
        equipe_a: equipeA?.nom || match.equipe_a,
        equipe_b: equipeB?.nom || match.equipe_b,
      }
    })
    const { error } = await supabase.from('cadet_matchs').insert(rows)
    setLoading(false)
    if (error) {
      setMessage({ type: 'error', text: error.message })
      return
    }
    setMessage({ type: 'success', text: 'Calendrier cadets importe.' })
    fetchData()
  }

  const filteredMatchs = filterJournee === 'all' ? matchs : matchs.filter(match => match.journee === filterJournee)
  const journees = [...new Set(matchs.map(match => match.journee))].sort((a, b) => a - b)

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28, gap: 12, flexWrap: 'wrap' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, fontFamily: 'var(--font-plus-jakarta)', color: 'var(--color-text-primary)' }}>
            Calendrier Cadets
          </h1>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem', marginTop: 4 }}>
            Modifier les rencontres cadettes avec les ASC deja creees dans la page Equipes.
          </p>
        </div>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <button onClick={seedDefaultCalendar} className="btn btn-outline" disabled={loading}>
            Importer calendrier
          </button>
          <button onClick={() => { resetForm(); setShowForm(true) }} className="btn btn-primary">
            Nouvelle rencontre
          </button>
        </div>
      </div>

      {message && (
        <div style={{
          padding: '12px 18px',
          borderRadius: 'var(--radius-md)',
          marginBottom: 20,
          background: message.type === 'success' ? 'rgba(0,166,81,0.1)' : 'rgba(232,0,45,0.1)',
          color: message.type === 'success' ? 'var(--color-primary)' : 'var(--color-red)',
          border: `1px solid ${message.type === 'success' ? 'rgba(0,166,81,0.3)' : 'rgba(232,0,45,0.3)'}`,
          fontWeight: 600,
          fontSize: '0.875rem',
        }}>
          {message.text}
        </div>
      )}

      {showForm && (
        <div style={{ background: 'var(--color-surface-elevated)', borderRadius: 'var(--radius-xl)', border: '1px solid var(--color-border)', padding: 28, marginBottom: 28, boxShadow: 'var(--shadow-md)' }}>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: 18 }}>
            {editId ? 'Modifier la rencontre' : 'Ajouter une rencontre'}
          </h2>
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
              <Field label="Journee">
                <input type="number" min={1} required value={form.journee} onChange={e => setForm({ ...form, journee: Number(e.target.value) })} style={inputStyle} />
              </Field>
              <Field label="Date">
                <input type="date" required value={form.date_match} onChange={e => setForm({ ...form, date_match: e.target.value })} style={inputStyle} />
              </Field>
              <Field label="Poule">
                <select value={form.poule} onChange={e => setForm({ ...form, poule: e.target.value })} style={inputStyle}>
                  <option value="A">A</option>
                  <option value="B">B</option>
                  <option value="B&C">B&C</option>
                  <option value="C">C</option>
                </select>
              </Field>
              <Field label="ASC A">
                <select required value={form.equipe_a_id} onChange={e => setForm({ ...form, equipe_a_id: e.target.value })} style={inputStyle}>
                  <option value="">Choisir une ASC</option>
                  {equipes.map(equipe => <option key={equipe.id} value={equipe.id}>{equipe.nom}</option>)}
                </select>
              </Field>
              <Field label="ASC B">
                <select required value={form.equipe_b_id} onChange={e => setForm({ ...form, equipe_b_id: e.target.value })} style={inputStyle}>
                  <option value="">Choisir une ASC</option>
                  {equipes.map(equipe => <option key={equipe.id} value={equipe.id}>{equipe.nom}</option>)}
                </select>
              </Field>
              <Field label="Terrain">
                <input required value={form.terrain} onChange={e => setForm({ ...form, terrain: e.target.value })} placeholder="RAIL" style={inputStyle} />
              </Field>
              <Field label="Ordre">
                <input value={form.ordre} onChange={e => setForm({ ...form, ordre: e.target.value })} placeholder="1ere H, 2e H..." style={inputStyle} />
              </Field>
            </div>
            <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
              <button type="submit" className="btn btn-primary" disabled={loading}>{loading ? 'Enregistrement...' : 'Sauvegarder'}</button>
              <button type="button" onClick={resetForm} className="btn btn-outline">Annuler</button>
            </div>
          </form>
        </div>
      )}

      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 18, flexWrap: 'wrap' }}>
        <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--color-text-muted)' }}>Filtrer :</span>
        {(['all', ...journees] as (number | 'all')[]).map(journee => (
          <button
            key={journee}
            onClick={() => setFilterJournee(journee)}
            style={{
              padding: '6px 14px',
              borderRadius: 'var(--radius-full)',
              border: '1px solid var(--color-border)',
              background: filterJournee === journee ? 'var(--gradient-green)' : 'white',
              color: filterJournee === journee ? 'white' : 'var(--color-text-secondary)',
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            {journee === 'all' ? 'Toutes' : `J${journee}`}
          </button>
        ))}
      </div>

      <div style={{ background: 'var(--color-surface-elevated)', borderRadius: 'var(--radius-xl)', border: '1px solid var(--color-border)', overflow: 'hidden', boxShadow: 'var(--shadow-sm)' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 900 }}>
            <thead>
              <tr style={{ background: 'var(--color-surface)' }}>
                {['J', 'Date', 'Poule', 'Rencontre', 'Terrain', 'Ordre', 'Actions'].map(header => (
                  <th key={header} style={{ padding: '12px 16px', textAlign: 'left', fontSize: '0.75rem', fontWeight: 800, color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>{header}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredMatchs.map(match => (
                <tr key={match.id || `${match.journee}-${match.date_match}-${match.equipe_a}-${match.equipe_b}`} style={{ borderTop: '1px solid var(--color-border)' }}>
                  <td style={tdStyle}>J{match.journee}</td>
                  <td style={tdStyle}>{new Date(`${match.date_match}T12:00:00`).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })}</td>
                  <td style={tdStyle}>{match.poule}</td>
                  <td style={{ ...tdStyle, fontWeight: 800, color: 'var(--color-text-primary)' }}>
                    {match.equipe_a_info?.nom || match.equipe_a} vs {match.equipe_b_info?.nom || match.equipe_b}
                  </td>
                  <td style={tdStyle}>{match.terrain}</td>
                  <td style={tdStyle}>{match.ordre || '-'}</td>
                  <td style={tdStyle}>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button onClick={() => handleEdit(match)} className="btn btn-sm btn-outline">Modifier</button>
                      <button onClick={() => handleDelete(match.id)} className="btn btn-sm btn-outline" style={{ color: 'var(--color-red)', borderColor: '#FEE2E2' }}>Supprimer</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label style={{ display: 'grid', gap: 6, fontSize: '0.78rem', fontWeight: 800, color: 'var(--color-text-secondary)' }}>
      {label}
      {children}
    </label>
  )
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '11px 12px',
  borderRadius: 'var(--radius-md)',
  border: '1.5px solid var(--color-border)',
  background: 'var(--color-surface-elevated)',
  color: 'var(--color-text-primary)',
}

const tdStyle: React.CSSProperties = {
  padding: '12px 16px',
  fontSize: '0.84rem',
  color: 'var(--color-text-secondary)',
  whiteSpace: 'nowrap',
}

function findEquipeByName(equipes: CadetEquipe[], name: string) {
  const normalizedName = normalizeName(name)
  return equipes.find(equipe =>
    normalizeName(equipe.nom) === normalizedName ||
    normalizeName(equipe.sigle || '') === normalizedName ||
    normalizeName(equipe.nom).includes(normalizedName) ||
    normalizedName.includes(normalizeName(equipe.sigle || equipe.nom))
  )
}

function normalizeName(name: string) {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/^asc\s+/, '')
    .replace(/[^a-z0-9]/g, '')
}
