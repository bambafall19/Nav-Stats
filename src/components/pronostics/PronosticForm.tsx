'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import FormSubmitButton from '@/components/shared/FormSubmitButton'
import LinkButton from '@/components/shared/LinkButton'
import type { Database } from '@/types/database.types'
import { addToOfflineQueue, getPendingCount, syncOfflineQueue } from '@/lib/offlineQueue'
import ScoreboardPanel from '@/components/shared/ScoreboardPanel'
import { Target, LogIn, UserPlus, CheckCircle2, Trophy, WifiOff, RefreshCw, AlertTriangle, Goal, Star, Lock } from 'lucide-react'

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

function TeamTile({ equipe, size = 40 }: { equipe: Equipe; size?: number }) {
  const inner = equipe.logo_url ? (
    <img src={equipe.logo_url} alt={equipe.nom}
      style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: size * 0.33 }}
    />
  ) : (
    <div style={{
      width: '100%', height: '100%',
      background: `linear-gradient(135deg, ${equipe.couleur_principale || '#0dca6b'}, ${equipe.couleur_secondaire || '#ffc94d'})`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: size * 0.34, fontWeight: 800, color: 'white',
      fontFamily: 'var(--font-plus-jakarta)', borderRadius: size * 0.33,
    }}>
      {equipe.sigle || equipe.nom.charAt(0)}
    </div>
  )
  return (
    <div style={{
      width: size, height: size, borderRadius: size * 0.33,
      overflow: 'hidden', border: '1px solid var(--color-border-subtle)',
      background: 'var(--color-surface-card)', flexShrink: 0,
      boxShadow: '0 3px 10px rgba(0,0,0,0.2)',
    }}>
      {inner}
    </div>
  )
}

function Label({ children, icon }: { children: React.ReactNode; icon?: React.ReactNode }) {
  return (
    <label className="label" style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.72rem', letterSpacing: '0.04em' }}>
      {icon} {children}
    </label>
  )
}

export default function PronosticForm({ matchId, equipeA, equipeB, joueursA, joueursB, userId, existingPronostic }: Props) {
  const router = useRouter()
  const supabase = createClient() as any // eslint-disable-line @typescript-eslint/no-explicit-any

  const [resultat, setResultat] = useState<'equipe_a' | 'nul' | 'equipe_b' | null>(
    (existingPronostic?.resultat_predit as 'equipe_a' | 'nul' | 'equipe_b' | null) || null
  )
  const [scoreA, setScoreA] = useState<number | null>(existingPronostic?.score_a_predit ?? null)
  const [scoreB, setScoreB] = useState<number | null>(existingPronostic?.score_b_predit ?? null)
  const [premierButeur, setPremierButeur] = useState<string | null>(existingPronostic?.premier_buteur_id ?? null)
  const [hommeDuMatch, setHommeDuMatch] = useState<string | null>(existingPronostic?.homme_du_match_predit_id ?? null)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')
  const [isOnline, setIsOnline] = useState(true)
  const [pendingCount, setPendingCount] = useState(() => getPendingCount())

  useEffect(() => {
    const updateStatus = () => setIsOnline(navigator.onLine)
    updateStatus()
    window.addEventListener('online', updateStatus)
    window.addEventListener('offline', updateStatus)
    return () => {
      window.removeEventListener('online', updateStatus)
      window.removeEventListener('offline', updateStatus)
    }
  }, [])

  useEffect(() => {
    if (isOnline) {
      syncOfflineQueue(supabase).then(() => setPendingCount(getPendingCount()))
    }
  }, [isOnline, supabase])

  void joueursA
  void joueursB

  if (!userId) {
    return (
      <ScoreboardPanel title="Votre Pronostic" icon={<Target size={14} color="var(--color-primary)" />} bodyStyle={{ padding: 28, textAlign: 'center' }}>
        <div style={{
          width: 56, height: 56, borderRadius: 18,
          background: 'var(--gradient-green-soft)',
          border: '1px solid rgba(42,255,160,0.25)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 16px',
          boxShadow: '0 8px 24px rgba(42,255,160,0.12)',
        }}>
          <Target size={26} color="var(--color-primary)" />
        </div>
        <h3 style={{ fontSize: '1.05rem', fontWeight: 800, marginBottom: 8, fontFamily: 'var(--font-plus-jakarta)' }}>
          Faites votre pronostic
        </h3>
        <p style={{ color: 'var(--color-text-secondary)', marginBottom: 20, fontSize: '0.85rem' }}>
          Connectez-vous pour pronostiquer ce match et gagner des points !
        </p>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
          <LinkButton href="/auth/login" variant="primary" size="md">
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}><LogIn size={14} /> Connexion</span>
          </LinkButton>
          <LinkButton href="/auth/register" variant="secondary" size="md">
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}><UserPlus size={14} /> S&apos;inscrire</span>
          </LinkButton>
        </div>
      </ScoreboardPanel>
    )
  }

  if (existingPronostic && !success) {
    const isA = existingPronostic.resultat_predit === 'equipe_a'
    const isB = existingPronostic.resultat_predit === 'equipe_b'
    return (
      <ScoreboardPanel title="Votre Pronostic" icon={<CheckCircle2 size={14} color="var(--color-primary)" />}>
        <div style={{
          padding: '16px',
          borderRadius: 'var(--radius-md)',
          background: 'var(--gradient-green-soft)',
          border: '1px solid rgba(42,255,160,0.2)',
          display: 'flex', alignItems: 'center', gap: 14,
        }}>
          <div style={{
            width: 44, height: 44, borderRadius: 14, flexShrink: 0,
            background: 'rgba(42,255,160,0.14)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <CheckCircle2 size={22} color="var(--color-primary)" />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <h3 style={{ fontWeight: 800, marginBottom: 8, fontSize: '0.95rem', fontFamily: 'var(--font-plus-jakarta)' }}>
              Votre pronostic est enregistré
            </h3>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              <span className="badge badge-green">
                {isA ? `Victoire ${equipeA.nom}` : isB ? `Victoire ${equipeB.nom}` : 'Match Nul'}
              </span>
              {existingPronostic.score_exact && existingPronostic.score_a_predit !== null && existingPronostic.score_b_predit !== null && (
                <span className="badge badge-blue">
                  Score: {existingPronostic.score_a_predit} - {existingPronostic.score_b_predit}
                </span>
              )}
              {existingPronostic.premier_buteur_id && (
                <span className="badge badge-gold" style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                  <Goal size={10} /> Premier buteur
                </span>
              )}
              {existingPronostic.homme_du_match_predit_id && (
                <span className="badge badge-green" style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                  <Star size={10} /> Homme du match
                </span>
              )}
            </div>
            {existingPronostic.points_gagnes > 0 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 14px', background: 'rgba(255,201,77,0.12)', border: '1px solid rgba(255,201,77,0.3)', borderRadius: 10, marginTop: 10 }}>
                <Trophy size={14} color="var(--color-accent)" />
                <span style={{ fontWeight: 700, color: 'var(--color-accent)', fontSize: '0.8rem' }}>+{existingPronostic.points_gagnes} points gagnés !</span>
              </div>
            )}
          </div>
        </div>
      </ScoreboardPanel>
    )
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!resultat) { setError('Veuillez choisir un résultat'); return }
    setLoading(true)
    setError('')

    const pronosticData = {
      user_id: userId!,
      match_id: matchId,
      resultat_predit: resultat,
      score_a_predit: scoreA,
      score_b_predit: scoreB,
      premier_buteur_id: premierButeur,
      homme_du_match_predit_id: hommeDuMatch,
      score_exact: scoreA !== null && scoreB !== null,
    }

    if (!isOnline) {
      addToOfflineQueue(pronosticData)
      setPendingCount(getPendingCount())
      setSuccess(true)
      setLoading(false)
      setError('')
      return
    }

    const { error: err } = await supabase.from('pronostics').upsert(pronosticData, { onConflict: 'user_id,match_id' })

    if (err) { setError("Erreur lors de l'enregistrement. Réessayez."); setLoading(false); return }

    setSuccess(true)
    setLoading(false)
    router.refresh()
  }

  const options: { value: 'equipe_a' | 'nul' | 'equipe_b'; label: string; color: string }[] = [
    { value: 'equipe_a', label: equipeA.nom, color: equipeA.couleur_principale || '#0dca6b' },
    { value: 'nul', label: 'Match Nul', color: '#64748B' },
    { value: 'equipe_b', label: equipeB.nom, color: equipeB.couleur_principale || '#0dca6b' },
  ]

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '11px 12px', borderRadius: 'var(--radius-md)',
    border: '1px solid var(--color-border)', background: 'var(--color-surface-card)',
    fontSize: '0.9rem', color: 'var(--color-text-primary)',
  }

  return (
    <ScoreboardPanel title="Votre Pronostic" icon={<Target size={14} color="var(--color-primary)" />}>
      <p style={{ fontSize: '0.76rem', color: 'var(--color-text-secondary)', marginBottom: 18, display: 'flex', alignItems: 'center', gap: 6 }}>
        <Lock size={12} color="var(--color-text-muted)" /> Choisissez le vainqueur ou le match nul. Victoire trouvée = 3 pts · Nul trouvé = 1 pt.
      </p>

      {!isOnline && (
        <div style={{ padding: '10px 14px', background: 'rgba(255,201,77,0.1)', border: '1px solid rgba(255,201,77,0.3)', borderRadius: 10, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.78rem', color: 'var(--color-accent)' }}>
          <WifiOff size={14} style={{ flexShrink: 0 }} />
          <span>Vous êtes hors ligne. Votre pronostic sera synchronisé automatiquement.</span>
        </div>
      )}

      {pendingCount > 0 && isOnline && (
        <div style={{ padding: '10px 14px', background: 'rgba(42,255,160,0.08)', border: '1px solid rgba(42,255,160,0.25)', borderRadius: 10, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.78rem', color: 'var(--color-primary-dark)' }}>
          <RefreshCw size={14} style={{ flexShrink: 0 }} />
          <span>{pendingCount} pronostic{pendingCount > 1 ? 's' : ''} en attente de synchronisation...</span>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        {/* Choix du résultat */}
        <div style={{ marginBottom: 24 }}>
          <Label>Votre prédiction *</Label>
          <div className="simple-pronostic-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 10, marginTop: 8 }}>
            {options.map(opt => (
              <button
                key={opt.value}
                type="button"
                className={`pronostic-option${resultat === opt.value ? ' selected' : ''}`}
                onClick={() => setResultat(opt.value)}
                style={resultat === opt.value ? { borderColor: opt.color, background: `${opt.color}12`, boxShadow: `0 0 0 3px ${opt.color}22, 0 6px 20px ${opt.color}18` } : {}}
                id={`pronostic-${opt.value}`}
              >
                {opt.value === 'nul' ? (
                  <span style={{
                    width: 34, height: 34, borderRadius: 11, flexShrink: 0,
                    background: resultat === opt.value ? 'rgba(100,116,139,0.2)' : 'var(--color-bg-primary)',
                    border: `1px solid ${resultat === opt.value ? '#64748B' : 'var(--color-border-subtle)'}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '0.62rem', fontWeight: 900, color: resultat === opt.value ? '#94a3b8' : 'var(--color-text-muted)',
                    fontFamily: 'var(--font-mono)',
                  }}>
                    N
                  </span>
                ) : (
                  <TeamTile equipe={opt.value === 'equipe_a' ? equipeA : equipeB} size={34} />
                )}
                <span style={{ fontSize: '0.72rem', fontWeight: 700, textAlign: 'center', color: resultat === opt.value ? opt.color : 'var(--color-text-secondary)', lineHeight: 1.2 }}>
                  {opt.label}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Score exact */}
        <div style={{ marginBottom: 24 }}>
          <Label>Score exact (optionnel)</Label>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 8 }}>
            <input
              type="number"
              min="0"
              value={scoreA ?? ''}
              onChange={e => setScoreA(e.target.value ? parseInt(e.target.value) : null)}
              placeholder={equipeA.sigle || equipeA.nom}
              style={{
                width: 84, padding: '11px 12px', borderRadius: 'var(--radius-md)',
                border: '1px solid var(--color-border)', background: 'var(--color-surface-card)',
                textAlign: 'center', fontSize: '1.05rem', fontFamily: 'var(--font-mono)', fontWeight: 800,
              }}
            />
            <span style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--color-text-muted)' }}>–</span>
            <input
              type="number"
              min="0"
              value={scoreB ?? ''}
              onChange={e => setScoreB(e.target.value ? parseInt(e.target.value) : null)}
              placeholder={equipeB.sigle || equipeB.nom}
              style={{
                width: 84, padding: '11px 12px', borderRadius: 'var(--radius-md)',
                border: '1px solid var(--color-border)', background: 'var(--color-surface-card)',
                textAlign: 'center', fontSize: '1.05rem', fontFamily: 'var(--font-mono)', fontWeight: 800,
              }}
            />
          </div>
        </div>

        {/* Premier buteur */}
        {joueursA.length > 0 && joueursB.length > 0 && (
          <div style={{ marginBottom: 24 }}>
            <Label icon={<Goal size={13} color="var(--color-text-muted)" />}>Premier buteur (optionnel)</Label>
            <select
              value={premierButeur || ''}
              onChange={e => setPremierButeur(e.target.value || null)}
              style={{ ...inputStyle, marginTop: 8 }}
            >
              <option value="">Sélectionner un joueur</option>
              <optgroup label={equipeA.nom}>
                {joueursA.map(j => (
                  <option key={j.id} value={j.id}>{j.nom} {j.prenom ? j.prenom : ''}</option>
                ))}
              </optgroup>
              <optgroup label={equipeB.nom}>
                {joueursB.map(j => (
                  <option key={j.id} value={j.id}>{j.nom} {j.prenom ? j.prenom : ''}</option>
                ))}
              </optgroup>
            </select>
          </div>
        )}

        {/* Homme du match */}
        {joueursA.length > 0 && joueursB.length > 0 && (
          <div style={{ marginBottom: 24 }}>
            <Label icon={<Star size={13} color="var(--color-text-muted)" />}>Homme du match (optionnel)</Label>
            <select
              value={hommeDuMatch || ''}
              onChange={e => setHommeDuMatch(e.target.value || null)}
              style={{ ...inputStyle, marginTop: 8 }}
            >
              <option value="">Sélectionner un joueur</option>
              <optgroup label={equipeA.nom}>
                {joueursA.map(j => (
                  <option key={j.id} value={j.id}>{j.nom} {j.prenom ? j.prenom : ''}</option>
                ))}
              </optgroup>
              <optgroup label={equipeB.nom}>
                {joueursB.map(j => (
                  <option key={j.id} value={j.id}>{j.nom} {j.prenom ? j.prenom : ''}</option>
                ))}
              </optgroup>
            </select>
          </div>
        )}

        {error && (
          <div style={{ padding: '10px 14px', background: 'rgba(232,0,45,0.06)', border: '1px solid rgba(232,0,45,0.2)', borderRadius: 10, color: 'var(--color-red)', fontSize: '0.78rem', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
            <AlertTriangle size={14} style={{ flexShrink: 0 }} /> {error}
          </div>
        )}

        {success && (
          <div style={{ padding: '10px 14px', background: 'rgba(0,166,81,0.08)', border: '1px solid rgba(0,166,81,0.25)', borderRadius: 10, color: 'var(--color-primary)', fontSize: '0.78rem', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
            <CheckCircle2 size={14} style={{ flexShrink: 0 }} /> {isOnline ? 'Pronostic enregistré avec succès !' : 'Pronostic enregistré hors ligne. Il sera synchronisé dès que vous serez connecté.'}
          </div>
        )}

        <FormSubmitButton loading={loading} disabled={!resultat} loadingText="Enregistrement...">
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
    </ScoreboardPanel>
  )
}
