BEGIN;
--;;
UPDATE event
SET geo_coverage_type = 'regional'
WHERE geo_coverage_type = 'transnational'
AND id IN
  (SELECT egc.event FROM event_geo_coverage egc
   LEFT JOIN event e
   ON e.id = egc.event
   WHERE egc.country_group IS NULL);
--;;
UPDATE technology
SET geo_coverage_type = 'regional'
WHERE geo_coverage_type = 'transnational'
AND id IN
  (SELECT tgc.technology FROM technology_geo_coverage tgc
   LEFT JOIN technology t
   ON t.id = tgc.technology
   WHERE tgc.country_group IS NULL);
--;;
UPDATE policy
SET geo_coverage_type = 'regional'
WHERE geo_coverage_type = 'transnational'
AND id IN
  (SELECT pgc.policy FROM policy_geo_coverage pgc
   LEFT JOIN policy p
   ON p.id = pgc.policy
   WHERE pgc.country_group IS NULL);
--;;
UPDATE initiative
SET q24 = jsonb_set(q24, '{regional}','"Regional"', true)
WHERE q24->>'transnational'::text = 'Transnational'
AND id IN
  (SELECT igc.initiative FROM initiative_geo_coverage igc
   LEFT JOIN initiative i
   ON i.id = igc.initiative
   WHERE igc.country_group IS NULL
   AND i.q24->>'transnational'::text = 'Transnational');
--;;
UPDATE initiative
SET q24 = q24 - 'transnational'
WHERE q24->>'transnational'::text = 'Transnational'
AND id IN
  (SELECT igc.initiative FROM initiative_geo_coverage igc
   LEFT JOIN initiative i
   ON i.id = igc.initiative
   WHERE igc.country_group IS NULL
   AND i.q24->>'transnational'::text = 'Transnational');
--;;
UPDATE resource
SET geo_coverage_type = 'regional'
WHERE geo_coverage_type = 'transnational'
AND id IN
  (SELECT DISTINCT rgc.resource FROM resource_geo_coverage rgc
   LEFT JOIN resource r
   ON r.id = rgc.resource
   WHERE rgc.country_group IS NULL);
--;;
COMMIT;