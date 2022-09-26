-- :name map-counts :? :one
-- :doc Gets the entity count per country.
-- :require [gpml.db.topic]
/*~ (if (= (:entity-group params) :topic)
(#'gpml.db.topic/generate-topic-query params gpml.db.topic/generic-cte-opts)
(#'gpml.db.topic/generate-entity-topic-query params gpml.db.topic/generic-entity-cte-opts))
~*/
,
filtered_entities AS (
--~ (#'gpml.db.topic/generate-filter-topic-snippet params)
),
transnational_counts_per_country AS (
  SELECT cgc.country AS country_id,
         topic,
         COUNT(DISTINCT json->>'id') AS topic_count
  FROM filtered_entities
  LEFT JOIN json_array_elements_text((json->>'geo_coverage_values')::JSON) cgcs
  ON json->>'geo_coverage_values' IS NOT NULL
  JOIN country_group_country cgc ON cgc.country_group = (cgcs.value)::TEXT::INT
  OR cgc.country = (cgcs.value)::TEXT::INT
  WHERE (cgcs.value)::TEXT <> 'null' AND json->>'geo_coverage_type' = 'transnational'
  GROUP BY cgc.country, topic
),
country_group_counts AS (
  SELECT (country_groups.value)::TEXT::INT AS country_group_id,
         topic,
         COUNT(topic) AS topic_count
  FROM filtered_entities
  LEFT JOIN json_array_elements_text((json->>'geo_coverage_country_groups')::JSON) country_groups
  ON json->>'geo_coverage_country_groups' IS NOT NULL
  WHERE (country_groups.value)::TEXT <> 'null'
  GROUP BY (country_groups.value)::TEXT::INT, topic
),
country_counts AS (
/*~ (if (= (:entity-group params) :topic) */
  SELECT (countries.value)::TEXT::INT AS country_id,
         topic,
         COUNT(topic) AS topic_count
  FROM filtered_entities
  LEFT JOIN json_array_elements_text((json->>'geo_coverage_countries')::JSON) countries
  ON json->>'geo_coverage_countries' IS NOT NULL
  WHERE (countries.value)::TEXT <> 'null' AND json->>'geo_coverage_type' IN ('national', 'sub-national')
  GROUP BY (countries.value)::TEXT::INT, topic
/*~*/
  SELECT (json->>'country')::INT AS country_id, 'stakeholder' AS topic, COUNT(topic) AS topic_count
  FROM filtered_entities
  WHERE (json->>'country')::INT IS NOT NULL AND topic = 'stakeholder'
  GROUP BY (json->>'country')::INT, topic
  UNION ALL
  SELECT (json->>'country')::INT AS country_id, 'organisation' AS topic, COUNT(topic) AS topic_count
  FROM filtered_entities
  WHERE (json->>'country')::INT IS NOT NULL AND topic = 'organisation' AND (json->>'is_member')::BOOLEAN IS TRUE
  GROUP BY (json->>'country')::INT, topic
  UNION ALL
  SELECT (json->>'country')::INT AS country_id, 'non_member_organisation' AS topic, COUNT(topic) AS topic_count
  FROM filtered_entities
  WHERE (json->>'country')::INT IS NOT NULL AND topic = 'organisation' AND (json->>'is_member')::BOOLEAN IS FALSE
  GROUP BY (json->>'country')::INT, topic
/*~ ) ~*/
),
country_counts_agg AS (
  SELECT country_id, json_object_agg(topic, topic_count) AS counts
  FROM country_counts
  GROUP BY country_id
),
transnational_counts_per_country_agg AS (
  SELECT country_id, json_object_agg(topic, topic_count) AS transnational_counts
  FROM transnational_counts_per_country
  GROUP BY country_id
),
country_group_counts_agg AS (
  SELECT country_group_id, json_object_agg(topic, topic_count) AS counts
  FROM country_group_counts
  GROUP BY country_group_id
) SELECT json_build_object(
    'country_counts', (SELECT json_agg(row_to_json(country_counts_agg)) AS counts FROM country_counts_agg),
    'transnational_counts', (SELECT json_agg(row_to_json(transnational_counts_per_country_agg)) AS counts FROM transnational_counts_per_country_agg),
    'country_group_counts', (SELECT json_agg(row_to_json(country_group_counts_agg)) AS counts FROM country_group_counts_agg)
) AS result;

-- :name summary
-- :doc Get summary of count of entities and number of countries
WITH initiative_countries AS (
    SELECT
        c.id
    FROM
        initiative_geo_coverage ig,
        country_group_country cgc
        JOIN country c ON cgc.country = c.id
    WHERE
        ig.country_group = cgc.country_group
    UNION
    SELECT
        ig.country AS id
    FROM
        initiative_geo_coverage ig
    WHERE
        ig.country IS NOT NULL
),
resource_countries AS (
    SELECT
        c.id,
        r.type
    FROM
        resource_geo_coverage rg
        LEFT JOIN resource r ON rg.resource = r.id,
        country_group_country cgc
        JOIN country c ON cgc.country = c.id
    WHERE
        rg.country_group = cgc.country_group
    UNION
    SELECT
        rg.country AS id,
        r.type
    FROM
        resource_geo_coverage rg
        LEFT JOIN resource r ON rg.resource = r.id
    WHERE
        rg.country IS NOT NULL
),
event_countries AS (
    SELECT
        c.id
    FROM
        event_geo_coverage e,
        country_group_country cgc
        JOIN country c ON cgc.country = c.id
    WHERE
        e.country_group = cgc.country_group
    UNION
    SELECT
        e.country AS id
    FROM
        event_geo_coverage e
    WHERE
        e.country IS NOT NULL
),
policy_countries AS (
    SELECT
        c.id
    FROM
        policy_geo_coverage p,
        country_group_country cgc
        JOIN country c ON cgc.country = c.id
    WHERE
        p.country_group = cgc.country_group
    UNION
    SELECT
        p.country AS id
    FROM
        policy_geo_coverage p
    WHERE
        p.country IS NOT NULL
),
technology_countries AS (
    SELECT
        c.id
    FROM
        technology_geo_coverage t,
        country_group_country cgc
        JOIN country c ON cgc.country = c.id
    WHERE
        t.country_group = cgc.country_group
    UNION
    SELECT
        t.country AS id
    FROM
        technology_geo_coverage t
    WHERE
        t.country IS NOT NULL
),
stakeholder_countries AS (
    SELECT
        country AS id
    FROM
        stakeholder
    WHERE
        country IS NOT NULL
        AND review_status = 'APPROVED'
),
organisation_countries AS (
    WITH approved_orgs AS (
        SELECT
            o.country,
            o.country_group
        FROM
            organisation_geo_coverage o
        LEFT JOIN organisation org ON o.organisation = org.id
    WHERE
        org.review_status = 'APPROVED' AND is_member IS TRUE
)
    SELECT
        c.id
    FROM
        approved_orgs o,
        country_group_country cgc
        JOIN country c ON cgc.country = c.id
    WHERE
        o.country_group = cgc.country_group
    UNION
    SELECT
        o.country AS id
    FROM
        approved_orgs o
    WHERE
        o.country IS NOT NULL
),
non_member_organisation_countries AS (
    WITH approved_orgs AS (
        SELECT
            o.organisation,
            o.country,
            o.country_group
        FROM
            organisation_geo_coverage o
        LEFT JOIN organisation org ON o.organisation = org.id
        WHERE
            org.review_status = 'APPROVED'
            AND org.is_member IS FALSE
),
    country_counts AS (
        SELECT
            o.organisation AS id,
            COUNT(c.id) AS country_count
        FROM
           approved_orgs o,
           country_group_country cgc
        JOIN country c ON cgc.country = c.id
        WHERE
           o.country_group = cgc.country_group
        GROUP BY
           o.organisation
        UNION
        SELECT
           o.organisation AS id,
           COUNT(o.country) AS country_count
        FROM
           approved_orgs o
        WHERE
           o.country IS NOT NULL
        GROUP BY
           o.organisation
)
    SELECT
        id,
        SUM(country_count) AS country_count
    FROM
        country_counts
    GROUP BY
        id
),
country_counts AS (
    SELECT
        COUNT(*) AS country,
        'initiative' AS data
    FROM
        initiative_countries
    UNION
    SELECT
        COUNT(*) AS country,
        replace(lower(type), ' ', '_') AS data
    FROM
        resource_countries
    WHERE
        type IS NOT NULL
    GROUP BY
        data
    UNION
    SELECT
        COUNT(*) AS country,
        'event' AS data
    FROM
        event_countries
    UNION
    SELECT
        COUNT(*) AS country,
        'policy' AS data
    FROM
        policy_countries
    UNION
    SELECT
        COUNT(*) AS country,
        'technology' AS data
    FROM
        technology_countries
    UNION
    SELECT
        COUNT(*) AS country,
        'organisation' AS data
    FROM
        organisation_countries
    UNION
    SELECT
        COUNT(*) AS country,
        'stakeholder' AS data
    FROM
        stakeholder_countries
),
totals AS (
    SELECT
        COUNT(*) AS total,
        'initiative' AS data,
        1 AS o
    FROM
        initiative
    WHERE
        review_status = 'APPROVED'
    UNION
    SELECT
        COUNT(*) AS total,
        REPLACE(LOWER(type), ' ', '_') AS data,
        2 AS o
    FROM
        resource
    WHERE
        review_status = 'APPROVED'
        AND type IS NOT NULL
    GROUP BY
        data
    UNION
    SELECT
        COUNT(*) AS total,
        'event' AS data,
        3 AS o
    FROM
        event
    WHERE
        event.review_status = 'APPROVED'
    UNION
    SELECT
        COUNT(*) AS total,
        'policy' AS data,
        4 AS o
    FROM
        policy
    WHERE
        review_status = 'APPROVED'
    UNION
    SELECT
        COUNT(*) AS total,
        'technology' AS data,
        5 AS o
    FROM
        technology
    WHERE
        review_status = 'APPROVED'
    UNION
    SELECT
        COUNT(*) AS total,
        'organisation' AS data,
        6 AS o
    FROM
        organisation
    WHERE
        review_status = 'APPROVED'
        AND is_member IS TRUE
    UNION
    SELECT
        COUNT(*) AS total,
        'stakeholder' AS data,
        7 AS o
    FROM
        stakeholder
    WHERE
    review_status = 'APPROVED'
)
SELECT
    t.data AS resource_type,
    CAST(c.country AS INT) AS country_count,
    t.total AS count
FROM
    totals t
    JOIN country_counts c ON t.data = c.data
UNION
SELECT
    'non_member_organisation' AS resource_type,
    CAST(nmoc.country_count AS INT),
    COUNT(o.*) AS count
FROM
    organisation o
    JOIN non_member_organisation_countries nmoc ON nmoc.id = o.id
WHERE
    o.is_member IS FALSE
GROUP BY resource_type, nmoc.country_count;
