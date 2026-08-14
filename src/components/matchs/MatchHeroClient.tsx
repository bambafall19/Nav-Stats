'use client'

import { useEffect, useState, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import CountdownTimer from '@/components/shared/CountdownTimer'
import { MapPin, Timer, CheckCircle2, Zap, CalendarDays, Trophy } from 'lucide-react'

interface MatchHeroClientProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  initialMatch: any
}

function TeamLogo({ equipe, size = 68 }: { equipe: any; size?: number }) {
  const radius = Math.round(size * 0.22)
  if (equipe.logo_url) {
    return (
      <div style={{
        width: size, height: size, borderRadius: radius,
        overflow: 'hidden', flexShrink: 0,
        border: '2px solid rgba(255,255,255,0.6)',
        boxShadow: '0 6px 20px rgba(0,0,0,0.35)',
        background: 'white',
      }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={equipe.logo_url} alt={equipe.nom} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
      </div>
    )
  }
  return (
    <div style={{
      width: size, height: size, borderRadius: radius,
      background: `linear-gradient(135deg, ${equipe.couleur_principale || '#0dca6b'}, ${equipe.couleur_secondaire || '#ffc94d'})`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: size * 0.32, fontWeight: 900, color: 'white',
      fontFamily: 'var(--font-plus-jakarta)', flexShrink: 0,
      border: '2px solid rgba(255,255,255,0.6)',
      boxShadow: '0 6px 20px rgba(0,0,0,0.35)',
    }}>
      {equipe.sigle || equipe.nom?.charAt(0)}
    </div>
  )
}

export function MatchHeroClient({ initialMatch }: MatchHeroClientProps) {
  const [match, setMatch] = useState(initialMatch)
  const supabaseRef = useRef(createClient())

  useEffect(() => {
    const supabase = supabaseRef.current
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
  }, [match.id])

  const equipeA = match.equipe_a
  const equipeB = match.equipe_b

  const isAvenir = match.statut === 'a_venir'
  const isDone = match.statut === 'termine'
  const isLive = match.statut === 'en_cours'

  const dateLabel = new Date(match.date_match).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })

  return (
    <div style={{
      background: 'linear-gradient(160deg, #0b5e33 0%, #0a7a3c 45%, #0d8a46 100%)',
      borderRadius: 18,
      overflow: 'hidden',
      marginBottom: 16,
      position: 'relative',
      boxShadow: '0 12px 32px rgba(6,78,59,0.25)',
      isolation: 'isolate',
    }}>
      {/* Pitch lines */}
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', opacity: 0.35, zIndex: 0 }}>
        {/* Outer border */}
        <div style={{ position: 'absolute', inset: 10, border: '2px solid rgba(255,255,255,0.5)', borderRadius: 10 }} />
        {/* Halfway line */}
        <div style={{ position: 'absolute', top: 0, bottom: 0, left: '50%', width: 2, background: 'rgba(255,255,255,0.5)' }} />
        {/* Center circle */}
        <div style={{ position: 'absolute', top: '50%', left: '50%', width: 90, height: 90, border: '2px solid rgba(255,255,255,0.5)', borderRadius: '50%', transform: 'translate(-50%, -50%)' }} />
        {/* Center dot */}
        <div style={{ position: 'absolute', top: '50%', left: '50%', width: 6, height: 6, borderRadius: '50%', background: 'rgba(255,255,255,0.5)', transform: 'translate(-50%, -50%)' }} />
        {/* Penalty boxes */}
        <div style={{ position: 'absolute', top: '50%', left: 10, width: 60, height: 130, border: '2px solid rgba(255,255,255,0.5)', transform: 'translateY(-50%)', borderLeft: 'none' }} />
        <div style={{ position: 'absolute', top: '50%', right: 10, width: 60, height: 130, border: '2px solid rgba(255,255,255,0.5)', transform: 'translateY(-50%)', borderRight: 'none' }} />
        {/* Goal areas */}
        <div style={{ position: 'absolute', top: '50%', left: 10, width: 26, height: 66, border: '2px solid rgba(255,255,255,0.5)', transform: 'translateY(-50%)', borderLeft: 'none' }} />
        <div style={{ position: 'absolute', top: '50%', right: 10, width: 26, height: 66, border: '2px solid rgba(255,255,255,0.5)', transform: 'translateY(-50%)', borderRight: 'none' }} />
      </div>

      {/* LED Scoreboard */}
      <div style={{
        position: 'relative', zIndex: 2,
        margin: '12px 14px 0',
        background: '#05150a',
        borderRadius: 10,
        padding: '10px 14px',
        boxShadow: 'inset 0 0 0 1px rgba(0,255,136,0.15), 0 4px 16px rgba(0,0,0,0.4)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        gap: 8,
      }}>
        {/* Home team (A) */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0, flex: 1 }}>
          <span style={{
            width: 8, height: 8, borderRadius: '50%',
            background: isLive ? '#ff4757' : 'rgba(0,255,136,0.6)',
            animation: isLive ? 'scoreBlink 1s step-end infinite' : 'none',
            flexShrink: 0,
          }} />
          <span style={{
            fontFamily: 'var(--font-mono)', fontWeight: 800,
            fontSize: 'clamp(0.6rem, 2.5vw, 0.78rem)',
            color: '#00ff88', letterSpacing: '0.06em',
            textTransform: 'uppercase',
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          }}>
            {equipeA.sigle || equipeA.nom?.slice(0, 12)}
          </span>
        </div>

        {/* Score */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
          {isDone && match.forfait ? (
            <span style={{
              fontFamily: 'var(--font-plus-jakarta)', fontWeight: 900,
              fontSize: 'clamp(0.7rem, 3vw, 1rem)', color: '#ffc94d',
              letterSpacing: '0.08em',
            }}>
              FORFAIT
            </span>
          ) : isDone || isLive ? (
            <>
              <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 900, fontSize: 'clamp(1.5rem, 6vw, 2.1rem)', color: '#00ff88', lineHeight: 1 }}>{match.score_a ?? 0}</span>
              <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: '1rem', color: 'rgba(0,255,136,0.5)' }}>:</span>
              <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 900, fontSize: 'clamp(1.5rem, 6vw, 2.1rem)', color: '#00ff88', lineHeight: 1 }}>{match.score_b ?? 0}</span>
            </>
          ) : (
            <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 900, fontSize: 'clamp(1.1rem, 4vw, 1.5rem)', color: 'rgba(0,255,136,0.6)', letterSpacing: '0.1em' }}>VS</span>
          )}
        </div>

        {/* Away team (B) */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0, flex: 1, justifyContent: 'flex-end' }}>
          <span style={{
            fontFamily: 'var(--font-mono)', fontWeight: 800,
            fontSize: 'clamp(0.6rem, 2.5vw, 0.78rem)',
            color: '#00ff88', letterSpacing: '0.06em',
            textTransform: 'uppercase',
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          }}>
            {equipeB.sigle || equipeB.nom?.slice(0, 12)}
          </span>
          <span style={{
            width: 8, height: 8, borderRadius: '50%',
            background: isLive ? '#ff4757' : 'rgba(0,255,136,0.6)',
            animation: isLive ? 'scoreBlink 1s step-end infinite' : 'none',
            flexShrink: 0,
          }} />
        </div>
      </div>

      {/* Status row */}
      <div style={{ position: 'relative', zIndex: 2, display: 'flex', justifyContent: 'center', gap: 8, padding: '10px 14px 0', flexWrap: 'wrap' }}>
        {isLive && (
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 5,
            padding: '4px 12px', borderRadius: 999,
            background: 'rgba(255,71,87,0.25)', border: '1px solid rgba(255,71,87,0.4)',
            color: '#ffd7dc', fontSize: '0.68rem', fontWeight: 800,
            letterSpacing: '0.05em', fontFamily: 'var(--font-plus-jakarta)',
          }}>
            <Zap size={11} /> EN DIRECT
          </span>
        )}
        {isDone && (
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 5,
            padding: '4px 12px', borderRadius: 999,
            background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.25)',
            color: 'rgba(255,255,255,0.9)', fontSize: '0.68rem', fontWeight: 700,
            fontFamily: 'var(--font-plus-jakarta)',
          }}>
            <CheckCircle2 size={11} /> Match Terminé
          </span>
        )}
        {isAvenir && (
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 5,
            padding: '4px 12px', borderRadius: 999,
            background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.25)',
            color: 'rgba(255,255,255,0.9)', fontSize: '0.68rem', fontWeight: 700,
            fontFamily: 'var(--font-plus-jakarta)',
          }}>
            <CalendarDays size={11} /> {dateLabel} · {match.heure_match?.slice(0, 5)}
          </span>
        )}
        <span style={{
          display: 'inline-flex', alignItems: 'center', gap: 5,
          padding: '4px 10px', borderRadius: 999,
          background: 'rgba(255,201,77,0.25)', border: '1px solid rgba(255,201,77,0.35)',
          color: '#ffe8a3', fontSize: '0.62rem', fontWeight: 700,
          fontFamily: 'var(--font-mono)',
        }}>
          <Trophy size={10} /> J{match.journee || '?'}
        </span>
      </div>

      {/* Teams on the pitch */}
      <div style={{
        position: 'relative', zIndex: 2,
        display: 'grid', gridTemplateColumns: '1fr auto 1fr',
        gap: 8, alignItems: 'center',
        padding: '18px 14px 20px',
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
          <TeamLogo equipe={equipeA} />
          <div style={{ textAlign: 'center', maxWidth: '100%' }}>
            <div style={{
              fontFamily: 'var(--font-plus-jakarta)', fontWeight: 800,
              fontSize: 'clamp(0.78rem, 3vw, 1rem)',
              color: 'white', textShadow: '0 1px 6px rgba(0,0,0,0.4)',
              lineHeight: 1.2,
            }}>
              {equipeA.nom}
            </div>
            {equipeA.asc_nom && (
              <div style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.75)', marginTop: 3 }}>{equipeA.asc_nom}</div>
            )}
          </div>
        </div>

        <div style={{ textAlign: 'center', flexShrink: 0 }}>
          {isAvenir && (
            <div style={{ padding: '6px 14px', borderRadius: 9, background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.2)' }}>
              <CountdownTimer targetDate={match.date_match} targetTime={match.heure_match || '00:00'} />
            </div>
          )}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
          <TeamLogo equipe={equipeB} />
          <div style={{ textAlign: 'center', maxWidth: '100%' }}>
            <div style={{
              fontFamily: 'var(--font-plus-jakarta)', fontWeight: 800,
              fontSize: 'clamp(0.78rem, 3vw, 1rem)',
              color: 'white', textShadow: '0 1px 6px rgba(0,0,0,0.4)',
              lineHeight: 1.2,
            }}>
              {equipeB.nom}
            </div>
            {equipeB.asc_nom && (
              <div style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.75)', marginTop: 3 }}>{equipeB.asc_nom}</div>
            )}
          </div>
        </div>
      </div>

      {/* Info row */}
      <div style={{
        position: 'relative', zIndex: 2,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        gap: 14, flexWrap: 'wrap',
        padding: '9px 14px',
        background: 'rgba(0,0,0,0.25)',
        borderTop: '1px solid rgba(255,255,255,0.12)',
      }}>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: '0.64rem', fontWeight: 600, color: 'rgba(255,255,255,0.85)' }}>
          <MapPin size={11} color="#00ff88" /> {match.stade}
        </span>
        {match.arbitre && (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: '0.64rem', fontWeight: 600, color: 'rgba(255,255,255,0.85)' }}>
            <Timer size={11} color="#ffd166" /> Arb. {match.arbitre}
          </span>
        )}
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: '0.64rem', fontWeight: 600, color: 'rgba(255,255,255,0.85)' }}>
          <Trophy size={11} color="rgba(255,255,255,0.6)" /> Poule {match.equipe_a?.poule || 'A'}
        </span>
      </div>

      <style>{`
        @keyframes scoreBlink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.25; }
        }
      `}</style>
    </div>
  )
}
