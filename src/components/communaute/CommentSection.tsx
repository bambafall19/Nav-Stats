'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Database } from '@/types/database.types'
import CommunityReactionButton from './CommunityReactionButton'
import ScoreboardPanel from '@/components/shared/ScoreboardPanel'
import { MessageCircle, Send, LogIn } from 'lucide-react'

type Commentaire = Database['public']['Tables']['commentaires']['Row'] & {
  user?: Database['public']['Tables']['profiles']['Row']
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return "à l'instant"
  if (mins < 60) return `${mins} min`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours} h`
  return new Date(dateStr).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })
}

export default function CommentSection({ matchId, userId }: { matchId: string; userId: string | null }) {
  const [commentaires, setCommentaires] = useState<Commentaire[]>([])
  const [contenu, setContenu] = useState('')
  const [loading, setLoading] = useState(false)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase = createClient() as any

  useEffect(() => {
    fetchCommentaires()
    const channel = supabase
      .channel(`comments-${matchId}`)
      .on('postgres_changes', {
        event: 'INSERT', schema: 'public', table: 'commentaires',
        filter: `match_id=eq.${matchId}`,
      }, () => fetchCommentaires())
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [matchId])

  async function fetchCommentaires() {
    const { data } = await supabase
      .from('commentaires')
      .select('*, user:profiles(*)')
      .eq('match_id', matchId)
      .is('parent_id', null)
      .order('created_at', { ascending: false })
      .limit(50)
    if (data) setCommentaires(data as any) // eslint-disable-line @typescript-eslint/no-explicit-any
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!contenu.trim() || !userId) return
    setLoading(true)
    await supabase.from('commentaires').insert({ match_id: matchId, user_id: userId, contenu: contenu.trim() })
    setContenu('')
    setLoading(false)
    fetchCommentaires()
  }

  return (
    <ScoreboardPanel
      title="Commentaires"
      icon={<MessageCircle size={14} color="var(--color-primary)" />}
      right={<span style={{
        fontFamily: 'var(--font-mono)', fontSize: '0.58rem', fontWeight: 700,
        color: 'var(--color-primary)', letterSpacing: '0.04em', whiteSpace: 'nowrap',
        padding: '3px 9px', borderRadius: 999,
        background: 'rgba(42,255,160,0.1)', border: '1px solid rgba(42,255,160,0.18)',
      }}>{commentaires.length} MSG</span>}
    >
      {/* Form */}
      {userId ? (
        <form onSubmit={handleSubmit} style={{ marginBottom: 22 }}>
          <div style={{ display: 'flex', gap: 10, alignItems: 'flex-end' }}>
            <textarea
              value={contenu}
              onChange={e => setContenu(e.target.value)}
              placeholder="Partagez votre analyse..."
              className="input"
              rows={2}
              style={{ resize: 'vertical', flex: 1, borderRadius: 'var(--radius-md)' }}
              id="comment-input"
            />
            <button
              type="submit"
              disabled={loading || !contenu.trim()}
              className="btn btn-primary"
              style={{
                alignSelf: 'flex-end', opacity: !contenu.trim() ? 0.6 : 1,
                width: 44, height: 44, padding: 0, display: 'flex',
                alignItems: 'center', justifyContent: 'center',
                borderRadius: 'var(--radius-md)',
                boxShadow: 'var(--shadow-green)',
              }}
              id="submit-comment"
            >
              <Send size={16} />
            </button>
          </div>
        </form>
      ) : (
        <div style={{ padding: '12px 16px', background: 'var(--color-bg-secondary)', border: '1px solid var(--color-border-subtle)', borderRadius: 'var(--radius-md)', marginBottom: 22, textAlign: 'center', fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>
          <a href="/auth/login" style={{ color: 'var(--color-primary)', fontWeight: 700, textDecoration: 'none' }}>
            <LogIn size={12} style={{ verticalAlign: -1 }} /> Connectez-vous
          </a>{' '} pour commenter ce match
        </div>
      )}

      {/* Comments list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {commentaires.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 28, color: 'var(--color-text-muted)' }}>
            <div style={{
              width: 46, height: 46, borderRadius: 14,
              background: 'var(--color-bg-secondary)', border: '1px solid var(--color-border-subtle)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 12px',
            }}>
              <MessageCircle size={20} color="var(--color-text-muted)" />
            </div>
            <p style={{ fontSize: '0.84rem' }}>Soyez le premier à commenter !</p>
          </div>
        ) : (
          commentaires.map(c => (
            <div key={c.id} style={{
              display: 'flex', gap: 12,
              padding: 14,
              background: 'var(--color-bg-secondary)',
              border: '1px solid var(--color-border-subtle)',
              borderRadius: 'var(--radius-md)',
              transition: 'border-color 0.15s',
            }}>
              <div className="avatar" style={{ width: 36, height: 36, fontSize: '0.8rem', flexShrink: 0 }}>
                {c.user?.avatar_url
                  ? <img src={c.user.avatar_url} alt="" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                  : (c.user?.username || '?').charAt(0).toUpperCase()
                }
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', gap: 8, alignItems: 'baseline', marginBottom: 5 }}>
                  <span style={{ fontWeight: 700, fontSize: '0.82rem', color: 'var(--color-text-primary)', fontFamily: 'var(--font-plus-jakarta)' }}>
                    {c.user?.username || 'Utilisateur'}
                  </span>
                  <span style={{ fontSize: '0.66rem', color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)' }}>
                    {timeAgo(c.created_at)}
                  </span>
                </div>
                <p style={{ fontSize: '0.84rem', color: 'var(--color-text-secondary)', lineHeight: 1.55, wordBreak: 'break-word' }}>{c.contenu}</p>
                <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                  <CommunityReactionButton commentId={c.id} initialLikes={c.likes || 0} />
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </ScoreboardPanel>
  )
}
