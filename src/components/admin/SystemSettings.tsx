'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useToast } from '@/components/shared/Toast'

export default function SystemSettings() {
  const [settings, setSettings] = useState({
    points_correct: 10,
    points_incorrect: 0,
    points_bonus_streak: 5,
    season_name: '2024',
    season_start: '2024-01-01',
    season_end: '2024-12-31',
    max_pronostics_per_day: 10,
    min_pronostics_for_ranking: 5,
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const supabase = createClient() as any
  const { addToast } = useToast()

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const { data } = await supabase.from('system_settings').select('*').single()
        if (data) {
          setSettings(data)
        }
      } catch (error) {
        console.error('Error fetching settings:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchSettings()
  }, [])

  const handleSave = async () => {
    setSaving(true)
    try {
      await supabase.from('system_settings').upsert(settings)
      addToast('Paramètres sauvegardés', 'success')
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
        ⚙️ Paramètres Système
      </h1>

      {/* Points */}
      <div style={{
        background: 'var(--color-surface-card)',
        border: '1px solid var(--color-border)',
        borderRadius: 'clamp(12px, 3vw, 16px)',
        padding: 'clamp(16px, 3vw, 20px)',
        marginBottom: 'clamp(16px, 3vw, 20px)',
      }}>
        <h2 style={{ fontFamily: 'var(--font-outfit)', fontWeight: 800, fontSize: '1rem', marginBottom: 16, marginTop: 0 }}>
          🏆 Points
        </h2>

        <div style={{ display: 'grid', gap: 12 }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: 6, color: 'var(--color-text-muted)' }}>
              Points pour un pronostic correct
            </label>
            <input
              type="number"
              value={settings.points_correct}
              onChange={e => setSettings({ ...settings, points_correct: parseInt(e.target.value) })}
              style={{
                width: '100%',
                padding: '10px 12px',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-md)',
                fontSize: '0.9rem',
                boxSizing: 'border-box',
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: 6, color: 'var(--color-text-muted)' }}>
              Points pour un pronostic incorrect
            </label>
            <input
              type="number"
              value={settings.points_incorrect}
              onChange={e => setSettings({ ...settings, points_incorrect: parseInt(e.target.value) })}
              style={{
                width: '100%',
                padding: '10px 12px',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-md)',
                fontSize: '0.9rem',
                boxSizing: 'border-box',
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: 6, color: 'var(--color-text-muted)' }}>
              Bonus points par jour de streak
            </label>
            <input
              type="number"
              value={settings.points_bonus_streak}
              onChange={e => setSettings({ ...settings, points_bonus_streak: parseInt(e.target.value) })}
              style={{
                width: '100%',
                padding: '10px 12px',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-md)',
                fontSize: '0.9rem',
                boxSizing: 'border-box',
              }}
            />
          </div>
        </div>
      </div>

      {/* Saison */}
      <div style={{
        background: 'var(--color-surface-card)',
        border: '1px solid var(--color-border)',
        borderRadius: 'clamp(12px, 3vw, 16px)',
        padding: 'clamp(16px, 3vw, 20px)',
        marginBottom: 'clamp(16px, 3vw, 20px)',
      }}>
        <h2 style={{ fontFamily: 'var(--font-outfit)', fontWeight: 800, fontSize: '1rem', marginBottom: 16, marginTop: 0 }}>
          📅 Saison
        </h2>

        <div style={{ display: 'grid', gap: 12 }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: 6, color: 'var(--color-text-muted)' }}>
              Nom de la saison
            </label>
            <input
              type="text"
              value={settings.season_name}
              onChange={e => setSettings({ ...settings, season_name: e.target.value })}
              style={{
                width: '100%',
                padding: '10px 12px',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-md)',
                fontSize: '0.9rem',
                boxSizing: 'border-box',
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: 6, color: 'var(--color-text-muted)' }}>
              Date de début
            </label>
            <input
              type="date"
              value={settings.season_start}
              onChange={e => setSettings({ ...settings, season_start: e.target.value })}
              style={{
                width: '100%',
                padding: '10px 12px',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-md)',
                fontSize: '0.9rem',
                boxSizing: 'border-box',
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: 6, color: 'var(--color-text-muted)' }}>
              Date de fin
            </label>
            <input
              type="date"
              value={settings.season_end}
              onChange={e => setSettings({ ...settings, season_end: e.target.value })}
              style={{
                width: '100%',
                padding: '10px 12px',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-md)',
                fontSize: '0.9rem',
                boxSizing: 'border-box',
              }}
            />
          </div>
        </div>
      </div>

      {/* Limites */}
      <div style={{
        background: 'var(--color-surface-card)',
        border: '1px solid var(--color-border)',
        borderRadius: 'clamp(12px, 3vw, 16px)',
        padding: 'clamp(16px, 3vw, 20px)',
        marginBottom: 'clamp(24px, 5vw, 32px)',
      }}>
        <h2 style={{ fontFamily: 'var(--font-outfit)', fontWeight: 800, fontSize: '1rem', marginBottom: 16, marginTop: 0 }}>
          🔒 Limites
        </h2>

        <div style={{ display: 'grid', gap: 12 }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: 6, color: 'var(--color-text-muted)' }}>
              Max pronostics par jour
            </label>
            <input
              type="number"
              value={settings.max_pronostics_per_day}
              onChange={e => setSettings({ ...settings, max_pronostics_per_day: parseInt(e.target.value) })}
              style={{
                width: '100%',
                padding: '10px 12px',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-md)',
                fontSize: '0.9rem',
                boxSizing: 'border-box',
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: 6, color: 'var(--color-text-muted)' }}>
              Min pronostics pour le classement
            </label>
            <input
              type="number"
              value={settings.min_pronostics_for_ranking}
              onChange={e => setSettings({ ...settings, min_pronostics_for_ranking: parseInt(e.target.value) })}
              style={{
                width: '100%',
                padding: '10px 12px',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-md)',
                fontSize: '0.9rem',
                boxSizing: 'border-box',
              }}
            />
          </div>
        </div>
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
