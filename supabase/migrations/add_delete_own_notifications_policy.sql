-- ================================================
-- RLS COMPLET POUR LA TABLE notifications
-- À exécuter dans le SQL Editor de Supabase
-- (idempotent : peut être relancé sans risque)
-- ================================================

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Un utilisateur peut VOIR ses propres notifications
DROP POLICY IF EXISTS "Users can view their own notifications" ON notifications;
CREATE POLICY "Users can view their own notifications"
  ON notifications FOR SELECT
  USING (auth.uid() = user_id);

-- Un utilisateur peut marquer lues ses propres notifications
DROP POLICY IF EXISTS "Users can update their own notifications" ON notifications;
CREATE POLICY "Users can update their own notifications"
  ON notifications FOR UPDATE
  USING (auth.uid() = user_id);

-- Un utilisateur peut supprimer ses propres notifications
DROP POLICY IF EXISTS "Users can delete their own notifications" ON notifications;
CREATE POLICY "Users can delete their own notifications"
  ON notifications FOR DELETE
  USING (auth.uid() = user_id);

-- Un utilisateur peut créer ses propres notifications
DROP POLICY IF EXISTS "Users can insert their own notifications" ON notifications;
CREATE POLICY "Users can insert their own notifications"
  ON notifications FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Les administrateurs peuvent diffuser des notifications à tous les utilisateurs
DROP POLICY IF EXISTS "Admins can insert notifications" ON notifications;
CREATE POLICY "Admins can insert notifications"
  ON notifications FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );

-- Les administrateurs peuvent voir toutes les notifications (page admin)
DROP POLICY IF EXISTS "Admins can view all notifications" ON notifications;
CREATE POLICY "Admins can view all notifications"
  ON notifications FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );

-- Les administrateurs peuvent supprimer n'importe quelle notification
DROP POLICY IF EXISTS "Admins can delete notifications" ON notifications;
CREATE POLICY "Admins can delete notifications"
  ON notifications FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );

-- Autoriser les notifications en temps réel (publication)
ALTER TABLE notifications REPLICA IDENTITY FULL;

-- Garantir les privilèges pour le rôle authentifié
GRANT SELECT, INSERT, UPDATE, DELETE ON notifications TO authenticated;
