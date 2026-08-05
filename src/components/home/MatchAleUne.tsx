'use client'

import Link from 'next/link'
import { ArrowRight, Clock, MapPin, Flame } from 'lucide-react'
import CountdownTimer from '@/components/shared/CountdownTimer'
import type { Database } from '@/types/database.types'

type Match = Database['public']['Tables']['matchs']['Row'] & {
  equipe_a: Database['public']['Tables']['equipes']['Row']
  equipe_b: Database['public']['Tables']['equipes']['Row']
}

function TeamLogo({ equipe }: { equipe: Database['public']['Tables']['equipes']['Row'] }) {
  if (equipe.logo_url) {
    return (
      <img src={equipe.logo_url} alt={equipe.nom} className="featured-team-logo"
        style={{ width: 54, height: 54, borderRadius: 14, objectFit: 'cover', border: '2px solid rgba(255,255,255,0.25)', boxShadow: '0 4px 16px rgba(0,0,0,0.2)' }}
      />
    )
  }
  return (
    <div className="featured-team-logo" style={{
      width: 54, height: 54, borderRadius: 14,
      background: `linear-gradient(135deg, ${equipe.couleur_principale || '#0dca6b'}, ${equipe.couleur_secondaire || '#ffc94d'})`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: 19, fontWeight: 800, color: 'white',
      fontFamily: 'var(--font-plus-jakarta)',
      border: '2px solid rgba(255,255,255,0.25)',
      boxShadow: '0 4px 16px rgba(0,0,0,0.2)',
    }}>
      {equipe.sigle || equipe.nom.charAt(0)}
    </div>
  )
}

export default function MatchAleUne({ match }: { match: Match }) {
  const matchDate = new Date(`${match.date_match}T${match.heure_match || '00:00:00'}`)

  return (
    <>
    <section className="featured-match" style={{
      borderRadius: 'var(--radius-xl)',
      overflow: 'hidden',
      background: 'var(--gradient-hero)',
      position: 'relative',
      boxShadow: '0 12px 36px rgba(6,78,59,0.3)',
    }}>
      {/* Stadium backdrop */}
      <div style={{
        position: 'absolute', inset: 0,
        opacity: 0.3,
      }}>
        <img src="/stadium/stadium2.jpg" alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(90deg, #0b5234 0%, rgba(6,78,59,0.7) 50%, #0b5234 100%)',
        }} />
      </div>
      <div style={{
        position: 'absolute', top: -40, right: -30, width: 160, height: 160, borderRadius: '50%',
        background: 'rgba(255,255,255,0.06)',
      }} />
      <div style={{
        position: 'absolute', bottom: -50, left: -20, width: 120, height: 120, borderRadius: '50%',
        background: 'rgba(255,255,255,0.05)',
      }} />

      <div className="featured-body" style={{ position: 'relative', zIndex: 1, padding: '26px 24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
          <div style={{
            width: 28, height: 28, borderRadius: 9,
            background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(8px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Flame size={15} color="#FFD700" />
          </div>
          <span style={{
            color: 'white', fontSize: '0.7rem', fontWeight: 800,
            fontFamily: 'var(--font-plus-jakarta)', textTransform: 'uppercase',
            letterSpacing: '0.09em',
          }}>Match à la une</span>
          <span style={{
            marginLeft: 'auto', fontSize: '0.6rem', color: 'rgba(255,255,255,0.65)',
            fontFamily: 'var(--font-mono)', fontWeight: 700,
            padding: '4px 10px', borderRadius: 99,
            background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.18)',
          }}>
            {matchDate.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ flex: 1, textAlign: 'center' }}>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 10 }}>
              <TeamLogo equipe={match.equipe_a} />
            </div>
            <div style={{ color: 'white', fontWeight: 800, fontSize: '0.88rem', fontFamily: 'var(--font-plus-jakarta)', lineHeight: 1.25 }}>
              {match.equipe_a.nom}
            </div>
          </div>

          <div style={{ flexShrink: 0, textAlign: 'center', padding: '10px 14px', borderRadius: 'var(--radius-md)', background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.18)' }}>
            <div style={{
              fontFamily: 'var(--font-mono)', fontSize: '0.88rem', fontWeight: 800, color: '#FFD700',
              letterSpacing: '0.04em',
            }}>
              {match.heure_match?.slice(0, 5) || 'VS'}
            </div>
            <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.6rem', fontWeight: 700, marginTop: 2, fontFamily: 'var(--font-plus-jakarta)' }}>CNP</div>
          </div>

          <div style={{ flex: 1, textAlign: 'center' }}>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 10 }}>
              <TeamLogo equipe={match.equipe_b} />
            </div>
            <div style={{ color: 'white', fontWeight: 800, fontSize: '0.88rem', fontFamily: 'var(--font-plus-jakarta)', lineHeight: 1.25 }}>
              {match.equipe_b.nom}
            </div>
          </div>
        </div>

        <div className="featured-footer" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, marginTop: 18, flexWrap: 'wrap' }}>
          <div className="featured-countdown">
            <CountdownTimer targetDate={match.date_match} targetTime={match.heure_match || '00:00:00'} />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: '0.64rem', color: 'rgba(255,255,255,0.75)', padding: '6px 12px', borderRadius: 99, background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.16)' }}>
            <MapPin size={11} /> {match.stade || 'Khombole'}
          </div>
          <Link href={`/matchs/${match.id}`} className="featured-cta" style={{
            marginLeft: 'auto',
            display: 'inline-flex', alignItems: 'center', gap: 7,
            padding: '11px 20px', background: 'var(--gradient-green)', color: '#0a0f0d',
            borderRadius: 12, textDecoration: 'none', fontWeight: 700,
            fontSize: '0.76rem', fontFamily: 'var(--font-plus-jakarta)',
            boxShadow: '0 8px 24px rgba(0,0,0,0.25)',
            transition: 'all var(--transition-base) var(--ease-out)',
          }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 12px 28px rgba(0,0,0,0.3)' }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.25)' }}
          >
            Voir le match <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    </section>

    <style>{`
      @media (max-width: 767px) {
        .featured-match { border-radius: 22px !important; }
        .featured-body { padding: 20px 16px 22px !important; }
        .featured-team-logo { width: 46px !important; height: 46px !important; border-radius: 13px !important; font-size: 16px !important; }
        .featured-footer { flex-direction: column !important; align-items: stretch !important; gap: 10px !important; }
        .featured-countdown { display: flex; justify-content: center; }
        .featured-cta { margin-left: 0 !important; justify-content: center; }
      }
    `}</style>
    </>
  )
}
