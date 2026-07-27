'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useToast } from '@/components/shared/Toast'

export function AdvancedPredictions({ matchId, userId }: { matchId: string; userId: string }) {
  const [match, setMatch] = useState<any>(null)
  const [predictions, setPredictions] = useState({
    score1: 0,
    score2: 0,
    goalscorers1: '',
    goalscorers2: '',
    cards: '',
    prediction_type: 'exact_score', // exact_score, goalscorers, cards
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const supabase = createClient() as any
  const { addToast } = useToast()

  useEffect(() => {
    fetchMatch()
  }, [matchId])

  const fetchMatch = async () => {
    try {
      const { data } = await supabase
        .from('matchs')
        .select('*')
        .eq('id', matchId)
        .single()

      setMatch(data)
    } catch (error) {
      addToast('Erreur', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleSavePrediction = async () => {
    setSaving(true)
    try {
      await supabase.from('predictions_advanced').upsert({
        match_id: matchId,
        user_id: userId,
        ...predictions,
      })
      addToast('Prédiction sauvegardée', 'success')
    } catch (error) {
      addToast('Erreur', 'error')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <div style={{ padding: 20, textAlign: 'center' }}>Chargement...</div>
  }

  return (
    <div style={{
      background: 'var(--color-surface-card)',
      border: '1px solid var(--color-border)',
      borderRadius: 'var(--radius-lg)',
      padding: 'clamp(16px, 3vw, 20px)',
    }}>
      <h3 style={{ fontFamily: 'var(--font-outfit)', fontWeight: 800, fontSize: '1rem', marginBottom: 16, marginTop: 0 }}>
        🎯 Prédictions Avancées
      </h3>

      {/* Match Info */}
      <div style={{
        background: 'rgba(0,98,51,0.05)',
        borderRadius: 'var(--radius-md)',
        padding: 12,
        marginBottom: 16,
        textAlign: 'center',
      }}>
        <div style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: 4 }}>
          {match?.equipe1} vs {match?.equipe2}
        </div>
        <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
          {match?.date} à {match?.heure}
        </div>
      </div>

      {/* Prediction Type Selector */}
      <div style={{ marginBottom: 16 }}>
        <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: 8, color: 'var(--color-text-muted)' }}>
          Type de prédiction
        </label>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
          {[
            { value: 'exact_score', label: '📊 Score Exact', icon: '📊' },
            { value: 'goalscorers', label: '⚽ Buteurs', icon: '⚽' },
            { value: 'cards', label: '🟨 Cartons', icon: '🟨' },
          ].map(type => (
            <button
              key={type.value}
              onClick={() => setPredictions({ ...predictions, prediction_type: type.value })}
              style={{
                padding: '10px 12px',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--color-border)',
                background: predictions.prediction_type === type.value ? 'var(--color-primary)' : 'transparent',
                color: predictions.prediction_type === type.value ? 'white' : 'var(--color-text-primary)',
                cursor: 'pointer',
                fontWeight: 600,
                fontSize: '0.8rem',
                transition: 'all 0.2s',
              }}
            >
              {type.icon} {type.label}
            </button>
          ))}
        </div>
      </div>

      {/* Score Exact */}
      {predictions.prediction_type === 'exact_score' && (
        <div style={{ marginBottom: 16 }}>
          <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: 8, color: 'var(--color-text-muted)' }}>
            Score exact
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: 12, alignItems: 'center' }}>
            <div>
              <label style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', display: 'block', marginBottom: 4 }}>
                {match?.equipe1}
              </label>
              <input
                type="number"
                min="0"
                max="10"
                value={predictions.score1}
                onChange={e => setPredictions({ ...predictions, score1: parseInt(e.target.value) })}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '1rem',
                  fontWeight: 700,
                  textAlign: 'center',
                }}
              />
            </div>
            <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--color-primary)' }}>
              -
            </div>
            <div>
              <label style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', display: 'block', marginBottom: 4 }}>
                {match?.equipe2}
              </label>
              <input
                type="number"
                min="0"
                max="10"
                value={predictions.score2}
                onChange={e => setPredictions({ ...predictions, score2: parseInt(e.target.value) })}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '1rem',
                  fontWeight: 700,
                  textAlign: 'center',
                }}
              />
            </div>
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: 8, textAlign: 'center' }}>
            💰 +50 points si correct
          </div>
        </div>
      )}

      {/* Goalscorers */}
      {predictions.prediction_type === 'goalscorers' && (
        <div style={{ marginBottom: 16 }}>
          <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: 8, color: 'var(--color-text-muted)' }}>
            Buteurs (noms séparés par des virgules)
          </label>
          <textarea
            value={predictions.goalscorers1}
            onChange={e => setPredictions({ ...predictions, goalscorers1: e.target.value })}
            placeholder={`Ex: Joueur1, Joueur2`}
            rows={3}
            style={{
              width: '100%',
              padding: '10px 12px',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-md)',
              fontSize: '0.9rem',
              fontFamily: 'inherit',
              marginBottom: 12,
              boxSizing: 'border-box',
            }}
          />
          <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
            💰 +30 points par buteur correct
          </div>
        </div>
      )}

      {/* Cards */}
      {predictions.prediction_type === 'cards' && (
        <div style={{ marginBottom: 16 }}>
          <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: 8, color: 'var(--color-text-muted)' }}>
            Cartons (format: Joueur-Couleur)
          </label>
          <textarea
            value={predictions.cards}
            onChange={e => setPredictions({ ...predictions, cards: e.target.value })}
            placeholder={`Ex: Joueur1-Jaune, Joueur2-Rouge`}
            rows={3}
            style={{
              width: '100%',
              padding: '10px 12px',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-md)',
              fontSize: '0.9rem',
              fontFamily: 'inherit',
              marginBottom: 12,
              boxSizing: 'border-box',
            }}
          />
          <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
            💰 +20 points par carton correct
          </div>
        </div>
      )}

      {/* Save Button */}
      <button
        onClick={handleSavePrediction}
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
        {saving ? '💾 Sauvegarde...' : '✓ Sauvegarder la prédiction'}
      </button>
    </div>
  )
}
