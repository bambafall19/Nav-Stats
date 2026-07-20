-- ========================================
-- NETTOYAGE DES DOUBLONS D'ÉQUIPES
-- À exécuter dans Supabase SQL Editor
-- ========================================

-- ÉTAPE 1: Vérifier les doublons
-- SELECT nom, sigle, poule, COUNT(*), 
--        STRING_AGG(id, ', ' ORDER BY created_at) as ids
-- FROM equipes 
-- WHERE poule IN ('A','B','C')
-- GROUP BY nom, sigle, poule 
-- HAVING COUNT(*) > 1;

-- ÉTAPE 2: Supprimer les doublons (garder seulement le plus ancien)
-- Note: ajustez les WHERE clauses selon vos doublons réels

-- Supprimer les doublons dans la POULE A
DELETE FROM equipes 
WHERE id IN (
  SELECT id FROM (
    SELECT id,
           ROW_NUMBER() OVER (PARTITION BY LOWER(nom) ORDER BY created_at DESC) as rn
    FROM equipes 
    WHERE poule = 'A' 
      AND LOWER(nom) IN (
        SELECT LOWER(nom) 
        FROM equipes 
        WHERE poule = 'A' 
        GROUP BY LOWER(nom) 
        HAVING COUNT(*) > 1
      )
  ) WHERE rn > 1
);

-- Supprimer les doublons dans la POULE B
DELETE FROM equipes 
WHERE id IN (
  SELECT id FROM (
    SELECT id,
           ROW_NUMBER() OVER (PARTITION BY LOWER(nom) ORDER BY created_at DESC) as rn
    FROM equipes 
    WHERE poule = 'B' 
      AND LOWER(nom) IN (
        SELECT LOWER(nom) 
        FROM equipes 
        WHERE poule = 'B' 
        GROUP BY LOWER(nom) 
        HAVING COUNT(*) > 1
      )
  ) WHERE rn > 1
);

-- Supprimer les doublons dans la POULE C
DELETE FROM equipes 
WHERE id IN (
  SELECT id FROM (
    SELECT id,
           ROW_NUMBER() OVER (PARTITION BY LOWER(nom) ORDER BY created_at DESC) as rn
    FROM equipes 
    WHERE poule = 'C' 
      AND LOWER(nom) IN (
        SELECT LOWER(nom) 
        FROM equipes 
        WHERE poule = 'C' 
        GROUP BY LOWER(nom) 
        HAVING COUNT(*) > 1
      )
  ) WHERE rn > 1
);

-- ÉTAPE 3: Normaliser les noms (optionnel)
-- Mettre à jour les noms pour qu'ils correspondent aux images

-- POULE A
UPDATE equipes SET nom = 'ASC MANKOO', sigle = 'MANKOO' WHERE LOWER(nom) LIKE '%mankoo%' AND poule = 'A';
UPDATE equipes SET nom = 'ASC BOKK JOM', sigle = 'BOKK JOM' WHERE LOWER(nom) LIKE '%bokk%' AND poule = 'A';
UPDATE equipes SET nom = 'ASC KOCC', sigle = 'KOCC' WHERE LOWER(nom) LIKE '%kocc%' AND poule = 'A';
UPDATE equipes SET nom = 'ASC ENTENTE COSSAN SANTOS', sigle = 'ENTENTE' WHERE LOWER(nom) LIKE '%entente%' AND poule = 'A';
UPDATE equipes SET nom = 'ASC MAAG DAAN', sigle = 'MAAG DAAN' WHERE LOWER(nom) LIKE '%maag%' AND poule = 'A';

-- POULE B
UPDATE equipes SET nom = 'ASC GUINAW RAÏL', sigle = 'GUINAW' WHERE LOWER(nom) LIKE '%guinaw%' AND poule = 'B';
UPDATE equipes SET nom = 'ASC ESPOIRS', sigle = 'ESPOIRS' WHERE LOWER(nom) LIKE '%espoirs%' AND poule = 'B';
UPDATE equipes SET nom = 'ASC KHAÏ GUI', sigle = 'KHAÏ GUI' WHERE LOWER(nom) LIKE '%khaï%' AND poule = 'B';
UPDATE equipes SET nom = 'ASC THILLA', sigle = 'THILLA' WHERE LOWER(nom) LIKE '%thilla%' AND poule = 'B';
UPDATE equipes SET nom = 'ASC JUBBO', sigle = 'JUBBO' WHERE LOWER(nom) LIKE '%jubbo%' AND poule = 'B';
UPDATE equipes SET nom = 'ASC WALLYDAANN', sigle = 'WALLYDAANN' WHERE LOWER(nom) LIKE '%wally%' AND poule = 'B';

-- POULE C
UPDATE equipes SET nom = 'ASC KAÏRÉ', sigle = 'KAÏRÉ' WHERE LOWER(nom) LIKE '%kaïré%' AND poule = 'C';
UPDATE equipes SET nom = 'ASC RAKADIOU', sigle = 'RAKADIOU' WHERE LOWER(nom) LIKE '%rakadiou%' AND poule = 'C';
UPDATE equipes SET nom = 'ASC JAPPO', sigle = 'JAPPO' WHERE LOWER(nom) LIKE '%jappo%' AND poule = 'C';
UPDATE equipes SET nom = 'ASC DIAMBARS', sigle = 'DIAMBARS' WHERE LOWER(nom) LIKE '%diambars%' AND poule = 'C';
UPDATE equipes SET nom = 'ASC YAKAAR', sigle = 'YAKAAR' WHERE LOWER(nom) LIKE '%yakaar%' AND poule = 'C';
UPDATE equipes SET nom = 'ASC LAT DIOR', sigle = 'LAT DIOR' WHERE LOWER(nom) LIKE '%lat dior%' AND poule = 'C';

-- ÉTAPE 4: Vérifier le résultat final
-- SELECT nom, sigle, poule, points_classement, matchs_joues, victoires, nuls, defaites, buts_marques, buts_encaisses 
-- FROM equipes 
-- WHERE poule IN ('A','B','C') 
-- ORDER BY poule, points_classement DESC;