-- :name new-relation :!
-- :doc Upserts a new relation between a stakeholder and a topic
INSERT INTO stakeholder_portfolio AS sp (stakeholder, tag, topic_type, topic)
VALUES (:stakeholder, :tag, :v:topic_type::topic_type, :topic)
ON CONFLICT (stakeholder, tag, topic_type, topic)
DO UPDATE SET modified = now()
    WHERE sp.stakeholder = EXCLUDED.stakeholder
      AND sp.tag = EXCLUDED.tag
      AND sp.topic_type = EXCLUDED.topic_type
      AND sp.topic = EXCLUDED.topic;

-- :name relation-by-stakeholder :? :*
-- :doc Get all relations for a given stakeholder
SELECT * FROM stakeholder_portfolio WHERE stakeholder = :stakeholder;
