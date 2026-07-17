'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useToast } from '@/components/shared/Toast'

export function UserPreferences({ userId }: { userId: string }) {
  const [preferences, setPreferences] = useState({
    notifications_matchs: true,
    notifications_resultats: true,
    notifications_classements: true,
    notifications_defis: true,
    email_notifications: true,
    push_notifications: true,
    language: 'fr',
    privacy: 'public',
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const supabase = createClient() as any
  const { addToast } = useToast()

  useEffect(() => {
    const fetchPreferences = async () => {
      try {
        const { data } = await supabase.from('user_preferences').select('*').eq('user_id', userId).single()
        if (data) {
          setPreferences(data)
        }
      } catch (error) {
        console.error('Error fetching preferences:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchPreferences()
  }, [userId])

  const handleSave = async () => {
    setSaving(true)
    try {
      await supabase.from('user_preferences').upsert({
        user_id: userId,
        ...preferences,
      })
      addToast('Préférences sauvegardées', 'success')
    } catch (error) {
      addToast('Erreur lors de la sauvegarde', 'error')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <div style={{ padding: 20, textAlign: 'center' }}>Chargement...</div>
  }

  return (
    <div style={{ padding: 'clamp(16px, 3vw, 24px)', maxWidth: 600 }}>
      <h1 style={{ fontFamily: 'var(--font-outfit)', fontWeight: 900, fontSize: 'clamp(1.3rem, 4vw, 1.8rem)', marginBottom: 24 }}>
        ⚙️ Préférences
      </h1>

      {/* Notifications */}
      <div style={{
        background: 'var(--color-surface-card)',
        border: '1px solid var(--color-border)',
        borderRadius: 'clamp(12px, 3vw, 16px)',
        padding: 'clamp(16px, 3vw, 20px)',
        marginBottom: 'clamp(16px, 3vw, 20px)',
      }}>
        <h2 style={{ fontFamily: 'var(--font-outfit)', fontWeight: 800, fontSize: '1rem', marginBottom: 16, marginTop: 0 }}>
          🔔 Notifications
        </h2>

        {[
          { key: 'notifications_matchs', label: 'Alertes matchs', icon: '⚽' },
          { key: 'notifications_resultats', label: 'Résultats', icon: '📊' },
          { key: 'notifications_classements', label: 'Classements', icon: '🏆' },
          { key: 'notifications_defis', label: 'Défis', icon: '🎯' },
        ].map(item => (
          <label key={item.key} style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            padding: '12px 0',
            borderBottom: '1px solid var(--color-border)',
            cursor: 'pointer',
          }}>
            <input
              type="checkbox"
              checked={(preferences as any)[item.key]}
              onChange={e => setPreferences({ ...preferences, [item.key]: e.target.checked })}
              style={{ width: 18, height: 18, cursor: 'pointer' }}
            />
            <span style={{ fontSize: '1rem' }}>{item.icon}</span>
            <span style={{ flex: 1, fontSize: '0.95rem' }}>{item.label}</span>
          </label>
        ))}
      </div>

      {/* Canaux */}
      <div style={{
        background: 'var(--color-surface-card)',
        border: '1px solid var(--color-border)',
        borderRadius: 'clamp(12px, 3vw, 16px)',
        padding: 'clamp(16px, 3vw, 20px)',
        marginBottom: 'clamp(16px, 3vw, 20px)',
      }}>
        <h2 style={{ fontFamily: 'var(--font-outfit)', fontWeight: 800, fontSize: '1rem', marginBottom: 16, marginTop: 0 }}>
          📬 Canaux
        </h2>

        {[
          { key: 'email_notifications', label: 'Notifications par email', icon: '📧' },
          { key: 'push_notifications', label: 'Notifications push', icon: '📲' },
        ].map(item => (
          <label key={item.key} style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            padding: '12px 0',
            borderBottom: item.key === 'push_notifications' ? 'none' : '1px solid var(--color-border)',
            cursor: 'pointer',
          }}>
            <input
              type="checkbox"
              checked={(preferences as any)[item.key]}
              onChange={e => setPreferences({ ...preferences, [item.key]: e.target.checked })}
              style={{ width: 18, height: 18, cursor: 'pointer' }}
            />
            <span style={{ fontSize: '1rem' }}>{item.icon}</span>
            <span style={{ flex: 1, fontSize: '0.95rem' }}>{item.label}</span>
          </label>
        ))}
      </div>

      {/* Langue */}
      <div style={{
        background: 'var(--color-surface-card)',
        border: '1px solid var(--color-border)',
        borderRadius: 'clamp(12px, 3vw, 16px)',
        padding: 'clamp(16px, 3vw, 20px)',
        marginBottom: 'clamp(16px, 3vw, 20px)',
      }}>
        <h2 style={{ fontFamily: 'var(--font-outfit)', fontWeight: 800, fontSize: '1rem', marginBottom: 16, marginTop: 0 }}>
          🌐 Langue
        </h2>

        <select
          value={preferences.language}
          onChange={e => setPreferences({ ...preferences, language: e.target.value })}
          style={{
            width: '100%',
            padding: '10px 12px',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-md)',
            fontSize: '0.95rem',
            background: 'var(--color-surface)',
            color: 'var(--color-text-primary)',
          }}
        >
          <option value="fr">Français</option>
          <option value="en">English</option>
          <option value="es">Español</option>
        </select>
      </div>

      {/* Confidentialité */}
      <div style={{
        background: 'var(--color-surface-card)',
        border: '1px solid var(--color-border)',
        borderRadius: 'clamp(12px, 3vw, 16px)',
        padding: 'clamp(16px, 3vw, 20px)',
        marginBottom: 'clamp(24px, 5vw, 32px)',
      }}>
        <h2 style={{ fontFamily: 'var(--font-outfit)', fontWeight: 800, fontSize: '1rem', marginBottom: 16, marginTop: 0 }}>
          🔐 Confidentialité
        </h2>

        <select
          value={preferences.privacy}
          onChange={e => setPreferences({ ...preferences, privacy: e.target.value })}
          style={{
            width: '100%',
            padding: '10px 12px',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-md)',
            fontSize: '0.95rem',
            background: 'var(--color-surface)',
            color: 'var(--color-text-primary)',
          }}
        >
          <option value="public">Public - Visible par tous</option>
          <option value="friends">Amis - Visible par les amis</option>
          <option value="private">Privé - Visible par moi seul</option>
        </select>
      </div>

      {/* Save Button */}
      <button
        onClick={handleSave}
        disabled={saving}
        style={{
          width: '100%',
          padding: '12px 16px',
          background: 'var(--color-primary)',
          color: 'white',
          border: 'none',
          borderRadius: 'var(--radius-md)',
          cursor: saving ? 'not-allowed' : 'pointer',
          fontWeight: 600,
          fontSize: '0.95rem',
          opacity: saving ? 0.7 : 1,
        }}
      >
        {saving ? '💾 Sauvegarde...' : '✓ Sauvegarder'}
      </button>
    </div>
  )
}
