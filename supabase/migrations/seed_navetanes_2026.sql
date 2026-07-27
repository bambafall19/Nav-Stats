  -- ========================================
  -- NAVÉTANES 2026 - C.N.P ZONE 6 KHOMBOLE
  -- Données des classements Journée 1
  -- ========================================

  -- IMPORTANT: Exécutez d'abord ce script pour vérifier les équipes existantes
  -- SELECT * FROM equipes ORDER BY poule, nom;

  -- Mettre à jour les équipes existantes avec les vraies données
  -- POULE A
  UPDATE equipes SET 
    points_classement = 3,
    matchs_joues = 1,
    victoires = 1,
    nuls = 0,
    defaites = 0,
    buts_marques = 2,
    buts_encaisses = 1
  WHERE LOWER(nom) LIKE '%mankoo%' OR LOWER(sigle) LIKE '%mankoo%';

  UPDATE equipes SET 
    points_classement = 3,
    matchs_joues = 1,
    victoires = 1,
    nuls = 0,
    defaites = 0,
    buts_marques = 2,
    buts_encaisses = 1
  WHERE LOWER(nom) LIKE '%bokk jom%' OR LOWER(sigle) LIKE '%bokk%';

  UPDATE equipes SET 
    points_classement = 0,
    matchs_joues = 0,
    victoires = 0,
    nuls = 0,
    defaites = 0,
    buts_marques = 0,
    buts_encaisses = 0
  WHERE LOWER(nom) LIKE '%kocc%' OR LOWER(sigle) LIKE '%kocc%';

  UPDATE equipes SET 
    points_classement = 0,
    matchs_joues = 1,
    victoires = 0,
    nuls = 0,
    defaites = 1,
    buts_marques = 1,
    buts_encaisses = 2
  WHERE LOWER(nom) LIKE '%entente%' OR LOWER(sigle) LIKE '%entente%';

  UPDATE equipes SET 
    points_classement = 0,
    matchs_joues = 1,
    victoires = 0,
    nuls = 0,
    defaites = 1,
    buts_marques = 1,
    buts_encaisses = 2
  WHERE LOWER(nom) LIKE '%maag%' OR LOWER(sigle) LIKE '%maag%';

  -- POULE B
  UPDATE equipes SET 
    points_classement = 3,
    matchs_joues = 1,
    victoires = 1,
    nuls = 0,
    defaites = 0,
    buts_marques = 3,
    buts_encaisses = 0
  WHERE LOWER(nom) LIKE '%guinaw%' OR LOWER(sigle) LIKE '%guinaw%';

  UPDATE equipes SET 
    points_classement = 3,
    matchs_joues = 1,
    victoires = 1,
    nuls = 0,
    defaites = 0,
    buts_marques = 1,
    buts_encaisses = 0
  WHERE LOWER(nom) LIKE '%espoirs%' OR LOWER(sigle) LIKE '%espoirs%';

  UPDATE equipes SET 
    points_classement = 1,
    matchs_joues = 1,
    victoires = 0,
    nuls = 1,
    defaites = 0,
    buts_marques = 0,
    buts_encaisses = 0
  WHERE LOWER(nom) LIKE '%khaï%' OR LOWER(sigle) LIKE '%khaï%';

  UPDATE equipes SET 
    points_classement = 1,
    matchs_joues = 1,
    victoires = 0,
    nuls = 1,
    defaites = 0,
    buts_marques = 0,
    buts_encaisses = 0
  WHERE LOWER(nom) LIKE '%thilla%' OR LOWER(sigle) LIKE '%thilla%';

  UPDATE equipes SET 
    points_classement = 0,
    matchs_joues = 1,
    victoires = 0,
    nuls = 0,
    defaites = 1,
    buts_marques = 0,
    buts_encaisses = 1
  WHERE LOWER(nom) LIKE '%jubbo%' OR LOWER(sigle) LIKE '%jubbo%';

  UPDATE equipes SET 
    points_classement = 0,
    matchs_joues = 1,
    victoires = 0,
    nuls = 0,
    defaites = 1,
    buts_marques = 0,
    buts_encaisses = 3
  WHERE LOWER(nom) LIKE '%wally%' OR LOWER(sigle) LIKE '%wally%';

  -- POULE C
  UPDATE equipes SET 
    points_classement = 3,
    matchs_joues = 1,
    victoires = 1,
    nuls = 0,
    defaites = 0,
    buts_marques = 1,
    buts_encaisses = 0
  WHERE LOWER(nom) LIKE '%kaïré%' OR LOWER(sigle) LIKE '%kaïré%';

  UPDATE equipes SET 
    points_classement = 1,
    matchs_joues = 1,
    victoires = 0,
    nuls = 1,
    defaites = 0,
    buts_marques = 1,
    buts_encaisses = 1
  WHERE LOWER(nom) LIKE '%rakadiou%' OR LOWER(sigle) LIKE '%rakadiou%';

  UPDATE equipes SET 
    points_classement = 1,
    matchs_joues = 1,
    victoires = 0,
    nuls = 1,
    defaites = 0,
    buts_marques = 1,
    buts_encaisses = 1
  WHERE LOWER(nom) LIKE '%jappo%' OR LOWER(sigle) LIKE '%jappo%';

  UPDATE equipes SET 
    points_classement = 1,
    matchs_joues = 1,
    victoires = 0,
    nuls = 1,
    defaites = 0,
    buts_marques = 0,
    buts_encaisses = 0
  WHERE LOWER(nom) LIKE '%diambars%' OR LOWER(sigle) LIKE '%diambars%';

  UPDATE equipes SET 
    points_classement = 1,
    matchs_joues = 1,
    victoires = 0,
    nuls = 1,
    defaites = 0,
    buts_marques = 0,
    buts_encaisses = 0
  WHERE LOWER(nom) LIKE '%yakaar%' OR LOWER(sigle) LIKE '%yakaar%';

  UPDATE equipes SET 
    points_classement = 0,
    matchs_joues = 1,
    victoires = 0,
    nuls = 0,
    defaites = 1,
    buts_marques = 0,
    buts_encaisses = 1
  WHERE LOWER(nom) LIKE '%lat dior%' OR LOWER(sigle) LIKE '%lat dior%';

  -- ========================================
  -- Si les équipes n'existent pas, les créer manuellement via l'admin
  -- /admin/equipes ou /admin/classements
  -- ========================================

  -- Pour créer les équipes manquantes, utilisez ces INSERTs un par un:
  -- INSERT INTO equipes (nom, sigle, poule, points_classement, matchs_joues, victoires, nuls, defaites, buts_marques, buts_encaisses) VALUES
  -- ('ASC MANKOO', 'MANKOO', 'A', 3, 1, 1, 0, 0, 2, 1);
  -- etc.