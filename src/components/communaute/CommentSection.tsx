'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Database } from '@/types/database.types'
import CommunityReactionButton from './CommunityReactionButton'

type Commentaire = Database['public']['Tables']['commentaires']['Row'] & {
  user?: Database['public']['Tables']['profiles']['Row']
}

export default function CommentSection({ matchId, userId }: { matchId: string; userId: string | null }) {
  const [commentaires, setCommentaires] = useState<Commentaire[]>([])
  const [contenu, setContenu] = useState('')
  const [loading, setLoading] = useState(false)
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
    if (data) setCommentaires(data as any)
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
    <div className="card" style={{ padding: 24 }}>
      <h3 style={{ fontWeight: 800, fontSize: '1.1rem', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
        💬 Commentaires <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', fontWeight: 400 }}>({commentaires.length})</span>
      </h3>

      {/* Form */}
      {userId ? (
        <form onSubmit={handleSubmit} style={{ marginBottom: 24 }}>
          <div style={{ display: 'flex', gap: 10 }}>
            <textarea
              value={contenu}
              onChange={e => setContenu(e.target.value)}
              placeholder="Partagez votre analyse..."
              className="input"
              rows={2}
              style={{ resize: 'vertical', flex: 1 }}
              id="comment-input"
            />
            <button
              type="submit"
              disabled={loading || !contenu.trim()}
              className="btn btn-primary"
              style={{ alignSelf: 'flex-end', opacity: !contenu.trim() ? 0.6 : 1 }}
              id="submit-comment"
            >
              {loading ? '⏳' : '📤'}
            </button>
          </div>
        </form>
      ) : (
        <div style={{ padding: '14px 18px', background: 'var(--color-surface)', borderRadius: 'var(--radius-md)', marginBottom: 24, textAlign: 'center', fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>
          <a href="/auth/login" style={{ color: 'var(--color-primary)', fontWeight: 600, textDecoration: 'none' }}>Connectez-vous</a> pour commenter
        </div>
      )}

      {/* Comments list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {commentaires.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 32, color: 'var(--color-text-muted)' }}>
            <div style={{ fontSize: '2rem', marginBottom: 8 }}>💬</div>
            <p style={{ fontSize: '0.875rem' }}>Soyez le premier à commenter !</p>
          </div>
        ) : (
          commentaires.map(c => (
            <div key={c.id} style={{ display: 'flex', gap: 12 }}>
              <div className="avatar" style={{ width: 36, height: 36, fontSize: '0.8rem', flexShrink: 0 }}>
                {c.user?.avatar_url
                  ? <img src={c.user.avatar_url} alt="" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                  : (c.user?.username || '?').charAt(0).toUpperCase()
                }
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', gap: 8, alignItems: 'baseline', marginBottom: 4 }}>
                  <span style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--color-text-primary)' }}>
                    {c.user?.username || 'Utilisateur'}
                  </span>
                  <span style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)' }}>
                    {new Date(c.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <p style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', lineHeight: 1.5 }}>{c.contenu}</p>
                <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                  <CommunityReactionButton commentId={c.id} initialLikes={c.likes || 0} />
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
