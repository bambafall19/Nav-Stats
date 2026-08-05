-- ================================================
-- PERMETTRE À CHAQUE UTILISATEUR DE SUPPRIMER
-- SES PROPRES NOTIFICATIONS (hard delete)
-- À exécuter dans le SQL Editor de Supabase
-- ================================================

-- Politique : un utilisateur peut supprimer ses propres notifications
DROP POLICY IF EXISTS "Users can delete their own notifications" ON notifications;
CREATE POLICY "Users can delete their own notifications"
  ON notifications FOR DELETE
  USING (auth.uid() = user_id);

-- Politique : un utilisateur peut marquer lues ses notifications
DROP POLICY IF EXISTS "Users can update their own notifications" ON notifications;
CREATE POLICY "Users can update their own notifications"
  ON notifications FOR UPDATE
  USING (auth.uid() = user_id);

-- Politique : un utilisateur peut insérer ses propres notifications
DROP POLICY IF EXISTS "Users can insert their own notifications" ON notifications;
CREATE POLICY "Users can insert their own notifications"
  ON notifications FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Autoriser les notifications en temps réel (publication)
ALTER TABLE notifications REPLICA IDENTITY FULL;
