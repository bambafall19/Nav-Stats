import { NextRequest, NextResponse } from 'next/server'
import webpush from 'web-push'

interface PushSubscription {
  endpoint: string
  keys: {
    p256dh: string
    auth: string
  }
}

// Configure VAPID only at runtime, inside handlers
const configureVapid = () => {
  try {
    const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
    const privateKey = process.env.VAPID_PRIVATE_KEY
    
    if (publicKey && privateKey) {
      webpush.setVapidDetails(
        'mailto:contact@navestats.site',
        publicKey,
        privateKey
      )
      return true
    }
  } catch (error) {
    console.warn('VAPID non configuré:', error)
  }
  return false
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { subscription, userId } = body as { subscription: PushSubscription; userId: string }

    if (!subscription || !userId) {
      return NextResponse.json({ error: 'Subscription et userId requis' }, { status: 400 })
    }

    // Store subscription in database
    // TODO: Implement database storage
    return NextResponse.json({ success: true, message: 'Subscription enregistrée' })
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

    // Configure VAPID at runtime
    const vapidConfigured = configureVapid()
    
    if (!vapidConfigured) {
      return NextResponse.json({ 
        error: 'VAPID non configuré. Ajoutez les clés dans Vercel.',
        partialSuccess: true
      }, { status: 200 })
    }

    // Get subscriptions from database
    // TODO: Fetch from push_subscriptions table
    const subscriptions: PushSubscription[] = []

    // Send notifications
    const results = await Promise.allSettled(
      subscriptions.map(async (sub) => {
        try {
          await webpush.sendNotification(sub, JSON.stringify({
            titre,
            message,
            type,
            matchId
          }))
        } catch (error) {
          console.error('Erreur envoi notification:', error)
        }
      })
    )

    return NextResponse.json({ 
      success: true, 
      sent: results.filter(r => r.status === 'fulfilled').length,
      total: subscriptions.length
    })
  } catch (error) {
    console.error('Erreur envoi push:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({ 
    status: 'ok',
    vapid: !!process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY && !!process.env.VAPID_PRIVATE_KEY
  })
}