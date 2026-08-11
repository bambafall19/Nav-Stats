import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET() {
  return NextResponse.json({
    ok: true,
    service: 'NavéStats API',
    time: new Date().toISOString(),
    env: process.env.NODE_ENV || 'unknown',
    vercelEnv: process.env.VERCEL_ENV || 'local',
    region: process.env.VERCEL_REGION || 'local',
    version: process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0',
  })
}
