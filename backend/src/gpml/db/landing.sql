-- :name map-counts
-- :require [gpml.db.landing]
--~(#'gpml.db.landing/generate-entity-count-by-geo-coverage-query-cte {:cte-name "entity_counts_by_country"} {})
SELECT
    geo_coverage AS id,
    json_object_agg(entity, entity_count) AS counts
FROM
    entity_counts_by_country
GROUP BY
    geo_coverage
ORDER BY
    geo_coverage;

-- :name map-transnational-counts
-- :require [gpml.db.landing]
--~(#'gpml.db.landing/generate-entity-count-by-geo-coverage-query-cte {:cte-name "entity_counts_by_country_group" :geo-coverage-type :transnational} {})
SELECT
    geo_coverage AS id,
    json_object_agg(entity, entity_count) AS transnational_counts
FROM
    entity_counts_by_country_group
GROUP BY
    geo_coverage
ORDER BY
    geo_coverage;

-- :name summary
-- :doc Get summary of count of entities and number of countries
with
initiative_countries as (
    select c.id from initiative_geo_coverage ig, country_group_country cgc
    join country c on cgc.country = c.id
    where ig.country_group = cgc.country_group
    union
    select ig.country as id from initiative_geo_coverage ig
    where ig.country is not null
),
resource_countries as (
    select c.id, r.type from resource_geo_coverage rg
    left join resource r on rg.resource = r.id, country_group_country cgc
    JOIN country c ON cgc.country = c.id
    WHERE rg.country_group = cgc.country_group
    union
    select rg.country as id, r.type from resource_geo_coverage rg
    left join resource r on rg.resource = r.id
    WHERE rg.country IS NOT NULL
),
event_countries AS (
    select c.id from event_geo_coverage e, country_group_country cgc
    join country c on cgc.country = c.id
    where e.country_group = cgc.country_group
    union
    select e.country as id from event_geo_coverage e
    where e.country is not null
),
policy_countries AS (
    select c.id from policy_geo_coverage p, country_group_country cgc
    join country c on cgc.country = c.id
    where p.country_group = cgc.country_group
    union
    select p.country as id from policy_geo_coverage p
    where p.country is not null
),
technology_countries AS (
    select c.id from technology_geo_coverage t, country_group_country cgc
    join country c on cgc.country = c.id
    where t.country_group = cgc.country_group
    union
    select t.country as id from technology_geo_coverage t
    where t.country is not null
),
country_counts AS (
    select count(*) as country, 'project' as data from initiative_countries
    union
    select count(*) as country, replace(lower(type),' ', '_') as data
    from resource_countries where type is not null group by data
    union
    select count(*) as country, 'event' as data from event_countries
    union
    select count(*) as country, 'policy' as data from policy_countries
    union
    select count(*) as country, 'technology' as data from technology_countries
),
totals AS (
    select count(*) as total, 'project' as data, 1 as o
    from initiative where review_status = 'APPROVED'
    union
    select count(*) as total, replace(lower(type),' ','_') as data, 2 as o
    from resource where review_status = 'APPROVED' and type is not null group by data
    union
    select count(*) as total, 'event' as data, 3 as o from event
    where event.review_status = 'APPROVED'
    union
    select count(*) as total, 'policy' as data, 4 as o from policy where review_status = 'APPROVED'
    union
    select count(*) as total, 'technology' as data, 5 as o from technology where review_status = 'APPROVED'
)
select t.total as count, t.data as resource_type, c.country as country_count
from totals t join country_counts c on t.data = c.data order by o;
