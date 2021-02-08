-- :name map-counts
-- :doc Get counts of entities

SELECT mc.geo AS iso_code, json_object_agg(COALESCE(mc.topic, 'project'), mc.count) AS counts
FROM (
  SELECT COALESCE(iso_code, '***') AS geo, topic, count(topic)
  FROM country c
  LEFT JOIN v_topic vt ON (vt.geo_coverage_iso_code = c.iso_code) OR (c.iso_code IS NULL AND vt.geo_coverage_iso_code = '***')
  WHERE name <> 'Other'
  GROUP BY iso_code, topic
) AS mc GROUP BY geo ORDER BY geo;

-- :name summary
-- :doc Get summary of count of entities and number of countries
WITH
resource_countries AS (
    SELECT c.id, r.type FROM resource_geo_coverage rg
    LEFT JOIN resource r ON rg.resource = r.id, country_group_country cgc
    JOIN country c ON cgc.country = c.id
    WHERE rg.country_group = cgc.country_group
    UNION
    SELECT rg.country AS id, r.type FROM resource_geo_coverage rg
    LEFT JOIN resource r ON rg.resource = r.id
    WHERE rg.country IS NOT NULL
),
event_countries AS (
    SELECT c.id FROM event_geo_coverage e, country_group_country cgc
    JOIN country c ON cgc.country = c.id
    WHERE e.country_group = cgc.country_group
    UNION
    SELECT e.country AS id FROM event_geo_coverage e
    WHERE e.country IS NOT NULL
),
policy_countries AS (
    SELECT c.id FROM policy_geo_coverage p, country_group_country cgc
    JOIN country c ON cgc.country = c.id
    WHERE p.country_group = cgc.country_group
    UNION
    SELECT p.country AS id FROM policy_geo_coverage p
    WHERE p.country IS NOT NULL
),
technology_countries AS (
    SELECT c.id FROM technology_geo_coverage t, country_group_country cgc
    JOIN country c ON cgc.country = c.id
    WHERE t.country_group = cgc.country_group
    UNION
    SELECT t.country AS id FROM technology_geo_coverage t
    WHERE t.country IS NOT NULL
),
country_counts AS (
    SELECT COUNT(DISTINCT country) as country, 'project' as data FROM project_country
    UNION
    SELECT COUNT(*) as country, replace(lower(type),' ', '_') as data
    FROM resource_countries WHERE type IS NOT NULL GROUP BY data
    UNION
    SELECT COUNT(*) as country, 'event' as data FROM event_countries
    UNION
    SELECT COUNT(*) as country, 'policy' as data FROM policy_countries
    UNION
    SELECT COUNT(*) as country, 'technology' as data FROM technology_countries
),
totals AS (
    SELECT COUNT(*) as total, 'project' as data, 1 as o FROM project
    UNION
    SELECT COUNT(*) as total, replace(lower(type),' ','_') as data, 2 as o
    FROM resource WHERE type IS NOT NULL GROUP BY data
    UNION
    SELECT COUNT(*) as total, 'event' as data, 3 as o FROM event
    WHERE event.review_status = 'APPROVED'
    UNION
    SELECT COUNT(*) as total, 'policy' as data, 4 as o FROM policy
    UNION
    SELECT COUNT(*) as total, 'technology' as data, 5 as o FROM technology
)
SELECT t.total AS count, t.data AS resource_type, c.country AS country_count
FROM totals t JOIN country_counts c ON t.data = c.data ORDER BY o;

-- :name country-specific
-- :doc Get summary of specific country data count entities

WITH
country_specific_resource AS (
    SELECT COUNT(rgc.resource), r.type as data FROM resource_geo_coverage rgc
    LEFT JOIN resource r ON r.id = rgc.resource
    WHERE rgc.country_group IS NULL
    GROUP BY rgc.resource, r.type
    HAVING COUNT(rgc.resource) = 1
),
country_specific_policy AS (
    SELECT COUNT(policy), 'Policy' as data FROM policy_geo_coverage
    WHERE country_group IS NULL
    GROUP BY policy
    HAVING COUNT(policy) = 1
),
country_specific_project AS (
    SELECT COUNT(project), 'Project' as data FROM project_country
    GROUP BY project
    HAVING COUNT(project) = 1
),
country_specific_technology AS (
    SELECT COUNT(technology), 'Technology' as data FROM technology_geo_coverage
    WHERE country_group IS NULL
    GROUP BY technology
    HAVING COUNT(technology) = 1
),
country_specific_event AS (
    SELECT COUNT(event), 'Event' as data FROM event_geo_coverage
    WHERE country_group IS NULL
    GROUP BY event
    HAVING COUNT(event) = 1
)
SELECT COUNT(data), data as resource_type FROM country_specific_resource GROUP BY data
UNION
SELECT COUNT(data), data as resource_type FROM country_specific_policy GROUP BY data
UNION
SELECT COUNT(data), data as resource_type FROM country_specific_project GROUP BY data
UNION
SELECT COUNT(data), data as resource_type FROM country_specific_technology GROUP BY data
UNION
SELECT COUNT(data), data as resource_type FROM country_specific_event GROUP BY data;
