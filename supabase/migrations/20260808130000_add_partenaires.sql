-- ============================================
-- Table Partenaires (sponsors) NavéStats
-- ============================================

CREATE TABLE IF NOT EXISTS partenaires (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nom TEXT NOT NULL,
  logo_url TEXT,
  description TEXT,
  lien_url TEXT,
  niveau TEXT NOT NULL DEFAULT 'bronze' CHECK (niveau IN ('or', 'argent', 'bronze')),
  actif BOOLEAN NOT NULL DEFAULT TRUE,
  ordre INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_partenaires_actif_ordre ON partenaires(actif, ordre);

-- RLS : lecture publique des partenaires actifs, gestion admin uniquement
ALTER TABLE partenaires ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can view partenaires" ON partenaires;
CREATE POLICY "Public can view partenaires"
  ON partenaires FOR SELECT
  USING (actif = TRUE);

DROP POLICY IF EXISTS "Admins can manage partenaires" ON partenaires;
CREATE POLICY "Admins can manage partenaires"
  ON partenaires FOR ALL
  USING (EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid() AND profiles.is_admin = TRUE
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid() AND profiles.is_admin = TRUE
  ));

GRANT SELECT ON partenaires TO anon;
GRANT ALL ON partenaires TO authenticated;
GRANT ALL ON partenaires TO service_role;
