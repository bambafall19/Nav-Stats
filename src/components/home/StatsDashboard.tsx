'use client'

import { motion } from 'framer-motion'
import { TrendingUp, Award, Target, Activity } from 'lucide-react'

interface DashboardProps {
  topPronostiqueurs?: Array<{
    username: string
    points: number
    accuracy: number
    avatar_url?: string
  }>
  topEquipes?: Array<{
    nom: string
    points_classement: number
    logo_url?: string
    matchs_joues: number
  }>
  statsGlobales?: {
    totalPronostics: number
    totalUtilisateurs: number
    totalMatchs: number
    totalPoints: number
  }
}

export default function StatsDashboard({
  topPronostiqueurs = [],
  topEquipes = [],
  statsGlobales = {
    totalPronostics: 0,
    totalUtilisateurs: 0,
    totalMatchs: 0,
    totalPoints: 0,
  }
}: DashboardProps) {
  return (
    <section style={{ marginBottom: 24 }}>
      {/* Stats Overview Cards - Compact */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8, marginBottom: 16 }}>
        {[
          { icon: '🎯', label: 'Pronostics', value: statsGlobales.totalPronostics, color: '#39FF14', bg: 'rgba(57,255,20,0.08)' },
          { icon: '👥', label: 'Pronostiqueurs', value: statsGlobales.totalUtilisateurs, color: '#00ff88', bg: 'rgba(0,255,136,0.08)' },
          { icon: '⚽', label: 'Matchs', value: statsGlobales.totalMatchs, color: '#FFD700', bg: 'rgba(255,215,0,0.08)' },
          { icon: '🏆', label: 'Points distribués', value: statsGlobales.totalPoints, color: '#FF3B3B', bg: 'rgba(255,59,59,0.08)' },
        ].map((stat, idx) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: idx * 0.1 }}
            style={{
              background: 'var(--color-surface-card)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-md)',
              padding: 'clamp(10px, 2vw, 14px)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              textAlign: 'center',
              gap: 6,
              boxShadow: 'var(--shadow-sm)',
            }}
          >
            <div style={{
              width: 36,
              height: 36,
              borderRadius: 'var(--radius-md)',
              background: stat.bg,
              color: stat.color,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.1rem',
              flexShrink: 0,
            }}>
              {stat.icon}
            </div>
            <div style={{
              fontFamily: 'var(--font-outfit)',
              fontSize: 'clamp(1rem, 3vw, 1.2rem)',
              fontWeight: 900,
              color: stat.color,
              lineHeight: 1,
            }}>
              {stat.value.toLocaleString()}
            </div>
            <div style={{
              fontSize: '0.65rem',
              color: 'var(--color-text-muted)',
              fontWeight: 600,
            }}>
              {stat.label}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Top Équipes */}
      {topEquipes.length > 0 && (
        <motion.div
          className="card"
          style={{ padding: 20 }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
            <Award size={20} color="var(--color-accent)" />
            <h3 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--color-text-primary)' }}>
              Top Équipes
            </h3>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {topEquipes.slice(0, 5).map((equipe, idx) => (
              <div
                key={equipe.nom}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: '10px 14px',
                  background: 'var(--color-surface)',
                  borderRadius: 12,
                  border: '1px solid var(--color-border)',
                }}
              >
                <div style={{
                  width: 32,
                  height: 32,
                  borderRadius: '50%',
                  background: idx < 3 ? 'var(--gradient-green)' : 'var(--color-surface-elevated)',
                  color: idx < 3 ? '#0a0f0d' : 'var(--color-text-secondary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 900,
                  fontSize: '0.85rem',
                  flexShrink: 0,
                }}>
                  {idx + 1}
                </div>
                {equipe.logo_url ? (
                  <img
                    src={equipe.logo_url}
                    alt=""
                    style={{ width: 28, height: 28, borderRadius: 8, objectFit: 'cover', flexShrink: 0 }}
                  />
                ) : (
                  <div style={{
                    width: 28,
                    height: 28,
                    borderRadius: 8,
                    background: 'var(--gradient-green)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 800,
                    fontSize: '0.75rem',
                    color: '#0a0f0d',
                    flexShrink: 0,
                  }}>
                    {equipe.nom.charAt(0)}
                  </div>
                )}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 700, fontSize: '0.85rem' }}>
                    {equipe.nom}
                  </div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)' }}>
                    {equipe.matchs_joues} matchs
                  </div>
                </div>
                <div style={{
                  fontFamily: 'var(--font-outfit)',
                  fontWeight: 900,
                  fontSize: '0.9rem',
                  color: 'var(--color-accent)',
                }}>
                  {equipe.points_classement}
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}
      <style>{`
        @media (max-width: 767px) {
          .dashboard-top-pronostiqueurs {
            display: block !important;
          }
        }
      `}</style>
    </section>
  )
}
