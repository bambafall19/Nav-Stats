-- Score predictions by final result only:
-- - correct winning team: 3 points
-- - correct draw: 1 point
-- Exact scores and player bonuses are no longer used.

CREATE OR REPLACE FUNCTION public.update_pronostics_for_finished_match()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.statut = 'termine'
    AND NEW.score_a IS NOT NULL
    AND NEW.score_b IS NOT NULL
    AND (
      OLD.statut IS DISTINCT FROM NEW.statut
      OR OLD.score_a IS DISTINCT FROM NEW.score_a
      OR OLD.score_b IS DISTINCT FROM NEW.score_b
    )
  THEN
    UPDATE public.pronostics p
    SET
      est_correct = p.resultat_predit = CASE
        WHEN NEW.score_a > NEW.score_b THEN 'equipe_a'
        WHEN NEW.score_b > NEW.score_a THEN 'equipe_b'
        ELSE 'nul'
      END,
      points_gagnes = CASE
        WHEN p.resultat_predit = 'nul' AND NEW.score_a = NEW.score_b THEN 1
        WHEN p.resultat_predit = 'equipe_a' AND NEW.score_a > NEW.score_b THEN 3
        WHEN p.resultat_predit = 'equipe_b' AND NEW.score_b > NEW.score_a THEN 3
        ELSE 0
      END,
      score_exact = false
    WHERE p.match_id = NEW.id;

    UPDATE public.profiles pr
    SET
      points = COALESCE(stats.points, 0),
      total_pronostics = COALESCE(stats.total_pronostics, 0),
      pronostics_corrects = COALESCE(stats.pronostics_corrects, 0),
      updated_at = now()
    FROM (
      SELECT
        p.user_id,
        SUM(p.points_gagnes) AS points,
        COUNT(*) AS total_pronostics,
        COUNT(*) FILTER (WHERE p.est_correct = true) AS pronostics_corrects
      FROM public.pronostics p
      GROUP BY p.user_id
    ) stats
    WHERE pr.id = stats.user_id;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_match_finished_update_pronostics ON public.matchs;

CREATE TRIGGER on_match_finished_update_pronostics
AFTER UPDATE OF statut, score_a, score_b ON public.matchs
FOR EACH ROW
EXECUTE FUNCTION public.update_pronostics_for_finished_match();
