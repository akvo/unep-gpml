-- :name create-activity :! :n
-- :doc Create a new activity record
INSERT INTO activity(
    id,
    type,
    owner_id
--~ (when (contains? params :metadata) ",metadata")
) VALUES (
    :id,
    :type::activity_type,
    :owner_id
--~ (when (contains? params :metadata) ",:metadata::jsonb")
);

-- :name get-recent-activities :? :*
-- :doc Get the most recent activities
SELECT * FROM activity LIMIT 5;
