import { permanentRedirect } from 'next/navigation'

export const dynamic = 'force-dynamic'

export default function CadetsPage() {
  permanentRedirect('/matchs?cat=cadets')
}
