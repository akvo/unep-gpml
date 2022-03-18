-- :name get-topic-details :? :1
-- :doc Get details about a particular topic
SELECT json::jsonb,
COALESCE(json_agg(authz.stakeholder) FILTER (WHERE authz.stakeholder IS NOT NULL), '[]') as owners
 FROM (
    --~ (#'gpml.db.topic/generate-topic-query {} gpml.db.topic/generic-cte-opts)
    SELECT * FROM cte_topic
    ) t
   left join topic_stakeholder_auth authz ON authz.topic_type::text=t.topic AND authz.topic_id=(t.json->>'id')::int
 WHERE topic = :topic-type
   AND (json->>'id')::int = :topic-id
   GROUP BY json::jsonb;

-- :name get-entity-details :? :1
-- :doc Get the details for a specific entity table. The details includes tags, geo_coverage_values and owners.
WITH entity_tags AS (
    SELECT
--~(str "et." (:entity-type params) ",")
        json_agg(json_build_object(t.id, t.tag)) AS tags
    FROM
--~(str (:entity-type params) "_tag et")
        JOIN tag t ON et.tag = t.id
    WHERE
--~(str "et." (:entity-type params) " = :id")
    GROUP BY
--~(str "et." (:entity-type params))
),
entity_geo_coverage_values AS (
    SELECT
--~(str "eg." (:entity-type params) ",")
        json_agg(COALESCE(eg.country, eg.country_group, 0)) AS geo_coverage_values
    FROM
--~(str (:entity-type params) "_geo_coverage eg")
        LEFT JOIN country c ON eg.country = c.id
        LEFT JOIN country_group cg ON eg.country_group = cg.id
    WHERE
--~(str "eg." (:entity-type params) " = :id")
    GROUP BY
--~(str "eg." (:entity-type params))
),
entity_owners AS (
SELECT
    COALESCE(json_agg(authz.stakeholder) FILTER (WHERE authz.stakeholder IS NOT NULL), '[]') AS owners
FROM
    topic_stakeholder_auth authz
WHERE
    authz.topic_type::text = :entity-type
    AND authz.topic_id = :id
)
SELECT
    e.*,
    ets.tags,
    egcv.geo_coverage_values,
    eo.owners
FROM
--~(str (:entity-type params) " e")
    LEFT JOIN entity_tags ets
--~(str "ON ets." (:entity-type params) " = e.id")
    LEFT JOIN entity_geo_coverage_values egcv
--~(str "ON egcv." (:entity-type params) " = e.id")
    LEFT JOIN entity_owners eo ON TRUE
WHERE
    e.id = :id;

-- :name get-stakeholder-tags :? :1
-- :doc Get Stakehodler tags
SELECT json_object_agg(category,tag) AS data FROM (
    SELECT string_agg(t.tag,', ') AS tag, tc.category FROM stakeholder_tag st
    LEFT JOIN tag t ON st.tag = t.id
    LEFT JOIN tag_category tc ON t.tag_category = tc.id
WHERE st.stakeholder = :id
GROUP BY tc.category) AS data;

-- :name update-initiative :! :n
-- :doc Update the specified initiative row
-- :require [gpml.sql-util]
UPDATE initiative SET
--~ (#'gpml.sql-util/generate-update-initiative params)
WHERE id = :id;

-- :name update-resource-table :! :n
-- :doc Update the resource specified by table and id
-- :require [gpml.sql-util]
update :i:table set
--~ (#'gpml.sql-util/generate-update-resource params)
where id = :id

-- :name delete-resource-related-data :! :n
-- :doc Delete the data related to a specified resource
delete from :i:table where :i:resource_type = :id

-- :name add-resource-related-tags :<! :*
-- :doc Add tags to a resource
insert into :i:table (:i:resource_type, tag)
values :t*:tags RETURNING id;

-- :name add-resource-related-language-urls :<! :*
-- :doc Add language URLs to a resource
insert into :i:table (:i:resource_type, language, url)
values :t*:urls RETURNING id;

-- :name add-resource-related-geo :<! :*
-- :doc Add geo coverage values to a resource
insert into :i:table (:i:resource_type, country_group, country)
values :t*:geo RETURNING id;

-- :name add-resource-related-org :<! :1
-- :doc Add an organisation related to a resource
insert into :i:table (:i:resource_type, organisation)
values (:id, :organisation) RETURNING id;
