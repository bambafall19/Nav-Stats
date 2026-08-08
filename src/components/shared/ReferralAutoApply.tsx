'use client'

import { useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

const PENDING_KEY = 'navestats_pending_ref'

export function ReferralAutoApply() {
  useEffect(() => {
    let active = true

    ;(async () => {
      let code: string | null = null
      try {
        code = localStorage.getItem(PENDING_KEY)
      } catch {
        return
      }
      if (!code) return

      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) return

      try {
        const res = await fetch('/api/referral', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ code }),
        })
        if (res.ok && active) {
          try {
            localStorage.removeItem(PENDING_KEY)
          } catch {
            // ignore
          }
        }
      } catch {
        // réessayé au prochain chargement
      }
    })()

    return () => {
      active = false
    }
  }, [])

  return null
}
