import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    
    // Vérifier que l'utilisateur est connecté et est admin
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    // Vérifier le rôle admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', user.id)
      .single() as { data: { is_admin: boolean } | null }

    if (!profile?.is_admin) {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 })
    }

    const { titre, message, type, matchId } = await request.json()

    if (!titre || !message || !type) {
      return NextResponse.json({ error: 'Titre, message et type requis' }, { status: 400 })
    }

    // Récupérer tous les utilisateurs
    const { data: users, error: usersError } = await supabase
      .from('profiles')
      .select('id') as { data: { id: string }[] | null, error: any }

    if (usersError) {
      console.error('Erreur récupération utilisateurs:', usersError)
      return NextResponse.json({ 
        error: 'Erreur récupération utilisateurs',
        details: usersError.message 
      }, { status: 500 })
    }

    if (!users || users.length === 0) {
      console.warn('Aucun utilisateur trouvé dans la base de données')
      return NextResponse.json({ 
        error: 'Aucun utilisateur trouvé',
        count: 0 
      }, { status: 404 })
    }

    console.log(`Nombre d'utilisateurs trouvés: ${users.length}`)

    // Créer les notifications pour chaque utilisateur
    const notifications = users.map(u => ({
      user_id: u.id,
      titre,
      message,
      type,
      lien: matchId ? `/matchs/${matchId}` : null,
    }))

    const { error: notifError } = await supabase
      .from('notifications')
      .insert(notifications as any)

    if (notifError) {
      console.error('Erreur insertion notifications:', notifError)
      console.error('Détails erreur:', JSON.stringify(notifError, null, 2))
      return NextResponse.json({ 
        error: 'Échec envoi notifications',
        details: notifError.message 
      }, { status: 500 })
    }

    return NextResponse.json({ 
      success: true, 
      count: notifications.length 
    })
  } catch (error) {
    console.error('Erreur API notifications:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}