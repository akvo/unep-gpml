-- :name get-detail :? :1
-- :doc Get details about a particular topic
SELECT json
  FROM v_topic_all
 WHERE topic = :topic-type
   AND (json->>'id')::int = :topic-id;

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
