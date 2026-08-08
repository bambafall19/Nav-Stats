-- ============================================
-- Système de parrainage NavéStats
-- ============================================

-- 1. Colonnes sur profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS code_parrainage TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS parraine_par UUID REFERENCES profiles(id) ON DELETE SET NULL;

CREATE UNIQUE INDEX IF NOT EXISTS idx_profiles_code_parrainage ON profiles(code_parrainage);
CREATE INDEX IF NOT EXISTS idx_profiles_parraine_par ON profiles(parraine_par);

-- 2. Table des parrainages
CREATE TABLE IF NOT EXISTS parrainages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  parrain_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  filleul_id UUID NOT NULL UNIQUE REFERENCES profiles(id) ON DELETE CASCADE,
  points INTEGER NOT NULL DEFAULT 10,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_parrainages_parrain ON parrainages(parrain_id);
CREATE INDEX IF NOT EXISTS idx_parrainages_filleul ON parrainages(filleul_id);

-- 3. Génération automatique du code à l'insertion
CREATE OR REPLACE FUNCTION public.generate_code_parrainage()
RETURNS TRIGGER AS $$
BEGIN
  NEW.code_parrainage := 'NS' || upper(substr(md5(random()::text), 1, 6));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_profiles_generate_code ON profiles;
CREATE TRIGGER trg_profiles_generate_code
BEFORE INSERT ON profiles
FOR EACH ROW
WHEN (NEW.code_parrainage IS NULL)
EXECUTE FUNCTION public.generate_code_parrainage();

-- 4. Backfill des comptes existants
UPDATE profiles
SET code_parrainage = 'NS' || upper(substr(md5(random()::text), 1, 6))
WHERE code_parrainage IS NULL;

-- 5. Fonction d'application du parrainage (SECURITY DEFINER)
CREATE OR REPLACE FUNCTION public.apply_referral(code text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_parrain profiles%ROWTYPE;
  v_filleul_id uuid;
  v_points integer := 10;
BEGIN
  v_filleul_id := auth.uid();
  IF v_filleul_id IS NULL THEN
    RETURN jsonb_build_object('ok', false, 'error', 'non_authentifie');
  END IF;

  SELECT * INTO v_parrain
  FROM profiles
  WHERE code_parrainage = upper(btrim(code));

  IF NOT FOUND THEN
    RETURN jsonb_build_object('ok', false, 'error', 'code_invalide');
  END IF;

  IF v_parrain.id = v_filleul_id THEN
    RETURN jsonb_build_object('ok', false, 'error', 'auto_parrainage');
  END IF;

  IF EXISTS (SELECT 1 FROM parrainages WHERE filleul_id = v_filleul_id) THEN
    RETURN jsonb_build_object('ok', false, 'error', 'deja_parraine');
  END IF;

  INSERT INTO parrainages (parrain_id, filleul_id, points)
  VALUES (v_parrain.id, v_filleul_id, v_points);

  UPDATE profiles SET points = points + v_points WHERE id = v_parrain.id;

  UPDATE profiles SET parraine_par = v_parrain.id WHERE id = v_filleul_id;

  RETURN jsonb_build_object(
    'ok', true,
    'parrain', v_parrain.username,
    'points', v_points
  );
END;
$$;

-- 6. RLS parrainages
ALTER TABLE parrainages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own parrainages" ON parrainages;
CREATE POLICY "Users can view own parrainages"
  ON parrainages FOR SELECT
  USING (parrain_id = auth.uid());

-- 7. Droits
GRANT EXECUTE ON FUNCTION public.apply_referral(text) TO authenticated;
GRANT ALL ON parrainages TO authenticated;
GRANT ALL ON parrainages TO service_role;
