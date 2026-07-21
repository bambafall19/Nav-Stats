'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { triggerConfetti } from '@/lib/confetti'

type PronosticWithMatch = {
  id: string
  resultat_predit: 'equipe_a' | 'nul' | 'equipe_b'
  score_a_predit: number | null
  score_b_predit: number | null
  homme_du_match_predit_id: string | null
  points_gagnes: number
  est_correct: boolean | null
  score_exact: boolean
  premier_buteur: { nom: string; prenom: string | null } | null
  homme_du_match: { nom: string; prenom: string | null } | null
  match: {
    id: string
    date_match: string
    heure_match: string
    statut: 'a_venir' | 'en_cours' | 'termine' | 'reporte'
    score_a: number | null
    score_b: number | null
    homme_du_match_id: string | null
    equipe_a: { nom: string | null; sigle: string | null; logo_url: string | null; couleur_principale: string } | null
    equipe_b: { nom: string | null; sigle: string | null; logo_url: string | null; couleur_principale: string } | null
  } | null
}

type Props = {
  pronostics: PronosticWithMatch[]
  totalPoints: number
  corrects: number
  scoresExact: number
  pending: number
  accuracy: number
}

function predictionLabel(pronostic: PronosticWithMatch) {
  const match = pronostic.match
  if (pronostic.resultat_predit === 'equipe_a') return match?.equipe_a?.nom || 'Equipe A'
  if (pronostic.resultat_predit === 'equipe_b') return match?.equipe_b?.nom || 'Equipe B'
  return 'Match nul'
}

function matchResult(match: PronosticWithMatch['match']) {
  if (!match || match.statut !== 'termine') return 'En attente'
  if ((match.score_a ?? 0) > (match.score_b ?? 0)) return match.equipe_a?.nom || 'Equipe A'
  if ((match.score_b ?? 0) > (match.score_a ?? 0)) return match.equipe_b?.nom || 'Equipe B'
  return 'Match nul'
}

export default function PronosticsClient({ pronostics, totalPoints, corrects, scoresExact, pending, accuracy }: Props) {
  const [activeTab, setActiveTab] = useState<'tous' | 'a_venir' | 'termines'>('tous')
  const [celebratedIds, setCelebratedIds] = useState<Set<string>>(new Set())

  const filtered = pronostics.filter(p => {
    if (activeTab === 'a_venir') return p.match?.statut === 'a_venir' || p.match?.statut === 'en_cours'
    if (activeTab === 'termines') return p.match?.statut === 'termine'
    return true
  })

  const tabs = [
    { id: 'tous' as const, label: 'Tous', count: pronostics.length },
    { id: 'a_venir' as const, label: 'À venir', count: pronostics.filter(p => p.match?.statut === 'a_venir' || p.match?.statut === 'en_cours').length },
    { id: 'termines' as const, label: 'Terminés', count: pronostics.filter(p => p.match?.statut === 'termine').length },
  ]

  useEffect(() => {
    pronostics.forEach(p => {
      if (p.est_correct === true && !celebratedIds.has(p.id)) {
        setCelebratedIds(prev => new Set(prev).add(p.id))
        triggerConfetti()
      }
    })
  }, [pronostics])

  return (
    <>
      {/* Stats Grid */}
      <section className="pronostics-summary-grid" style={{ marginBottom: 28 }}>
        {[
          { label: 'Points gagnés', value: totalPoints, icon: '🏆', color: '#B45309', bg: 'rgba(180,83,9,0.1)' },
          { label: 'Pronostics', value: pronostics.length, icon: '🎯', color: '#006233', bg: 'rgba(0,98,51,0.1)' },
          { label: 'Réussite', value: `${accuracy}%`, icon: '📈', color: '#0F766E', bg: 'rgba(15,118,110,0.1)' },
          { label: 'Scores exacts', value: scoresExact, icon: '✅', color: '#1D4ED8', bg: 'rgba(29,78,216,0.1)' },
          { label: 'En attente', value: pending, icon: '⏳', color: '#64748B', bg: 'rgba(100,116,139,0.1)' },
        ].map(stat => (
          <motion.article
            key={stat.label}
            className="card"
            style={{ padding: 18, display: 'flex', gap: 14, alignItems: 'center' }}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            <div style={{ width: 46, height: 46, borderRadius: 14, background: stat.bg, color: stat.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.25rem', flexShrink: 0 }}>{stat.icon}</div>
            <div>
              <strong style={{ display: 'block', fontFamily: 'var(--font-outfit)', fontSize: '1.6rem', lineHeight: 1, color: stat.color }}>{stat.value}</strong>
              <span style={{ color: 'var(--color-text-muted)', fontSize: '0.78rem', fontWeight: 700 }}>{stat.label}</span>
            </div>
          </motion.article>
        ))}
      </section>

      {/* Scoring rules */}
      <motion.section
        className="card"
        style={{ padding: 22, marginBottom: 24 }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <h2 style={{ fontSize: '1rem', marginBottom: 14, fontFamily: 'var(--font-outfit)', fontWeight: 800 }}>🏅 Comment gagner des points ?</h2>
        <div className="rules-grid">
          {[
            { label: 'Résultat trouvé', value: '+3 pts', color: 'var(--color-primary)' },
            { label: 'Score exact', value: '+5 pts bonus', color: '#B45309' },
            { label: 'Premier buteur', value: '+3 pts', color: '#1D4ED8' },
            { label: 'Homme du match', value: '+2 pts', color: '#7C3AED' },
          ].map(({ label, value, color }) => (
            <div key={label} style={{ padding: 14, borderRadius: 12, background: 'var(--color-surface)', display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'center' }}>
              <span style={{ color: 'var(--color-text-secondary)', fontSize: '0.85rem', fontWeight: 600 }}>{label}</span>
              <strong style={{ color, fontFamily: 'var(--font-outfit)', whiteSpace: 'nowrap' }}>{value}</strong>
            </div>
          ))}
        </div>
      </motion.section>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 18, background: 'var(--color-surface)', padding: 4, borderRadius: 'var(--radius-full)' }}>
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              flex: 1, padding: '10px 12px', borderRadius: 'var(--radius-full)', border: 'none', cursor: 'pointer',
              background: activeTab === tab.id ? 'var(--color-surface-card)' : 'transparent',
              color: activeTab === tab.id ? 'var(--color-primary)' : 'var(--color-text-secondary)',
              fontWeight: activeTab === tab.id ? 800 : 500,
              fontFamily: 'var(--font-outfit)',
              fontSize: '0.82rem',
              boxShadow: activeTab === tab.id ? 'var(--shadow-sm)' : 'none',
              transition: 'all 0.2s ease',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
            }}
          >
            {tab.label}
            {tab.count > 0 && (
              <span style={{
                padding: '1px 7px', borderRadius: 'var(--radius-full)', fontSize: '0.7rem', fontWeight: 800,
                background: activeTab === tab.id ? 'var(--color-primary)' : 'var(--color-surface-elevated)',
                color: activeTab === tab.id ? 'white' : 'var(--color-text-muted)',
              }}>{tab.count}</span>
            )}
          </button>
        ))}
      </div>

      {/* Prediction Cards */}
      {filtered.length === 0 ? (
        <motion.div
          className="card"
          style={{ padding: 44, textAlign: 'center' }}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <div style={{ fontSize: '2.5rem', marginBottom: 10 }}>⚽</div>
          <h2 style={{ fontSize: '1.2rem', marginBottom: 8 }}>
            {activeTab === 'a_venir' ? 'Aucun pronostic à venir' : activeTab === 'termines' ? 'Aucun pronostic terminé' : 'Aucun pronostic pour le moment'}
          </h2>
          <p style={{ color: 'var(--color-text-secondary)', marginBottom: 18 }}>
            {activeTab === 'tous' ? 'Choisissez un match à venir et lancez-vous.' : 'Ils apparaîtront ici quand vous en aurez.'}
          </p>
          <Link href="/matchs" className="btn btn-primary">Voir les matchs</Link>
        </motion.div>
      ) : (
        <div style={{ display: 'grid', gap: 14 }}>
          {filtered.map((pronostic, idx) => {
            const match = pronostic.match
            const isDone = match?.statut === 'termine'
            const isLive = match?.statut === 'en_cours'
            const isCorrect = pronostic.est_correct === true
            const isWrong = pronostic.est_correct === false

            const statusColor = isCorrect ? 'var(--color-primary)' : isWrong ? 'var(--color-red)' : isDone ? 'var(--color-red)' : 'var(--color-text-muted)'
            const statusBg = isCorrect ? 'rgba(0,166,81,0.1)' : isWrong ? 'rgba(232,0,45,0.08)' : isDone ? 'rgba(232,0,45,0.08)' : 'rgba(100,116,139,0.1)'
            const statusIcon = isDone ? (isCorrect ? '✅' : '❌') : isLive ? '🔴' : '⏳'

            return (
              <motion.div
                key={pronostic.id}
                className="card prono-card"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: idx * 0.05 }}
              >
                {/* Header: match info + badge */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, marginBottom: 14 }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap', marginBottom: 4 }}>
                      <strong style={{ fontSize: '0.95rem', color: 'var(--color-text-primary)' }}>
                        {match?.equipe_a?.nom} vs {match?.equipe_b?.nom}
                      </strong>
                    </div>
                    <div style={{ fontSize: '0.74rem', color: 'var(--color-text-muted)' }}>
                      {match ? new Date(match.date_match).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' }) : ''}
                      {match?.heure_match ? ` · ${match.heure_match.slice(0, 5)}` : ''}
                    </div>
                  </div>
                  <div style={{
                    padding: '6px 14px', borderRadius: 'var(--radius-full)',
                    background: statusBg, color: statusColor,
                    fontFamily: 'var(--font-outfit)', fontWeight: 900, fontSize: '0.85rem',
                    flexShrink: 0, whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: 5,
                  }}>
                    {statusIcon} {isDone ? `${pronostic.points_gagnes || 0} pts` : isLive ? 'Live' : 'En attente'}
                  </div>
                </div>

                {/* Prediction vs Reality */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
                  <div style={{ padding: '10px 14px', background: 'var(--color-surface)', borderRadius: 12 }}>
                    <div style={{ fontSize: '0.62rem', fontWeight: 800, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 4 }}>Votre choix</div>
                    <div style={{ fontWeight: 700, fontSize: '0.88rem', color: 'var(--color-text-primary)' }}>{predictionLabel(pronostic)}</div>
                    {pronostic.score_a_predit !== null && (
                      <div style={{ fontSize: '0.78rem', color: 'var(--color-primary)', fontWeight: 700, marginTop: 3 }}>
                        Score: {pronostic.score_a_predit} – {pronostic.score_b_predit}
                      </div>
                    )}
                  </div>
                  <div style={{ padding: '10px 14px', background: 'var(--color-surface)', borderRadius: 12 }}>
                    <div style={{ fontSize: '0.62rem', fontWeight: 800, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 4 }}>
                      {isDone ? 'Résultat final' : 'Statut'}
                    </div>
                    <div style={{ fontWeight: 700, fontSize: '0.88rem', color: 'var(--color-text-primary)' }}>
                      {isDone ? `${match?.score_a ?? '-'} – ${match?.score_b ?? '-'}` : (isLive ? '🔴 En direct' : '⏳ À venir')}
                    </div>
                    {isDone && (
                      <div style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)', marginTop: 3 }}>{matchResult(match)}</div>
                    )}
                  </div>
                </div>

                {/* Bonus chips */}
                {(pronostic.premier_buteur || pronostic.homme_du_match) && (
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 12 }}>
                    {pronostic.premier_buteur && (
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '4px 10px', background: 'rgba(29,78,216,0.08)', borderRadius: 'var(--radius-full)', fontSize: '0.72rem', fontWeight: 700, color: '#1D4ED8' }}>
                        ⚽ {pronostic.premier_buteur.prenom} {pronostic.premier_buteur.nom}
                      </span>
                    )}
                    {pronostic.homme_du_match && (
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '4px 10px', background: 'rgba(124,58,237,0.08)', borderRadius: 'var(--radius-full)', fontSize: '0.72rem', fontWeight: 700, color: '#7C3AED' }}>
                        ⭐ {pronostic.homme_du_match.prenom} {pronostic.homme_du_match.nom}
                      </span>
                    )}
                  </div>
                )}

                {/* Points breakdown */}
                {isDone && pronostic.points_gagnes > 0 && (
                  <div style={{ paddingTop: 10, borderTop: '1px solid var(--color-border)', display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 10 }}>
                    {isCorrect && (
                      <span style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--color-primary)', background: 'rgba(0,166,81,0.1)', padding: '3px 8px', borderRadius: 'var(--radius-full)' }}>
                        Résultat ✓ +3 pts
                      </span>
                    )}
                    {pronostic.score_exact && (
                      <span style={{ fontSize: '0.68rem', fontWeight: 700, color: '#B45309', background: 'rgba(180,83,9,0.1)', padding: '3px 8px', borderRadius: 'var(--radius-full)' }}>
                        Score exact 🎯 +5 pts
                      </span>
                    )}
                  </div>
                )}

                <Link href={match ? `/matchs/${match.id}` : '/matchs'} style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: '0.75rem', color: 'var(--color-primary)', textDecoration: 'none', fontWeight: 600 }}>
                  Voir le match →
                </Link>
              </motion.div>
            )
          })}
        </div>
      )}

      <style>{`
        .prono-card { padding: 18px 20px; }
        .pronostics-summary-grid { display: grid; gap: 14px; grid-template-columns: repeat(2, minmax(0, 1fr)); }
        .rules-grid { display: grid; gap: 10px; grid-template-columns: repeat(2, 1fr); }
        @media (min-width: 640px) {
          .pronostics-summary-grid { grid-template-columns: repeat(3, minmax(0, 1fr)); }
          .rules-grid { grid-template-columns: repeat(4, 1fr); }
        }
      `}</style>
    </>
  )
}