-- ========================================
-- CORRECTION FINALE DES DOUBLONS
-- Supprime TOUS les doublons et garde une seule équipe par nom
-- ========================================

-- ÉTAPE 1: Identifier et supprimer les doublons
-- Pour chaque nom en double, garder seulement l'équipe avec l'ID le plus ancien

-- POULE A - Supprimer les doublons
DELETE FROM equipes e1
WHERE e1.id NOT IN (
  SELECT MIN(e2.id)
  FROM equipes e2
  WHERE LOWER(TRIM(e2.nom)) IN (
    SELECT LOWER(TRIM(nom))
    FROM equipes
    WHERE poule = 'A'
    GROUP BY LOWER(TRIM(nom))
    HAVING COUNT(*) >= 1
  )
  AND e2.poule = 'A'
  GROUP BY LOWER(TRIM(e2.nom))
)
AND e1.poule = 'A';

-- POULE B - Supprimer les doublons
DELETE FROM equipes e1
WHERE e1.id NOT IN (
  SELECT MIN(e2.id)
  FROM equipes e2
  WHERE LOWER(TRIM(e2.nom)) IN (
    SELECT LOWER(TRIM(nom))
    FROM equipes
    WHERE poule = 'B'
    GROUP BY LOWER(TRIM(nom))
    HAVING COUNT(*) >= 1
  )
  AND e2.poule = 'B'
  GROUP BY LOWER(TRIM(e2.nom))
)
AND e1.poule = 'B';

-- POULE C - Supprimer les doublons
DELETE FROM equipes e1
WHERE e1.id NOT IN (
  SELECT MIN(e2.id)
  FROM equipes e2
  WHERE LOWER(TRIM(e2.nom)) IN (
    SELECT LOWER(TRIM(nom))
    FROM equipes
    WHERE poule = 'C'
    GROUP BY LOWER(TRIM(nom))
    HAVING COUNT(*) >= 1
  )
  AND e2.poule = 'C'
  GROUP BY LOWER(TRIM(e2.nom))
)
AND e1.poule = 'C';

-- ÉTAPE 2: Normaliser tous les noms d'équipes
-- POULE A
UPDATE equipes SET 
  nom = 'ASC MANKOO', 
  sigle = 'MANKOO',
  points_classement = 3,
  matchs_joues = 1,
  victoires = 1,
  nuls = 0,
  defaites = 0,
  buts_marques = 2,
  buts_encaisses = 1
WHERE LOWER(nom) LIKE '%mankoo%' AND poule = 'A';

UPDATE equipes SET 
  nom = 'ASC BOKK JOM', 
  sigle = 'BOKK JOM',
  points_classement = 3,
  matchs_joues = 1,
  victoires = 1,
  nuls = 0,
  defaites = 0,
  buts_marques = 2,
  buts_encaisses = 1
WHERE LOWER(nom) LIKE '%bokk%' AND poule = 'A';

UPDATE equipes SET 
  nom = 'ASC KOCC', 
  sigle = 'KOCC',
  points_classement = 0,
  matchs_joues = 0,
  victoires = 0,
  nuls = 0,
  defaites = 0,
  buts_marques = 0,
  buts_encaisses = 0
WHERE LOWER(nom) LIKE '%kocc%' AND poule = 'A';

UPDATE equipes SET 
  nom = 'ASC ENTENTE COSSAN SANTOS', 
  sigle = 'ENTENTE',
  points_classement = 0,
  matchs_joues = 1,
  victoires = 0,
  nuls = 0,
  defaites = 1,
  buts_marques = 1,
  buts_encaisses = 2
WHERE LOWER(nom) LIKE '%entente%' AND poule = 'A';

UPDATE equipes SET 
  nom = 'ASC MAAG DAAN', 
  sigle = 'MAAG DAAN',
  points_classement = 0,
  matchs_joues = 1,
  victoires = 0,
  nuls = 0,
  defaites = 1,
  buts_marques = 1,
  buts_encaisses = 2
WHERE LOWER(nom) LIKE '%maag%' AND poule = 'A';

-- POULE B
UPDATE equipes SET 
  nom = 'ASC GUINAW RAÏL', 
  sigle = 'GUINAW',
  points_classement = 3,
  matchs_joues = 1,
  victoires = 1,
  nuls = 0,
  defaites = 0,
  buts_marques = 3,
  buts_encaisses = 0
WHERE LOWER(nom) LIKE '%guinaw%' AND poule = 'B';

UPDATE equipes SET 
  nom = 'ASC ESPOIRS', 
  sigle = 'ESPOIRS',
  points_classement = 3,
  matchs_joues = 1,
  victoires = 1,
  nuls = 0,
  defaites = 0,
  buts_marques = 1,
  buts_encaisses = 0
WHERE LOWER(nom) LIKE '%espoirs%' AND poule = 'B';

UPDATE equipes SET 
  nom = 'ASC KHAÏ GUI', 
  sigle = 'KHAÏ GUI',
  points_classement = 1,
  matchs_joues = 1,
  victoires = 0,
  nuls = 1,
  defaites = 0,
  buts_marques = 0,
  buts_encaisses = 0
WHERE LOWER(nom) LIKE '%khaï%' AND poule = 'B';

UPDATE equipes SET 
  nom = 'ASC THILLA', 
  sigle = 'THILLA',
  points_classement = 1,
  matchs_joues = 1,
  victoires = 0,
  nuls = 1,
  defaites = 0,
  buts_marques = 0,
  buts_encaisses = 0
WHERE LOWER(nom) LIKE '%thilla%' AND poule = 'B';

UPDATE equipes SET 
  nom = 'ASC JUBBO', 
  sigle = 'JUBBO',
  points_classement = 0,
  matchs_joues = 1,
  victoires = 0,
  nuls = 0,
  defaites = 1,
  buts_marques = 0,
  buts_encaisses = 1
WHERE LOWER(nom) LIKE '%jubbo%' AND poule = 'B';

UPDATE equipes SET 
  nom = 'ASC WALLYDAANN', 
  sigle = 'WALLYDAANN',
  points_classement = 0,
  matchs_joues = 1,
  victoires = 0,
  nuls = 0,
  defaites = 1,
  buts_marques = 0,
  buts_encaisses = 3
WHERE LOWER(nom) LIKE '%wally%' AND poule = 'B';

-- POULE C
UPDATE equipes SET 
  nom = 'ASC KAÏRÉ', 
  sigle = 'KAÏRÉ',
  points_classement = 3,
  matchs_joues = 1,
  victoires = 1,
  nuls = 0,
  defaites = 0,
  buts_marques = 1,
  buts_encaisses = 0
WHERE LOWER(nom) LIKE '%kaïré%' AND poule = 'C';

UPDATE equipes SET 
  nom = 'ASC RAKADIOU', 
  sigle = 'RAKADIOU',
  points_classement = 1,
  matchs_joues = 1,
  victoires = 0,
  nuls = 1,
  defaites = 0,
  buts_marques = 1,
  buts_encaisses = 1
WHERE LOWER(nom) LIKE '%rakadiou%' AND poule = 'C';

UPDATE equipes SET 
  nom = 'ASC JAPPO', 
  sigle = 'JAPPO',
  points_classement = 1,
  matchs_joues = 1,
  victoires = 0,
  nuls = 1,
  defaites = 0,
  buts_marques = 1,
  buts_encaisses = 1
WHERE LOWER(nom) LIKE '%jappo%' AND poule = 'C';

UPDATE equipes SET 
  nom = 'ASC DIAMBARS', 
  sigle = 'DIAMBARS',
  points_classement = 1,
  matchs_joues = 1,
  victoires = 0,
  nuls = 1,
  defaites = 0,
  buts_marques = 0,
  buts_encaisses = 0
WHERE LOWER(nom) LIKE '%diambars%' AND poule = 'C';

UPDATE equipes SET 
  nom = 'ASC YAKAAR', 
  sigle = 'YAKAAR',
  points_classement = 1,
  matchs_joues = 1,
  victoires = 0,
  nuls = 1,
  defaites = 0,
  buts_marques = 0,
  buts_encaisses = 0
WHERE LOWER(nom) LIKE '%yakaar%' AND poule = 'C';

UPDATE equipes SET 
  nom = 'ASC LAT DIOR', 
  sigle = 'LAT DIOR',
  points_classement = 0,
  matchs_joues = 1,
  victoires = 0,
  nuls = 0,
  defaites = 1,
  buts_marques = 0,
  buts_encaisses = 1
WHERE LOWER(nom) LIKE '%lat dior%' AND poule = 'C';

-- ÉTAPE 3: Vérifier le résultat final
SELECT poule, nom, sigle, points_classement, matchs_joues, victoires, nuls, defaites, buts_marques, buts_encaisses
FROM equipes 
WHERE poule IN ('A','B','C') 
ORDER BY poule, points_classement DESC, nom;