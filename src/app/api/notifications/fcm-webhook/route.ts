import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const admin = require('firebase-admin') as any

// Initialiser Firebase Admin s'il n'est pas déjà initialisé
if (!admin.apps?.length) {
  try {
    admin.initializeApp({
      credential: admin.credential?.cert?.({
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        // Remplace \n par de vrais sauts de ligne si passé en variable d'env
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      }),
    })
  } catch (error) {
    console.error('Erreur initialisation Firebase Admin:', error)
  }
}

export async function POST(req: Request) {
  try {
    const payload = await req.json()
    
    // Vérification basique du Webhook Secret (à configurer dans les headers du Webhook Supabase)
    const authHeader = req.headers.get('Authorization')
    if (authHeader !== `Bearer ${process.env.WEBHOOK_SECRET}`) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const { type, table, record, old_record } = payload

    // On ne gère que les updates sur la table matchs
    if (table !== 'matchs' || type !== 'UPDATE') {
      return NextResponse.json({ message: 'Ignoré' })
    }

    // Vérifier si le score ou le statut a changé
    const scoreChanged = record.score_a !== old_record.score_a || record.score_b !== old_record.score_b
    const statusChanged = record.statut !== old_record.statut && record.statut !== 'a_venir'

    if (!scoreChanged && !statusChanged) {
      return NextResponse.json({ message: 'Aucun changement pertinent' })
    }

    // Récupérer les infos des équipes pour le message
    const supabase = await createClient()
    const { data: equipeA } = await supabase.from('equipes').select('nom').eq('id', record.equipe_a_id).single()
    const { data: equipeB } = await supabase.from('equipes').select('nom').eq('id', record.equipe_b_id).single()

    const nomA = (equipeA as any)?.nom || 'Équipe A'
    const nomB = (equipeB as any)?.nom || 'Équipe B'

    let title = 'Mise à jour du match'
    let body = `${nomA} ${record.score_a} - ${record.score_b} ${nomB}`

    if (scoreChanged) {
      title = '⚽ Nouveau But !'
    } else if (statusChanged) {
      if (record.statut === 'en_cours') {
        title = '⏱️ Le match a commencé !'
        body = `Suivez le match ${nomA} vs ${nomB} en direct.`
      } else if (record.statut === 'termine') {
        title = '🏁 Fin du match'
        body = `Score final : ${nomA} ${record.score_a} - ${record.score_b} ${nomB}`
      }
    }

    // Récupérer tous les tokens FCM
    const { data: tokensData } = await supabase.from('fcm_tokens').select('token')
    const tokens = (tokensData || []).map((t: any) => t.token).filter(Boolean)

    if (tokens.length > 0) {
      // Envoyer la notification via Firebase Admin
      const message = {
        notification: {
          title,
          body,
        },
        data: {
          url: `/matchs/${record.id}` // URL à ouvrir quand l'utilisateur clique
        },
        tokens,
      }

      const response = await (admin.messaging as any)().sendEachForMulticast(message)
      console.log(`FCM envoyés: ${response.successCount} succès, ${response.failureCount} échecs.`)
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Erreur Webhook FCM:', error)
    return NextResponse.json({ error: 'Erreur interne' }, { status: 500 })
  }
}
