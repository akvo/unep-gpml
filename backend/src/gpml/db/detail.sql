-- :name get-topic-details :? :1
-- :doc Get details about a particular topic
SELECT json::jsonb,
COALESCE(json_agg(authz.stakeholder) FILTER (WHERE authz.stakeholder IS NOT NULL), '[]') as owners
 FROM (
    --~ (#'gpml.db.topic/generate-topic-query params {:tables [(:topic-type params)]})
    SELECT * FROM cte_topic
    ) t
   left join topic_stakeholder_auth authz ON authz.topic_type::text=t.topic AND authz.topic_id=(t.json->>'id')::int
 WHERE topic = :topic-type
   AND (json->>'id')::int = :topic-id
   GROUP BY json::jsonb;

-- :name get-entity-details :? :1
-- :doc Get details about a particular stakeholder or organisation
SELECT json::jsonb,
COALESCE(json_agg(authz.stakeholder) FILTER (WHERE authz.stakeholder IS NOT NULL), '[]') as owners
 FROM (
 --~ (#'gpml.db.topic/generate-entity-topic-query params {:tables [(:topic-type params)]})
    SELECT * FROM cte_topic
    ) t
   left join topic_stakeholder_auth authz ON authz.topic_type::text=t.topic AND authz.topic_id=(t.json->>'id')::int
 WHERE topic = :topic-type
   AND (json->>'id')::int = :topic-id
   GROUP BY json::jsonb;

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

-- :name add-resource-related-language-urls :<! :*
-- :doc Add language URLs to a resource
insert into :i:table (:i:resource_type, language, url)
values :t*:urls RETURNING id;

-- :name add-resource-related-geo :<! :*
-- :doc Add geo coverage values to a resource
insert into :i:table (:i:resource_type, country_group, country)
values :t*:geo RETURNING *;

-- :name add-resource-related-org :<! :1
-- :doc Add an organisation related to a resource
insert into :i:table (:i:resource_type, organisation)
values (:id, :organisation) RETURNING id;
