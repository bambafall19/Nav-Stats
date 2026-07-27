import { checkAndSendMatchNotifications } from '@/lib/matchNotifications'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    await checkAndSendMatchNotifications()
    return NextResponse.json({ success: true, message: 'Notifications checked' })
  } catch (error) {
    console.error('Error in match notifications API:', error)
    return NextResponse.json({ error: 'Failed to check notifications' }, { status: 500 })
  }
}

export async function POST() {
  try {
    await checkAndSendMatchNotifications()
    return NextResponse.json({ success: true, message: 'Notifications sent' })
  } catch (error) {
    console.error('Error in match notifications API:', error)
    return NextResponse.json({ error: 'Failed to send notifications' }, { status: 500 })
  }
}
