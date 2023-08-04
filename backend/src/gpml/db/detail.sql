-- :name get-topic-details :query :one
-- :doc Get details about a particular topic
--~ (#'gpml.db.topic/generate-topic-query params {:tables [(:topic-type params)]})
SELECT * FROM cte_topic;

-- :name get-entity-details :query :one
-- :doc Get details about a particular stakeholder or organisation
--~ (#'gpml.db.topic/generate-entity-topic-query params {:tables [(:topic-type params)]})
SELECT * FROM cte_topic;

-- :name update-initiative :execute :affected
-- :doc Update the specified initiative row
-- :require [gpml.util.sql]
UPDATE initiative SET
--~ (#'gpml.util.sql/generate-update-initiative params)
WHERE id = :id;

-- :name update-resource-table :execute :affected
-- :doc Update the resource specified by table and id
-- :require [gpml.util.sql]
update :i:table set
--~ (#'gpml.util.sql/generate-update-resource params)
where id = :id

-- :name delete-resource-related-data :execute :affected
-- :doc Delete the data related to a specified resource
delete from :i:table where :i:resource_type = :id

-- :name add-resource-related-language-urls :returning-execute :many
-- :doc Add language URLs to a resource
insert into :i:table (:i:resource_type, language, url)
values :t*:urls RETURNING id;

-- :name add-resource-related-org :returning-execute :one
-- :doc Add an organisation related to a resource
insert into :i:table (:i:resource_type, organisation)
values (:id, :organisation) RETURNING id;
