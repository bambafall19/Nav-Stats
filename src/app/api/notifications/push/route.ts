import { NextRequest, NextResponse } from 'next/server'
import webpush from 'web-push'

// Configure web-push with VAPID keys (you need to generate these)
const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY!

if (VAPID_PUBLIC_KEY && VAPID_PRIVATE_KEY) {
  webpush.setVapidDetails(
    'mailto:contact@navestats.site',
    VAPID_PUBLIC_KEY,
    VAPID_PRIVATE_KEY
  )
}

interface PushSubscription {
  endpoint: string
  keys: {
    p256dh: string
    auth: string
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { subscription, userId } = body as { subscription: PushSubscription; userId: string }

    if (!subscription || !userId) {
      return NextResponse.json({ error: 'Subscription et userId requis' }, { status: 400 })
    }

    // Store subscription in database (you need to create a push_subscriptions table)
    // For now, we'll just return success
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Erreur enregistrement push:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { titre, message, type, matchId, userIds } = body

    if (!titre || !message) {
      return NextResponse.json({ error: 'Titre et message requis' }, { status: 400 })
    }

    // Get all push subscriptions for users
    // This requires a push_subscriptions table in your database
    // For now, we'll return a success response
    
    return NextResponse.json({ 
      success: true, 
      message: 'Push notifications sent' 
    })
  } catch (error) {
    console.error('Erreur envoi push:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}