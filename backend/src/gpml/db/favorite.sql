-- :name new-association :!
-- :doc Upserts a new relation between a stakeholder and a topic
--~ (format "INSERT INTO stakeholder_%1$s AS sp (stakeholder, %2$s, association, remarks, is_bookmark)" (:topic params) (or (:column_name params) (:topic params)))
--~ (format "VALUES (:stakeholder, :topic_id, :v:association::%1$s_association, :remarks, true)" (:topic params))
--~ (format "ON CONFLICT (stakeholder, %1$s, association)" (or (:column_name params) (:topic params)))
DO UPDATE SET modified = now(), remarks = EXCLUDED.remarks, is_bookmark = true
    WHERE sp.stakeholder = EXCLUDED.stakeholder
--~ (format "AND sp.%1$s = EXCLUDED.%1$s" (or (:column_name params) (:topic params)))
      AND sp.association = EXCLUDED.association;

-- :name new-stakeholder-association :!
-- :doc Upserts a new relation between a stakeholder and a topic
--~ (format "INSERT INTO stakeholder_%1$s AS sp (stakeholder, %2$s, association, remarks)" (:topic params) (or (:column_name params) (:topic params)))
--~ (format "VALUES (:stakeholder, :topic_id, :v:association::%1$s_association, :remarks)" (:topic params))
--~ (format "ON CONFLICT (stakeholder, %1$s, association)" (or (:column_name params) (:topic params)))
DO UPDATE SET modified = now(), remarks = EXCLUDED.remarks
    WHERE sp.stakeholder = EXCLUDED.stakeholder
--~ (format "AND sp.%1$s = EXCLUDED.%1$s" (or (:column_name params) (:topic params)))
      AND sp.association = EXCLUDED.association

-- :name association-by-stakeholder :? :*
-- :doc Get all associations for a given stakeholder
SELECT * FROM v_stakeholder_association WHERE stakeholder = :stakeholder

-- :name stakeholder-bookmarks :? :*
-- :doc Get stakeholder bookmark for a given topic
SELECT * FROM :i:table
WHERE stakeholder = :stakeholder
AND :i:topic = :topic_id
AND is_bookmark = true;

-- :name association-by-stakeholder-topic :? :*
SELECT * FROM :i:topic
WHERE stakeholder = :stakeholder
AND :i:column_name = :topic_id
AND is_bookmark = false;

-- :name delete-stakeholder-association :! :n
DELETE FROM :i:topic WHERE id = :id

-- :name delete-associations :! :n
--~ (for [id (:ids params)] (format "DELETE FROM %1s WHERE id =  %2s" (:table params) id))

-- :name update-stakeholder-association :! :n
-- :require [gpml.sql-util]
UPDATE :i:table SET modified=now(),
--~ (#'gpml.sql-util/generate-update-stakeholder-association params)
 WHERE id = :id;

-- :name new-organisation-association :!
-- :doc Upserts a new relation between an organisation and a topic
--~ (format "INSERT INTO organisation_%1$s AS o (organisation, %2$s, association, remarks)" (:topic params) (or (:column_name params) (:topic params)))
--~ (format "VALUES (:organisation, :topic_id, :v:association::%1$s_association, :remarks)" (:topic params))
--~ (format "ON CONFLICT (organisation, %1$s, association)" (or (:column_name params) (:topic params)))
DO UPDATE SET modified = now(), remarks = EXCLUDED.remarks
    WHERE o.organisation = EXCLUDED.organisation
--~ (format "AND o.%1$s = EXCLUDED.%1$s" (or (:column_name params) (:topic params)))
      AND o.association = EXCLUDED.association

-- :name get-associations :*
-- :doc Gets all associations between an individual or organisation and a topic
SELECT id
 FROM :i:table
 WHERE :i:column_name = :topic_id

