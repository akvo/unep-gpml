-- :name new-association :!
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
