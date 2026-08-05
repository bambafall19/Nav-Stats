'use client'

import { Swords } from 'lucide-react'
import ScoreboardPanel from '@/components/shared/ScoreboardPanel'

interface HeadToHeadMatch {
  id: string
  date_match: string
  score_a: number | null
  score_b: number | null
  statut: string
  equipe_a: { id: string; nom: string; sigle: string | null; couleur_principale: string }
  equipe_b: { id: string; nom: string; sigle: string | null; couleur_principale: string }
}

interface HeadToHeadProps {
  matchs: HeadToHeadMatch[]
  equipeAId: string
  equipeBId: string
  equipeANom: string
  equipeBNom: string
}

function getResult(m: HeadToHeadMatch, focusTeamId: string): 'win' | 'draw' | 'loss' | null {
  if (m.statut !== 'termine' || m.score_a === null || m.score_b === null) return null
  const isA = m.equipe_a.id === focusTeamId
  const scoreFor = isA ? m.score_a : m.score_b
  const scoreAgainst = isA ? m.score_b : m.score_a
  if (scoreFor > scoreAgainst) return 'win'
  if (scoreFor < scoreAgainst) return 'loss'
  return 'draw'
}

const RESULT_STYLE: Record<string, { color: string; bg: string; border: string; label: string }> = {
  win: { color: 'var(--color-primary)', bg: 'rgba(42,255,160,0.12)', border: 'rgba(42,255,160,0.35)', label: 'V' },
  draw: { color: 'var(--color-accent)', bg: 'rgba(255,201,77,0.12)', border: 'rgba(255,201,77,0.35)', label: 'N' },
  loss: { color: 'var(--color-red)', bg: 'rgba(255,77,90,0.12)', border: 'rgba(255,77,90,0.35)', label: 'D' },
}

function TeamSigle({ nom, sigle, color }: { nom: string; sigle: string | null; color: string }) {
  return (
    <div style={{
      width: 28, height: 28, borderRadius: 9, flexShrink: 0,
      background: `linear-gradient(135deg, ${color || '#0dca6b'}, ${color ? color + '99' : '#ffc94d'})`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: 9, fontWeight: 800, color: 'white',
      fontFamily: 'var(--font-plus-jakarta)',
      boxShadow: '0 3px 8px rgba(0,0,0,0.25)',
    }}>
      {sigle || nom.charAt(0)}
    </div>
  )
}

export default function HeadToHead({ matchs, equipeAId, equipeANom, equipeBNom }: HeadToHeadProps) {
  const headerIcon = <Swords size={14} color="var(--color-primary)" />

  if (!matchs || matchs.length === 0) {
    return (
      <ScoreboardPanel title="Historique des confrontations" icon={headerIcon}>
        <div style={{ textAlign: 'center', padding: '20px 0' }}>
          <div style={{
            width: 44, height: 44, borderRadius: 14,
            background: 'var(--color-bg-secondary)', border: '1px solid var(--color-border-subtle)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 12px',
          }}>
            <Swords size={19} color="var(--color-text-muted)" />
          </div>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.82rem' }}>
            Aucune confrontation précédente enregistrée.
          </p>
        </div>
      </ScoreboardPanel>
    )
  }

  let wins = 0, draws = 0, losses = 0
  matchs.forEach(m => {
    const r = getResult(m, equipeAId)
    if (r === 'win') wins++
    else if (r === 'draw') draws++
    else if (r === 'loss') losses++
  })
  const total = wins + draws + losses

  return (
    <ScoreboardPanel
      title="Historique des confrontations"
      icon={headerIcon}
      right={<span style={{
        fontFamily: 'var(--font-mono)', fontSize: '0.58rem', fontWeight: 700,
        color: 'var(--color-primary)', letterSpacing: '0.04em', whiteSpace: 'nowrap',
        padding: '3px 9px', borderRadius: 999,
        background: 'rgba(42,255,160,0.1)', border: '1px solid rgba(42,255,160,0.18)',
      }}>{total} MATCH{total > 1 ? 'S' : ''}</span>}
    >
      {/* Summary */}
      {total > 0 && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr auto 1fr',
          gap: 8,
          marginBottom: 16,
          textAlign: 'center',
        }}>
          <div style={{
            background: 'var(--gradient-green-soft)',
            borderRadius: 'var(--radius-md)',
            padding: '14px 10px',
            border: '1px solid rgba(42,255,160,0.16)',
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
          }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 900, fontSize: '1.7rem', color: 'var(--color-primary)', lineHeight: 1 }}>{wins}</div>
            <div style={{ fontSize: '0.6rem', color: 'var(--color-text-muted)', fontWeight: 700 }}>Victoires<br />{equipeANom}</div>
          </div>
          <div style={{
            background: 'var(--color-bg-secondary)',
            borderRadius: 'var(--radius-md)',
            padding: '14px 12px',
            border: '1px solid var(--color-border-subtle)',
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 4,
          }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 900, fontSize: '1.2rem', color: 'var(--color-accent)', lineHeight: 1 }}>{draws}</div>
            <div style={{ fontSize: '0.6rem', color: 'var(--color-text-muted)', fontWeight: 700 }}>Nuls</div>
          </div>
          <div style={{
            background: 'linear-gradient(135deg, rgba(255,77,90,0.08), rgba(255,77,90,0.02))',
            borderRadius: 'var(--radius-md)',
            padding: '14px 10px',
            border: '1px solid rgba(255,77,90,0.16)',
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
          }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 900, fontSize: '1.7rem', color: 'var(--color-red)', lineHeight: 1 }}>{losses}</div>
            <div style={{ fontSize: '0.6rem', color: 'var(--color-text-muted)', fontWeight: 700 }}>Victoires<br />{equipeBNom}</div>
          </div>
        </div>
      )}

      {/* Match list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {matchs.map(m => {
          const result = getResult(m, equipeAId)
          const resStyle = RESULT_STYLE[result ?? 'draw']

          return (
            <div key={m.id} className="h2h-row" style={{
              display: 'grid',
              gridTemplateColumns: '1fr auto 1fr auto',
              gap: 10,
              alignItems: 'center',
              padding: '9px 12px',
              background: 'var(--color-bg-secondary)',
              borderRadius: 'var(--radius-md)',
              fontSize: '0.76rem',
              border: '1px solid var(--color-border-subtle)',
              transition: 'border-color 0.15s',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
                <TeamSigle nom={m.equipe_a.nom} sigle={m.equipe_a.sigle} color={m.equipe_a.couleur_principale} />
                <span style={{ fontWeight: 700, color: result === 'win' ? 'var(--color-primary)' : 'var(--color-text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {m.equipe_a.sigle || m.equipe_a.nom}
                </span>
              </div>
              <div style={{
                fontFamily: 'var(--font-mono)', fontWeight: 900, color: 'var(--color-text-primary)',
                textAlign: 'center', minWidth: 52, background: 'var(--color-surface-elevated)',
                borderRadius: 9, padding: '4px 10px', border: '1px solid var(--color-border-subtle)',
              }}>
                {m.statut === 'termine' ? `${m.score_a} – ${m.score_b}` : '- – -'}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'flex-end', minWidth: 0 }}>
                <span style={{ fontWeight: 700, color: result === 'loss' ? 'var(--color-red)' : 'var(--color-text-primary)', textAlign: 'right', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {m.equipe_b.sigle || m.equipe_b.nom}
                </span>
                <TeamSigle nom={m.equipe_b.nom} sigle={m.equipe_b.sigle} color={m.equipe_b.couleur_principale} />
              </div>
              <div style={{
                width: 26, height: 26, borderRadius: 9, flexShrink: 0,
                background: resStyle.bg,
                color: resStyle.color,
                border: `1px solid ${resStyle.border}`,
                fontWeight: 900, fontSize: '0.72rem',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: 'var(--font-mono)',
              }}>
                {resStyle.label}
              </div>
            </div>
          )
        })}
      </div>

      <div style={{ marginTop: 10, fontSize: '0.64rem', color: 'var(--color-text-muted)', textAlign: 'center' }}>
        V = Victoire {equipeANom} · N = Nul · D = Défaite {equipeANom}
      </div>

      <style>{`
        .h2h-row:hover { border-color: rgba(42,255,160,0.25); }
      `}</style>
    </ScoreboardPanel>
  )
}
