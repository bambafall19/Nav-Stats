import { createClient } from '@/lib/supabase/server'

export async function checkAndSendMatchNotifications() {
  const supabase = await createClient()

  try {
    // Get current time
    const now = new Date()
    const currentHour = now.getHours()
    const currentMinute = now.getMinutes()

    // Check if it's 15:00 (3 PM)
    if (currentHour === 15 && currentMinute >= 0 && currentMinute < 5) {
      // Get all matchs that start at 15h and haven't sent notification yet
      const { data: matchs } = await supabase
        .from('matchs')
        .select('*')
        .eq('heure', '15:00')
        .eq('notification_sent', false)
        .eq('statut', 'planifie')

      if (matchs && matchs.length > 0) {
        // Get all users
        const { data: users } = await supabase
          .from('profiles')
          .select('id')

        // Send notification to all users
        for (const match of matchs) {
          for (const user of users || []) {
            await supabase.from('notifications').insert({
              user_id: user.id,
              title: '⚽ Match en cours!',
              message: `${match.equipe1} vs ${match.equipe2} commence maintenant!`,
              type: 'match',
              read: false,
              dismissed: false,
            })
          }

          // Mark match as notification sent
          await supabase
            .from('matchs')
            .update({ notification_sent: true })
            .eq('id', match.id)
        }
      }
    }

    // Check if it's 16:00 (4 PM) for second match
    if (currentHour === 16 && currentMinute >= 0 && currentMinute < 5) {
      const { data: matchs } = await supabase
        .from('matchs')
        .select('*')
        .eq('heure', '16:00')
        .eq('notification_sent', false)
        .eq('statut', 'planifie')

      if (matchs && matchs.length > 0) {
        const { data: users } = await supabase
          .from('profiles')
          .select('id')

        for (const match of matchs) {
          for (const user of users || []) {
            await supabase.from('notifications').insert({
              user_id: user.id,
              title: '⚽ Match en cours!',
              message: `${match.equipe1} vs ${match.equipe2} commence maintenant!`,
              type: 'match',
              read: false,
              dismissed: false,
            })
          }

          await supabase
            .from('matchs')
            .update({ notification_sent: true })
            .eq('id', match.id)
        }
      }
    }
  } catch (error) {
    console.error('Error sending match notifications:', error)
  }
}
