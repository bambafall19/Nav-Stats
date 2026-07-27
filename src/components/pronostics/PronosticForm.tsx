'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import FormSubmitButton from '@/components/shared/FormSubmitButton'
import LinkButton from '@/components/shared/LinkButton'
import type { Database } from '@/types/database.types'

type Equipe = Database['public']['Tables']['equipes']['Row']
type Joueur = Database['public']['Tables']['joueurs']['Row']
type Pronostic = Database['public']['Tables']['pronostics']['Row']

interface Props {
  matchId: string
  equipeA: Equipe
  equipeB: Equipe
  joueursA: Joueur[]
  joueursB: Joueur[]
  userId: string | null
  existingPronostic: Pronostic | null
}

export default function PronosticForm({ matchId, equipeA, equipeB, joueursA, joueursB, userId, existingPronostic }: Props) {
  const router = useRouter()
  const supabase = createClient() as any

  const [resultat, setResultat] = useState<'equipe_a' | 'nul' | 'equipe_b' | null>(
    existingPronostic?.resultat_predit as any || null
  )
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  void joueursA
  void joueursB

  if (!userId) {
    return (
      <div className="card ai-card" style={{ padding: 32, textAlign: 'center' }}>
        <div style={{ fontSize: '2.5rem', marginBottom: 12 }}>🎯</div>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: 8 }}>Faites votre pronostic</h3>
        <p style={{ color: 'var(--color-text-secondary)', marginBottom: 20, fontSize: '0.9rem' }}>
          Connectez-vous pour pronostiquer ce match et gagner des points !
        </p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <LinkButton href="/auth/login" variant="primary" size="md">🔑 Connexion</LinkButton>
          <LinkButton href="/auth/register" variant="secondary" size="md">✨ S'inscrire</LinkButton>
        </div>
      </div>
    )
  }

  if (existingPronostic && !success) {
    return (
      <div className="card" style={{ padding: 24, border: '2px solid rgba(0,166,81,0.3)' }}>
        <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
          <div style={{ fontSize: '2rem', flexShrink: 0 }}>✅</div>
          <div>
            <h3 style={{ fontWeight: 700, marginBottom: 8 }}>Votre pronostic est enregistré</h3>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 12 }}>
              <span className="badge badge-green">
                {existingPronostic.resultat_predit === 'equipe_a' ? `Victoire ${equipeA.nom}` :
                 existingPronostic.resultat_predit === 'equipe_b' ? `Victoire ${equipeB.nom}` : 'Match Nul'}
              </span>
            </div>
            {existingPronostic.points_gagnes > 0 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 14px', background: 'rgba(251,191,0,0.15)', borderRadius: 'var(--radius-md)' }}>
                <span>🏆</span>
                <span style={{ fontWeight: 700, color: '#7a5900' }}>+{existingPronostic.points_gagnes} points gagnés !</span>
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!resultat) { setError('Veuillez choisir un résultat'); return }
    setLoading(true); setError('')

    const data = {
      user_id: userId!,
      match_id: matchId,
      resultat_predit: resultat,
      score_a_predit: null,
      score_b_predit: null,
      premier_buteur_id: null,
      homme_du_match_predit_id: null,
      score_exact: false,
    }

    const { error: err } = await supabase.from('pronostics').upsert(data, { onConflict: 'user_id,match_id' })

    if (err) { setError('Erreur lors de l\'enregistrement. Réessayez.'); setLoading(false); return }

    setSuccess(true)
    setLoading(false)
    router.refresh()
  }

  const options: { value: 'equipe_a' | 'nul' | 'equipe_b'; label: string; icon: string; color: string }[] = [
    { value: 'equipe_a', label: equipeA.nom, icon: '🏆', color: equipeA.couleur_principale },
    { value: 'nul', label: 'Match Nul', icon: '🤝', color: '#64748B' },
    { value: 'equipe_b', label: equipeB.nom, icon: '🏆', color: equipeB.couleur_principale },
  ]

  return (
    <div className="card" style={{ padding: 28 }}>
      <h3 style={{ fontWeight: 800, fontSize: '1.2rem', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 8 }}>
        🎯 Votre Pronostic
      </h3>
      <p style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', marginBottom: 24 }}>
        Choisissez seulement le vainqueur ou le match nul. Victoire trouvée = 3 pts · Nul trouvé = 1 pt.
      </p>

      <form onSubmit={handleSubmit}>
        {/* Choix du résultat */}
        <div style={{ marginBottom: 24 }}>
          <label className="label">Votre prédiction *</label>
          <div className="simple-pronostic-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 10 }}>
            {options.map(opt => (
              <button
                key={opt.value}
                type="button"
                className={`pronostic-option${resultat === opt.value ? ' selected' : ''}`}
                onClick={() => setResultat(opt.value)}
                style={resultat === opt.value ? { borderColor: opt.color, background: `${opt.color}12` } : {}}
                id={`pronostic-${opt.value}`}
              >
                <span style={{ fontSize: '1.4rem' }}>{opt.icon}</span>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, textAlign: 'center', color: resultat === opt.value ? opt.color : 'var(--color-text-secondary)', lineHeight: 1.2 }}>
                  {opt.label}
                </span>
              </button>
            ))}
          </div>
        </div>

        {error && (
          <div style={{ padding: '12px 16px', background: 'rgba(232,0,45,0.08)', border: '1px solid rgba(232,0,45,0.2)', borderRadius: 'var(--radius-md)', color: 'var(--color-red)', fontSize: '0.875rem', marginBottom: 16 }}>
            ⚠️ {error}
          </div>
        )}

        {success && (
          <div style={{ padding: '12px 16px', background: 'rgba(0,166,81,0.1)', border: '1px solid rgba(0,166,81,0.3)', borderRadius: 'var(--radius-md)', color: 'var(--color-primary)', fontSize: '0.875rem', marginBottom: 16 }}>
            ✅ Pronostic enregistré avec succès !
          </div>
        )}

        <FormSubmitButton loading={loading} disabled={!resultat} icon="🎯" loadingIcon="⏳" loadingText="Enregistrement...">
          Valider ma prédiction
        </FormSubmitButton>
      </form>

      <style>{`
        @media (max-width: 640px) {
          .simple-pronostic-grid {
            grid-template-columns: 1fr !important;
          }
          .simple-pronostic-grid .pronostic-option {
            min-height: 58px;
            flex-direction: row;
            justify-content: flex-start;
            padding: 12px 14px;
          }
        }
      `}</style>
    </div>
  )
}
