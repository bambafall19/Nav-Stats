-- ========================================
-- INSERTION DES ÉQUIPES NAVÉTANES 2026
-- Version sans ON CONFLICT (contrainte requise)
-- ========================================

-- ÉTAPE 1: Vérifier quelles équipes existent déjà
-- SELECT nom, poule FROM equipes WHERE poule IN ('A','B','C') ORDER BY poule, nom;

-- ÉTAPE 2: Insérer les équipes MANQUANTES uniquement
-- Utilisez les INSERTs ci-dessous UNIQUEMENT pour les équipes qui n'existent pas

-- POULE A
INSERT INTO equipes (nom, sigle, poule, points_classement, matchs_joues, victoires, nuls, defaites, buts_marques, buts_encaisses, created_at)
SELECT 'ASC MANKOO', 'MANKOO', 'A', 3, 1, 1, 0, 0, 2, 1, NOW()
WHERE NOT EXISTS (SELECT 1 FROM equipes WHERE LOWER(nom) LIKE '%mankoo%');

INSERT INTO equipes (nom, sigle, poule, points_classement, matchs_joues, victoires, nuls, defaites, buts_marques, buts_encaisses, created_at)
SELECT 'ASC BOKK JOM', 'BOKK JOM', 'A', 3, 1, 1, 0, 0, 2, 1, NOW()
WHERE NOT EXISTS (SELECT 1 FROM equipes WHERE LOWER(nom) LIKE '%bokk%');

INSERT INTO equipes (nom, sigle, poule, points_classement, matchs_joues, victoires, nuls, defaites, buts_marques, buts_encaisses, created_at)
SELECT 'ASC KOCC', 'KOCC', 'A', 0, 0, 0, 0, 0, 0, 0, NOW()
WHERE NOT EXISTS (SELECT 1 FROM equipes WHERE LOWER(nom) LIKE '%kocc%');

INSERT INTO equipes (nom, sigle, poule, points_classement, matchs_joues, victoires, nuls, defaites, buts_marques, buts_encaisses, created_at)
SELECT 'ASC ENTENTE COSSAN SANTOS', 'ENTENTE', 'A', 0, 1, 0, 0, 1, 1, 2, NOW()
WHERE NOT EXISTS (SELECT 1 FROM equipes WHERE LOWER(nom) LIKE '%entente%');

INSERT INTO equipes (nom, sigle, poule, points_classement, matchs_joues, victoires, nuls, defaites, buts_marques, buts_encaisses, created_at)
SELECT 'ASC MAAG DAAN', 'MAAG DAAN', 'A', 0, 1, 0, 0, 1, 1, 2, NOW()
WHERE NOT EXISTS (SELECT 1 FROM equipes WHERE LOWER(nom) LIKE '%maag%');

-- POULE B
INSERT INTO equipes (nom, sigle, poule, points_classement, matchs_joues, victoires, nuls, defaites, buts_marques, buts_encaisses, created_at)
SELECT 'ASC GUINAW RAÏL', 'GUINAW', 'B', 3, 1, 1, 0, 0, 3, 0, NOW()
WHERE NOT EXISTS (SELECT 1 FROM equipes WHERE LOWER(nom) LIKE '%guinaw%');

INSERT INTO equipes (nom, sigle, poule, points_classement, matchs_joues, victoires, nuls, defaites, buts_marques, buts_encaisses, created_at)
SELECT 'ASC ESPOIRS', 'ESPOIRS', 'B', 3, 1, 1, 0, 0, 1, 0, NOW()
WHERE NOT EXISTS (SELECT 1 FROM equipes WHERE LOWER(nom) LIKE '%espoirs%');

INSERT INTO equipes (nom, sigle, poule, points_classement, matchs_joues, victoires, nuls, defaites, buts_marques, buts_encaisses, created_at)
SELECT 'ASC KHAÏ GUI', 'KHAÏ GUI', 'B', 1, 1, 0, 1, 0, 0, 0, NOW()
WHERE NOT EXISTS (SELECT 1 FROM equipes WHERE LOWER(nom) LIKE '%khaï%');

INSERT INTO equipes (nom, sigle, poule, points_classement, matchs_joues, victoires, nuls, defaites, buts_marques, buts_encaisses, created_at)
SELECT 'ASC THILLA', 'THILLA', 'B', 1, 1, 0, 1, 0, 0, 0, NOW()
WHERE NOT EXISTS (SELECT 1 FROM equipes WHERE LOWER(nom) LIKE '%thilla%');

INSERT INTO equipes (nom, sigle, poule, points_classement, matchs_joues, victoires, nuls, defaites, buts_marques, buts_encaisses, created_at)
SELECT 'ASC JUBBO', 'JUBBO', 'B', 0, 1, 0, 0, 1, 0, 1, NOW()
WHERE NOT EXISTS (SELECT 1 FROM equipes WHERE LOWER(nom) LIKE '%jubbo%');

INSERT INTO equipes (nom, sigle, poule, points_classement, matchs_joues, victoires, nuls, defaites, buts_marques, buts_encaisses, created_at)
SELECT 'ASC WALLYDAANN', 'WALLYDAANN', 'B', 0, 1, 0, 0, 1, 0, 3, NOW()
WHERE NOT EXISTS (SELECT 1 FROM equipes WHERE LOWER(nom) LIKE '%wally%');

-- POULE C
INSERT INTO equipes (nom, sigle, poule, points_classement, matchs_joues, victoires, nuls, defaites, buts_marques, buts_encaisses, created_at)
SELECT 'ASC KAÏRÉ', 'KAÏRÉ', 'C', 3, 1, 1, 0, 0, 1, 0, NOW()
WHERE NOT EXISTS (SELECT 1 FROM equipes WHERE LOWER(nom) LIKE '%kaïré%');

INSERT INTO equipes (nom, sigle, poule, points_classement, matchs_joues, victoires, nuls, defaites, buts_marques, buts_encaisses, created_at)
SELECT 'ASC RAKADIOU', 'RAKADIOU', 'C', 1, 1, 0, 1, 0, 1, 1, NOW()
WHERE NOT EXISTS (SELECT 1 FROM equipes WHERE LOWER(nom) LIKE '%rakadiou%');

INSERT INTO equipes (nom, sigle, poule, points_classement, matchs_joues, victoires, nuls, defaites, buts_marques, buts_encaisses, created_at)
SELECT 'ASC JAPPO', 'JAPPO', 'C', 1, 1, 0, 1, 0, 1, 1, NOW()
WHERE NOT EXISTS (SELECT 1 FROM equipes WHERE LOWER(nom) LIKE '%jappo%');

INSERT INTO equipes (nom, sigle, poule, points_classement, matchs_joues, victoires, nuls, defaites, buts_marques, buts_encaisses, created_at)
SELECT 'ASC DIAMBARS', 'DIAMBARS', 'C', 1, 1, 0, 1, 0, 0, 0, NOW()
WHERE NOT EXISTS (SELECT 1 FROM equipes WHERE LOWER(nom) LIKE '%diambars%');

INSERT INTO equipes (nom, sigle, poule, points_classement, matchs_joues, victoires, nuls, defaites, buts_marques, buts_encaisses, created_at)
SELECT 'ASC YAKAAR', 'YAKAAR', 'C', 1, 1, 0, 1, 0, 0, 0, NOW()
WHERE NOT EXISTS (SELECT 1 FROM equipes WHERE LOWER(nom) LIKE '%yakaar%');

INSERT INTO equipes (nom, sigle, poule, points_classement, matchs_joues, victoires, nuls, defaites, buts_marques, buts_encaisses, created_at)
SELECT 'ASC LAT DIOR', 'LAT DIOR', 'C', 0, 1, 0, 0, 1, 0, 1, NOW()
WHERE NOT EXISTS (SELECT 1 FROM equipes WHERE LOWER(nom) LIKE '%lat dior%');

-- ========================================
-- ÉTAPE 3: Maintenant mettre à jour les statistiques
-- Exécuter seed_navetanes_2026.sql après ce script
-- ========================================