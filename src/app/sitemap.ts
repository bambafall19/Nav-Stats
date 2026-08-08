import type { MetadataRoute } from 'next'
import { createClient } from '@/lib/supabase/server'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://navestats.site'
  const today = new Date()

  const entries: MetadataRoute.Sitemap = [
    { url: baseUrl, lastModified: today, changeFrequency: 'hourly', priority: 1.0 },
    { url: `${baseUrl}/matchs`, lastModified: today, changeFrequency: 'hourly', priority: 0.9 },
    { url: `${baseUrl}/pronostics`, lastModified: today, changeFrequency: 'hourly', priority: 0.8 },
    { url: `${baseUrl}/classements`, lastModified: today, changeFrequency: 'hourly', priority: 0.8 },
    { url: `${baseUrl}/statistiques`, lastModified: today, changeFrequency: 'daily', priority: 0.7 },
    { url: `${baseUrl}/cadets`, lastModified: today, changeFrequency: 'daily', priority: 0.7 },
    { url: `${baseUrl}/communaute`, lastModified: today, changeFrequency: 'daily', priority: 0.6 },
    { url: `${baseUrl}/auth/login`, lastModified: today, changeFrequency: 'monthly', priority: 0.3 },
    { url: `${baseUrl}/auth/register`, lastModified: today, changeFrequency: 'monthly', priority: 0.3 },
  ]

  try {
    const supabase = await createClient()
    const [matchsRes, equipesRes] = await Promise.all([
      supabase.from('matchs').select('id'),
      supabase.from('equipes').select('id'),
    ])

    for (const m of (matchsRes.data || []) as { id: string }[]) {
      entries.push({ url: `${baseUrl}/matchs/${m.id}`, lastModified: today, changeFrequency: 'daily', priority: 0.6 })
    }
    for (const e of (equipesRes.data || []) as { id: string }[]) {
      entries.push({ url: `${baseUrl}/equipes/${e.id}`, lastModified: today, changeFrequency: 'daily', priority: 0.6 })
    }
  } catch {
    // DB indisponible → sitemap statique seulement
  }

  return entries
}
