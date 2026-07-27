'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function CommunityReactionButton({ commentId, initialLikes }: { commentId: string; initialLikes: number }) {
  const [likes, setLikes] = useState(initialLikes || 0)
  const [busy, setBusy] = useState(false)
  // Supabase generated update typing is too narrow for this table in the current schema file.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase = createClient() as any

  async function handleClick() {
    if (busy) return
    const next = likes + 1
    setLikes(next)
    setBusy(true)
    const { error } = await supabase.from('commentaires').update({ likes: next }).eq('id', commentId)
    if (error) setLikes(likes)
    setBusy(false)
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={busy}
      aria-label="Aimer ce commentaire"
      style={{
        background: 'var(--color-surface)',
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-full)',
        padding: '3px 10px',
        cursor: busy ? 'wait' : 'pointer',
        fontSize: '0.8rem',
        fontWeight: 700,
        color: 'var(--color-text-secondary)',
      }}
    >
      ❤️ {likes}
    </button>
  )
}
