export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          username: string
          full_name: string | null
          avatar_url: string | null
          quartier: string | null
          asc_nom: string | null
          bio: string | null
          points: number
          rang: number
          total_pronostics: number
          pronostics_corrects: number
          is_admin: boolean
          code_parrainage: string | null
          parraine_par: string | null
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['profiles']['Row'], 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['profiles']['Insert']>
      }
      parrainages: {
        Row: {
          id: string
          parrain_id: string
          filleul_id: string
          points: number
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['parrainages']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['parrainages']['Insert']>
      }
      equipes: {
        Row: {
          id: string
          nom: string
          sigle: string | null
          couleur_principale: string
          couleur_secondaire: string
          logo_url: string | null
          quartier: string | null
          asc_nom: string | null
          description: string | null
          annee_creation: number | null
          matchs_joues: number
          victoires: number
          defaites: number
          nuls: number
          buts_marques: number
          buts_encaisses: number
          points_classement: number
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['equipes']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['equipes']['Insert']>
      }
      joueurs: {
        Row: {
          id: string
          equipe_id: string | null
          nom: string
          prenom: string | null
          numero_maillot: number | null
          poste: 'gardien' | 'defenseur' | 'milieu' | 'attaquant' | null
          buts: number
          passes_decisives: number
          matchs_joues: number
          cartons_jaunes: number
          cartons_rouges: number
          photo_url: string | null
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['joueurs']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['joueurs']['Insert']>
      }
      matchs: {
        Row: {
          id: string
          equipe_a_id: string
          equipe_b_id: string
          date_match: string
          heure_match: string
          stade: string
          arbitre: string | null
          journee: number | null
          phase: 'phase_groupe' | 'quart_finale' | 'demi_finale' | 'finale'
          statut: 'a_venir' | 'en_cours' | 'termine' | 'reporte'
          score_a: number | null
          score_b: number | null
          buteurs_a: string[] | null
          buteurs_b: string[] | null
          homme_du_match_id: string | null
          notes: string | null
          created_at: string
          updated_at: string
          equipe_a?: Database['public']['Tables']['equipes']['Row']
          equipe_b?: Database['public']['Tables']['equipes']['Row']
        }
        Insert: Omit<Database['public']['Tables']['matchs']['Row'], 'id' | 'created_at' | 'updated_at' | 'equipe_a' | 'equipe_b'>
        Update: Partial<Database['public']['Tables']['matchs']['Insert']>
      }
      cadet_matchs: {
        Row: {
          id: string
          journee: number
          date_match: string
          poule: string
          equipe_a_id: string | null
          equipe_b_id: string | null
          equipe_a: string
          equipe_b: string
          terrain: string
          ordre: string | null
          created_at: string
          updated_at: string
          equipe_a_info?: Database['public']['Tables']['equipes']['Row'] | null
          equipe_b_info?: Database['public']['Tables']['equipes']['Row'] | null
        }
        Insert: Omit<Database['public']['Tables']['cadet_matchs']['Row'], 'id' | 'created_at' | 'updated_at' | 'equipe_a_info' | 'equipe_b_info'>
        Update: Partial<Database['public']['Tables']['cadet_matchs']['Insert']>
      }
      pronostics: {
        Row: {
          id: string
          user_id: string
          match_id: string
          resultat_predit: 'equipe_a' | 'nul' | 'equipe_b'
          score_a_predit: number | null
          score_b_predit: number | null
          premier_buteur_id: string | null
          homme_du_match_predit_id: string | null
          points_gagnes: number
          est_correct: boolean | null
          score_exact: boolean
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['pronostics']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['pronostics']['Insert']>
      }
      badges_types: {
        Row: {
          id: string
          nom: string
          description: string | null
          icone: string | null
          couleur: string | null
          condition_type: string | null
          condition_valeur: number | null
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['badges_types']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['badges_types']['Insert']>
      }
      user_badges: {
        Row: {
          id: string
          user_id: string
          badge_id: string
          obtenu_le: string
          badge?: Database['public']['Tables']['badges_types']['Row']
        }
        Insert: Omit<Database['public']['Tables']['user_badges']['Row'], 'id' | 'obtenu_le' | 'badge'>
        Update: Partial<Database['public']['Tables']['user_badges']['Insert']>
      }
      commentaires: {
        Row: {
          id: string
          match_id: string | null
          user_id: string
          contenu: string
          parent_id: string | null
          likes: number
          created_at: string
          user?: Database['public']['Tables']['profiles']['Row']
        }
        Insert: Omit<Database['public']['Tables']['commentaires']['Row'], 'id' | 'created_at' | 'user'>
        Update: Partial<Database['public']['Tables']['commentaires']['Insert']>
      }
      actualites: {
        Row: {
          id: string
          titre: string
          contenu: string
          image_url: string | null
          auteur_id: string | null
          categorie: 'actualite' | 'annonce' | 'resultat' | 'classement'
          est_publie: boolean
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['actualites']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['actualites']['Insert']>
      }
      notifications: {
        Row: {
          id: string
          user_id: string
          titre: string
          message: string
          type: 'match' | 'resultat' | 'classement' | 'badge' | 'annonce'
          est_lue: boolean
          lien: string | null
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['notifications']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['notifications']['Insert']>
      }
      audit_logs: {
        Row: {
          id: string
          user_id: string | null
          action: string
          resource_type: string
          resource_id: string | null
          old_values: any
          new_values: any
          ip_address: string | null
          user_agent: string | null
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['audit_logs']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['audit_logs']['Insert']>
      }
      mini_ligues: {
        Row: {
          id: string
          nom: string
          code_invitation: string
          createur_id: string | null
          is_public: boolean
          description: string | null
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['mini_ligues']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['mini_ligues']['Insert']>
      }
      mini_ligue_members: {
        Row: {
          id: string
          ligue_id: string
          user_id: string
          joined_at: string
        }
        Insert: Omit<Database['public']['Tables']['mini_ligue_members']['Row'], 'id' | 'joined_at'>
        Update: Partial<Database['public']['Tables']['mini_ligue_members']['Insert']>
      }
      team_follows: {
        Row: {
          id: string
          user_id: string
          equipe_id: string
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['team_follows']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['team_follows']['Insert']>
      }
      match_reports: {
        Row: {
          id: string
          match_id: string
          reported_by: string | null
          reason: string
          new_date_match: string | null
          new_heure_match: string | null
          statut: string
          resolved_by: string | null
          resolution: string | null
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['match_reports']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['match_reports']['Insert']>
      }
      notification_preferences: {
        Row: {
          user_id: string
          match_reminder: boolean
          team_notification: boolean
          ranking_change: boolean
          community_mentions: boolean
          push_enabled: boolean
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['notification_preferences']['Row'], 'updated_at'>
        Update: Partial<Database['public']['Tables']['notification_preferences']['Insert']>
      }
      match_reminders: {
        Row: {
          id: string
          user_id: string
          match_id: string
          remind_at: string
          sent: boolean
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['match_reminders']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['match_reminders']['Insert']>
      }
    }
  }
}

export default Database
