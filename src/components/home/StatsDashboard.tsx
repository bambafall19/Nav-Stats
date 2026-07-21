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
    <section style={{ marginBottom: 32 }}>
      {/* Stats Overview Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12, marginBottom: 24 }}>
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
              borderRadius: 16,
              padding: 16,
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              boxShadow: 'var(--shadow-sm)',
            }}
          >
            <div style={{
              width: 48,
              height: 48,
              borderRadius: 14,
              background: stat.bg,
              color: stat.color,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.5rem',
              flexShrink: 0,
            }}>
              {stat.icon}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{
                fontFamily: 'var(--font-outfit)',
                fontSize: '1.4rem',
                fontWeight: 900,
                color: stat.color,
                lineHeight: 1,
              }}>
                {stat.value.toLocaleString()}
              </div>
              <div style={{
                fontSize: '0.72rem',
                color: 'var(--color-text-muted)',
                fontWeight: 600,
                marginTop: 2,
              }}>
                {stat.label}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Top Pronostiqueurs */}
      {topPronostiqueurs.length > 0 && (
        <motion.div
          className="card"
          style={{ padding: 20, marginBottom: 16 }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
            <TrendingUp size={20} color="var(--color-primary)" />
            <h3 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--color-text-primary)' }}>
              Top Pronostiqueurs
            </h3>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {topPronostiqueurs.slice(0, 5).map((user, idx) => (
              <div
                key={user.username}
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
                {user.avatar_url ? (
                  <img
                    src={user.avatar_url}
                    alt=""
                    style={{ width: 32, height: 32, borderRadius: '50%', objectFit: 'cover' }}
                  />
                ) : (
                  <div style={{
                    width: 32,
                    height: 32,
                    borderRadius: '50%',
                    background: 'var(--gradient-green)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 700,
                    color: '#0a0f0d',
                  }}>
                    {user.username.charAt(0).toUpperCase()}
                  </div>
                )}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 700, fontSize: '0.85rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {user.username}
                  </div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)' }}>
                    {user.accuracy}% réussite
                  </div>
                </div>
                <div style={{
                  fontFamily: 'var(--font-outfit)',
                  fontWeight: 900,
                  fontSize: '0.9rem',
                  color: 'var(--color-primary)',
                }}>
                  {user.points}
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

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
                    style={{ width: 32, height: 32, borderRadius: 8, objectFit: 'cover' }}
                  />
                ) : (
                  <div style={{
                    width: 32,
                    height: 32,
                    borderRadius: 8,
                    background: 'var(--gradient-green)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 800,
                    color: '#0a0f0d',
                  }}>
                    {equipe.nom.charAt(0)}
                  </div>
                )}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 700, fontSize: '0.85rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
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
    </section>
  )
}