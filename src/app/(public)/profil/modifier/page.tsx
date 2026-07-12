'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

type ProfileForm = {
  username: string
  full_name: string
  quartier: string
  asc_nom: string
  bio: string
}

type ProfileSettingsRow = ProfileForm

export default function ModifierProfilPage() {
  const router = useRouter()
  // Current generated Supabase types infer update payloads as never for some tables.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase = createClient() as any
  const [userId, setUserId] = useState<string | null>(null)
  const [form, setForm] = useState<ProfileForm>({ username: '', full_name: '', quartier: '', asc_nom: '', bio: '' })
  const [password, setPassword] = useState({ next: '', confirm: '' })
  const [loading, setLoading] = useState(true)
  const [savingProfile, setSavingProfile] = useState(false)
  const [savingPassword, setSavingPassword] = useState(false)
  const [profileMessage, setProfileMessage] = useState('')
  const [passwordMessage, setPasswordMessage] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true

    async function loadProfile() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!active) return

      if (!user) {
        router.replace('/auth/login')
        return
      }

      setUserId(user.id)
      const { data, error: profileError } = await supabase
        .from('profiles')
        .select('username, full_name, quartier, asc_nom, bio')
        .eq('id', user.id)
        .single()

      if (!active) return

      const profileData = data as ProfileSettingsRow | null

      if (profileError) {
        setError('Impossible de charger le profil.')
      } else if (profileData) {
        setForm({
          username: profileData.username || '',
          full_name: profileData.full_name || '',
          quartier: profileData.quartier || '',
          asc_nom: profileData.asc_nom || '',
          bio: profileData.bio || '',
        })
      }

      setLoading(false)
    }

    loadProfile()
    return () => { active = false }
  }, [router, supabase])

  function update(field: keyof ProfileForm, value: string) {
    setForm(current => ({ ...current, [field]: value }))
    setProfileMessage('')
    setError('')
  }

  async function saveProfile(e: React.FormEvent) {
    e.preventDefault()
    if (!userId) return
    if (!form.username.trim()) {
      setError('Le nom utilisateur est obligatoire.')
      return
    }

    setSavingProfile(true)
    setProfileMessage('')
    setError('')

    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        username: form.username.trim(),
        full_name: form.full_name.trim() || null,
        quartier: form.quartier.trim() || null,
        asc_nom: form.asc_nom.trim() || null,
        bio: form.bio.trim() || null,
      })
      .eq('id', userId)

    setSavingProfile(false)

    if (updateError) {
      setError('La mise à jour du profil a échoué.')
      return
    }

    setProfileMessage('Profil mis à jour.')
    router.refresh()
  }

  async function savePassword(e: React.FormEvent) {
    e.preventDefault()
    setPasswordMessage('')
    setError('')

    if (password.next.length < 6) {
      setError('Le nouveau mot de passe doit contenir au moins 6 caractères.')
      return
    }

    if (password.next !== password.confirm) {
      setError('Les deux mots de passe ne correspondent pas.')
      return
    }

    setSavingPassword(true)
    const { error: passwordError } = await supabase.auth.updateUser({ password: password.next })
    setSavingPassword(false)

    if (passwordError) {
      setError('Le changement de mot de passe a échoué.')
      return
    }

    setPassword({ next: '', confirm: '' })
    setPasswordMessage('Mot de passe mis à jour.')
  }

  if (loading) {
    return (
      <div className="page-content">
        <div className="container-app" style={{ maxWidth: 760 }}>
          <div className="card" style={{ padding: 32, textAlign: 'center', color: 'var(--color-text-secondary)' }}>
            Chargement du profil...
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="page-content">
      <div className="container-app" style={{ maxWidth: 860 }}>
        <div style={{ marginBottom: 24 }}>
          <Link href={userId ? `/profil/${userId}` : '/'} style={{ color: 'var(--color-primary)', textDecoration: 'none', fontWeight: 800, fontSize: '0.85rem' }}>
            Retour au profil
          </Link>
          <h1 className="section-title" style={{ fontSize: '2rem', marginTop: 10, marginBottom: 4 }}>Modifier mon profil</h1>
          <p className="section-subtitle">Mettez à jour votre nom public, votre ASC et votre mot de passe.</p>
        </div>

        {error && (
          <div className="card" style={{ padding: 14, marginBottom: 16, color: 'var(--color-red)', background: 'rgba(232,0,45,0.06)', borderColor: 'rgba(232,0,45,0.16)' }}>
            {error}
          </div>
        )}

        <div className="profile-settings-grid">
          <form onSubmit={saveProfile} className="card" style={{ padding: 22 }}>
            <h2 style={{ fontSize: '1.1rem', marginBottom: 16 }}>Informations publiques</h2>

            <div className="settings-field">
              <label className="label" htmlFor="settings-username">Nom utilisateur *</label>
              <input id="settings-username" className="input" value={form.username} onChange={e => update('username', e.target.value)} />
            </div>

            <div className="settings-field">
              <label className="label" htmlFor="settings-full-name">Nom complet</label>
              <input id="settings-full-name" className="input" value={form.full_name} onChange={e => update('full_name', e.target.value)} />
            </div>

            <div className="settings-two-cols">
              <div className="settings-field">
                <label className="label" htmlFor="settings-quartier">Quartier</label>
                <input id="settings-quartier" className="input" value={form.quartier} onChange={e => update('quartier', e.target.value)} />
              </div>
              <div className="settings-field">
                <label className="label" htmlFor="settings-asc">ASC</label>
                <input id="settings-asc" className="input" value={form.asc_nom} onChange={e => update('asc_nom', e.target.value)} />
              </div>
            </div>

            <div className="settings-field">
              <label className="label" htmlFor="settings-bio">Bio</label>
              <textarea
                id="settings-bio"
                className="input"
                rows={4}
                maxLength={180}
                value={form.bio}
                onChange={e => update('bio', e.target.value)}
                style={{ resize: 'vertical' }}
              />
            </div>

            {profileMessage && <p style={{ color: 'var(--color-primary)', fontWeight: 800, fontSize: '0.86rem', marginBottom: 12 }}>{profileMessage}</p>}

            <button type="submit" className="btn btn-primary" disabled={savingProfile} style={{ width: '100%' }}>
              {savingProfile ? 'Enregistrement...' : 'Enregistrer le profil'}
            </button>
          </form>

          <form onSubmit={savePassword} className="card" style={{ padding: 22 }}>
            <h2 style={{ fontSize: '1.1rem', marginBottom: 16 }}>Mot de passe</h2>

            <div className="settings-field">
              <label className="label" htmlFor="settings-password">Nouveau mot de passe</label>
              <input
                id="settings-password"
                className="input"
                type="password"
                autoComplete="new-password"
                value={password.next}
                onChange={e => {
                  setPassword(current => ({ ...current, next: e.target.value }))
                  setPasswordMessage('')
                }}
              />
            </div>

            <div className="settings-field">
              <label className="label" htmlFor="settings-password-confirm">Confirmer le mot de passe</label>
              <input
                id="settings-password-confirm"
                className="input"
                type="password"
                autoComplete="new-password"
                value={password.confirm}
                onChange={e => {
                  setPassword(current => ({ ...current, confirm: e.target.value }))
                  setPasswordMessage('')
                }}
              />
            </div>

            {passwordMessage && <p style={{ color: 'var(--color-primary)', fontWeight: 800, fontSize: '0.86rem', marginBottom: 12 }}>{passwordMessage}</p>}

            <button type="submit" className="btn btn-primary" disabled={savingPassword} style={{ width: '100%' }}>
              {savingPassword ? 'Mise à jour...' : 'Changer le mot de passe'}
            </button>

            <p style={{ marginTop: 14, fontSize: '0.78rem', color: 'var(--color-text-muted)', lineHeight: 1.45 }}>
              Vous restez connecté après la mise à jour. Gardez un mot de passe simple à retenir mais difficile à deviner.
            </p>
          </form>
        </div>

        <style>{`
          .profile-settings-grid {
            display: grid;
            grid-template-columns: minmax(0, 1.4fr) minmax(280px, 0.8fr);
            gap: 18px;
            align-items: start;
          }
          .settings-two-cols {
            display: grid;
            grid-template-columns: repeat(2, minmax(0, 1fr));
            gap: 12px;
          }
          .settings-field {
            margin-bottom: 14px;
          }
          @media (max-width: 760px) {
            .profile-settings-grid,
            .settings-two-cols {
              grid-template-columns: 1fr;
            }
          }
        `}</style>
      </div>
    </div>
  )
}
