'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Trophy, Users, LogIn, UserPlus, Plus, Copy, Check, ChevronLeft, Crown, LinkIcon } from 'lucide-react'
import type { Database } from '@/types/database.types'

type Ligue = Database['public']['Tables']['mini_ligues']['Row']
type Membre = {
  user_id: string
  username: string | null
  full_name: string | null
  points: number
}

const CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'

function generateCode() {
  let code = ''
  for (let i = 0; i < 6; i++) code += CHARS[Math.floor(Math.random() * CHARS.length)]
  return code
}

export default function LiguesPage() {
  const supabase = createClient() as any // eslint-disable-line @typescript-eslint/no-explicit-any
  const [user, setUser] = useState<{ id: string } | null>(null)
  const [loading, setLoading] = useState(true)
  const [leagues, setLeagues] = useState<Ligue[]>([])
  const [creating, setCreating] = useState(false)
  const [joining, setJoining] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  const [showCreate, setShowCreate] = useState(false)
  const [nom, setNom] = useState('')
  const [description, setDescription] = useState('')

  const [joinCode, setJoinCode] = useState('')
  const [detail, setDetail] = useState<{ ligue: Ligue; membres: Membre[] } | null>(null)
  const [detailLoading, setDetailLoading] = useState(false)

  const [copied, setCopied] = useState('')

  const loadLeagues = useCallback(async (userId: string) => {
    const { data: memberships } = await supabase
      .from('mini_ligue_members')
      .select('ligue_id')
      .eq('user_id', userId)

    const ids = (memberships || []).map((m: { ligue_id: string }) => m.ligue_id)

    const { data: created } = await supabase
      .from('mini_ligues')
      .select('*')
      .eq('createur_id', userId)
      .order('created_at', { ascending: false })

    const { data: joined } = ids.length
      ? await supabase.from('mini_ligues').select('*').in('id', ids).order('created_at', { ascending: false })
      : { data: [] }

    const merged = new Map<string, Ligue>()
    ;[...(created || []), ...(joined || [])].forEach((l: Ligue) => merged.set(l.id, l))
    setLeagues(Array.from(merged.values()))
  }, [supabase])

  useEffect(() => {
    let active = true
    ;(async () => {
      const { data: { user: u } } = await supabase.auth.getUser()
      if (!active) return
      if (u) {
        setUser({ id: u.id })
        await loadLeagues(u.id)
      }
      setLoading(false)
    })()
    return () => { active = false }
  }, [supabase, loadLeagues])

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (!nom.trim()) { setError('Donnez un nom à votre ligue.'); return }
    setCreating(true)
    const code = generateCode()
    const { data, error: err } = await supabase
      .from('mini_ligues')
      .insert({ nom: nom.trim(), description: description.trim() || null, code_invitation: code, is_public: true, createur_id: user?.id })
      .select()
      .single()
    if (err) {
      setError('Impossible de créer la ligue. Réessayez.')
      setCreating(false)
      return
    }
    if (user && data) {
      await supabase.from('mini_ligue_members').insert({ ligue_id: data.id, user_id: user.id })
    }
    setCreating(false)
    setShowCreate(false)
    setNom('')
    setDescription('')
    if (user) await loadLeagues(user.id)
    setMessage('Ligue créée ! Partagez le code d\'invitation à vos amis.')
  }

  async function handleJoin(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setMessage('')
    if (!joinCode.trim()) { setError('Entrez un code d\'invitation.'); return }
    setJoining(true)
    const { error: err } = await supabase.rpc('join_mini_ligue', { p_code: joinCode.trim().toUpperCase() })
    if (err) {
      setError('Code invalide. Vérifiez et réessayez.')
      setJoining(false)
      return
    }
    setJoining(false)
    setJoinCode('')
    if (user) await loadLeagues(user.id)
    setMessage('Bienvenue dans la ligue !')
  }

  async function openDetail(l: Ligue) {
    setDetailLoading(true)
    const { data: membres } = await supabase
      .from('mini_ligue_members')
      .select('user_id, profile:profiles!mini_ligue_members_user_id_fkey(username, full_name, points)')
      .eq('ligue_id', l.id)

    const rows = (membres || []) as Array<{ user_id: string; profile: { username: string | null; full_name: string | null; points: number | null } | null }>
    const ranked: Membre[] = rows
      .map(m => ({
        user_id: m.user_id,
        username: m.profile?.username || null,
        full_name: m.profile?.full_name || null,
        points: m.profile?.points || 0,
      }))
      .sort((a, b) => b.points - a.points)

    setDetail({ ligue: l, membres: ranked })
    setDetailLoading(false)
  }

  async function copyCode(code: string) {
    try {
      await navigator.clipboard.writeText(code)
      setCopied(code)
      setTimeout(() => setCopied(''), 1500)
    } catch {
      // clipboard non disponible
    }
  }

  if (loading) {
    return (
      <div className="page-content">
        <div className="container-app" style={{ paddingTop: 40, textAlign: 'center', color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>
          Chargement...
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="page-content">
        <div className="container-app" style={{ paddingTop: 28 }}>
          <div className="card" style={{ padding: 40, textAlign: 'center', maxWidth: 480, margin: '0 auto' }}>
            <div style={{
              width: 60, height: 60, borderRadius: 18,
              background: 'var(--gradient-green-soft)', border: '1px solid rgba(42,255,160,0.25)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px',
            }}>
              <Trophy size={28} color="var(--color-primary)" />
            </div>
            <h2 style={{ fontSize: '1.3rem', marginBottom: 8, fontFamily: 'var(--font-plus-jakarta)', fontWeight: 800 }}>Ligues privées</h2>
            <p style={{ color: 'var(--color-text-secondary)', marginBottom: 22, fontSize: '0.88rem' }}>
              Créez ou rejoignez une ligue avec vos amis et défiez-les sur le classement des pronostics !
            </p>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link href="/auth/login?redirect=%2Fligues" className="btn btn-primary" style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 7 }}>
                <LogIn size={15} /> Connexion
              </Link>
              <Link href="/auth/register?redirect=%2Fligues" className="btn btn-outline" style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 7 }}>
                <UserPlus size={15} /> S&apos;inscrire
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (detail) {
    const myRank = detail.membres.findIndex(m => m.user_id === user.id) + 1
    return (
      <div className="page-content">
        <div className="container-app" style={{ paddingTop: 28, maxWidth: 560 }}>
          <button
            onClick={() => setDetail(null)}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 6, cursor: 'pointer',
              background: 'none', border: 'none', color: 'var(--color-primary)',
              fontSize: '0.82rem', fontWeight: 700, fontFamily: 'var(--font-plus-jakarta)',
              padding: '6px 0', marginBottom: 16,
            }}
          >
            <ChevronLeft size={16} /> Retour aux ligues
          </button>

          <div className="card" style={{ padding: '24px 22px', marginBottom: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
              <div style={{
                width: 48, height: 48, borderRadius: 15,
                background: 'var(--gradient-green)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: 'var(--shadow-green)', flexShrink: 0,
              }}>
                <Trophy size={22} color="white" />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <h1 style={{ fontSize: '1.2rem', fontWeight: 800, fontFamily: 'var(--font-plus-jakarta)', margin: 0 }}>{detail.ligue.nom}</h1>
                <div style={{ fontSize: '0.74rem', color: 'var(--color-text-secondary)', marginTop: 2 }}>
                  {detail.membres.length} membre{detail.membres.length > 1 ? 's' : ''} · Votre rang : <span style={{ fontWeight: 800, color: 'var(--color-accent)', fontFamily: 'var(--font-mono)' }}>#{myRank}</span>
                </div>
              </div>
            </div>

            {detail.ligue.description && (
              <p style={{ fontSize: '0.82rem', color: 'var(--color-text-secondary)', marginTop: 12 }}>{detail.ligue.description}</p>
            )}

            <button
              onClick={() => copyCode(detail.ligue.code_invitation)}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 7, cursor: 'pointer',
                marginTop: 14, padding: '9px 14px', borderRadius: 'var(--radius-md)',
                background: 'var(--color-bg-secondary)', border: '1px dashed var(--color-border)',
                color: 'var(--color-text-primary)', fontSize: '0.78rem', fontWeight: 700,
                fontFamily: 'var(--font-mono)',
              }}
            >
              {copied === detail.ligue.code_invitation ? <Check size={14} color="var(--color-primary)" /> : <Copy size={14} />}
              {copied === detail.ligue.code_invitation ? 'Copié !' : detail.ligue.code_invitation}
            </button>
          </div>

          {detailLoading ? (
            <div className="card" style={{ padding: 32, textAlign: 'center', color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>Chargement du classement...</div>
          ) : (
            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
              <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--color-border-subtle)', display: 'flex', alignItems: 'center', gap: 8 }}>
                <Users size={16} color="var(--color-primary)" />
                <span style={{ fontWeight: 800, fontSize: '0.9rem', fontFamily: 'var(--font-plus-jakarta)' }}>Classement de la ligue</span>
              </div>
              <div style={{ padding: '6px 12px' }}>
                {detail.membres.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: 24, color: 'var(--color-text-muted)', fontSize: '0.84rem' }}>Aucun membre pour le moment.</div>
                ) : (
                  detail.membres.map((m, i) => (
                    <Link key={m.user_id} href={`/profil/${m.user_id}`} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '11px 8px', textDecoration: 'none', color: 'var(--color-text-primary)', borderRadius: 'var(--radius-md)' }}>
                      <div style={{
                        width: 26, height: 26, borderRadius: 8, flexShrink: 0,
                        background: i === 0 ? 'rgba(255,201,77,0.18)' : 'var(--color-bg-secondary)',
                        border: '1px solid var(--color-border-subtle)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '0.7rem', fontWeight: 800, fontFamily: 'var(--font-mono)',
                        color: i === 0 ? 'var(--color-accent)' : 'var(--color-text-muted)',
                      }}>
                        {i === 0 ? <Crown size={13} /> : i + 1}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: 700, fontSize: '0.84rem', fontFamily: 'var(--font-plus-jakarta)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {m.full_name || m.username || 'Joueur'}
                          {m.user_id === user.id && <span style={{ fontSize: '0.62rem', color: 'var(--color-primary)', marginLeft: 6 }}>vous</span>}
                        </div>
                      </div>
                      <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 800, fontSize: '0.85rem', color: 'var(--color-primary)', flexShrink: 0 }}>{m.points} pts</div>
                    </Link>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="page-content">
      <div className="container-app" style={{ paddingTop: 28, maxWidth: 560 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
          <div style={{
            width: 46, height: 46, borderRadius: 14,
            background: 'var(--gradient-green)', display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: 'var(--shadow-green)', flexShrink: 0,
          }}>
            <Trophy size={22} color="white" />
          </div>
          <div>
            <h1 style={{ fontSize: '1.25rem', fontWeight: 800, fontFamily: 'var(--font-plus-jakarta)', margin: 0 }}>Mes ligues</h1>
            <div style={{ fontSize: '0.74rem', color: 'var(--color-text-secondary)', marginTop: 1 }}>Défiez vos amis sur les pronostics</div>
          </div>
        </div>

        {message && (
          <div style={{ padding: '11px 14px', borderRadius: 'var(--radius-md)', background: 'rgba(42,255,160,0.08)', border: '1px solid rgba(42,255,160,0.25)', marginBottom: 16, fontSize: '0.8rem', color: 'var(--color-primary-dark)', fontWeight: 700 }}>
            {message}
          </div>
        )}

        {/* Rejoindre */}
        <form onSubmit={handleJoin} className="card" style={{ padding: 18, marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
            <LinkIcon size={15} color="var(--color-primary)" />
            <span style={{ fontWeight: 800, fontSize: '0.88rem', fontFamily: 'var(--font-plus-jakarta)' }}>Rejoindre avec un code</span>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <input
              value={joinCode}
              onChange={e => setJoinCode(e.target.value.toUpperCase())}
              placeholder="CODE123"
              maxLength={12}
              style={{
                flex: 1, padding: '11px 14px', borderRadius: 'var(--radius-md)',
                border: '1px solid var(--color-border)', background: 'var(--color-surface-card)',
                fontSize: '0.9rem', color: 'var(--color-text-primary)',
                fontFamily: 'var(--font-mono)', fontWeight: 700, letterSpacing: '0.1em',
                textTransform: 'uppercase',
              }}
            />
            <button type="submit" disabled={joining} className="btn btn-primary" style={{ whiteSpace: 'nowrap' }}>
              {joining ? '...' : 'Rejoindre'}
            </button>
          </div>
          {error && <div style={{ marginTop: 10, fontSize: '0.78rem', color: 'var(--color-red)', fontWeight: 600 }}>{error}</div>}
        </form>

        {/* Créer */}
        {!showCreate ? (
          <button onClick={() => setShowCreate(true)} className="btn btn-outline" style={{ width: '100%', marginBottom: 24, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 7, padding: '13px' }}>
            <Plus size={16} /> Créer une ligue
          </button>
        ) : (
          <form onSubmit={handleCreate} className="card" style={{ padding: 18, marginBottom: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
              <Plus size={15} color="var(--color-primary)" />
              <span style={{ fontWeight: 800, fontSize: '0.88rem', fontFamily: 'var(--font-plus-jakarta)' }}>Nouvelle ligue</span>
            </div>
            <input
              value={nom}
              onChange={e => setNom(e.target.value)}
              placeholder="Nom de la ligue (ex : Les Khombole Boys)"
              maxLength={50}
              style={{
                width: '100%', padding: '11px 14px', borderRadius: 'var(--radius-md)',
                border: '1px solid var(--color-border)', background: 'var(--color-surface-card)',
                fontSize: '0.9rem', color: 'var(--color-text-primary)', marginBottom: 10,
              }}
            />
            <input
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Description (optionnel)"
              maxLength={120}
              style={{
                width: '100%', padding: '11px 14px', borderRadius: 'var(--radius-md)',
                border: '1px solid var(--color-border)', background: 'var(--color-surface-card)',
                fontSize: '0.9rem', color: 'var(--color-text-primary)', marginBottom: 14,
              }}
            />
            <div style={{ display: 'flex', gap: 10 }}>
              <button type="button" onClick={() => setShowCreate(false)} className="btn btn-outline" style={{ flex: 1 }}>Annuler</button>
              <button type="submit" disabled={creating} className="btn btn-primary" style={{ flex: 1 }}>
                {creating ? 'Création...' : 'Créer'}
              </button>
            </div>
          </form>
        )}

        {/* Liste */}
        <div style={{ display: 'grid', gap: 10 }}>
          {leagues.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '32px 20px', color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>
              Vous ne faites partie d&apos;aucune ligue pour le moment.
            </div>
          ) : (
            leagues.map(l => (
              <button
                key={l.id}
                onClick={() => openDetail(l)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 13, cursor: 'pointer', textAlign: 'left',
                  padding: '15px 16px', borderRadius: 'var(--radius-lg)',
                  background: 'var(--color-surface-card)', border: '1px solid var(--color-border-subtle)',
                  boxShadow: 'var(--shadow-card)', fontFamily: 'inherit',
                  transition: 'all var(--transition-base) var(--ease-out)',
                }}
              >
                <div style={{
                  width: 42, height: 42, borderRadius: 13, flexShrink: 0,
                  background: 'var(--gradient-green-soft)', border: '1px solid rgba(42,255,160,0.2)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <Users size={19} color="var(--color-primary)" />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 800, fontSize: '0.9rem', fontFamily: 'var(--font-plus-jakarta)', color: 'var(--color-text-primary)' }}>{l.nom}</div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', marginTop: 2, fontFamily: 'var(--font-mono)' }}>
                    Code : {l.code_invitation}
                  </div>
                </div>
                <span style={{ color: 'var(--color-text-muted)' }}>›</span>
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
