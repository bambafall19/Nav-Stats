'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Database } from '@/types/database.types'

type Notification = Database['public']['Tables']['notifications']['Row']

export default function AdminNotificationsPage() {
  const supabase = createClient() as any
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [userId, setUserId] = useState<string | null>(null)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  
  // Form state
  const [showForm, setShowForm] = useState(false)
  const [notifTitle, setNotifTitle] = useState('')
  const [notifMessage, setNotifMessage] = useState('')
  const [notifType, setNotifType] = useState<'match' | 'annonce' | 'resultat' | 'classement' | 'badge'>('annonce')
  const [notifLien, setNotifLien] = useState('')
  const [sending, setSending] = useState(false)

  useEffect(() => {
    fetchNotifications()
    const interval = setInterval(fetchNotifications, 30000) // Refresh every 30s
    return () => clearInterval(interval)
  }, [])

  const fetchNotifications = async () => {
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (user) setUserId(user.id)

    const { data } = await supabase
      .from('notifications')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50)

    setNotifications((data || []) as Notification[])
    setLoading(false)
  }

  const sendNotification = async (e: React.FormEvent) => {
    e.preventDefault()
    setSending(true)
    setMessage(null)

    try {
      // In-app notifications + web push (same API)
      const res = await fetch('/api/notifications/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          titre: notifTitle,
          message: notifMessage,
          type: notifType,
          lien: notifLien || null,
        }),
      })

      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.details || data.error || 'Échec envoi notification')
      }

      const pushPart =
        data.push?.skipped
          ? ' (push non configuré — ajoutez les clés VAPID)'
          : data.push
            ? ` · ${data.push.sent}/${data.push.total} push envoyés`
            : ''

      setMessage({
        type: 'success',
        text: `Notification envoyée à ${data.count} utilisateurs${pushPart}`,
      })

      setNotifTitle('')
      setNotifMessage('')
      setNotifType('annonce')
      setNotifLien('')
      setShowForm(false)
      fetchNotifications()
    } catch (e) {
      setMessage({
        type: 'error',
        text: e instanceof Error ? e.message : 'Échec envoi notification',
      })
    } finally {
      setSending(false)
    }
  }

  const deleteNotification = async (id: string) => {
    if (!confirm('Supprimer cette notification ?')) return
    
    const { error } = await supabase
      .from('notifications')
      .delete()
      .eq('id', id)

    if (error) {
      setMessage({ type: 'error', text: error.message })
    } else {
      setMessage({ type: 'success', text: 'Notification supprimée' })
      fetchNotifications()
    }
  }

  const typeEmoji: Record<string, string> = {
    match: '⚽',
    resultat: '🏆',
    classement: '📊',
    badge: '🏅',
    annonce: '📢'
  }

  const typeColor: Record<string, string> = {
    match: '#006233',
    resultat: '#D97706',
    classement: '#1D4ED8',
    badge: '#7C3AED',
    annonce: '#E8002D'
  }

  return (
    <div className="admin-notifications">
      {/* Header */}
      <div className="admin-header" style={{
        background: 'linear-gradient(135deg, #006233 0%, #00A651 100%)',
        borderRadius: 20,
        padding: 'clamp(24px, 4vw, 40px)',
        marginBottom: 32,
        color: 'white',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{ position: 'absolute', top: -20, right: -20, fontSize: 100, opacity: 0.1 }}>🔔</div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <h1 style={{ fontFamily: 'var(--font-outfit)', fontSize: 'clamp(1.8rem, 4vw, 2.5rem)', fontWeight: 900, marginBottom: 8 }}>
              🔔 Gestion des Notifications
            </h1>
            <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: '0.95rem', maxWidth: 600 }}>
              Envoyez des notifications push à tous les utilisateurs de la plateforme
            </p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="btn btn-lg"
            style={{
              background: 'white',
              color: '#006233',
              fontWeight: 800,
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
            }}
          >
            ➕ Nouvelle Notification
          </button>
        </div>
      </div>

      {message && (
        <div className="admin-message" style={{
          padding: '16px 20px',
          background: message.type === 'success' ? 'rgba(0,166,81,0.08)' : 'rgba(232,0,45,0.08)',
          border: `1px solid ${message.type === 'success' ? 'rgba(0,166,81,0.2)' : 'rgba(232,0,45,0.2)'}`,
          borderRadius: 12,
          color: message.type === 'success' ? 'var(--color-primary)' : 'var(--color-red)',
          marginBottom: 24,
          fontWeight: 600,
          fontSize: '0.875rem',
          display: 'flex',
          alignItems: 'center',
          gap: 10
        }}>
          <span style={{ fontSize: '1.2rem' }}>{message.type === 'success' ? '✅' : '❌'}</span>
          {message.text}
        </div>
      )}

      {/* Form Modal */}
      {showForm && (
        <div className="admin-form-overlay" style={{
          position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.5)',
          backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center',
          justifyContent: 'center', zIndex: 1000, padding: 20
        }}>
          <div className="admin-form-card" style={{
            width: '100%', maxWidth: 600, padding: 32, borderRadius: 24,
            background: 'white', maxHeight: '90vh', overflowY: 'auto',
            boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <h2 style={{ fontFamily: 'var(--font-outfit)', fontSize: '1.5rem', fontWeight: 800 }}>
                📢 Nouvelle Notification
              </h2>
              <button 
                onClick={() => setShowForm(false)}
                style={{
                  background: 'none', border: 'none', fontSize: '1.5rem',
                  cursor: 'pointer', color: 'var(--color-text-muted)'
                }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={sendNotification} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-text-secondary)', display: 'block', marginBottom: 8 }}>
                  Titre *
                </label>
                <input 
                  type="text" 
                  required
                  value={notifTitle}
                  onChange={e => setNotifTitle(e.target.value)}
                  placeholder="Ex: ⚽ Match aujourd'hui à 15h"
                  style={{
                    width: '100%', padding: '14px 16px', borderRadius: 12,
                    border: '2px solid var(--color-border)', fontSize: '0.9rem',
                    fontFamily: 'var(--font-outfit)', outline: 'none'
                  }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-text-secondary)', display: 'block', marginBottom: 8 }}>
                  Message *
                </label>
                <textarea 
                  required
                  rows={3}
                  value={notifMessage}
                  onChange={e => setNotifMessage(e.target.value)}
                  placeholder="Ex: ASC Book Joom vs ASC Entente Cossan Santos"
                  style={{
                    width: '100%', padding: '14px 16px', borderRadius: 12,
                    border: '2px solid var(--color-border)', fontSize: '0.9rem',
                    fontFamily: 'var(--font-outfit)', outline: 'none', resize: 'vertical'
                  }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div>
                  <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-text-secondary)', display: 'block', marginBottom: 8 }}>
                    Type *
                  </label>
                  <select 
                    value={notifType}
                    onChange={e => setNotifType(e.target.value as any)}
                    style={{
                      width: '100%', padding: '14px 16px', borderRadius: 12,
                      border: '2px solid var(--color-border)', fontSize: '0.9rem',
                      fontFamily: 'var(--font-outfit)', background: 'white', outline: 'none'
                    }}
                  >
                    <option value="annonce">📢 Annonce</option>
                    <option value="match">⚽ Match</option>
                    <option value="resultat">🏆 Résultat</option>
                    <option value="classement">📊 Classement</option>
                    <option value="badge">🏅 Badge</option>
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-text-secondary)', display: 'block', marginBottom: 8 }}>
                    Lien (optionnel)
                  </label>
                  <input 
                    type="text"
                    value={notifLien}
                    onChange={e => setNotifLien(e.target.value)}
                    placeholder="/matchs/123"
                    style={{
                      width: '100%', padding: '14px 16px', borderRadius: 12,
                      border: '2px solid var(--color-border)', fontSize: '0.9rem',
                      fontFamily: 'var(--font-outfit)', outline: 'none'
                    }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
                <button 
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="btn btn-outline"
                  style={{ flex: 1 }}
                >
                  Annuler
                </button>
                <button 
                  type="submit" 
                  disabled={sending}
                  className="btn btn-primary"
                  style={{ flex: 2 }}
                >
                  {sending ? '⏳ Envoi en cours...' : '📤 Envoyer à tous'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="admin-stats" style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: 16,
        marginBottom: 32
      }}>
        <div className="admin-stat-card" style={{
          background: 'white',
          padding: 20,
          borderRadius: 16,
          border: '1px solid var(--color-border)',
          boxShadow: 'var(--shadow-sm)'
        }}>
          <div style={{ fontSize: '2rem', marginBottom: 8 }}>📊</div>
          <div style={{ fontSize: '1.8rem', fontWeight: 900, color: 'var(--color-primary)', fontFamily: 'var(--font-outfit)' }}>
            {notifications.length}
          </div>
          <div style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>
            Total notifications
          </div>
        </div>

        <div className="admin-stat-card" style={{
          background: 'white',
          padding: 20,
          borderRadius: 16,
          border: '1px solid var(--color-border)',
          boxShadow: 'var(--shadow-sm)'
        }}>
          <div style={{ fontSize: '2rem', marginBottom: 8 }}>👥</div>
          <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#1D4ED8', fontFamily: 'var(--font-outfit)' }}>
            {new Set(notifications.map(n => n.user_id)).size}
          </div>
          <div style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>
            Utilisateurs ciblés
          </div>
        </div>

        <div className="admin-stat-card" style={{
          background: 'white',
          padding: 20,
          borderRadius: 16,
          border: '1px solid var(--color-border)',
          boxShadow: 'var(--shadow-sm)'
        }}>
          <div style={{ fontSize: '2rem', marginBottom: 8 }}>⚡</div>
          <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#D97706', fontFamily: 'var(--font-outfit)' }}>
            {notifications.filter(n => n.type === 'match').length}
          </div>
          <div style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>
            Notifications match
          </div>
        </div>
      </div>

      {/* Notifications List */}
      <div className="admin-notifications-list">
        <div style={{
          background: 'white',
          borderRadius: 16,
          border: '1px solid var(--color-border)',
          overflow: 'hidden',
          boxShadow: 'var(--shadow-sm)'
        }}>
          <div style={{
            padding: '20px 24px',
            borderBottom: '1px solid var(--color-border)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <h2 style={{ fontFamily: 'var(--font-outfit)', fontSize: '1.1rem', fontWeight: 800 }}>
              📋 Historique des notifications
            </h2>
            <button 
              onClick={fetchNotifications}
              className="btn btn-sm btn-outline"
            >
              🔄 Actualiser
            </button>
          </div>

          {loading ? (
            <div style={{ padding: 60, textAlign: 'center', color: 'var(--color-text-muted)' }}>
              <div style={{ fontSize: '2rem', marginBottom: 12 }}>⏳</div>
              <p>Chargement...</p>
            </div>
          ) : notifications.length === 0 ? (
            <div style={{ padding: 60, textAlign: 'center', color: 'var(--color-text-muted)' }}>
              <div style={{ fontSize: '3rem', marginBottom: 12 }}>🔔</div>
              <p style={{ fontSize: '1rem', marginBottom: 16 }}>Aucune notification envoyée</p>
              <button 
                onClick={() => setShowForm(true)}
                className="btn btn-primary"
              >
                ➕ Créer la première notification
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {notifications.map((notif, index) => (
                <div 
                  key={notif.id}
                  style={{
                    padding: '16px 24px',
                    borderBottom: index < notifications.length - 1 ? '1px solid var(--color-border)' : 'none',
                    display: 'flex',
                    gap: 16,
                    alignItems: 'flex-start',
                    transition: 'background 0.2s'
                  }}
                  onMouseOver={e => (e.currentTarget.style.background = 'rgba(0,98,51,0.02)')}
                  onMouseOut={e => (e.currentTarget.style.background = 'transparent')}
                >
                  <div style={{
                    width: 44,
                    height: 44,
                    borderRadius: 12,
                    background: `${typeColor[notif.type] || '#006233'}20`,
                    color: typeColor[notif.type] || '#006233',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.3rem',
                    flexShrink: 0
                  }}>
                    {typeEmoji[notif.type] || '🔔'}
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 }}>
                      <h3 style={{ 
                        fontSize: '0.95rem', 
                        fontWeight: 700, 
                        color: 'var(--color-text-primary)',
                        margin: 0
                      }}>
                        {notif.titre}
                      </h3>
                      <button
                        onClick={() => deleteNotification(notif.id)}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: 'var(--color-red)',
                          cursor: 'pointer',
                          fontSize: '0.85rem',
                          padding: '4px 8px',
                          borderRadius: 6,
                          flexShrink: 0
                        }}
                        title="Supprimer"
                      >
                        🗑️
                      </button>
                    </div>
                    
                    <p style={{ 
                      fontSize: '0.85rem', 
                      color: 'var(--color-text-secondary)',
                      marginBottom: 6,
                      lineHeight: 1.5
                    }}>
                      {notif.message}
                    </p>

                    <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
                      <span style={{
                        fontSize: '0.7rem',
                        fontWeight: 700,
                        padding: '4px 10px',
                        borderRadius: 6,
                        background: 'rgba(0,98,51,0.08)',
                        color: 'var(--color-primary)',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em'
                      }}>
                        {notif.type}
                      </span>
                      <span style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)' }}>
                        📅 {new Date(notif.created_at).toLocaleDateString('fr-FR', { 
                          day: 'numeric', 
                          month: 'short', 
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                      {notif.lien && (
                        <a 
                          href={notif.lien}
                          style={{ 
                            fontSize: '0.72rem', 
                            color: 'var(--color-primary)',
                            textDecoration: 'none',
                            fontWeight: 600
                          }}
                        >
                          🔗 Voir le lien
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <style>{`
        .admin-notifications {
          animation: fadeInUp 0.4s ease;
        }

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .admin-form-card {
          animation: slideIn 0.3s ease;
        }

        @keyframes slideIn {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
      `}</style>
    </div>
  )
}