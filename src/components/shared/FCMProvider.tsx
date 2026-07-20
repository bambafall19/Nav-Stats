'use client'

import { useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { requestFCMToken, onMessageListener } from '@/lib/firebase/client'

export function FCMProvider() {
  const supabase = createClient()

  useEffect(() => {
    const initFCM = async () => {
      // 1. Demander la permission et récupérer le token
      if (typeof window !== 'undefined' && 'Notification' in window) {
        if (Notification.permission === 'granted') {
          await saveToken()
        } else if (Notification.permission !== 'denied') {
          const permission = await Notification.requestPermission()
          if (permission === 'granted') {
            await saveToken()
          }
        }
      }
    }

    const saveToken = async () => {
      try {
        const token = await requestFCMToken()
        if (token) {
          const { data: { user } } = await supabase.auth.getUser()
          if (user) {
            // Sauvegarder dans fcm_tokens (avec conflit sur user_id + token ignoré ou upserté)
            await supabase.from('fcm_tokens').upsert(
              { user_id: user.id, token: token } as any,
              { onConflict: 'user_id, token' }
            )
          }
        }
      } catch (e) {
        console.error("Erreur lors de la sauvegarde du token FCM", e)
      }
    }

    // N'exécuter que si les variables d'environnement sont présentes
    if (process.env.NEXT_PUBLIC_FIREBASE_API_KEY) {
      initFCM()

      // 2. Écouter les messages au premier plan
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const unsubscribe = onMessageListener((payload: any) => {
        console.log("Nouvelle notification reçue au premier plan:", payload)
        // Vous pourrez brancher ici votre système de Toast ou NotificationCenter interne
      })

      return () => {
        if (unsubscribe) unsubscribe()
      }
    }
  }, [supabase])

  return null
}
