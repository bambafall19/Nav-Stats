'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import CountdownTimer from '@/components/shared/CountdownTimer'

interface MatchHeroClientProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  initialMatch: any
}

export function MatchHeroClient({ initialMatch }: MatchHeroClientProps) {
  const [match, setMatch] = useState(initialMatch)
  const supabase = createClient()

  useEffect(() => {
    // S'abonner aux changements en temps réel sur la table matchs pour cet ID spécifique
    const channel = supabase
      .channel(`match-${match.id}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'matchs',
          filter: `id=eq.${match.id}`,
        },
        (payload) => {
          // payload.new contient le nouvel état du match
          // On fusionne avec l'état existant pour ne pas perdre les relations (equipe_a, equipe_b) qui ne sont pas envoyées dans payload.new
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          setMatch((current: any) => ({
            ...current,
            ...payload.new,
          }))
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [match.id, supabase])

  const equipeA = match.equipe_a
  const equipeB = match.equipe_b

  const isAvenir = match.statut === 'a_venir'
  const isDone = match.statut === 'termine'
  const isLive = match.statut === 'en_cours'

  return (
    <div style={{
      background: 'var(--gradient-hero)',
      borderRadius: 'var(--radius-xl)',
      padding: 'clamp(24px, 4vw, 48px)',
      marginBottom: 32,
      position: 'relative',
      overflow: 'hidden',
    }}>
      <div style={{ position: 'absolute', inset: 0, opacity: 0.05, backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'white\' fill-opacity=\'1\' fill-rule=\'evenodd\'%3E%3Cpath d=\'M30 30m-8 0a8 8 0 1 0 16 0a8 8 0 1 0-16 0\'/%3E%3C/g%3E%3C/svg%3E")' }} />

      {/* Status */}
      <div style={{ textAlign: 'center', marginBottom: 20 }}>
        {isLive && <span className="status-live" style={{ display: 'inline-flex' }}>EN DIRECT</span>}
        {isDone && <span className="badge badge-gray" style={{ fontSize: '0.8rem' }}>Match Terminé</span>}
        {isAvenir && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 12px', background: 'rgba(255,255,255,0.2)', borderRadius: 'var(--radius-full)', color: 'white', fontSize: '0.8rem', fontWeight: 600 }}>
              📅 {new Date(match.date_match).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })} à {match.heure_match?.slice(0,5)}
            </span>
            <CountdownTimer
              targetDate={match.date_match}
              targetTime={match.heure_match || '00:00'}
            />
          </div>
        )}
      </div>

      {/* Teams & Score */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: 16, alignItems: 'center' }}>
        {/* Team A */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
          {equipeA.logo_url ? (
            <img
              src={equipeA.logo_url}
              alt={equipeA.nom}
              style={{
                width: 72,
                height: 72,
                borderRadius: 'var(--radius-lg)',
                objectFit: 'cover',
                boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
              }}
            />
          ) : (
            <div style={{
              width: 72, height: 72,
              borderRadius: 'var(--radius-lg)',
              background: `linear-gradient(135deg, ${equipeA.couleur_principale || '#333'}, ${equipeA.couleur_secondaire || '#111'})`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '1.5rem', fontWeight: 900, color: 'white',
              fontFamily: 'var(--font-outfit)',
              boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
            }}>
              {equipeA.sigle || equipeA.nom?.charAt(0)}
            </div>
          )}
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontFamily: 'var(--font-outfit)', fontWeight: 800, fontSize: 'clamp(0.9rem, 3vw, 1.2rem)', color: 'white', lineHeight: 1.2 }}>
              {equipeA.nom}
            </div>
            {equipeA.asc_nom && (
              <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.7)', marginTop: 4 }}>{equipeA.asc_nom}</div>
            )}
          </div>
        </div>

        {/* Score / VS */}
        <div style={{ textAlign: 'center', minWidth: 100 }}>
          {isDone || isLive ? (
            <div style={{ fontFamily: 'var(--font-outfit)', fontSize: 'clamp(2.5rem, 8vw, 3.5rem)', fontWeight: 900, color: 'white', letterSpacing: '-0.04em', lineHeight: 1 }}>
              {match.score_a} — {match.score_b}
            </div>
          ) : (
            <div>
              <div style={{ fontFamily: 'var(--font-outfit)', fontSize: '2rem', fontWeight: 900, color: 'rgba(255,255,255,0.9)', letterSpacing: '-0.02em' }}>VS</div>
              <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.7)', marginTop: 8 }}>
                📍 {match.stade}
              </div>
              {match.arbitre && (
                <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.6)', marginTop: 4 }}>
                  🟡 Arb. {match.arbitre}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Team B */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
          {equipeB.logo_url ? (
            <img
              src={equipeB.logo_url}
              alt={equipeB.nom}
              style={{
                width: 72,
                height: 72,
                borderRadius: 'var(--radius-lg)',
                objectFit: 'cover',
                boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
              }}
            />
          ) : (
            <div style={{
              width: 72, height: 72,
              borderRadius: 'var(--radius-lg)',
              background: `linear-gradient(135deg, ${equipeB.couleur_principale || '#333'}, ${equipeB.couleur_secondaire || '#111'})`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '1.5rem', fontWeight: 900, color: 'white',
              fontFamily: 'var(--font-outfit)',
              boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
            }}>
              {equipeB.sigle || equipeB.nom?.charAt(0)}
            </div>
          )}
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontFamily: 'var(--font-outfit)', fontWeight: 800, fontSize: 'clamp(0.9rem, 3vw, 1.2rem)', color: 'white', lineHeight: 1.2 }}>
              {equipeB.nom}
            </div>
            {equipeB.asc_nom && (
              <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.7)', marginTop: 4 }}>{equipeB.asc_nom}</div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
