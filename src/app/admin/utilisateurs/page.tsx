'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

interface Profile {
  id: string
  username: string
  full_name: string | null
  avatar_url: string | null
  quartier: string | null
  asc_nom: string | null
  points: number
  total_pronostics: number
  pronostics_corrects: number
  is_admin: boolean
}

export default function AdminUtilisateursPage() {
  const supabase = createClient() as any
  const [utilisateurs, setUtilisateurs] = useState<Profile[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(false)
  const [editUser, setEditUser] = useState<Profile | null>(null)
  const [editPoints, setEditPoints] = useState<number>(0)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const fetchUsers = async () => {
    setLoading(true)
    const { data, error } = await supabase.from('profiles').select('*').order('points', { ascending: false })
    if (!error) setUtilisateurs(data || [])
    setLoading(false)
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  const handleToggleAdmin = async (user: Profile) => {
    // Primary admin protection
    if (user.id === 'b6cb5c51-7def-4a37-b83d-719fce78b3a5' || user.username === 'admin_khombole') {
      alert("Impossible de désactiver les droits d'administration de l'administrateur principal.")
      return
    }

    setLoading(true)
    const newStatus = !user.is_admin
    const { error } = await supabase.from('profiles').update({ is_admin: newStatus }).eq('id', user.id)
    if (error) {
      setMessage({ type: 'error', text: error.message })
    } else {
      setMessage({ type: 'success', text: `Rôle mis à jour pour ${user.username}.` })
      fetchUsers()
    }
    setLoading(false)
  }

  const handleSavePoints = async () => {
    if (!editUser) return
    setLoading(true)
    const { error } = await supabase.from('profiles').update({ points: editPoints }).eq('id', editUser.id)
    if (error) {
      setMessage({ type: 'error', text: error.message })
    } else {
      setMessage({ type: 'success', text: `Points de ${editUser.username} mis à jour à ${editPoints}.` })
      setEditUser(null)
      fetchUsers()
    }
    setLoading(false)
  }

  const filteredUsers = utilisateurs.filter(u =>
    u.username.toLowerCase().includes(search.toLowerCase()) ||
    (u.full_name && u.full_name.toLowerCase().includes(search.toLowerCase())) ||
    (u.quartier && u.quartier.toLowerCase().includes(search.toLowerCase())) ||
    (u.asc_nom && u.asc_nom.toLowerCase().includes(search.toLowerCase()))
  )

  return (
    <div>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontFamily: 'var(--font-outfit)', fontSize: '1.8rem', fontWeight: 800, color: 'var(--color-text-primary)' }}>
          👥 Gérer les Utilisateurs
        </h1>
        <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem', marginTop: 4 }}>
          Suivez les points, gérez les rôles d'administration et ajustez les comptes des supporters.
        </p>
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
          placeholder="Rechercher un utilisateur par nom, quartier ou ASC soutenue..."
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

      {/* Edit Points Modal */}
      {editUser && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.4)',
          backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center',
          justifyContent: 'center', zIndex: 1000, padding: 20
        }}>
          <div className="card" style={{ width: '100%', maxWidth: 400, padding: 32, borderRadius: 24, background: 'white' }}>
            <h2 style={{ fontFamily: 'var(--font-outfit)', fontSize: '1.25rem', fontWeight: 800, marginBottom: 16 }}>
              🎯 Ajuster les Points
            </h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', marginBottom: 20 }}>
              Modification des points de <strong>{editUser.username}</strong>.
            </p>
            <div style={{ marginBottom: 20 }}>
              <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-text-secondary)', display: 'block', marginBottom: 8 }}>Points actuels</label>
              <input
                type="number"
                value={editPoints}
                onChange={e => setEditPoints(Number(e.target.value))}
                style={{ width: '100%', padding: '12px 14px', borderRadius: 10, border: '1px solid var(--color-border)', outline: 'none' }}
              />
            </div>
            <div style={{ display: 'flex', gap: 12 }}>
              <button type="button" onClick={() => setEditUser(null)} className="btn btn-outline" style={{ flex: 1 }}>Annuler</button>
              <button type="button" onClick={handleSavePoints} disabled={loading} className="btn btn-primary" style={{ flex: 2 }}>
                Enregistrer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Users table */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: 600 }}>
            <thead>
              <tr style={{ background: '#F8FAFC', borderBottom: '1px solid var(--color-border)' }}>
                <th style={{ padding: '16px 20px', fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-text-secondary)', textTransform: 'uppercase' }}>Supporter</th>
                <th style={{ padding: '16px 20px', fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-text-secondary)', textTransform: 'uppercase' }}>Quartier & ASC</th>
                <th style={{ padding: '16px 20px', fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-text-secondary)', textTransform: 'uppercase', textAlign: 'center' }}>Points</th>
                <th style={{ padding: '16px 20px', fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-text-secondary)', textTransform: 'uppercase', textAlign: 'center' }}>Pronos</th>
                <th style={{ padding: '16px 20px', fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-text-secondary)', textTransform: 'uppercase', textAlign: 'center' }}>Corrects</th>
                <th style={{ padding: '16px 20px', fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-text-secondary)', textTransform: 'uppercase', textAlign: 'center' }}>Rôle</th>
                <th style={{ padding: '16px 20px', fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-text-secondary)', textTransform: 'uppercase', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ padding: 40, textAlign: 'center', color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>
                    Aucun supporter trouvé
                  </td>
                </tr>
              ) : filteredUsers.map((u, idx) => (
                <tr key={u.id} style={{ borderBottom: idx < filteredUsers.length - 1 ? '1px solid var(--color-border)' : 'none' }}>
                  <td style={{ padding: '16px 20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <img
                        src={u.avatar_url || 'https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y'}
                        alt={u.username}
                        style={{ width: 36, height: 36, borderRadius: '50%', objectFit: 'cover' }}
                      />
                      <div>
                        <div style={{ fontSize: '0.875rem', fontWeight: 700 }}>{u.username}</div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)' }}>{u.full_name || 'Pas de nom complet'}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '16px 20px', fontSize: '0.82rem' }}>
                    <div>📍 {u.quartier || '-'}</div>
                    <div style={{ color: 'var(--color-text-muted)', fontSize: '0.72rem', marginTop: 2 }}>🛡️ {u.asc_nom || '-'}</div>
                  </td>
                  <td style={{ padding: '16px 20px', fontSize: '0.9rem', fontWeight: 800, color: 'var(--color-primary)', textAlign: 'center' }}>
                    {u.points}
                  </td>
                  <td style={{ padding: '16px 20px', fontSize: '0.875rem', textAlign: 'center' }}>{u.total_pronostics}</td>
                  <td style={{ padding: '16px 20px', fontSize: '0.875rem', textAlign: 'center', color: 'var(--color-primary)', fontWeight: 600 }}>
                    {u.pronostics_corrects}
                  </td>
                  <td style={{ padding: '16px 20px', textAlign: 'center' }}>
                    <span style={{
                      fontSize: '0.7rem',
                      fontWeight: 800,
                      padding: '4px 8px',
                      borderRadius: 6,
                      background: u.is_admin ? 'rgba(0,98,51,0.08)' : 'rgba(0,0,0,0.03)',
                      color: u.is_admin ? 'var(--color-primary)' : 'var(--color-text-secondary)',
                    }}>
                      {u.is_admin ? 'ADMIN' : 'MEMBER'}
                    </span>
                  </td>
                  <td style={{ padding: '16px 20px', textAlign: 'right' }}>
                    <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                      <button
                        onClick={() => { setEditUser(u); setEditPoints(u.points) }}
                        className="btn btn-sm btn-outline"
                        style={{ fontSize: '0.75rem', padding: '6px 10px' }}
                      >
                        🎯 Points
                      </button>
                      <button
                        onClick={() => handleToggleAdmin(u)}
                        className="btn btn-sm btn-outline"
                        style={{
                          fontSize: '0.75rem',
                          padding: '6px 10px',
                          borderColor: u.is_admin ? 'var(--color-border)' : 'var(--color-primary)',
                          color: u.is_admin ? 'var(--color-text-secondary)' : 'var(--color-primary)'
                        }}
                      >
                        {u.is_admin ? 'Revoke Admin' : 'Make Admin'}
                      </button>
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
