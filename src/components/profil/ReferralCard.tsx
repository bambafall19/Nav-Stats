'use client'

import { useEffect, useState } from 'react'
import { Copy, Check, Gift } from 'lucide-react'

interface Parrainage {
  id: string
  username: string
  avatar_url: string | null
  points: number
  created_at: string
}

interface ReferralData {
  code: string | null
  pointsTotal: number
  parrainages: Parrainage[]
}

export default function ReferralCard() {
  const [data, setData] = useState<ReferralData | null>(null)
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    let active = true
    fetch('/api/referral')
      .then((res) => (res.ok ? res.json() : null))
      .then((json: ReferralData | null) => {
        if (active && json) setData(json)
      })
      .catch(() => {})
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
    }
  }, [])

  const link = data?.code
    ? `https://navestats.site/auth/register?ref=${encodeURIComponent(data.code)}`
    : null

  const copyCode = async () => {
    if (!data?.code) return
    try {
      await navigator.clipboard.writeText(data.code)
      setCopied(true)
      setTimeout(() => setCopied(false), 1800)
    } catch {
      // fallback
    }
  }

  const shareWhatsApp = () => {
    if (!link || !data?.code) return
    const text = encodeURIComponent(
      `Rejoins-moi sur NavéStats 🏆 Pronostique les matchs des Navétanes de Khombole et gagne des points ! Code de parrainage : ${data.code}`
    )
    window.open(`https://wa.me/?text=${text}%20${encodeURIComponent(link)}`, '_blank')
  }

  return (
    <div style={{
      background: 'var(--gradient-hero)',
      borderRadius: 'var(--radius-lg)',
      padding: 20,
      color: 'white',
      boxShadow: 'var(--shadow-green)',
      position: 'relative',
      overflow: 'hidden',
    }}>
      <div style={{ position: 'absolute', top: -30, right: -10, fontSize: 90, opacity: 0.1 }}>🎁</div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
        <Gift size={16} color="var(--color-accent)" />
        <div style={{ fontWeight: 800, fontSize: '0.95rem', letterSpacing: '-0.01em' }}>
          Parraine un ami, gagne des points
        </div>
      </div>
      <p style={{ margin: 0, fontSize: '0.78rem', opacity: 0.85, lineHeight: 1.5 }}>
        À chaque ami inscrit avec ton code, tu gagnes <strong>+10 points</strong> au classement des pronostiqueurs.
      </p>

      {!loading && data?.code && (
        <>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            marginTop: 14,
            background: 'rgba(255,255,255,0.14)',
            border: '1px solid rgba(255,255,255,0.2)',
            borderRadius: 12,
            padding: '10px 12px',
          }}>
            <span style={{
              fontFamily: 'var(--font-mono)',
              fontWeight: 800,
              fontSize: '1.05rem',
              letterSpacing: '0.08em',
              flex: 1,
            }}>
              {data.code}
            </span>
            <button
              type="button"
              onClick={copyCode}
              aria-label="Copier le code"
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 5,
                background: 'var(--color-accent)',
                border: 'none', color: '#04120d',
                fontWeight: 800, fontSize: '0.72rem',
                borderRadius: 9, padding: '7px 11px',
                cursor: 'pointer',
              }}
            >
              {copied ? <Check size={14} /> : <Copy size={14} />}
              {copied ? 'Copié !' : 'Copier'}
            </button>
          </div>

          <div style={{ display: 'flex', gap: 8, marginTop: 10, flexWrap: 'wrap' }}>
            <button
              type="button"
              onClick={shareWhatsApp}
              style={{
                flex: 1, minWidth: 160,
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 7,
                background: '#25D366',
                border: 'none', color: '#04120d',
                fontWeight: 800, fontSize: '0.78rem',
                borderRadius: 10, padding: '9px 12px',
                cursor: 'pointer',
              }}
            >
              ⚡ Partager sur WhatsApp
            </button>
            <a
              href={link || '#'}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                flex: 1, minWidth: 160,
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 7,
                background: 'rgba(255,255,255,0.14)',
                border: '1px solid rgba(255,255,255,0.22)',
                color: 'white', textDecoration: 'none',
                fontWeight: 700, fontSize: '0.78rem',
                borderRadius: 10, padding: '9px 12px',
              }}
            >
              🔗 Lien de parrainage
            </a>
          </div>

          {data.parrainages.length > 0 && (
            <div style={{ marginTop: 14, borderTop: '1px solid rgba(255,255,255,0.16)', paddingTop: 12 }}>
              <div style={{ fontSize: '0.72rem', opacity: 0.85, fontWeight: 600, marginBottom: 8 }}>
                {data.parrainages.length} ami(s) parrainé(s) · {data.pointsTotal} points gagnés
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {data.parrainages.slice(0, 5).map((p) => (
                  <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.75rem' }}>
                    {p.avatar_url ? (
                      <img
                        src={p.avatar_url}
                        alt=""
                        style={{ width: 22, height: 22, borderRadius: '50%', objectFit: 'cover' }}
                      />
                    ) : (
                      <div style={{
                        width: 22, height: 22, borderRadius: '50%',
                        background: 'rgba(255,255,255,0.2)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.6rem',
                      }}>
                        👤
                      </div>
                    )}
                    <span style={{ fontWeight: 600, flex: 1 }}>{p.username}</span>
                    <span style={{ opacity: 0.85 }}>+{p.points} pts</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {!loading && !data?.code && (
        <p style={{ marginTop: 12, fontSize: '0.75rem', opacity: 0.85 }}>
          Connecte-toi pour générer ton code de parrainage.
        </p>
      )}
    </div>
  )
}
